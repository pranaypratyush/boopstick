import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'vitest';
import { compare, canonicalReport } from 'boopstick';
import { caseNames, modes, makeRequest, selectOutcome, policy, references } from './scenario.mjs';
import { verifyReceipt } from './collector.mjs';

const directory = process.env.BOOPSTICK_NATIVE_EVIDENCE;
if (!directory) throw new Error('Actual native evidence directory required');
const binding = JSON.parse(readFileSync(join(directory, 'binding.json')));
const load = mode => {
  const receipt = JSON.parse(readFileSync(join(directory, `${mode}-receipt.json`)));
  verifyReceipt(receipt, binding, directory, mode);
  const launch = JSON.parse(readFileSync(join(directory, `${mode}-launch-url.json`)));
  assert.equal(launch.mode, mode); assert.equal(receipt.attemptId, launch.attemptId);
  return receipt;
};
const request = makeRequest(binding);
const cases = Object.fromEntries(modes.flatMap(mode => request.assertions.map(({ id }) => [`${mode} ${id}`, () => {
  const receipt = load(mode);
  assert.deepEqual(receipt.request, request);
  assert.equal(selectOutcome(receipt.report, id).status, mode === 'defect' && id === 'gap' ? 'fail' : 'pass');
  return receipt;
}])));
const body = receipt => receipt.raw.subjects.find(subject => subject.key === 'body-subject').rect;
const offline = (mutate, check) => {
  const receipt = load('control-1');
  const capture = structuredClone(receipt.capture);
  mutate(capture);
  const report = compare(receipt.request, capture);
  check(report);
  return { kind: 'labelled offline counterfactual over retained native evidence, not another native execution', capture, report };
};
const withheld = (report, reason) => {
  for (const { id } of request.assertions) {
    const outcome = selectOutcome(report, id);
    assert.equal(outcome.status, 'not_measured'); assert.equal(outcome.reason, reason);
  }
};
Object.assign(cases, {
  'narrow body reflows relative to control': () => {
    const control = load('control-1'), narrow = load('narrow');
    assert.ok(body(narrow).width < body(control).width);
    assert.ok(body(narrow).height > body(control).height);
    assert.ok(Math.abs(body(control).width - 280) <= 0.5);
    assert.ok(Math.abs(body(narrow).width - 180) <= 0.5);
    return { kind: 'relative geometry from two separate native acquisitions; no line-count inference', control: control.attemptId, narrow: narrow.attemptId };
  },
  'repair uses the independent unchanged request': () => {
    const attempts = new Set();
    for (const mode of modes) {
      const receipt = load(mode);
      assert.deepEqual(receipt.request, makeRequest(binding));
      assert.ok(!attempts.has(receipt.attemptId), 'Distinct retained acquisitions');
      attempts.add(receipt.attemptId);
      if (mode === 'defect' || mode === 'repair')
        assert.equal(selectOutcome(receipt.report, 'gap').status, mode === 'defect' ? 'fail' : 'pass');
    }
    return { kind: 'distinct acquisitions with the independent unchanged request' };
  },
  'canonical replay is deterministic': () => {
    const receipt = load('control-1');
    const first = canonicalReport(compare(receipt.request, receipt.capture));
    const second = canonicalReport(compare(receipt.request, receipt.capture));
    assert.equal(first, second); assert.equal(first, canonicalReport(receipt.report));
    return { kind: 'two offline canonical replays of the same retained acquisition', report: JSON.parse(first) };
  },
  'offline missing tuple preserves independent metrics': () => offline(capture => {
    capture.elements = capture.elements.filter(element => element.key !== 'action-subject');
    capture.coverage[0].observed = capture.coverage[0].observed.filter(reference => reference.key !== 'action-subject');
    capture.coverage[0].complete = false; capture.coverage[0].qualified = false;
  }, report => {
    for (const id of ['gap', 'alignment', 'action-contained', 'action-width', 'action-height']) {
      const outcome = selectOutcome(report, id);
      assert.equal(outcome.status, 'not_measured'); assert.equal(outcome.reason, 'missing-fact');
    }
    for (const id of ['body-contained', 'body-width', 'body-height']) assert.equal(selectOutcome(report, id).status, 'pass');
  }),
  'offline duplicate tuple is invalid evidence': () => offline(capture => {
    capture.elements.push(structuredClone(capture.elements.find(element => element.key === 'action-subject')));
  }, report => {
    assert.equal(report.status, 'invalid_capture');
    assert.ok(report.evidenceErrors.some(error => error.code === 'duplicate-tuple'));
  }),
  'offline stale capture is withheld': () => offline(capture => {
    capture.epoch.endedAt = capture.epoch.startedAt + policy.maxIntervalMs + 1;
  }, report => withheld(report, 'stale-epoch')),
  'offline wrong checkpoint is withheld': () => offline(capture => {
    capture.scenario.checkpoint = 'before-toggle';
  }, report => withheld(report, 'identity-mismatch')),
  'offline wrong kind is not substituted': () => offline(capture => {
    capture.elements.find(element => element.key === 'action-subject').kind = 'accessibility';
    capture.coverage[0].observed = capture.coverage[0].observed.filter(reference => reference.key !== 'action-subject');
    capture.coverage[0].complete = false; capture.coverage[0].qualified = false;
  }, report => {
    assert.equal(selectOutcome(report, 'gap').reason, 'missing-fact');
    assert.equal(selectOutcome(report, 'action-width').status, 'not_measured');
    assert.equal(selectOutcome(report, 'body-width').status, 'pass');
  }),
  'offline wrong space withholds local relationships': () => offline(capture => {
    capture.elements.find(element => element.key === 'action-subject').spaceId = 'another-window';
  }, report => {
    for (const id of ['gap', 'alignment', 'action-contained', 'action-width', 'action-height']) {
      assert.equal(selectOutcome(report, id).status, 'not_measured');
      assert.equal(selectOutcome(report, id).reason, 'incompatible-space');
    }
    assert.equal(selectOutcome(report, 'body-width').status, 'pass');
  }),
  'offline incomplete scope cannot prove absence': () => {
    const receipt = load('control-1'), capture = structuredClone(receipt.capture), absence = structuredClone(receipt.request);
    capture.elements = capture.elements.filter(element => element.key !== references.action.key);
    capture.coverage[0].observed = capture.coverage[0].observed.filter(reference => reference.key !== references.action.key);
    capture.coverage[0].complete = false; capture.coverage[0].qualified = false;
    absence.assertions = [{ id: 'absent', rule: 'presence', scope: absence.scopes[0].id, target: 'action', mode: 'absent' }];
    const report = compare(absence, capture), outcome = selectOutcome(report, 'absent');
    assert.equal(outcome.status, 'not_measured'); assert.equal(outcome.reason, 'incomplete-scope');
    return { kind: 'labelled offline absence question, not a native absence run', request: absence, capture, report };
  },
  'offline receipt tamper is detected': () => {
    const receipt = load('control-1');
    const edited = structuredClone(receipt); edited.raw.subjects[0].rect.width += 1;
    assert.throws(() => verifyReceipt(edited, binding, directory, 'control-1'));
    const alteredHash = structuredClone(receipt); alteredHash.capture.rawEvidence[0].sha256 = '0'.repeat(64);
    assert.throws(() => verifyReceipt(alteredHash, binding, directory, 'control-1'));
    const alteredReport = structuredClone(receipt); selectOutcome(alteredReport.report, 'gap').status = 'fail';
    assert.throws(() => verifyReceipt(alteredReport, binding, directory, 'control-1'));
    assert.throws(() => verifyReceipt(receipt, binding, directory, 'control-2'));
    return { kind: 'labelled offline receipt/raw/hash/report tamper controls', original: receipt.attemptId };
  },
  'receiver retains six acquisition protocol controls': () => {
    const evidence = JSON.parse(readFileSync(join(directory, 'receiver-controls.json')));
    assert.equal(evidence.oldAttempts.length, modes.length - 1);
    assert.ok(evidence.oldAttempts.every(item => item.status === 409 && item.currentPathOldBodyStatus === 422));
    assert.equal(evidence.duplicates.length, modes.length);
    assert.ok(evidence.duplicates.every(item => item.status === 409));
    return { kind: 'retained receiver requests over actual prior acquisition bytes', ...evidence };
  },
});
assert.deepEqual(Object.keys(cases), caseNames, 'Frozen ordinary case inventory');
for (const name of caseNames) test(name, async ({ task }) => {
  task.meta.native = { binding, expectedFailure: task.fails === true, retry: task.retry ?? 0, repeats: task.repeats ?? 0 };
  task.meta.native.evidence = await cases[name]();
}, 10000);
