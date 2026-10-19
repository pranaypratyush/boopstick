import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { collect, startReceiver, verifyReceipt } from './collector.mjs';
import { digest, hash, selectOutcome } from './scenario.mjs';

// Synthetic transport/UI fixtures only: no device capture or native qualification is claimed.
async function acquisition(mode, mutate, check) {
  const directory = mkdtempSync(join(tmpdir(), 'boopstick-collector-'));
  let receiver;
  try {
    const attemptId = `synthetic-${mode}-subjects`;
    const environment = { density: 2, fontScale: 1, direction: 'ltr', windowWidth: 400, windowHeight: 800 };
    const raw = {
      attemptId, mode, checkpoint: 'after-toggle', state: 'on',
      startedAt: 100, endedAt: 150, generationBefore: 0, generationAfter: 0,
      environmentBefore: environment, environmentAfter: environment,
      root: { x: 0, y: 0, width: 400, height: 200 },
      subjects: [
        { key: 'body-subject', mounted: true, rect: { x: 24, y: 24, width: 280, height: 22 } },
        { key: 'action-subject', mounted: true, rect: { x: 24, y: mode === 'defect' ? 70 : 62, width: 48, height: 48 } },
      ], steady: true, errors: [],
    };
    mutate(raw);
    const bytes = Buffer.from(JSON.stringify(raw, null, 2) + '\n');
    const subjectKeys = ['body-subject', 'action-subject'];
    const ui = `<hierarchy><node text="Mode: ${mode}"/><node text="State: on"/>${subjectKeys.map(key => `<node resource-id="${key}"/>`).join('')}</hierarchy>\n`;
    writeFileSync(join(directory, 'synthetic-ui.xml'), ui);
    const driver = { kind: 'synthetic transport fixture, not a device run', attemptId, state: 'on', subjectKeys,
      uiEvidence: { ref: 'synthetic-ui.xml', sha256: hash(ui) } };
    const binding = {
      runId: 'synthetic-run-v1', apkSha256: 'b'.repeat(64),
      fixture: { id: 'synthetic-two-subject-fixture', sha256: digest('synthetic-fixture') },
      collector: { id: 'synthetic-transport-collector', sha256: digest('synthetic-collector') },
      environment: { platform: 'synthetic-js', density: 2, fontScale: 1, direction: 'ltr' },
    };
    receiver = await startReceiver({ attemptId, mode, directory });
    const response = await fetch(`http://127.0.0.1:${receiver.port}/capture/${attemptId}`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: bytes,
    });
    const message = await response.text();
    assert.equal(response.status, 200, `Receiver refused synthetic subjects: ${message}`);
    await receiver.body;
    assert.deepEqual(readFileSync(join(directory, `${mode}-raw.json`)), bytes);
    const pending = JSON.parse(readFileSync(join(directory, `${mode}-pending.json`)));
    assert.equal(pending.status, 'unqualified'); assert.equal(pending.rawEvidence.sha256, hash(bytes));
    const receipt = collect({ bytes, binding, attemptId, mode, directory, driver });
    check(receipt, binding, directory);
    verifyReceipt(receipt, binding, directory, mode);
  } finally {
    try { if (receiver) await receiver.close(); }
    finally { rmSync(directory, { recursive: true, force: true }); }
  }
}

test('two-subject vertical gap defect reaches comparison without hiding passing siblings', () => acquisition('defect', () => {}, receipt => {
  const gap = selectOutcome(receipt.report, 'gap');
  assert.equal(gap.status, 'fail'); assert.equal(gap.measured, 24); assert.equal(gap.deviation, 8);
  for (const id of ['alignment', 'body-contained', 'action-contained', 'body-width', 'body-height', 'action-width', 'action-height'])
    assert.equal(selectOutcome(receipt.report, id).status, 'pass');
  assert.equal(receipt.capture.coverage[0].qualified, true);
}));

test('complete subjects pass and persisted receipt tampering is detected', () => acquisition('control-1', () => {}, (receipt, binding, directory) => {
  assert.equal(receipt.report.status, 'pass');
  const persisted = JSON.parse(readFileSync(join(directory, 'control-1-receipt.json')));
  const changed = structuredClone(persisted); changed.raw.subjects[1].rect.y += 1;
  assert.throws(() => verifyReceipt(changed, binding, directory, 'control-1'));
  const changedElement = structuredClone(persisted); changedElement.capture.elements.find(element => element.key === 'action-subject').rect.y += 1;
  assert.throws(() => verifyReceipt(changedElement, binding, directory, 'control-1'));
  const changedHash = structuredClone(persisted); changedHash.capture.rawEvidence[0].sha256 = '0'.repeat(64);
  assert.throws(() => verifyReceipt(changedHash, binding, directory, 'control-1'));
}));

test('an internally valid receipt cannot satisfy another acquisition mode', () => acquisition('control-1', () => {}, (receipt, binding, directory) => {
  for (const mode of ['control-2', 'control-3', 'repair', undefined])
    assert.throws(() => verifyReceipt(receipt, binding, directory, mode));
}));

for (const missing of ['null rectangle', 'omitted entry']) test(`${missing} withholds action relationships but preserves measured body geometry`, () => acquisition('control-1', raw => {
  if (missing === 'null rectangle') { raw.subjects[1].rect = null; raw.errors.push('action-subject-timeout'); }
  else raw.subjects.pop();
}, receipt => {
  assert.equal(receipt.capture.coverage[0].qualified, false);
  assert.equal(receipt.capture.epoch.steady, true);
  for (const id of ['gap', 'alignment', 'action-contained', 'action-width', 'action-height']) {
    const outcome = selectOutcome(receipt.report, id);
    assert.equal(outcome.status, 'not_measured'); assert.equal(outcome.reason, 'missing-fact');
  }
  for (const id of ['body-contained', 'body-width', 'body-height']) assert.equal(selectOutcome(receipt.report, id).status, 'pass');
}));
