// Pure helpers for the litportnet/free-proxy-list builder (`build.mjs`, `fetch-from-api.mjs`).
// Zero npm dependencies: this file and everything under github/freeProxyList/ is copied
// into a standalone GitHub repository and also runs unmodified inside GitHub Actions, so it
// must only use Node built-ins. Keep it free of database clients and of anything from the
// rest of this monorepo. The server publisher and the fallback workflow both consume the
// snapshot API through fetch-from-api.mjs, so this is the single mapper for Contract A.

// ---------------------------------------------------------------------------
// IPv4 / bogon filtering
// ---------------------------------------------------------------------------

const ipv4Pattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/

export function ipv4ToInt(ip) {
  const match = ipv4Pattern.exec(String(ip || ''))
  if (!match) return null
  const parts = match.slice(1, 5).map(Number)
  if (parts.some(part => part < 0 || part > 255)) return null
  return ((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3]
}

// Reserved / non-public IPv4 ranges (RFC 5735, RFC 6598, RFC 1918, etc.) that must never be
// published as a "free proxy". Kept as [network, prefixLength] pairs.
export const BOGON_RANGES = [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
]

const cidrMatches = (ipInt, [network, prefixLength]) => {
  const networkInt = ipv4ToInt(network)
  const mask = prefixLength === 0 ? 0 : (0xFFFFFFFF << (32 - prefixLength)) >>> 0
  return (ipInt & mask) >>> 0 === (networkInt & mask) >>> 0
}

export function isPublicIpv4(ip) {
  const ipInt = ipv4ToInt(ip)
  if (ipInt === null) return false
  return !BOGON_RANGES.some(range => cidrMatches(ipInt, range))
}

// ---------------------------------------------------------------------------
// Contract A: proxy object shape shared by every file the builder writes
// ---------------------------------------------------------------------------

export const PROTOCOLS = ['http', 'socks4', 'socks5']

const round1 = value => (value == null ? null : Math.round(value * 10) / 10)

const anonymityFromLevel = anonymityLevel => {
  if (anonymityLevel === 'high') return 'anonymous'
  if (anonymityLevel === 'low') return 'transparent'
  return 'unknown'
}

const asnDigits = asnNumber => {
  if (!asnNumber) return null
  const match = /(\d+)/.exec(String(asnNumber))
  return match ? parseInt(match[1], 10) : null
}

/**
 * Maps one row of the public API (https://litport.net/api/free-proxy, the shape produced by
 * app/utils/getFreeProxies.js) into the contract A proxy object. This mapping intentionally
 * mirrors the public snapshot field names; do not add a second Mongo mapper in the publisher.
 */
export function apiRowToProxy(apiRow) {
  const protocol = apiRow.protocol
  const ip = apiRow.host
  const port = parseInt(apiRow.port, 10)
  const country = apiRow.geoCountry ? apiRow.geoCountry.toLowerCase() : null

  return {
    protocol,
    ip,
    port,
    url: `${protocol}://${ip}:${port}`,
    anonymity: apiRow.anonymity || anonymityFromLevel(apiRow.anonymityLevel),
    https: typeof apiRow.https === 'boolean' ? apiRow.https : null,
    latency_ms: Math.round(apiRow.responseTimeMs ?? 0),
    latency_median_ms: apiRow.responseTimeMedianMs == null ? null : apiRow.responseTimeMedianMs,
    uptime_24h: round1(apiRow.uptime24h ?? apiRow.uptimeRating ?? 0),
    uptime_7d: apiRow.checks7d >= 50 && apiRow.uptime7d != null ? round1(apiRow.uptime7d) : null,
    checks_7d: apiRow.checks7d ?? 0,
    exit_ip: apiRow.externalIp || null,
    exit_shared: 1,
    country,
    region: apiRow.geoRegion || null,
    city: apiRow.geoCity || null,
    timezone: apiRow.geoTimezone || null,
    asn: asnDigits(apiRow.asn),
    asn_org: apiRow.asnOrgName || null,
    sources_count: apiRow.sourcesCount ?? 0,
    first_seen: new Date(apiRow.createdAt).toISOString(),
    last_checked: new Date(apiRow.pingAt).toISOString(),
  }
}

/**
 * Publish gate, shared by fetch-from-api.mjs and (via a separately-maintained copy for Mongo
 * raw rows) jobs/routine/publishFreeProxiesGithub.lib.js. `deletedAt`/`isAlive` are treated as
 * passing when absent, so this also works directly against API rows, which the public endpoint
 * has already filtered to `deletedAt: null, isAlive > 0`.
 */
export function selectPublishable(rows, { now, maxAgeMin }) {
  const cutoff = now.getTime() - maxAgeMin * 60 * 1000
  const seen = new Map()

  for (const row of rows) {
    if (row.deletedAt != null) continue
    if (row.isAlive != null && !(row.isAlive > 0)) continue
    if (!PROTOCOLS.includes(row.protocol)) continue

    const port = parseInt(row.port, 10)
    if (!Number.isInteger(port) || port < 1 || port > 65535) continue

    if (!isPublicIpv4(row.host)) continue

    const pingAt = row.pingAt ? new Date(row.pingAt).getTime() : NaN
    if (!Number.isFinite(pingAt) || pingAt < cutoff || pingAt > now.getTime()) continue

    const key = `${row.protocol}|${row.host}|${port}`
    const existing = seen.get(key)
    if (!existing || pingAt > new Date(existing.pingAt).getTime()) {
      seen.set(key, row)
    }
  }

  return [...seen.values()]
}

/** Deterministic sort: best proxies first (`head -1` is always meaningful). */
export function sortProxies(list) {
  return [...list].sort((a, b) => {
    const aUp = a.uptime_7d
    const bUp = b.uptime_7d
    if (aUp == null && bUp != null) return 1
    if (aUp != null && bUp == null) return -1
    if (aUp != null && bUp != null && aUp !== bUp) return bUp - aUp

    if (a.latency_ms !== b.latency_ms) return a.latency_ms - b.latency_ms

    return a.url < b.url ? -1 : a.url > b.url ? 1 : 0
  })
}

/** Fills in `exit_shared` across an already-mapped batch of contract A proxy objects. */
export function applyExitShared(list) {
  const counts = new Map()
  for (const proxy of list) {
    if (!proxy.exit_ip) continue
    counts.set(proxy.exit_ip, (counts.get(proxy.exit_ip) || 0) + 1)
  }
  return list.map(proxy => ({
    ...proxy,
    exit_shared: proxy.exit_ip ? counts.get(proxy.exit_ip) : 1,
  }))
}

// ---------------------------------------------------------------------------
// Serialisation: txt / json / csv
// ---------------------------------------------------------------------------

const CONTRACT_KEYS = [
  'protocol', 'ip', 'port', 'url', 'anonymity', 'https', 'latency_ms',
  'latency_median_ms', 'uptime_24h', 'uptime_7d', 'checks_7d', 'exit_ip', 'exit_shared', 'country', 'region', 'city', 'timezone',
  'asn', 'asn_org', 'sources_count', 'first_seen', 'last_checked',
]

export function toTxtUrls(list) {
  return list.map(proxy => proxy.url).join('\n') + '\n'
}

export function toTxtIpPort(list) {
  return list.map(proxy => `${proxy.ip}:${proxy.port}`).join('\n') + '\n'
}

export function toJson(list) {
  return JSON.stringify(list, null, 2) + '\n'
}

const csvField = value => {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`
  return str
}

export function toCsv(list) {
  const header = CONTRACT_KEYS.join(',')
  const rows = list.map(proxy => CONTRACT_KEYS.map(key => csvField(proxy[key])).join(','))
  return [header, ...rows].join('\r\n') + '\r\n'
}

/** Shared by the server publisher and the manual fallback before either builds an artifact. */
export function countFloorDecision({ count, lastPublishedCount, minCount = 300 }) {
  if (!Number.isInteger(count) || count < minCount) return { ok: false, reason: 'count-floor' }
  if (lastPublishedCount != null && (!Number.isInteger(lastPublishedCount) || lastPublishedCount < 0)) {
    return { ok: false, reason: 'previous-count-malformed' }
  }
  if (lastPublishedCount != null && lastPublishedCount > 0 && count < 0.4 * lastPublishedCount) {
    return { ok: false, reason: 'count-floor' }
  }
  return { ok: true }
}

// ---------------------------------------------------------------------------
// File-set generation
// ---------------------------------------------------------------------------

const isFast = proxy => proxy.latency_ms < 1000
const isStable = proxy => proxy.uptime_7d != null && proxy.uptime_7d >= 90 && proxy.checks_7d >= 50
const isAnonymousOrElite = proxy => proxy.anonymity === 'anonymous' || proxy.anonymity === 'elite'

const writeTrio = (files, relBase, list, { bare = false } = {}) => {
  files[`${relBase}.txt`] = bare ? toTxtIpPort(list) : toTxtUrls(list)
  files[`${relBase}.json`] = toJson(list)
  files[`${relBase}.csv`] = toCsv(list)
}

/**
 * Builds the full `proxies/` file tree (as a map of relative path -> file content) from an
 * already-gated, already-sorted list of contract A proxy objects. Returns `{ files, stats }`.
 */
export function buildFileSet(list, { generatedAt, intervalSec, maxAgeMin }) {
  const files = {}

  writeTrio(files, 'proxies/all', list)

  const byProtocol = {}
  for (const protocol of PROTOCOLS) {
    byProtocol[protocol] = list.filter(proxy => proxy.protocol === protocol)
    writeTrio(files, `proxies/${protocol}`, byProtocol[protocol], { bare: true })
  }

  const httpsList = list.filter(proxy => proxy.https === true)
  writeTrio(files, 'proxies/https', httpsList, { bare: true })

  const fastList = list.filter(isFast)
  const stableList = list.filter(isStable)
  const anonymousList = list.filter(isAnonymousOrElite)
  writeTrio(files, 'proxies/fast', fastList)
  writeTrio(files, 'proxies/stable', stableList)
  writeTrio(files, 'proxies/anonymous', anonymousList)

  const byCountry = new Map()
  for (const proxy of list) {
    if (!proxy.country) continue
    if (!byCountry.has(proxy.country)) byCountry.set(proxy.country, [])
    byCountry.get(proxy.country).push(proxy)
  }
  const countryCounts = {}
  for (const [cc, proxiesForCountry] of [...byCountry.entries()].sort((a, b) => b[1].length - a[1].length)) {
    countryCounts[cc] = proxiesForCountry.length
    writeTrio(files, `proxies/countries/${cc}/all`, proxiesForCountry)
    for (const protocol of PROTOCOLS) {
      const subset = proxiesForCountry.filter(proxy => proxy.protocol === protocol)
      if (subset.length === 0) continue
      writeTrio(files, `proxies/countries/${cc}/${protocol}`, subset, { bare: true })
    }
  }

  const totals = {
    all: list.length,
    http: byProtocol.http.length,
    socks4: byProtocol.socks4.length,
    socks5: byProtocol.socks5.length,
    https: httpsList.length,
    fast: fastList.length,
    stable: stableList.length,
    anonymous: anonymousList.length,
  }

  const byAnonymity = { transparent: 0, anonymous: 0, elite: 0, unknown: 0 }
  for (const proxy of list) {
    if (byAnonymity[proxy.anonymity] != null) byAnonymity[proxy.anonymity] += 1
  }

  const generatedAtDate = new Date(generatedAt)
  const stats = {
    generated_at: generatedAtDate.toISOString(),
    expires_at: new Date(generatedAtDate.getTime() + 2 * intervalSec * 1000).toISOString(),
    interval_sec: intervalSec,
    max_age_min: maxAgeMin,
    totals,
    by_anonymity: byAnonymity,
    countries: countryCounts,
    countries_count: Object.keys(countryCounts).length,
    verification: {
      judge: 'HTTP verification endpoint through the proxy',
      attempts: '2 (10 s, 5 s) for proxies seen alive before, 1 (8 s) for new candidates',
      pass: '2xx response with a JSON body containing a public IPv4 exit address',
      anonymity_method: 'response headers echoed by the verification endpoint are scanned for the checker\'s IP (transparent) and for Via/X-Forwarded-For/Forwarded/Proxy-Connection (anonymous); neither = elite; no headers block = unknown',
      https_method: 'HTTPS request to the verification endpoint through the proxy with certificate verification',
      recheck_cadence: 'every ~10 minutes while alive',
      publish_gate: 'alive and checked within max_age_min',
      uptime: 'share of checks that succeeded in the trailing 24 h / 7 d; uptime_7d is null under 50 checks',
    },
    source_api: 'https://litport.net/api/free-proxy/snapshot',
    site: 'https://litport.net/free-proxy',
  }

  files['proxies/stats.json'] = JSON.stringify(stats, null, 2) + '\n'

  const badge = (label, message, color) => JSON.stringify({ schemaVersion: 1, label, message, color }, null, 2) + '\n'
  const numberColor = n => (n > 0 ? 'brightgreen' : 'lightgrey')
  files['proxies/badges/total.json'] = badge('proxies', String(totals.all), numberColor(totals.all))
  files['proxies/badges/http.json'] = badge('http', String(totals.http), numberColor(totals.http))
  files['proxies/badges/socks4.json'] = badge('socks4', String(totals.socks4), numberColor(totals.socks4))
  files['proxies/badges/socks5.json'] = badge('socks5', String(totals.socks5), numberColor(totals.socks5))
  files['proxies/badges/https.json'] = badge('https', String(totals.https), numberColor(totals.https))
  files['proxies/badges/countries.json'] = badge('countries', String(stats.countries_count), numberColor(stats.countries_count))
  files['proxies/badges/updated.json'] = badge('updated', generatedAtDate.toISOString().replace('T', ' ').slice(0, 16) + ' UTC', 'blue')
  // The stale-check workflow owns this badge on main. Do not stamp a fresh time here: that
  // would create a green state-only commit even when live stats are absent or malformed.

  return { files, stats }
}

// ---------------------------------------------------------------------------
// README rendering
// ---------------------------------------------------------------------------

const MARKERS = ['STATS', 'DOWNLOADS', 'VERIFICATION', 'COUNTRIES']

const replaceMarkerBlock = (template, marker, content) => {
  const start = `<!-- ${marker}:START -->`
  const end = `<!-- ${marker}:END -->`
  const startIndex = template.indexOf(start)
  const endIndex = template.indexOf(end)
  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    throw new Error(`README.template.md is missing the ${marker} marker pair`)
  }
  const before = template.slice(0, startIndex + start.length)
  const after = template.slice(endIndex)
  return `${before}\n${content}\n${after}`
}

const renderStatsBlock = stats => {
  const timestamp = stats.generated_at.replace('T', ' ').slice(0, 16)
  return `**${stats.totals.all} working proxies from ${stats.countries_count} countries, each checked within the ${stats.max_age_min} minutes before this snapshot (${timestamp} UTC). Lists refresh every ${Math.round(stats.interval_sec / 60)} minutes.**`
}

const downloadRow = (label, file, litportUrl, count) => {
  const raw = `https://raw.githubusercontent.com/litportnet/free-proxy-list/live/${file}`
  const cell = ext => `[.${ext}](${raw.replace(/\.[a-z]+$/, `.${ext}`)})`
  return `| ${label} | ${count} | ${cell('txt')} | ${cell('json')} | ${cell('csv')} | [View ${label} proxies](${litportUrl}) |`
}

const UTM = 'utm_source=github&utm_medium=repo&utm_campaign=free-proxy-list'

const renderDownloadsBlock = stats => {
  const rows = [
    ['All', 'proxies/all.txt', `https://litport.net/free-proxy?${UTM}&utm_content=table-all&checkedWithinMin=30`, stats.totals.all],
    ['HTTP', 'proxies/http.txt', `https://litport.net/free-proxy?${UTM}&utm_content=table-http&protocol=http&checkedWithinMin=30`, stats.totals.http],
    ['HTTPS (CONNECT)', 'proxies/https.txt', `https://litport.net/free-proxy?${UTM}&utm_content=table-https&list=https&checkedWithinMin=30`, stats.totals.https],
    ['SOCKS4', 'proxies/socks4.txt', `https://litport.net/free-proxy?${UTM}&utm_content=table-socks4&protocol=socks4&checkedWithinMin=30`, stats.totals.socks4],
    ['SOCKS5', 'proxies/socks5.txt', `https://litport.net/free-proxy?${UTM}&utm_content=table-socks5&protocol=socks5&checkedWithinMin=30`, stats.totals.socks5],
    ['Fast (<1 s)', 'proxies/fast.txt', `https://litport.net/free-proxy?${UTM}&utm_content=table-fast&list=fast&checkedWithinMin=30`, stats.totals.fast],
    ['Stable (7-day uptime ≥ 90%)', 'proxies/stable.txt', `https://litport.net/free-proxy?${UTM}&utm_content=table-stable&list=stable&checkedWithinMin=30`, stats.totals.stable],
    ['Anonymous+Elite', 'proxies/anonymous.txt', `https://litport.net/free-proxy?${UTM}&utm_content=table-anonymous&list=anonymous&checkedWithinMin=30`, stats.totals.anonymous],
    ['United States', 'proxies/countries/us/all.txt', `https://litport.net/free-proxy?${UTM}&utm_content=table-us&country=us&checkedWithinMin=30`, stats.countries.us || 0],
  ]
  const header = '| List | Count | .txt | .json | .csv | Browse online |\n|---|---|---|---|---|---|'
  return [header, ...rows.map(([label, file, url, count]) => downloadRow(label, file, url, count))].join('\n')
}

const renderVerificationBlock = stats => {
  const v = stats.verification
  return [
    `- **HTTP verification endpoint:** ${v.judge}`,
    `- **Attempts:** ${v.attempts}`,
    `- **Pass criterion:** ${v.pass}`,
    `- **Anonymity method:** ${v.anonymity_method}`,
    `- **HTTPS method:** ${v.https_method}`,
    `- **Re-check cadence:** ${v.recheck_cadence}`,
    `- **Publish gate:** ${v.publish_gate}`,
    `- **Uptime:** ${v.uptime}`,
  ].join('\n')
}

const renderCountriesBlock = stats => {
  const rows = Object.entries(stats.countries)
    .sort((a, b) => b[1] - a[1])
    .map(([cc, count]) => `| ${cc} | ${count} | [all.txt](proxies/countries/${cc}/all.txt) |`)
  return [
    `<details><summary>All countries (${stats.countries_count})</summary>`,
    '',
    '| Country | Count | Link |',
    '|---|---|---|',
    ...rows,
    '',
    '</details>',
  ].join('\n')
}

/**
 * Renders README.md from README.template.md by replacing the content of each
 * `<!-- X:START --> … <!-- X:END -->` marker pair, leaving everything else untouched.
 */
export function renderReadme(template, stats) {
  let readme = template
  readme = replaceMarkerBlock(readme, 'STATS', renderStatsBlock(stats))
  readme = replaceMarkerBlock(readme, 'DOWNLOADS', renderDownloadsBlock(stats))
  readme = replaceMarkerBlock(readme, 'VERIFICATION', renderVerificationBlock(stats))
  readme = replaceMarkerBlock(readme, 'COUNTRIES', renderCountriesBlock(stats))
  return readme
}

export { MARKERS }

// ---------------------------------------------------------------------------
// Link validation
// ---------------------------------------------------------------------------

/**
 * Every relative markdown link `](path)` in `readme` (excluding external `http(s)://` and
 * anchor `#` links) must exist as a key of `files`. Returns the list of missing paths (empty
 * when the README is safe to publish).
 */
export function findMissingReadmeLinks(readme, files) {
  const missing = []
  const linkPattern = /\]\(([^)]+)\)/g
  let match
  while ((match = linkPattern.exec(readme))) {
    const target = match[1]
    if (/^https?:\/\//.test(target) || target.startsWith('#') || target.startsWith('mailto:')) continue
    const clean = target.split('#')[0]
    if (!clean) continue
    if (!(clean in files)) missing.push(clean)
  }
  return [...new Set(missing)]
}
