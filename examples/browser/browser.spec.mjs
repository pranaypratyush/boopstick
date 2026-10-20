import { test as base, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { canonicalReport, compare } from 'boopstick';
import { acquire, openSpecimen } from './acquire.mjs';
import { binding, hash, matrix, metrics, requireCurrent, requireOrigin } from './scenario.mjs';

const lifecycle = value => appendFileSync(join(process.env.BOOPSTICK_OUTPUT_DIR, 'fixture-lifecycle.jsonl'), `${JSON.stringify(value)}\n`);
const test = base.extend({
  ownedContext: [async ({ context }, use, testInfo) => {
    context.on('close', () => lifecycle({ event: 'context-closed', testId: testInfo.testId, project: testInfo.project.name }));
    await use();
  }, { auto: true }],
});
const variant = () => {
  const item = matrix.find(item => item.name === test.info().project.name);
  if (!item) throw new Error('Unknown declared viewport project');
  return item;
};
const save = (info, name, value) => writeFileSync(info.outputPath(`${name}.json`), `${JSON.stringify(value, null, 2)}\n`, { flag: 'wx' });
async function enable(page) {
  await expect(page.getByRole('button', { name: 'Toggle option' })).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: 'Toggle option' }).click();
  await expect(page.locator('#state')).toHaveText('Enabled');
  await expect(page.locator('#specimen')).toHaveAttribute('data-state', 'enabled');
}

for (const metric of metrics) {
  // One copy per project, selected from declarations rather than observed DOM.
  test(JSON.stringify(['neutral-browser', metric]), async ({ page }, info) => {
    const current = variant();
    await openSpecimen(page, current);
    await enable(page);
    const receipt = await acquire(page, info, current, 'positive');
    await page.screenshot({ path: info.outputPath('positive.png'), scale: 'css' });
    await info.attach('positive checkpoint', { path: info.outputPath('positive.png'), contentType: 'image/png' });
    const outcomes = receipt.report.outcomes.filter(outcome => outcome.id === metric);
    expect(outcomes).toHaveLength(1);
    expect(outcomes[0].status).toBe('pass');
    expect(receipt.raw.items[0].rect.width % 1).not.toBe(0);
    requireOrigin(receipt.raw);
  });
}

test('control: defect-repair', async ({ page }, info) => {
  const current = variant();
  await openSpecimen(page, current, 'defect');
  await enable(page);
  const defect = await acquire(page, info, current, 'height47');
  await page.screenshot({ path: info.outputPath('height47.png'), scale: 'css' });
  expect(defect.raw.items[0].rect.height).toBe(47);
  expect(defect.report.outcomes.find(item => item.id === 'height').status).toBe('fail');
  expect(defect.report.outcomes.find(item => item.id === 'width').status).toBe('pass');
  await page.locator('#specimen').evaluate(root => { root.dataset.mode = 'normal'; });
  await page.getByRole('button', { name: 'Toggle option' }).click();
  await expect(page.locator('#state')).toHaveText('Disabled');
  await enable(page);
  const repair = await acquire(page, info, current, 'height48-repaired');
  await page.screenshot({ path: info.outputPath('height48-repaired.png'), scale: 'css' });
  expect(repair.raw.items[0].rect.height).toBe(48);
  expect(repair.report.status).toBe('pass');
  expect(repair.request.assertions).toEqual(defect.request.assertions);
});

test('control: missing-absence-zero-duplicate', async ({ page }, info) => {
  const current = variant();
  await openSpecimen(page, current);
  await enable(page);
  const missing = await acquire(page, info, current, 'acquisition-incomplete', { incomplete: true });
  expect(missing.report.status).toBe('not_measured');
  expect(missing.report.outcomes.every(item => item.reason === 'missing-fact')).toBe(true);
  const incomplete = await acquire(page, info, current, 'absence-incomplete', { incomplete: true, presence: true });
  expect(incomplete.report.outcomes[0]).toMatchObject({ status: 'not_measured', reason: 'incomplete-scope' });
  await openSpecimen(page, current, 'absent');
  await enable(page);
  const absentScalar = await acquire(page, info, current, 'absent-scalar');
  expect(absentScalar.report.status).toBe('not_measured');
  const absent = await acquire(page, info, current, 'qualified-absence', { presence: true });
  expect(absent.report.outcomes[0]).toMatchObject({ status: 'pass', measured: 'absent' });
  await openSpecimen(page, current, 'zero');
  await enable(page);
  const zero = await acquire(page, info, current, 'connected-zero', { presence: true });
  expect(zero.raw.items[0]).toMatchObject({ connected: true, rect: { width: 0, height: 0 } });
  expect(zero.report.outcomes[0]).toMatchObject({ status: 'fail', measured: 'present' });
  await openSpecimen(page, current, 'duplicate');
  await enable(page);
  await expect(acquire(page, info, current, 'duplicate-refused')).rejects.toThrow('Malformed or duplicate observation identity');
});

test('control: overlay-recovery', async ({ page }, info) => {
  const current = variant();
  await openSpecimen(page, current, 'overlay', 'blocked-idle');
  const covered = await acquire(page, info, current, 'covered-before', { checkpoint: 'blocked-idle', state: 'idle' });
  expect(covered.report.status).toBe('pass');
  expect(covered.raw.overlay).toBe(true);
  let failure;
  try {
    await page.getByRole('button', { name: 'Toggle option' }).click({ timeout: 1000 });
  } catch (error) {
    failure = { name: error.name, message: error.message };
  }
  save(info, 'blocked-action', { failure, expected: 'unforced click blocked by overlay', label: 'actual browser action' });
  expect(failure?.name).toBe('TimeoutError');
  expect(failure.message).toContain('intercepts pointer events');
  await expect(page.locator('#state')).toHaveText('Disabled');
  await expect(page.getByRole('button', { name: 'Toggle option' })).toHaveAttribute('aria-pressed', 'false');
  const after = await acquire(page, info, current, 'covered-after', { checkpoint: 'blocked-idle', state: 'idle' });
  expect(after.raw.items[0].rect).toEqual(covered.raw.items[0].rect);
  expect(after.report.status).toBe('pass');
  await page.screenshot({ path: info.outputPath('overlay.png'), scale: 'css' });
  await page.locator('#overlay').evaluate(element => element.remove());
  await page.locator('#specimen').evaluate(root => { root.dataset.checkpoint = 'enabled'; });
  await enable(page);
  const restored = await acquire(page, info, current, 'overlay-removed');
  expect(restored.report.status).toBe('pass');
  expect(restored.raw.overlay).toBe(false);
  await page.screenshot({ path: info.outputPath('overlay-removed.png'), scale: 'css' });
});

test('control: identity-origin-refusals', async ({ page }, info) => {
  const current = variant();
  await openSpecimen(page, current);
  await enable(page);
  const fresh = await acquire(page, info, current, 'identity-baseline');
  const expected = binding(current.name);
  const reference = fresh.capture.rawEvidence[0];
  const rawBytes = readFileSync(info.outputPath(reference.ref));
  assert.equal(hash(rawBytes), reference.sha256);
  const integrityRoot = info.outputPath('raw-file-integrity');
  const directories = Object.fromEntries(['correct', 'whitespace', 'missing', 'substituted'].map(name => [name, join(integrityRoot, name)]));
  for (const directory of Object.values(directories)) mkdirSync(directory, { recursive: true });
  writeFileSync(join(directories.correct, reference.ref), rawBytes, { flag: 'wx' });
  requireCurrent(fresh, expected, directories.correct);
  const whitespaceBytes = Buffer.concat([rawBytes, Buffer.from('\n')]);
  writeFileSync(join(directories.whitespace, reference.ref), whitespaceBytes, { flag: 'wx' });
  assert.deepEqual(JSON.parse(whitespaceBytes.toString('utf8')), fresh.raw);
  assert.throws(() => requireCurrent(fresh, expected, directories.whitespace), /Raw evidence file digest mismatch/);
  assert.throws(() => requireCurrent(fresh, expected, directories.missing), { code: 'ENOENT' });
  const substitutedBytes = Buffer.from(`${JSON.stringify({ ...fresh.raw, state: 'substituted' }, null, 2)}\n`);
  writeFileSync(join(directories.substituted, reference.ref), substitutedBytes, { flag: 'wx' });
  const substitutedReceipt = structuredClone(fresh);
  substitutedReceipt.capture.rawEvidence[0].sha256 = hash(substitutedBytes);
  assert.throws(() => requireCurrent(substitutedReceipt, expected, directories.substituted), /Raw evidence observation mismatch/);
  save(info, 'file-integrity-controls', {
    label: 'owned copied-file integrity controls; not additional browser executions',
    originalRawUnchanged: hash(readFileSync(info.outputPath(reference.ref))) === reference.sha256,
    correctCopyAccepted: true, whitespaceOnlyTamperRefused: true, equivalentParsedWhitespace: true,
    missingFileRefused: true, selfConsistentSubstitutionRefused: true,
    declaredSha256: reference.sha256, whitespaceSha256: hash(whitespaceBytes),
  });
  const counterfactuals = [];
  for (const key of ['runId', 'checkpoint', 'candidate']) {
    const receipt = structuredClone(fresh);
    receipt.binding[key] = `wrong-${key}`;
    assert.throws(() => requireCurrent(receipt, expected, info.outputDir), /Wrong binding/);
    counterfactuals.push({ label: 'consumer accounting counterfactual; not fresh browser execution', changed: `binding.${key}`, refused: true });
  }
  for (const key of ['checkpoint', 'candidate']) {
    const capture = structuredClone(fresh.capture);
    if (key === 'checkpoint') capture.scenario.checkpoint = 'wrong-checkpoint';
    else capture.candidate.buildId = 'wrong-candidate';
    const report = JSON.parse(canonicalReport(compare(fresh.request, capture)));
    save(info, `wrong-${key}`, { label: 'offline capture counterfactual; not fresh browser execution', capture, report });
    expect(report.outcomes.every(item => item.status === 'not_measured' && item.reason === 'identity-mismatch')).toBe(true);
  }
  const stale = structuredClone(fresh.capture);
  stale.epoch.endedAt = stale.epoch.startedAt + 1001;
  const staleReport = JSON.parse(canonicalReport(compare(fresh.request, stale)));
  save(info, 'stale-interval', { label: 'offline duration counterfactual; not wall-clock freshness', capture: stale, report: staleReport });
  expect(staleReport.outcomes.every(item => item.reason === 'stale-epoch')).toBe(true);
  assert.throws(() => requireOrigin(fresh.raw, { x: 17, y: 24 }), /Wrong authored viewport origin/);
  counterfactuals.push({ label: 'ordinary origin oracle counterfactual; not comparator metric or fresh browser execution', expected: { x: 17, y: 24 }, observed: fresh.raw.rootRect, refused: true });
  save(info, 'labelled-counterfactuals', counterfactuals);
});
