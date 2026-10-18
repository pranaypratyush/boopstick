import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'vitest';
import { compare, canonicalReport } from 'boopstick';
import { caseNames, makeRequest, selectOutcome, policy } from './scenario.mjs';
import { verifyReceipt, startReceiver } from './collector.mjs';

const directory = process.env.BOOPSTICK_NATIVE_EVIDENCE;
if (!directory) throw new Error('Actual native evidence directory required');
const binding = JSON.parse(readFileSync(join(directory, 'binding.json')));
const load = mode => {
  const receipt = JSON.parse(readFileSync(join(directory, `${mode}-receipt.json`)));
  verifyReceipt(receipt, binding, directory);
  return receipt;
};
const outcomes = (mode, statuses) => {
  const receipt = load(mode);
  assert.deepEqual(receipt.request, makeRequest(binding, mode === 'absent'));
  for (const [id, status] of Object.entries(statuses)) assert.equal(selectOutcome(receipt.report, id).status, status);
  return receipt;
};
const counterfactual = (mutate, reason) => {
  const receipt = load('valid');
  const capture = structuredClone(receipt.capture); mutate(capture);
  const report = JSON.parse(canonicalReport(compare(receipt.request, capture)));
  for (const id of ['width', 'height']) {
    const outcome = selectOutcome(report, id); assert.equal(outcome.status, 'not_measured'); assert.equal(outcome.reason, reason);
  }
  return { kind: 'labelled offline capture counterfactual, not another device execution', capture, report };
};
const cases = {
  'valid width': () => outcomes('valid', { width: 'pass' }),
  'valid height': () => outcomes('valid', { height: 'pass' }),
  'defect height fails while width passes': () => outcomes('defect', { width: 'pass', height: 'fail' }),
  'repair width': () => outcomes('repair', { width: 'pass' }),
  'repair height': () => outcomes('repair', { height: 'pass' }),
  'missing is unmeasured': () => {
    const receipt = outcomes('missing', { width: 'not_measured', height: 'not_measured' });
    assert.equal(receipt.raw.subjectMounted, true); assert.equal(receipt.raw.subject, null);
    assert.ok(receipt.driver.subjectAbsent === false); return receipt;
  },
  'qualified absence': () => {
    const receipt = outcomes('absent', { absent: 'pass' });
    assert.equal(receipt.raw.subjectMounted, false); assert.equal(receipt.driver.subjectAbsent, true);
    assert.equal(receipt.capture.coverage[0].qualified, true); return receipt;
  },
  'incomplete acquisition is not absence': () => {
    const receipt = load('missing'); const request = makeRequest(binding, true);
    const report = JSON.parse(canonicalReport(compare(request, receipt.capture)));
    const outcome = selectOutcome(report, 'absent'); assert.equal(outcome.status, 'not_measured'); assert.equal(outcome.reason, 'incomplete-scope');
    return { kind: 'offline presence question over actual withheld acquisition', request, report };
  },
  'wrong candidate refused': () => counterfactual(capture => { capture.candidate.buildId = 'wrong-build'; }, 'identity-mismatch'),
  'wrong checkpoint refused': () => counterfactual(capture => { capture.scenario.checkpoint = 'before-toggle'; }, 'identity-mismatch'),
  'wrong environment refused': () => counterfactual(capture => { capture.environment.fontScale += 0.25; }, 'identity-mismatch'),
  'overlong capture refused': () => counterfactual(capture => { capture.epoch.endedAt = capture.epoch.startedAt + policy.maxIntervalMs + 1; }, 'stale-epoch'),
  'unsteady capture refused': () => counterfactual(capture => { capture.epoch.steady = false; }, 'incoherent-capture'),
  'raw file binding enforced': () => {
    const receipt = load('valid'); const edited = structuredClone(receipt); edited.raw.subject.width += 1;
    assert.throws(() => verifyReceipt(edited, binding, directory), /raw file observation/);
    const alteredRef = structuredClone(receipt); alteredRef.capture.rawEvidence[0].sha256 = '0'.repeat(64);
    assert.throws(() => verifyReceipt(alteredRef, binding, directory), /raw file digest/);
    return { kind: 'offline receipt tamper controls over actual persisted raw files', original: receipt.attemptId };
  },
  'receiver rejects stale and malformed exports': async () => {
    const evidence = JSON.parse(readFileSync(join(directory, 'receiver-controls.json')));
    assert.ok(evidence.oldAttempts.length >= 1); assert.ok(evidence.oldAttempts.every(item => item.status === 409));
    assert.ok(evidence.duplicates.every(item => item.status === 409)); assert.equal(evidence.duplicates.length, 5);
    assert.ok(evidence.oldAttempts.every(item => item.currentPathOldBodyStatus === 422));
    const receiver = await startReceiver({ attemptId: 'validation-control', mode: 'valid', directory, timeoutMs: 1000 });
    const url = `http://127.0.0.1:${receiver.port}/capture/validation-control`;
    try {
      const wrong = structuredClone(load('valid').raw); wrong.attemptId = 'validation-control'; wrong.mode = 'repair';
      assert.equal((await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(wrong) })).status, 422);
      assert.equal((await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{' })).status, 422);
      assert.equal((await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: 'x'.repeat(65537) })).status, 413);
      await assert.rejects(receiver.body, /deadline/);
      await assert.rejects(fetch(url, { method: 'POST', body: '{}' }));
    } finally { await receiver.close(); }
    return { kind: 'actual receiver protocol requests plus replayed prior device export', ...evidence };
  },
};
assert.deepEqual(Object.keys(cases), caseNames, 'Frozen ordinary case inventory');
for (const name of caseNames) test(name, async ({ task }) => {
  task.meta.native = { binding, expectedFailure: task.fails === true, retry: task.retry ?? 0, repeats: task.repeats ?? 0 };
  task.meta.native.evidence = await cases[name]();
}, 10000);
