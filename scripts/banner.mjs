const SVG_WIDTH = 1280
const SVG_HEIGHT = 512

const escapeXml = value => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;')

const assertNonNegativeNumber = (value, name) => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new Error(`banner stats ${name} must be a finite non-negative number`)
  }
  return value
}

const formatCount = value => new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value)

function formatTimestamp(value) {
  if (typeof value !== 'string') throw new Error('banner stats generated_at must be a valid timestamp')
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) throw new Error('banner stats generated_at must be a valid timestamp')
  const pad = part => String(part).padStart(2, '0')
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())} UTC`
}

function parseTrustedLogo(logoSvg) {
  if (typeof logoSvg !== 'string') throw new Error('banner logo must be an SVG string')
  const source = logoSvg.trim()
  if (/<\/?(?:script|foreignObject)\b|\son\w+\s*=|(?:href|xlink:href)\s*=\s*["']\s*(?:https?:|data:|javascript:)/i.test(source)) {
    throw new Error('banner logo contains unsupported content')
  }
  const match = /^<svg\b([^>]*)>([\s\S]*)<\/svg>$/.exec(source)
  const viewBox = match?.[1].match(/\bviewBox\s*=\s*(["'])([^"']+)\1/i)?.[2]
  if (!match || !viewBox) throw new Error('banner logo must have an SVG root with a viewBox')
  return `<svg x="48" y="32" width="180" height="46" viewBox="${escapeXml(viewBox)}" aria-label="Litport" role="img">${match[2]}</svg>`
}

/**
 * Render the self-contained repository banner from published proxy stats.
 * `artBuffer` is the trusted local JPEG artwork and `logoSvg` is the official local logo asset.
 */
export function renderBanner(stats, { artBuffer, logoSvg, showStats = true }) {
  if (!Buffer.isBuffer(artBuffer) || artBuffer.length === 0) throw new Error('banner artwork must be a non-empty Buffer')
  if (!stats || typeof stats !== 'object') throw new Error('banner stats are required')

  const totals = stats.totals || {}
  const all = assertNonNegativeNumber(totals.all, 'totals.all')
  const http = assertNonNegativeNumber(totals.http, 'totals.http')
  const socks4 = assertNonNegativeNumber(totals.socks4, 'totals.socks4')
  const socks5 = assertNonNegativeNumber(totals.socks5, 'totals.socks5')
  const countries = assertNonNegativeNumber(stats.countries_count, 'countries_count')
  const intervalSec = assertNonNegativeNumber(stats.interval_sec, 'interval_sec')
  if (intervalSec === 0) throw new Error('banner stats interval_sec must be greater than zero')

  formatTimestamp(stats.generated_at)
  const protocols = [
    { label: 'HTTP', value: http, color: '#28b8d8' },
    { label: 'SOCKS4', value: socks4, color: '#7798ff' },
    { label: 'SOCKS5', value: socks5, color: '#53d4a8' },
  ]
  const protocolTotal = http + socks4 + socks5
  const chartWidth = 560
  let cursor = 644
  const segments = protocols.map(protocol => {
    const width = protocolTotal === 0 ? 0 : chartWidth * protocol.value / protocolTotal
    const segment = width > 0 ? `<rect x="${cursor.toFixed(2)}" y="432" width="${width.toFixed(2)}" height="16" fill="${protocol.color}"/>` : ''
    cursor += width
    return segment
  }).join('')
  const legend = protocols.map((protocol, index) => {
    const x = 644 + index * 185
    const percentage = protocolTotal === 0 ? '0%' : `${Math.round(protocol.value / protocolTotal * 100)}%`
    return `<circle cx="${x}" cy="468" r="4" fill="${protocol.color}"/><text x="${x + 10}" y="474" class="legend">${escapeXml(protocol.label)}</text><text x="${x + 10}" y="498" class="legend">${escapeXml(percentage)} · ${escapeXml(formatCount(protocol.value))}</text>`
  }).join('')

  const height = showStats ? SVG_HEIGHT : 400
  const artwork = artBuffer.toString('base64')
  const logo = parseTrustedLogo(logoSvg)

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${SVG_WIDTH}" height="${height}" viewBox="0 0 ${SVG_WIDTH} ${height}" role="img" aria-labelledby="title description">
  <title id="title">Litport free proxy list</title>
  <desc id="description">${showStats ? 'Published proxy totals by protocol and country.' : 'Free proxy lists, API and SDKs by Litport.'}</desc>
  <style>
    text { font-family: ui-sans-serif, system-ui, sans-serif; }
    .label { fill: #9db3cc; font-size: 17px; font-weight: 700; letter-spacing: 1.2px; }
    .value { fill: #fff; font-size: 54px; font-weight: 700; letter-spacing: -.8px; }
    .legend { fill: #d8e4f2; font-size: 17px; font-weight: 600; }
    .update-badge { font-family: Arial, sans-serif; fill: #19558a; font-size: 18px; font-weight: 600; }
  </style>
  <image x="0" y="0" width="1280" height="512" preserveAspectRatio="none" href="data:image/jpeg;base64,${artwork}"/>
  ${logo}
  <rect x="250" y="35" width="266" height="40" rx="20" fill="#f1f9ff" stroke="#b2d7ef"/>
  <circle cx="272" cy="55" r="5" fill="#16885d"/>
  <text x="286" y="61" class="update-badge">Updated every 5 minutes</text>
  ${showStats ? `
  <rect x="0" y="376.8" width="1280" height="135.2" fill="#10253f"/>
  <text x="56" y="409" class="label">PUBLISHED PROXIES</text>
  <text x="56" y="476" class="value">${escapeXml(formatCount(all))}</text>
  <text x="304" y="409" class="label">COUNTRIES</text>
  <text x="304" y="476" class="value">${escapeXml(formatCount(countries))}</text>
  <text x="644" y="409" class="label">PROTOCOL DISTRIBUTION</text>
  <rect x="644" y="432" width="560" height="16" rx="5" fill="#29405d"/>
  <clipPath id="protocol-bars"><rect x="644" y="432" width="560" height="16" rx="5"/></clipPath>
  <g clip-path="url(#protocol-bars)">${segments}</g>
  ${legend}
  ` : ''}
</svg>
`
}
