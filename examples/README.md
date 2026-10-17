# Optional runner, browser and Android examples

The runner and browser examples consume a caller-supplied packed `boopstick` artifact. They do not import repository `src`, install dependencies into core, or imply a registry release. Bounded local ordinary-runner/synthetic qualification, general independent Phase C verification and targeted independent fail-closed correction verification passed; parent accepted bounded Phase C. The actual runner runtime was **Node 24.21.0 LTS Krypton / Bun 1.4.3**, distinct from Phase B package qualification on Node 24.22.0.

The separately qualified [browser trial](browser/README.md) uses Playwright Test 1.64.1 / Chromium headless shell 156.0.8078.4 on Node 24.21.0 LTS / Bun 1.4.3. Independent raw-byte correction verification passed twelve tests across two viewports, all 26 original references and attached copies, and all 32 reference occurrences including labelled counterfactuals; parent accepted the bounded result. Original specimen interaction, fractional rectangles, defect/repair, missing/absence/zero/duplicate observations, overlay counterexample and owned cleanup are distinct obligations. Historical setup/filter failures and raw mismatches are retained; selected/setup receipts are not retroactively byte-correct. This host-specific CachyOS trial is not native qualification, official distro support or a registry release; the existing packed artifact does not contain these repository examples.

## Android build-only specimen

The separate [Android specimen](android/README.md) is an original neutral RN app, not a comparator consumer or native collector. Parent accepted its bounded diagnostic build and independent Spec/APK file-only plus Standards/rights reviews; no independent rebuild, deployment, native interaction, measured geometry or device cleanup is claimed. Its README retains the first timeout/isolation failure, successful separately approved resumption, exact APK binding, MIT/Apache provenance and unresolved merged-permission/device gates. APKs, keys, caches and private receipts are excluded; the accepted package archive is unchanged.

## Ordinary Vitest/RNTL consumers

- `vitest/`: Vitest **5.0.5**, Vite **8.3.4**, plain ESM tests and built-in JSON reporter. Comparator evidence lives in `task.meta.boopstick`, including the actual effective `task.fails` flag.
- `rntl/`: Jest **30.5.2**, React **19.3.1**, React Native **0.88.0**, RNTL **14.1.0**, Test Renderer **1.3.1**. Native Node ESM tests (`--experimental-vm-modules`), standard RN Babel/Jest presets **0.88.0**, Babel-Jest **30.5.2**, Babel core **7.29.7**, dev-only Jest environment override **30.5.2**. Built-in Jest JSON retains `failing`/`wouldRun`; a file-local append-only `evidence.jsonl` supplies comparator evidence/bindings missing from Jest's report.
- `shared/scenario.mjs`: one independently authored synthetic size policy, canonical request and capture construction. Both test registration and expected accounting IDs come from its intact request, never the observed element tree or another scenario registry.
- `shared/reconcile.mjs`: exact multiplicity, runner/outcome and identity reconciliation. It does not run tests or implement a comparator.

The separate manifests/locks keep runners and renderers optional. Use supported **Node 24 LTS >=24.3** and Bun **1.4.3** for package management. The system's default Node may be a non-LTS channel: select the actual LTS executable explicitly. RNTL v14 uses `test-renderer`, not deprecated `react-test-renderer`; rendering, events and cleanup are async.

## Executed qualification and retained correction

Both consumers passed the nine real execution controls below; width and height also each passed alone under normal name filtering. Full accounting accepted only each complete correct invocation, not either selected-case output. The original campaign rejected 23 separately labelled report counterfactuals per consumer. Installed public JS/declaration bytes matched the supplied archive, core dependency fields remained empty, and the RN preset resolved the approved Jest environment 30.5.2 override.

The initial RNTL run failed four queries after awaited rendering: native ESM's named `screen` import retained the initial CJS export while RNTL replaced that export with its render result. The owner changed only the policy/interaction consumers to use bound queries returned by `await render(...)`; the RNTL-only gate then passed. No engine copy, CJS comparator shim, custom environment or extra cleanup was introduced. Successful Vitest and unchanged core campaigns were not rerun. An earlier already-processing orchestration error was recorded separately, not counted as a runner failure.

All original failed reports/logs, corrected run outputs, negative controls, independent invocation bindings and counterfactual labels are retained outside the public tree for review. Expected-failing cases had actual runner passes but retained comparator failures; capture admission failures retained empty outcome arrays and capture-wide diagnostics. Standalone acceptance CLI accepted both full reports and rejected a real admission-failure report. These bounded checks do not establish live layout/design acceptance, release or cutover.

Supplemental independent probes found two fail-closed defects: an unknown aggregate comparison status, and a deleted/nonboolean Jest `failing` flag, were accepted. Reconciliation now admits only aggregate `pass`/`fail`/`not_measured` after refusing admission errors, and requires Jest obligation rows to carry `failing === false`; a passing selected sibling still does not require aggregate pass. Existing accounting checks gained the four exact discriminator cases. One targeted offline replay on Node 24.21.0 rejected **24 Vitest / 26 Jest** labelled counterfactuals and preserved all **18** retained real-run dispositions and their original diagnostics, including capture-wide admission errors. These are report replays, not new runner executions. The old successful campaigns and four failing probe results remain preserved. Targeted independent correction verification closed both findings with no new findings, preserved all 18 dispositions/diagnostics and confirmed 232 historical evidence files unchanged; parent accepted bounded Phase C. No runner/setup/core/build campaign was repeated. The accepted Phase B archive is unchanged and does not contain these Phase C examples/docs.

For this native ESM/Jest recipe, keep `const view = await render(...)` and use `view` queries rather than named CJS `screen`. RNTL's normal cleanup and existing matchers remain in use.

## Setup (explicit local artifact)

From this repository's root, supply a real artifact and its independently obtained digest:

```sh
node examples/vitest/setup.mjs /path/to/boopstick.tgz <expected-sha256>
node examples/rntl/setup.mjs /path/to/boopstick.tgz <expected-sha256>
```

Each setup verifies SHA-256, performs `bun install --ignore-scripts --frozen-lockfile`, then installs that local archive with `bun add --ignore-scripts --no-save`. No lifecycle scripts, registry `boopstick` assumption, committed archive, absolute machine dependency, or TypeScript loader. Re-run setup after a dependency reinstall that removes the unsaved artifact.

## Finite qualification command

After implementation edits settle, run the finite gate:

```sh
node examples/shared/qualify.mjs /path/to/boopstick.tgz <expected-sha256>
# Optional independent consumer qualification:
node examples/shared/qualify.mjs /path/to/boopstick.tgz <expected-sha256> vitest
node examples/shared/qualify.mjs /path/to/boopstick.tgz <expected-sha256> rntl
```

This command invokes the ordinary runner CLIs, not a custom runner/reporter. It requires Node LTS, checks actual installed pinned metadata/core dependency exclusion, and retains a fresh temporary evidence tree. Every invocation records independent expected bindings before execution, process status, stdout/stderr, built-in `runner.json`, semantic evidence and reconciliation. Failure is retained rather than overwritten; inspect the printed directory. It does not install, rebuild, run the unchanged core/oracle campaign, retry, or publish.

Real execution controls: full run, one filtered width case, passing width with a failed height sibling in the intact report, skipped height, expected-failing height, measured height mismatch, missing observation, invalid request and invalid capture. RNTL also exercises an awaited component interaction with existing matchers and a separate synthetic-as-live refusal contract test. Filtered green runs remain useful local feedback but cannot approve the full matrix.

The full-run evidence is also the source for **explicitly labelled counterfactual reports**, never overwritten original runner reports: omitted/duplicate/conflicting results, equal-count duplicate-plus-omission, missing comparator outcome/attachment, stale/wrong run/artifact/request/environment/project/file, discovery-only status, and hidden comparator/expected-failure outcomes. These are reconciliation checks, not claims that a runner really executed those counterfactuals. `counterfactual-summary.json` identifies them.

To reconcile retained evidence separately:

```sh
node examples/shared/accept.mjs vitest /path/to/runner.json /path/to/independent-invocation.json <actual-exit-code>
node examples/shared/accept.mjs jest /path/to/runner.json /path/to/independent-invocation.json <actual-exit-code>
```

For Jest, `evidence.jsonl` must sit beside `runner.json`. The independent invocation file has the `{expected}` object produced by the qualification command. Missing/truncated report or attachment fails closed. Do not construct expected identities from the evidence being checked or discard the actual nonzero runner status.

## Local selection and evidence semantics

Each leaf title is `JSON.stringify([scenarioId, assertionId, variant])`; variants are intentionally distinct `vitest` and `rntl` contexts. Use the normal runner `-t` filter, escaping the JSON tuple as a regex. The finite qualification command demonstrates this using the canonical width declaration. Registration happens before comparison; the entire request remains available under selection. Each case selects exactly one assertion outcome after whole-input admission, then asserts that outcome, not aggregate report status. A failed height cannot fail a passing width just because they share a report.

The invocation environment is `BOOPSTICK_RUN_ID`, `BOOPSTICK_ARTIFACT_SHA256`, `BOOPSTICK_OUTPUT_DIR` and optional `BOOPSTICK_CONTROL` (`full` by default). Always use a fresh output directory. Bindings include independent run/artifact/request/environment/variant/project identities; the standard report supplies the exact test-file identity. These dedicated single-project configurations establish declared project context; built-in JSON does not attest which project configuration actually executed. Metadata also does not attest loaded code or measurement authenticity.

Full acceptance requires one executed ordinary runner pass and one comparator pass for every declaration-derived ID, matching bindings and an admitted capture. Skips, missing/ambiguous outcomes, duplicates, expected-failure inversion, discovery-only records, unmeasured results, admission errors, runtime/setup failure and stale/wrong identities cannot satisfy an obligation. Contract-negative tests and ordinary behavior tests are separate from this UI-obligation namespace. Capture-wide admission errors remain intact with no fabricated per-ID measured verdicts. There are no retries/repeats by default.

## Synthetic evidence only

The authored 120-by-48 policy is an example, not a product approval. RNTL's supplied `fireEvent.layout` rectangle only exercises response to supplied data; it does not measure native layout. Existing matchers check behavior/text/state. These ordinary-runner consumers claim no actual wrapping, clipping, painted visibility, native touch region, emulator or browser evidence; the separate browser trial has its own bounded qualification. Synthetic origin offered to a regression claim is refused as `not_measured/synthetic-not-live-evidence`; that successful negative contract test is not successful UI acceptance.

Primary maintained API references: [Vitest metadata](https://vitest.dev/api/advanced/metadata), [Vitest JSON reporter implementation 5.0.5](https://github.com/vitest-dev/vitest/blob/v5.0.5/packages/vitest/src/node/reporters/json.ts), [Jest parameterized/expected-failing tests](https://jestjs.io/docs/api), [Jest JSON formatting 30.5.2](https://github.com/jestjs/jest/blob/v30.5.2/packages/jest-test-result/src/formatTestResults.ts), [RNTL environment](https://oss.callstack.com/react-native-testing-library/docs/advanced/testing-env), [RNTL layout events](https://oss.callstack.com/react-native-testing-library/docs/api/events/fire-event#layout), [RNTL existing matchers](https://oss.callstack.com/react-native-testing-library/docs/api/jest-matchers).
