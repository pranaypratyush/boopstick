import { createHash } from "node:crypto";

export const scenarioId = "synthetic-size-policy";
export const environment = Object.freeze({ platform: "synthetic-js", density: 1, fontScale: 1, direction: "ltr" });
export const digest = value => createHash("sha256").update(JSON.stringify(value)).digest("hex");
export const caseName = (assertionId, variant) => JSON.stringify([scenarioId, assertionId, variant]);

// Independently authored example policy, not native/browser geometry approval.
export function makeRequest(artifactSha256) {
  return {
    schemaVersion: 3, contractVersion: "3.1", requestId: "synthetic-size-policy-v1",
    claim: { kind: "qualification", expectationSource: { ref: "authored-example-policy:120-by-48" } },
    scenario: { id: scenarioId, checkpoint: "ready" },
    requiredIdentity: {
      candidate: `sha256:${artifactSha256}`,
      fixture: { id: "neutral-size-policy-v1", sha256: digest({ width: 120, height: 48 }) },
      environment: { ...environment },
    },
    subjects: [{ id: "panel", key: "panel", kind: "layout", provider: "synthetic", frame: "window", unit: "dp", spaceId: "synthetic-panel", match: "one" }],
    assertions: [
      { id: "width", rule: "metric", target: "panel", metric: "width", comparison: "eq", value: 120, tolerance: 0 },
      { id: "height", rule: "metric", target: "panel", metric: "height", comparison: "eq", value: 48, tolerance: 0 },
    ],
  };
}

export function makeCapture(request, dimensions = { width: 120, height: 48 }, control = "full") {
  const capture = {
    schemaVersion: 2, contractVersion: "3.1", captureId: `synthetic-panel-${control}`,
    origin: "synthetic", provider: "synthetic",
    collector: { id: "authored-synthetic-example", sha256: digest("authored-synthetic-example-v1") },
    scenario: { ...request.scenario }, candidate: { buildId: request.requiredIdentity.candidate },
    fixture: { ...request.requiredIdentity.fixture }, environment: { ...request.requiredIdentity.environment },
    epoch: { id: "synthetic-replay", startedAt: 0, endedAt: 1, steady: true },
    coverage: [], rawEvidence: [],
    elements: [{ key: "panel", kind: "layout", provider: "synthetic", frame: "window", unit: "dp", spaceId: "synthetic-panel", rect: { x: 0, y: 0, ...dimensions } }],
  };
  if (control === "mismatch" || control === "expected-failure" || control === "sibling-failure") capture.elements[0].rect.height = 24;
  if (control === "missing-observation") capture.elements = [];
  if (control === "invalid-capture") capture.elements[0].rect.width = -1;
  return capture;
}

export function makeBinding({ runId, artifactSha256, variant }) {
  if (typeof runId !== "string" || !runId.trim()) throw new Error("A fresh invocation runId is required");
  if (!/^[a-f0-9]{64}$/.test(artifactSha256)) throw new Error("artifactSha256 must be the packed artifact SHA-256");
  if (!["vitest", "rntl"].includes(variant)) throw new Error("Unknown runner variant");
  return { runId, artifactSha256, variant, project: `boopstick-${variant}`, requestSha256: digest(makeRequest(artifactSha256)), environment: { ...environment } };
}

export function selectOutcome(report, assertionId) {
  if (report.status === "invalid_request" || report.status === "invalid_capture") {
    throw new Error(`${report.status}: ${JSON.stringify({ errors: report.errors, evidenceErrors: report.evidenceErrors })}`);
  }
  const outcomes = report.outcomes.filter(outcome => outcome.id === assertionId);
  if (outcomes.length !== 1) throw new Error(`Expected exactly one outcome for ${assertionId}; received ${outcomes.length}`);
  return outcomes[0];
}
