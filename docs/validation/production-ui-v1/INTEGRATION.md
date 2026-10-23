# Current scoped integration

Imported the production UI correction from Goderbug/steps-stepstoke at
`e23d80b674d7a776d29e85caf8e172991ff5f52a`, against official website baseline
`ea16957ccbd15763a6cb0861023637ff8054c8dc`. Original application and Joined Steps
assets are IMD work; the reviewed UI integration and demo removal are local Codex
changes. The pinned README, RESULT, manifest, export inventory and screenshots in
this directory remain unmodified historical evidence. Current results are under
`integration/`.

## Scope decisions

- The overriding prohibition on configuration edits wins over exact manifest
  equality. `frontend/src/config.ts` remains byte-identical to the official
  baseline. Its three branding-only additions instead live in `brand/Logo.tsx`.
  The other 96 of 98 manifest entries match exactly. Both exceptions, including
  actual/pinned hashes, are recorded in `integration/export.json`. The symbol
  geometry, custom wordmark, text, layout, colours and brand assets are unchanged
  from the reviewed correction.
- Every public demo/showcase entry and fixture import was removed as pinned.
  Retired routes return home. The six historical browser scenarios were moved to
  `frontend/tests/legacy-demo-e2e/`; they do not run in the production target.
- To preserve the configuration files and the write budget, the new export is
  `frontend/production-dist/`. Root `dist/` remains untouched and must not be used
  for this publication. The frontend preview script serves the new export.
- Dependency versions and both lockfiles are unchanged. The redundant npm
  archive cache and its installer were removed after the upload-size check.
  The complete production export remains available for offline inspection;
  source rebuilding requires the existing development dependencies. No
  node_modules, browser binaries, local wallet data or local configuration is
  delivered.
- Relative runtime and social-image asset URLs retain the reviewed bytes.
  Canonical/absolute social URLs were not guessed: both existing-name gateway
  probes failed TLS negotiation. No X unfurl acceptance is claimed.

## Validation

- TypeScript check and production build passed; all 100 unit tests passed.
- Six production Chromium browser tests passed at 1440, 390 and 320 pixels:
  logo/entry, visible slogan, first-screen Ethereum CTA, retired-route redirects,
  handoff status, closed gates, and zero horizontal overflow. Current screenshots
  and the browser report are included under `integration/`.
- The existing SDK verified the actual service deployment on Ethereum, including
  canonical receipt/block, creation trace, exact creation bytes, constructor
  arguments, historical/latest runtime, factory immutables and getter values.
  A second public RPC operator confirmed canonicality. All 50 frozen Solidity
  inputs and all 280 protected baseline files are unchanged.
- Nineteen actual anonymous browser RPC reads passed with no intercepted routes,
  proxy or wallet. This is a localhost-origin CORS/transport observation, not an
  acceptance of the final hosted origin. See `integration/browser-public-reads.json`.
- The authentic service handoff was imported after the final build, with all
  final assets digest-checked offline. The complete inventory, source exceptions,
  capability results and asset hashes are in `integration/export.json`.
- Built JavaScript contains none of `fx-branch-1`, `platform.fixture.v1`,
  `Demo settings`, `Demo failure controls` or `Preview safety lab`.
- The reviewed favicon SHA-256 is
  `272911dfd664759ba5b4119bab027ee2b58de89f239f51fc57a67a052d65be3a`;
  share PNG SHA-256 is
  `59d35760d7f491988d818a211520ed745d76e960f3f6983ff5bfb5829a5ec0df`.

Chromium's full browser initially failed in its crash handler. The installed
headless Chromium completed all final checks. Unit tests emitted pre-existing
missing sourcemap warnings; the build emitted the existing mixed static/dynamic
SDK import warning. Neither prevented completion. Offline installation was
tested, followed by a new successful typecheck/build/authentic-handoff import.

## Publication limits

**Not published in this session.** No official GitHub/IPFS/ENS publishing tool was
available. The working repository's service-controlled Git metadata was left
untouched. Consequently there is no resulting website commit or new CID to
report. The correction commit above identifies the imported source, not a new
publication. The service must publish `frontend/production-dist/` under the same
`stepstoke.site.identitymd.eth` label and then independently inspect that host.
HTTPS probes to both its eth.limo and eth.link forms failed TLS negotiation, so
neither current hosting availability nor an updated public host is asserted.

Launch remains `cad0c789-2611-4392-bec0-456cb8e57d2c`, contract source remains
`751f3901d4453e1477828e4f7ef0d6af8bc03485`, transaction remains
`0x6377bb6862896730e68c455685bd057d87ddeafca57633370df20c196479bad6`,
block remains 26248821. No contract, SDK, ABI, dependency version, release gate,
compiler setting or deployment address changed. `productionReady=false`,
`liveCompatibility=NOT_RUN`; only reads are available. No new deployment,
funded test, signing, social post or hackathon submission occurred.

## Upload-size repair

The initial source bundle exceeded the 8 MiB upload limit because it included
43 MiB of redundant npm registry archives. Removed only that build cache and
its dedicated installer, and corrected the current installation documentation.
The earlier offline-install log records a historical check, not a capability
of this reduced delivery. All reviewed source, branding, browser scenarios,
validation evidence and the complete authenticated production export remain.
No dependency manifests, lockfiles, configuration or runtime asset bytes changed
in this repair. See `integration/bundle-repair.json` for size and recheck results.
