import React from 'react';
import { expect, test } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';
import { compare, canonicalReport } from 'boopstick';
import { appendFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  caseName,
  makeBinding,
  makeCapture,
  makeRequest,
  selectOutcome,
} from '../shared/scenario.mjs';
import SizeToggle from './SizeToggle.cjs';

const binding = makeBinding({
  runId: process.env.BOOPSTICK_RUN_ID,
  artifactSha256: process.env.BOOPSTICK_ARTIFACT_SHA256,
  variant: 'rntl',
});
const outputDir = process.env.BOOPSTICK_OUTPUT_DIR;
if (!outputDir) throw new Error('BOOPSTICK_OUTPUT_DIR must name a fresh invocation directory');
const control = process.env.BOOPSTICK_CONTROL ?? 'full';
const declaredRequest = makeRequest(binding.artifactSha256);

// Registration comes from the intact request, never the observed component tree.
for (const assertion of declaredRequest.assertions) {
  const register = assertion.id === 'height' && control === 'skip'
    ? test.skip
    : assertion.id === 'height' && control === 'expected-failure'
      ? test.failing
      : test;
  register(caseName(assertion.id, 'rntl'), async () => {
    const request = makeRequest(binding.artifactSha256);
    // These are independently authored qualification-policy inputs, not live layout.
    const dimensions = Object.fromEntries(request.assertions.map(item => [item.metric, item.value]));
    let suppliedLayout;
    const view = await render(React.createElement(SizeToggle, {
      onSuppliedLayout: layout => { suppliedLayout = layout; },
    }));
    await fireEvent.layout(view.getByTestId('sample-panel'), { x: 0, y: 0, ...dimensions });
    if (!suppliedLayout) throw new Error('The synthetic layout callback did not run');
    const capture = makeCapture(request, suppliedLayout, control);
    if (control === 'invalid-request') request.schemaVersion = 0;
    const report = JSON.parse(canonicalReport(compare(request, capture)));

    // Persist before admission/outcome assertions; append preserves duplicate receipts.
    appendFileSync(join(outputDir, 'evidence.jsonl'), `${JSON.stringify({
      binding,
      assertionId: assertion.id,
      request,
      capture,
      report,
    })}\n`);
    const outcome = selectOutcome(report, assertion.id);
    expect(outcome.status).toBe('pass');
  });
}
