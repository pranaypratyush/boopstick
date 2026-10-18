# Optional browser qualification example

Original plain HTML/CSS/JS specimen; no product assets, React/RN Web, custom fonts/images or external resources. Uses the packed Boopstick ESM package, Playwright Test 1.64.1 and matching Chromium headless shell revision 1248 (156.0.8078.4), on Node 24.21.0 LTS / Bun 1.4.3. This is an independently verified, parent-accepted bounded CachyOS-specific trial, not supported-distro certification or an arbitrary-page collector. Scoped source publication is authorized; no native, registry-release, merge or cutover claim follows.

Independent review found historical raw-file digest mismatches. The byte-integrity correction passed one local and one independent affected full invocation, twelve tests each; independent inspection verified 26/26 original raw-file references, 26/26 attached copies and 32/32 reference occurrences including labelled counterfactuals. Correct copied files passed; whitespace tamper, missing files and self-consistent substitution refused. Independent verification closed the finding with no new findings; parent accepted the bounded qualification. Twelve contexts closed, owned browser/server processes exited and loopback refused. Historical source/evidence files stayed unchanged, and earlier selected/setup proof is retained rather than freshly rerun or retroactively byte-correct. Twelve screenshots are visual corroboration, not certificates of numerical, paint or actionability equivalence.

## Authorized local setup and run

Use a supported Node LTS executable and Bun 1.4.3. Obtain the parent-approved package archive and its SHA-256 separately. From this directory:

```sh
node setup.mjs "$BOOPSTICK_ARCHIVE" "$BOOPSTICK_SHA256" "$NEW_OWNED_BROWSER_CACHE" "$PRIVATE_SETUP_RECEIPT"
node qualify.mjs "$BOOPSTICK_ARCHIVE" "$BOOPSTICK_SHA256" "$NEW_OWNED_BROWSER_CACHE"
```

`setup.mjs` verifies the archive before installing local optional dependencies with Bun `--ignore-scripts`, uses the frozen lock once present, and installs the archive `--no-save`. No machine/archive path belongs in the manifest/lock. It checks exact package/browser metadata before downloading the matching headless shell into a previously nonexistent owned cache. No lifecycle scripts or system dependency installation. Missing libraries/unsupported-host failures stop the trial; do not add OS packages, change the browser pin or silently switch environments.

`qualify.mjs` is a finite invocation of the standard Playwright Test CLI/JSON reporter, not a custom runner/reporter. It records declarations and source hashes **before execution**, then runs the full matrix and each width/height case independently in each project. It requires exact declared project/case identities, ordinary passing terminal results, no expected failures/retries, fresh bound comparator receipts and owned cleanup. Selected green feedback is explicitly refused as full-matrix acceptance. A failure stops further invocations; preserve that directory and repair/rerun only the affected path instead of repeating successful campaigns.
An optional final `selected` argument runs only the four selected metric invocations; `full` runs only the full matrix when a shared acquisition correction needs affected-only proof. Neither mode replaces retained historical evidence or claims the omitted campaign ran.


The command prints a new private temporary evidence directory. It contains invocation/source bindings, standard `runner.json`, stdout/stderr, context/server lifecycle and cleanup observations, plus per-test raw observations, requests/captures/reports, labelled counterfactuals and screenshots. No evidence or browser caches should be committed. The old packed archive does not include this new repository example.

For an individually authorized affected-only standard invocation, set fresh `BOOPSTICK_RUN_ID`, accepted `BOOPSTICK_ARTIFACT_SHA256`, a fresh private `BOOPSTICK_OUTPUT_DIR`, an unoccupied unprivileged `BOOPSTICK_BROWSER_PORT`, and the owned `PLAYWRIGHT_BROWSERS_PATH`; run `node node_modules/@playwright/test/cli.js test --config=playwright.config.mjs --project=narrow --grep='control: overlay-recovery'`. Preserve exit status, built-in JSON, raw evidence and cleanup before accepting it. Full accounting still requires all declared obligations; a selected repair run does not erase earlier evidence.

## Declared policy and controls

Two isolated viewport projects: **320×720** → width **200.5**, **1024×768** → width **360.25**; height **48**, tolerance **0.02**, LTR, normal font baseline 1, DPR configured 1 and independently observed. Targets are authored independently of observation in `scenario.mjs`; cases register from those declarations, not observed nodes. Each normal checkpoint follows an actual unforced button click and state assertion. Width/height cases run alone with their own fixture setup.

At each viewport, ordinary named control tests retain:

- Actual CSS height **47** defect and **48** repair, unchanged expected policy, both raw captures/reports and screenshots.
- Deliberately incomplete acquisition (`complete/qualified: false`) refusing absence and leaving scalar metrics unmeasured; genuinely removed DOM subject with fully enumerated scope proving separate qualified absence. A connected zero-size subject remains present. Duplicate identity refuses acquisition after saving raw diagnostics, before fabricating a comparator report.
- Covering overlay with passing geometry but a timed-out **real unforced click**, unchanged state, action log, raw overlay identity and screenshot. Removing the overlay restores actual interaction and geometry. The expected action failure is asserted inside a normally passing negative-control test, not an expected-failing UI obligation.
- Labelled offline wrong-run/checkpoint/candidate consumer counterfactuals; wrong capture checkpoint/candidate and overlong interval comparator refusals. These are not claimed as fresh browser executions. A deliberately wrong x-origin expectation proves the separate ordinary origin assertion.
- Copied-file integrity controls: an unchanged copy verifies; added whitespace refuses despite equivalent parsed JSON; a missing raw file refuses; a substituted observation with a self-consistent file hash still refuses if it differs from the receipt. Original positive raw files remain untouched.

## Observation semantics and limits

`acquire.mjs` reads scoped root/subject identities, state, finite fractional border boxes, viewport/DPR, readiness facts and pending mutation records in **one synchronous browser callback**, without awaiting or writing DOM inside acquisition. `getBoundingClientRect()` CSS pixels map 1:1 to existing **logical-px**, provider **web-dom-border-box**, kind **layout**, frame **window**, with a viewport-specific space. No DPR division, rounding, `css-px` enum, synthetic relabelling or comparator x/y metric. Authored root origin **x16/y24** is an independent ordinary assertion.

Steady is qualified only for this deliberately static source envelope: no animations, transforms, scrolling, image/font resources, frames/shadow roots or asynchronous rendering work; awaited document/font readiness, observed state, zero active animations/scroll and per-element transforms are checked. Mutation records are diagnostic, not proof of CSSOM/compositor stability. One callback is not an atomic screenshot/paint transaction. Screenshots are later ordered contextual evidence, not hit-testing/visibility certificates.

Run/checkpoint/candidate/fixture/viewport/declaration identities and raw file hashes are checked outside the comparator. Each raw observation is serialized once, written, and hashed as those exact bytes, including formatting/newline. `requireCurrent` resolves the reference in its owned test-output directory, reads the file, verifies its byte SHA-256 and checks the parsed observation equals the receipt. Read failures, missing files, hash mismatches and observation substitutions refuse acceptance. Full/selected qualification checks every emitted receipt's referenced file; attached positive receipts must match their disk-verified original. These are declared bindings, **not loaded-code attestation**. Collection duration is not wall-clock freshness. Current source digests and built-in runner results are required alongside captures; replay is not a fresh observation. Do not infer font success, clipping, painted ink, line count or accessibility/touch semantics from these rectangles.

Standard page/context fixtures own contexts; `webServer` owns a loopback-only specimen server and refuses an existing listener. No persistent profile, logged-in/user tab, external/private site, global settings or unrelated process cleanup. The finite qualification records context-close events, server shutdown, launched browser/server PID disappearance and refused loopback connection after each runner exit. Evidence is host-specific; documentation/creation alone is not completion.

Canonical comparator contract: [contract 3.1](../../skills/boopstick/references/contract.md). Playwright references: [fixtures](https://playwright.dev/docs/test-fixtures), [webServer](https://playwright.dev/docs/test-webserver), [actionability](https://playwright.dev/docs/actionability), [DOM acquisition](https://playwright.dev/docs/api/class-locator#locator-evaluate-all).
