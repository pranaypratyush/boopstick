/**
 * PROTOTYPE (throwaway) — rule evaluation over one admitted capture's element view.
 *
 * Pure. Arithmetic and result meanings are the historical checker's:
 *   eq  -> deviation = measured - expected,          |deviation| <= tolerance
 *   min -> deviation = min(0, measured - expected)   (measured >= expected)
 *   max -> deviation = max(0, measured - expected)   (measured <= expected)
 * with expected/measured/deviation/tolerance/evidence preserved per rule.
 *
 * A rule that cannot be measured returns status "not_measured" with an explicit
 * reason and a null measured value: a missing fact is never zero and never a
 * pass, and it never replaces a failure that another rule did measure.
 *
 * Lookups key on user-controlled identity strings, so they are Map-based: a
 * `Record` would let a prototype-like name ("__proto__") mutate the prototype
 * instead of addressing an ordinary entry.
 */
import { display, refEqual, tupleOf, type Comparison, type Edge, type Frame, type ObservationRef, type Provider, type Reason, type RectKind, type Status, type Unit } from "./vocab.js";
import { refOf, type NormalizedAssertion, type Scope, type Subject } from "./request.js";

/** Axis-aligned box in the observation's own coordinate space. */
export type Rect = { x: number; y: number; width: number; height: number };
/** One admitted observation: enums are already validated, facts are already typed. */
export type Element = {
  key: string;
  instance: string;
  kind: RectKind;
  provider: Provider;
  frame: Frame;
  unit: Unit;
  spaceId: string;
  epoch: string;
  rect: Rect | null;
  reportedLineCount: number | null;
  semanticText: string | null;
};
export type Coverage = { requested: ObservationRef[]; observed: ObservationRef[]; complete: boolean; qualified: boolean };
export type Lookup = { byId: Map<string, Subject>; scopes: Scope[]; elements: Element[]; coverage: Map<string, Coverage>; epochId: string };

export type Outcome = {
  id: string;
  rule: string;
  status: Status;
  reason: Reason | null;
  detail: string | null;
  subjects: ObservationRef[];
  expected: unknown;
  measured: unknown;
  deviation: number | null;
  tolerance: number | null;
  evidence: string[];
};

/** The historical checker's expected-value rendering and deviation rule. */
const expectedOf = (c: Comparison, v: number) => (c === "eq" ? v : c === "min" ? `>= ${v}` : `<= ${v}`);

const edgeCoord = (r: Rect, e: Edge): number =>
  e === "left" ? r.x : e === "right" ? r.x + r.width : e === "top" ? r.y : e === "bottom" ? r.y + r.height : e === "centerX" ? r.x + r.width / 2 : r.y + r.height / 2;

function out(a: NormalizedAssertion, subjects: ObservationRef[], expected: unknown, measured: unknown, deviation: number | null, tolerance: number | null, evidence: string[], failure?: { reason: Reason; detail: string }): Outcome {
  const status: Status = failure || deviation === null ? "not_measured" : Math.abs(deviation) <= (tolerance ?? 0) ? "pass" : "fail";
  return { id: a.id, rule: a.rule, status, reason: failure?.reason ?? null, detail: failure?.detail ?? null, subjects, expected, measured: failure ? null : measured, deviation: failure ? null : deviation, tolerance, evidence };
}

export const notMeasured = (a: NormalizedAssertion, subjects: ObservationRef[], reason: Reason, detail: string, expected: unknown, tolerance: number | null, evidence: string[]): Outcome =>
  out(a, subjects, expected, null, null, tolerance, evidence, { reason, detail });

function numericOut(a: Extract<NormalizedAssertion, { rule: "metric" | "gap" | "alignment" }>, subjects: ObservationRef[], measured: number, evidence: string[]): Outcome {
  const expected = expectedOf(a.comparison, a.value);
  if (!Number.isFinite(measured)) return notMeasured(a, subjects, "invalid-fact", `${a.rule} requires a finite measurement`, expected, a.tolerance, evidence);
  const difference = measured - a.value;
  if (!Number.isFinite(difference)) return notMeasured(a, subjects, "invalid-fact", `${a.rule} requires a finite unsaturated deviation`, expected, a.tolerance, evidence);
  const deviation = a.comparison === "eq" ? difference : a.comparison === "min" ? Math.min(0, difference) : Math.max(0, difference);
  return out(a, subjects, expected, measured, deviation, a.tolerance, evidence);
}

type Resolved = { ok: true; el: Element } | { ok: false; reason: Reason; detail: string };

/**
 * Resolve one subject to its single captured observation. The captured tuple
 * [key, instance, kind, provider] is unique after admission, so the only
 * admissible match is the element whose tuple equals the subject's; the declared
 * frame/unit (and spaceId, when the subject constrains it) must then agree.
 */
function resolve(ctx: Lookup, id: string): Resolved {
  const subject = ctx.byId.get(id);
  if (!subject) return { ok: false, reason: "missing-fact", detail: `unknown subject ${id}` };
  const ref = refOf(subject);
  const el = ctx.elements.find((e) => e.key === subject.key && e.instance === subject.instance && e.kind === subject.kind && e.provider === subject.provider);
  if (!el) return { ok: false, reason: "missing-fact", detail: `no captured observation for ${display(ref)}` };
  if (el.epoch !== ctx.epochId) return { ok: false, reason: "mixed-epochs", detail: `observation ${display(ref)} belongs to epoch ${JSON.stringify(el.epoch)}, capture epoch is ${JSON.stringify(ctx.epochId)}` };
  if (el.frame !== subject.frame || el.unit !== subject.unit) {
    return { ok: false, reason: "incompatible-kind", detail: `observation ${display(ref)} is ${el.frame}/${el.unit} but the subject declares ${subject.frame}/${subject.unit}` };
  }
  if (subject.spaceId !== "" && el.spaceId !== subject.spaceId) {
    return { ok: false, reason: "incompatible-space", detail: `observation ${display(ref)} is in space ${JSON.stringify(el.spaceId)} but the subject requires ${JSON.stringify(subject.spaceId)}` };
  }
  return { ok: true, el };
}

const labelOf = (ctx: Lookup, id: string): ObservationRef => {
  const subject = ctx.byId.get(id);
  return subject ? refOf(subject) : { key: id, instance: "", kind: "layout", provider: "synthetic" };
};

type Pair = { from: Rect; to: Rect; fromLabel: ObservationRef; toLabel: ObservationRef } | { reason: Reason; detail: string };

/**
 * Resolve both members of a position relationship and require one observed
 * coordinate space. Frame, unit and box kind already agree because admission
 * matched each observation to its subject and the request required both subjects
 * to declare the same semantics; the observed spaceId is what can still differ.
 */
function pairRects(ctx: Lookup, fromId: string, toId: string): Pair {
  const fromLabel = labelOf(ctx, fromId);
  const toLabel = labelOf(ctx, toId);
  const f = resolve(ctx, fromId);
  if (!f.ok) return { reason: f.reason, detail: f.detail };
  const t = resolve(ctx, toId);
  if (!t.ok) return { reason: t.reason, detail: t.detail };
  const fromRect = f.el.rect;
  const toRect = t.el.rect;
  if (!fromRect) return { reason: "missing-fact", detail: `observation ${display(fromLabel)} carries no rect fact` };
  if (!toRect) return { reason: "missing-fact", detail: `observation ${display(toLabel)} carries no rect fact` };
  if (f.el.spaceId !== t.el.spaceId) {
    return {
      reason: "incompatible-space",
      detail: `a position relationship needs one observed coordinate space, but ${display(fromLabel)} is in ${JSON.stringify(f.el.spaceId)} and ${display(toLabel)} is in ${JSON.stringify(t.el.spaceId)}`,
    };
  }
  return { from: fromRect, to: toRect, fromLabel, toLabel };
}

function metricOutcome(a: Extract<NormalizedAssertion, { rule: "metric" }>, ctx: Lookup): Outcome {
  const label = labelOf(ctx, a.target);
  const expected = expectedOf(a.comparison, a.value);
  const r = resolve(ctx, a.target);
  if (!r.ok) return notMeasured(a, [label], r.reason, r.detail, expected, a.tolerance, a.evidence);
  if (a.metric === "reportedLineCount") {
    const count = r.el.reportedLineCount;
    if (count === null) return notMeasured(a, [label], "missing-fact", `no reportedLineCount fact on ${display(label)}; a line count is never derived from height, a geometry quotient or character ranges`, expected, a.tolerance, a.evidence);
    return numericOut(a, [label], count, [...a.evidence, `capture.elements[${display(label)}].reportedLineCount (a reported count only, not glyph coverage)`]);
  }
  if (!r.el.rect) return notMeasured(a, [label], "missing-fact", `observation ${display(label)} carries no rect fact`, expected, a.tolerance, a.evidence);
  const w = r.el.rect.width;
  const h = r.el.rect.height;
  let measured: number;
  if (a.metric === "width") measured = w;
  else if (a.metric === "height") measured = h;
  else {
    if (!(h > 0)) return notMeasured(a, [label], "invalid-fact", `aspectRatio of ${display(label)} requires height > 0`, expected, a.tolerance, a.evidence);
    measured = w / h;
  }
  return numericOut(a, [label], measured, [...a.evidence, `capture.elements[${display(label)}].rect`]);
}

function gapOutcome(a: Extract<NormalizedAssertion, { rule: "gap" }>, ctx: Lookup): Outcome {
  const expected = expectedOf(a.comparison, a.value);
  const p = pairRects(ctx, a.from, a.to);
  if ("reason" in p) return notMeasured(a, [labelOf(ctx, a.from), labelOf(ctx, a.to)], p.reason, p.detail, expected, a.tolerance, a.evidence);
  const evidence = [...a.evidence, `capture.elements[${display(p.fromLabel)}].rect`, `capture.elements[${display(p.toLabel)}].rect`];
  const fromEdge = a.axis === "x" ? p.from.x + p.from.width : p.from.y + p.from.height;
  if (!Number.isFinite(fromEdge)) return notMeasured(a, [p.fromLabel, p.toLabel], "invalid-fact", "gap requires a finite selected from edge", expected, a.tolerance, evidence);
  const measured = (a.axis === "x" ? p.to.x : p.to.y) - fromEdge;
  return numericOut(a, [p.fromLabel, p.toLabel], measured, evidence);
}

function alignmentOutcome(a: Extract<NormalizedAssertion, { rule: "alignment" }>, ctx: Lookup): Outcome {
  const expected = expectedOf(a.comparison, a.value);
  const p = pairRects(ctx, a.from, a.to);
  if ("reason" in p) return notMeasured(a, [labelOf(ctx, a.from), labelOf(ctx, a.to)], p.reason, p.detail, expected, a.tolerance, a.evidence);
  const evidence = [...a.evidence, `capture.elements[${display(p.fromLabel)}].rect.${a.edge}`, `capture.elements[${display(p.toLabel)}].rect.${a.edge}`];
  const fromEdge = edgeCoord(p.from, a.edge);
  const toEdge = edgeCoord(p.to, a.edge);
  if (!Number.isFinite(fromEdge) || !Number.isFinite(toEdge)) return notMeasured(a, [p.fromLabel, p.toLabel], "invalid-fact", "alignment requires finite selected edges", expected, a.tolerance, evidence);
  return numericOut(a, [p.fromLabel, p.toLabel], fromEdge - toEdge, evidence);
}

function containmentOutcome(a: Extract<NormalizedAssertion, { rule: "containment" }>, ctx: Lookup): Outcome {
  const p = pairRects(ctx, a.outer, a.inner);
  if ("reason" in p) return notMeasured(a, [labelOf(ctx, a.outer), labelOf(ctx, a.inner)], p.reason, p.detail, "<= 0", a.tolerance, a.evidence);
  const evidence = [...a.evidence, `capture.elements[${display(p.fromLabel)}].rect`, `capture.elements[${display(p.toLabel)}].rect`];
  const left = p.from.x + a.inset;
  const outerRight = p.from.x + p.from.width;
  const right = outerRight - a.inset;
  const innerRight = p.to.x + p.to.width;
  const top = p.from.y + a.inset;
  const outerBottom = p.from.y + p.from.height;
  const bottom = outerBottom - a.inset;
  const innerBottom = p.to.y + p.to.height;
  if (![left, outerRight, right, innerRight, top, outerBottom, bottom, innerBottom].every(Number.isFinite)) return notMeasured(a, [p.fromLabel, p.toLabel], "invalid-fact", "containment requires finite inset boundaries and original edges", "<= 0", a.tolerance, evidence);
  const terms = [left - p.to.x, innerRight - right, top - p.to.y, innerBottom - bottom];
  if (!terms.every(Number.isFinite)) return notMeasured(a, [p.fromLabel, p.toLabel], "invalid-fact", "containment requires finite violation terms before maximum reduction", "<= 0", a.tolerance, evidence);
  const violation = Math.max(...terms);
  return out(a, [p.fromLabel, p.toLabel], "<= 0", violation, Math.max(0, violation), a.tolerance, evidence);
}

function nonOverlapOutcome(a: Extract<NormalizedAssertion, { rule: "non_overlap" }>, ctx: Lookup): Outcome {
  const p = pairRects(ctx, a.from, a.to);
  if ("reason" in p) return notMeasured(a, [labelOf(ctx, a.from), labelOf(ctx, a.to)], p.reason, p.detail, "disjoint", 0, a.evidence);
  const a1 = p.from;
  const b1 = p.to;
  const evidence = [...a.evidence, `capture.elements[${display(p.fromLabel)}].rect`, `capture.elements[${display(p.toLabel)}].rect`];
  const aRight = a1.x + a1.width;
  const bRight = b1.x + b1.width;
  const aBottom = a1.y + a1.height;
  const bBottom = b1.y + b1.height;
  if (![aRight, bRight, aBottom, bBottom].every(Number.isFinite)) return notMeasured(a, [p.fromLabel, p.toLabel], "invalid-fact", "non_overlap requires finite right and bottom edges on both axes", "disjoint", 0, evidence);
  const overlapping = Math.max(a1.x, b1.x) < Math.min(aRight, bRight) && Math.max(a1.y, b1.y) < Math.min(aBottom, bBottom);
  return out(a, [p.fromLabel, p.toLabel], "disjoint", overlapping ? "intersects" : "disjoint", overlapping ? 1 : 0, 0, evidence);
}

function presenceOutcome(a: Extract<NormalizedAssertion, { rule: "presence" }>, ctx: Lookup): Outcome {
  const label = labelOf(ctx, a.target);
  const cov = ctx.coverage.get(a.scope);
  const evidence = cov ? [...a.evidence, `capture.coverage[${JSON.stringify(a.scope)}]`] : a.evidence;
  const scope = ctx.scopes.find(s => s.id === a.scope)!;
  const expected = new Set(scope.subjects.map(id => tupleOf(refOf(ctx.byId.get(id)!))));
  if (!cov || cov.requested.length !== expected.size || cov.requested.some(ref => !expected.has(tupleOf(ref)))) {
    return notMeasured(a, [label], "incomplete-scope", `scope ${JSON.stringify(a.scope)} ${cov ? "requested set differs from logical scope's physical references" : "coverage record is missing"}`, a.mode, 0, evidence);
  }
  // Positive evidence is a current, eligible observation; completeness is only needed to
  // derive absence, so an incomplete scope must never suppress a present observation.
  const resolved = resolve(ctx, a.target);
  const requested = cov !== undefined && cov.requested.some((r) => refEqual(r, label));
  const recordedObserved = cov !== undefined && cov.observed.some((r) => refEqual(r, label));
  const absenceConfirmed = cov !== undefined && cov.complete && cov.qualified && requested && !recordedObserved;
  if (resolved.ok) {
    const ok = a.mode === "present";
    return out(a, [label], a.mode, "present", ok ? 0 : 1, 0, evidence);
  }
  if (a.mode === "present") {
    // a complete qualified enumeration that requested the subject and did not observe it is
    // a confirmed absence: a measured failure, never an evidence gap
    if (absenceConfirmed) return out(a, [label], a.mode, "absent", 1, 0, evidence);
    return notMeasured(a, [label], resolved.reason, resolved.detail, a.mode, 0, evidence);
  }
  if (recordedObserved) {
    return notMeasured(a, [label], resolved.reason, `scope ${JSON.stringify(a.scope)} records ${display(label)} as observed, but no current eligible observation backs it (${resolved.detail})`, a.mode, 0, evidence);
  }
  if (absenceConfirmed) return out(a, [label], a.mode, "absent", 0, 0, evidence);
  const scopeState = cov === undefined ? "no coverage entry" : `complete=${cov.complete} qualified=${cov.qualified} requested=${requested}`;
  return notMeasured(a, [label], "incomplete-scope", `scope ${JSON.stringify(a.scope)} cannot prove the absence of ${display(label)}: ${scopeState}`, a.mode, 0, evidence);
}

function textEqualsOutcome(a: Extract<NormalizedAssertion, { rule: "text_equals" }>, ctx: Lookup): Outcome {
  const label = labelOf(ctx, a.target);
  const r = resolve(ctx, a.target);
  if (!r.ok) return notMeasured(a, [label], r.reason, r.detail, a.text, 0, a.evidence);
  const value = r.el.semanticText;
  if (value === null) {
    return notMeasured(a, [label], "missing-fact", `no explicit semantic-text fact (provenance semantic-label) on ${display(label)}; visible text, accessibility labels and text-fit are not accepted`, a.text, 0, a.evidence);
  }
  return out(a, [label], a.text, value, value === a.text ? 0 : 1, 0, [...a.evidence, `capture.elements[${display(label)}].semanticText (semantic-text equality only, not a fit or visibility check)`]);
}

export function evaluate(a: NormalizedAssertion, ctx: Lookup): Outcome {
  switch (a.rule) {
    case "metric":
      return metricOutcome(a, ctx);
    case "gap":
      return gapOutcome(a, ctx);
    case "alignment":
      return alignmentOutcome(a, ctx);
    case "containment":
      return containmentOutcome(a, ctx);
    case "non_overlap":
      return nonOverlapOutcome(a, ctx);
    case "presence":
      return presenceOutcome(a, ctx);
    case "text_equals":
      return textEqualsOutcome(a, ctx);
  }
}
