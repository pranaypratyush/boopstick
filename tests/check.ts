import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { compare, canonicalReport } from "../src/compare.js";
import { CONTRACT_VERSION as contractVersion } from "../src/vocab.js";
import type { Report } from "../src/compare.js";
import type { Outcome } from "../src/measure.js";
const hash = "a".repeat(64);
const subject = (id: string, key = id) => ({ id, key, kind: "layout", provider: "synthetic", frame: "window", unit: "dp", spaceId: "s", match: "one" });
const ref = (key: string) => ({ key, instance: "", kind: "layout", provider: "synthetic" });
const element = (key: string, rect = { x: 0, y: 0, width: 0, height: 1 }) => ({ ...ref(key), frame: "window", unit: "dp", spaceId: "s", rect });
const metric = (id: string, target: string, value = 0) => ({ id, rule: "metric", target, metric: "width", comparison: "eq", value, tolerance: 0, evidence: ["authored"] });
const request = (assertions: unknown[], subjects: unknown[] = [subject("a"), subject("b"), subject("zero"), subject("fail")], scopes: unknown[] = []) => ({ schemaVersion: 3, contractVersion, requestId: "request", claim: { kind: "qualification", expectationSource: { ref: "authored" } }, scenario: { id: "scenario", checkpoint: "checkpoint" }, requiredIdentity: { candidate: "build", fixture: { id: "fixture", sha256: hash }, environment: { platform: "offline", density: 1, fontScale: 1, direction: "ltr" } }, subjects, scopes, assertions });
const capture = (elements: unknown[] = [element("a"), element("b"), element("zero"), element("fail")], coverage: unknown[] = []) => ({ schemaVersion: 2, contractVersion, captureId: "capture", origin: "synthetic", provider: "synthetic", collector: { id: "offline", sha256: hash }, scenario: { id: "scenario", checkpoint: "checkpoint" }, candidate: { buildId: "build" }, fixture: { id: "fixture", sha256: hash }, environment: { platform: "offline", density: 1, fontScale: 1, direction: "ltr" }, epoch: { id: "epoch", startedAt: 0, endedAt: 1, steady: true }, coverage, elements, rawEvidence: [] });
const presence = (target = "a", mode = "present") => ({ id: target + mode, rule: "presence", target, scope: "scope", mode, evidence: ["authored"] });
const scopes = [{ id: "scope", subjects: ["a"] }];
const rows: unknown[] = [];
function run(id: string, req: unknown, cap: unknown, verify: (report: Report) => void) {
  if (process.env.CASE && process.env.CASE !== id) return;
  const before = structuredClone({ req, cap });
  const report = compare(req, cap);
  rows.push({ id, request: req, capture: cap, report });
  console.log(JSON.stringify({ id, request: req, capture: cap, report, canonical: canonicalReport(report) }, (_key, value) => typeof value === "number" && !Number.isFinite(value) ? { nonFinite: String(value) } : value));
  assert.deepEqual({ req, cap }, before, `${id}: input immutability`);
  assert.deepEqual(JSON.parse(canonicalReport(report)), JSON.parse(JSON.stringify(report)), `${id}: canonical/raw agreement`);
  assert.equal(canonicalReport(compare(req, cap)), canonicalReport(report), `${id}: deterministic`);
  verify(report);
}
run("logical-alias-outside-scope", request([presence("alias")], [subject("a"), subject("alias", "a")], scopes), null, r => {
  assert.equal(r.status, "invalid_request"); assert.deepEqual(r.outcomes, []); assert(r.errors.some(e => e.code === "out-of-scope-target"));
});
run("missing-selected-scope", request([presence(), metric("scalar", "zero")], undefined, scopes), capture(), r => {
  assert.equal(r.status, "not_measured"); assert.deepEqual(r.counts, { pass: 1, fail: 0, not_measured: 1 });
  assert.equal(r.outcomes[0].reason, "incomplete-scope"); assert.equal(r.outcomes[0].measured, null); assert(r.outcomes[0].detail?.includes("scope"));
});
function numeric(id: string, assertion: object, a = element("a", { x: 0, y: 0, width: 1e308, height: 1e-308 }), b = element("b")) {
  run(id, request([{ id: "affected", evidence: ["authored"], ...assertion }, metric("zero", "zero"), metric("fail", "fail", 1)]), capture([a, b, element("zero"), element("fail")]), r => {
    assert.equal(r.status, "fail"); assert.deepEqual(r.counts, { pass: 1, fail: 1, not_measured: 1 });
    const affected = r.outcomes.find(o => o.id === "affected")!;
    assert.equal(affected.status, "not_measured"); assert.equal(affected.reason, "invalid-fact"); assert.equal(affected.measured, null); assert.equal(affected.deviation, null);
    assert.equal(affected.tolerance, "tolerance" in assertion ? assertion.tolerance : 0); assert(affected.evidence.includes("authored"));
    assert.equal(r.outcomes.find(o => o.id === "zero")!.measured, 0); assert.equal(r.outcomes.find(o => o.id === "fail")!.status, "fail");
  });
}
numeric("metric-aspect-overflow", { rule: "metric", target: "a", metric: "aspectRatio", comparison: "min", value: 0, tolerance: 0 });
numeric("metric-unsaturated-overflow", { rule: "metric", target: "a", metric: "width", comparison: "min", value: -1e308, tolerance: 0 });
numeric("gap-edge-overflow", { rule: "gap", from: "a", to: "b", axis: "x", comparison: "max", value: 0, tolerance: 0 }, element("a", { x: 1e308, y: 0, width: 1e308, height: 1 }));
numeric("alignment-edge-overflow", { rule: "alignment", from: "a", to: "b", edge: "right", comparison: "min", value: 0, tolerance: 0 }, element("a", { x: 1e308, y: 0, width: 1e308, height: 1 }));
numeric("containment-discarded-negative-overflow", { rule: "containment", outer: "a", inner: "b", inset: 0, tolerance: 0 }, element("a", { x: 1e308, y: 0, width: 1e308, height: 1 }), element("b", { x: 1e308, y: 0, width: 0, height: 1 }));
numeric("non-overlap-hidden-right-overflow", { rule: "non_overlap", from: "a", to: "b" }, element("a", { x: 1e308, y: 0, width: 1e308, height: 1 }), element("b", { x: 1e308, y: 0, width: 0, height: 1 }));
numeric("non-overlap-skipped-second-axis", { rule: "non_overlap", from: "a", to: "b" }, element("a", { x: 0, y: 1e308, width: 0, height: 1e308 }), element("b", { x: 10, y: 0, width: 0, height: 1 }));
// Current-contract discriminators use authored static JSON, not browser collection.
const domSubject = (overrides: Record<string, unknown> = {}) => ({ id: "root", key: "sample-panel", instance: "instance-A", kind: "layout", provider: "web-dom-border-box", frame: "window", unit: "logical-px", spaceId: "neutral-preview", match: "one", ...overrides });
const domRequest = (subjects: unknown[], assertions: unknown[], overrides: Record<string, unknown> = {}) => ({
  ...request(assertions, subjects),
  requestId: "sample-panel-a-360",
  scenario: { id: "sample-panel-reference", checkpoint: "sample-panel-360" },
  requiredIdentity: { candidate: "neutral-build", fixture: { id: "sample-panel-a", sha256: hash }, environment: { platform: "web", density: 1, fontScale: 1, direction: "ltr" } },
  ...overrides,
});
const domElement = (overrides: Record<string, unknown> = {}) => ({
  key: "sample-panel", instance: "instance-A", kind: "layout", provider: "web-dom-border-box", frame: "window", unit: "logical-px", epoch: "sweep-1", spaceId: "neutral-preview",
  rect: { x: 8.5, y: 12.25, width: 360.25, height: 47.5 }, ...overrides,
});
const domCapture = (overrides: Record<string, unknown> = {}) => ({
  schemaVersion: 2, contractVersion, captureId: "capture.web-sample-panel-a-360", origin: "live", provider: "web-dom-border-box", collector: { id: "capture.web.mjs", sha256: hash },
  scenario: { id: "sample-panel-reference", checkpoint: "sample-panel-360" }, candidate: { buildId: "neutral-build" }, fixture: { id: "sample-panel-a", sha256: hash },
  environment: { platform: "web", density: 1, fontScale: 1, direction: "ltr" }, epoch: { id: "sweep-1", startedAt: 10, endedAt: 12, steady: true },
  coverage: [], elements: [domElement()], rawEvidence: [{ ref: "evidence/sample-panel-a/sample-panel-a-360.json", sha256: hash }], ...overrides,
});
const widthAssertion = { id: "root-width", rule: "metric", target: "root", metric: "width", comparison: "eq", value: 360.25, tolerance: 0, evidence: ["authored"] };

run("live-dom-border-box-fractional-layout-admitted", domRequest([domSubject()], [widthAssertion]), domCapture(), r => {
  assert.equal(r.status, "pass"); assert.equal(r.evidenceOrigin, "live"); assert.equal(r.liveEvidence, true);
  assert.deepEqual(r.counts, { pass: 1, fail: 0, not_measured: 0 });
  assert.equal(r.outcomes[0]!.measured, 360.25); assert.equal(r.outcomes[0]!.deviation, 0);
});
run("dom-provider-tuple-does-not-alias-rn", domRequest([domSubject({ provider: "rn-measure-in-window" })], [widthAssertion]), domCapture(), r => {
  assert.equal(r.status, "not_measured");
  assert.equal(r.outcomes[0]!.reason, "missing-fact"); assert(r.outcomes[0]!.detail?.includes("no captured observation"));
});
run("unknown-provider-request-refused", domRequest([domSubject({ provider: "web-get-bounding-client-rect" })], [widthAssertion]), domCapture(), r => {
  assert.equal(r.status, "invalid_request"); assert.deepEqual(r.outcomes, []); assert(r.errors.some(e => e.code === "invalid-enum" && e.path === "$.subjects[0].provider"));
});
run("unknown-provider-capture-refused", request([metric("scalar", "zero")]), domCapture({ provider: "dom-query-selector-all" }), r => {
  assert.equal(r.status, "invalid_capture"); assert.deepEqual(r.outcomes, []); assert(r.evidenceErrors.some(e => e.code === "invalid-enum" && e.path === "$.provider"));
});
run("exact-3.0-request-refused", { ...domRequest([domSubject()], [widthAssertion]), contractVersion: "3.0" }, domCapture(), r => {
  assert.equal(r.status, "invalid_request"); assert.deepEqual(r.outcomes, []); assert(r.errors.some(e => e.code === "incompatible-minor-version"));
});
run("exact-3.0-capture-refused", domRequest([domSubject()], [widthAssertion]), { ...domCapture(), contractVersion: "3.0" }, r => {
  assert.equal(r.status, "invalid_capture"); assert.deepEqual(r.outcomes, []); assert(r.evidenceErrors.some(e => e.code === "capture-contract-version"));
});
run("dom-kind-mismatch-still-refuses", domRequest([domSubject({ kind: "accessibility" })], [widthAssertion]), domCapture(), r => {
  assert.equal(r.status, "not_measured");
  assert.equal(r.outcomes[0]!.reason, "missing-fact"); assert(r.outcomes[0]!.detail?.includes("no captured observation"));
});
run("dom-space-constraint-still-refuses", domRequest([domSubject({ spaceId: "other-iframe" })], [widthAssertion]), domCapture(), r => {
  assert.equal(r.status, "not_measured");
  assert.equal(r.outcomes[0]!.reason, "incompatible-space"); assert(r.outcomes[0]!.detail?.includes("space"));
});
run("dom-cross-space-pair-still-refuses",
  domRequest(
    [domSubject({ id: "from", instance: "instance-A" }), domSubject({ id: "to", key: "sample-panel-b", instance: "instance-B", spaceId: undefined })],
    [{ id: "gap", rule: "gap", from: "from", to: "to", axis: "x", comparison: "eq", value: 0, tolerance: 0, evidence: ["authored"] }],
  ),
  domCapture({ elements: [domElement(), domElement({ key: "sample-panel-b", instance: "instance-B", spaceId: "other-iframe" })] }),
  r => {
    assert.equal(r.status, "not_measured");
    assert.equal(r.outcomes[0]!.reason, "incompatible-space"); assert(r.outcomes[0]!.detail?.includes("one observed coordinate space"));
  });
run("dom-environment-mismatch-still-refuses", domRequest([domSubject()], [widthAssertion]), domCapture({ environment: { platform: "web", density: 1, fontScale: 1.25, direction: "ltr" } }), r => {
  assert.equal(r.status, "not_measured");
  assert.equal(r.outcomes[0]!.reason, "identity-mismatch"); assert.equal(r.outcomes[0]!.measured, null);
});
type Expected = Pick<Report, "status" | "counts"> & {
  outcomes: (Pick<Outcome, "id" | "status" | "reason" | "measured" | "deviation"> & { expectedDetailIncludes?: string[] })[];
  requestErrorCodes?: string[];
  captureErrorCodes?: string[];
};
type OracleCase = { id: string; contractRows: number[]; request: unknown; capture: unknown; expected: Expected };
// Repository-owned, independently reviewed literal dataset; not an external input API.
const cases: OracleCase[] = JSON.parse(readFileSync(new URL("./oracles/cases.json", import.meta.url), "utf8"));
// Explicit in-memory derivation of the frozen historical 3.0 dataset for replay under
// the selected contract header; the retained cases.json bytes and their provenance
// bindings are historical and are never rewritten. Minor-lineage headers map
// {exact history -> current, historical future minor -> refused other minor}; any
// other header (legacy 2.1 major) is not a minor-cutover subject and passes through.
function deriveCase(c: OracleCase): { request: unknown; capture: unknown } {
  const derive = (side: unknown) => {
    if (side === null || typeof side !== "object") return side;
    const record = side as Record<string, unknown>;
    // Minor-lineage header derivation: exact history -> current, historical future
    // minor -> refused other minor; legacy 2.1 majors are not minor-cutover
    // subjects and pass through unchanged.
    const v = record.contractVersion;
    return { ...record, contractVersion: v === "3.0" ? contractVersion : v === "3.1" ? "3.0" : v };
  };
  return { request: derive(c.request), capture: derive(c.capture) };
}
function expectedReport(report: Report, expected: Expected, id: string) {
  assert.equal(report.reportVersion, 3, id); assert.equal(report.contractVersion, contractVersion, id);
  assert.equal(report.status, expected.status, id); assert.deepEqual(report.counts, expected.counts, id);
  assert.deepEqual(report.outcomes.map(({ id, status, reason, measured, deviation }) => ({ id, status, reason, measured, deviation })),
    expected.outcomes.map(({ expectedDetailIncludes, ...outcome }) => outcome), id);
  if (expected.requestErrorCodes) assert.deepEqual(report.errors.map(e => e.code).sort(), [...expected.requestErrorCodes].sort(), id);
  if (expected.captureErrorCodes) assert.deepEqual(report.evidenceErrors.map(e => e.code).sort(), [...expected.captureErrorCodes].sort(), id);
  for (const outcome of expected.outcomes) {
    for (const token of outcome.expectedDetailIncludes ?? []) assert(report.outcomes.find(o => o.id === outcome.id)?.detail?.includes(token), `${id}: ${outcome.id}: ${token}`);
  }
  function finitePayload(value: unknown) {
    if (typeof value === "number") assert(Number.isFinite(value), `${id}: nonfinite payload`);
    else if (value !== null && typeof value === "object") for (const child of Object.values(value)) finitePayload(child);
  }
  finitePayload(report);
}
for (const c of cases) {
  const { request: derivedRequest, capture: derivedCapture } = deriveCase(c);
  run(`oracle/${c.id}`, derivedRequest, derivedCapture, r => {
    expectedReport(r, c.expected, c.id);
    expectedReport(JSON.parse(canonicalReport(r)), c.expected, `${c.id}: canonical`);
  });
}
assert.equal(rows.length, process.env.CASE ? 1 : 68, "CASE selects one known case; the full run requires all 68 cases");
console.log(JSON.stringify({ passed: rows.length }));
