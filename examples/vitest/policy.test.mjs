import { beforeAll, expect, test } from "vitest";
import { compare, canonicalReport } from "boopstick";
import { caseName, makeBinding, makeCapture, makeRequest, selectOutcome } from "../shared/scenario.mjs";

const control = process.env.BOOPSTICK_CONTROL ?? "full";
if (!["full", "skip", "expected-failure", "mismatch", "sibling-failure", "missing-observation", "invalid-request", "invalid-capture"].includes(control)) {
  throw new Error(`Unknown qualification control: ${control}`);
}
const binding = makeBinding({ runId: process.env.BOOPSTICK_RUN_ID, artifactSha256: process.env.BOOPSTICK_ARTIFACT_SHA256, variant: "vitest" });
const declared = makeRequest(binding.artifactSha256);
let request, capture, report;
beforeAll(() => {
  request = structuredClone(declared);
  capture = makeCapture(request, undefined, control);
  if (control === "invalid-request") request.schemaVersion = 0;
  // Immutable offline replay: evaluate the intact request once, even under -t.
  report = JSON.parse(canonicalReport(compare(request, capture)));
});

for (const assertion of declared.assertions) {
  const register = assertion.id === "height" && control === "skip" ? test.skip
    : assertion.id === "height" && control === "expected-failure" ? test.fails : test;
  register(caseName(assertion.id, "vitest"), ({ task }) => {
    // Built-in JSON retains meta even when the next assertion throws or .fails inverts it.
    task.meta.boopstick = {
      binding, assertionId: assertion.id, request, capture, report,
      expectedFailure: task.fails === true, retry: task.retry ?? 0, repeats: task.repeats ?? 0,
    };
    const outcome = selectOutcome(report, assertion.id);
    expect(outcome.status, JSON.stringify(outcome)).toBe("pass");
  });
}
