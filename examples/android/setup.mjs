import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const [artifact, sha256, receipt, ...extra] = process.argv.slice(2);
if (!artifact || !/^[a-f0-9]{64}$/.test(sha256 ?? '') || !receipt || extra.length) throw new Error('Usage: node setup.mjs <accepted.tgz> <sha256> <private-receipt.json>');
assert.equal(createHash('sha256').update(readFileSync(resolve(artifact))).digest('hex'), sha256, 'Accepted archive');
assert.equal(process.version, 'v24.21.0');
const bun = spawnSync('bun', ['--version'], { encoding: 'utf8', timeout: 10000 });
assert.equal(bun.error, undefined); assert.equal(bun.status, 0); assert.equal(bun.stdout.trim(), '1.4.3');
const cwd = dirname(fileURLToPath(import.meta.url));
for (const args of [['install', '--ignore-scripts', '--frozen-lockfile'], ['add', '--ignore-scripts', '--no-save', resolve(artifact)]]) {
  const result = spawnSync('bun', args, { cwd, stdio: 'inherit', timeout: 120000 });
  assert.equal(result.error, undefined); assert.equal(result.status, 0, 'Bun optional-example setup');
}
const require = createRequire(import.meta.url);
assert.equal(JSON.parse(readFileSync(require.resolve('vitest/package.json'))).version, '5.0.5');
assert.equal(JSON.parse(readFileSync(require.resolve('vite/package.json'))).version, '8.3.4');
const entry = fileURLToPath(import.meta.resolve('boopstick'));
assert.ok(entry.includes('/node_modules/boopstick/'), 'External packed consumer, not source import');
writeFileSync(resolve(receipt), `${JSON.stringify({ artifact: resolve(artifact), sha256, node: process.version, bun: bun.stdout.trim(), entry, entrySha256: createHash('sha256').update(readFileSync(entry)).digest('hex'), lifecycleScripts: false, unsaved: true }, null, 2)}\n`, { flag: 'wx' });
