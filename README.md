# Boopstick

A poking stick for overconfident agents.

Boopstick checks explicit UI obligations against supplied observations: sizes, gaps, alignment, containment, overlap, presence and semantic text. It catches predictable mistakes without pretending to give an agent vision. Keep your existing test runner and interaction tools; each obligation can be an ordinary, independently selectable test.

**Qualified paths:** the offline package, RNTL/Jest and Vitest recipes, a bounded Playwright browser specimen, and a real Android-emulator specimen have independent verification. These are tested combinations, not a promise that any app, driver or platform works unchanged.

## Install

Use supported Node LTS >=24 or Bun >=1.4.3. The distributed ESM library has no runtime dependencies or TypeScript-loader requirement. Install the pinned package with your package manager; these commands use Bun:

```sh
bun add --dev --exact --ignore-scripts boopstick@0.1.0
```

The package contains the library, declarations, CLI and standalone agent skill. Browser/emulator drivers and optional examples are not core dependencies.

Save this as `demo.mjs` in the consumer, then run `node demo.mjs`:

```js
import { createHash } from "node:crypto";
import { compare } from "boopstick";

// Hand-authored synthetic observations, not browser or native measurements.
const fixture = {
  id: "button-label",
  sha256: createHash("sha256").update("Continue").digest("hex"),
};
const scenario = { id: "button", checkpoint: "ready" };
const environment = { platform: "offline", density: 1, fontScale: 1, direction: "ltr" };
const geometry = { kind: "layout", provider: "synthetic", frame: "window", unit: "dp", spaceId: "demo" };
const request = {
  schemaVersion: 3, contractVersion: "3.1", requestId: "button-height",
  claim: { kind: "qualification", expectationSource: { ref: "independently-authored-48dp-policy" } },
  scenario,
  requiredIdentity: { candidate: "demo", fixture, environment },
  subjects: [{ ...geometry, id: "button", key: "button", match: "one" }],
  assertions: [{ id: "height", rule: "metric", target: "button", metric: "height", comparison: "eq", value: 48, tolerance: 0 }],
};
const capture = {
  schemaVersion: 2, contractVersion: "3.1", captureId: "authored-demo",
  origin: "synthetic", provider: "synthetic",
  collector: {
    id: "hand-authored-demo",
    sha256: createHash("sha256").update("Boopstick synthetic quickstart v1").digest("hex"),
  },
  scenario, candidate: { buildId: "demo" }, fixture, environment,
  epoch: { id: "demo", startedAt: 0, endedAt: 1, steady: true },
  coverage: [], rawEvidence: [],
  elements: [{ ...geometry, key: "button", rect: { x: 0, y: 0, width: 120, height: 47 } }],
};

console.log(compare(request, capture).outcomes[0]); // fail: expected 48, measured 47
capture.elements[0].rect.height = 48;
console.log(compare(request, capture).outcomes[0]); // pass
capture.elements = [];
console.log(compare(request, capture).outcomes[0]); // not_measured: missing-fact
```

The expectation stays fixed while the observation changes. Missing evidence is not zero, absence, a skip, or a passing result. These synthetic inputs demonstrate the comparator only; they do not establish a real UI's geometry.

## API and CLI

The public functions are `compare(request, capture)` and `canonicalReport(report)`; TypeScript consumers can import `Report`, `ReportStatus` and `Outcome`. Importing the core does not load CLI, runner or collector code.

Read the bundled [contract](skills/boopstick/references/contract.md) for exact fields, defaults and rules: contract **3.1**, request schema **3**, capture schema **2**, report version **3**. Other versions, including exact `3.0`, are refused. Invalid input produces `invalid_request` or `invalid_capture`, distinct from `fail` and `not_measured`.

For request/capture JSON files, use the installed CLI:

```sh
./node_modules/.bin/boopstick request.json capture.json
./node_modules/.bin/boopstick --help
```

Comparator reports are canonical JSON plus one newline on stdout. Exit **0** means all obligations pass; **1** means measured failure or `not_measured`; **2** means invalid input or an operational error. Read/parse/internal failures use stderr without a fabricated report. There is no stdin, watch, daemon, retry or collection mode.

## Use the runner you already have

| Context | Qualified role | Evidence boundary |
|---|---|---|
| RNTL + Jest | Real component interaction, existing matchers and supplied synthetic comparator fixtures | RNTL does not measure native layout, clipping or touch regions. |
| Vitest | Named comparator cases, local filtering and complete-result reconciliation | A filtered or skipped green run cannot approve the full declared matrix. |
| Playwright Test | Actual interaction and DOM border boxes at two viewport sizes in the bounded specimen | Browser geometry does not prove actionability or native behavior. |
| Android emulator | Actual RN `measureInWindow` captures after Maestro interaction; five modes and 15 ordinary cases | Qualified only for the recorded static specimen/environment, not physical devices, iOS or general transport reliability. |

The [optional examples](https://github.com/pranaypratyush/boopstick/tree/v0.1.0/examples) use existing runner hooks, reports and filtering. They are repository examples, not files in the package archive. RNTL/Jest and Vitest were exercised on Node 24.21.0/Bun 1.4.3; the browser trial used Playwright Test 1.64.1/Chromium 156.0.8078.4 on CachyOS. The Android path used RN 0.88.0, Maestro 2.11.0 and an API35 x86_64 emulator at density2.625/fontScale1/LTR. Its earlier transport loss remains unexplained; the later successful run does not erase that operational limitation.

Register cases from your declarations before collection, evaluate the intact request, then select exactly one outcome by assertion ID. A failing sibling must not fail a passing case solely through aggregate status. Full acceptance must account for every required case; invalid, missing, skipped or expected-failing obligations cannot satisfy it. The examples demonstrate the accounting without adding a new runner, matcher framework or test inventory.

Boopstick does not collect screenshots, control devices, infer expectations or certify a whole interface. Keep visual, accessibility and actionability checks where those claims require them. Provider names and matching metadata are not loaded-code attestation.

## Agent skill

Copy the entire bundled `skills/boopstick` directory into your agent's supported skill location, including its two references. The [skill](skills/boopstick/SKILL.md) teaches expectation authoring, evidence selection, refusal interpretation and ordinary-test accounting. It is agent-neutral and does not require an orchestration framework or private tooling. Installing it grants no device/data access or release authority.

## Develop and verify

Clone the public repository and install its pinned development dependencies with `bun install --frozen-lockfile --ignore-scripts`. With supported Node LTS first on `PATH`, after edits settle:

```sh
bun run typecheck
bun run build
bun run check
```

`check` runs 68 retained behavior cases and qualifies an actual packed artifact in fresh Node/Bun consumers: JS, declarations, CLI outcomes, license, package contents and skill-file closure. It prints retained evidence/tarball locations. This offline check is not an emulator/browser run or independent skill review.

The `Core and package` GitHub Actions job runs these commands on pull requests and `main`, with pinned Node/Bun and read-only repository permissions. It does not start browsers or emulators, publish packages, or replace consumer qualification.

The repository's [plan and qualification record](https://github.com/pranaypratyush/boopstick/blob/v0.1.0/plans/extract-boopstick.md) retains detailed executed results, failures and remaining migration gates. The [specification](https://github.com/pranaypratyush/boopstick/blob/v0.1.0/specs/boopstick.md) defines the RNTL/browser/Android target. Separate proposal PRs are not silently adopted.

## License

[Apache-2.0](LICENSE). [Provenance](docs/provenance.md) identifies the cleared source contributions and transformations. Private application assets/history and unrelated orchestration are excluded. Template-derived code in the optional Android example retains its separate MIT notice.
