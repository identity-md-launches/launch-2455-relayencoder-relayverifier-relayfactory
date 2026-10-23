// Build the published root dist/ with the unchanged Vite configuration, then authenticate the
// actual service handoff against public Ethereum. Failure never leaves a publishable handoff.
import { readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { importDeployment } from '../../tools/import-deployment.mjs';
import { createPublicReadProvider, defaultPublicRpcPolicy } from '../../sdk/public-rpc.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
process.chdir(root);
const evidencePath = process.argv[2];
if (!evidencePath) throw new Error('Usage: node frontend/scripts/production-export.mjs AUTHENTIC_RECEIPT_EVIDENCE');
// The receipt evidence may live inside dist/, which the build empties: hold its bytes first.
const evidence = await readFile(evidencePath);
const held = `${process.env.TMPDIR ?? '/tmp'}/steps-deployment-evidence.json`;
await writeFile(held, evidence);
await rm('dist/imd-deployment.json', { force: true });
// typecheck + vite build (outDir ../dist, base ./)
execFileSync('npm', ['run', 'build', '--prefix', 'frontend'], { stdio: 'inherit' });
const release = JSON.parse(await readFile('config/release.json', 'utf8'));
const network = JSON.parse(await readFile('.imd/reads/network.json', 'utf8'));
const transportPolicy = defaultPublicRpcPolicy(network.network.rpcUrls[0]);
const result = await importDeployment({
  evidencePath: held, dist: 'dist', release, transportPolicy,
  provider: createPublicReadProvider({ rpcUrls: transportPolicy.rpcUrls }),
});
console.log(JSON.stringify({ export: 'dist', launchId: result.launchId, assets: result.assets.length,
  rpcUrls: transportPolicy.rpcUrls, productionReady: false, liveCompatibility: 'NOT_RUN' }));
