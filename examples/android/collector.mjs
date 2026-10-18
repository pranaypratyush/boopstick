import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { compare, canonicalReport } from 'boopstick';
import { hash, digest, modes, policy, reference, makeRequest } from './scenario.mjs';

const fields = ['attemptId', 'mode', 'checkpoint', 'state', 'startedAt', 'endedAt', 'generationBefore', 'generationAfter', 'environmentBefore', 'environmentAfter', 'root', 'subject', 'subjectMounted', 'steady', 'errors'];
const environmentFields = ['density', 'fontScale', 'direction', 'windowWidth', 'windowHeight'];
const exactKeys = (object, keys) => object && typeof object === 'object' && !Array.isArray(object) && isDeepStrictEqual(Object.keys(object).sort(), [...keys].sort());
const finite = value => typeof value === 'number' && Number.isFinite(value);
const rect = value => value === null || (exactKeys(value, ['x', 'y', 'width', 'height']) && Object.values(value).every(finite) && value.width >= 0 && value.height >= 0);
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
  assert.ok(rect(raw.root) && rect(raw.subject), 'Finite callback rectangles');
  assert.equal(typeof raw.subjectMounted, 'boolean'); assert.equal(typeof raw.steady, 'boolean');
  assert.ok(Array.isArray(raw.errors) && raw.errors.length <= 8 && raw.errors.every(reason => typeof reason === 'string' && reason.length > 0 && reason.length <= 160));
  if (raw.steady) {
    assert.equal(raw.generationBefore, raw.generationAfter, 'Steady generation');
    assert.deepEqual(raw.environmentBefore, raw.environmentAfter, 'Steady environment');
    assert.ok(raw.root, 'Steady root callback');
  }
  if (mode === 'absent') assert.equal(raw.subjectMounted, false);
  else assert.equal(raw.subjectMounted, true);
  if (mode === 'missing' || mode === 'absent') assert.equal(raw.subject, null);
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
  const request = makeRequest(binding, mode === 'absent');
  const expectedEnvironment = { ...binding.environment }; delete expectedEnvironment.platform;
  const observedEnvironment = { density: raw.environmentBefore.density, fontScale: raw.environmentBefore.fontScale, direction: raw.environmentBefore.direction };
  assert.deepEqual(observedEnvironment, expectedEnvironment, 'Predeclared device environment');
  assert.ok(observedEnvironment.density >= 1, '0.5dp policy assumes density >= 1');
  if (raw.root && raw.subject) assert.ok(Math.abs(raw.subject.x - raw.root.x - policy.leftPadding) <= policy.tolerance, 'Window-relative authored left padding');
  assert.equal(driver.attemptId, attemptId); assert.equal(driver.state, 'on');
  const qualified = raw.steady && raw.errors.length === 0 && raw.root !== null
    && ((raw.subjectMounted && raw.subject !== null) || (mode === 'absent' && driver.subjectAbsent === true));
  const capture = {
    schemaVersion: 2, contractVersion: '3.1', captureId: `${binding.runId}:${attemptId}`,
    origin: 'live', provider: 'rn-measure-in-window', collector: binding.collector,
    scenario: { ...request.scenario }, candidate: { buildId: `sha256:${binding.apkSha256}` }, fixture: binding.fixture,
    environment: { platform: binding.environment.platform, ...observedEnvironment },
    epoch: { id: attemptId, startedAt: raw.startedAt, endedAt: raw.endedAt, steady: raw.steady },
    coverage: [{ scope: 'subject-scope', requested: [reference], observed: raw.subject ? [reference] : [], complete: qualified, qualified }],
    elements: raw.subject ? [{ ...reference, frame: 'window', unit: 'dp', spaceId: 'boopstick-window', rect: raw.subject }] : [],
    rawEvidence: [{ ref: path, sha256: hash(bytes) }],
  };
  const report = JSON.parse(canonicalReport(compare(request, capture)));
  const receipt = { binding, attemptId, mode, driver, raw, request, capture, report };
  writeFileSync(join(directory, `${mode}-receipt.json`), `${JSON.stringify(receipt, null, 2)}\n`, { flag: 'wx' });
  verifyReceipt(receipt, binding, directory);
  return receipt;
}

export function verifyReceipt(receipt, binding, directory) {
  assert.deepEqual(receipt.binding, binding, 'Current external run/artifact/APK/fixture/collector binding');
  validateRaw(receipt.raw, receipt.attemptId, receipt.mode);
  assert.deepEqual(receipt.request, makeRequest(binding, receipt.mode === 'absent'), 'Intact independently authored request');
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
  assert.deepEqual(capture.elements, receipt.raw.subject ? [{ ...reference, frame: 'window', unit: 'dp', spaceId: 'boopstick-window', rect: receipt.raw.subject }] : [], 'Capture corresponds to actual callback values');
  const raw = receipt.raw;
  assert.deepEqual(capture.environment, { platform: binding.environment.platform, density: raw.environmentBefore.density, fontScale: raw.environmentBefore.fontScale, direction: raw.environmentBefore.direction });
  assert.deepEqual(capture.environment, binding.environment, 'Current device environment');
  assert.equal(receipt.driver.attemptId, receipt.attemptId); assert.equal(receipt.driver.state, 'on');
  const qualified = raw.steady && raw.errors.length === 0 && raw.root !== null
    && ((raw.subjectMounted && raw.subject !== null) || (receipt.mode === 'absent' && receipt.driver.subjectAbsent === true));
  assert.deepEqual(capture.coverage, [{ scope: 'subject-scope', requested: [reference], observed: raw.subject ? [reference] : [], complete: qualified, qualified }], 'Coverage corresponds to actual finite acquisition');
  if (receipt.driver.uiEvidence) {
    const ui = receipt.driver.uiEvidence; assert.equal(basename(ui.ref), ui.ref);
    const uiBytes = readFileSync(join(directory, ui.ref)); assert.equal(hash(uiBytes), ui.sha256, 'Driver UI file digest');
    const xml = uiBytes.toString('utf8'); assert.match(xml, /text="State: on"/);
    assert.equal(!xml.includes('resource-id="geometry-subject"'), receipt.driver.subjectAbsent);
  } else throw new Error('Actual driver UI file binding required');
  assert.equal(canonicalReport(compare(receipt.request, capture)), canonicalReport(receipt.report), 'Report matches comparator');
  return digest(receipt);
}
