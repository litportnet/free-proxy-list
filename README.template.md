# Free proxy list by litport

Free HTTP, SOCKS4 and SOCKS5 proxies, re-checked every few minutes, with latency, uptime, anonymity and country for every proxy. The lists in this repository refresh every 5 minutes and mirror the litport.net free proxy list and API.

<!-- STATS:START -->
<!-- STATS:END -->

![total](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Flitportnet%2Ffree-proxy-list%2Flive%2Fproxies%2Fbadges%2Ftotal.json)
![http](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Flitportnet%2Ffree-proxy-list%2Flive%2Fproxies%2Fbadges%2Fhttp.json)
![socks4](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Flitportnet%2Ffree-proxy-list%2Flive%2Fproxies%2Fbadges%2Fsocks4.json)
![socks5](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Flitportnet%2Ffree-proxy-list%2Flive%2Fproxies%2Fbadges%2Fsocks5.json)
![countries](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Flitportnet%2Ffree-proxy-list%2Flive%2Fproxies%2Fbadges%2Fcountries.json)
![updated](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Flitportnet%2Ffree-proxy-list%2Flive%2Fproxies%2Fbadges%2Fupdated.json)
![status](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Flitportnet%2Ffree-proxy-list%2Fmain%2Fproxies%2Fbadges%2Fstatus.json)
![stars](https://img.shields.io/github/stars/litportnet/free-proxy-list)
![license](https://img.shields.io/badge/license-MIT%20%2F%20CC0-blue)

## For developers and coding agents

Use the [snapshot API](https://litport.net/api/free-proxy/snapshot?checkedWithinMin=30) for a machine-readable JSON envelope with `generatedAt`, `count`, `totalCount`, `truncated`, and `proxies`. Reject truncated snapshots when you need a complete list, and check each proxy’s timestamp before use. The [API contract](https://litport.net/docs/free-proxy-api) and [repository schema](SCHEMA.md) describe their respective field names.

For application integration, the [JavaScript, TypeScript and Python SDK](https://github.com/litportnet/free-proxy-sdk) provides filtering and selection plus a CLI with JSON, CSV and TXT output. These lists supply proxy addresses; your HTTP client or browser must be configured to use the selected proxy.

## Download

<!-- DOWNLOADS:START -->
<!-- DOWNLOADS:END -->

```bash
curl -fsSL https://raw.githubusercontent.com/litportnet/free-proxy-list/live/proxies/all.txt -o all.txt
```

```bash
curl -fsSL https://raw.githubusercontent.com/litportnet/free-proxy-list/live/proxies/http.txt -o http.txt
```

```bash
curl -fsSL https://raw.githubusercontent.com/litportnet/free-proxy-list/live/proxies/socks5.txt -o socks5.txt
```

### Which URL should I use?

| Source | Freshness | Notes |
|---|---|---|
| `raw.githubusercontent.com/.../live/...` | Updates within ~5 minutes of each publish | Send `If-None-Match`/`If-Modified-Since` and poll at most once every 5 minutes |
| `cdn.jsdelivr.net/gh/litportnet/free-proxy-list@live/proxies/<file>` | Up to 12 hours behind | Unlimited bandwidth; fine for a daily fetch, not for polling |
| Release assets on `main` (`proxies-YYYY-MM-DD.tar.gz`) | Permanent | Use these to pin a specific date |

`live` is a single rewritten commit, published fresh every 5 minutes: its SHA changes on every publish, so pin release assets or a `main` snapshot, never a `live` commit SHA. Forks of `live` will not fast-forward.

## Quick start

Use a proxy from the list with `curl`, failing fast instead of hanging on a dead one:

```bash
curl --fail --max-time 10 --proxy http://$(head -1 proxies/http.txt) https://example.com
curl --fail --max-time 10 --proxy socks5h://$(head -1 proxies/socks5.txt) https://example.com
```

Lists are sorted best-first, so `head -1` is a reasonable "best proxy right now" pick.

Python (`requests`), loading the richer `all.json` and picking the first entry:

```python
import requests

proxies = requests.get("https://raw.githubusercontent.com/litportnet/free-proxy-list/live/proxies/all.json").json()
best = proxies[0]
print(best["url"], best["latency_ms"], best["country"])
```

Node (`fetch`):

```js
const proxies = await (await fetch('https://raw.githubusercontent.com/litportnet/free-proxy-list/live/proxies/all.json')).json()
const best = proxies[0]
console.log(best.url, best.latency_ms, best.country)
```

Full runnable versions: [examples/curl.sh](examples/curl.sh), [examples/python_requests.py](examples/python_requests.py), [examples/node_fetch.mjs](examples/node_fetch.mjs).

## How we check

<!-- VERIFICATION:START -->
<!-- VERIFICATION:END -->

## Fields

| Field | Meaning |
|---|---|
| `protocol` | `http`, `socks4` or `socks5` |
| `ip`, `port` | Connect to the proxy at `ip:port` |
| `url` | `protocol://ip:port`, ready to hand to most HTTP clients |
| `anonymity` | `transparent`, `anonymous`, `elite` or `unknown` (method above) |
| `https` | Whether this HTTP proxy tunnels an HTTPS request (`CONNECT`) with the origin certificate intact — not TLS to the proxy itself. `null` when not yet measured |
| `latency_ms` | Round-trip time of the last successful check, in milliseconds |
| `latency_median_ms` | Median latency from the recent successful-check window, or `null` when unavailable |
| `uptime_24h`, `uptime_7d` | Share of checks that succeeded in the trailing 24 hours / 7 days. `uptime_7d` is `null` under 50 checks |
| `checks_7d` | Number of checks the 7-day uptime is based on |
| `exit_ip`, `exit_shared` | The IP address the judge saw, and how many proxies in this snapshot share it (NAT/rotating gateways) |
| `country`, `region`, `city`, `timezone` | Geolocation of the exit IP, lowercase ISO-2 country code |
| `asn`, `asn_org` | Autonomous system number and organisation of the exit IP |
| `sources_count` | Number of independent lists this proxy was seen on |
| `first_seen`, `last_checked` | ISO 8601 UTC timestamps |

Full type reference and null rules: [SCHEMA.md](SCHEMA.md).

Per-country files live under `proxies/countries/<cc>/`, `<cc>` lowercase ISO-2. A missing file means "no proxies of that kind right now", not an error — 404 it and move on.

## Live API

No API key required:

```
https://litport.net/api/free-proxy?limit=50&sortBy=pingAt_desc&utm_source=github&utm_medium=repo&utm_campaign=free-proxy-list&utm_content=api-example
https://litport.net/api/free-proxy?protocol=socks5&country=us&utm_source=github&utm_medium=repo&utm_campaign=free-proxy-list&utm_content=api-example-2
```

Full reference: [litport.net/docs/free-proxy-api](https://litport.net/docs/free-proxy-api)

## Use it from code

The [litportnet/free-proxy-sdk](https://github.com/litportnet/free-proxy-sdk) client libraries
provide cached snapshot fetching, filtering, and proxy URL helpers. Install JavaScript with
[`npm i @litportnet/free-proxy-sdk`](https://www.npmjs.com/package/@litportnet/free-proxy-sdk) or
Python with [`pip install litportnet-free-proxy-sdk`](https://pypi.org/project/litportnet-free-proxy-sdk/).

## When a free proxy is not enough

Free proxies are shared, unauthenticated and can disappear mid-session, which rules them out for anything that needs to stay up. litport also runs paid residential, ISP and datacenter proxies for workloads that need to actually work: https://litport.net/?utm_source=github&utm_medium=repo&utm_campaign=free-proxy-list&utm_content=cta

## FAQ

**Is using a proxy list legal?** Proxies themselves are legal in most jurisdictions. What you do through one can still break a law or a site's terms — the proxy does not change that. Follow the target site's rules and your local law.

**What is a proxy list used for?** Web scraping, ad verification, geo-testing, QA against region-locked content and general traffic anonymization are the common uses. A free list is best for short, low-stakes tasks.

**How do I check a proxy list?** Send a real request through each entry to a known endpoint (a "judge") and require a valid response within a timeout; see "How we check" above for the exact method this repository uses.

**Why do free proxies stop working?** Most are open by accident (misconfigured devices, forgotten test servers) or run by volunteers with no SLA. Operators reboot, ISPs reassign IPs, and abuse gets addresses blocked — turnover is normal, which is why this list re-checks every proxy instead of publishing once.

**HTTP vs HTTPS vs SOCKS — what's the difference?** HTTP proxies forward plain HTTP requests and can also tunnel HTTPS via `CONNECT` (that's what `https: true` means here). SOCKS4/SOCKS5 work at a lower level and can carry any TCP traffic; SOCKS5 additionally supports UDP and authentication.

## All countries

<!-- COUNTRIES:START -->
<!-- COUNTRIES:END -->

## Safety and disclaimer

- Proxy operators can see and, on plain HTTP, modify your traffic. Never send credentials or anything sensitive through a free proxy.
- These are volunteer/incidental infrastructure, not a service with an SLA. Proxies churn constantly — re-fetch the list before each use rather than caching it.
- Provided as-is, with no warranty. Using a proxy does not exempt you from the target site's terms, GitHub's [Acceptable Use Policies](https://docs.github.com/site-policy/acceptable-use-policies/github-acceptable-use-policies), or local law.
- **Takedown route:** if an IP in this list is yours and you want it removed, open a ["dead proxy" issue](https://github.com/litportnet/free-proxy-list/issues/new?template=dead-proxy.yml) with the IP — we remove it.
- **History policy:** `live` is force-pushed and rewritten every 5 minutes and has no usable history. `main` gets one snapshot commit a day at 04:30 UTC. Pin a release asset (`proxies-YYYY-MM-DD.tar.gz`) if you need a specific date.

## License

Code (this repository's scripts, workflows and templates) is [MIT licensed](LICENSE). The proxy data itself is released under [CC0-1.0](LICENSE-DATA) (public domain) — attribution is appreciated but not required; a link back to [litport.net](https://litport.net/free-proxy) helps others find fresher data.

---

If this list is useful, a star helps other people find it. ⭐
