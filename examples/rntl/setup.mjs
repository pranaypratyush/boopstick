import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const [artifact, expectedSha256, ...extra] = process.argv.slice(2);
if (!artifact || !/^[a-f0-9]{64}$/.test(expectedSha256 ?? '') || extra.length) {
  console.error('Usage: node setup.mjs <boopstick.tgz> <expected-sha256>');
  process.exit(2);
}
const source = resolve(artifact);
const sha256 = createHash('sha256').update(readFileSync(source)).digest('hex');
if (sha256 !== expectedSha256) {
  throw new Error(`Packed artifact SHA-256 mismatch: expected ${expectedSha256}, got ${sha256}`);
}
const cwd = dirname(fileURLToPath(import.meta.url));
for (const args of [
  ['install', '--ignore-scripts', '--frozen-lockfile'],
  ['add', '--ignore-scripts', '--no-save', source],
]) {
  const result = spawnSync('bun', args, { cwd, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
console.log(JSON.stringify({ artifactSha256: sha256, installation: 'local packed artifact; lifecycle scripts disabled' }));
