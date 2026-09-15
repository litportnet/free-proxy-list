#!/usr/bin/env python3
"""Load the richer JSON list and use the first (best) entry through `requests`.

https://github.com/litportnet/free-proxy-list
"""
import requests

ALL_JSON = "https://raw.githubusercontent.com/litportnet/free-proxy-list/live/proxies/all.json"


def main():
    proxies = requests.get(ALL_JSON, timeout=10).json()
    if not proxies:
        raise SystemExit("no proxies published right now, try again shortly")

    best = proxies[0]
    print(f"best proxy: {best['url']} ({best['country']}, {best['latency_ms']}ms, "
          f"uptime_7d={best['uptime_7d']})")

    proxy_url = best["url"]
    resp = requests.get(
        "https://example.com",
        proxies={"http": proxy_url, "https": proxy_url},
        timeout=10,
    )
    print(f"through the proxy: HTTP {resp.status_code}")


if __name__ == "__main__":
    main()
