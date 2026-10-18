# Android experiments

**Disposition:** bounded local native qualification is complete, independently verified and accepted. Earlier incomplete checkpoints below are historical failures, not current status. The transport-loss cause remains unresolved.

These are newly authored summaries, not exported receipts or instructions to launch a campaign. Public evidence: [Android example](../../examples/android/README.md), [accepted plan](../../plans/extract-boopstick.md) and [specification](../../specs/boopstick.md). Private primary evidence includes build, transport, local-smoke, campaign and independent-review records; those artifacts are not published here. Historical status prose in the source documents must be read against their current accepted-result sections.

## AND-01 — Build isolation before runtime claims

- **Question / why:** Can the diagnostic specimen compile with bounded, owned tool state, without treating an APK as device evidence?
- **Setup:** Pinned RN/Android toolchain; bundled JavaScript, x86_64 diagnostic signing, existing SDK terms; build-only authorization separate from installation and collection.
- **Observed result:** The first attempt reached its 720-second bound, exited 143 and produced no APK. A separately approved isolated resumption passed in 128.052 seconds; file-only inspection established package, ABI, bundled bytecode and signature properties. A later changed-source build for acquisition passed in 60.250 seconds.
- **Failure / correction:** The first bundle inherited shared OS temporary paths. The resumption set owned JVM/Gradle/Metro temporary paths and observed actual daemon/child settings and cache outputs; the earlier isolation defect remains recorded.
- **Lesson / decision:** Observe inherited subprocess state, not just launcher environment. Compilation and file inspection prove build properties; installation, interaction, measurement and teardown need separate evidence.
- **Limits / evidence:** No independent rebuild or loaded-code attestation follows. Source: Android example, “Observed preparation result” and “Historical build evidence boundary”; private build and verification records.

## AND-02 — Transport research versus ordinary local use

- **Question / why:** Could pinned Maestro satisfy an initially strict dedicated-transport/no-shared-device envelope, and was that envelope actually required by the user?
- **Setup:** Read-only pinned-source transport/permission research; a separate direct-adbd candidate review; later explicit user choice of ordinary local-emulator testing.
- **Observed result:** Research found the ordinary explicit-serial/dedicated-server route did not satisfy the strict no-shared/no-unrelated-device constraints. The direct branch remained a source-only candidate, not qualified isolation. The later user grant permitted normal local discovery and bounded owned-emulator use while preserving unrelated devices and shared ADB.
- **Failure / correction:** Static routing possibilities did not establish end-to-end binary isolation. The scope changed through the user's ordinary-local choice, not through a fabricated environment switch, patched driver or claim that the original constraints had passed.
- **Lesson / decision:** Distinguish a research envelope from the authorized operating model. Do not make dedicated-machine or zero-enumeration requirements prerequisites for an explicitly authorized ordinary local test.
- **Limits / evidence:** Neither source inspection nor ordinary local use establishes total host isolation. Private transport/direct-route and local-resumption records; public source: Android example, “Native qualification recipe — bounded path accepted”.

## AND-03 — Local interaction is not native measurement

- **Question / why:** Does boot/install/toggle success prove the native geometry handoff?
- **Setup:** Historical bundled diagnostic APK on a fresh owned local emulator; explicit target; real off→on toggle and private UI/screenshot evidence.
- **Observed result:** The local smoke booted in 40.391 seconds and demonstrated interaction with owned teardown. That specimen had no measurement/export seam yet.
- **Failure / correction:** Authored dimensions and a working toggle could not supply observed RN geometry. The later acquisition implementation added actual callbacks and raw export rather than promoting smoke evidence into comparator qualification.
- **Lesson / decision:** Keep app interaction, layout observation and external verdicts separate. UI evidence corroborates state; it does not measure RN dimensions.
- **Limits / evidence:** The smoke is not a Maestro/comparator campaign, paint qualification or native-platform certification. Private local-smoke and native-seam records; public source: Android example, historical build boundary and current acquisition recipe.

## AND-04 — Unsafe emulator control exposure is not a recipe

- **Question / why:** Were the emulator's actual control endpoints safe, rather than merely configured with reassuring flags?
- **Setup:** An earlier local smoke enabled an unnecessary gRPC listener; the later bounded harness checked actual logs and owned listening endpoints.
- **Observed result:** The earlier launch exposed unauthenticated wildcard gRPC and was stopped. The accepted path did not opt into a gRPC port; observed control listeners were loopback-only, with no gRPC startup log.
- **Failure / correction:** The unsafe launch was explicitly excluded from reuse. Unexpected insecure/non-loopback exposure stops the owned process; authentication flags alone do not authorize a wildcard listener.
- **Lesson / decision:** Check actual exposure. Reuse the corrected bounded lifecycle, never the historical unsafe command.
- **Limits / evidence:** No independently verified JWT handshake or total filesystem isolation is claimed. Standard emulator crash paths and shared ADB effects remain outside complete confinement. Public source: Android example, control-exposure and teardown constraints; private qualification/security records.

## AND-05 — Observed facts belong in the app; verdicts outside it

- **Question / why:** What is the smallest native-to-comparator seam that preserves coordinate, unit, state and freshness meaning?
- **Setup:** Fresh invocation and real toggle/capture action; public RN host refs call `measureInWindow` for root and subject in one window/dp space. Generation, ref and environment guards bound asynchronous callbacks. A fixed emulator-host route exports only observed raw facts to an owned loopback receiver.
- **Observed result:** The accepted collector preserves raw floats, separately verifies the common-frame 24 dp offset, constructs the external request/capture and canonical comparator report, then re-reads byte-bound raw/UI evidence. The app supplies neither expected dimensions nor verdicts.
- **Failure / correction:** Screenshots, accessibility bounds, density division and guessed top insets cannot substitute for callback measurements. Missing acquisition is withheld; actual absence requires committed unmount plus corroboration. Old-attempt and duplicate exports are refused.
- **Lesson / decision:** Reuse RN observation and ordinary tests, not a new native module, driver or runner. Expectations remain independent: 200.5 × 48 dp, tolerance 0.5 dp, density at least 1; do not tune them to outcomes.
- **Limits / evidence:** Static-fixture steadiness is not an atomic native transaction. Debug HTTP policy is not an egress firewall. Public sources: [app capture](../../examples/android/App.js), [collector](../../examples/android/collector.mjs), Android example acquisition recipe; private source/API and campaign records.

## AND-06 — Permission and screenshot gates caught setup errors

- **Question / why:** Would the campaign preserve denied overlay state and retain screenshots within the driver's artifact rules?
- **Setup:** Fresh owned emulator, explicit empty driver permission grants, required overlay-denial readback, pinned Maestro screenshot commands.
- **Observed result:** One campaign stopped before interaction because package-mode readback was `default`, not explicit denial. An affected probe established UID denial. A later campaign passed launch and valid/off assertions but rejected an absolute screenshot destination before toggle/capture.
- **Failure / correction:** The harness requires explicit UID-level denial rather than accepting missing/default operations. Screenshot arguments became contained relative basenames. The initial error screenshot proves only the initial screen, not completed interaction or geometry. A diagnostic helper's incorrect assumption that `appops help` must exit zero was also retained as a separate failure.
- **Lesson / decision:** Permission intent needs readback; driver success needs correctly scoped artifacts. Repair the failing boundary without weakening its guard or rerunning unrelated campaigns.
- **Limits / evidence:** UID success does not explain the original package-mode visibility failure. Local path/syntax checks at the repair checkpoint were not runtime qualification. Public source: Android example historical campaign checkpoints and [Maestro screenshot rules](https://docs.maestro.dev/reference/commands-available/takescreenshot); private probe/campaign records.

## AND-07 — Persist ingress before acknowledging export

- **Question / why:** Can export success survive target loss without falsely qualifying the capture?
- **Setup:** A historical campaign completed valid and defect driver flows. The receiver then held pending bytes in memory until post-driver target validation.
- **Observed result:** Valid raw bytes and a receipt were retained. After the defect flow returned zero, the explicit serial disappeared before host acceptance; no defect raw file or receipt survived. “Capture: exported” did not establish numeric defect geometry. Repair, missing and absence did not start in that invocation.
- **Failure / correction:** The receiver now writes exact raw bytes and an `unqualified` pending record with their digest before HTTP acknowledgment. Write failure refuses acknowledgment. Qualification still waits for target/state corroboration and persisted-byte verification; pending evidence is not a receipt or verdict.
- **Lesson / decision:** Durability and qualification are different transitions. Preserve ingress before ACK without bypassing target checks. Retain the lost-payload boundary rather than inventing its measurements.
- **Limits / evidence:** Target-loss initiation is still unknown; no reconnect, retarget or shared-server reset is implied. Public sources: collector and [device-free retention regression](../../examples/android/receiver.test.mjs); private failed-campaign and ingress-repair records. Later success does not reconstruct the missing payload.

## AND-08 — Five acquisitions and complete ordinary accounting

- **Question / why:** Does the real native path distinguish defect, repair, missing evidence and qualified absence, while refusing selected green feedback as full acceptance?
- **Setup:** One separately approved instrumented invocation, unchanged diagnostic APK/tools, five actual modes and fifteen predeclared ordinary cases. Fixed policy and tolerance stayed unchanged.
- **Observed result:** Completion took 153.643 seconds, including 35.454-second boot. Width measured about 200.381 dp. Valid/repair height was 48 dp; authored 47 dp defect measured about 46.857 dp and failed height while width passed. Missing remained mounted with `not_measured/missing-fact`; actual unmount passed qualified absence. All five exports were retained and all fifteen cases passed their expected checks. A selected one-pass/fourteen-skipped invocation was refused as complete acceptance.
- **Failure / correction:** Earlier one-capture/selected-case checkpoints were incomplete, not an alternative definition of done. Durable ingress and an explicitly authorized continuation supplied the missing end-to-end evidence; acceptance did not come from lowering the gate.
- **Lesson / decision:** A passing negative-control test can contain an expected comparator failure. Count exact obligations and outcomes, not process success or green siblings. Full requests remain intact during selection.
- **Limits / evidence:** Wrong-identity/environment/checkpoint, timing/coherence and tamper controls over retained data are labelled offline counterfactuals, not extra device acquisitions. Public sources: Android example accepted result, plan acceptance criterion and [ordinary cases](../../examples/android/native.test.mjs); private final campaign records.

## AND-09 — Independent lifecycle and semantic checks

- **Question / why:** Can native-result correctness and resource/accounting safety be reviewed without letting one stand in for the other?
- **Setup:** Separate independent lifecycle and retained-data semantic reviews of the settled bounded invocation, followed by terminal cleanup reconciliation.
- **Observed result:** Lifecycle review matched 19 source files, 112 historical bindings and 323 command lifecycles. Semantic review checked all five raw/pending/receipt/UI chains, replayed the fifteen-case suite and ingress regression, and confirmed selected-feedback refusal. Immediate cleanup still showed an offline serial; later readback showed no devices, owned listeners or recorded process groups, with shared ADB preserved. Parent accepted the bounded result.
- **Failure / correction:** Delayed terminal evidence qualified the immediate cleanup observation rather than rewriting it. Offline replay did not become a new native invocation, and a successful campaign did not diagnose old transport loss.
- **Lesson / decision:** Review acquisition semantics and lifecycle independently; preserve observations at their actual times. Acceptance covers the demonstrated local path only.
- **Limits / evidence:** No general transport reliability, physical-device/iOS support, atomic collection, full host isolation or loaded-code attestation. Public source: Android example accepted result; private independent lifecycle/semantic reviews and cleanup reconciliation.
