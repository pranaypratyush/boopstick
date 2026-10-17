/**
 * PROTOTYPE (throwaway) — request validation and normalisation, contract 3.1.
 *
 * A malformed request is an input error: the whole comparison refuses
 * (`invalid_request`) and no per-assertion outcome is produced. Unknown
 * field, incompatible version, invalid numeric bounds/tolerance, duplicate
 * assertion/subject/scope ids, missing targets and relations mixing incompatible
 * subject semantics are rejected here; per-rule objects are validated in
 * assertion.ts.
 *
 * Identity is the tuple [key, instance, kind, provider]; `refOf` returns that
 * structured reference, never a joined string. Two subject ids sharing one tuple
 * are intentional aliases of the same observation; a selector always declares
 * `match: "one"` because plural/aggregate selection is outside this revision.
 */
import {
  CLAIM_KINDS,
  CONTRACT_MAJOR,
  CONTRACT_VERSION,
  FRAMES,
  HEX64,
  MATCHES,
  PROVIDERS,
  RECT_KINDS,
  REQUEST_SCHEMA_VERSION,
  UNITS,
  checkFields,
  enumField,
  finite,
  isObj,
  oneOf,
  str,
  type Axis,
  type ClaimKind,
  type Comparison,
  type Edge,
  type Frame,
  type Match,
  type Metric,
  type ObservationRef,
  type PresenceMode,
  type Provider,
  type RectKind,
  type Unit,
} from "./vocab.js";
import { validateAssertion } from "./assertion.js";

export type Subject = {
  id: string;
  key: string;
  instance: string;
  kind: RectKind;
  provider: Provider;
  frame: Frame;
  unit: Unit;
  spaceId: string;
  match: Match;
};
export type Scope = { id: string; subjects: string[] };

export type NormalizedAssertion =
  | { id: string; rule: "metric"; target: string; metric: Metric; comparison: Comparison; value: number; tolerance: number; evidence: string[] }
  | { id: string; rule: "gap"; from: string; to: string; axis: Axis; comparison: Comparison; value: number; tolerance: number; evidence: string[] }
  | { id: string; rule: "alignment"; from: string; to: string; edge: Edge; comparison: Comparison; value: number; tolerance: number; evidence: string[] }
  | { id: string; rule: "containment"; outer: string; inner: string; inset: number; tolerance: number; evidence: string[] }
  | { id: string; rule: "non_overlap"; from: string; to: string; evidence: string[] }
  | { id: string; rule: "presence"; scope: string; target: string; mode: PresenceMode; evidence: string[] }
  | { id: string; rule: "text_equals"; target: string; text: string; evidence: string[] };

export type ExpectationSource = { ref: string; sha256: string | null; approval: { actor: string; ref: string } | null };
export type NormalizedClaim = { kind: ClaimKind; expectationSource: ExpectationSource };

export type NormalizedRequest = {
  requestId: string;
  claim: NormalizedClaim;
  scenario: { id: string; checkpoint: string };
  requiredIdentity: { candidate: string; fixture: { id: string; sha256: string }; environment: { platform: string; density: number; fontScale: number; direction: "ltr" | "rtl" } };
  capturePolicy: { maxIntervalMs: number; requireSteady: boolean };
  subjects: Subject[];
  scopes: Scope[];
  assertions: NormalizedAssertion[];
};

export type ValidationError = { code: string; path: string; message: string };

export const refOf = (s: Subject): ObservationRef => ({ key: s.key, instance: s.instance, kind: s.kind, provider: s.provider });

/** Subject ids one assertion references, in declaration order. */
export function assertionSubjectIds(a: NormalizedAssertion): string[] {
  switch (a.rule) {
    case "metric":
    case "text_equals":
    case "presence":
      return [a.target];
    case "gap":
    case "alignment":
    case "non_overlap":
      return [a.from, a.to];
    case "containment":
      return [a.outer, a.inner];
  }
}

const REQUEST_FIELDS = ["schemaVersion", "contractVersion", "requestId", "claim", "scenario", "requiredIdentity", "capturePolicy", "subjects", "scopes", "assertions"];

/** Validate + normalize a request. Any error means the whole comparison refuses. */
export function validateRequest(input: unknown): { errors: ValidationError[]; request: NormalizedRequest | null } {
  const errors: ValidationError[] = [];
  if (!isObj(input)) return { errors: [{ code: "request-not-object", path: "$", message: "request must be a JSON object" }], request: null };
  checkFields(input, REQUEST_FIELDS, "$", errors);
  if (input.schemaVersion !== REQUEST_SCHEMA_VERSION) errors.push({ code: "request-schema-version", path: "$.schemaVersion", message: `expected ${REQUEST_SCHEMA_VERSION}` });
  const cv = input.contractVersion;
  if (typeof cv !== "string" || cv.split(".")[0] !== String(CONTRACT_MAJOR)) errors.push({ code: "incompatible-major-version", path: "$.contractVersion", message: `expected major ${CONTRACT_MAJOR}.x` });
  else if (cv !== CONTRACT_VERSION) errors.push({ code: "incompatible-minor-version", path: "$.contractVersion", message: `this prototype implements ${CONTRACT_VERSION} exactly` });

  const requestId = str(input.requestId) ? input.requestId : "";
  if (requestId === "") errors.push({ code: "invalid-type", path: "$.requestId", message: "non-empty string required" });

  let claim: NormalizedClaim | null = null;
  if (!isObj(input.claim)) errors.push({ code: "invalid-type", path: "$.claim", message: "object required" });
  else {
    checkFields(input.claim, ["kind", "expectationSource"], "$.claim", errors);
    enumField(input.claim.kind, CLAIM_KINDS, "$.claim.kind", errors);
    const es = isObj(input.claim.expectationSource) ? input.claim.expectationSource : null;
    if (!es) errors.push({ code: "invalid-type", path: "$.claim.expectationSource", message: "object required" });
    else {
      checkFields(es, ["ref", "sha256", "approval"], "$.claim.expectationSource", errors);
      if (!str(es.ref)) errors.push({ code: "missing-expectation-source", path: "$.claim.expectationSource.ref", message: "expectation source reference required" });
      if (es.sha256 !== undefined && !(typeof es.sha256 === "string" && HEX64.test(es.sha256))) errors.push({ code: "invalid-hash", path: "$.claim.expectationSource.sha256", message: "lowercase 64-hex sha256 or omit" });
      let approval: { actor: string; ref: string } | null = null;
      if (es.approval !== undefined) {
        if (typeof es.approval === "string") errors.push({ code: "free-text-approval", path: "$.claim.expectationSource.approval", message: "a bare string is not an approval identity; supply { actor, ref }" });
        else if (!isObj(es.approval)) errors.push({ code: "invalid-type", path: "$.claim.expectationSource.approval", message: "object { actor, ref } required" });
        else {
          checkFields(es.approval, ["actor", "ref"], "$.claim.expectationSource.approval", errors);
          if (!str(es.approval.actor) || !str(es.approval.ref)) errors.push({ code: "missing-approval-identity", path: "$.claim.expectationSource.approval", message: "actor and ref are both required" });
          else approval = { actor: es.approval.actor, ref: es.approval.ref };
        }
      }
      const kind = oneOf(input.claim.kind, CLAIM_KINDS) ? input.claim.kind : null;
      if ((kind === "regression" || kind === "design-parity") && approval === null) {
        errors.push({ code: "missing-approval-identity", path: "$.claim.expectationSource.approval", message: `claim kind ${kind} needs a stated reference/approval identity` });
      }
      if (str(es.ref)) claim = { kind: (kind ?? "qualification") as ClaimKind, expectationSource: { ref: es.ref, sha256: typeof es.sha256 === "string" ? es.sha256 : null, approval } };
    }
  }

  let scenario: NormalizedRequest["scenario"] | null = null;
  if (!isObj(input.scenario)) errors.push({ code: "invalid-type", path: "$.scenario", message: "object required" });
  else {
    checkFields(input.scenario, ["id", "checkpoint"], "$.scenario", errors);
    if (!str(input.scenario.id) || !str(input.scenario.checkpoint)) errors.push({ code: "invalid-type", path: "$.scenario", message: "id and checkpoint must be non-empty strings" });
    else scenario = { id: input.scenario.id, checkpoint: input.scenario.checkpoint };
  }

  let requiredIdentity: NormalizedRequest["requiredIdentity"] | null = null;
  const ri = isObj(input.requiredIdentity) ? input.requiredIdentity : null;
  if (!ri) errors.push({ code: "invalid-type", path: "$.requiredIdentity", message: "object required" });
  else {
    checkFields(ri, ["candidate", "fixture", "environment"], "$.requiredIdentity", errors);
    if (!str(ri.candidate)) errors.push({ code: "invalid-type", path: "$.requiredIdentity.candidate", message: "non-empty string required" });
    const fx = isObj(ri.fixture) ? ri.fixture : null;
    if (!fx) errors.push({ code: "invalid-type", path: "$.requiredIdentity.fixture", message: "object required" });
    else {
      checkFields(fx, ["id", "sha256"], "$.requiredIdentity.fixture", errors);
      if (!str(fx.id)) errors.push({ code: "invalid-type", path: "$.requiredIdentity.fixture.id", message: "non-empty string required" });
      if (!(typeof fx.sha256 === "string" && HEX64.test(fx.sha256))) errors.push({ code: "invalid-hash", path: "$.requiredIdentity.fixture.sha256", message: "lowercase 64-hex sha256 required" });
    }
    const env = isObj(ri.environment) ? ri.environment : null;
    if (!env) errors.push({ code: "invalid-type", path: "$.requiredIdentity.environment", message: "object required" });
    else {
      checkFields(env, ["platform", "density", "fontScale", "direction"], "$.requiredIdentity.environment", errors);
      if (!str(env.platform)) errors.push({ code: "invalid-type", path: "$.requiredIdentity.environment.platform", message: "non-empty string required" });
      if (!(finite(env.density) && env.density > 0)) errors.push({ code: "invalid-number", path: "$.requiredIdentity.environment.density", message: "finite > 0 required" });
      if (!(finite(env.fontScale) && env.fontScale > 0)) errors.push({ code: "invalid-number", path: "$.requiredIdentity.environment.fontScale", message: "finite > 0 required" });
      enumField(env.direction, ["ltr", "rtl"], "$.requiredIdentity.environment.direction", errors);
      if (str(ri.candidate) && fx && str(fx.id) && typeof fx.sha256 === "string" && HEX64.test(fx.sha256) && str(env.platform) && finite(env.density) && finite(env.fontScale) && oneOf(env.direction, ["ltr", "rtl"])) {
        requiredIdentity = { candidate: ri.candidate, fixture: { id: fx.id, sha256: fx.sha256 }, environment: { platform: env.platform, density: env.density, fontScale: env.fontScale, direction: env.direction } };
      }
    }
  }

  let capturePolicy: NormalizedRequest["capturePolicy"] = { maxIntervalMs: 1000, requireSteady: true };
  if (input.capturePolicy !== undefined) {
    if (!isObj(input.capturePolicy)) errors.push({ code: "invalid-type", path: "$.capturePolicy", message: "object required" });
    else {
      checkFields(input.capturePolicy, ["maxIntervalMs", "requireSteady"], "$.capturePolicy", errors);
      if (!(finite(input.capturePolicy.maxIntervalMs) && input.capturePolicy.maxIntervalMs > 0)) errors.push({ code: "invalid-number", path: "$.capturePolicy.maxIntervalMs", message: "finite > 0 required" });
      if (typeof input.capturePolicy.requireSteady !== "boolean") errors.push({ code: "invalid-type", path: "$.capturePolicy.requireSteady", message: "boolean required" });
      if (finite(input.capturePolicy.maxIntervalMs) && input.capturePolicy.maxIntervalMs > 0 && typeof input.capturePolicy.requireSteady === "boolean") capturePolicy = { maxIntervalMs: input.capturePolicy.maxIntervalMs, requireSteady: input.capturePolicy.requireSteady };
    }
  }

  const subjects: Subject[] = [];
  const subjectIds = new Set<string>();
  if (!Array.isArray(input.subjects) || input.subjects.length === 0) errors.push({ code: "missing-subjects", path: "$.subjects", message: "non-empty subject list required" });
  else {
    input.subjects.forEach((raw, index) => {
      const path = `$.subjects[${index}]`;
      if (!isObj(raw)) { errors.push({ code: "invalid-type", path, message: "object required" }); return; }
      checkFields(raw, ["id", "key", "instance", "kind", "provider", "frame", "unit", "spaceId", "match"], path, errors);
      if (!str(raw.id)) errors.push({ code: "invalid-type", path: `${path}.id`, message: "non-empty string required" });
      else if (subjectIds.has(raw.id)) errors.push({ code: "duplicate-subject-id", path: `${path}.id`, message: `subject id "${raw.id}" already declared` });
      if (!str(raw.key)) errors.push({ code: "invalid-type", path: `${path}.key`, message: "non-empty stable project key required" });
      if (raw.instance !== undefined && typeof raw.instance !== "string") errors.push({ code: "invalid-type", path: `${path}.instance`, message: "string required" });
      enumField(raw.kind, RECT_KINDS, `${path}.kind`, errors);
      enumField(raw.provider, PROVIDERS, `${path}.provider`, errors);
      enumField(raw.frame, FRAMES, `${path}.frame`, errors);
      enumField(raw.unit, UNITS, `${path}.unit`, errors);
      enumField(raw.match, MATCHES, `${path}.match`, errors);
      if (raw.spaceId !== undefined && !str(raw.spaceId)) errors.push({ code: "invalid-type", path: `${path}.spaceId`, message: "non-empty string or omit" });
      if (
        str(raw.id) && !subjectIds.has(raw.id) && str(raw.key) && (raw.instance === undefined || typeof raw.instance === "string") &&
        oneOf(raw.kind, RECT_KINDS) && oneOf(raw.provider, PROVIDERS) && oneOf(raw.frame, FRAMES) && oneOf(raw.unit, UNITS) && oneOf(raw.match, MATCHES) &&
        (raw.spaceId === undefined || str(raw.spaceId))
      ) {
        subjectIds.add(raw.id);
        subjects.push({
          id: raw.id,
          key: raw.key,
          instance: typeof raw.instance === "string" ? raw.instance : "",
          kind: raw.kind,
          provider: raw.provider,
          frame: raw.frame,
          unit: raw.unit,
          spaceId: typeof raw.spaceId === "string" ? raw.spaceId : "",
          match: raw.match,
        });
      }
    });
  }
  const byId = new Map(subjects.map((s) => [s.id, s]));

  const scopes: Scope[] = [];
  const scopeIds = new Set<string>();
  if (input.scopes !== undefined) {
    if (!Array.isArray(input.scopes)) errors.push({ code: "invalid-type", path: "$.scopes", message: "array required" });
    else
      input.scopes.forEach((raw, index) => {
        const path = `$.scopes[${index}]`;
        if (!isObj(raw)) { errors.push({ code: "invalid-type", path, message: "object required" }); return; }
        checkFields(raw, ["id", "subjects"], path, errors);
        if (!str(raw.id)) errors.push({ code: "invalid-type", path: `${path}.id`, message: "non-empty string required" });
        else if (scopeIds.has(raw.id)) errors.push({ code: "duplicate-scope-id", path: `${path}.id`, message: `scope id "${raw.id}" already declared` });
        const list = Array.isArray(raw.subjects) && raw.subjects.every(str) ? (raw.subjects as string[]) : null;
        if (!list || list.length === 0) errors.push({ code: "invalid-type", path: `${path}.subjects`, message: "non-empty subject id array required" });
        else for (const sid of list) if (!subjectIds.has(sid)) errors.push({ code: "missing-target", path: `${path}.subjects`, message: `unknown subject id "${sid}"` });
        if (str(raw.id) && !scopeIds.has(raw.id) && list) {
          scopeIds.add(raw.id);
          scopes.push({ id: raw.id, subjects: list });
        }
      });
  }

  const assertions: NormalizedAssertion[] = [];
  const assertionIds = new Set<string>();
  if (!Array.isArray(input.assertions) || input.assertions.length === 0) errors.push({ code: "missing-assertions", path: "$.assertions", message: "non-empty assertion list required" });
  else
    input.assertions.forEach((raw, index) => {
      const before = errors.length;
      const parsed = validateAssertion(raw, index, subjectIds, scopeIds, errors);
      if (errors.length !== before || !parsed) return;
      if (assertionIds.has(parsed.id)) { errors.push({ code: "duplicate-assertion-id", path: `$.assertions[${index}].id`, message: `assertion id "${parsed.id}" already declared` }); return; }
      assertionIds.add(parsed.id);
      assertions.push(parsed);
    });

  for (const a of assertions) {
    if (a.rule === "presence" && !scopes.find(s => s.id === a.scope)?.subjects.includes(a.target)) {
      errors.push({ code: "out-of-scope-target", path: "$.assertions", message: `assertion "${a.id}" target "${a.target}" is not a logical member of scope "${a.scope}"` });
    }
    const pairs: Array<[string, string]> =
      a.rule === "gap" || a.rule === "alignment" || a.rule === "non_overlap" ? [[a.from, a.to]]
      : a.rule === "containment" ? [[a.outer, a.inner]]
      : [];
    for (const [x, y] of pairs) {
      const sx = byId.get(x);
      const sy = byId.get(y);
      if (!sx || !sy) continue;
      if (sx.kind !== sy.kind || sx.provider !== sy.provider || sx.frame !== sy.frame || sx.unit !== sy.unit) {
        errors.push({
          code: "incompatible-subject-semantics",
          path: "$.assertions",
          message: `assertion "${a.id}" mixes ${x} (${sx.kind}/${sx.provider}/${sx.frame}/${sx.unit}) with ${y} (${sy.kind}/${sy.provider}/${sy.frame}/${sy.unit}); relationships require compatible kind/provider/frame/unit`,
        });
      }
      // Space is deliberately NOT checked here: a relationship across two different
      // observed spaceIds is a measurement result (not_measured/incompatible-space),
      // because the declared spaceId is a constraint the capture must satisfy, not a
      // request defect. Scalar facts of either subject stay usable.
    }
  }

  if (errors.length > 0 || !claim || !scenario || !requiredIdentity) return { errors, request: null };
  return { errors: [], request: { requestId, claim, scenario, requiredIdentity, capturePolicy, subjects, scopes, assertions } };
}
