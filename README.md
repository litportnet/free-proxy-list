# Free proxy list by Litport

The repository is initialized. Verified downloads will appear on the `live` branch after the first successful publish.

Until then, use the [free proxy API](https://litport.net/docs/free-proxy-api). The [JavaScript and Python SDK](https://github.com/litportnet/free-proxy-sdk) shares the same data contract.

## For developers and coding agents

Use the [snapshot API](https://litport.net/api/free-proxy/snapshot?checkedWithinMin=30) for a machine-readable JSON envelope with `generatedAt`, `count`, `totalCount`, `truncated`, and `proxies`. Reject truncated snapshots when you need a complete list, and check each proxy’s timestamp before use. The [API contract](https://litport.net/docs/free-proxy-api) and [repository schema](SCHEMA.md) describe their respective field names.

For application integration, the [JavaScript, TypeScript and Python SDK](https://github.com/litportnet/free-proxy-sdk) provides filtering and selection plus a CLI with JSON, CSV and TXT output. These lists supply proxy addresses; your HTTP client or browser must be configured to use the selected proxy.

