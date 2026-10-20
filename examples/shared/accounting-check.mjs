import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { caseName, scenarioId } from "./scenario.mjs";
import { reconcile } from "./reconcile.mjs";

// Checks real full-run evidence, then preserves explicitly labelled report counterfactuals.
export function checkAccounting(input, directory) {
  assert.equal(reconcile(input).accepted, true, "Counterfactual source must be an actual accepted full run");
  const cases = [];
  const records = value => value.report.testResults.flatMap(file => file.assertionResults)
    .filter(result => result.title === caseName("width", input.expected.binding.variant) || result.title === caseName("height", input.expected.binding.variant));
  const receipts = value => value.runner === "vitest" ? records(value).map(result => result.meta.boopstick) : value.evidence;
  const obligationFile = value => value.report.testResults.find(file => file.assertionResults.some(result => records(value).includes(result)));
  const add = (label, code, mutate) => {
    const value = structuredClone(input);
    mutate(value);
    const result = reconcile(value);
    writeFileSync(join(directory, `counterfactual-${label}.json`), JSON.stringify({ kind: "counterfactual-not-runner-execution", label, source: "full/runner.json", input: value, result }, null, 2));
    assert.equal(result.accepted, false, label);
    assert(result.errors.some(error => error.code === code), `${label}: expected ${code}, got ${JSON.stringify(result.errors)}`);
    cases.push(label);
  };
  add("missing-runner-result", "runner-multiplicity", value => {
    const file = obligationFile(value);
    file.assertionResults = file.assertionResults.filter(result => result.title !== caseName("height", input.expected.binding.variant));
  });
  add("duplicate-runner-result", "runner-multiplicity", value => obligationFile(value).assertionResults.push(structuredClone(records(value)[0])));
  add("equal-count-duplicate-and-omission", "runner-multiplicity", value => {
    const file = obligationFile(value);
    const first = records(value)[0];
    file.assertionResults = file.assertionResults.map(result => records(value).includes(result) ? structuredClone(first) : result);
  });
  add("unexpected-obligation", "unexpected-id", value => {
    const extra = structuredClone(records(value)[0]);
    extra.title = JSON.stringify([scenarioId, "undeclared", input.expected.binding.variant]);
    obligationFile(value).assertionResults.push(extra);
  });
  add("wrong-test-file", "wrong-file", value => { obligationFile(value).name += ".wrong"; });
  add("discovery-only", "discovery-only", value => { records(value)[0].wouldRun = true; });
  add("expected-failure-with-comparator-pass", "expected-failure", value => {
    if (value.runner === "vitest") receipts(value)[0].expectedFailure = true;
    else records(value)[0].failing = true;
  });
  if (input.runner === "vitest") {
    add("missing-effective-fails", "expected-failure", value => { delete receipts(value)[0].expectedFailure; });
    add("missing-meta", "missing-evidence", value => { delete records(value)[0].meta.boopstick; });
  } else {
    add("missing-failing", "expected-failure", value => { delete records(value)[0].failing; });
    add("nonboolean-failing", "expected-failure", value => { records(value)[0].failing = "true"; });
    add("missing-attachment-receipt", "receipt-multiplicity", value => value.evidence.pop());
    add("duplicate-conflicting-receipt", "receipt-multiplicity", value => {
      const duplicate = structuredClone(value.evidence[0]);
      duplicate.binding.runId = "conflicting-run";
      value.evidence.push(duplicate);
    });
  }
  for (const field of ["runId", "artifactSha256", "requestSha256", "project"]) {
    add(`wrong-${field}`, "wrong-binding", value => { receipts(value)[0].binding[field] = `wrong-${field}`; });
  }
  add("wrong-environment", "wrong-binding", value => { receipts(value)[0].binding.environment.density = 2; });
  add("wrong-request", "wrong-request", value => { receipts(value)[0].request.assertions[0].value = 121; });
  add("wrong-capture-candidate", "wrong-capture-binding", value => { receipts(value)[0].capture.candidate.buildId = "other-build"; });
  add("wrong-capture-environment", "wrong-capture-binding", value => { receipts(value)[0].capture.environment.fontScale = 2; });
  add("missing-outcome", "outcome-multiplicity", value => { receipts(value)[0].report.outcomes = []; });
  add("duplicate-outcome", "outcome-multiplicity", value => {
    const receipt = receipts(value)[0];
    receipt.report.outcomes.push(structuredClone(receipt.report.outcomes.find(outcome => outcome.id === receipt.assertionId)));
  });
  add("green-runner-hidden-comparator-fail", "comparator-status", value => {
    const receipt = receipts(value)[0];
    receipt.report.outcomes.find(outcome => outcome.id === receipt.assertionId).status = "fail";
  });
  add("green-runner-hidden-not-measured", "comparator-status", value => {
    const receipt = receipts(value)[0];
    receipt.report.outcomes.find(outcome => outcome.id === receipt.assertionId).status = "not_measured";
  });
  add("unknown-comparator-status", "invalid-comparator-report", value => { receipts(value)[0].report.status = "unrecognized-status"; });
  add("green-runner-hidden-admission", "admission", value => {
    receipts(value)[0].report.status = "invalid_capture";
    receipts(value)[0].report.outcomes = [];
  });
  add("truncated-runner-shape", "invalid-evidence", value => { delete value.report.testResults; });
  writeFileSync(join(directory, "counterfactual-summary.json"), JSON.stringify({ kind: "counterfactual-not-runner-execution", rejected: cases }, null, 2));
  return cases;
}
