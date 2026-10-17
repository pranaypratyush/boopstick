# Neutral Android build specimen

Build preparation only: no installed/running app, measured geometry, interaction, export, collector, device cleanup or Android qualification is established. The original screen has a materialized `geometry-subject` View authored at **200.5 × 48 dp**, a separate `toggle-button` Pressable and `state-label` text. Authored dimensions are not measured evidence. There is no backend, image/font asset, comparator import or capture hook.

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

Only the x86_64 diagnostic ABI is selected; this does not qualify an emulator/device. The maintained RN Gradle bundling task includes `index.android.bundle` even for debug, and `useDevSupport = false` removes the runtime Metro requirement. The app source manifest requests no permissions, but dependency merging adds RN debug `SYSTEM_ALERT_WINDOW` and `ACCESS_LOCAL_NETWORK`, plus AndroidX's application-scoped dynamic-receiver permission; later device/permission approval must account for the actual merged APK, not just source. No `INTERNET` permission appeared in APK badging. A temporary explicitly located debug key signs the APK; no release credentials or global debug key are used. Outputs are under `$WORK/project/android/app/build/outputs/apk/debug/`; caches, signing material and APKs must never be committed. `--no-daemon` requests normal owned build-process shutdown; retain failures and verify owned cleanup without sweeping unrelated processes.

## Current evidence boundary

The one expressly authorized resumption completed native compilation, diagnostic signing and file-only APK inspection with unchanged source/configuration/lock. No device interaction, coordinate/unit/coherence semantics, export, collector or device teardown is qualified. Those require a separate finite approval and review of merged permissions; no device, emulator, automation-driver, Metro-server or native collection command belongs to this build preparation. No further compile or publication is authorized by this result.

Parent subsequently accepted this bounded diagnostic build preparation after independent Spec/APK file-only inspection and separate Standards/rights review found no material actionable findings. Neither review independently rebuilt or ran the app; source-copy parity and recorded artifact bindings are not loaded-code attestation. Scoped source/document publication was separately authorized, excluding APKs, keys, caches and private receipts. This does not authorize another compile, deployment, device access or native qualification.
