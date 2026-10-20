import { isDeepStrictEqual } from "node:util";
import { isAbsolute, resolve } from "node:path";
import { caseName, digest, makeBinding, makeRequest, scenarioId } from "./scenario.mjs";

// Example-level accounting only. Runner/comparator reports remain the source evidence.
export function reconcile({ runner, report, evidence = [], expected, exitCode }) {
  const errors = [];
  const reject = (code, detail) => errors.push({ code, detail });
  try {
    if (!["vitest", "jest"].includes(runner)) throw new Error("Unknown runner");
    const variant = runner === "vitest" ? "vitest" : "rntl";
    const binding = makeBinding(expected.binding);
    if (binding.variant !== variant || !isDeepStrictEqual(binding, expected.binding)) throw new Error("Invalid independent expected binding");
    if (expected.project !== binding.project || !isAbsolute(expected.file)) throw new Error("Expected project and absolute test file required");
    const request = makeRequest(binding.artifactSha256);
    const names = request.assertions.map(assertion => caseName(assertion.id, variant));
    const rows = new Map(names.map(name => [name, []]));
    if (exitCode !== 0) reject("runner-exit", exitCode);
    if (report?.success !== true) reject("runner-unsuccessful", report?.success);
    if (!Array.isArray(report?.testResults)) throw new Error("Missing terminal testResults array");
    if (report.wasInterrupted === true || report.runExecError || report.numRuntimeErrorTestSuites > 0) reject("runner-runtime", "Interrupted or runtime failure");
    if (runner === "jest" && report.wasInterrupted !== false) reject("runner-completion", "Missing Jest completion flag");
    for (const file of report.testResults) {
      if (file.status === "failed" || file.message) reject("runner-file", { file: file.name, status: file.status, message: file.message });
      if (!Array.isArray(file.assertionResults)) throw new Error("Missing assertionResults array");
      for (const result of file.assertionResults) {
        let tuple;
        try { tuple = JSON.parse(result.title); } catch { /* Ordinary behavior/contract tests are not obligations. */ }
        const claimsNamespace = Array.isArray(tuple) && tuple[0] === scenarioId;
        if (!claimsNamespace && !result.meta?.boopstick) continue;
        if (!claimsNamespace || !rows.has(result.title)) {
          reject("unexpected-id", result.title);
          continue;
        }
        if (resolve(file.name) !== expected.file) reject("wrong-file", file.name);
        rows.get(result.title).push(result);
      }
    }
    if (!Array.isArray(evidence)) throw new Error("Evidence attachment must contain an array of execution receipts");
    for (const receipt of evidence) {
      if (!request.assertions.some(assertion => assertion.id === receipt?.assertionId)) reject("unexpected-receipt", receipt?.assertionId);
    }
    for (const assertion of request.assertions) {
      const name = caseName(assertion.id, variant);
      const results = rows.get(name);
      if (results.length !== 1) {
        reject("runner-multiplicity", { name, count: results.length });
        continue;
      }
      const result = results[0];
      if (result.status !== "passed") reject("runner-status", { name, status: result.status });
      if (result.wouldRun === true) reject("discovery-only", name);
      if (runner === "jest" ? result.failing !== false : result.failing === true) reject("expected-failure", name);
      if ((result.invocations ?? 1) !== 1 || result.retryReasons?.length) reject("runner-retry", name);
      let receipt;
      if (runner === "vitest") {
        receipt = result.meta?.boopstick;
        if (receipt?.expectedFailure !== false) reject("expected-failure", { name, effectiveFails: receipt?.expectedFailure });
        if (receipt?.retry !== 0 || receipt?.repeats !== 0) reject("runner-retry", name);
      } else {
        const receipts = evidence.filter(item => item?.assertionId === assertion.id);
        if (receipts.length !== 1) reject("receipt-multiplicity", { name, count: receipts.length });
        receipt = receipts.length === 1 ? receipts[0] : undefined;
      }
      if (!receipt) {
        reject("missing-evidence", name);
        continue;
      }
      if (receipt.assertionId !== assertion.id || !isDeepStrictEqual(receipt.binding, binding)) reject("wrong-binding", name);
      if (digest(receipt.request) !== binding.requestSha256) reject("wrong-request", name);
      const capture = receipt.capture;
      if (!capture || capture.origin !== "synthetic" || capture.provider !== "synthetic"
        || !isDeepStrictEqual(capture.scenario, request.scenario)
        || capture.candidate?.buildId !== request.requiredIdentity.candidate
        || !isDeepStrictEqual(capture.fixture, request.requiredIdentity.fixture)
        || !isDeepStrictEqual(capture.environment, binding.environment)) reject("wrong-capture-binding", name);
      const comparison = receipt.report;
      if (!comparison || !Array.isArray(comparison.outcomes)) {
        reject("missing-comparator-report", name);
        continue;
      }
      if (comparison.status === "invalid_request" || comparison.status === "invalid_capture") {
        reject("admission", { name, status: comparison.status, errors: comparison.errors, evidenceErrors: comparison.evidenceErrors });
        continue;
      }
      if (!["pass", "fail", "not_measured"].includes(comparison.status)
        || comparison.reportVersion !== 3 || comparison.contractVersion !== "3.1"
        || comparison.requestId !== request.requestId || comparison.captureId !== capture?.captureId
        || !isDeepStrictEqual(comparison.scenario, request.scenario) || comparison.evidenceOrigin !== "synthetic"
        || !Array.isArray(comparison.errors) || comparison.errors.length
        || !Array.isArray(comparison.evidenceErrors) || comparison.evidenceErrors.length) reject("invalid-comparator-report", name);
      const ids = comparison.outcomes.map(outcome => outcome.id).sort();
      if (!isDeepStrictEqual(ids, request.assertions.map(item => item.id).sort())) reject("outcome-inventory", { name, ids });
      const outcomes = comparison.outcomes.filter(outcome => outcome.id === assertion.id);
      if (outcomes.length !== 1) reject("outcome-multiplicity", { name, count: outcomes.length });
      else if (outcomes[0].status !== "pass") reject("comparator-status", { name, outcome: outcomes[0] });
    }
  } catch (error) {
    reject("invalid-evidence", error.message);
  }
  return { accepted: errors.length === 0, errors };
}
