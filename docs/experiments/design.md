# Current design — Boopstick 0.1.0

Boopstick is a small offline comparator for explicit UI obligations, not an agent's vision system or a UI certification service. Authors supply expectations and observations separately; the core checks sizes, gaps, alignment, containment, overlap, presence and semantic-text equality. Existing tools still perform interaction, collection and broader visual/accessibility checks.

This describes the implemented **0.1.0** design. The package is published and independently onboarded; the authorized bounded caller/source/skill cutover is complete, while downstream review branches remain deliberately unmerged. See [current release status](README.md#current-status-versus-historical-checkpoints) and [DIST-04](core-and-distribution.md#dist-04--fresh-public-registry-onboarding-after-publication). Earlier pending plan checklists are historical, not the current design. For motivations and chronology, read [original intent and project history](history.md).

## Architecture and ownership

```text
independently authored request + supplied capture
  → whole-request admission → whole-capture admission
  → capture-wide eligibility → per-obligation measurement
  → deterministic report → canonical JSON when requested
```

The public library has two function exports: `compare(request, capture)` returns the report; `canonicalReport(report)` serializes it. [The entrypoint](../../src/index.ts) also exports report/outcome types. The pure path performs no collection, file reads, external approval checks or input mutation. [The offline CLI](../../src/cli.ts) adds only file/JSON input, canonical stdout with one newline and exit status: 0 for pass, 1 for measured failure or withheld measurement, 2 for invalid input or operational failure. Operational failures use stderr rather than fabricated reports.

| Implemented seam | Responsibility | Boundary / decision evidence |
|---|---|---|
| [request.ts](../../src/request.ts) | Admit and normalize the whole request; validate declared identities, claims, subjects, scopes, assertion IDs, logical membership and paired semantics. | Expectations are explicit inputs, not derived from candidate observations. [CORE-01](core-and-distribution.md#core-01--preserve-behavior-without-inheriting-an-obsolete-evaluator). |
| [assertion.ts](../../src/assertion.ts) | Validate each rule against the closed catalogue, including operands, numeric bounds and declared references. | Invalid policy is an input refusal, not a measured UI defect. Exact fields remain in the [canonical contract](../../skills/boopstick/references/contract.md#assertion-wire-fields). |
| [compare.ts](../../src/compare.ts) | Admit the entire capture, enforce coverage consistency, apply capture-wide blockers, dispatch evaluations and finalize sorted outcomes/counts/aggregate status. | Malformed unused evidence still refuses the capture; missing evidence is never silently discarded into absence. |
| [measure.ts](../../src/measure.ts) | Resolve exact observation tuples and eligibility, evaluate selected-rule arithmetic and explicit semantic facts, return per-assertion outcomes. | Independent scalar facts survive local relationship problems; only arithmetic needed by the rule is evaluated. |
| [vocab.ts](../../src/vocab.ts) | Hold closed vocabulary, shared validators, tuple identity, rule catalogue, fixed limitations and recursive canonicalization. | No provider inference, implicit coordinate conversion or tolerance widening. Canonicalization preserves array order, sorts object keys and normalizes negative zero; it does not validate arbitrary reports. |
| [index.ts](../../src/index.ts) / [cli.ts](../../src/cli.ts) | Keep the small library surface separate from the executable file-I/O wrapper. | Importing the library does not load a runner, collector or CLI. [DIST-01](core-and-distribution.md#dist-01--qualify-the-archive-not-just-the-source-tree). |

Exact versions, wire shapes, defaults, formulas and precedence have one authority: [contract 3.1](../../skills/boopstick/references/contract.md). The implementation admits that exact contract, not historical 3.0 compatibility. This overview is not a second schema or API catalogue.

## Outcomes and fail-closed boundaries

| Situation | Implemented result / meaning |
|---|---|
| Invalid request | `invalid_request`, no assertion outcomes; capture admission does not run. |
| Valid request, malformed capture | `invalid_capture`, no assertion outcomes, even if the bad record was unused. Unknown normative fields, duplicate captured tuples, malformed facts and contradictory coverage are refused. |
| Admitted capture, incompatible identity or collection policy | All obligations become `not_measured`, using the first blocker: identity mismatch, overlong interval, required steadiness missing, then synthetic evidence for regression/design-parity. |
| Eligible fact and usable rule arithmetic | Measured `pass` or `fail` against the fixed declared expectation/tolerance. |
| Missing/ineligible fact, space mismatch or unusable arithmetic | Affected obligation is `not_measured`; measurement/deviation remain null, not zero. Unrelated measured results remain usable. |
| Aggregate report | Admission refusals take precedence; otherwise any measured failure precedes `not_measured`, and only all-passing obligations produce `pass`. |

Coverage has two distinct gates: every capture record must be internally consistent at admission; a presence obligation then requires its selected scope's requested set to match the declared scope. Qualified complete enumeration can establish genuine absence. An eligible positive observation can establish presence without complete enumeration; an ineligible observation does not become absence. See [coverage and presence semantics](../../skills/boopstick/references/contract.md#coverage-admission-versus-selected-scope-use).

Matching metadata checks declarations, not filesystem truth, executed code or authorization. Hash syntax is not byte verification; provider labels are not producer qualification. Collection duration is not wall-clock freshness, and matching epoch/identity declarations do not prove atomic acquisition. Reports retain `declared-not-verified` authority. Optional consumers perform their own raw-file/receipt checks; [WEB-02](browser.md#web-02--hash-persisted-bytes-then-verify-the-referenced-file) and [AND-07](android.md#and-07--persist-ingress-before-acknowledging-export) explain why those checks live outside pure comparison.

## Existing tools outside the core

Collectors/drivers acquire observations; the core evaluates policy. In the native specimen, RN callbacks export facts and the external consumer constructs inputs and evaluates them ([AND-05](android.md#and-05--observed-facts-belong-in-the-app-verdicts-outside-it)). Browser collection similarly belongs to its optional example, not a general core collector endpoint.

Ordinary Jest/Vitest/Playwright tests register obligations from declarations **before** collection, compare the intact request and select exactly one outcome by assertion ID. A passing width case stays useful even when a height sibling makes the aggregate fail. Full **UI acceptance** is a separate reconciliation obligation: every declared required UI case needs its unique executed ordinary pass and comparator pass, with matching independent bindings. Filtered green, missing/duplicate/skipped cases, expected-failure inversion, admission errors and `not_measured` cannot satisfy those UI obligations. This accounting belongs to the [optional consumer recipes](../../examples/README.md#local-selection-and-evidence-semantics), not another core runner or test registry ([RUN-01](runners.md#run-01--select-one-obligation-account-for-the-complete-matrix), [RUN-02](runners.md#run-02--challenge-malformed-evidence-after-the-happy-path-passes)).

**Comparator/consumer qualification** also includes predeclared negative controls. Each control must execute as an ordinary passing test that matches its declared expected report, including an expected comparator `fail`, `not_measured` or admission refusal; runner expected-failure inversion is not a substitute. Thus the historical native15-case qualification matrix passed while correctly detecting defective or unmeasured UI, without accepting that UI ([AND-08](android.md#and-08--five-acquisitions-and-complete-ordinary-accounting)). Complete qualification still accounts for every declared control; selected green feedback does not qualify the full matrix.

Evidence claims remain separate:

- **Geometry versus interaction:** passing rectangles did not prevent an overlay from blocking a real browser click ([WEB-01](browser.md#web-01--geometry-is-not-actionability)). Geometry is not actionability, touch-region or painted-visibility proof.
- **Semantic text versus rendering:** exact explicit semantic-label equality is not visible ink, wrapping, fit or ellipsis evidence. Reported line count is supplied evidence, never a height quotient.
- **Synthetic versus live:** authored fixtures qualify comparator behavior, not native geometry. Synthetic evidence cannot satisfy regression/design-parity. A successful refusal test is not UI acceptance.
- **Execution versus review:** historical runtime, offline replay and labelled report counterfactuals are different evidence. Independent semantic review, lifecycle review and owner acceptance also remain distinct ([AND-09](android.md#and-09--independent-lifecycle-and-semantic-checks), [evidence reading rules](README.md#evidence-reading-rules)).

## Distribution and accepted platform envelope

The [package manifest](../../package.json) defines zero-runtime-dependency ESM JavaScript, declarations, CLI, license/provenance and the complete standalone agent skill with its two references. Consumers need no TypeScript loader. The skill teaches authoring, evidence choice and refusal/accounting interpretation; it grants no collection or release authority. Fresh standalone consumption is distinct from checking that its links close ([DIST-03](core-and-distribution.md#dist-03--fresh-standalone-consumption-is-different-from-writer-verification)).

Optional examples and their separate dependencies/locks are **repository source, not installed package contents**. Source availability, archive qualification and public-registry onboarding are separate claims; their evidence is in [DIST-01–04](core-and-distribution.md). The [package README](../../README.md#use-the-runner-you-already-have) and example READMEs retain exact pins and recipes.

| Qualified path | Accepted boundary | Current limit |
|---|---|---|
| Offline package and standalone skill | Fresh Node/Bun API, declarations, CLI and bounded independent skill consumption; public 0.1.0 onboarding. | Finite offline evidence, not live collector qualification or universal correctness. |
| [RNTL/Jest and Vitest](../../examples/README.md) | Pinned ordinary-runner selection/reconciliation; real component interaction and synthetic comparator inputs. | RNTL-supplied layout data does not measure native layout, clipping or touch regions. |
| [Playwright browser specimen](../../examples/browser/README.md) | Static original specimen, two viewports, actual interaction and fractional DOM border boxes; independent byte-integrity correction and owned cleanup accepted. | Host-specific CachyOS trial, not arbitrary pages or distro certification; excludes dynamic rendering/scroll/transform/frame envelopes and atomic paint claims. |
| [Android emulator specimen](../../examples/android/README.md#accepted-native-result) | Static RN 0.88/API35 x86_64, density 2.625/fontScale 1/LTR; five actual acquisitions and 15 ordinary cases; independent semantics/lifecycle acceptance. | Host-restricted harness, not a portable device manager, physical-device/iOS support, atomic collection or general transport reliability. Earlier transport loss remains unexplained. |

The current source extends the optional Android example to root/body/action observations and60 declared cases under the first [native-evidence increment](../../plans/qualify-native-observations.md). This is not a new package version or expanded accepted support: only one of six acquisitions obtained a qualified receipt before target loss. The action measurement is a container, not a touch-region certificate. See [AND-10](android.md#and-10--two-subject-relationships-and-an-incomplete-native-continuation); the0.1.0 accepted envelope above remains historical.

## Non-goals and unqualified work

0.1.0 supplies neither screenshot comparison nor inferred design expectations, automatic device/browser control, a new runner/matcher framework, or whole-interface certification. Modal, scroll, IME, clipping, glyph-ink, ellipsis and painted-visibility semantics remain outside the core. External bindings do not become loaded-code attestation or total host isolation. These are current boundaries, not promised upcoming features.

PR2/3's post-release observation/evidence intent and PR6's incomplete qualification are recorded in the [blocked native plan](../../plans/qualify-native-observations.md). Unmerged downstream review branches are not shipped implementation or production rollout. The historical extraction plan is not authority to reopen campaigns. The upstream guidance study ended evidence-only without a method rewrite or project UI acceptance ([GUIDE-08](guidance.md#guide-08--stopping-point-evidence-only-not-ui-acceptance)).

This page synthesizes inspected implementation and retained qualification summaries. It adds no runtime, registry, browser/native campaign or private-receipt verification claim; use the [experiment matrix](README.md#questions-and-decisions) for stable decision IDs and evidence boundaries.
