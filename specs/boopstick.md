# Boopstick: proposed behavior

**Draft for review; not implemented.** The project name is chosen. Publication of this proposal is not authorization to extract source, collect app data, install a skill, publish a package or migrate consumers. [Migration plan](../plans/extract-boopstick.md) owns sequencing and readiness.

## Purpose and principles

Boopstick gives agents and developers explicit feedback about predictable UI mistakes. It checks declared obligations against supplied observations; it does not give an agent general vision or certify that a whole interface is correct.

- **Reuse the runner.** Each comparator assertion is an ordinary named test. Keep the consumer's registration, filtering, fixtures, interactions, cleanup and reports.
- **Evidence must match the claim.** Synthetic data, browser layout, native layout, accessibility bounds, touch-hit regions and screenshots are not interchangeable.
- **Unknown is not success.** Missing, invalid or insufficient evidence cannot satisfy an obligation, including through negation, expected-failure annotations or a passing skip.
- **Expectations have independent justification.** Do not generate expected values from the same candidate measurements and call the agreement a regression check.
- **One implementation, optional integrations.** Consumers must not install every driver to use the comparator. Do not build a new runner, automation framework, DSL, dashboard or second scenario registry.

## Shared interface and terminology

The intended core remains a pure `compare(request, capture)` operation plus `canonicalReport(report)`. The accepted source contract must be frozen and checked before importing it; this proposal does not redefine its wire schema.

An **assertion** is one configured obligation. An **expectation request** declares assertions, subjects, scope and required identities. A **capture** packages observations and their environment/provenance. A **comparison report** contains per-assertion outcomes and admission errors. A **collector** obtains observations; a **provider** identifies their measurement semantics. A **runner case** is the independently selectable test evaluating one obligation.

Preserve `pass`, `fail` and `not_measured`, with invalid request/capture distinguished as admission errors. Evaluate the intact canonical request, then select an outcome by stable assertion ID. A sibling failure must not fail an otherwise passing case merely through aggregate report status. Admission failures or a missing/ambiguous outcome remain errors. Reuse immutable comparison results rather than repeating the same computation for each case.

## Improvement intent: preserve structure without manufacturing certainty

The design-to-code discussion motivates a verification pipeline, not another rendering engine. A design exporter translates one structured source into another representation; Boopstick must compare independently justified expectations with qualified observations of the actual application. Agreement between two values derived from the candidate is not verification.

```text
Approved requirement/reference -> justified request ----+
                                                       |
Actual app -> qualified collector -> bound capture -----+-> compare
                                                            |
                                                            v
                                                   canonical report
                                                            |
                                                            v
                                                  ordinary test output
```

These improvements refine authoring, collection qualification and presentation. Preserve the accepted pure evaluator and its request/capture/report contract; do not introduce a universal scene graph, new rule language or alternate verdict engine.

### Independently author relationships and allowed variation

Prefer a justified gap, alignment, containment or minimum-size obligation over incidental absolute coordinates when the product intent permits reflow. A title wrapping to another line may move the action while preserving the required gap. Absolute placement remains valid when independently required; this is not permission to discard positioning obligations.

For example, the approved obligation might be `action.top - title.bottom = 12` in a declared coordinate space, rather than `action.top = 86`. The numbers are illustrative, not universal defaults. Bind the reference, scenario, subjects and allowed variation before collection; justify tolerance and include a rejecting example. Structured design properties may inform suggestions, but neither a design reader nor an agent may silently approve them or derive the expected value from the candidate.

### Qualify readiness before using observations

The consumer's runner/collector owns scenario-specific readiness: relevant fonts and images, layout, transitions, keyboard state and animations as applicable. A bounded wait must terminate with a qualified capture or an explicit collection limitation/failure. Two equal rectangle samples or network idleness alone do not establish the intended state or resource readiness.

If required readiness or coherence cannot be established, do not promote the last sample to qualified evidence. Represent the limitation through the accepted contract where possible, withholding the affected assertion as `not_measured`; otherwise refuse the capture or fail setup. Preserve unrelated qualified outcomes where the contract permits them. Do not invent wire fields or make the pure evaluator claim it independently observed readiness.

### Preserve evidence kind, precision and logical scope

An exporter can substitute a raster image to preserve appearance; a verifier cannot substitute screenshot estimates or accessibility rectangles for missing native layout facts. Select the provider according to the obligation, preserving the distinctions in the context table below. Geometry passing does not establish painted visibility or actionability.

Only use coordinate/unit conversions supported by the observation and an explicit common space. Preserve fractional values and the declared origin; do not independently recenter reference and candidate to hide displacement, round a failing minimum into a pass, or widen tolerance after seeing a failure. Convert physical pixels to logical units only with the applicable observed density and provider semantics.

Keep subject correspondence and logical scope explicit. Overlap, similar names or physical aliases do not authorize extra scope membership. An unavailable subject is not proven absent without the required qualified, complete enumeration.

### Explain one verdict rather than recomputing it

Human-readable output must derive from the canonical comparison report: assertion identity, available source/reference anchor, involved subjects, expected/measured values, deviation and evidence or refusal reason. Reuse existing report fields and runner attachments. Do not fabricate a measurement for `not_measured`, hide an admission error as a mismatch, or calculate a second verdict for display.

### What this discussion does not authorize

No exporter, `.pen` importer, Skia/CanvasKit dependency, automatic expectation approval, screenshot-to-geometry fallback or proprietary application code is added. The [public .pen format description](https://docs.pen.dev/for-developers/the-pen-format) illustrates structured design input; it is not a capture qualification result or a dependency of Boopstick. No private reports, extracted bundles, design assets or machine-specific evidence are required to understand or implement this proposal.

## Three supported contexts: different evidence, not three frameworks

These are **qualification targets**, not present support claims. Share scenario/obligation identities where meanings match; do not promise identical locators, captures or test files across renderers.

| Context | What remains with existing tools | Boopstick's intended role | What it must not claim |
|---|---|---|---|
| **RNTL + Jest** | RNTL rendering, queries, user events and behavior/state matchers; Jest cases and lifecycle | A tested recipe for calling the pure comparator and its small report/assertion seam alongside RNTL tests; explicit synthetic policy/geometry fixtures where useful | No actual native layout, text wrapping, clipping, painted visibility or touch-region evidence from a JS test tree or supplied layout event |
| **Real browser + Playwright Test** | Browser/page lifecycle, navigation, input actions, locators, readiness and artifacts | A qualified browser observation path plus independently reported comparator cases at real browser checkpoints | A mobile viewport is not a native app; a rectangle or `isVisible` result does not establish unobscured, tappable content |
| **Real native app on an Android emulator** | Existing app/story setup and interaction driver; initially Maestro, with authorized ADB and/or in-app RN observation | A qualified native capture handoff to ordinary TS cases; layout/text and accessibility evidence remain distinct | No DOM measurements; accessibility bounds are not RN layout or hit regions; a screenshot or automation success alone does not prove all layout obligations |

### RNTL: useful compatibility, not a fake layout engine

Support means an ordinary RNTL/Jest suite can import Boopstick, keep its own hooks and matchers, run named cases individually, and obtain actionable comparator failures without starting a browser or emulator. Use RNTL's existing matchers for text, roles, state and interaction behavior rather than duplicating them in Boopstick.

Synthetic measurements can exercise comparator/policy logic or how a component responds to a declared size. Label them as synthetic and keep them outside live layout/design acceptance. A required native or browser obligation cannot silently fall back to RNTL. An unsupported measurement remains unmeasured, not zero, absent or passing.

No RNTL-specific collector is initially justified. Add one only if a concrete unmet use case needs facts that existing RNTL assertions cannot provide, with reviewed semantics. Documentation and a qualified integration recipe are real support; pretending to measure native geometry is not.

### Browser and emulator: observations after interactions

The consumer's driver performs the action, reaches a declared checkpoint and establishes readiness. Collection then produces a coherent capture for that state; Boopstick checks the predeclared obligations. Boopstick does not own navigation, network mocking, device provisioning or app builds.

Each collector must establish subject identity, coordinate space, units, origin, density/font scale where relevant, collection interval and scope completeness. Do not confuse collection interval with freshness relative to the current run. Bind captures to candidate, scenario, fixture, environment and attempt; declared metadata is not attestation.

At the inspected incoming contract snapshot, browser observations have no admitted provider. Browser support therefore requires an explicit contract amendment, not relabelled RN/synthetic facts. Revalidate this at source freeze. Native paths must independently qualify measurement conversion and cleanup. Initial native qualification is Android; iOS support requires its own later scope, hardware and executed evidence, and is not an implied release claim.

Required captures from multiple providers cannot be combined across unrelated states/attempts. Missing observations establish absence only when the required scope was completely and appropriately enumerated. Overlay/occlusion and interaction checks stay distinct from geometry; reuse existing actionability checks and do not invent a visibility certificate.

## Test ergonomics and complete CI

- Register cases from canonical request/story declarations before collection, not from whichever elements appear. Use normal `test.each` or named `test` loops; custom matchers and reporting steps do not create cases.
- Give each case an unambiguous scenario/assertion/variant identity. Setup must work when that one case runs alone; no reliance on preceding tests.
- Preserve diagnostic distinctions between numeric mismatch, missing evidence and admission/setup failure. Use the runner's ordinary report/artifact path; no separate dashboard or report schema.
- Developers may filter by normal name/file/project mechanisms. Full CI acceptance reconciles terminal runner results and comparator outcomes with all required IDs for the approved matrix. Counts, discovery or a green process exit alone are insufficient.
- Skipped, missing, duplicated/conflicting, invalid, unmeasured or expected-failing UI obligations cannot satisfy full acceptance. Negative comparator contract tests are a different purpose from application acceptance.
- Default acceptance uses no retries. Any approved retry policy must preserve failed attempts and obtain correctly bound fresh evidence rather than retrying a snapshot until green. Immutable offline replay is labelled as replay.
- If sharded later, require the complete shard set and matching candidate/request/environment identities. An individual shard is partial evidence. Do not introduce a second inventory: reuse existing declarations and standard machine reports.

## Distribution and skill

Use **Boopstick** for the project and **`boopstick`** consistently for the intended repository/package/CLI/skill. Namespace ownership and license approval are separate; a GitHub repository does not reserve npm.

The target is one TypeScript package with compiled ESM, declarations, explicit exports and a small offline CLI. Keep the core dependency-free; runner/driver-specific code is optional and must not load in a core-only consumer. Preserve the accepted comparator contract before adding browser semantics. Do not publish installation commands as working until the packed artifact is exercised.

Extract only the relevant assertion-authoring/evidence guidance into one agent-neutral skill. It must work without an orchestration framework, private repository, absolute machine path, particular model or account. Teach independently justified expectations, ordinary test commands, selecting evidence, interpreting failures and complete-CI requirements. Installing the skill grants no device/data access and no authority to relax an obligation.

## Not in the initial scope

A proprietary vision model, Galen runtime or executable DSL; custom browser/native drivers; new RNTL matchers that duplicate existing behavior; simultaneous Detox/Appium/Cypress adapters; an IDE/MCP integration; hosted service; telemetry; broad platform claims; migration of unrelated history/assets. Existing consumers may use other drivers with a qualified capture, but that is not a tested official integration until exercised.

## Public references

- [RNTL testing environment](https://oss.callstack.com/react-native-testing-library/docs/advanced/testing-env) and [synthetic layout events](https://oss.callstack.com/react-native-testing-library/docs/api/events/fire-event#layout).
- [Jest parameterized tests](https://jestjs.io/docs/api), [Vitest test API](https://vitest.dev/api/test.html), [Playwright parameterization](https://playwright.dev/docs/test-parameterize) and [fixtures](https://playwright.dev/docs/test-fixtures).
- [RN measurement interface](https://reactnative.dev/docs/the-new-architecture/layout-measurements), [Maestro JavaScript limits](https://docs.maestro.dev/maestro-flows/javascript/javascript-overview) and [Storybook RN testing](https://storybookjs.github.io/react-native/docs/intro/testing/).
- [Agent Skills format](https://agentskills.io/specification). Sources justify proposed boundaries, not an unexecuted compatibility claim.
