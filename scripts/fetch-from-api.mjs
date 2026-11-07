#!/usr/bin/env node
// Shared data path for the server publisher and manual fallback. It fetches exactly one public,
// keyless snapshot and writes a Contract A JSON array that scripts/build.mjs can consume.
//
//   node scripts/fetch-from-api.mjs --out all.json [--max-age-min 30]
//     [--base https://litport.net/api/free-proxy/snapshot] [--interval-sec 300]
//     [--previous-stats-url <live stats.json>] [--min-count 300]
//
// Zero npm dependencies: only Node built-ins (global `fetch`, Node >= 18).

import fs from 'node:fs'
import path from 'node:path'

import { apiRowToProxy, applyExitShared, countFloorDecision, selectPublishable, sortProxies } from './lib.mjs'

export const DEFAULT_SNAPSHOT_BASE = 'https://litport.net/api/free-proxy/snapshot'
export const DEFAULT_PREVIOUS_STATS_URL = 'https://raw.githubusercontent.com/litportnet/free-proxy-list/live/proxies/stats.json'
export const FETCH_TIMEOUT_MS = 10_000

function parseArgs(argv) {
  const args = {
    out: null,
    maxAgeMin: 30,
    base: DEFAULT_SNAPSHOT_BASE,
    intervalSec: 300,
    minCount: 300,
    previousStatsUrl: null,
  }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    const next = () => argv[++i]
    if (arg === '--out') args.out = next()
    else if (arg === '--max-age-min') args.maxAgeMin = parseInt(next(), 10)
    else if (arg === '--base') args.base = next()
    else if (arg === '--interval-sec') args.intervalSec = parseInt(next(), 10)
    else if (arg === '--min-count') args.minCount = parseInt(next(), 10)
    else if (arg === '--previous-stats-url') args.previousStatsUrl = next()
    else throw new Error(`unknown argument: ${arg}`)
  }
  if (!args.out) throw new Error('--out is required')
  return args
}

const responseOk = res => res.ok === true || (Number.isInteger(res.status) && res.status >= 200 && res.status < 300)

const snapshotUrl = (base, maxAgeMin) => {
  const url = new URL(base)
  url.searchParams.set('checkedWithinMin', String(maxAgeMin))
  return url.toString()
}

export async function fetchSnapshotFromApi({ base = DEFAULT_SNAPSHOT_BASE, maxAgeMin = 30, intervalSec = 300, now, nowFn, fetchImpl = fetch } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  let snapshot
  try {
    const res = await fetchImpl(snapshotUrl(base, maxAgeMin), { signal: controller.signal })
    if (!responseOk(res)) throw new Error(`snapshot responded ${res.status}`)
    try {
      snapshot = await res.json()
    } catch (err) {
      throw new Error(`invalid snapshot JSON: ${err.message}`)
    }
  } catch (err) {
    throw new Error(`fetch-from-api: snapshot request failed: ${err.message}`)
  } finally {
    clearTimeout(timer)
  }
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot) || !Array.isArray(snapshot.proxies)
    || !Number.isSafeInteger(snapshot.count) || snapshot.count < 0 || typeof snapshot.generatedAt !== 'string') {
    throw new Error('fetch-from-api: malformed snapshot envelope')
  }
  if (Object.hasOwn(snapshot, 'truncated') && snapshot.truncated !== false) throw new Error('fetch-from-api: snapshot is truncated')
  if (snapshot.count !== snapshot.proxies.length) throw new Error('fetch-from-api: snapshot count mismatch')
  if (Object.hasOwn(snapshot, 'totalCount') && snapshot.totalCount !== snapshot.count) throw new Error('fetch-from-api: snapshot totalCount mismatch')
  if (!Number.isInteger(snapshot.maxAgeMin) || snapshot.maxAgeMin !== maxAgeMin) throw new Error('fetch-from-api: snapshot maxAgeMin mismatch')

  const currentNow = nowFn ? nowFn() : (now || new Date())
  const generatedAt = new Date(snapshot.generatedAt).getTime()
  if (!Number.isFinite(generatedAt)) throw new Error('fetch-from-api: invalid snapshot generatedAt')
  if (generatedAt > currentNow.getTime() + 5000) throw new Error('fetch-from-api: snapshot generatedAt is in the future')
  if (currentNow.getTime() - generatedAt > 2 * intervalSec * 1000) throw new Error('fetch-from-api: snapshot is stale')

  const publishable = selectPublishable(snapshot.proxies, { now: currentNow, maxAgeMin })
  const mapped = publishable.map(apiRowToProxy)
  const withExitShared = applyExitShared(mapped)
  return { list: sortProxies(withExitShared), snapshot }
}

export async function fetchPreviousPublishedCount({ url = DEFAULT_PREVIOUS_STATS_URL, fetchImpl = fetch } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  let res
  let stats
  try {
    res = await fetchImpl(url, { signal: controller.signal })
    if (res.status === 404) return null // initial repository bootstrap only
    if (!responseOk(res)) throw new Error(`previous stats responded ${res.status}`)
    stats = await res.json()
  } catch (err) {
    throw new Error(`fetch-from-api: previous stats request failed: ${err.message}`)
  } finally {
    clearTimeout(timer)
  }
  if (!stats || !Number.isSafeInteger(stats.totals?.all) || stats.totals.all < 0) {
    throw new Error('fetch-from-api: malformed previous stats')
  }
  return stats.totals.all
}

export async function fetchFromApi(options = {}) {
  const { list } = await fetchSnapshotFromApi(options)
  return list
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const { list } = await fetchSnapshotFromApi(args)
  const previousCount = args.previousStatsUrl ? await fetchPreviousPublishedCount({ url: args.previousStatsUrl }) : null
  const floor = countFloorDecision({ count: list.length, lastPublishedCount: previousCount, minCount: args.minCount })
  if (!floor.ok) throw new Error(`fetch-from-api: ${floor.reason}, count=${list.length}, previousCount=${previousCount ?? 'initial'}`)
  fs.mkdirSync(path.dirname(args.out), { recursive: true })
  fs.writeFileSync(args.out, JSON.stringify(list, null, 2) + '\n')
  console.log(`fetch-from-api: wrote ${list.length} proxies to ${args.out}`)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(err => {
    console.error(`fetch-from-api failed: ${err.message}`)
    process.exitCode = 1
  })
}
