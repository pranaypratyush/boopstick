# Neutral Android specimen and bounded native consumer

**Current status: bounded native qualification independently verified and parent accepted.** The accepted instrumented invocation used the unchanged diagnostic APK and pinned tools, retained all five actual captures, and passed all 15 ordinary cases. The qualification source snapshot is commit `f286a9d`; later release documentation does not rewrite its retained evidence.

## Accepted native result

The invocation completed in **153.643 seconds**, including **35.454-second** boot. Policy stayed **200.5 × 48 dp**, tolerance **0.5 dp**, common-frame left offset **24 dp**; measured width was200.38095092773438dp.

| Actual mode | Subject height dp | Result |
|---|---:|---|
| valid | 48 | width/height pass |
| defect | 46.857147216796875 | width pass; height fail |
| repair | 48 | width/height pass |
| missing | no observation; subject still mounted | `not_measured/missing-fact` |
| absent | subject actually unmounted | qualified absence pass |

Independent lifecycle review matched19 source files,112 historical bindings and323 command lifecycles. Independent semantics review checked all five raw/pending/receipt/UI chains, reran the15-case offline suite and the device-free ingress regression, and confirmed that selected1-pass/14-skipped feedback cannot satisfy full accounting. Those replays are not additional device acquisitions.

Immediate cleanup retained an **offline** serial row. A later terminal readback found an empty device list, no owned listeners or recorded process groups, and the existing shared ADB server still running. The old transport-loss initiator remains unresolved; this success neither reconstructs its missing payload nor proves general transport reliability, atomic native collection, total host isolation or loaded-code attestation.

## Historical build and campaign checkpoints

The original screen and optional external host consumer implement the approved RN-window acquisition path. The first separately approved changed-source build passed in **60.250 seconds** with observed owned Gradle/Metro temporary paths. Its diagnostic APK is **38,943,841 bytes**, SHA256 `ebbb28f2e97cbabfde787ad634672868738ff6174877cd5a41153fc25eaad61e`; file-only inspection verified application ID/version, x86_64 ABI, min/target SDK24/36, INTERNET plus merged debug permissions, and diagnostic APK Signature Scheme v2. **Native qualification remains incomplete and independent runtime review is pending.** The first campaign booted and installed on a fresh owned API35 emulator, then stopped before interaction/measurement because package-mode overlay denial readback returned `No operations` / `Default mode: default`, not explicit denial.

The original aggregate had stopped **before compilation/native startup** in consumer setup: its metadata helper used CommonJS `require.resolve` against the comparator's import-only ESM export. Both owned lookup sites now use `import.meta.resolve`; the affected setup-only rerun passed on Node24.21.0/Bun1.4.3 against the unchanged accepted archive, unsaved with lifecycle scripts disabled. A separate continuation verified that installed entry and frozen source before the first compile/campaign; it did not restart the aggregate or rerun setup. Original markers, failures and pre-correction source evidence remain retained. Deep-link query quoting passed an inert local shell round-trip, not a device launch.

An affected-only overlay probe established that documented `appops set --uid` produces `Uid mode: SYSTEM_ALERT_WINDOW: deny` on this image. The qualifier sets and requires that explicit UID denial; `default`/missing operations are not accepted. This does not establish why the original package-mode write was not visible, nor qualify a full campaign. One preliminary diagnostic helper stopped because Android's valid `appops help` returned255 rather than its assumed0; that failure is retained separately. At that repair stage no build or full campaign was repeated. Observed owned processes exited and all recorded control ports refused both IPv4/IPv6 connections; shared ADB was not stopped.

**Previous separately authorized corrected campaign:** the owned emulator booted in **36.513 seconds**, the retained changed-source APK was installed, UID denial passed and Maestro2.11 passed actual app launch, `Mode: valid` and `State: off` assertions. The first `takeScreenshot` then rejected the host's absolute path because it escaped that command's artifact folder, before any toggle or capture. An automatic failure screenshot shows the real initial screen, not completed interaction or measured geometry. The host then supplied `${mode}-screen` as a relative basename, following [Maestro's artifact-path rules](https://docs.maestro.dev/reference/commands-available/takescreenshot); local filename/containment and Node syntax checks passed. At that checkpoint the repaired screenshot command had not been rerun, all five acquisitions/fifteen cases were unexecuted, and no rebuild/setup/repack or further campaign had followed.

During that failed campaign's teardown, the serial became unavailable; the qualifier used its owned-emulator process fallback rather than retargeting. The emulator and Maestro process group are absent; recorded control/receiver ports refused IPv4/IPv6 connections, final device listing was empty and default AVD names matched baseline. Driver stderr retains its offline shutdown warning; the underlying transport disappearance is not diagnosed. The emulator also reported its default host crash-database location outside the owned temp directory; that shared state was not inspected or deleted, and total host isolation is not claimed.

**Third qualifier invocation, separately approved:** the owned emulator booted in **36.657 seconds** and the same APK was installed. Both valid and defect Maestro flows passed their actual toggle, on-state, capture/export and contained screenshot commands. The valid raw bytes were persisted once and re-read with UI/capture/report binding checks: subject width **200.38095092773438dp**, height **48dp**, relative x **24dp**, density **2.625**, stable generation5 and7ms interval. The external exact3.1 canonical width/height report passed without changing policy/tolerance. Actual prior valid bytes were refused on the old path409/current path422, and duplicate submission409.

After the defect flow returned0, the explicit serial disappeared before host acceptance. No defect raw file/receipt was persisted; its `Capture: exported` screenshot does not establish numeric geometry or a comparator verdict. The receiver then retained pending bytes in memory until post-driver target validation, so this failed boundary did not preserve the defect payload. Repair/missing/absence never started. No target guard was weakened, no retarget/reconnect was attempted and no fourth invocation had followed at that checkpoint. An affected-only first ordinary replay over the retained valid bytes passed **valid width** with14 skipped siblings; full accounting correctly refused it. This is1/5 retained acquisitions and1/15 selected feedback, not full qualification or independent acceptance.

The independent fixture policy is **200.5 × 48 dp**, tolerance **0.5 dp**, with a separately checked subject-to-root left offset of **24 dp**. At density ≥1, nearest-native-pixel rounding contributes at most 0.5/density dp per rounded dimension; the fixed 0.5 dp dimension allowance must not be fitted to outcomes. The relative offset allows the same 0.5 dp for this bounded common-frame fixture, and must be checked against actual observations. No density division, guessed top inset or screenshot-derived RN dimensions is permitted.

## Pinned prerequisites

React Native 0.88.0, React 19.3.1, Community template 0.88.0-derived native bootstrap, CLI/platform-android 20.2.0, Bun 1.4.3, Node 24.21.0, JDK 17, standalone Gradle 9.4.1. SDK compile 37, target 36, min 24; Build Tools 37.0.0; NDK 27.1.12297006. The SDK repository names the API-37 platform package `platforms;android-37.0`. RN native compilation also uses CMake 3.22.1. Do not install emulator/system-image/driver packages for this build.

The preserved template declares Kotlin **2.2.0**; AGP **9.2.1** documentation requires KGP ≥2.2.10. The executed dependency graph selected **2.2.10 for the application buildscript**, while the included RN Gradle-plugin build retained 2.2.0. No source pin was changed or compatibility check bypassed. The diagnostic compile passed on the recorded host; this is not general toolchain/platform certification.

See [third-party notices](THIRD_PARTY_NOTICES.md). Original specimen and upstream boilerplate have distinct license provenance. No new SDK license acceptance is authorized.

## Observed preparation result

On Node 24.21.0, Bun 1.4.3 and OpenJDK 17.0.20.1, `bun install --ignore-scripts` resolved 439 packages and produced `bun.lock`. The isolated SDK manager acquired platform 37.0 revision 2, Build Tools 37.0.0 and CMake 3.22.1 using an unchanged existing acceptance file, without a license prompt. Gradle additionally auto-acquired Platform-Tools 37.0.1 into that isolated SDK; no device tool was invoked. Gradle 9.4.1's distribution was verified against its official SHA256: `2ab2958f2a1e51120c326cad6f385153bb11ee93b3c216c5fccebfdfbb7ec6cb`.

The first bounded `buildEnvironment :app:assembleDebug` attempt completed dependency-graph reporting and offline JS/Hermes bundling, then reached its **720-second bound** during Android dependency/resource processing. The client exited 143; no APK was produced by that attempt. Its failures, graph and intermediate bundle remain retained unchanged.

**Historical isolation limitation:** the first bundle inherited the default OS temporary directory, so Metro's transform/file-map caches were not confined to owned work. Potentially shared temporary cache state was not inspected broadly or deleted. The later successful attempt does not retroactively qualify that first attempt.

After explicit approval of exactly one further **1800-second maximum** compile, `:app:assembleDebug` passed in **128.052 seconds** (55 executed tasks). Before compilation, launcher Java, an actual Gradle daemon and its Node/Metro child were observed using the owned temporary directory; the compile's daemon/child guard and resulting transform/file-map files confirmed that isolation. Existing owned dependencies/SDK/Gradle caches were reused in a separate private project copy; no install campaign, pin change, new SDK acquisition or new license acceptance occurred.

The resulting APK is **38,935,814 bytes**, SHA256 `0f339f9e3d542cd7860dec70ce19531a31956a7ef4839d7b71b5e23ef5ca55b6`. File-only inspection established application ID `org.boopstick.specimen`, version `0.0.0-diagnostic` (code 1), min/target SDK 24/36, debuggable status, bundled Hermes bytecode and x86_64 native libraries. APK Signature Scheme v2 verified with the owned RSA-2048 certificate `CN=Boopstick Diagnostic`; no installation or launch occurred. Scoped Gradle stop/status passed and the observed launcher/daemon/probe PIDs were absent.

## Isolated local build

Run from this directory. Provide an independently acquired/checksummed **Gradle 9.4.1** distribution, **JDK 17**, **Node 24.21.0**, and an exact **NDK 27.1.12297006** directory. They may be read-only. `$WORK` must be a fresh owned private directory, outside this repository; `$EXISTING_ANDROID_SDK` is read-only. Set `$SDKMANAGER` to an existing command-line-tools 22.0 SDK manager. The SDK manager currently emits a deprecation warning recommending Android CLI; this recipe does not install a replacement or change the pin.

```sh
mkdir -p "$WORK/project"
cp -R App.js index.js package.json bun.lock babel.config.js metro.config.js android "$WORK/project/"
cd "$WORK/project"
export HOME="$WORK/home"
export TMPDIR="$WORK/tmp"
export GRADLE_OPTS="-Duser.home=$HOME -Djava.io.tmpdir=$TMPDIR"
export JAVA_TOOL_OPTIONS="-Duser.home=$HOME -Djava.io.tmpdir=$TMPDIR"
mkdir -p "$HOME" "$TMPDIR"
export JAVA_HOME="$JDK17"
export NODE_BINARY="$NODE24/bin/node"
export PATH="$NODE24/bin:$JAVA_HOME/bin:$PATH"
export ANDROID_HOME="$WORK/sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export ANDROID_USER_HOME="$WORK/android-user"
export GRADLE_USER_HOME="$WORK/gradle-user"
export BUN_INSTALL_CACHE_DIR="$WORK/bun-cache"
export BOOPSTICK_ANDROID_NDK="$NDK27"
export BOOPSTICK_ANDROID_KEYSTORE="$WORK/diagnostic.keystore"
mkdir -p "$ANDROID_HOME/licenses" "$ANDROID_USER_HOME" "$GRADLE_USER_HOME"
cp "$EXISTING_ANDROID_SDK/licenses/android-sdk-license" "$ANDROID_HOME/licenses/"
"$SDKMANAGER" --sdk_root="$ANDROID_HOME" --install \
  'platforms;android-37.0' 'build-tools;37.0.0' 'cmake;3.22.1' </dev/null
bun install --ignore-scripts --frozen-lockfile
"$JAVA_HOME/bin/keytool" -genkeypair -keystore "$BOOPSTICK_ANDROID_KEYSTORE" \
  -storepass android -keypass android -alias androiddebugkey -keyalg RSA \
  -keysize 2048 -validity 30 -dname 'CN=Boopstick Diagnostic' -noprompt
"$GRADLE941/bin/gradle" --no-daemon --max-workers=2 \
  --project-cache-dir "$WORK/project-cache" -p android \
  "-Dorg.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m -Duser.home=$HOME -Djava.io.tmpdir=$TMPDIR" \
  -Pkotlin.compiler.execution.strategy=in-process \
  :app:assembleDebug --console=plain --stacktrace
```

Closed SDK-manager stdin is deliberate: **stop if terms are not already accepted**, regardless of its exit status; never answer yes or manufacture acceptance hashes. Stop on a missing package or incompatible toolchain. The first dependency-resolution run creates the committed `bun.lock`; subsequent builds use the frozen command above. No lifecycle scripts, package-manager executors or global package installs are required. All source dependencies are local to this optional example, not Boopstick core.

Only the x86_64 diagnostic ABI is selected; that build alone did not qualify an emulator/device. The maintained RN Gradle bundling task includes `index.android.bundle` even for debug, and `useDevSupport = false` removes the runtime Metro requirement. **Historical APK:** its source manifest requested no permissions, dependency merging added RN debug `SYSTEM_ALERT_WINDOW` and `ACCESS_LOCAL_NETWORK` plus AndroidX's application-scoped dynamic-receiver permission, and APK badging found no `INTERNET`. The new acquisition source adds app-scoped networking separately; inspect the changed APK rather than carrying historical permissions forward. A temporary explicitly located debug key signs the APK; no release credentials or global debug key are used. Outputs are under `$WORK/project/android/app/build/outputs/apk/debug/`; caches, keys, binaries and machine receipts are excluded from source publication.

## Historical build evidence boundary

The one expressly authorized build-preparation resumption completed native compilation, diagnostic signing and file-only APK inspection with unchanged source/configuration/lock. It did not qualify device interaction, coordinate/unit/coherence semantics, export, collector or device teardown. Those were separately gated, and no device, emulator, automation-driver, Metro-server or native collection command belonged to that build preparation. That historical result itself authorized no further compile or publication.

Parent accepted that bounded historical diagnostic build preparation after independent Spec/APK file-only inspection and separate Standards/rights review found no material actionable findings. Neither review independently rebuilt or ran the app; source-copy parity and recorded artifact bindings are not loaded-code attestation. Scoped source/document publication was separately authorized, excluding APKs, keys, caches and private receipts. Later local interaction smoke proved only off→on use of the historical APK. The separately released native implementation continuation produced the changed-source build above but did not complete runtime qualification; independent runtime acceptance and further campaign disposition remain pending.

## Native qualification recipe — bounded path accepted

The app owner implements `boopstick://capture?port=<port>&attemptId=<opaque-token>&mode=<mode>`, a fresh initial-URL launch, real toggle and capture-button. Public View refs call `measureInWindow`; root and subject share `boopstick-window`, window coordinates and dp. Generation/ref/environment guards and bounded callbacks delimit a static fixture, not an atomic native transaction. The app posts only observed raw facts to the fixed emulator host alias `10.0.2.2`, never verdicts or expected dimensions. INTERNET and debug-only exact-host cleartext policy are not an egress firewall.

`scenario.mjs` predeclares fifteen ordinary Vitest cases before measurement. Five actual modes are collected: valid48, real defect47, repair48, withheld acquisition with a still-present widget, and committed actual absence. The full width/height request stays intact during a selected width test. A full gate rejects partial/skipped/inverted/repeated feedback. Wrong candidate/checkpoint/environment, overlong/unsteady intervals and receipt tampering are explicitly labelled offline counterfactuals over retained device data; they are not additional device executions. Actual prior-attempt raw export bytes are separately replayed to a new receiver and refused.

Receiver requirements: OS-assigned port bound only to `127.0.0.1`; POST path bound to one fresh attempt/mode; at most64KiB; exact raw shape, finite rectangles/environment and one accepted body; bounded90-second acquisition lifetime. Before acknowledging an export, the receiver writes its exact bytes once to `<mode>-raw.json` and records their digest in `<mode>-pending.json` with status `unqualified`. A write failure refuses acknowledgment. Pending data is not a qualified capture or verdict. Only after target/state corroboration does the adapter verify those persisted bytes, build exact3.1 request3/capture2 outside the app, canonicalize the external comparator report and write the receipt. Raw/UI files are re-read and checked against that receipt. Fixture/collector content hashes and the APK digest are external provenance bindings, not loaded-code attestation.

Run `node --test receiver.test.mjs` for the device-free retention regression: a successful HTTP acknowledgment must leave byte-exact raw evidence after receiver closure, without creating a receipt; failed persistence must not be acknowledged. This uses authored protocol inputs, not native measurements.

Only optional-example dev dependencies add Vitest5.0.5/Vite8.3.4. Use Bun1.4.3 with lifecycle scripts disabled, Node24.21.0 and the independently acquired accepted package archive; do not repack core or import its source:

```sh
# After the parent releases the settled aggregate; these commands are not a build grant.
node setup.mjs "$ACCEPTED_TGZ" "$ACCEPTED_SHA256" "$PRIVATE_SETUP_RECEIPT"
node qualify.mjs "$ACCEPTED_TGZ" "$ACCEPTED_SHA256" \
  "$CHANGED_SOURCE_APK" "$APK_SHA256" "$INSTALLED_SDK" "$PRIVATE_MAESTRO_211_BIN"
```

Setup installs the accepted archive **unsaved**. Qualification creates its own private AVD using the already-installed API35 Google APIs x86_64 revision9 image and pixel_7 device definition. Emulator37.1.11, Platform-Tools37.0.1 and private official Maestro2.11.0 are required; no user driver upgrade or SDK/image acquisition is performed. The official CLI release is [cli-2.11.0](https://github.com/mobile-dev-inc/Maestro/releases/tag/cli-2.11.0); bind acquired bytes to its published digest, not merely its filename.

`qualify.mjs` is the retained host-restricted qualification harness: it requires the reviewed host named `legion`, not arbitrary machines. It is not a portable emulator launcher. Reuse the app/collector/ordinary-test handoff with your own explicitly reviewed resource policy; do not bypass its guards merely to make the demonstration run.

One boot attempt has a300-second deadline, two cores and an explicit2048MB request (the emulator may impose a higher minimum). CPU acceleration is required; SwiftShader graphics is explicit and distinct from software CPU emulation. There is **no `-grpc <port>` opt-in**; `-grpc-use-jwt` is defense in depth, not permission to accept a wildcard listener. The installed tool's `-help-grpc` and `-help-grpc-use-jwt` describe these switches. Startup inspects actual log security and owned listening endpoints and stops on insecure/non-loopback control exposure. Absence/authentication and teardown must be observed, not inferred from argv. The earlier unauthenticated wildcard-gRPC smoke remains a disclosed historical failure of control exposure, not a reusable recipe.

All device mutations use the explicit owned serial. Fresh app force-stop/launch occurs per attempt, and target identity is checked before operations and during each bounded120-second Maestro invocation; loss terminates the owned driver instead of selecting another device. `interaction.yaml` uses explicit `permissions: {}` and no app-data reset. The host explicitly **denies** the fresh owned fixture's UID overlay app-op and requires UID-denial readback; it does not grant permissions. Maestro may install/instrument its driver and collect/clear logs only on the fresh owned AVD. UI/screenshot evidence corroborates state and subject membership, never replaces RN layout callbacks.

The finite campaign runs five acquisitions, a selected ordinary width invocation that must fail full-accounting acceptance, then the full fifteen-case invocation. Outputs include exact commands, declared source hashes, current APK/archive/tool identities, raw files, canonical reports, driver evidence, runner JSON, endpoint observations and owned teardown. `lifecycle.jsonl` records command completion, target-check origin, emulator exit and host kill intent. Passive snapshots around driver execution and before cleanup record only the shared5037 listener and owned emulator endpoints/PID-start identities; these observations do not prove uninterrupted transport health or identify an initiator by themselves. Every command/capture/runner has its own bound; no automatic boot/build retry or deadline extension. On failure, preserve the evidence and repair only the affected scope after source settles.

Only the owned app/emulator/listeners are stopped; shared ADB is never killed, and existing user AVDs/devices are not reset or touched. Owned home/cache/temp/runtime settings reduce side effects, but standard emulator crash paths and ordinary shared-ADB state can escape them: **no total filesystem/host isolation claim**. No Metro, public receiver, manually configured device forwarding, physical-device pairing, SDK/license acceptance or new native module is involved; Maestro's necessary driver effects remain confined to the owned AVD. Observed emulator control listeners were loopback-only with no gRPC startup log, not an independently verified JWT handshake. Earlier failed campaigns used the owned-process fallback after transport loss; the accepted invocation shut down its owned emulator normally, followed by the separate terminal readback above. Bounded native qualification is accepted; registry release and consumer cutover still require their remaining distribution/onboarding checks.
