/**
 * Isolated offline comparator 3.1 vocabulary, cut over from the historical 3.0
 * snapshot (itself derived from historical 2.1; its artifacts stay immutable).
 * Only compare/canonicalReport are supported entrypoints; no platform adoption.
 * Observation identity remains the structured [key, instance, kind, provider] tuple.
 */

export const CONTRACT_VERSION = "3.1";
export const CONTRACT_MAJOR = 3;
export const REPORT_VERSION = 3;
export const REQUEST_SCHEMA_VERSION = 3;
export const CAPTURE_SCHEMA_VERSION = 2;

export type Status = "pass" | "fail" | "not_measured";
export type ClaimKind = "qualification" | "requirement" | "regression" | "design-parity";
export type RectKind = "layout" | "accessibility";
export type Provider = "rn-measure-in-window" | "rn-onlayout" | "rn-ontextlayout" | "adb-uiautomator" | "synthetic" | "web-dom-border-box";
export type Frame = "root" | "window" | "screen";
export type Unit = "dp" | "logical-px" | "physical-px";
export type Metric = "width" | "height" | "aspectRatio" | "reportedLineCount";
export type Comparison = "eq" | "min" | "max";
export type Axis = "x" | "y";
export type Edge = "left" | "right" | "top" | "bottom" | "centerX" | "centerY";
export type PresenceMode = "present" | "absent";
export type RuleKind = "metric" | "gap" | "alignment" | "containment" | "non_overlap" | "presence" | "text_equals";
export type Match = "one";
export type Reason =
  | "missing-fact"
  | "invalid-fact"
  | "incompatible-kind"
  | "incompatible-space"
  | "incomplete-scope"
  | "unsupported-capability"
  | "identity-mismatch"
  | "stale-epoch"
  | "mixed-epochs"
  | "incoherent-capture"
  | "synthetic-not-live-evidence";

export const CLAIM_KINDS: readonly ClaimKind[] = ["qualification", "requirement", "regression", "design-parity"];
export const RECT_KINDS: readonly RectKind[] = ["layout", "accessibility"];
export const PROVIDERS: readonly Provider[] = ["rn-measure-in-window", "rn-onlayout", "rn-ontextlayout", "adb-uiautomator", "synthetic", "web-dom-border-box"];

export const FRAMES: readonly Frame[] = ["root", "window", "screen"];
export const UNITS: readonly Unit[] = ["dp", "logical-px", "physical-px"];
export const METRICS: readonly Metric[] = ["width", "height", "aspectRatio", "reportedLineCount"];
export const COMPARISONS: readonly Comparison[] = ["eq", "min", "max"];
export const AXES: readonly Axis[] = ["x", "y"];
export const EDGES: readonly Edge[] = ["left", "right", "top", "bottom", "centerX", "centerY"];
export const PRESENCE_MODES: readonly PresenceMode[] = ["present", "absent"];
export const RULE_KINDS: readonly RuleKind[] = ["metric", "gap", "alignment", "containment", "non_overlap", "presence", "text_equals"];
export const MATCHES: readonly Match[] = ["one"];

export const HEX64 = /^[a-f0-9]{64}$/;

/** Limits every report must expose: what this prototype does not establish. */
export const LIMITATIONS = [
  "validation checks declarations only: not filesystem truth, not the executed JavaScript bundle, not project authorization",
  "synthetic evidence never satisfies a regression or design-parity claim",
  "no modal, scroll, IME, clip, glyph-ink, ellipsis or painted-visibility semantics",
] as const;


/** A structured observation reference. Identity is the whole tuple, never a joined string. */
export type ObservationRef = { key: string; instance: string; kind: RectKind; provider: Provider };

export const refEqual = (a: ObservationRef, b: ObservationRef): boolean =>
  a.key === b.key && a.instance === b.instance && a.kind === b.kind && a.provider === b.provider;

/** Unambiguous Map key for a tuple (JSON escaping, not delimiter concatenation). */
export const tupleOf = (r: ObservationRef): string => JSON.stringify([r.key, r.instance, r.kind, r.provider]);

/** Human label for detail/evidence strings only; never used for correspondence. */
export const display = (r: ObservationRef): string =>
  `key=${JSON.stringify(r.key)} instance=${JSON.stringify(r.instance)} (${r.kind}/${r.provider})`;

type FieldType = "subject" | "scope" | "metric" | "comparison" | "axis" | "edge" | "presenceMode" | "value" | "tolerance" | "inset" | "text" | "evidence";
type FieldSpec = { type: FieldType; required: boolean };

const S = (type: FieldType, required = true): FieldSpec => ({ type, required });
const EV: FieldSpec = { type: "evidence", required: false };

/** Closed assertion fields used by admission, not a descriptor API. */
export const RULE_CATALOGUE: Record<RuleKind, { fields: Record<string, FieldSpec> }> = {
  metric: { fields: { target: S("subject"), metric: S("metric"), comparison: S("comparison"), value: S("value"), tolerance: S("tolerance"), evidence: EV } },
  gap: { fields: { from: S("subject"), to: S("subject"), axis: S("axis"), comparison: S("comparison"), value: S("value"), tolerance: S("tolerance"), evidence: EV } },
  alignment: { fields: { from: S("subject"), to: S("subject"), edge: S("edge"), comparison: S("comparison"), value: S("value"), tolerance: S("tolerance"), evidence: EV } },
  containment: { fields: { outer: S("subject"), inner: S("subject"), inset: S("inset", false), tolerance: S("tolerance"), evidence: EV } },
  non_overlap: { fields: { from: S("subject"), to: S("subject"), evidence: EV } },
  presence: { fields: { scope: S("scope"), target: S("subject"), mode: S("presenceMode"), evidence: EV } },
  text_equals: { fields: { target: S("subject"), text: S("text"), evidence: EV } },
};

export const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
export const finite = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
export const safeCount = (v: unknown): v is number => typeof v === "number" && Number.isSafeInteger(v) && v >= 0;
export const str = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;
export const oneOf = <T extends string>(v: unknown, allowed: readonly T[]): v is T => typeof v === "string" && (allowed as readonly string[]).includes(v);

export type VocabError = { code: string; path: string; message: string };

/** Reject any field the closed vocabulary does not declare. */
export function checkFields(obj: Record<string, unknown>, allowed: string[], path: string, errors: VocabError[]): void {
  for (const key of Object.keys(obj)) if (!allowed.includes(key)) errors.push({ code: "unknown-field", path: `${path}.${key}`, message: `unknown field "${key}"` });
}

export function enumField(v: unknown, allowed: readonly string[], path: string, errors: VocabError[]): void {
  if (!oneOf(v, allowed)) errors.push({ code: "invalid-enum", path, message: `expected one of ${allowed.join("|")}, got ${JSON.stringify(v)}` });
}

/** Deterministic canonical form: sorted keys, -0 normalised, prototype-safe. */
export function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (isObj(value)) {
    // null prototype: a literal key such as "__proto__" must stay an own data property
    const out: Record<string, unknown> = Object.create(null) as Record<string, unknown>;
    for (const key of Object.keys(value).sort()) out[key] = canonicalize(value[key]);
    return out;
  }
  if (typeof value === "number" && Object.is(value, -0)) return 0;
  return value;
}

