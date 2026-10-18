/**
 * PROTOTYPE (throwaway) — strict capture admission, capture context and report
 * assembly, contract 3.1.
 *
 * Pure: no I/O, terminal code, React Native import, or external adoption.
 *
 * Three levels are kept strictly apart:
 *   invalid_request  the request itself is malformed — no outcomes at all
 *   invalid_capture  the capture cannot be admitted as evidence (unknown or
 *                    malformed fields, nonfinite/negative dimensions, invalid
 *                    enums or epochs, duplicate tuples/scopes, contradictory
 *                    coverage, meaningless raw refs, origin contradictions) —
 *                    no numerical outcomes at all
 *   not_measured     a well-formed capture that cannot support a claim: wrong
 *                    identity, stale/unsteady epoch, mixed element epoch,
 *                    synthetic evidence for a live claim, or a missing fact
 * Every blocker or missing fact is explicit, and a measured failure is never
 * replaced by a missing sibling.
 */
import {
  CAPTURE_SCHEMA_VERSION,
  CONTRACT_MAJOR,
  CONTRACT_VERSION,
  FRAMES,
  HEX64,
  LIMITATIONS,
  PROVIDERS,
  RECT_KINDS,
  REPORT_VERSION,
  UNITS,
  canonicalize,
  checkFields,
  enumField,
  finite,
  isObj,
  oneOf,
  safeCount,
  str,
  tupleOf,
  type ObservationRef,
  type Reason,
  type Status,
} from "./vocab.js";
import { assertionSubjectIds, refOf, validateRequest, type NormalizedAssertion, type NormalizedRequest, type Subject, type ValidationError } from "./request.js";
import { evaluate, notMeasured, type Coverage, type Element, type Outcome } from "./measure.js";

export type ReportStatus = Status | "invalid_request" | "invalid_capture";
export type EvidenceError = { code: string; path: string; message: string };
export type Derivations = { requestSha256: string; captureSha256: string; checker: { id: string; sha256: string } };

export type Report = {
  reportVersion: number;
  contractVersion: string;
  requestId: string;
  captureId: string;
  claim: NormalizedRequest["claim"] | null;
  scenario: { id: string; checkpoint: string };
  evidenceOrigin: "live" | "synthetic" | "unknown";
  liveEvidence: boolean;
  authority: "declared-not-verified";
  status: ReportStatus;
  counts: { pass: number; fail: number; not_measured: number };
  outcomes: Outcome[];
  errors: ValidationError[];
  evidenceErrors: EvidenceError[];
  limitations: readonly string[];
  /** Pure core does not bind filesystem derivations. */
  derivations: Derivations | null;
};

type Blocker = { reason: Reason; detail: string };

type AdmittedCapture = {
  captureId: string;
  origin: "live" | "synthetic";
  elements: Element[];
  coverage: Map<string, Coverage>;
  epochId: string;
  scenario: { id: string; checkpoint: string };
  candidate: string;
  fixture: { id: string; sha256: string };
  environment: { platform: string; density: number; fontScale: number; direction: string };
  epoch: { startedAt: number; endedAt: number; steady: boolean };
};

const CAPTURE_FIELDS = ["schemaVersion", "contractVersion", "captureId", "origin", "provider", "collector", "scenario", "candidate", "fixture", "environment", "epoch", "coverage", "elements", "rawEvidence", "extensions"];
const ELEMENT_FIELDS = ["key", "instance", "kind", "provider", "frame", "unit", "epoch", "spaceId", "rect", "reportedLineCount", "semanticText"];
const COVERAGE_FIELDS = ["scope", "requested", "observed", "complete", "qualified"];
const REF_FIELDS = ["key", "instance", "kind", "provider"];

/** Read a structured observation-reference list; malformed items are refused, never dropped. */
function readRefs(v: unknown, path: string, errors: EvidenceError[]): ObservationRef[] | null {
  if (!Array.isArray(v)) {
    errors.push({ code: "invalid-type", path, message: "array of { key, instance, kind, provider } required" });
    return null;
  }
  const refs: ObservationRef[] = [];
  const seen = new Set<string>();
  v.forEach((raw, i) => {
    const p = `${path}[${i}]`;
    if (!isObj(raw)) { errors.push({ code: "invalid-type", path: p, message: "object required" }); return; }
    checkFields(raw, REF_FIELDS, p, errors);
    if (!str(raw.key)) errors.push({ code: "invalid-type", path: `${p}.key`, message: "non-empty string required" });
    if (raw.instance !== undefined && typeof raw.instance !== "string") errors.push({ code: "invalid-type", path: `${p}.instance`, message: "string required" });
    enumField(raw.kind, RECT_KINDS, `${p}.kind`, errors);
    enumField(raw.provider, PROVIDERS, `${p}.provider`, errors);
    if (!str(raw.key) || (raw.instance !== undefined && typeof raw.instance !== "string") || !oneOf(raw.kind, RECT_KINDS) || !oneOf(raw.provider, PROVIDERS)) return;
    const ref: ObservationRef = { key: raw.key, instance: typeof raw.instance === "string" ? raw.instance : "", kind: raw.kind, provider: raw.provider };
    const tuple = tupleOf(ref);
    if (seen.has(tuple)) { errors.push({ code: "duplicate-tuple", path: p, message: `duplicate observation tuple ${tuple} inside one coverage list` }); return; }
    seen.add(tuple);
    refs.push(ref);
  });
  return refs;
}

/**
 * Admit a capture as evidence. Any error means the whole capture is refused with
 * `invalid_capture`: valid records are never silently dropped, and a malformed
 * item can never become "absent" evidence.
 */
function admitCapture(raw: unknown): { errors: EvidenceError[]; capture: AdmittedCapture | null } {
  const errors: EvidenceError[] = [];
  if (!isObj(raw)) return { errors: [{ code: "capture-not-object", path: "$", message: "capture must be a JSON object" }], capture: null };
  checkFields(raw, CAPTURE_FIELDS, "$", errors);
  if (raw.extensions !== undefined && !isObj(raw.extensions)) {
    errors.push({ code: "invalid-type", path: "$.extensions", message: "object required: extensions is the documented boundary for unknown capture data, and malformed normative input is refused" });
  }
  if (raw.schemaVersion !== CAPTURE_SCHEMA_VERSION) errors.push({ code: "capture-schema-version", path: "$.schemaVersion", message: `expected ${CAPTURE_SCHEMA_VERSION}` });
  if (typeof raw.contractVersion !== "string" || raw.contractVersion.split(".")[0] !== String(CONTRACT_MAJOR)) errors.push({ code: "capture-contract-version", path: "$.contractVersion", message: `expected major ${CONTRACT_MAJOR}.x` });
  else if (raw.contractVersion !== CONTRACT_VERSION) errors.push({ code: "capture-contract-version", path: "$.contractVersion", message: `this prototype implements ${CONTRACT_VERSION} exactly` });
  if (!str(raw.captureId)) errors.push({ code: "invalid-type", path: "$.captureId", message: "non-empty string required" });
  const captureId = str(raw.captureId) ? raw.captureId : "";
  const origin = raw.origin === "live" || raw.origin === "synthetic" ? raw.origin : null;
  if (!origin) errors.push({ code: "invalid-enum", path: "$.origin", message: 'expected "live" | "synthetic"' });
  enumField(raw.provider, PROVIDERS, "$.provider", errors);
  if (origin === "live" && raw.provider === "synthetic") errors.push({ code: "origin-contradiction", path: "$.provider", message: "a live capture cannot be produced by the synthetic provider" });

  const collector = isObj(raw.collector) ? raw.collector : null;
  if (!collector) errors.push({ code: "invalid-type", path: "$.collector", message: "object { id, sha256 } required" });
  else {
    checkFields(collector, ["id", "sha256"], "$.collector", errors);
    if (!str(collector.id)) errors.push({ code: "invalid-type", path: "$.collector.id", message: "non-empty string required" });
    if (!(typeof collector.sha256 === "string" && HEX64.test(collector.sha256))) errors.push({ code: "invalid-hash", path: "$.collector.sha256", message: "lowercase 64-hex sha256 required" });
  }

  const scenario = isObj(raw.scenario) ? raw.scenario : null;
  const scenarioId = scenario && str(scenario.id) ? scenario.id : "";
  const checkpoint = scenario && str(scenario.checkpoint) ? scenario.checkpoint : "";
  if (!scenario) errors.push({ code: "invalid-type", path: "$.scenario", message: "object { id, checkpoint } required" });
  else {
    checkFields(scenario, ["id", "checkpoint"], "$.scenario", errors);
    if (scenarioId === "" || checkpoint === "") errors.push({ code: "invalid-type", path: "$.scenario", message: "id and checkpoint must be non-empty strings" });
  }

  const candidate = isObj(raw.candidate) ? raw.candidate : null;
  const buildId = candidate && str(candidate.buildId) ? candidate.buildId : "";
  if (!candidate) errors.push({ code: "invalid-type", path: "$.candidate", message: "object { buildId } required" });
  else {
    checkFields(candidate, ["buildId"], "$.candidate", errors);
    if (buildId === "") errors.push({ code: "invalid-type", path: "$.candidate.buildId", message: "non-empty string required" });
  }

  const fixture = isObj(raw.fixture) ? raw.fixture : null;
  const fixtureId = fixture && str(fixture.id) ? fixture.id : "";
  const fixtureSha = fixture && typeof fixture.sha256 === "string" && HEX64.test(fixture.sha256) ? fixture.sha256 : "";
  if (!fixture) errors.push({ code: "invalid-type", path: "$.fixture", message: "object { id, sha256 } required" });
  else {
    checkFields(fixture, ["id", "sha256"], "$.fixture", errors);
    if (fixtureId === "") errors.push({ code: "invalid-type", path: "$.fixture.id", message: "non-empty string required" });
    if (fixtureSha === "") errors.push({ code: "invalid-hash", path: "$.fixture.sha256", message: "lowercase 64-hex sha256 required" });
  }

  const env = isObj(raw.environment) ? raw.environment : null;
  const environment = {
    platform: env && str(env.platform) ? env.platform : "",
    density: env && finite(env.density) && env.density > 0 ? env.density : 0,
    fontScale: env && finite(env.fontScale) && env.fontScale > 0 ? env.fontScale : 0,
    direction: env && (env.direction === "ltr" || env.direction === "rtl") ? env.direction : "",
  };
  if (!env) errors.push({ code: "invalid-type", path: "$.environment", message: "object required" });
  else {
    checkFields(env, ["platform", "density", "fontScale", "direction"], "$.environment", errors);
    if (environment.platform === "") errors.push({ code: "invalid-type", path: "$.environment.platform", message: "non-empty string required" });
    if (environment.density === 0) errors.push({ code: "invalid-number", path: "$.environment.density", message: "finite > 0 required" });
    if (environment.fontScale === 0) errors.push({ code: "invalid-number", path: "$.environment.fontScale", message: "finite > 0 required" });
    if (environment.direction === "") errors.push({ code: "invalid-enum", path: "$.environment.direction", message: 'expected "ltr" | "rtl"' });
  }

  const epochRaw = isObj(raw.epoch) ? raw.epoch : null;
  const epochId = epochRaw && str(epochRaw.id) ? epochRaw.id : "";
  const epoch = {
    startedAt: epochRaw && finite(epochRaw.startedAt) ? epochRaw.startedAt : NaN,
    endedAt: epochRaw && finite(epochRaw.endedAt) ? epochRaw.endedAt : NaN,
    steady: epochRaw ? epochRaw.steady === true : false,
  };
  if (!epochRaw) errors.push({ code: "invalid-type", path: "$.epoch", message: "object { id, startedAt, endedAt, steady } required" });
  else {
    checkFields(epochRaw, ["id", "startedAt", "endedAt", "steady"], "$.epoch", errors);
    if (epochId === "") errors.push({ code: "invalid-type", path: "$.epoch.id", message: "non-empty string required" });
    if (!finite(epochRaw.startedAt) || !finite(epochRaw.endedAt)) errors.push({ code: "invalid-number", path: "$.epoch", message: "finite startedAt and endedAt required" });
    else if (epochRaw.endedAt < epochRaw.startedAt) errors.push({ code: "invalid-epoch", path: "$.epoch", message: `collection interval ${epochRaw.endedAt - epochRaw.startedAt}ms is negative` });
    if (typeof epochRaw.steady !== "boolean") errors.push({ code: "invalid-type", path: "$.epoch.steady", message: "boolean required" });
  }

  const elements: Element[] = [];
  const tupleSeen = new Set<string>();
  if (!Array.isArray(raw.elements)) errors.push({ code: "invalid-type", path: "$.elements", message: "array required" });
  else
    raw.elements.forEach((el, i) => {
      const p = `$.elements[${i}]`;
      if (!isObj(el)) { errors.push({ code: "invalid-type", path: p, message: "object required" }); return; }
      checkFields(el, ELEMENT_FIELDS, p, errors);
      if (!str(el.key)) errors.push({ code: "invalid-type", path: `${p}.key`, message: "non-empty string required" });
      if (el.instance !== undefined && typeof el.instance !== "string") errors.push({ code: "invalid-type", path: `${p}.instance`, message: "string required" });
      enumField(el.kind, RECT_KINDS, `${p}.kind`, errors);
      enumField(el.provider, PROVIDERS, `${p}.provider`, errors);
      enumField(el.frame, FRAMES, `${p}.frame`, errors);
      enumField(el.unit, UNITS, `${p}.unit`, errors);
      if (el.epoch !== undefined && !str(el.epoch)) errors.push({ code: "invalid-type", path: `${p}.epoch`, message: "non-empty string or omit" });
      if (el.spaceId !== undefined && !str(el.spaceId)) errors.push({ code: "invalid-type", path: `${p}.spaceId`, message: "non-empty string or omit" });
      if (origin === "live" && el.provider === "synthetic") errors.push({ code: "origin-contradiction", path: `${p}.provider`, message: "a live capture cannot contain a synthetic observation" });

      let rect: Element["rect"] = null;
      if (el.rect !== undefined) {
        const r = isObj(el.rect) ? el.rect : null;
        if (!r) errors.push({ code: "invalid-type", path: `${p}.rect`, message: "object { x, y, width, height } required" });
        else {
          checkFields(r, ["x", "y", "width", "height"], `${p}.rect`, errors);
          if (!finite(r.x) || !finite(r.y) || !finite(r.width) || !finite(r.height)) errors.push({ code: "invalid-number", path: `${p}.rect`, message: "finite x, y, width and height required" });
          else if (r.width < 0 || r.height < 0) errors.push({ code: "negative-dimension", path: `${p}.rect`, message: `width and height must be >= 0, got ${r.width}x${r.height}` });
          else rect = { x: r.x, y: r.y, width: r.width, height: r.height };
        }
        if (!str(el.spaceId)) errors.push({ code: "missing-space", path: `${p}.spaceId`, message: "a rectangular observation requires a nonempty spaceId; no position is inferred without one" });
      }

      let reportedLineCount: number | null = null;
      if (el.reportedLineCount !== undefined) {
        if (safeCount(el.reportedLineCount)) reportedLineCount = el.reportedLineCount;
        else errors.push({ code: "invalid-count", path: `${p}.reportedLineCount`, message: "nonnegative safe integer required" });
      }

      let semanticText: string | null = null;
      if (el.semanticText !== undefined) {
        const st = isObj(el.semanticText) ? el.semanticText : null;
        if (!st) errors.push({ code: "invalid-type", path: `${p}.semanticText`, message: "object { value, provenance } required" });
        else {
          checkFields(st, ["value", "provenance"], `${p}.semanticText`, errors);
          if (typeof st.value !== "string") errors.push({ code: "invalid-type", path: `${p}.semanticText.value`, message: "string required" });
          if (st.provenance !== "semantic-label") errors.push({ code: "invalid-enum", path: `${p}.semanticText.provenance`, message: 'expected "semantic-label"' });
          if (typeof st.value === "string" && st.provenance === "semantic-label") semanticText = st.value;
        }
      }

      if (rect === null && reportedLineCount === null && semanticText === null) {
        errors.push({ code: "no-supported-fact", path: p, message: "an element must carry at least one supported fact (rect, reportedLineCount, semanticText)" });
      }
      if (!str(el.key) || !oneOf(el.kind, RECT_KINDS) || !oneOf(el.provider, PROVIDERS) || !oneOf(el.frame, FRAMES) || !oneOf(el.unit, UNITS)) return;
      const ref: ObservationRef = { key: el.key, instance: typeof el.instance === "string" ? el.instance : "", kind: el.kind, provider: el.provider };
      const tuple = tupleOf(ref);
      if (tupleSeen.has(tuple)) { errors.push({ code: "duplicate-tuple", path: p, message: `duplicate captured observation tuple ${tuple}; duplicates are invalid evidence, not aliases` }); return; }
      tupleSeen.add(tuple);
      elements.push({
        ...ref,
        frame: el.frame,
        unit: el.unit,
        spaceId: typeof el.spaceId === "string" ? el.spaceId : "",
        epoch: typeof el.epoch === "string" ? el.epoch : epochId,
        rect,
        reportedLineCount,
        semanticText,
      });
    });

  const coverage = new Map<string, Coverage>();
  if (!Array.isArray(raw.coverage)) errors.push({ code: "invalid-type", path: "$.coverage", message: "array required" });
  else
    raw.coverage.forEach((c, i) => {
      const p = `$.coverage[${i}]`;
      if (!isObj(c)) { errors.push({ code: "invalid-type", path: p, message: "object required" }); return; }
      checkFields(c, COVERAGE_FIELDS, p, errors);
      if (!str(c.scope)) errors.push({ code: "invalid-type", path: `${p}.scope`, message: "non-empty string required" });
      else if (coverage.has(c.scope)) errors.push({ code: "duplicate-scope", path: `${p}.scope`, message: `duplicate coverage entry for scope ${JSON.stringify(c.scope)}; there is no last-write-wins` });
      if (typeof c.complete !== "boolean") errors.push({ code: "invalid-type", path: `${p}.complete`, message: "boolean required" });
      if (typeof c.qualified !== "boolean") errors.push({ code: "invalid-type", path: `${p}.qualified`, message: "boolean required" });
      const requested = readRefs(c.requested, `${p}.requested`, errors);
      const observed = readRefs(c.observed, `${p}.observed`, errors);
      if (requested && observed) {
        const requestedTuples = new Set(requested.map(tupleOf));
        for (const ref of observed) if (!requestedTuples.has(tupleOf(ref))) errors.push({ code: "coverage-not-subset", path: `${p}.observed`, message: `observed ${tupleOf(ref)} was not requested by scope ${JSON.stringify(c.scope)}` });
      }
      if (str(c.scope) && !coverage.has(c.scope) && requested && observed && typeof c.complete === "boolean" && typeof c.qualified === "boolean") {
        coverage.set(c.scope, { requested, observed, complete: c.complete, qualified: c.qualified });
      }
    });

  let usableRawEvidence = 0;
  if (!Array.isArray(raw.rawEvidence)) errors.push({ code: "invalid-type", path: "$.rawEvidence", message: "array required" });
  else {
    raw.rawEvidence.forEach((e, i) => {
      const p = `$.rawEvidence[${i}]`;
      if (!isObj(e)) { errors.push({ code: "invalid-type", path: p, message: "object { ref, sha256 } required" }); return; }
      checkFields(e, ["ref", "sha256"], p, errors);
      if (!str(e.ref)) errors.push({ code: "invalid-type", path: `${p}.ref`, message: "non-empty string required" });
      if (!(typeof e.sha256 === "string" && HEX64.test(e.sha256))) errors.push({ code: "invalid-hash", path: `${p}.sha256`, message: "lowercase 64-hex sha256 required" });
      if (str(e.ref) && typeof e.sha256 === "string" && HEX64.test(e.sha256)) usableRawEvidence++;
    });
    if (origin === "live" && usableRawEvidence === 0) errors.push({ code: "missing-raw-evidence", path: "$.rawEvidence", message: "origin=live requires at least one usable raw evidence reference" });
  }

  // A coverage declaration must agree with the captured observations in both directions.
  const capturedTuples = new Set(elements.map(tupleOf));
  for (const [scope, cov] of coverage) {
    for (const ref of cov.observed) {
      if (!capturedTuples.has(tupleOf(ref))) errors.push({ code: "coverage-observed-not-captured", path: `$.coverage[${JSON.stringify(scope)}].observed`, message: `observed ${tupleOf(ref)} has no captured observation` });
    }
    for (const ref of cov.requested) {
      if (capturedTuples.has(tupleOf(ref)) && !cov.observed.some((o) => tupleOf(o) === tupleOf(ref))) {
        errors.push({ code: "coverage-contradicts-observation", path: `$.coverage[${JSON.stringify(scope)}].observed`, message: `requested ${tupleOf(ref)} is captured but not listed as observed; a captured observation cannot be recorded as absent` });
      }
    }
  }

  if (errors.length > 0 || origin === null) return { errors, capture: null };
  return {
    errors,
    capture: {
      captureId,
      origin,
      elements,
      coverage,
      epochId,
      scenario: { id: scenarioId, checkpoint },
      candidate: buildId,
      fixture: { id: fixtureId, sha256: fixtureSha },
      environment,
      epoch: { startedAt: epoch.startedAt, endedAt: epoch.endedAt, steady: epoch.steady },
    },
  };
}


/** Capture-level blockers: well-formed evidence that still cannot support this request. */
function blockersFor(request: NormalizedRequest, cap: AdmittedCapture): Blocker[] {
  const blockers: Blocker[] = [];
  const want = request.requiredIdentity;
  const mismatch =
    cap.candidate !== want.candidate ||
    cap.fixture.id !== want.fixture.id ||
    cap.fixture.sha256 !== want.fixture.sha256 ||
    cap.scenario.id !== request.scenario.id ||
    cap.scenario.checkpoint !== request.scenario.checkpoint ||
    cap.environment.platform !== want.environment.platform ||
    cap.environment.density !== want.environment.density ||
    cap.environment.fontScale !== want.environment.fontScale ||
    cap.environment.direction !== want.environment.direction;
  if (mismatch) {
    blockers.push({
      reason: "identity-mismatch",
      detail: `capture identity (scenario ${JSON.stringify(cap.scenario.id)}/${JSON.stringify(cap.scenario.checkpoint)}, candidate ${JSON.stringify(cap.candidate)}, fixture ${JSON.stringify(cap.fixture.id)}/${JSON.stringify(cap.fixture.sha256)}, environment ${JSON.stringify(cap.environment)}) does not match the request's required identity`,
    });
  }
  const interval = cap.epoch.endedAt - cap.epoch.startedAt;
  if (interval > request.capturePolicy.maxIntervalMs) blockers.push({ reason: "stale-epoch", detail: `collection interval ${interval}ms exceeds capturePolicy.maxIntervalMs ${request.capturePolicy.maxIntervalMs}` });
  if (request.capturePolicy.requireSteady && cap.epoch.steady !== true) blockers.push({ reason: "incoherent-capture", detail: "capture.epoch.steady is not true and the request requires a steady capture" });
  if (cap.origin === "synthetic" && (request.claim.kind === "regression" || request.claim.kind === "design-parity")) {
    blockers.push({ reason: "synthetic-not-live-evidence", detail: `claim kind ${request.claim.kind} cannot be satisfied by synthetic evidence; synthetic captures are never live evidence` });
  }
  return blockers;
}

function finalize(request: NormalizedRequest | null, rawCapture: unknown, outcomes: Outcome[], errors: ValidationError[], evidenceErrors: EvidenceError[], derivations: Derivations | null): Report {
  const counts = {
    pass: outcomes.filter((o) => o.status === "pass").length,
    fail: outcomes.filter((o) => o.status === "fail").length,
    not_measured: outcomes.filter((o) => o.status === "not_measured").length,
  };
  const status: ReportStatus =
    errors.length > 0 ? "invalid_request"
    : evidenceErrors.length > 0 ? "invalid_capture"
    : counts.fail > 0 ? "fail"
    : outcomes.length === 0 || counts.not_measured > 0 ? "not_measured"
    : "pass";
  const cap: Record<string, unknown> = isObj(rawCapture) ? rawCapture : {};
  const rawOrigin = cap.origin;
  const origin: "live" | "synthetic" | "unknown" = rawOrigin === "live" ? "live" : rawOrigin === "synthetic" ? "synthetic" : "unknown";
  const rawCaptureId = cap.captureId;
  return {
    reportVersion: REPORT_VERSION,
    contractVersion: CONTRACT_VERSION,
    requestId: request?.requestId ?? "",
    captureId: typeof rawCaptureId === "string" ? rawCaptureId : "",
    claim: request?.claim ?? null,
    scenario: request ? { id: request.scenario.id, checkpoint: request.scenario.checkpoint } : { id: "", checkpoint: "" },
    evidenceOrigin: origin,
    liveEvidence: origin === "live",
    authority: "declared-not-verified",
    status,
    counts,
    outcomes: [...outcomes].sort((x, y) => (x.id < y.id ? -1 : x.id > y.id ? 1 : 0)),
    errors,
    evidenceErrors,
    limitations: LIMITATIONS,
    derivations,
  };
}

/** Pure comparison. Malformed request => invalid_request; refused capture => invalid_capture. */
export function compare(requestJson: unknown, captureJson: unknown): Report {
  const { errors, request } = validateRequest(requestJson);
  if (!request) return finalize(null, captureJson, [], errors, [], null);
  const admitted = admitCapture(captureJson);
  if (!admitted.capture) return finalize(request, captureJson, [], [], admitted.errors, null);
  const cap = admitted.capture;
  const byId = new Map<string, Subject>(request.subjects.map((s) => [s.id, s]));
  const refsOf = (a: NormalizedAssertion): ObservationRef[] => assertionSubjectIds(a).flatMap((id) => (byId.has(id) ? [refOf(byId.get(id)!)] : []));
  const blocked = blockersFor(request, cap)[0];
  const outcomes = request.assertions.map((a) =>
    blocked ? notMeasured(a, refsOf(a), blocked.reason, blocked.detail, null, null, a.evidence) : evaluate(a, { byId, scopes: request.scopes, elements: cap.elements, coverage: cap.coverage, epochId: cap.epochId }),
  );
  return finalize(request, captureJson, outcomes, [], [], null);
}

export const canonicalReport = (report: Report): string => JSON.stringify(canonicalize(report));
