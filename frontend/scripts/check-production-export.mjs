// Offline checks of the published root export; does not grant deployment/signing authority.
import assert from 'node:assert/strict';
import { readFile, readdir, lstat, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { sha256, keccak256 } from '../../vendor/ethers/ethers.mjs';
import { loadPublicHandoff, canonicalJSON } from '../../sdk/handoff.mjs';
import { validateReleaseState, uiCapabilities } from '../../sdk/gates.mjs';

process.chdir(fileURLToPath(new URL('../../', import.meta.url)));
const output = process.env.STEPS_EXPORT_REPORT_DIR ?? 'docs/validation/production-ui-v1/publish';
const dist = 'dist';
const baseline = 'ea16957ccbd15763a6cb0861023637ff8054c8dc';
const json = async path => JSON.parse(await readFile(path, 'utf8'));
const digest = bytes => sha256(bytes).slice(2);
const release = await json('config/release.json');
const gate = await json('config/production-gate.json');
validateReleaseState(release, gate);
assert.equal(release.productionReady, false);
assert.equal(release.liveCompatibility, 'NOT_RUN');
const config = await loadPublicHandoff({ base: '', fetch: async path => new Response(await readFile(`${dist}/${path}`)) });
const caps = uiCapabilities({ verified: true, config, gate });
assert.equal(caps.read, true);
assert.ok(Object.entries(caps).every(([key, value]) => key === 'read' || value === false));
assert.deepEqual(config.productionGate, gate);
const h = config.handoff;
const actual = await json('.imd/reads/deployment.json');
const network = await json('.imd/reads/network.json');
for (const key of ['launchId', 'chainId', 'sourceCommit', 'attestationHash']) assert.equal(h[key], actual[key]);
assert.equal(canonicalJSON(h.network), canonicalJSON(network.network));
assert.equal(canonicalJSON(h.walletAddChain), canonicalJSON(network.walletAddChain));
for (const c of h.contracts) assert.equal(c.address, actual.contracts.find(a => a.name === c.name).address);
for (const [path, hash] of Object.entries(release.frozenBuild.sources)) assert.equal(keccak256(await readFile(path)), hash, path);
assert.equal(Object.keys(release.frozenBuild.sources).length, 50);

const tracked = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
// Contracts, SDK, ABIs, compiler/release/production-gate configuration, tools, dependency
// manifests/lockfiles and frontend build configuration must equal the official baseline.
// frontend/src/config.ts is site copy: the pinned correction adds three branding constants to it.
const protectedFiles = tracked.filter(p => /^(src|sdk|abi|config|cli|tools|lib|vendor|test-sdk|test)\//.test(p)
  || /^(package(?:-lock)?\.json|foundry\.toml|remappings\.txt|launch\.json)$/.test(p)
  || (/^frontend\/[^/]*(?:config\.[^/]+|package(?:-lock)?\.json)$/.test(p)));
for (const p of protectedFiles) assert.deepEqual(await readFile(p), execFileSync('git', ['show', `${baseline}:${p}`], { maxBuffer: 16 * 1024 * 1024 }), p);

const manifest = await json('docs/validation/production-ui-v1/source-manifest.json');
const deviations = [];
for (const file of manifest.files) {
  const hash = digest(await readFile(file.path));
  if (hash !== file.sha256) deviations.push({ path: file.path, pinned: file.sha256, actual: hash });
}
assert.deepEqual(deviations, []);
assert.equal(digest(await readFile('frontend/public/favicon.svg')), '272911dfd664759ba5b4119bab027ee2b58de89f239f51fc57a67a052d65be3a');
assert.equal(digest(await readFile('frontend/public/og.png')), '59d35760d7f491988d818a211520ed745d76e960f3f6983ff5bfb5829a5ec0df');
const inventory = [];
async function walk(dir, prefix = '') {
  for (const name of (await readdir(dir)).sort()) {
    const path = `${dir}/${name}`, relative = `${prefix}${name}`, stat = await lstat(path);
    assert.ok(!stat.isSymbolicLink(), path);
    if (stat.isDirectory()) await walk(path, `${relative}/`);
    else {
      assert.ok(stat.isFile());
      const raw = await readFile(path);
      assert.ok(!/(?:^|\/)(?:local-config|ethereum-config)\.json$|\.(?:map|tgz)$/.test(relative));
      if (relative.endsWith('.js')) for (const marker of ['fx-branch-1', 'platform.fixture.v1', 'Demo settings', 'Demo failure controls', 'Preview safety lab']) assert.ok(!raw.includes(marker), marker);
      inventory.push({ path: relative, sha256: digest(raw), bytes: raw.length });
    }
  }
}
await walk(dist);
assert.deepEqual(inventory.filter(f => f.path !== 'imd-deployment.json').map(f => f.path).sort(), h.assets.map(a => a.path).sort());
const html = await readFile(`${dist}/index.html`, 'utf8');
assert.ok([...html.matchAll(/(?:src|href)="([^"]+)"/g)].every(m => m[1].startsWith('./')));
assert.match(html, /Build on every step\./);
const result = { checkedAt: new Date().toISOString(), status: 'PASS', exportDirectory: dist,
  baseline, correctionCommit: 'e23d80b674d7a776d29e85caf8e172991ff5f52a',
  manifestMatches: manifest.files.length - deviations.length, manifestEntries: manifest.files.length, deviations,
  protectedFilesUnchanged: protectedFiles.length, frozenSolidityInputsUnchanged: 50,
  contractSourceCommit: h.sourceCommit, launchId: h.launchId, capabilities: caps,
  liveCompatibility: 'NOT_RUN', productionReady: false, productionBundleFixtureScan: 'PASS', inventory,
  publication: { status: 'EXPORT_COMMITTED_SERVICE_PUBLISHES_AFTER_JOB', existingLabel: 'stepstoke.site.identitymd.eth',
    cid: null, note: 'The IMD plane pins the committed dist/ and names it after the job; no CID exists at check time.' } };
await writeFile(`${output}/export.json`, JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ ok: true, exportFiles: inventory.length, manifestMatches: result.manifestMatches,
  protectedFilesUnchanged: protectedFiles.length, capabilities: caps }));
