import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { compare, canonicalReport } from 'boopstick';
import { hash, digest, modes, references, makeRequest } from './scenario.mjs';

const fields = ['attemptId', 'mode', 'checkpoint', 'state', 'startedAt', 'endedAt', 'generationBefore', 'generationAfter', 'environmentBefore', 'environmentAfter', 'root', 'subjects', 'steady', 'errors'];
const environmentFields = ['density', 'fontScale', 'direction', 'windowWidth', 'windowHeight'];
const subjectKeys = ['body-subject', 'action-subject'];
const exactKeys = (object, keys) => object && typeof object === 'object' && !Array.isArray(object) && isDeepStrictEqual(Object.keys(object).sort(), [...keys].sort());
const finite = value => typeof value === 'number' && Number.isFinite(value);
const rect = value => value === null || (exactKeys(value, ['x', 'y', 'width', 'height']) && Object.values(value).every(finite) && value.width >= 0 && value.height >= 0);
const observedElements = raw => [
  [references.root, raw.root],
  [references.body, raw.subjects.find(subject => subject.key === references.body.key)?.rect ?? null],
  [references.action, raw.subjects.find(subject => subject.key === references.action.key)?.rect ?? null],
].filter(([, observation]) => observation !== null)
  .map(([reference, observation]) => ({ ...reference, frame: 'window', unit: 'dp', spaceId: 'boopstick-window', rect: observation }));

function verifyDriver(driver, raw, directory) {
  assert.equal(driver.attemptId, raw.attemptId); assert.equal(driver.state, raw.state);
  assert.ok(typeof driver.kind === 'string' && driver.kind.length > 0, 'Driver evidence kind');
  assert.ok(Array.isArray(driver.subjectKeys) && new Set(driver.subjectKeys).size === driver.subjectKeys.length, 'No duplicate corroborated keys');
  assert.ok(driver.subjectKeys.every(key => subjectKeys.includes(key)), 'No unknown corroborated keys');
  const ui = driver.uiEvidence;
  assert.ok(ui, 'Actual driver UI file binding required');
  assert.equal(basename(ui.ref), ui.ref);
  const bytes = readFileSync(join(directory, ui.ref));
  assert.equal(hash(bytes), ui.sha256, 'Driver UI file digest');
  const xml = bytes.toString('utf8');
  assert.ok(xml.includes(`text="State: ${raw.state}"`), 'Driver UI state');
  assert.ok(xml.includes(`text="Mode: ${raw.mode}"`), 'Driver UI mode');
  const actualKeys = subjectKeys.filter(key => xml.includes(`resource-id="${key}"`));
  assert.deepEqual(driver.subjectKeys.slice().sort(), actualKeys.sort(), 'Driver UI subject identities');
  // Omitted raw entries are unavailable measurements, not evidence of UI absence.
  // Explicit mounted=false still must agree with the retained UI membership.
  for (const subject of raw.subjects) assert.equal(subject.mounted, actualKeys.includes(subject.key), 'Raw mounted membership matches driver UI');
}

export function validateRaw(raw, attemptId, mode) {
  assert.ok(exactKeys(raw, fields), 'Exact raw field set');
  assert.equal(raw.attemptId, attemptId, 'Current attempt');
  assert.equal(raw.mode, mode, 'Current mode');
  assert.ok(modes.includes(mode));
  assert.equal(raw.checkpoint, 'after-toggle'); assert.equal(raw.state, 'on');
  assert.ok(finite(raw.startedAt) && finite(raw.endedAt) && raw.startedAt >= 0 && raw.endedAt >= raw.startedAt, 'Acquisition timestamps');
  for (const key of ['generationBefore', 'generationAfter']) assert.ok(Number.isSafeInteger(raw[key]) && raw[key] >= 0);
  for (const env of [raw.environmentBefore, raw.environmentAfter]) {
    assert.ok(exactKeys(env, environmentFields));
    assert.ok(['density', 'fontScale', 'windowWidth', 'windowHeight'].every(key => finite(env[key]) && env[key] > 0));
    assert.ok(['ltr', 'rtl'].includes(env.direction));
  }
  assert.ok(rect(raw.root), 'Root callback rectangle');
  // subjects: exact entries, no duplicate/unknown keys; null rectangles and missing
  // measurements are unavailable observations, never zero rectangles.
  assert.ok(Array.isArray(raw.subjects) && raw.subjects.length <= 2, 'Bounded subject entries');
  assert.ok(raw.subjects.every(entry => exactKeys(entry, ['key', 'mounted', 'rect'])), 'Exact subject entry fields');
  const keys = raw.subjects.map(entry => entry.key);
  assert.ok(new Set(keys).size === keys.length && keys.every(key => subjectKeys.includes(key)), 'No duplicate or unknown subject keys');
  for (const entry of raw.subjects) {
    assert.equal(typeof entry.mounted, 'boolean');
    assert.ok(rect(entry.rect), 'Subject callback rectangle');
    assert.ok(entry.mounted || entry.rect === null, 'Unmounted subject cannot carry a rectangle');
  }
  assert.equal(typeof raw.steady, 'boolean');
  assert.ok(Array.isArray(raw.errors) && raw.errors.length <= 8 && raw.errors.every(reason => typeof reason === 'string' && reason.length > 0 && reason.length <= 160));
  if (raw.steady) {
    assert.equal(raw.generationBefore, raw.generationAfter, 'Steady generation');
    assert.deepEqual(raw.environmentBefore, raw.environmentAfter, 'Steady environment');
  }
  return raw;
}

export async function startReceiver({ attemptId, mode, directory, timeoutMs = 20000 }) {
  assert.match(attemptId, /^[A-Za-z0-9_-]{8,96}$/); assert.ok(modes.includes(mode));
  let accepted = false, ended = false, fulfill, reject;
  const events = [];
  const body = new Promise((resolve, fail) => { fulfill = resolve; reject = fail; });
  body.catch(() => {});
  const server = createServer((request, response) => {
    const finish = (status, reason) => { events.push({ status, reason }); response.writeHead(status, { 'content-type': 'text/plain' }); response.end(reason); };
    if (ended || accepted || request.method !== 'POST' || request.url !== `/capture/${attemptId}`) { request.resume(); finish(409, 'wrong-old-duplicate-or-closed-attempt'); return; }
    if (!/^application\/json(?:;|$)/i.test(request.headers['content-type'] ?? '')) { request.resume(); finish(415, 'json-required'); return; }
    let size = 0, overflow = false; const chunks = [];
    request.on('data', chunk => { size += chunk.length; if (size > 65536) { if (!overflow) finish(413, 'body-limit'); overflow = true; } else if (!overflow) chunks.push(chunk); });
    request.on('error', error => events.push({ status: 400, reason: error.code ?? 'request-error' }));
    request.on('end', () => {
      if (overflow) return;
      try {
        assert.ok(!ended && !accepted, 'Attempt still current');
        const bytes = Buffer.concat(chunks);
        const raw = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
        validateRaw(raw, attemptId, mode);
        const ref = `${mode}-raw.json`;
        try {
          writeFileSync(join(directory, ref), bytes, { flag: 'wx' });
          writeFileSync(join(directory, `${mode}-pending.json`), `${JSON.stringify({
            status: 'unqualified', attemptId, mode, receivedAt: new Date().toISOString(),
            rawEvidence: { ref, sha256: hash(bytes) },
          }, null, 2)}\n`, { flag: 'wx' });
        } catch (error) {
          ended = true; clearTimeout(timer); finish(500, 'evidence-write-failed'); reject(error); return;
        }
        accepted = true; clearTimeout(timer); finish(200, 'accepted'); fulfill({ bytes, raw });
      } catch (error) { finish(422, error.message.slice(0, 160)); }
    });
  });
  server.requestTimeout = timeoutMs; server.headersTimeout = Math.min(timeoutMs, 5000);
  await new Promise((resolve, fail) => server.once('error', fail).listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const timer = setTimeout(() => { ended = true; reject(new Error('Capture deadline exceeded')); server.closeAllConnections(); server.close(); }, timeoutMs);
  return { port, body, events, async close() { ended = true; clearTimeout(timer); if (!accepted) reject(new Error('Receiver closed without capture')); server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); } };
}

export function collect({ bytes, binding, attemptId, mode, directory, driver }) {
  const raw = validateRaw(JSON.parse(bytes.toString('utf8')), attemptId, mode);
  const path = `${mode}-raw.json`;
  assert.deepEqual(readFileSync(join(directory, path)), bytes, 'Persisted ingress bytes');
  const request = makeRequest(binding);
  const expectedEnvironment = { ...binding.environment }; delete expectedEnvironment.platform;
  const observedEnvironment = { density: raw.environmentBefore.density, fontScale: raw.environmentBefore.fontScale, direction: raw.environmentBefore.direction };
  assert.deepEqual(observedEnvironment, expectedEnvironment, 'Predeclared device environment');
  assert.ok(observedEnvironment.density >= 1, 'Tolerances assume density >= 1');
  verifyDriver(driver, raw, directory);
  const elements = observedElements(raw);
  const requested = [references.root, references.body, references.action];
  const observedIds = elements.map(element => element.key);
  const observed = requested.filter(reference => observedIds.includes(reference.key));
  const complete = observed.length === requested.length;
  const qualified = raw.steady && raw.errors.length === 0 && complete;
  const capture = {
    schemaVersion: 2, contractVersion: '3.1', captureId: `${binding.runId}:${attemptId}`,
    origin: 'live', provider: 'rn-measure-in-window', collector: binding.collector,
    scenario: { ...request.scenario }, candidate: { buildId: `sha256:${binding.apkSha256}` }, fixture: binding.fixture,
    environment: { platform: binding.environment.platform, ...observedEnvironment },
    epoch: { id: attemptId, startedAt: raw.startedAt, endedAt: raw.endedAt, steady: raw.steady },
    coverage: [{ scope: request.scopes[0].id, requested, observed, complete: qualified, qualified }],
    elements,
    rawEvidence: [{ ref: path, sha256: hash(bytes) }],
  };
  const report = JSON.parse(canonicalReport(compare(request, capture)));
  const receipt = { binding, attemptId, mode, driver, raw, request, capture, report };
  writeFileSync(join(directory, `${mode}-receipt.json`), `${JSON.stringify(receipt, null, 2)}\n`, { flag: 'wx' });
  verifyReceipt(receipt, binding, directory, mode);
  return receipt;
}

export function verifyReceipt(receipt, binding, directory, expectedMode) {
  assert.deepEqual(receipt.binding, binding, 'Current external run/artifact/APK/fixture/collector binding');
  assert.equal(receipt.mode, expectedMode, 'Receipt matches the requested acquisition mode');
  validateRaw(receipt.raw, receipt.attemptId, expectedMode);
  assert.deepEqual(receipt.request, makeRequest(receipt.binding), 'Intact independently authored request');
  verifyDriver(receipt.driver, receipt.raw, directory);
  const capture = receipt.capture;
  assert.equal(capture.origin, 'live'); assert.equal(capture.provider, 'rn-measure-in-window');
  assert.deepEqual(capture.collector, binding.collector); assert.deepEqual(capture.fixture, binding.fixture);
  assert.equal(capture.captureId, `${binding.runId}:${receipt.attemptId}`);
  assert.equal(capture.candidate.buildId, `sha256:${binding.apkSha256}`); assert.deepEqual(capture.scenario, receipt.request.scenario);
  assert.deepEqual(capture.epoch, { id: receipt.attemptId, startedAt: receipt.raw.startedAt, endedAt: receipt.raw.endedAt, steady: receipt.raw.steady });
  assert.equal(capture.rawEvidence.length, 1);
  const ref = capture.rawEvidence[0]; assert.equal(basename(ref.ref), ref.ref); assert.equal(ref.ref, `${receipt.mode}-raw.json`);
  const bytes = readFileSync(join(directory, ref.ref)); assert.equal(hash(bytes), ref.sha256, 'Actual raw file digest');
  assert.deepEqual(JSON.parse(bytes.toString('utf8')), receipt.raw, 'Actual raw file observation');
  assert.deepEqual(capture.elements, observedElements(receipt.raw), 'Capture corresponds to actual callback values');
  assert.deepEqual(capture.environment, { platform: binding.environment.platform, density: receipt.raw.environmentBefore.density, fontScale: receipt.raw.environmentBefore.fontScale, direction: receipt.raw.environmentBefore.direction });
  assert.deepEqual(capture.environment, binding.environment, 'Current device environment');
  assert.equal(receipt.driver.attemptId, receipt.attemptId); assert.equal(receipt.driver.state, 'on');
  const raw = receipt.raw;
  const elements = observedElements(raw);
  const requested = [references.root, references.body, references.action];
  const observedIds = elements.map(element => element.key);
  const observed = requested.filter(reference => observedIds.includes(reference.key));
  const complete = observed.length === requested.length;
  const qualified = raw.steady && raw.errors.length === 0 && complete;
  assert.deepEqual(capture.coverage, [{ scope: makeRequest(binding).scopes[0].id, requested, observed, complete: qualified, qualified }], 'Coverage corresponds to actual finite acquisition');
  assert.ok(capture.environment.density >= 1, 'Tolerances assume density >= 1');
  assert.equal(canonicalReport(compare(receipt.request, capture)), canonicalReport(receipt.report), 'Report matches comparator');
  return digest(receipt);
}
