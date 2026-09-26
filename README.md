[![Litport free proxies: latest published counts, protocol chart, API and SDKs](https://raw.githubusercontent.com/litportnet/free-proxy-list/live/proxies/banner.svg)](https://litport.net/free-proxy)

# Free proxy list by litport

[Browse the live Litport free proxy list](https://litport.net/free-proxy).

Free HTTP, SOCKS4 and SOCKS5 proxies, re-checked every few minutes, with latency, uptime, anonymity and country for every proxy. The lists in this repository refresh every 5 minutes and mirror the litport.net free proxy list and API.

<!-- STATS:START -->
**The proxy files refresh every 5 minutes on the [`live`](https://github.com/litportnet/free-proxy-list/tree/live) branch, and every download link on this page points there.**

This page is the daily snapshot taken at 2026-09-26 04:34 UTC: 3377 working proxies from 103 countries, each checked within the 30 minutes before it was taken. Its prose is fixed until the next daily snapshot, so use the counts in the table below — they are read live from the `live` branch and update with the files.
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
| List | Count (live) | .txt | .json | .csv | Browse online |
|---|---|---|---|---|---|
| All | ![total](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Flitportnet%2Ffree-proxy-list%2Flive%2Fproxies%2Fbadges%2Ftotal.json) | [.txt](https://raw.githubusercontent.com/litportnet/free-proxy-list/live/proxies/all.txt) | [.json](https://raw.githubusercontent.com/litportnet/free-proxy-list/live/proxies/all.json) | [.csv](https://raw.githubusercontent.com/litportnet/free-proxy-list/live/proxies/all.csv) | [View All proxies](https://litport.net/free-proxy?utm_source=github&utm_medium=repo&utm_campaign=free-proxy-list&utm_content=table-all&checkedWithinMin=30) |
| HTTP | ![http](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Flitportnet%2Ffree-proxy-list%2Flive%2Fproxies%2Fbadges%2Fhttp.json) | [.txt](https://raw.githubusercontent.com/litportnet/free-proxy-list/live/proxies/http.txt) | [.json](https://raw.githubusercontent.com/litportnet/free-proxy-list/live/proxies/http.json) | [.csv](https://raw.githubusercontent.com/litportnet/free-proxy-list/live/proxies/http.csv) | [View HTTP proxies](https://litport.net/free-proxy?utm_source=github&utm_medium=repo&utm_campaign=free-proxy-list&utm_content=table-http&protocol=http&checkedWithinMin=30) |
| HTTPS (CONNECT) | ![https](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Flitportnet%2Ffree-proxy-list%2Flive%2Fproxies%2Fbadges%2Fhttps.json) | [.txt](https://raw.githubusercontent.com/litportnet/free-proxy-list/live/proxies/https.txt) | [.json](https://raw.githubusercontent.com/litportnet/free-proxy-list/live/proxies/https.json) | [.csv](https://raw.githubusercontent.com/litportnet/free-proxy-list/live/proxies/https.csv) | [View HTTPS (CONNECT) proxies](https://litport.net/free-proxy?utm_source=github&utm_medium=repo&utm_campaign=free-proxy-list&utm_content=table-https&list=https&checkedWithinMin=30) |
| SOCKS4 | ![socks4](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Flitportnet%2Ffree-proxy-list%2Flive%2Fproxies%2Fbadges%2Fsocks4.json) | [.txt](https://raw.githubusercontent.com/litportnet/free-proxy-list/live/proxies/socks4.txt) | [.json](https://raw.githubusercontent.com/litportnet/free-proxy-list/live/proxies/socks4.json) | [.csv](https://raw.githubusercontent.com/litportnet/free-proxy-list/live/proxies/socks4.csv) | [View SOCKS4 proxies](https://litport.net/free-proxy?utm_source=github&utm_medium=repo&utm_campaign=free-proxy-list&utm_content=table-socks4&protocol=socks4&checkedWithinMin=30) |
| SOCKS5 | ![socks5](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Flitportnet%2Ffree-proxy-list%2Flive%2Fproxies%2Fbadges%2Fsocks5.json) | [.txt](https://raw.githubusercontent.com/litportnet/free-proxy-list/live/proxies/socks5.txt) | [.json](https://raw.githubusercontent.com/litportnet/free-proxy-list/live/proxies/socks5.json) | [.csv](https://raw.githubusercontent.com/litportnet/free-proxy-list/live/proxies/socks5.csv) | [View SOCKS5 proxies](https://litport.net/free-proxy?utm_source=github&utm_medium=repo&utm_campaign=free-proxy-list&utm_content=table-socks5&protocol=socks5&checkedWithinMin=30) |
| Fast (<1 s) | ![fast](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Flitportnet%2Ffree-proxy-list%2Flive%2Fproxies%2Fbadges%2Ffast.json) | [.txt](https://raw.githubusercontent.com/litportnet/free-proxy-list/live/proxies/fast.txt) | [.json](https://raw.githubusercontent.com/litportnet/free-proxy-list/live/proxies/fast.json) | [.csv](https://raw.githubusercontent.com/litportnet/free-proxy-list/live/proxies/fast.csv) | [View Fast (<1 s) proxies](https://litport.net/free-proxy?utm_source=github&utm_medium=repo&utm_campaign=free-proxy-list&utm_content=table-fast&list=fast&checkedWithinMin=30) |
| Stable (7-day uptime ≥ 90%) | ![stable](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Flitportnet%2Ffree-proxy-list%2Flive%2Fproxies%2Fbadges%2Fstable.json) | [.txt](https://raw.githubusercontent.com/litportnet/free-proxy-list/live/proxies/stable.txt) | [.json](https://raw.githubusercontent.com/litportnet/free-proxy-list/live/proxies/stable.json) | [.csv](https://raw.githubusercontent.com/litportnet/free-proxy-list/live/proxies/stable.csv) | [View Stable (7-day uptime ≥ 90%) proxies](https://litport.net/free-proxy?utm_source=github&utm_medium=repo&utm_campaign=free-proxy-list&utm_content=table-stable&list=stable&checkedWithinMin=30) |
| Anonymous+Elite | ![anonymous](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Flitportnet%2Ffree-proxy-list%2Flive%2Fproxies%2Fbadges%2Fanonymous.json) | [.txt](https://raw.githubusercontent.com/litportnet/free-proxy-list/live/proxies/anonymous.txt) | [.json](https://raw.githubusercontent.com/litportnet/free-proxy-list/live/proxies/anonymous.json) | [.csv](https://raw.githubusercontent.com/litportnet/free-proxy-list/live/proxies/anonymous.csv) | [View Anonymous+Elite proxies](https://litport.net/free-proxy?utm_source=github&utm_medium=repo&utm_campaign=free-proxy-list&utm_content=table-anonymous&list=anonymous&checkedWithinMin=30) |
| United States | ![countries/us](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Flitportnet%2Ffree-proxy-list%2Flive%2Fproxies%2Fbadges%2Fcountries%2Fus.json) | [.txt](https://raw.githubusercontent.com/litportnet/free-proxy-list/live/proxies/countries/us/all.txt) | [.json](https://raw.githubusercontent.com/litportnet/free-proxy-list/live/proxies/countries/us/all.json) | [.csv](https://raw.githubusercontent.com/litportnet/free-proxy-list/live/proxies/countries/us/all.csv) | [View United States proxies](https://litport.net/free-proxy?utm_source=github&utm_medium=repo&utm_campaign=free-proxy-list&utm_content=table-us&country=us&checkedWithinMin=30) |
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
- **HTTP verification endpoint:** HTTP verification endpoint through the proxy
- **Attempts:** 2 (10 s, 5 s) for proxies seen alive before, 1 (8 s) for new candidates
- **Pass criterion:** 2xx response with a JSON body containing a public IPv4 exit address
- **Anonymity method:** response headers echoed by the verification endpoint are scanned for the checker's IP (transparent) and for Via/X-Forwarded-For/Forwarded/Proxy-Connection (anonymous); neither = elite; no headers block = unknown
- **HTTPS method:** HTTPS request to the verification endpoint through the proxy with certificate verification
- **Re-check cadence:** every ~10 minutes while alive
- **Publish gate:** alive and checked within max_age_min
- **Uptime:** share of checks that succeeded in the trailing 24 h / 7 d; uptime_7d is null under 50 checks
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

Free proxies are shared, unauthenticated and can disappear mid-session. Use them only for short, low-stakes testing. **Never trust a free proxy with credentials, API keys, cookies, personal data, payment data, or other sensitive information.** For real work, choose [affordable Litport proxies](https://litport.net/?utm_source=github&utm_medium=repo&utm_campaign=free-proxy-list&utm_content=cta).

## FAQ

**Is using a proxy list legal?** Proxies themselves are legal in most jurisdictions. What you do through one can still break a law or a site's terms — the proxy does not change that. Follow the target site's rules and your local law.

**What is a proxy list used for?** Web scraping, ad verification, geo-testing, QA against region-locked content and general traffic anonymization are the common uses. A free list is best for short, low-stakes tasks.

**How do I check a proxy list?** Send a real request through each entry to a known HTTP verification endpoint and require a valid response within a timeout; see "How we check" above for the exact method this repository uses.

**Why do free proxies stop working?** Most are open by accident (misconfigured devices, forgotten test servers) or run by volunteers with no SLA. Operators reboot, ISPs reassign IPs, and abuse gets addresses blocked — turnover is normal, which is why this list re-checks every proxy instead of publishing once.

**HTTP vs HTTPS vs SOCKS — what's the difference?** HTTP proxies forward plain HTTP requests and can also tunnel HTTPS via `CONNECT` (that's what `https: true` means here). SOCKS4/SOCKS5 work at a lower level and can carry any TCP traffic; SOCKS5 additionally supports UDP and authentication.

## All countries

<!-- COUNTRIES:START -->
<details><summary>All countries (103)</summary>

| Country | Count | Link |
|---|---|---|
| us | 968 | [all.txt](proxies/countries/us/all.txt) |
| id | 456 | [all.txt](proxies/countries/id/all.txt) |
| fr | 201 | [all.txt](proxies/countries/fr/all.txt) |
| sg | 151 | [all.txt](proxies/countries/sg/all.txt) |
| in | 100 | [all.txt](proxies/countries/in/all.txt) |
| nl | 97 | [all.txt](proxies/countries/nl/all.txt) |
| br | 97 | [all.txt](proxies/countries/br/all.txt) |
| de | 95 | [all.txt](proxies/countries/de/all.txt) |
| ru | 90 | [all.txt](proxies/countries/ru/all.txt) |
| co | 74 | [all.txt](proxies/countries/co/all.txt) |
| vn | 60 | [all.txt](proxies/countries/vn/all.txt) |
| bd | 57 | [all.txt](proxies/countries/bd/all.txt) |
| ph | 56 | [all.txt](proxies/countries/ph/all.txt) |
| mx | 53 | [all.txt](proxies/countries/mx/all.txt) |
| ve | 38 | [all.txt](proxies/countries/ve/all.txt) |
| cn | 37 | [all.txt](proxies/countries/cn/all.txt) |
| hk | 36 | [all.txt](proxies/countries/hk/all.txt) |
| th | 36 | [all.txt](proxies/countries/th/all.txt) |
| gb | 30 | [all.txt](proxies/countries/gb/all.txt) |
| bg | 27 | [all.txt](proxies/countries/bg/all.txt) |
| es | 26 | [all.txt](proxies/countries/es/all.txt) |
| zw | 25 | [all.txt](proxies/countries/zw/all.txt) |
| ar | 25 | [all.txt](proxies/countries/ar/all.txt) |
| tr | 24 | [all.txt](proxies/countries/tr/all.txt) |
| ec | 24 | [all.txt](proxies/countries/ec/all.txt) |
| za | 24 | [all.txt](proxies/countries/za/all.txt) |
| fi | 23 | [all.txt](proxies/countries/fi/all.txt) |
| kh | 23 | [all.txt](proxies/countries/kh/all.txt) |
| jp | 22 | [all.txt](proxies/countries/jp/all.txt) |
| kr | 19 | [all.txt](proxies/countries/kr/all.txt) |
| au | 19 | [all.txt](proxies/countries/au/all.txt) |
| ua | 18 | [all.txt](proxies/countries/ua/all.txt) |
| eg | 16 | [all.txt](proxies/countries/eg/all.txt) |
| cl | 16 | [all.txt](proxies/countries/cl/all.txt) |
| ca | 15 | [all.txt](proxies/countries/ca/all.txt) |
| ir | 15 | [all.txt](proxies/countries/ir/all.txt) |
| bi | 15 | [all.txt](proxies/countries/bi/all.txt) |
| my | 13 | [all.txt](proxies/countries/my/all.txt) |
| il | 13 | [all.txt](proxies/countries/il/all.txt) |
| sy | 12 | [all.txt](proxies/countries/sy/all.txt) |
| pk | 12 | [all.txt](proxies/countries/pk/all.txt) |
| se | 11 | [all.txt](proxies/countries/se/all.txt) |
| ke | 11 | [all.txt](proxies/countries/ke/all.txt) |
| ml | 11 | [all.txt](proxies/countries/ml/all.txt) |
| pe | 10 | [all.txt](proxies/countries/pe/all.txt) |
| do | 9 | [all.txt](proxies/countries/do/all.txt) |
| ch | 8 | [all.txt](proxies/countries/ch/all.txt) |
| at | 8 | [all.txt](proxies/countries/at/all.txt) |
| cz | 7 | [all.txt](proxies/countries/cz/all.txt) |
| rs | 7 | [all.txt](proxies/countries/rs/all.txt) |
| lt | 7 | [all.txt](proxies/countries/lt/all.txt) |
| pl | 6 | [all.txt](proxies/countries/pl/all.txt) |
| hn | 6 | [all.txt](proxies/countries/hn/all.txt) |
| np | 6 | [all.txt](proxies/countries/np/all.txt) |
| it | 6 | [all.txt](proxies/countries/it/all.txt) |
| rw | 5 | [all.txt](proxies/countries/rw/all.txt) |
| ro | 5 | [all.txt](proxies/countries/ro/all.txt) |
| ee | 5 | [all.txt](proxies/countries/ee/all.txt) |
| gt | 5 | [all.txt](proxies/countries/gt/all.txt) |
| iq | 4 | [all.txt](proxies/countries/iq/all.txt) |
| bo | 4 | [all.txt](proxies/countries/bo/all.txt) |
| ng | 4 | [all.txt](proxies/countries/ng/all.txt) |
| mn | 4 | [all.txt](proxies/countries/mn/all.txt) |
| lv | 4 | [all.txt](proxies/countries/lv/all.txt) |
| pr | 4 | [all.txt](proxies/countries/pr/all.txt) |
| ly | 4 | [all.txt](proxies/countries/ly/all.txt) |
| gh | 3 | [all.txt](proxies/countries/gh/all.txt) |
| bw | 3 | [all.txt](proxies/countries/bw/all.txt) |
| py | 3 | [all.txt](proxies/countries/py/all.txt) |
| cy | 2 | [all.txt](proxies/countries/cy/all.txt) |
| ae | 2 | [all.txt](proxies/countries/ae/all.txt) |
| ma | 2 | [all.txt](proxies/countries/ma/all.txt) |
| ug | 2 | [all.txt](proxies/countries/ug/all.txt) |
| hr | 2 | [all.txt](proxies/countries/hr/all.txt) |
| al | 2 | [all.txt](proxies/countries/al/all.txt) |
| sk | 2 | [all.txt](proxies/countries/sk/all.txt) |
| gr | 2 | [all.txt](proxies/countries/gr/all.txt) |
| tw | 2 | [all.txt](proxies/countries/tw/all.txt) |
| am | 2 | [all.txt](proxies/countries/am/all.txt) |
| ss | 2 | [all.txt](proxies/countries/ss/all.txt) |
| mm | 2 | [all.txt](proxies/countries/mm/all.txt) |
| ge | 2 | [all.txt](proxies/countries/ge/all.txt) |
| no | 2 | [all.txt](proxies/countries/no/all.txt) |
| ie | 2 | [all.txt](proxies/countries/ie/all.txt) |
| uz | 1 | [all.txt](proxies/countries/uz/all.txt) |
| sa | 1 | [all.txt](proxies/countries/sa/all.txt) |
| mk | 1 | [all.txt](proxies/countries/mk/all.txt) |
| lb | 1 | [all.txt](proxies/countries/lb/all.txt) |
| me | 1 | [all.txt](proxies/countries/me/all.txt) |
| dk | 1 | [all.txt](proxies/countries/dk/all.txt) |
| bm | 1 | [all.txt](proxies/countries/bm/all.txt) |
| uy | 1 | [all.txt](proxies/countries/uy/all.txt) |
| hu | 1 | [all.txt](proxies/countries/hu/all.txt) |
| mw | 1 | [all.txt](proxies/countries/mw/all.txt) |
| cm | 1 | [all.txt](proxies/countries/cm/all.txt) |
| ps | 1 | [all.txt](proxies/countries/ps/all.txt) |
| kg | 1 | [all.txt](proxies/countries/kg/all.txt) |
| af | 1 | [all.txt](proxies/countries/af/all.txt) |
| bj | 1 | [all.txt](proxies/countries/bj/all.txt) |
| la | 1 | [all.txt](proxies/countries/la/all.txt) |
| xk | 1 | [all.txt](proxies/countries/xk/all.txt) |
| et | 1 | [all.txt](proxies/countries/et/all.txt) |
| be | 1 | [all.txt](proxies/countries/be/all.txt) |

</details>
<!-- COUNTRIES:END -->

## Safety and disclaimer

- Proxy operators can see and, on plain HTTP, modify your traffic. **Never trust a free proxy with credentials, API keys, cookies, personal data, payment data, or other sensitive information.**
- These are volunteer/incidental infrastructure, not a service with an SLA. Proxies churn constantly — re-fetch the list before each use rather than caching it.
- Provided as-is, with no warranty. Using a proxy does not exempt you from the target site's terms, GitHub's [Acceptable Use Policies](https://docs.github.com/site-policy/acceptable-use-policies/github-acceptable-use-policies), or local law.
- **Takedown route:** if an IP in this list is yours and you want it removed, open a ["dead proxy" issue](https://github.com/litportnet/free-proxy-list/issues/new?template=dead-proxy.yml) with the IP — we remove it.
- **History policy:** `live` is force-pushed and rewritten every 5 minutes and has no usable history. `main` gets one snapshot commit a day at 04:30 UTC. Pin a release asset (`proxies-YYYY-MM-DD.tar.gz`) if you need a specific date.

## License

Code (this repository's scripts, workflows and templates) is [MIT licensed](LICENSE). The proxy data itself is released under [CC0-1.0](LICENSE-DATA) (public domain) — attribution is appreciated but not required; a link back to [litport.net](https://litport.net/free-proxy) helps others find fresher data.

---

If this list is useful, a star helps other people find it. ⭐
