# STEPS frontend

The existing English STEPS / Stepstoke Open Workshop is connected to the verified Ethereum deployment. Public reads need no wallet. Payments and all real signing stay disabled: all live profiles are NOT_RUN and productionReady is false.

The complete committed production export can be served offline without npm dependencies. Source rebuilding uses the unchanged lockfile and requires the existing development dependencies (`npm ci --prefix frontend` in a networked development clone); dependency caches are not part of this UI delivery. With those dependencies available, run `npm run typecheck --prefix frontend` and `npm run test:unit --prefix frontend`.

The current export is `frontend/production-dist/`; the root `dist/` is inherited history. Build and import the authentic service handoff AFTER building with `node frontend/scripts/production-export.mjs docs/validation/production-ui-v1/integration/deployment-evidence.json`, then run `node frontend/scripts/check-production-export.mjs`. This preserves the frozen Vite configuration while keeping all output inside the authorized frontend path. Rebuilding requires the service's actual `.imd/reads/deployment.json` and `network.json`, public RPC access and the original source Git objects. A build or verification failure must not be published.

Serve the complete current export with `python3 -m http.server 4173 --bind 127.0.0.1 --directory frontend/production-dist` and open `/` (branded introduction), `#/ethereum` (verified live reads) or `#/configuration` (deployment details). Demo/showcase routes return home. No wallet is needed to browse.

The production browser target contains only `tests/e2e/brand-entry.spec.ts`. With Playwright browsers available, run `npm run test:e2e --prefix frontend -- --project chromium-desktop --project chromium-mobile --project chromium-narrow`; set `W1_E2E_REPORT=../docs/validation/production-ui-v1/integration/production-browser.json` to keep the report with current evidence. Historical demo scenarios are archived in `tests/legacy-demo-e2e/`.

Current integration results and publication limits: [integration report](../docs/validation/production-ui-v1/INTEGRATION.md). The pinned [local production UI validation](../docs/validation/production-ui-v1/README.md) and earlier [connection report](../docs/validation/live-connection-v1/README.md) remain historical evidence. No new site URL or CID has been issued in this session.
