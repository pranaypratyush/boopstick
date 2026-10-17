---
status: blocked
depends: []
specs:
  - specs/boopstick.md
awaits:
  - "Final parent review of this readiness draft and explicit Phase B worker assignment before code import."
---

# Plan: extract Boopstick and qualify its testing integrations

## Scope

Create a standalone comparator package and its relevant agent-neutral skill, then qualify a small RNTL/Jest recipe, Vitest consumption, one real-browser path and one real-Android-emulator path. The maintainer accepted PR1's scope and then said "ok proceed . whats next?", granting execution go-ahead for the accepted clean-import plan as prerequisites clear. This records authorization, not implementation: no source/runtime/skill has been imported, no package exists here and no integration is qualified.

Scope acceptance and execution go-ahead are distinct from the owner's subsequent "Approve Apache-2.0" decision. That decision authorizes public redistribution under Apache-2.0 of the selected owned comparator code, independent fixtures and generic authoring prose. The parent has accepted the audited source/prose selection, allowlist, transformations and exclusions; no concrete contrary third-party notice was identified in the selected closure. Newly discovered contradictory rights findings stop or exclude the affected material, not expand the grant. Uncleared third-party material, private application assets and private history remain excluded; registry-release approval is not granted. Source/target merges, native/browser collection, release and consumer cutover still require separate approvals. This readiness update remains a local draft with no push or PR mutation. Final parent document review and explicit Phase B worker assignment precede import; no new owner confirmation is needed for the already granted scope.

Use a clean file-based import, never a mirror, fork or history push from the source repository. Scope excludes unrelated orchestration, product application code/assets, old experimental runtimes, historical machine receipts and additional automation frameworks. No automatic executor, publication workflow or new dependency is installed by this proposal.

## Implements

[Accepted Boopstick target behavior](../specs/boopstick.md): one pure comparator, ordinary selectable tests with complete CI accounting, honest RNTL/browser/native evidence boundaries, optional integration dependencies and a standalone authoring skill. PR2 and PR3 remain separate unapproved amendments; this plan does not adopt their requirements.

## Approach

### A. Resolve readiness and freeze the move

1. Scope acceptance and execution go-ahead are recorded above. Keep source review, destination review, rights approval and later operational approvals distinct; none substitutes for another.
2. Use the accepted exact-3.1 candidate as the extraction baseline: `compare` and `canonicalReport`, request schema 3, capture schema 2, report version 3 and admitted provider `web-dom-border-box`. Exact `"3.0"` headers are refused, not aliased. The core remains five relative-import modules for vocabulary, request validation, assertion evaluation, measurement and comparison. The parent has accepted the immutable source selection and declared transformations/exclusions; follow that allowlist rather than an arbitrary latest head.
3. The earlier 3.0/no-browser source snapshot is superseded. Existing source verification is upstream evidence, not destination package or neutral-browser/Android qualification. Preserve all 19 authored and 49 independent cases during adaptation; rerun the selected contract's declared checks in Phase B. Review any further semantic change before implementation. The selected UI-authoring/evidence references still describe the old snapshot and depend on host testing/review policy. Exact source prose selection and the requirements for exact-3.1 alignment, agent neutrality and removal of host-policy/private-source dependencies are accepted. Implement and independently qualify the standalone adaptation within Phase B before publishing it, not as a prerequisite to starting Phase B. A bounded search found no comparator-specific standalone skill entrypoint; that is not a claim of global absence.
4. Owner redistribution/license approval and parent approval of the audited per-file selection and allowlist are cleared for the selected material, with declared transformations and exclusions retained. An approved inventory is not completed extraction. If new evidence contradicts ownership or third-party clearance, hold or exclude the affected material; adding a license cannot cure missing rights. During Phase B, author public provenance using cleared source-file content digests and derivation descriptions, not private source revisions/URLs, personal metadata, history or the private mapping. Public consumers must not need the private review record. Final parent document review and explicit Phase B assignment remain before import; this documentation assignment imports nothing.

### B. Import a behavior-preserving core and the relevant skill

Import only the accepted evaluator, request validation, rule evaluation, measurement and vocabulary modules; necessary behavioral fixtures; the self-contained contract; and the accepted source authoring/evidence prose for adaptation. Exclude obsolete 2.1 and presemantic 3.0 implementations and assertions that depend on running them. The current source check imports the presemantic runtime, so it cannot be copied wholesale: adapt the selected behavior/oracle checks to run against the current core without carrying that obsolete implementation. Retain independently justified oracle coverage without shipping private assets or deriving expected results from the candidate implementation.

One dependency-free package named `boopstick` is enough: compiled ESM/declarations, explicit exports, the offline CLI, retained behavior checks and neutral examples. Keep `private: true` until separate registry-release approval. Keep the two core functions and accepted statuses intact. Implement `boopstick <request.json> <capture.json>` and `--help` with the [specified output/exit contract](../specs/boopstick.md#distribution-and-skill): canonical report plus newline for comparator results, exits 0/1/2 for all-pass/fail-or-unmeasured/invalid-or-operational-error; operational errors use stderr without a fabricated report, and help exits 0. Add no stdin/watch/daemon/retry features.

Within Phase B, extract and adapt one `boopstick` skill, not the parent orchestration skill, then independently qualify it in fresh supported agent sessions before publication. Package behavior and skill guidance must agree on exact 3.1; remove host-policy/private-source dependencies and keep the skill agent-neutral. Place the one canonical contract at `skills/boopstick/references/contract.md`, not `docs/contract.md`; link it from the package README and pack the skill bundle with that contract so skill-directory-only copies remain self-contained. Add no duplicate schema document. Include Apache-2.0 `LICENSE` in the repository/package and author compact sanitized `docs/provenance.md` with cleared content digests and origin/derivation, excluding private URLs/revisions and personal emails.

Inspect the packed artifact in a clean directory with supported Node LTS and Bun. Exercise pass, measured failure, not-measured, invalid input and operational errors, including the specified stdout/stderr/newline/exit behavior and help. Verify the packed skill/contract and license are present and the skill-only copy is self-contained. Review secrets, personal/machine paths, assets, notices, source/privacy boundaries and package contents; obtain parent review before any public code push. Keep registry release separately gated and `private: true` until approved. Publish the cleared provenance/contract alongside the code so public consumers do not follow private links.

### C. Qualify ordinary-test integration, including RNTL

Use existing Vitest/Jest registration and standard reports; add only the small assertion/report seam justified by consumer use. Register cases from canonical declarations, not observed elements. Keep a stable case identity and the full request. Reuse immutable comparison results where appropriate.

RNTL qualification is a small real consumer integration: install the packed artifact into a maintained, version-pinned RNTL/Jest example; exercise one component interaction with existing RNTL matchers, and run Boopstick's declared synthetic policy cases in the same suite. Prove a case works alone, all cases run together, failure diagnostics remain useful and teardown does not leak state. A supplied layout event must remain synthetic and must be refused as live layout acceptance. Do not add a fake geometry collector or duplicate RNTL assertions.

Prove complete-CI accounting against the canonical declared IDs with full, filtered, skipped, duplicated, missing-result, expected-failure and stale/wrong-candidate cases. Use existing machine reports and attachments, not another test inventory. Local filtered feedback remains permitted; it cannot approve the complete matrix.

### D. Qualify two bounded real-interaction paths

After B/C and approval of each collection scope, qualify the native and browser paths separately. Native-first is a useful first consumer target; neither path is a prerequisite for pretending the other works, and neither can be silently dropped from the accepted target scope.

**Android emulator:** use one original neutral RN specimen and a bounded scenario. Drive an actual interaction with Maestro or the consumer's already-chosen native driver; use authorized ADB and/or in-app RN hooks for the measurements the obligation requires. Select the correct checkpoint, qualify coordinate/unit conversion, keep accessibility/layout/text observations distinct, capture one real defect and repair, and prove no stale evidence or leaked process/device state. Feed the capture into ordinary TS cases; do not run the comparator inside Maestro's JavaScript sandbox. No Detox/Appium stack is added merely to obtain these facts.

**Real browser:** use the accepted exact-3.1 `web-dom-border-box` provider rather than inventing or relabelling a provider. After collection-scope approval, use Playwright Test fixtures against one original neutral specimen at two viewport sizes, with an actual interaction before collection. Qualify DOM border-box acquisition, subject identity, units/origin, scope and readiness against the accepted contract. Test fractional measurements, a real defect/repair, missing observations and an overlay counterexample. Preserve browser actionability as a separate obligation rather than claiming geometry proves interaction success. RN Web remains browser evidence. Bounded upstream browser evidence does not satisfy this neutral integration's qualification.

Use the same high-level obligation across the two specimens only where semantics truly match. Do not force identical locators or manufacture a universal test DSL. Initial Android qualification does not imply iOS/physical-device support; adding those needs explicit later scope and execution evidence.

### E. Release, then cut over consumers without a compatibility layer

1. Finalize licensing/provenance and document the actually tested runner/renderer/platform/version matrix. Unsupported combinations remain explicit. The full three-context target is not complete until C and both D paths pass; an earlier offline preview must be labelled narrowly and cannot close this plan.
2. Produce the versioned package and matching skill only after release approval. Test a fresh consumer install without source-repository access, private tools, undeclared dependencies or a TS loader. Recheck npm namespace availability; GitHub ownership is not npm ownership.
3. Inventory active source-repository callers, docs and installed skill paths. After separate cutover approval, migrate every maintained caller to the released package/skill, pin compatible versions and rerun each affected consumer's applicable checks. A source archive is not a maintained fallback implementation.
4. Remove obsolete maintained copies, aliases and shims in the same authorized consumer cutover; retain immutable historical evidence as history. Verify no active consumer still resolves the old implementation. Avoid a prolonged dual-maintenance period.
5. If qualification or consumer checks fail, stop before changing active consumers. If a completed cutover regresses, use an explicit release/cutover revert with retained provenance, not a hidden fallback to a second engine. Wider promotion follows successful onboarding and repeat use, not repo creation or seeded-demo counts.

## Validation

The completed boxes record decisions only. All unchecked boxes are **future acceptance criteria**, not results from creating this readiness draft.

- [x] Maintainer acceptance of PR1 scope and subsequent execution go-ahead are recorded, without treating them as rights, collection, release or cutover approval.
- [x] Owner authorization for public redistribution under Apache-2.0 of owned/cleared selected comparator code, independent fixtures and generic authoring prose is recorded; uncleared third-party material, private application assets and private history are excluded, with no blanket rights or registry-release approval.
- [x] Parent accepts exact-3.1 alignment, agent neutrality and host-policy dependency removal as adaptation requirements; implementation and independent qualification belong within Phase B, not before it.
- [x] Parent accepts the audited immutable source/prose selection, import allowlist and declared transformations/exclusions under the scoped owner grant; no concrete contrary third-party notice was found in the selected closure. New contradictory findings hold or exclude affected material.
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

- **Rights boundary:** the scoped owner grant and audited selection are approved, not a blanket grant. Hold or exclude affected material if new contradictory ownership/third-party evidence appears; private assets/history remain excluded.
- **Scope creep:** supporting three contexts is useful; owning three automation stacks is not. RNTL initially needs a tested recipe, not a collector. Browser and native each get one qualified path.
- **Evidence mismatch:** equal numeric values do not make layout, accessibility, hit regions and synthetic events interchangeable. Refusal semantics must survive the wrappers.
- **Contract/version drift:** browser vocabulary and any changed incoming contract require explicit review and migration, not a branding-only change.
- **Native lifecycle:** coherent collection, readiness and teardown need actual device evidence. Screenshots or runner exit status cannot substitute for it.
- **Ergonomics:** if ordinary parameterized tests and an assertion helper suffice, stop there. Add custom matchers only when a real consumer demonstrates missing value.

## Notes

The accepted PR1 scope, execution instruction, scoped owner Apache-2.0 grant and parent-approved audited selection clear the owner/selection decisions for Phase B. Final local document review and explicit Phase B assignment still precede import; no new owner confirmation is needed for those granted scopes. The package, standalone skill, integrations and consumer migration remain unexecuted. This readiness draft awaits parent review before publication; PR2/3 are not adopted. The chosen name is Boopstick; npm reservation and registry-release approval are not implied.

## Follow-ups

No additional implementation is authorized by this section. Wider native platforms and additional runner/driver integrations require separate proposals after the scoped paths prove useful; they are not conditions for claiming the initial Android/browser/RNTL target complete.
