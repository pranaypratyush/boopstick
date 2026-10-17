import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createHash, randomUUID } from 'node:crypto';
import { closeSync, existsSync, mkdirSync, mkdtempSync, openSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer, connect } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const [artifact, expectedSha256, cache, scope, ...extra] = process.argv.slice(2);
if (!artifact || !/^[a-f0-9]{64}$/.test(expectedSha256 ?? '') || !cache || (scope !== undefined && !['selected', 'full'].includes(scope)) || extra.length) throw new Error('Usage: node qualify.mjs <boopstick.tgz> <sha256> <owned-installed-browser-cache> [selected|full]');
const artifactSha256 = createHash('sha256').update(readFileSync(resolve(artifact))).digest('hex');
assert.equal(artifactSha256, expectedSha256, 'Accepted packed artifact identity');
assert.ok(existsSync(resolve(cache)), 'Install the explicitly owned browser cache first');
const cwd = dirname(fileURLToPath(import.meta.url));
const root = mkdtempSync(join(tmpdir(), 'boopstick-browser-qualification-'));
process.env.BOOPSTICK_RUN_ID = randomUUID();
process.env.BOOPSTICK_ARTIFACT_SHA256 = artifactSha256;
const { allTitles, binding, digest, makeRequest, matrix, metrics, requireCurrent, sourceManifest } = await import('./scenario.mjs');
const { canonicalReport, compare } = await import('boopstick');
const source = sourceManifest();
const save = (path, value) => writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, { flag: 'wx' });
save(join(root, 'pre-execution.json'), { source, declarations: allTitles, matrix, artifactSha256, node: process.version });
const require = createRequire(import.meta.url);
const metadata = JSON.parse(readFileSync(require.resolve('@playwright/test/package.json')));
assert.equal(metadata.version, '1.64.1');
const cli = require.resolve('@playwright/test/cli');

function rows(report) {
  const output = [];
  function visit(suite) {
    for (const spec of suite.specs ?? []) {
      for (const result of spec.tests ?? []) output.push({ id: JSON.stringify([result.projectName, spec.title]), spec, test: result });
    }
    for (const child of suite.suites ?? []) visit(child);
  }
  for (const suite of report.suites ?? []) visit(suite);
  return output;
}
function accept(report, exitCode, expectedIds, invocationRunId, invocationDirectory) {
  assert.equal(exitCode, 0, 'Runner must exit zero');
  assert.deepEqual(report.errors ?? [], [], 'No runner-level errors');
  const actual = rows(report);
  assert.deepEqual(actual.map(row => row.id).sort(), [...expectedIds].sort(), 'Exact declared project/case set without omissions or duplicates');
  const emitted = new Map();
  const rawReferences = [];
  const testsDirectory = join(invocationDirectory, 'tests');
  for (const entry of readdirSync(testsDirectory, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const outputDirectory = join(testsDirectory, entry.name);
    for (const name of readdirSync(outputDirectory).filter(name => name.endsWith('-receipt.json'))) {
      const path = join(outputDirectory, name);
      const receipt = JSON.parse(readFileSync(path));
      const variant = matrix.find(item => item.name === receipt.binding.variant);
      assert.ok(variant, 'Declared receipt variant');
      const checkpoint = receipt.raw.state === 'idle' ? 'blocked-idle' : 'enabled';
      const reference = requireCurrent(receipt, { ...binding(variant.name), runId: invocationRunId, checkpoint }, outputDirectory);
      assert.equal(canonicalReport(compare(receipt.request, receipt.capture)), canonicalReport(receipt.report), 'Every retained report matches its input');
      assert.ok(!emitted.has(receipt.capture.captureId), 'Unique emitted capture identity');
      emitted.set(receipt.capture.captureId, receipt);
      rawReferences.push({ receipt: path, captureId: receipt.capture.captureId, ...reference });
    }
  }
  const receipts = [];
  for (const row of actual) {
    assert.equal(row.test.expectedStatus, 'passed', 'No expected-failure obligation');
    assert.equal(row.test.status, 'expected');
    assert.equal(row.test.results.length, 1, 'No retries');
    const result = row.test.results[0];
    assert.equal(result.status, 'passed');
    assert.deepEqual(result.errors ?? [], []);
    if (!row.spec.title.startsWith('["neutral-browser",')) continue;
    const metric = JSON.parse(row.spec.title)[1];
    assert.ok(metrics.includes(metric));
    const attachments = result.attachments.filter(item => item.name === 'positive' && item.contentType === 'application/json');
    assert.equal(attachments.length, 1, 'Exactly one fresh comparator receipt per executed metric');
    const receipt = JSON.parse(readFileSync(attachments[0].path));
    const variant = matrix.find(item => item.name === row.test.projectName);
    const emittedReceipt = emitted.get(receipt.capture.captureId);
    assert.ok(emittedReceipt, 'Attached receipt has its verified original output context');
    assert.deepEqual(receipt, emittedReceipt, 'Attached receipt matches the disk-verified observation');
    requireCurrent(receipt, { ...binding(variant.name), runId: invocationRunId }, dirname(rawReferences.find(reference => reference.captureId === receipt.capture.captureId).receipt));
    assert.equal(digest(receipt.request), digest(makeRequest(variant)), 'Intact independently declared request');
    assert.equal(canonicalReport(compare(receipt.request, receipt.capture)), canonicalReport(receipt.report), 'Report matches host comparator');
    assert.equal(receipt.report.status, 'pass');
    const outcomes = receipt.report.outcomes.filter(item => item.id === metric);
    assert.equal(outcomes.length, 1);
    assert.equal(outcomes[0].status, 'pass');
    receipts.push({ project: variant.name, metric, captureId: receipt.capture.captureId, rawSha256: receipt.capture.rawEvidence[0].sha256, browserVersion: receipt.browserVersion });
  }
  assert.equal(new Set(receipts.map(item => item.captureId)).size, receipts.length, 'No reused captures');
  return { receipts, rawReferences };
}
async function freePort() {
  const server = createServer();
  await new Promise((resolve, reject) => server.once('error', reject).listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  return port;
}
function alive(pid) {
  try { process.kill(pid, 0); return true; } catch (error) { if (error.code === 'ESRCH') return false; throw error; }
}
async function refused(port) {
  return new Promise((resolve, reject) => {
    const socket = connect({ host: '127.0.0.1', port });
    socket.setTimeout(1000);
    socket.once('connect', () => { socket.destroy(); resolve(false); });
    socket.once('error', error => error.code === 'ECONNREFUSED' ? resolve(true) : reject(error));
    socket.once('timeout', () => { socket.destroy(); reject(new Error('Loopback cleanup probe timed out')); });
  });
}
const summary = { root, artifactSha256, node: process.version, playwright: metadata.version, invocations: [] };
const selected = matrix.flatMap(variant => metrics.map(metric => ({ project: variant.name, metric })));
const selections = scope === 'full' ? [null] : scope === 'selected' ? selected : [null, ...selected];
for (const selection of selections) {
  const label = selection ? `${selection.project}-${selection.metric}-selected` : 'full';
  const directory = join(root, label);
  mkdirSync(directory);
  const invocationRunId = randomUUID();
  const port = await freePort();
  const args = [cli, 'test', '--config=playwright.config.mjs'];
  if (selection) {
    const literal = JSON.stringify(['neutral-browser', selection.metric]);
    args.push(`--project=${selection.project}`, `--grep=${literal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);
  }
  save(join(directory, 'invocation.json'), { label, command: [process.execPath, ...args], runId: invocationRunId, expected: selection ? [JSON.stringify([selection.project, JSON.stringify(['neutral-browser', selection.metric])])] : allTitles, source, port });
  const stdout = openSync(join(directory, 'stdout.log'), 'wx');
  const stderr = openSync(join(directory, 'stderr.log'), 'wx');
  const execution = spawnSync(process.execPath, args, { cwd, env: { ...process.env, DEBUG: 'pw:browser', PLAYWRIGHT_BROWSERS_PATH: resolve(cache), BOOPSTICK_RUN_ID: invocationRunId, BOOPSTICK_OUTPUT_DIR: directory, BOOPSTICK_BROWSER_PORT: String(port) }, stdio: ['ignore', stdout, stderr], timeout: 180000 });
  closeSync(stdout); closeSync(stderr);
  const log = readFileSync(join(directory, 'stderr.log'), 'utf8');
  const browserPids = [...log.matchAll(/<launched> pid=(\d+)/g)].map(match => Number(match[1]));
  const lifecyclePath = join(directory, 'server-lifecycle.jsonl');
  const serverEvents = existsSync(lifecyclePath) ? readFileSync(lifecyclePath, 'utf8').trim().split('\n').map(JSON.parse) : [];
  const ownedPids = [...new Set([...browserPids, ...serverEvents.map(event => event.pid)])];
  const cleanup = { port, loopbackRefused: await refused(port), serverEvents, browserPids, ownedProcesses: ownedPids.map(pid => ({ pid, alive: alive(pid) })) };
  save(join(directory, 'cleanup.json'), cleanup);
  const item = { label, exitCode: execution.status, signal: execution.signal, error: execution.error?.message, cleanup, accepted: false };
  try {
    assert.equal(execution.error, undefined);
    const report = JSON.parse(readFileSync(join(directory, 'runner.json')));
    const expectedIds = selection ? [JSON.stringify([selection.project, JSON.stringify(['neutral-browser', selection.metric])])] : allTitles;
    const accepted = accept(report, execution.status, expectedIds, invocationRunId, directory);
    item.receipts = accepted.receipts;
    item.rawReferences = accepted.rawReferences;
    assert.ok(cleanup.loopbackRefused);
    assert.ok(browserPids.length > 0, 'Actual owned browser launch evidence');
    assert.ok(serverEvents.some(event => event.event === 'closed'), 'Owned server gracefully closed');
    assert.ok(cleanup.ownedProcesses.every(process => !process.alive), 'Owned browser/server PIDs ended');
    const contextEvents = readFileSync(join(directory, 'fixture-lifecycle.jsonl'), 'utf8').trim().split('\n').map(JSON.parse);
    assert.equal(contextEvents.filter(event => event.event === 'context-closed').length, expectedIds.length, 'Each test context closed');
    if (selection) {
      assert.throws(() => accept(report, execution.status, allTitles, invocationRunId, directory), /Exact declared/);
      item.fullAcceptance = 'refused: selected feedback is partial';
    }
    assert.deepEqual(sourceManifest(), source, 'Source unchanged during campaign');
    item.accepted = true;
  } catch (error) {
    item.failure = error.stack;
  }
  summary.invocations.push(item);
  save(join(directory, 'qualification.json'), item);
  writeFileSync(join(root, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
  console.log(JSON.stringify({ directory, label, accepted: item.accepted, exitCode: item.exitCode }));
  if (!item.accepted) { process.exitCode = 1; break; }
}
console.log(`Evidence: ${root}`);
