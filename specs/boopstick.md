# Boopstick: accepted behavior and qualification targets

**Accepted scope; bounded offline Phase B independently qualified.** Local aggregate and independent core/package checks passed, including the corrected Bun-only packaging gate. Fresh skill-only consumption passed seven independently frozen cases through API and CLI on Node LTS 24.21.0/Bun 1.4.3 (14 API and 14 CLI outcomes). Parent accepted these results and authorized a draft implementation PR, not merge, collection, registry release or consumer cutover. The scoped Apache-2.0 grant and accepted per-file selection exclude uncleared third-party material, private application assets/history and blanket private disclosure. The [plan](../plans/extract-boopstick.md) records retained failures, tooling correction and full remaining C/D/E scope.

**Bounded ordinary-runner/synthetic Phase C independently verified and parent accepted.** The optional Vitest and RNTL/Jest examples consume the accepted packed artifact with isolated pinned development dependencies. Full and individual named cases, real skip/expected-failure/mismatch/missing/admission controls and exact-ID accounting passed on Node LTS **24.21.0**/Bun **1.4.3**. Supplemental probes found acceptance of unknown aggregate statuses and missing/nonboolean Jest inversion metadata; the bounded repair rejected 24 Vitest/26 Jest report counterfactuals and preserved 18 retained real-run dispositions and original diagnostics in offline replay. The historical campaign's 23 counterfactuals per consumer and failing supplemental evidence remain retained. Targeted independent correction verification closed both findings with no new findings; parent accepted these bounded results. This complements prior real-run proof, not a fresh runner campaign, and establishes ordinary-runner compatibility and synthetic policy feedback only, not native/browser layout acceptance. The plan retains the initial RNTL ESM/CJS query failure and affected-only correction.

**Bounded real-browser trial independently verified and parent accepted.** The [optional browser example](../examples/browser/README.md) qualifies an original static specimen at two viewports on Node 24.21.0 LTS/Bun 1.4.3, Playwright Test 1.64.1 and Chromium headless shell 156.0.8078.4. Actual interaction, fractional border boxes, defect/repair, missing/absence/zero/duplicate observations, covered-element actionability and owned teardown are separately checked. The raw-file digest correction passed twelve tests and independent byte-reference/tamper verification with no remaining findings. Earlier mismatched artifacts and selected/setup receipts remain historical, not retroactively byte-correct. This is a CachyOS-specific launch result, not official distro certification, arbitrary-page collection, native qualification or release/cutover approval.

**Android diagnostic build preparation independently reviewed and parent accepted; native runtime remains unqualified.** The [neutral RN specimen](../examples/android/README.md) produced a bundled, diagnostic-signed x86_64 APK in one separately approved 128.052-second resumption, with unchanged pins and observed owned temp/cache paths. Independent Spec/APK file-only inspection and separate Standards/rights review passed, not an independent rebuild or app launch. The initial timeout/shared-temp limitation remains historical; merged overlay/local-network and application-scoped receiver permissions, device/deployment policy, interaction, measurement/export, coherence/freshness and device teardown remain separately gated. Both compile grants are spent; the Android context and full D/E target are not complete.

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

The ordinary RNTL/Jest recipe and Vitest accounting have bounded independent Phase C verification and parent acceptance; the separate real-browser trial has bounded independent correction verification and parent acceptance. The native row remains an unqualified runtime target. Share scenario/obligation identities where meanings match; do not promise identical locators, captures or test files across renderers.

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

The accepted incoming candidate admits direct DOM border-box observations through `web-dom-border-box` under exact contract `"3.1"`; the earlier no-browser-provider snapshot is obsolete. Direct DOM acquisition must not be labelled as RN measurement or synthetic evidence. Provider admission and upstream browser evidence alone do not qualify a collector; the neutral browser trial has its own approved scope and executed independent qualification, limited as stated above. Android and broader platforms still need their own approved collection and executed qualification. Initial native qualification is Android; iOS support requires its own later scope, hardware and executed evidence, and is not an implied release claim.

Required captures from multiple providers cannot be combined across unrelated states/attempts. Missing observations establish absence only when the required scope was completely and appropriately enumerated. Overlay/occlusion and interaction checks stay distinct from geometry; reuse existing actionability checks and do not invent a visibility certificate.

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
