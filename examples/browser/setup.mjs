import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const [artifact, expectedSha256, cache, receipt, ...extra] = process.argv.slice(2);
if (!artifact || !/^[a-f0-9]{64}$/.test(expectedSha256 ?? '') || !cache || !receipt || extra.length) throw new Error('Usage: node setup.mjs <boopstick.tgz> <sha256> <owned-empty-browser-cache> <private-setup-receipt.json>');
const cwd = dirname(fileURLToPath(import.meta.url));
const sha256 = createHash('sha256').update(readFileSync(resolve(artifact))).digest('hex');
if (sha256 !== expectedSha256) throw new Error('Packed artifact SHA-256 mismatch');
if (existsSync(resolve(cache))) throw new Error('Browser-cache destination must not already exist');
function run(command, args, env = process.env) {
  const result = spawnSync(command, args, { cwd, env, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
run('bun', ['install', '--ignore-scripts', ...(existsSync(join(cwd, 'bun.lock')) ? ['--frozen-lockfile'] : [])]);
run('bun', ['add', '--ignore-scripts', '--no-save', resolve(artifact)]);
const require = createRequire(import.meta.url);
const packageVersion = JSON.parse(readFileSync(require.resolve('@playwright/test/package.json'))).version;
const coreDir = dirname(require.resolve('playwright-core/package.json'));
const browsers = JSON.parse(readFileSync(join(coreDir, 'browsers.json'))).browsers;
const shell = browsers.find(browser => browser.name === 'chromium-headless-shell');
if (packageVersion !== '1.64.1' || shell.revision !== '1248' || shell.browserVersion !== '156.0.8078.4') throw new Error('Pinned Playwright/browser metadata mismatch');
const metadata = { node: process.version, artifactSha256: sha256, playwright: packageVersion, browser: shell, lifecycleScripts: false };
writeFileSync(resolve(receipt), `${JSON.stringify(metadata, null, 2)}\n`, { flag: 'wx' });
run(process.execPath, [require.resolve('@playwright/test/cli'), 'install', 'chromium', '--only-shell'], { ...process.env, PLAYWRIGHT_BROWSERS_PATH: resolve(cache) });
console.log(JSON.stringify({ ...metadata, installation: 'owned browser cache; no system dependency installation' }));
