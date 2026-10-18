---
status: blocked
depends: []
specs:
  - specs/boopstick.md
awaits:
  - "Maintainer acceptance of this scope and a separate explicit instruction to execute the move."
  - "Acceptance and freeze of the source comparator contract/runtime, with the approved skill material identified."
  - "Source redistribution/third-party rights clearance and approval of the release license and file allowlist."
---

# Plan: extract Boopstick and qualify its testing integrations

## Scope

Create a standalone comparator package and its relevant agent-neutral skill, then qualify a small RNTL/Jest recipe, one real-browser path and one real-Android-emulator path. This is **a migration proposal, not the migration itself**. The current public repository contains only original planning prose. No source/runtime/skill has been imported, no package exists here and no integration is qualified.

Creating the repository and opening its draft PR are authorized. Starting implementation, collecting private app evidence, publishing packages, merging source PRs or changing consumers is not. Keep this PR draft until the maintainer accepts its decisions. Merging a planning document alone is not execution authorization; leave the plan blocked until the recorded prerequisites actually clear.

Use a clean file-based import, never a mirror, fork or history push from the source repository. Scope excludes unrelated orchestration, product application code/assets, old experimental runtimes, historical machine receipts and additional automation frameworks. No automatic executor, publication workflow or new dependency is installed by this proposal.

## Implements

[Proposed Boopstick behavior](../specs/boopstick.md): one pure comparator, ordinary selectable tests with complete CI accounting, honest RNTL/browser/native evidence boundaries, optional integration dependencies and a standalone authoring skill.

## Approach

### A. Resolve readiness and freeze the move

1. Record the maintainer's scope acceptance and separate execution go-ahead. Keep source review and destination review as distinct approvals.
2. Accept the source contract and corresponding runtime before selecting immutable import revisions. Where the runtime review is stacked on the contract review, resolve that dependency first. Skill material can be accepted independently, but must match the selected comparator contract. Do not assume an arbitrary latest head or a merged skill means the runtime is accepted.
3. Reconcile changes since the inspected source snapshot and rerun its declared behavioral evidence before importing. If accepted semantics differ from this proposal, amend the proposal before implementation rather than silently changing the target.
4. Create an explicit source-to-destination allowlist and provenance/license record. Review ownership and third-party terms for code, prose and fixtures. Apache-2.0 is proposed, not approved; adding a license cannot cure missing rights. Keep private review locations/revisions in the maintainer's existing review record until disclosure is cleared; public users must not need that private record to use the released package.

### B. Import a behavior-preserving core and the relevant skill

Import only the accepted evaluator, request validation, rule evaluation, measurement and vocabulary modules; necessary behavioral fixtures; the self-contained contract; and the relevant authoring/evidence prose. Exclude obsolete comparator implementations and assertions that depend on running them. Retain independently justified oracle coverage without shipping private assets or deriving expected results from the candidate implementation.

One package is enough. Add only the package entry, compiled ESM/declarations, explicit exports, offline file-in/report-out CLI, retained behavior checks and neutral examples needed to consume it. Keep the two core functions and accepted statuses intact. Extract one `boopstick` skill, not the parent orchestration skill. Package behavior and skill guidance must agree on the frozen contract; neither needs private tools, a hosted service or a particular agent provider.

Inspect the packed artifact in a clean directory with supported Node LTS and Bun. Exercise pass, measured failure, not-measured, invalid input and operational errors, including CLI exit behavior. Review secrets, personal/machine paths, assets, notices and package contents before any public code push. Publish the cleared provenance/contract alongside the code so public consumers do not follow private links.

### C. Qualify ordinary-test integration, including RNTL

Use existing Vitest/Jest registration and standard reports; add only the small assertion/report seam justified by consumer use. Register cases from canonical declarations, not observed elements. Keep a stable case identity and the full request. Reuse immutable comparison results where appropriate.

RNTL qualification is a small real consumer integration: install the packed artifact into a maintained, version-pinned RNTL/Jest example; exercise one component interaction with existing RNTL matchers, and run Boopstick's declared synthetic policy cases in the same suite. Prove a case works alone, all cases run together, failure diagnostics remain useful and teardown does not leak state. A supplied layout event must remain synthetic and must be refused as live layout acceptance. Do not add a fake geometry collector or duplicate RNTL assertions.

Prove complete-CI accounting against the canonical declared IDs with full, filtered, skipped, duplicated, missing-result, expected-failure and stale/wrong-candidate cases. Use existing machine reports and attachments, not another test inventory. Local filtered feedback remains permitted; it cannot approve the complete matrix.

### D. Qualify two bounded real-interaction paths

After B/C and approval of each collection scope, qualify the native and browser paths separately. Native-first is a useful first consumer target; neither path is a prerequisite for pretending the other works, and neither can be silently dropped from the accepted target scope.

**Android emulator:** use one original neutral RN specimen and a bounded scenario. Drive an actual interaction with Maestro or the consumer's already-chosen native driver; use authorized ADB and/or in-app RN hooks for the measurements the obligation requires. Select the correct checkpoint, qualify coordinate/unit conversion, keep accessibility/layout/text observations distinct, capture one real defect and repair, and prove no stale evidence or leaked process/device state. Feed the capture into ordinary TS cases; do not run the comparator inside Maestro's JavaScript sandbox. No Detox/Appium stack is added merely to obtain these facts.

**Real browser:** approve the browser-provider contract amendment before implementation. Use Playwright Test fixtures against one original neutral specimen at two viewport sizes, with an actual interaction before collection. Define DOM rectangle semantics, subject identity, units/origin, scope and readiness. Test fractional measurements, a real defect/repair, missing observations and an overlay counterexample. Preserve browser actionability as a separate obligation rather than claiming geometry proves interaction success. RN Web remains browser evidence.

Use the same high-level obligation across the two specimens only where semantics truly match. Do not force identical locators or manufacture a universal test DSL. Initial Android qualification does not imply iOS/physical-device support; adding those needs explicit later scope and execution evidence.

### E. Release, then cut over consumers without a compatibility layer

1. Finalize licensing/provenance and document the actually tested runner/renderer/platform/version matrix. Unsupported combinations remain explicit. The full three-context target is not complete until C and both D paths pass; an earlier offline preview must be labelled narrowly and cannot close this plan.
2. Produce the versioned package and matching skill only after release approval. Test a fresh consumer install without source-repository access, private tools, undeclared dependencies or a TS loader. Recheck npm namespace availability; GitHub ownership is not npm ownership.
3. Inventory active source-repository callers, docs and installed skill paths. After separate cutover approval, migrate every maintained caller to the released package/skill, pin compatible versions and rerun each affected consumer's applicable checks. A source archive is not a maintained fallback implementation.
4. Remove obsolete maintained copies, aliases and shims in the same authorized consumer cutover; retain immutable historical evidence as history. Verify no active consumer still resolves the old implementation. Avoid a prolonged dual-maintenance period.
5. If qualification or consumer checks fail, stop before changing active consumers. If a completed cutover regresses, use an explicit release/cutover revert with retained provenance, not a hidden fallback to a second engine. Wider promotion follows successful onboarding and repeat use, not repo creation or seeded-demo counts.

## Validation

All boxes below are **future acceptance criteria**, not results from publishing this plan.

- [ ] Maintainer acceptance, execution permission, accepted source revisions, license/rights and file allowlist are recorded; source review dependencies are satisfied.
- [ ] Clean import contains only cleared code/prose/fixtures; no private history, product assets, machine receipts or private links are required by the public distribution.
- [ ] Packed artifact works in clean supported Node/Bun consumers; core behavior, canonical reports and CLI outcomes match the frozen contract, including invalid/insufficient evidence.
- [ ] Standalone skill works in fresh supported agent sessions without orchestration or private infrastructure and does not convert unknown evidence into approval.
- [ ] A pinned RNTL/Jest consumer and a Vitest consumer run ordinary named cases individually and together; RNTL events remain synthetic; existing behavior matchers are reused.
- [ ] Full CI detects omitted/skipped/duplicate/expected-failing/unmeasured obligations, missing results and stale/wrong-identity evidence; local selection does not alter the required inventory.
- [ ] Android emulator interaction → qualified fresh capture → named verdicts works for a valid state, real defect, repair and missing evidence, with correct semantics and clean teardown.
- [ ] Real browser interaction → approved-provider capture → named verdicts works at two sizes, including fractional, missing and covered-element cases, with clean teardown and no native claim.
- [ ] Fresh public onboarding requires no private checkout; published support claims match executed evidence. Runtime source and license provenance are inspectable.
- [ ] Approved consumer cutover migrates all active callers and the relevant skill, removes obsolete maintained copies and passes the affected consumer checks; failures do not trigger a hidden fallback.

## Risks / unknowns

- **Rights and acceptance:** source being available to a maintainer does not make it redistributable or accepted. These are hard pre-import gates, not paperwork after publication.
- **Scope creep:** supporting three contexts is useful; owning three automation stacks is not. RNTL initially needs a tested recipe, not a collector. Browser and native each get one qualified path.
- **Evidence mismatch:** equal numeric values do not make layout, accessibility, hit regions and synthetic events interchangeable. Refusal semantics must survive the wrappers.
- **Contract/version drift:** browser vocabulary and any changed incoming contract require explicit review and migration, not a branding-only change.
- **Native lifecycle:** coherent collection, readiness and teardown need actual device evidence. Screenshots or runner exit status cannot substitute for it.
- **Ergonomics:** if ordinary parameterized tests and an assertion helper suffice, stop there. Add custom matchers only when a real consumer demonstrates missing value.

## Notes

Repository creation and this draft are planning/publication work only. The package, skill, integrations and consumer migration remain unexecuted. The chosen name is Boopstick; legal clearance and npm reservation are not implied.

## Follow-ups

No additional implementation is authorized by this section. Wider native platforms and additional runner/driver integrations require separate proposals after the scoped paths prove useful; they are not conditions for claiming the initial Android/browser/RNTL target complete.
