# Boopstick contract 3.1

Canonical public contract for the pure `compare(request, capture)` and `canonicalReport(report)` functions and the offline package CLI. Request schema is **3**, capture schema **2**, report version **3**. Both inputs require exact string `contractVersion: "3.1"`; other minors, including `"3.0"`, and other majors are refused. There is no compatibility alias, preflight, collector or descriptor endpoint. Contract documentation is not producer qualification or proof the package/skill has passed independent verification.

## Wire conventions and closed vocabulary

Inputs are JSON values. Objects below are non-null, non-array objects. A nonempty string means its trimmed length is positive, but the actual string is retained, not trimmed. Identity comparisons are exact, case-sensitive equality. Numeric strings are not numbers; numeric values must be finite. A hash is exactly 64 lowercase hexadecimal characters; syntax validation does not read or hash an artifact.

Every normative object rejects unknown own fields, including nested objects and rule-specific fields. Request objects have no extension slot. Only capture's top-level optional `extensions` object permits uninterpreted data; its contents are ignored and not copied into reports. It cannot alter or override normative fields. An empty extensions object is valid; null/array is not. Omission is different from explicit null: optional wire fields below reject null. JS callers may use `undefined` as omission for optional values; normalized report fields can be null even though the corresponding input field cannot.

| Vocabulary | Values |
|---|---|
| claim kind | `qualification`, `requirement`, `regression`, `design-parity` |
| observation kind | `layout`, `accessibility` |
| provider | `rn-measure-in-window`, `rn-onlayout`, `rn-ontextlayout`, `adb-uiautomator`, `synthetic`, `web-dom-border-box` |
| frame | `root`, `window`, `screen` |
| unit | `dp`, `logical-px`, `physical-px` |
| metric | `width`, `height`, `aspectRatio`, `reportedLineCount` |
| comparison | `eq`, `min`, `max` |
| axis | `x`, `y` |
| edge | `left`, `right`, `top`, `bottom`, `centerX`, `centerY` |
| presence mode | `present`, `absent` |
| match | `one` only |

No implicit coordinate conversion, tolerance, rounding, provider inference or plural selection is performed. Provider admission is a closed enum check, not verification of acquisition, units or platform compatibility. Direct DOM border-box acquisition uses `web-dom-border-box`, not a relabelled RN or synthetic provider. The runtime does not impose a provider-to-kind/frame/unit/platform capability matrix, require the top-level provider to equal all element providers, or attest any provider from its name. Producers must supply truthful, qualified semantics.

An observation reference is `{key, instance?, kind, provider}`: key is nonempty, instance is any string (including empty) and defaults to `""`. Its identity is the entire structured tuple `[key, instance, kind, provider]`. Separators inside strings have no special meaning. Frame/unit/space/epoch are eligibility constraints, not tuple identity.

## Request wire shape

The only root fields are those in this table. All are required except the explicitly optional ones.

| Field | Wire requirements / default |
|---|---|
| `schemaVersion` | number `3` |
| `contractVersion` | exact `"3.1"` |
| `requestId` | nonempty string |
| `claim` | `{kind, expectationSource}`; kind from vocabulary |
| `scenario` | `{id, checkpoint}`, both nonempty strings |
| `requiredIdentity` | `{candidate, fixture, environment}`, detailed below |
| `capturePolicy?` | `{maxIntervalMs, requireSteady}`; if omitted entirely, defaults to `{maxIntervalMs: 1000, requireSteady: true}`. If supplied, both fields required: finite `maxIntervalMs > 0`, boolean `requireSteady`. No per-field defaults. |
| `subjects` | nonempty array of subject objects; unique subject IDs |
| `scopes?` | array of scopes, defaults to `[]`; empty array valid |
| `assertions` | nonempty array of assertion objects; unique assertion IDs |

`claim.expectationSource` permits exactly `{ref, sha256?, approval?}`. `ref` is nonempty. `sha256`, if supplied, is a hash, otherwise normalized to null. `approval`, if supplied, is `{actor, ref}`, both nonempty strings. Bare approval strings are refused. `regression` and `design-parity` require this declared approval identity; the other claim kinds may omit it, normalizing to null. No cryptographic approval, ownership, reference independence or genuine human decision is verified.

`requiredIdentity.candidate` is a nonempty build-identity string, **not** the capture's `{buildId}` object. `fixture` is `{id, sha256}` with nonempty id and required hash. `environment` is `{platform, density, fontScale, direction}`: platform is any nonempty string; density and fontScale are finite numbers greater than zero; direction is `ltr` or `rtl`. These fields have no defaults. Further conditions such as locale/fonts, viewport or attempt identity must be bound by the consumer's existing scenario/artifact system; they are not extra wire fields.

### Subjects, scopes and aliases

A subject permits exactly `{id, key, instance?, kind, provider, frame, unit, spaceId?, match}`. `id` and `key` are nonempty; vocabulary fields are required; `instance` defaults to `""`. Supplied `spaceId` must be nonempty; omission normalizes to `""`, meaning no declared space constraint. `match` must be `one` even if a tuple has aliases.

A scope is `{id, subjects}`: nonempty id and nonempty array of nonempty declared **logical subject IDs**. Scope IDs are unique. Repeated members are not separately rejected; physical references are deduplicated when deriving the expected coverage set. Subject, scope and assertion IDs are separate namespaces. Different logical subjects may alias the same observation tuple while having different frame/unit/space constraints. Eligibility is recomputed per logical alias.

A presence assertion's target must be a logical member of its chosen scope; another alias of the same tuple cannot supply membership. Violation refuses the entire request before capture admission. `requireComplete` is not a request-scope field; either boolean value is an unknown-field error, even on an otherwise scalar-only request.

### Assertion wire fields

Every assertion requires nonempty `id`, a listed `rule` and that rule's required fields. `evidence?` is optional on every rule, defaults to `[]`, and must be an array of nonempty strings (empty array allowed). Subject/scope operands must name declared IDs. Unlisted fields are refused rather than ignored.

| Rule | Required rule-specific fields | Optional rule-specific fields |
|---|---|---|
| `metric` | `target`, `metric`, `comparison`, `value`, `tolerance` | none |
| `gap` | `from`, `to`, `axis`, `comparison`, `value`, `tolerance` | none |
| `alignment` | `from`, `to`, `edge`, `comparison`, `value`, `tolerance` | none |
| `containment` | `outer`, `inner`, `tolerance` | `inset` defaults to `0` |
| `non_overlap` | `from`, `to` | none |
| `presence` | `scope`, `target`, `mode` | none |
| `text_equals` | `target`, `text` | none |

`value` is any finite number, including negative or fractional. `tolerance` is required wherever shown and must be finite and nonnegative; there is no implicit numeric tolerance. `inset` is finite and nonnegative. Expected `text` is nonempty (an empty captured semantic string is nevertheless valid evidence). All enum operands use the vocabulary above.

Paired rules (`gap`, `alignment`, `containment`, `non_overlap`) require both subjects to declare the same kind/provider/frame/unit or the request is invalid. Declared space IDs may differ: this is not rejected at request admission. Observed space disagreement later withholds that relationship, leaving independent eligible scalar facts usable. Reusing the same subject as both operands is not prohibited.

## Capture wire shape

All root fields below except `extensions` are required. `elements` and `coverage` can be empty arrays; `rawEvidence` can be empty only for synthetic origin.

| Field | Wire requirements |
|---|---|
| `schemaVersion` | number `2` |
| `contractVersion` | exact `"3.1"` |
| `captureId` | nonempty string |
| `origin` | `live` or `synthetic` |
| `provider` | provider enum |
| `collector` | `{id, sha256}`; nonempty id, required hash |
| `scenario` | `{id, checkpoint}`; nonempty strings |
| `candidate` | `{buildId}`; nonempty string |
| `fixture` | `{id, sha256}`; nonempty id, required hash |
| `environment` | `{platform, density, fontScale, direction}` with the same validation as required environment |
| `epoch` | `{id, startedAt, endedAt, steady}`; nonempty id, finite times, `endedAt >= startedAt`, boolean steady |
| `coverage` | array of coverage records |
| `elements` | array of observation objects |
| `rawEvidence` | array of `{ref, sha256}`; nonempty ref, required hash; live origin requires at least one valid entry |
| `extensions?` | uninterpreted object, omitted by default |

There is no timestamp positivity/integer requirement: epoch times are finite millisecond values used only for duration comparison. Equal times are admitted. Live origin with a synthetic root provider or any synthetic element provider is invalid capture. Synthetic origin does not require all providers to be `synthetic`; regardless of provider labels, synthetic origin cannot satisfy regression/design-parity.

### Elements and optional facts

An element permits exactly `{key, instance?, kind, provider, frame, unit, epoch?, spaceId?, rect?, reportedLineCount?, semanticText?}`. Key is nonempty; kind/provider/frame/unit are required enums. Instance defaults to `""`. Element epoch, if omitted, defaults to capture epoch id; a supplied epoch must be nonempty. Supplied spaceId must be nonempty; omission normalizes to `""` unless a rectangle requires it.

At least one supported fact is required. Supplying a malformed fact invalidates the **whole capture**, even if another fact or element is valid or the malformed item is unused by the request. Facts are not silently dropped.

- `rect`: exactly `{x, y, width, height}` with finite numbers and nonnegative dimensions. Negative/fractional positions and zero dimensions are valid. A rectangle requires a nonempty `spaceId`; frame alone is insufficient. No edges are precomputed at admission; later overflow is rule-local.
- `reportedLineCount`: nonnegative safe integer, including zero. Not inferred from height, line height, text length or character ranges.
- `semanticText`: exactly `{value, provenance}`. Value may be any string, including empty; provenance must be `semantic-label`. This is semantic equality, not visible ink, fit or ellipsis evidence.

Captured tuples must be unique across all elements. Identical duplicate records are invalid evidence, not aliases or last-write-wins. Tuple uniqueness is unaffected by different frame/unit/space/epoch values.

### Coverage admission versus selected-scope use

Each coverage record is exactly `{scope, requested, observed, complete, qualified}`: scope is nonempty, flags are required booleans, and each list is an array of observation references (empty allowed). References use the optional-instance default above; duplicate tuples within either list are invalid. Coverage scope strings must be unique. Extra scope records and references not used by the request are not inherently rejected, but all must be internally valid.

The entire capture is invalid if any of these consistency checks fails, even for an unselected scope:

1. Every observed tuple must occur in that record's requested list.
2. Every observed tuple must have an element.
3. Every requested tuple that has an element must be listed as observed in that scope.

Only presence rules consume coverage for an obligation. After whole-input admission and global blockers, the **selected** scope's record must exist and its requested physical-reference set must equal the deduplicated set derived from that request scope's logical members. Order and alias multiplicity do not change set equality. A different scope record cannot substitute. Missing/mismatched selected coverage yields only that presence assertion's `not_measured/incomplete-scope`; it does not invalidate a well-formed capture or suppress unrelated scalars.

## Evaluation precedence and withholding

The order is observable:

1. Validate the whole request, including logical membership and paired semantics. Any request error yields `invalid_request` with no outcomes; capture is not admitted and no capture errors are collected.
2. Admit the whole capture, including unused records and coverage contradictions. Any error yields `invalid_capture` with no outcomes, overriding subsequent identity or local problems.
3. Apply the first capture-wide blocker below to **all** assertions.
4. For presence, require selected-scope set agreement before resolving the target. Other rules resolve their operands directly.
5. Resolve logical subjects in operand order; check required facts and spaces; evaluate only the arithmetic the selected rule needs.

Capture-wide blockers, first-match order:

| Order | Condition | Reason |
|---|---|---|
| 1 | scenario id/checkpoint, candidate buildId, fixture id/hash or any required environment field differs | `identity-mismatch` |
| 2 | `endedAt - startedAt > maxIntervalMs` | `stale-epoch` |
| 3 | policy requires steady and epoch.steady is false | `incoherent-capture` |
| 4 | synthetic origin with regression/design-parity claim | `synthetic-not-live-evidence` |

`maxIntervalMs` bounds collection duration, **not current-clock age**. No wall-clock freshness, executed-build attestation or atomic common-revision collection is inferred from matching declarations. Global blockers produce null expected/measured/deviation/tolerance, the assertion's references/evidence and the selected reason/detail. They precede all per-assertion survival.

Subject resolution uses exact tuple, then checks in order: missing observation (`missing-fact`), element epoch different from capture epoch (`mixed-epochs`), frame/unit mismatch (`incompatible-kind`), then mismatch with a nonempty declared spaceId (`incompatible-space`). A subject without a declared space constraint can use any observed space, but pair rules still require both observed spaces to agree. Pair resolution checks first operand, then second, then first/second rect availability (`missing-fact`), then shared observed space (`incompatible-space`). Resolution does not share eligibility across aliases.

### Presence truth table

This table applies only after matching selected-scope coverage and no global blocker.

| Target evidence | `present` obligation | `absent` obligation |
|---|---|---|
| Current eligible observation | measured pass (`present`) | measured fail (`present`) |
| Truly missing; requested but not observed; complete **and** qualified | measured fail (`absent`) | measured pass (`absent`) |
| Missing, incomplete or unqualified | `not_measured/missing-fact` | `not_measured/incomplete-scope` |
| Recorded observed, but epoch/frame/unit/space ineligible | `not_measured` with resolution reason | `not_measured` with resolution reason |

Eligible positive presence does not require complete/qualified enumeration. Ineligible observations never become absent: capture consistency requires their tuple to remain observed. A scope flag cannot turn a missing fact into zero or authorize a different logical target.

## Rule measurements, deviations and finite arithmetic

For `metric`, `gap` and `alignment`, expected is the numeric value for `eq`, string `">= VALUE"` for `min`, or `"<= VALUE"` for `max`. First compute finite measurement `m` and finite **unsaturated** difference `d = m - value`. Deviation is `d` for eq, `min(0,d)` for min and `max(0,d)` for max. Measured pass means `abs(deviation) <= tolerance`, otherwise measured fail. A tolerance weakens even a minimum/maximum; it must be justified by the author, not invented for renderer noise.

| Rule | Measurement and required finite operands |
|---|---|
| metric width/height | Selected rectangle dimension. Unused overflowing position edges do not invalidate it. |
| metric aspectRatio | width/height with height strictly greater than zero, then finite quotient/difference. Height zero yields `not_measured/invalid-fact`; width zero can be measured zero. |
| metric reportedLineCount | Explicit count fact. Missing count is `missing-fact`, never a derived quotient. |
| gap | On x: `to.x - (from.x + from.width)`; on y: `to.y - (from.y + from.height)`. Validate selected from-edge addition, measurement and unsaturated difference. Negative gaps are measured. Unused axis is not evaluated. |
| alignment | Selected from edge minus selected to edge. Left/top are x/y; right/bottom add width/height; centers add half the corresponding dimension. Validate both selected edges, measurement and difference; unrelated edges are not evaluated. |
| containment | With outer O and inner I, form left=`O.x+inset`, right=`(O.x+O.width)-inset`, top=`O.y+inset`, bottom=`(O.y+O.height)-inset`. Validate original edges, inset boundaries, inner right/bottom and each of `[left-I.x, I.right-right, top-I.y, I.bottom-bottom]` before taking maximum v. Expected `"<= 0"`, measured v, deviation `max(0,v)`, supplied tolerance. A fully contained box can have a negative measured value and zero deviation. |
| non_overlap | Validate both rectangles' right/bottom additions on **both axes** before comparing. Intersection is `max(lefts) < min(rights)` AND `max(tops) < min(bottoms)`. Expected `disjoint`; measured `intersects`/`disjoint`, deviation 1/0, tolerance 0. Touching edges are disjoint; no special zero-size override beyond this formula. |
| presence | Expected mode, measured `present`/`absent`, deviation 0 for agreement or 1 for mismatch, tolerance 0. See truth table. |
| text_equals | Exact string equality against explicit semanticText; expected requested text, measured captured value, deviation 0/1, tolerance 0. Missing fact is `missing-fact`; no trim/case/Unicode normalization or text-fit inference. |

Unusable numeric intermediate yields only that assertion's `not_measured/invalid-fact`, measured/deviation null, retaining its expected value, tolerance and evidence. Checks happen before saturation, max/min reduction or boolean short-circuit can hide overflow. No clamping, rearranged recovery, rounding or tolerance widening repairs an unusable operand. Independent measured failures survive; valid numeric zero is not missing. Local missing/ineligible facts likewise retain rule-specific expected/tolerance values, unlike capture-wide blockers.

## Report and canonicalization

`compare` returns a report object; it does not perform I/O, mutate inputs, check filesystem truth, validate external approval or bind actual executed code. Same inputs produce deterministic reports.

| Report field | Meaning |
|---|---|
| `reportVersion`, `contractVersion` | `3`, `"3.1"`, including admission refusals |
| `requestId` | admitted request id, otherwise `""` |
| `captureId` | raw captureId if it is a string, otherwise `""`, even on refusal |
| `claim` | normalized claim, including nullable source hash/approval; null on invalid request |
| `scenario` | admitted request's `{id, checkpoint}`, or both strings empty on invalid request |
| `evidenceOrigin` | raw capture origin `live`/`synthetic`, otherwise `unknown` |
| `liveEvidence` | true iff raw origin is `live`; **not** proof of admission, freshness or capture truth |
| `authority` | always `declared-not-verified` |
| `status` | `invalid_request`, `invalid_capture`, `fail`, `not_measured`, `pass` |
| `counts` | `{pass, fail, not_measured}` from assertion outcomes; all zero on admission refusal |
| `outcomes` | array sorted by assertion id using string order; empty on admission refusal |
| `errors` | request admission diagnostics `{code, path, message}` |
| `evidenceErrors` | capture admission diagnostics `{code, path, message}`; empty when request admission failed |
| `limitations` | the three fixed limits listed below |
| `derivations` | null from pure compare; no filesystem derivation binding is performed |

Aggregate precedence is request errors → capture errors → any measured fail → any not_measured (or no outcomes) → pass. A measured failure cannot be hidden by a missing sibling. Errors use concrete paths; multiple admission diagnostics may be collected. Use codes/paths to locate defects rather than treating incidental diagnostic prose as an acceptance oracle.

Each outcome contains `{id, rule, status, reason, detail, subjects, expected, measured, deviation, tolerance, evidence}`. Status is pass/fail/not_measured; measured pass/fail use null reason/detail. Subjects are structured references in operand order. Evidence starts with the assertion's declared evidence; measured facts and available selected coverage append descriptive capture references. Missing/unusable facts have null measurement/deviation, not a fabricated numeric zero. Reason vocabulary is `missing-fact`, `invalid-fact`, `incompatible-kind`, `incompatible-space`, `incomplete-scope`, `unsupported-capability`, `identity-mismatch`, `stale-epoch`, `mixed-epochs`, `incoherent-capture`, `synthetic-not-live-evidence`; vocabulary membership does not imply every reason has an emitting rule in this revision.

Fixed report limitations:

- `validation checks declarations only: not filesystem truth, not the executed JavaScript bundle, not project authorization`
- `synthetic evidence never satisfies a regression or design-parity claim`
- `no modal, scroll, IME, clip, glyph-ink, ellipsis or painted-visibility semantics`

`canonicalReport(report)` returns compact JSON text: recursively sorted object keys, preserved array order and numeric negative zero normalized to zero. Literal prototype-like keys remain data. It does not append a newline, compute hashes, validate an arbitrary supplied report or change its status. Consumers should pass the report from compare, not rely on serialization to repair nonfinite arbitrary data. Finite selected-rule checks occur before canonicalization.

## Offline CLI

Syntax: `boopstick <request.json> <capture.json>` or `boopstick --help`.

| Result | stdout | stderr | Exit |
|---|---|---|---|
| All admitted obligations pass | canonical report plus newline | no operational error | 0 |
| Any measured fail or not_measured | canonical report plus newline | no operational error | 1 |
| Invalid request or capture | actual canonical admission report plus newline | no fabricated operational diagnosis | 2 |
| Input/usage, read, JSON parse or internal operational failure | no fabricated report | failure diagnostic | 2 |
| `--help` | usage/help | no failure required | 0 |

The CLI reads files; there is no stdin/watch/daemon/retry mode. Comparison refusal is distinct from inability to read or parse the inputs. Library import does not invoke CLI I/O. Package registry release, collection permission and consumer cutover remain separate from using the offline interface.
