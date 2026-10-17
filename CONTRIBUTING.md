# Contributing

This repository is generated on a 5-minute cycle by an automated job. A few things follow from
that:

- **Pull requests that change files under `proxies/` are not accepted** — that data is
  regenerated and force-pushed every 5 minutes on `live` (and snapshotted daily on `main`), so a
  manual edit would be overwritten on the next run.
- **Pull requests to `scripts/`, the README template, workflows or templates are welcome**, but
  please open an issue first to discuss the change, since this directory is mirrored from the
  main litport.net monorepo and changes need to be applied there too.
- **Reports of dead proxies** are welcome and useful: open a ["dead proxy"
  issue](.github/ISSUE_TEMPLATE/dead-proxy.yml) with the proxy, protocol, and what you tried to
  reach through it. It gets removed on the next checker pass, and repeat reports help tune the
  checker.
- **New source suggestions** are welcome: open an ["add a
  source"](.github/ISSUE_TEMPLATE/add-source.yml) issue with the list URL, its format, and how
  (if at all) it verifies its own entries.

Thanks for helping keep the list honest.
