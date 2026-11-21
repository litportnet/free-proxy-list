#!/usr/bin/env node
// Load the richer JSON list and print the first (best) entry.
// https://github.com/litportnet/free-proxy-list
//
//   node node_fetch.mjs

const ALL_JSON = 'https://raw.githubusercontent.com/litportnet/free-proxy-list/live/proxies/all.json'

const proxies = await (await fetch(ALL_JSON)).json()
if (proxies.length === 0) {
  console.error('no proxies published right now, try again shortly')
  process.exit(1)
}

const best = proxies[0]
console.log(`best proxy: ${best.url} (${best.country}, ${best.latency_ms}ms, uptime_7d=${best.uptime_7d})`)

// Using it against a target requires an HTTP(S)/SOCKS agent package (e.g. https-proxy-agent,
// socks-proxy-agent) since Node's global fetch has no built-in proxy support; wiring one up is
// left out here to keep this example dependency-free.
