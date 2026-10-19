# Boopstick: accepted behavior and qualification targets

**Current status:** the core/skill, ordinary RNTL/Jest and Vitest recipes, bounded browser path and bounded Android path have independent verification and parent acceptance. Android retained five actual acquisitions and passed all 15 ordinary cases; selected green feedback was refused as complete acceptance. The 0.1.0 package and skill are published with independent public-registry onboarding, and the approved inventoried consumer/skill cutover is complete within its qualified scope. This does not establish completion of the original UV1–UV4 method stages, hosted-CI success or production adoption. The old native transport-loss cause remains unresolved; no broader platform/reliability claim follows.

## Qualification history

**Accepted scope; bounded offline Phase B independently qualified.** Local aggregate and independent core/package checks passed, including the corrected Bun-only packaging gate. Fresh skill-only consumption passed seven independently frozen cases through API and CLI on Node LTS 24.21.0/Bun 1.4.3 (14 API and 14 CLI outcomes). Parent accepted these results and authorized a draft implementation PR, not merge, collection, registry release or consumer cutover. The scoped Apache-2.0 grant and accepted per-file selection exclude uncleared third-party material, private application assets/history and blanket private disclosure. The [plan](../plans/extract-boopstick.md) records retained failures, tooling correction and full remaining C/D/E scope.

**Bounded ordinary-runner/synthetic Phase C independently verified and parent accepted.** The optional Vitest and RNTL/Jest examples consume the accepted packed artifact with isolated pinned development dependencies. Full and individual named cases, real skip/expected-failure/mismatch/missing/admission controls and exact-ID accounting passed on Node LTS **24.21.0**/Bun **1.4.3**. Supplemental probes found acceptance of unknown aggregate statuses and missing/nonboolean Jest inversion metadata; the bounded repair rejected 24 Vitest/26 Jest report counterfactuals and preserved 18 retained real-run dispositions and original diagnostics in offline replay. The historical campaign's 23 counterfactuals per consumer and failing supplemental evidence remain retained. Targeted independent correction verification closed both findings with no new findings; parent accepted these bounded results. This complements prior real-run proof, not a fresh runner campaign, and establishes ordinary-runner compatibility and synthetic policy feedback only, not native/browser layout acceptance. The plan retains the initial RNTL ESM/CJS query failure and affected-only correction.

**Bounded real-browser trial independently verified and parent accepted.** The [optional browser example](../examples/browser/README.md) qualifies an original static specimen at two viewports on Node 24.21.0 LTS/Bun 1.4.3, Playwright Test 1.64.1 and Chromium headless shell 156.0.8078.4. Actual interaction, fractional border boxes, defect/repair, missing/absence/zero/duplicate observations, covered-element actionability and owned teardown are separately checked. The raw-file digest correction passed twelve tests and independent byte-reference/tamper verification with no remaining findings. Earlier mismatched artifacts and selected/setup receipts remain historical, not retroactively byte-correct. This is a CachyOS-specific launch result, not official distro certification, arbitrary-page collection, native qualification or release/cutover approval.

**Android diagnostic build preparation independently reviewed and parent accepted; native runtime remains unqualified.** The [neutral RN specimen](../examples/android/README.md) historically produced a bundled, diagnostic-signed x86_64 APK in one separately approved 128.052-second resumption, with unchanged pins and observed owned temp/cache paths. Independent Spec/APK file-only inspection and separate Standards/rights review passed, not an independent rebuild or app launch. The initial timeout/shared-temp limitation remains historical and its two compile grants are spent. A separately authorized native-consumer implementation then passed its first changed-source build in **60.250 seconds**. Its first native campaign booted an owned API35 emulator and installed the new APK, but stopped at explicit overlay-denial readback before interaction, collection or ordinary native cases; scoped process/control-port teardown passed. Runtime and independent qualification remain incomplete, as do the Android criterion and full D/E target. No registry-release, consumer-cutover or merge approval follows.

A separately authorized corrected native campaign passed explicit UID overlay denial and initial valid/off screen assertions, then stopped at Maestro2.11's screenshot-path containment guard before the toggle. A relative screenshot basename repaired the host parameter; at that checkpoint only local path/syntax checks covered the repair. The retained initial-state error screenshot is not native geometry or export evidence. That checkpoint claimed no five-mode acquisition, fifteen-case run or independent runtime acceptance.

The separately authorized third qualifier invocation completed actual valid-mode toggle/export and one retained, byte-verified RN-window receipt whose width/height report passed. Defect-mode driver interaction/export passed, but explicit target loss prevented host receipt acceptance, so no numeric defect result is claimed. Only1/5 acquisitions had a retained verified receipt at that checkpoint; the later instrumented invocation recorded in the [plan](../plans/extract-boopstick.md#notes) subsequently completed five-acquisition/fifteen-case qualification. Transport disappearance was not explained or fixed.

**Post-tag publication and cutover:** after parent acceptance of all five accepted contexts, `v0.1.0` was tagged and the package published to npm. Independent fresh public-registry onboarding passed all25 command outcomes for the API, CLI, declarations and README; all21 installed files, including the bundled skill, matched the accepted archive (SHA256 `ae637cf7a63d1d9f4cf72edfd43f3b0a4ad6260ef36e46b53ba969a90e491ae9`). The approved inventoried caller/skill cutover completed within its qualified scope. Hosted-CI success, original UV1–UV4 completion and production adoption are not claimed.

## Purpose and principles

Boopstick gives agents and developers explicit feedback about predictable UI mistakes. It checks declared obligations against supplied observations; it does not give an agent general vision or certify that a whole interface is correct.

- **Reuse the runner.** Each comparator assertion is an ordinary named test. Keep the consumer's registration, filtering, fixtures, interactions, cleanup and reports.
- **Evidence must match the claim.** Synthetic data, browser layout, native layout, accessibility bounds, touch-hit regions and screenshots are not interchangeable.
- **Unknown is not success.** Missing, invalid or insufficient evidence cannot satisfy an obligation, including through negation, expected-failure annotations or a passing skip.
- **Expectations have independent justification.** Do not generate expected values from the same candidate measurements and call the agreement a regression check.
- **One implementation, optional integrations.** Consumers must not install every driver to use the comparator. Do not build a new runner, automation framework, DSL, dashboard or second scenario registry.

## Shared interface and terminology

The core is a pure `compare(request, capture)` operation plus `canonicalReport(report)`. The bounded offline implementation uses exact contract `"3.1"`, request schema 3, capture schema 2 and report version 3. It admits `web-dom-border-box`; exact `"3.0"` headers are rejected without aliases. All 19 authored and 49 independent behavior cases passed without a presemantic evaluator. The standalone skill/contract passed bounded fresh independent consumption; this qualifies those offline cases, not runner/collector integrations or every future request.

An **assertion** is one configured obligation. An **expectation request** declares assertions, subjects, scope and required identities. A **capture** packages observations and their environment/provenance. A **comparison report** contains per-assertion outcomes and admission errors. A **collector** obtains observations; a **provider** identifies their measurement semantics. A **runner case** is the independently selectable test evaluating one obligation.

Preserve `pass`, `fail` and `not_measured`, with invalid request/capture distinguished as admission errors. Evaluate the intact canonical request, then select an outcome by stable assertion ID. A sibling failure must not fail an otherwise passing case merely through aggregate report status. Admission failures or a missing/ambiguous outcome remain errors. Reuse immutable comparison results rather than repeating the same computation for each case.

## Three supported contexts: different evidence, not three frameworks

The ordinary RNTL/Jest recipe, Vitest accounting, real-browser specimen and real-Android specimen have bounded independent verification and parent acceptance. Android qualification includes actual interaction, five byte-bound captures, independent retained-data replay and owned teardown, not a universal collector or portable device manager. Share scenario/obligation identities where meanings match; do not promise identical locators, captures or test files across renderers.

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

The accepted incoming candidate admits direct DOM border-box observations through `web-dom-border-box` under exact contract `"3.1"`; the earlier no-browser-provider snapshot is obsolete. Direct DOM acquisition must not be labelled as RN measurement or synthetic evidence. Provider admission and upstream browser evidence alone do not qualify a collector; the neutral browser trial has its own approved scope and executed independent qualification, limited as stated above. Additional Android observations and broader platforms need their own approved collection and executed qualification. Initial native qualification is Android; iOS support requires its own later scope, hardware and executed evidence, and is not an implied release claim.

Required captures from multiple providers cannot be combined across unrelated states/attempts. Missing observations establish absence only when the required scope was completely and appropriately enumerated. Overlay/occlusion and interaction checks stay distinct from geometry; reuse existing actionability checks and do not invent a visibility certificate.

## Post-release native evidence quality (proposed)

This amendment carries forward [PR #2](https://github.com/pranaypratyush/boopstick/pull/2) and [PR #3](https://github.com/pranaypratyush/boopstick/pull/3). Its [incremental qualification plan](../plans/qualify-native-observations.md) is separate from the completed extraction. The historical single-subject handoff remains qualified within its recorded bounds. Increment1 multiple-subject implementation and independent source review are complete; host checks and the changed-source build passed, but native qualification is incomplete at **1/6 accepted acquisitions**. A second raw/pending export survived target loss without a qualified receipt. All original and explicitly authorized continuation build/native grants are spent; no retry or new campaign is implied. [AND-10](../docs/experiments/android.md#and-10--two-subject-relationships-and-an-incomplete-native-continuation) preserves the actual results and remaining obligations. Later text/media and additional native discriminators remain held proposed work, not support claims.

### Bind actual nodes without changing the application

Required root, text/body, media and action observations use stable declared identities; repeated subjects have explicit instance keys. Missing, duplicate, stale or wrong-checkpoint observations cannot satisfy an obligation. Similar labels, the first match or the longest text are not identity. Observation reuses actual rendered nodes, not copied JSX, private Fabric/Fiber interfaces or global flattening changes. Disabling observation preserves the ordinary render/interaction behavior; qualification instrumentation stays outside production entrypoints.

Use public RN observations only for facts the obligation needs. Existing window/dp geometry can serve multiple subjects without a new callback provider. If `onLayout` is used, retain its parent identity and parent-relative raw values and qualify any common-space conversion. If `onTextLayout` is used, reported line counts remain distinct from window geometry, glyph ink, UTF-16 coverage, visible line count, ellipsis and text fit. Provider vocabulary admission alone does not qualify acquisition.

### Preserve independent expectations and measurement meaning

Freeze reference/requirement, scenario bindings, allowed variation and justified tolerances before observing the candidate. Prefer relationships when reflow is allowed: an independently required gap can survive a wrapping title although its absolute bottom moves. Retain absolute placement checks when independently required. Do not derive expectations from candidate measurements, widen tolerances after failure or automatically approve a baseline.

Retain original values, provider, subject/parent identities, units, origins, density/font scale and collection interval. Use only justified conversions into a common space; do not recenter away displacement, infer logical scope from overlap/physical aliases, or round a failing fractional value into a pass. Geometry passing is not actionability or visibility. A line-event array or complete accessibility label is not proof of unclipped rendered text.

### Qualify collection, not a last-known sample

The consumer's runner/collector must establish scenario-specific readiness for relevant fonts, images, layout, transitions, keyboard state and animations where those facts are required. Collection terminates within a declared bound with qualified evidence or an explicit limitation/setup failure. Two unchanged samples or network idleness alone do not establish readiness or an atomic layout/compositor frame.

Unavailable readiness withholds affected evidence through the existing contract where representable; otherwise refuse collection or fail setup. Preserve unrelated qualified outcomes where that contract permits. Do not invent wire fields, a generic stabilizer or a claim that the pure comparator observed readiness.

Retain whole-screen compositor originals alongside structured observations and actual native action → observed-state checkpoints. Native interaction must not be replaced by directly invoking a component callback. Canvas redraws, accessibility bounds, hit regions and layout observations remain different evidence. App inset consumption is not inferred from system policy rectangles.

Bind raw attempts, requests and outcomes to their actual source/build, scenario, environment and collection attempt. A manually fetched bundle is not proof of the response executed by the app. Missing required identity refuses the affected claim rather than borrowing a hash from another attempt. Deterministic offline replay establishes evaluation reproducibility, not a fresh acquisition.

### Demonstrate both detection and limits

The incremental native matrix covers valid relationships and permitted reflow, wrong gap and repair, text/media/disclosure variants, fractional undersizing, missing/wrong-kind observations, readiness exhaustion, displaced composition/logical scope and a covered action. Expectations remain fixed across control, mutant and restoration. Keep measured mismatch, missing/unsupported facts and admission/setup error distinct, including counterexamples where geometry passes but the actual surface violates a broader obligation.

An unrepresentable native fractional discriminator remains a native limitation; a separately labelled synthetic arithmetic check cannot qualify it. A covered action needs separate behavior/actionability evidence; without it whole-task acceptance remains unsupported even when geometry passes. Full hit-target containment, text ranges/ellipsis/clipping, painted extents, occlusion and atomic capture are not supplied by this amendment merely because they are useful.

Diagnostics derive from the existing canonical report and ordinary runner artifacts: assertion/subjects, available source/reference anchors, expected/measured values, deviation and evidence/refusal reasons. Do not compute a second verdict, manufacture measurements for `not_measured` or turn admission errors into mismatches. Request/capture/report versions and closed wire fields remain unchanged unless separately amended.

### Keep integration optional

Retain the consumer's existing app/story, driver and authorized ADB capture; the example's use of Maestro does not require consumers to migrate. Agent-device is an optional consumer choice, not an officially qualified adapter. React Native Harness is not the default structural collector; a concrete native component-test need would justify a separate adoption decision. Public RN callbacks do not require Harness.

No new comparator, runner, DSL, dashboard, universal scene graph, design exporter, `.pen` importer, Skia/CanvasKit dependency, screenshot-to-geometry fallback or proprietary assets are introduced. RNTL remains synthetic and RN Web remains browser evidence. Existing qualified runner/browser/native results are preserved; Android additions do not imply iOS or physical-device support.

## Test ergonomics and complete CI

- Register cases from canonical request/story declarations before collection, not from whichever elements appear. Use normal `test.each` or named `test` loops; custom matchers and reporting steps do not create cases.
- Give each case an unambiguous scenario/assertion/variant identity. Setup must work when that one case runs alone; no reliance on preceding tests.
- Preserve diagnostic distinctions between numeric mismatch, missing evidence and admission/setup failure. Use the runner's ordinary report/artifact path; no separate dashboard or report schema.
- Developers may filter by normal name/file/project mechanisms. Full CI acceptance reconciles terminal runner results and comparator outcomes with all required IDs for the approved matrix. Counts, discovery or a green process exit alone are insufficient.
- Skipped, missing, duplicated/conflicting, invalid, unmeasured or expected-failing UI obligations cannot satisfy full acceptance. Negative comparator contract tests are a different purpose from application acceptance.
- Default acceptance uses no retries. Any approved retry policy must preserve failed attempts and obtain correctly bound fresh evidence rather than retrying a snapshot until green. Immutable offline replay is labelled as replay.
- If sharded later, require the complete shard set and matching candidate/request/environment identities. An individual shard is partial evidence. Do not introduce a second inventory: reuse existing declarations and standard machine reports.

The local [ordinary-runner examples](../examples/README.md) exercise this accounting with canonical declaration-derived JSON tuple identities, built-in Vitest JSON/meta and Jest JSON plus one local evidence attachment. Only complete correct invocations satisfy the gate; selected feedback is not full acceptance. Separately labelled report counterfactuals exercise missing/duplicate/stale/discovery accounting without claiming those were runner executions. No custom runner/reporter/matcher, shared public adapter or second expected-ID registry is required.

## Distribution and skill

Use **Boopstick** for the project and **`boopstick`** consistently for the intended repository/package/CLI/skill. Namespace ownership and license approval are separate; a GitHub repository does not reserve npm.

The target is one dependency-free TypeScript package named `boopstick`, with compiled ESM, declarations, explicit exports and a small offline CLI. Runner/driver-specific code is optional and must not load in a core-only consumer. Preserve the accepted exact-3.1 comparator contract, including its browser provider, during extraction. Keep `private: true` initially until separate registry-release approval; public Git code publication instead requires source/privacy verification and parent review before push. Do not publish installation commands as working until the packed artifact is exercised.

The offline CLI accepts `boopstick <request.json> <capture.json>` and `--help`. For admitted or invalid comparator results, stdout contains the canonical report followed by a newline. Exit 0 requires all obligations to pass; measured failure or `not_measured` exits 1; invalid request/capture exits 2. Operational input, read, parse or internal failures exit 2 with diagnostics on stderr and no fabricated report. Help exits 0. No stdin, watch, daemon or retry features are included.

Keep one canonical public contract at `skills/boopstick/references/contract.md`, linked by the package README and included with the skill bundle in the packed artifact. A skill-directory-only copy must remain self-contained; do not create a duplicate contract/schema document. Apache-2.0 `LICENSE`, package distribution metadata and sanitized `docs/provenance.md` are present locally. Provenance describes cleared content digests/derivations without private URLs/revisions or personal metadata. Their presence alone is not successful package or skill qualification.

Extract only the relevant assertion-authoring/evidence guidance into one agent-neutral skill. It must work without an orchestration framework, private repository, absolute machine path, particular model or account. Teach independently justified expectations, ordinary test commands, selecting evidence, interpreting failures and complete-CI requirements. Installing the skill grants no device/data access and no authority to relax an obligation.

The skill adapts selected generic source prose to exact3.1, agent neutrality and self-contained references, removing host-policy/private-source dependencies. It is newly authored and has actual bounded independent consumption evidence, not merely file-closure checks or an inherited source skill. The owner grant applies to the parent-approved audited selection; no concrete contrary third-party notice was identified. Hold or exclude affected material if contradictory rights evidence appears. Uncleared third-party material, private application assets/history remain excluded. Draft progress publication is authorized; collection, merge, registry release and consumer cutover retain separate approvals.

## Not in the initial scope

A proprietary vision model, Galen runtime or executable DSL; custom browser/native drivers; new RNTL matchers that duplicate existing behavior; simultaneous Detox/Appium/Cypress adapters; an IDE/MCP integration; hosted service; telemetry; broad platform claims; migration of unrelated history/assets. Existing consumers may use other drivers with a qualified capture, but that is not a tested official integration until exercised.

## Public references

- [RNTL testing environment](https://oss.callstack.com/react-native-testing-library/docs/advanced/testing-env) and [synthetic layout events](https://oss.callstack.com/react-native-testing-library/docs/api/events/fire-event#layout).
- [Jest parameterized tests](https://jestjs.io/docs/api), [Vitest test API](https://vitest.dev/api/test.html), [Playwright parameterization](https://playwright.dev/docs/test-parameterize) and [fixtures](https://playwright.dev/docs/test-fixtures).
- [RN measurement interface](https://reactnative.dev/docs/the-new-architecture/layout-measurements), [Maestro JavaScript limits](https://docs.maestro.dev/maestro-flows/javascript/javascript-overview) and [Storybook RN testing](https://storybookjs.github.io/react-native/docs/intro/testing/).
- [Agent Skills format](https://agentskills.io/specification). Sources justify proposed boundaries, not an unexecuted compatibility claim.
