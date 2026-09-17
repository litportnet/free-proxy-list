#!/usr/bin/env node
// Builds the litportnet/free-proxy-list `proxies/` tree, README.md and everything else that ships
// on the `live` and `main` branches from an already-gated, already-sorted JSON array of
// contract A proxy objects (see SCHEMA.md).
//
//   node scripts/build.mjs --input all.json --out <dir> [--template-dir <dir>]
//                           [--generated-at <ISO>] [--max-age-min 30] [--interval-sec 300]
//
// Zero npm dependencies: only Node built-ins, so this runs identically on the litport server
// and inside GitHub Actions (workflows/publish.yml).

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  buildFileSet,
  findMissingReadmeLinks,
  renderReadme,
  sortProxies,
} from './lib.mjs'
import { renderBanner } from './banner.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '..')

function parseArgs(argv) {
  const args = {
    input: null,
    out: null,
    templateDir: REPO_ROOT,
    generatedAt: new Date().toISOString(),
    maxAgeMin: 30,
    intervalSec: 300,
  }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    const next = () => argv[++i]
    if (arg === '--input') args.input = next()
    else if (arg === '--out') args.out = next()
    else if (arg === '--template-dir') args.templateDir = next()
    else if (arg === '--generated-at') args.generatedAt = next()
    else if (arg === '--max-age-min') args.maxAgeMin = parseInt(next(), 10)
    else if (arg === '--interval-sec') args.intervalSec = parseInt(next(), 10)
    else throw new Error(`unknown argument: ${arg}`)
  }
  if (!args.input) throw new Error('--input is required')
  if (!args.out) throw new Error('--out is required')
  return args
}

// Static files/directories copied verbatim from the template dir into the output tree.
const STATIC_ENTRIES = [
  'assets',
  'SCHEMA.md',
  'LICENSE',
  'LICENSE-DATA',
  'CONTRIBUTING.md',
  '.gitattributes',
  'examples',
  '.github',
  'scripts',
  'test-fixtures',
]

function listFilesRecursive(dir, base = dir) {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      out.push(...listFilesRecursive(full, base))
    } else if (entry.isFile()) {
      out.push(path.relative(base, full).split(path.sep).join('/'))
    }
  }
  return out
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src)
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true })
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry))
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.copyFileSync(src, dest)
  }
}

function writeFile(outDir, relPath, content) {
  const full = path.join(outDir, relPath)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, content)
}

export function build({ input, out, templateDir, generatedAt, maxAgeMin, intervalSec }) {
  const list = sortProxies(JSON.parse(fs.readFileSync(input, 'utf8')))
  const { files, stats } = buildFileSet(list, { generatedAt, intervalSec, maxAgeMin })

  fs.rmSync(out, { recursive: true, force: true })
  fs.mkdirSync(out, { recursive: true })

  for (const [relPath, content] of Object.entries(files)) {
    writeFile(out, relPath, content)
  }

  // Copy the static tree (licenses, docs, scripts, examples, workflows, issue templates).
  const copiedStaticPaths = []
  for (const entry of STATIC_ENTRIES) {
    const src = path.join(templateDir, entry)
    if (!fs.existsSync(src)) continue
    const dest = path.join(out, entry)
    copyRecursive(src, dest)
    if (fs.statSync(src).isDirectory()) {
      copiedStaticPaths.push(...listFilesRecursive(src).map(rel => `${entry}/${rel}`))
    } else {
      copiedStaticPaths.push(entry)
    }
  }

  const banner = renderBanner(stats, {
    artBuffer: fs.readFileSync(path.join(templateDir, 'assets/banner-art-v2.jpg')),
    logoSvg: fs.readFileSync(path.join(templateDir, 'assets/litport-logo.svg'), 'utf8'),
  })
  writeFile(out, 'proxies/banner.svg', banner)

  const template = fs.readFileSync(path.join(templateDir, 'README.template.md'), 'utf8')
  const readme = renderReadme(template, stats)

  const knownPaths = { ...files }
  for (const relPath of copiedStaticPaths) knownPaths[relPath] = true
  knownPaths['proxies/banner.svg'] = true
  knownPaths['README.md'] = true

  const missing = findMissingReadmeLinks(readme, knownPaths)
  if (missing.length > 0) {
    throw new Error(`README.md links to paths that do not exist in the output tree:\n${missing.join('\n')}`)
  }

  writeFile(out, 'README.md', readme)

  return { list, stats, files, copiedStaticPaths }
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const { list, stats } = build(args)
  console.log(`built ${list.length} proxies from ${stats.countries_count} countries into ${args.out}`)
  console.log(`totals: ${JSON.stringify(stats.totals)}`)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
