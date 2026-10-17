/**
 * PROTOTYPE (throwaway) — validation of one rule object against the closed
 * catalogue. Field types, enum values and numeric bounds are enforced here, so
 * an unknown rule, unknown field, missing target, missing scope, invalid enum,
 * negative tolerance or NaN-like number is an input error rather than a verdict.
 */
import {
  AXES,
  COMPARISONS,
  EDGES,
  METRICS,
  PRESENCE_MODES,
  RULE_CATALOGUE,
  RULE_KINDS,
  checkFields,
  finite,
  isObj,
  oneOf,
  str,
  type Axis,
  type Comparison,
  type Edge,
  type Metric,
  type PresenceMode,
  type RuleKind,
} from "./vocab.js";
import type { NormalizedAssertion, ValidationError } from "./request.js";

export function validateAssertion(raw: unknown, index: number, subjectIds: Set<string>, scopeIds: Set<string>, errors: ValidationError[]): NormalizedAssertion | null {
  const path = `$.assertions[${index}]`;
  const start = errors.length;
  if (!isObj(raw)) { errors.push({ code: "invalid-type", path, message: "object required" }); return null; }
  if (!oneOf(raw.rule, RULE_KINDS)) { errors.push({ code: "unknown-rule", path: `${path}.rule`, message: `unknown rule ${JSON.stringify(raw.rule)}` }); return null; }
  const rule: RuleKind = raw.rule;
  const spec = RULE_CATALOGUE[rule];
  checkFields(raw, ["id", "rule", ...Object.keys(spec.fields)], path, errors);
  if (!str(raw.id)) errors.push({ code: "invalid-type", path: `${path}.id`, message: "non-empty string required" });
  const v: Record<string, unknown> = {};
  const reject = (name: string, code: string, message: string) => errors.push({ code, path: `${path}.${name}`, message });
  const enumValue = (name: string, value: unknown, allowed: readonly string[]) => {
    if (oneOf(value, allowed)) v[name] = value;
    else reject(name, "invalid-enum", `expected one of ${allowed.join("|")}`);
  };
  const numberValue = (name: string, value: unknown, min: number | null, code: string, message: string) => {
    if (finite(value) && (min === null || value >= min)) v[name] = value;
    else reject(name, code, message);
  };
  for (const [name, fs] of Object.entries(spec.fields)) {
    const value = raw[name];
    if (value === undefined) {
      if (fs.required) reject(name, "missing-field", `rule ${rule} requires "${name}"`);
      continue;
    }
    switch (fs.type) {
      case "subject":
        if (str(value) && subjectIds.has(value)) v[name] = value;
        else reject(name, str(value) ? "missing-target" : "invalid-type", "must reference a declared subject id");
        break;
      case "scope":
        if (str(value) && scopeIds.has(value)) v[name] = value;
        else reject(name, str(value) ? "missing-target" : "invalid-type", "must reference a declared scope id");
        break;
      case "metric":
        enumValue(name, value, METRICS);
        break;
      case "comparison":
        enumValue(name, value, COMPARISONS);
        break;
      case "axis":
        enumValue(name, value, AXES);
        break;
      case "edge":
        enumValue(name, value, EDGES);
        break;
      case "presenceMode":
        enumValue(name, value, PRESENCE_MODES);
        break;
      case "value":
        numberValue(name, value, null, "invalid-number", "finite number required");
        break;
      case "tolerance":
        numberValue(name, value, 0, "invalid-tolerance", "finite tolerance >= 0 required");
        break;
      case "inset":
        numberValue(name, value, 0, "invalid-bounds", "finite inset >= 0 required");
        break;
      case "text":
        if (str(value)) v[name] = value;
        else reject(name, "invalid-type", "non-empty string required");
        break;
      case "evidence":
        if (Array.isArray(value) && value.every(str)) v[name] = value;
        else reject(name, "invalid-type", "string array required");
        break;
    }
  }
  if (errors.length !== start) return null;
  const id = raw.id as string;
  const evidence = (v.evidence as string[] | undefined) ?? [];
  switch (rule) {
    case "metric":
      return { id, rule, target: v.target as string, metric: v.metric as Metric, comparison: v.comparison as Comparison, value: v.value as number, tolerance: v.tolerance as number, evidence };
    case "gap":
      return { id, rule, from: v.from as string, to: v.to as string, axis: v.axis as Axis, comparison: v.comparison as Comparison, value: v.value as number, tolerance: v.tolerance as number, evidence };
    case "alignment":
      return { id, rule, from: v.from as string, to: v.to as string, edge: v.edge as Edge, comparison: v.comparison as Comparison, value: v.value as number, tolerance: v.tolerance as number, evidence };
    case "containment":
      return { id, rule, outer: v.outer as string, inner: v.inner as string, inset: (v.inset as number | undefined) ?? 0, tolerance: v.tolerance as number, evidence };
    case "non_overlap":
      return { id, rule, from: v.from as string, to: v.to as string, evidence };
    case "presence":
      return { id, rule, scope: v.scope as string, target: v.target as string, mode: v.mode as PresenceMode, evidence };
    case "text_equals":
      return { id, rule, target: v.target as string, text: v.text as string, evidence };
  }
}
