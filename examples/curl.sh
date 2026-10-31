#!/usr/bin/env bash
# Download the lists and use the first (best) proxy of each protocol.
# https://github.com/litportnet/free-proxy-list
set -euo pipefail

BASE="https://raw.githubusercontent.com/litportnet/free-proxy-list/live"

curl -fsSL --max-time 10 "$BASE/proxies/all.txt" -o all.txt
curl -fsSL --max-time 10 "$BASE/proxies/http.txt" -o http.txt
curl -fsSL --max-time 10 "$BASE/proxies/socks5.txt" -o socks5.txt

best_http=$(head -1 http.txt)
best_socks5=$(head -1 socks5.txt)

echo "best http proxy:   $best_http"
echo "best socks5 proxy: $best_socks5"

# Fail fast instead of hanging on a dead proxy.
curl --fail --max-time 10 --proxy "http://${best_http}" https://example.com -o /dev/null -s \
  && echo "http proxy works" || echo "http proxy failed, pick another one from http.txt"

# socks5h resolves DNS through the proxy, not locally.
curl --fail --max-time 10 --proxy "socks5h://${best_socks5}" https://example.com -o /dev/null -s \
  && echo "socks5 proxy works" || echo "socks5 proxy failed, pick another one from socks5.txt"
