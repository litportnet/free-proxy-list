// Frozen synthetic Mongo samples and the Contract A output emitted before phase 3b. Keep these
// fixtures even though the publisher now reads only the snapshot API: they protect formatter
// compatibility across the API boundary without reintroducing a Mongo mapper in production.

const protocols = ['http', 'socks4', 'socks5']
const anonymities = [null, 'elite', 'anonymous', 'transparent']

export const mongoMapperParityFixtures = Array.from({ length: 50 }, (_, index) => {
  const protocol = protocols[index % protocols.length]
  const host = `8.8.${Math.floor(index / 200) + 1}.${index + 1}`
  const port = 8000 + index
  const country = index % 5 === 0 ? null : index % 2 === 0 ? 'US' : 'DE'
  const anonymity = anonymities[index % anonymities.length]
  const anonymityLevel = anonymity ? 'high' : index % 3 === 0 ? 'low' : 'high'
  const checks7d = 45 + index
  const uptime7d = 70 + (index % 30) + 0.24
  const uptime24h = 80 + (index % 20) + 0.36
  const latency = 100 + index + 0.6
  const createdAt = `2026-08-${String((index % 28) + 1).padStart(2, '0')}T00:00:00.000Z`
  const pingAt = `2026-09-09T18:${String(index % 60).padStart(2, '0')}:00.000Z`
  const raw = {
    protocol,
    host,
    port: String(port),
    outIp: index % 7 === 0 ? null : host,
    geo: { country, region: country ? `Region ${index}` : null, city: country ? `City ${index}` : null, timezone: country ? 'America/Los_Angeles' : null },
    network: { asnNumber: index % 11 === 0 ? null : `AS${15000 + index}`, asnOrgName: index % 11 === 0 ? null : `Network ${index}` },
    anonymity,
    anonymityLevel,
    https: index % 3 === 0 ? true : index % 3 === 1 ? false : null,
    durations: { http: latency },
    latencyMedianMs: index % 4 === 0 ? null : latency - 10,
    uptime: { '24hours': { perc: uptime24h, pingsTotal: 20 + index }, week: { perc: uptime7d, pingsTotal: checks7d } },
    createdAt,
    pingAt,
    lastAliveAt: index % 6 === 0 ? null : pingAt,
    source: index % 2 ? 'geonode' : null,
    sources: index % 2 ? ['geonode', 'proxyscrape'] : undefined,
  }
  const resolvedCountry = country ? country.toLowerCase() : null
  return {
    raw,
    // This is the old mapper's expected Contract A output, stored next to every raw case.
    expected: {
      protocol,
      ip: host,
      port,
      url: `${protocol}://${host}:${port}`,
      anonymity: anonymity || (anonymityLevel === 'low' ? 'transparent' : 'anonymous'),
      https: raw.https,
      latency_ms: Math.round(latency),
      uptime_24h: Math.round(uptime24h * 10) / 10,
      uptime_7d: checks7d >= 50 ? Math.round(uptime7d * 10) / 10 : null,
      checks_7d: checks7d,
      exit_ip: raw.outIp,
      exit_shared: 1,
      country: resolvedCountry,
      region: raw.geo.region,
      city: raw.geo.city,
      timezone: raw.geo.timezone,
      asn: raw.network.asnNumber ? 15000 + index : null,
      asn_org: raw.network.asnOrgName,
      sources_count: raw.sources?.length || (raw.source ? 1 : 0),
      first_seen: createdAt,
      last_checked: pingAt,
    },
    expectedLatencyMedianMs: raw.latencyMedianMs,
  }
})
