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

## Three supported contexts: different evidence, not three frameworks

These are **qualification targets**, not present support claims. Share scenario/obligation identities where meanings match; do not promise identical locators, captures or test files across renderers.

| Context | What remains with existing tools | Boopstick's intended role | What it must not claim |
|---|---|---|---|
| **RNTL + Jest** | RNTL rendering, queries, user events and behavior/state matchers; Jest cases and lifecycle | A tested recipe for calling the pure comparator and its small report/assertion seam alongside RNTL tests; explicit synthetic policy/geometry fixtures where useful | No actual native layout, text wrapping, clipping, painted visibility or touch-region evidence from a JS test tree or supplied layout event |
| **Real browser + Playwright Test** | Browser/page lifecycle, navigation, input actions, locators, readiness and artifacts | A qualified browser observation path plus independently reported comparator cases at real browser checkpoints | A mobile viewport is not a native app; a rectangle or `isVisible` result does not establish unobscured, tappable content |
| **Real native app on an Android emulator** | Consumer-owned app/story setup and its existing native driver, with authorized ADB and/or in-app RN observation; no mandatory driver migration | A qualified native capture handoff to ordinary TS cases; layout/text and accessibility evidence remain distinct | No DOM measurements; accessibility bounds are not RN layout or hit regions; a screenshot or automation success alone does not prove all layout obligations |

### RNTL: useful compatibility, not a fake layout engine

Support means an ordinary RNTL/Jest suite can import Boopstick, keep its own hooks and matchers, run named cases individually, and obtain actionable comparator failures without starting a browser or emulator. Use RNTL's existing matchers for text, roles, state and interaction behavior rather than duplicating them in Boopstick.

Synthetic measurements can exercise comparator/policy logic or how a component responds to a declared size. Label them as synthetic and keep them outside live layout/design acceptance. A required native or browser obligation cannot silently fall back to RNTL. An unsupported measurement remains unmeasured, not zero, absent or passing.

No RNTL-specific collector is initially justified. Add one only if a concrete unmet use case needs facts that existing RNTL assertions cannot provide, with reviewed semantics. Documentation and a qualified integration recipe are real support; pretending to measure native geometry is not.

### Browser and emulator: observations after interactions

The consumer's driver performs the action, reaches a declared checkpoint and establishes readiness. Collection then produces a coherent capture for that state; Boopstick checks the predeclared obligations. Boopstick does not own navigation, network mocking, device provisioning or app builds.

Each collector must establish subject identity, coordinate space, units, origin, density/font scale where relevant, collection interval and scope completeness. Do not confuse collection interval with freshness relative to the current run. Bind captures to candidate, scenario, fixture, environment and attempt; declared metadata is not attestation.

At the inspected incoming contract snapshot, browser observations have no admitted provider. Browser support therefore requires an explicit contract amendment, not relabelled RN/synthetic facts. Revalidate this at source freeze. Native paths must independently qualify measurement conversion and cleanup. Initial native qualification is Android; iOS support requires its own later scope, hardware and executed evidence, and is not an implied release claim.

Required captures from multiple providers cannot be combined across unrelated states/attempts. Missing observations establish absence only when the required scope was completely and appropriately enumerated. Overlay/occlusion and interaction checks stay distinct from geometry; reuse existing actionability checks and do not invent a visibility certificate.

### Native observation intent: improve evidence, not replace the runner

The proposed improvement is a smaller evidence gap, not a larger automation stack: **existing app/story and native driver → public RN observations plus compositor screenshots → the accepted pure comparator in ordinary tests**. The RN observation-to-capture handoff remains unimplemented and unqualified in Boopstick. Review its mapping against the frozen source contract before adding fields or provider claims.

A bounded external Android evaluation of agent-device 0.21.24, React Native Harness core/Android/UI 1.5.0 and Maestro 2.11.0 motivated this direction. Its decision was to retain the existing Storybook/ADB probes. This is context for a proposal, not a Boopstick compatibility result or public reproduction bundle; source-product fixtures, screenshots, scripts and machine receipts are not imported here. The neutral qualification in the migration plan must earn Boopstick's own support claims.

| Candidate | Proposed disposition for Boopstick | Boundary exposed by the evaluation |
|---|---|---|
| Consumer's existing driver and ADB capture | Retain; qualify one bounded capture handoff | Automation and screenshots alone do not supply every structural/text fact |
| agent-device | Optional consumer choice, not a required dependency or official integration yet | Accessibility rectangles and pixel diffs do not establish RN layout, text fit or clipping |
| React Native Harness | No adoption as the default structural collector; consider separately only for a native component-test need | Public RN callbacks supplied the measurements; the UI module required a rebuild, its Canvas captures were not compositor captures, and exact evaluated-payload identity remained unqualified |
| Maestro | Optional consumer driver, not an initial prerequisite | Native size/relationship assertions worked on the qualified specimen; aspect-ratio arithmetic and text/binding gaps remained custom |

The intended native handoff must satisfy these rules:

1. **Explicit bindings.** Bind the existing root, text, media and any required action nodes by stable project identifiers, with instance keys for repeated subjects. Do not infer semantic identity from the first matching label or longest text. Missing, duplicated, stale or wrong-checkpoint evidence cannot produce a pass; use the frozen contract's admission or `not_measured` outcome as appropriate.
2. **Public observations only where needed.** Reuse the actual rendered nodes and public RN `onLayout`/`onTextLayout` events, with a small shared observation sink if needed. Do not copy component JSX, use private Fabric/Fiber APIs or disable flattening globally. Observation must not change fixture/style/interaction semantics, and the integration must remain outside the production entry.
3. **Preserve measurement meaning.** RN layout events are parent-relative logical units; native accessibility rectangles may be screen-relative physical pixels. Retain provider, subject/parent identity, original values, units/origins, density, font scale and checkpoint/interval. Perform only explicit valid conversions. A line-event array is not glyph ink, UTF-16 coverage, an ellipsis API or a general text-fit certificate.
4. **Keep paint and behavior evidence.** Retain whole-screen compositor originals and actual native action → observed-state checkpoints. A Canvas redraw is a different capture kind, and a matching image is not design approval. Sequential stable captures do not prove an atomic layout/GPU frame; app inset consumption is not inferred from system policy rectangles.
5. **Keep provenance honest.** Record the evidence actually obtained for source/build/bundle identity. A manually fetched response at the same URL is not proof of the bytes executed by the runtime. If a required identity cannot be established, refuse that obligation rather than substituting a label or hash from another attempt.
6. **Prove the detector, not just the control.** Freeze justified expectations and tolerances before the candidate run. Use an original neutral specimen with a media-ratio defect and a one-line-text defect, then restore it. Classify each finding as measured mismatch, missing evidence or admission error; never derive expectations from the candidate. Keep any screenshot counterexample when available numerical rules still pass. Replaying saved facts without a device/LLM proves deterministic evaluation only.

Full action-hit-target containment, native text ranges/ellipsis/clipping, painted extents, occlusion and capture atomicity remain unqualified until a provider supplies the necessary evidence. This proposal does not add those providers or promise those capabilities. Geometry or a complete accessibility label cannot silently satisfy them.

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
