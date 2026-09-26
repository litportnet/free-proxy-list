import assert from 'node:assert/strict'
import test from 'node:test'

import { renderBanner } from './banner.mjs'

const artBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xd9])
const logoSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 163 42"><path fill="#1e2022" d="M0 0h163v42H0z"/></svg>'
const stats = overrides => ({
  generated_at: '2026-09-09T18:29:00.000Z',
  interval_sec: 300,
  countries_count: 2,
  totals: { all: 10, http: 5, socks4: 2, socks5: 3 },
  ...overrides,
})

test('renderBanner creates a self-contained 1280 by 512 SVG with live proxy values', () => {
  const banner = renderBanner(stats(), { artBuffer, logoSvg })

  assert.match(banner, /<svg[^>]*width="1280" height="512" viewBox="0 0 1280 512"/)
  assert.match(banner, /<image[^>]*href="data:image\/jpeg;base64,\/9j\/2Q=="/)
  assert.match(banner, /<svg x="48" y="32" width="180" height="46" viewBox="0 0 163 42"/)
  assert.match(banner, /PUBLISHED PROXIES/)
  assert.doesNotMatch(banner, /Free proxies, checked live|Browse the live list/)
  assert.match(banner, />10<\/text>/)
  assert.match(banner, />2<\/text>/)
  assert.match(banner, /Updated every 5 minutes/)
  assert.doesNotMatch(banner, /Updated 5 minutes ago|Refresh target:|2026-09-09 18:29 UTC/)
  assert.match(banner, /HTTP<\/text><text[^>]+>50% · 5/)
  assert.match(banner, /SOCKS4<\/text><text[^>]+>20% · 2/)
  assert.match(banner, /SOCKS5<\/text><text[^>]+>30% · 3/)
})

test('renderBanner handles empty live data without a zero-division artifact', () => {
  const banner = renderBanner(stats({ countries_count: 0, totals: { all: 0, http: 0, socks4: 0, socks5: 0 } }), { artBuffer, logoSvg })

  assert.match(banner, /HTTP<\/text><text[^>]+>0% · 0/)
  assert.match(banner, /SOCKS4<\/text><text[^>]+>0% · 0/)
  assert.match(banner, /SOCKS5<\/text><text[^>]+>0% · 0/)
  assert.doesNotMatch(banner, /NaN|Infinity/)
})

test('renderBanner rejects malformed values and unsupported logo markup', () => {
  assert.throws(() => renderBanner(stats({ totals: { all: '<script>', http: 0, socks4: 0, socks5: 0 } }), { artBuffer, logoSvg }), /finite non-negative/)
  assert.throws(() => renderBanner(stats({ generated_at: 'not a date' }), { artBuffer, logoSvg }), /valid timestamp/)
  assert.throws(() => renderBanner(stats(), { artBuffer, logoSvg: '<svg viewBox="0 0 1 1"><script/></svg>' }), /unsupported content/)
})

test('static banner omits the statistics panel and retains the logo and update badge', () => {
  const banner = renderBanner(stats(), { artBuffer, logoSvg, showStats: false })
  assert.match(banner, /viewBox="0 0 1280 400"/)
  assert.match(banner, /Updated every 5 minutes/)
  assert.doesNotMatch(banner, /PUBLISHED PROXIES|PROTOCOL DISTRIBUTION|COUNTRIES/)
})
