import assert from 'node:assert/strict'
import test from 'node:test'

import { formatFreeProxy } from '../../../app/utils/getFreeProxies.js'
import { mongoMapperParityFixtures } from '../test-fixtures/mongo-mapper-parity.mjs'

import {
  apiRowToProxy,
  applyExitShared,
  buildFileSet,
  findMissingReadmeLinks,
  isPublicIpv4,
  ipv4ToInt,
  renderReadme,
  selectPublishable,
  sortProxies,
  toCsv,
  toJson,
  toTxtIpPort,
  toTxtUrls,
} from './lib.mjs'

const apiRow = (extra = {}) => ({
  protocol: 'http',
  host: '203.0.113.9',
  port: '8080',
  externalIp: '203.0.113.9',
  geoCountry: 'US',
  geoRegion: 'California',
  geoCity: 'Fresno',
  geoTimezone: 'America/Los_Angeles',
  asn: 'AS12345',
  asnOrgName: 'Example Networks',
  anonymityLevel: 'high',
  responseTimeMs: 512.6,
  uptimeRating: 92,
  createdAt: '2026-08-01T00:00:00.000Z',
  pingAt: '2026-09-09T18:00:00.000Z',
  ...extra,
})

test('ipv4ToInt parses valid dotted quads and rejects garbage', () => {
  assert.equal(ipv4ToInt('1.2.3.4'), (1 << 24) + (2 << 16) + (3 << 8) + 4)
  assert.equal(ipv4ToInt('256.0.0.1'), null)
  assert.equal(ipv4ToInt('not-an-ip'), null)
  assert.equal(ipv4ToInt(''), null)
})

test('isPublicIpv4 rejects every bogon range and accepts a normal address', () => {
  const bogons = [
    '0.1.2.3', '10.1.2.3', '100.64.1.1', '127.0.0.1', '169.254.1.1', '172.16.1.1',
    '192.0.0.5', '192.0.2.5', '192.168.1.1', '198.18.0.5', '198.51.100.5', '203.0.113.5',
    '224.0.0.1', '240.0.0.1',
  ]
  for (const ip of bogons) assert.equal(isPublicIpv4(ip), false, `${ip} should be rejected`)
  assert.equal(isPublicIpv4('8.8.8.8'), true)
  assert.equal(isPublicIpv4('1.1.1.1'), true)
})

test('apiRowToProxy maps the public API row into contract A with the exact key order', () => {
  const proxy = apiRowToProxy(apiRow())
  assert.deepEqual(Object.keys(proxy), [
    'protocol', 'ip', 'port', 'url', 'anonymity', 'https', 'latency_ms', 'latency_median_ms',
    'uptime_24h', 'uptime_7d', 'checks_7d', 'exit_ip', 'exit_shared', 'country', 'region', 'city', 'timezone',
    'asn', 'asn_org', 'sources_count', 'first_seen', 'last_checked',
  ])
  assert.deepEqual(proxy, {
    protocol: 'http',
    ip: '203.0.113.9',
    port: 8080,
    url: 'http://203.0.113.9:8080',
    anonymity: 'anonymous',
    https: null,
    latency_ms: 513,
    latency_median_ms: null,
    uptime_24h: 92,
    uptime_7d: null,
    checks_7d: 0,
    exit_ip: '203.0.113.9',
    exit_shared: 1,
    country: 'us',
    region: 'California',
    city: 'Fresno',
    timezone: 'America/Los_Angeles',
    asn: 12345,
    asn_org: 'Example Networks',
    sources_count: 0,
    first_seen: '2026-08-01T00:00:00.000Z',
    last_checked: '2026-09-09T18:00:00.000Z',
  })
})

test('apiRowToProxy maps anonymityLevel low/null and a missing asn', () => {
  assert.equal(apiRowToProxy(apiRow({ anonymityLevel: 'low' })).anonymity, 'transparent')
  assert.equal(apiRowToProxy(apiRow({ anonymityLevel: null })).anonymity, 'unknown')
  assert.equal(apiRowToProxy(apiRow({ asn: null })).asn, null)
  assert.equal(apiRowToProxy(apiRow({ geoCountry: null })).country, null)
})

test('the public formatter preserves all pre-phase-3b Mongo mapper fields for 50 frozen rows', () => {
  assert.equal(mongoMapperParityFixtures.length, 50)
  for (const { raw, expected, expectedLatencyMedianMs } of mongoMapperParityFixtures) {
    const mapped = apiRowToProxy(formatFreeProxy(raw))
    const legacyFields = Object.fromEntries(Object.keys(expected).map(key => [key, mapped[key]]))
    assert.deepEqual(legacyFields, expected, raw.host)
    assert.equal(mapped.latency_median_ms, expectedLatencyMedianMs, raw.host)
  }
})

test('selectPublishable rejects bogons, bad ports, wrong protocol and stale pingAt', () => {
  const now = new Date('2026-09-09T18:30:00.000Z')
  const rows = [
    apiRow({ host: '203.0.113.9' }), // bogon (TEST-NET-3), reject
    apiRow({ host: '8.8.8.8', port: '0' }), // bad port
    apiRow({ host: '8.8.8.9', port: '70000' }), // bad port
    apiRow({ host: '8.8.8.10', protocol: 'ftp' }), // bad protocol
    apiRow({ host: '8.8.8.11', pingAt: '2026-09-09T17:00:00.000Z' }), // stale (90 min old, maxAgeMin 30)
    apiRow({ host: '8.8.8.12', pingAt: '2026-09-09T18:15:00.000Z' }), // fresh, kept
  ]
  const result = selectPublishable(rows, { now, maxAgeMin: 30 })
  assert.deepEqual(result.map(row => row.host), ['8.8.8.12'])
})

test('selectPublishable de-dupes on (protocol, host, port) keeping the most recent pingAt', () => {
  const now = new Date('2026-09-09T18:30:00.000Z')
  const older = apiRow({ host: '8.8.4.4', pingAt: '2026-09-09T18:10:00.000Z', uptimeRating: 10 })
  const newer = apiRow({ host: '8.8.4.4', pingAt: '2026-09-09T18:20:00.000Z', uptimeRating: 99 })
  const result = selectPublishable([older, newer], { now, maxAgeMin: 30 })
  assert.equal(result.length, 1)
  assert.equal(result[0].uptimeRating, 99)
})

test('selectPublishable treats absent deletedAt/isAlive as passing (API shape) and honors them when present (Mongo shape)', () => {
  const now = new Date('2026-09-09T18:30:00.000Z')
  const apiShaped = apiRow({ host: '8.8.4.4' })
  const deletedRow = { ...apiShaped, host: '8.8.4.5', deletedAt: new Date() }
  const deadRow = { ...apiShaped, host: '8.8.4.6', isAlive: 0 }
  const result = selectPublishable([apiShaped, deletedRow, deadRow], { now, maxAgeMin: 30 })
  assert.deepEqual(result.map(row => row.host), ['8.8.4.4'])
})

test('sortProxies orders by uptime_7d desc (nulls last), then latency_ms asc, then url asc', () => {
  const list = [
    { url: 'http://b', uptime_7d: 80, latency_ms: 100 },
    { url: 'http://a', uptime_7d: 80, latency_ms: 100 },
    { url: 'http://c', uptime_7d: null, latency_ms: 1 },
    { url: 'http://d', uptime_7d: 95, latency_ms: 500 },
    { url: 'http://e', uptime_7d: 95, latency_ms: 50 },
  ]
  const sorted = sortProxies(list).map(row => row.url)
  assert.deepEqual(sorted, ['http://e', 'http://d', 'http://a', 'http://b', 'http://c'])
})

test('sortProxies does not mutate its input', () => {
  const list = [{ url: 'http://b', uptime_7d: 1, latency_ms: 1 }, { url: 'http://a', uptime_7d: 1, latency_ms: 1 }]
  const copy = [...list]
  sortProxies(list)
  assert.deepEqual(list, copy)
})

test('applyExitShared counts rows sharing an exit_ip and leaves null exit_ip unique', () => {
  const list = [
    { exit_ip: '1.1.1.1' }, { exit_ip: '1.1.1.1' }, { exit_ip: '1.1.1.1' },
    { exit_ip: '2.2.2.2' },
    { exit_ip: null },
  ]
  const result = applyExitShared(list)
  assert.deepEqual(result.map(row => row.exit_shared), [3, 3, 3, 1, 1])
})

test('serialisation: txt/json/csv', () => {
  const list = [
    { protocol: 'http', ip: '1.2.3.4', port: 80, url: 'http://1.2.3.4:80', anonymity: 'elite', https: true, latency_ms: 100, latency_median_ms: 90, uptime_24h: 99.5, uptime_7d: 90.1, checks_7d: 60, exit_ip: '1.2.3.4', exit_shared: 1, country: 'us', region: 'CA', city: 'A, B', timezone: 'America/Los_Angeles', asn: 1, asn_org: 'Example, Inc.', sources_count: 2, first_seen: '2026-01-01T00:00:00.000Z', last_checked: '2026-01-02T00:00:00.000Z' },
  ]
  assert.equal(toTxtUrls(list), 'http://1.2.3.4:80\n')
  assert.equal(toTxtIpPort(list), '1.2.3.4:80\n')
  assert.equal(toJson(list), JSON.stringify(list, null, 2) + '\n')
  assert.equal(toJson(list).endsWith('\n'), true)

  const csv = toCsv(list)
  const lines = csv.split('\r\n').filter(Boolean)
  assert.equal(lines[0], 'protocol,ip,port,url,anonymity,https,latency_ms,latency_median_ms,uptime_24h,uptime_7d,checks_7d,exit_ip,exit_shared,country,region,city,timezone,asn,asn_org,sources_count,first_seen,last_checked')
  assert.match(lines[1], /"A, B"/)
  assert.match(lines[1], /"Example, Inc\."/)
  assert.equal(csv.endsWith('\r\n'), true)
})

test('toTxtUrls/toTxtIpPort/toJson/toCsv on an empty list still produce a valid, newline-terminated file', () => {
  assert.equal(toTxtUrls([]), '\n')
  assert.equal(toTxtIpPort([]), '\n')
  assert.equal(toJson([]), '[]\n')
  assert.equal(toCsv([]).split('\r\n')[0].startsWith('protocol,'), true)
})

const sampleList = () => sortProxies([
  apiRowToProxy(apiRow({ host: '8.8.8.1', protocol: 'http', geoCountry: 'US', uptimeRating: 95, responseTimeMs: 100 })),
  apiRowToProxy(apiRow({ host: '8.8.8.2', protocol: 'socks5', geoCountry: 'DE', uptimeRating: 50, responseTimeMs: 2000 })),
  apiRowToProxy(apiRow({ host: '8.8.8.3', protocol: 'socks4', geoCountry: 'US', uptimeRating: 10, responseTimeMs: 5000, anonymityLevel: 'low' })),
])

test('buildFileSet writes every advertised file, gated correctly, and a matching stats.json', () => {
  const { files, stats } = buildFileSet(sampleList(), {
    generatedAt: '2026-09-09T18:00:00.000Z',
    intervalSec: 300,
    maxAgeMin: 30,
  })

  for (const base of ['proxies/all', 'proxies/http', 'proxies/socks4', 'proxies/socks5', 'proxies/https', 'proxies/fast', 'proxies/stable', 'proxies/anonymous']) {
    for (const ext of ['txt', 'json', 'csv']) {
      assert.ok(files[`${base}.${ext}`] !== undefined, `${base}.${ext} missing`)
    }
  }
  assert.ok(files['proxies/stats.json'])
  for (const badge of ['total', 'http', 'socks4', 'socks5', 'https', 'countries', 'updated']) {
    assert.ok(files[`proxies/badges/${badge}.json`], `badge ${badge} missing`)
    const parsed = JSON.parse(files[`proxies/badges/${badge}.json`])
    assert.equal(parsed.schemaVersion, 1)
  }

  assert.equal(stats.totals.all, 3)
  assert.equal(stats.totals.http, 1)
  assert.equal(stats.totals.socks4, 1)
  assert.equal(stats.totals.socks5, 1)
  assert.equal(stats.totals.https, 0)
  assert.equal(stats.countries_count, 2)
  assert.equal(stats.countries.us, 2)
  assert.equal(stats.countries.de, 1)
  assert.equal(stats.generated_at, '2026-09-09T18:00:00.000Z')
  assert.equal(stats.expires_at, '2026-09-09T18:10:00.000Z')

  assert.ok(files['proxies/countries/us/all.txt'])
  assert.ok(files['proxies/countries/us/http.txt'])
  assert.ok(!files['proxies/countries/us/socks5.txt'])
  assert.ok(files['proxies/countries/de/socks5.txt'])
})

test('buildFileSet always writes proxies/https.* even when it is empty', () => {
  const { files, stats } = buildFileSet([], { generatedAt: '2026-09-09T18:00:00.000Z', intervalSec: 300, maxAgeMin: 30 })
  assert.equal(files['proxies/https.txt'], '\n')
  assert.equal(stats.totals.https, 0)
})

test('renderReadme replaces marker blocks and leaves the rest of the template untouched', () => {
  const template = [
    '# Free proxy list by litport',
    'Intro paragraph.',
    '<!-- STATS:START -->old stats<!-- STATS:END -->',
    '<!-- DOWNLOADS:START -->old downloads<!-- DOWNLOADS:END -->',
    '<!-- VERIFICATION:START -->old verification<!-- VERIFICATION:END -->',
    '<!-- COUNTRIES:START -->old countries<!-- COUNTRIES:END -->',
    'Footer text.',
  ].join('\n')

  const { stats } = buildFileSet(sampleList(), { generatedAt: '2026-09-09T18:00:00.000Z', intervalSec: 300, maxAgeMin: 30 })
  const readme = renderReadme(template, stats)

  assert.match(readme, /# Free proxy list by litport/)
  assert.match(readme, /Footer text\./)
  assert.match(readme, /3 working proxies from 2 countries/)
  assert.match(readme, /\| List \| Count \| \.txt \| \.json \| \.csv \| On litport\.net \|/)
  assert.match(readme, /ipkit\.io over HTTP through the proxy/)
  assert.match(readme, /All countries \(2\)/)
  assert.doesNotMatch(readme, /old stats|old downloads|old verification|old countries/)
})

test('renderReadme throws when a marker pair is missing', () => {
  const { stats } = buildFileSet(sampleList(), { generatedAt: '2026-09-09T18:00:00.000Z', intervalSec: 300, maxAgeMin: 30 })
  assert.throws(() => renderReadme('# no markers here', stats), /STATS/)
})

test('findMissingReadmeLinks flags relative links that do not exist in the output tree and ignores external/anchor links', () => {
  const readme = [
    '[schema](SCHEMA.md)',
    '[missing](proxies/countries/zz/all.txt)',
    '[site](https://litport.net/free-proxy)',
    '[anchor](#faq)',
  ].join('\n')
  const files = { 'SCHEMA.md': true, 'proxies/countries/us/all.txt': true }
  assert.deepEqual(findMissingReadmeLinks(readme, files), ['proxies/countries/zz/all.txt'])
})
