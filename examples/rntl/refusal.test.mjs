import { expect, test } from '@jest/globals';
import { compare, canonicalReport } from 'boopstick';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { makeBinding, makeCapture, makeRequest } from '../shared/scenario.mjs';

test('contract-negative: supplied synthetic layout cannot satisfy regression', () => {
  const binding = makeBinding({
    runId: process.env.BOOPSTICK_RUN_ID,
    artifactSha256: process.env.BOOPSTICK_ARTIFACT_SHA256,
    variant: 'rntl',
  });
  const outputDir = process.env.BOOPSTICK_OUTPUT_DIR;
  if (!outputDir) throw new Error('BOOPSTICK_OUTPUT_DIR must name a fresh invocation directory');
  const request = makeRequest(binding.artifactSha256);
  request.claim = {
    kind: 'regression',
    expectationSource: {
      ref: 'authored-qualification-negative',
      approval: { actor: 'example-review', ref: 'synthetic-live-refusal-control' },
    },
  };
  const capture = makeCapture(request);
  const report = JSON.parse(canonicalReport(compare(request, capture)));
  // A negative-control report is diagnostic, never an application-obligation receipt.
  writeFileSync(join(outputDir, 'refusal.json'), `${JSON.stringify({ binding, request, capture, report })}\n`, { flag: 'wx' });
  expect(report.status).toBe('not_measured');
  expect(report.outcomes.map(({ id, status, reason, measured }) => ({ id, status, reason, measured }))).toEqual(
    request.assertions.map(({ id }) => ({ id, status: 'not_measured', reason: 'synthetic-not-live-evidence', measured: null }))
      .sort((a, b) => a.id.localeCompare(b.id)),
  );
});
