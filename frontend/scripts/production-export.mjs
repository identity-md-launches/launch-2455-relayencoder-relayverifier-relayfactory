// Build within the assignment's frontend write budget, then authenticate the actual
// service handoff against public Ethereum. Failure never leaves a publishable handoff.
import { readFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { importDeployment } from '../../tools/import-deployment.mjs';
import { createPublicReadProvider, defaultPublicRpcPolicy } from '../../sdk/public-rpc.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
process.chdir(root);
const evidencePath = process.argv[2];
if (!evidencePath) throw new Error('Usage: node frontend/scripts/production-export.mjs AUTHENTIC_RECEIPT_EVIDENCE');
await rm('frontend/production-dist/imd-deployment.json', { force: true });
execFileSync('npm', ['run', 'typecheck', '--prefix', 'frontend'], { stdio: 'inherit' });
execFileSync(process.execPath, ['node_modules/vite/bin/vite.js', 'build', '--outDir', 'production-dist'], { cwd: root + 'frontend', stdio: 'inherit' });
const release = JSON.parse(await readFile('config/release.json', 'utf8'));
const network = JSON.parse(await readFile('.imd/reads/network.json', 'utf8'));
const transportPolicy = defaultPublicRpcPolicy(network.network.rpcUrls[0]);
const result = await importDeployment({
  evidencePath, dist: 'frontend/production-dist', release, transportPolicy,
  provider: createPublicReadProvider({ rpcUrls: transportPolicy.rpcUrls }),
});
console.log(JSON.stringify({ export: 'frontend/production-dist', launchId: result.launchId, assets: result.assets.length,
  productionReady: false, liveCompatibility: 'NOT_RUN', published: false }));
