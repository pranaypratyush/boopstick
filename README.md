# Boopstick

A poking stick for overconfident agents.

Boopstick checks explicit UI obligations against supplied observations: sizes, gaps, alignment, containment, overlap, presence and semantic text. It catches predictable mistakes without pretending to give an agent vision. Keep your existing test runner and interaction tools; each obligation can be an ordinary, independently selectable test.

**Status:** the offline package, RNTL/Jest and Vitest recipes, and bounded Playwright browser trial have independent qualification. Android runtime qualification is incomplete. No npm release or active-consumer cutover is claimed.

## Try it from source

Use Bun >=1.4.3 and supported Node LTS >=24. The development dependencies are pinned; the distributed ESM library has no runtime dependencies. Until the first release, use the public implementation branch:

```sh
git clone --branch prepare/boopstick-extraction-readiness https://github.com/pranaypratyush/boopstick.git
cd boopstick
bun install --frozen-lockfile --ignore-scripts
bun run build
bun pm pack --ignore-scripts --filename boopstick-0.0.0.tgz
```

In a separate consumer directory, install that local tarball with `bun add --ignore-scripts /absolute/path/to/boopstick-0.0.0.tgz`. No private checkout, TypeScript loader, browser or emulator is needed for the core. The package remains `private: true` until release qualification and authorization are complete; `bun add boopstick` is not yet an available registry-installation path.

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
| Android emulator | Original RN specimen and native qualification work in progress | Not yet a qualified integration; build success is not measurement acceptance. |

The [optional examples](https://github.com/pranaypratyush/boopstick/tree/prepare/boopstick-extraction-readiness/examples) use existing runner hooks, reports and filtering. They are repository examples, not core dependencies or files in the package archive. RNTL/Jest and Vitest were exercised on Node 24.21.0/Bun 1.4.3; the browser trial used Playwright Test 1.64.1/Chromium 156.0.8078.4 on CachyOS. These are bounded tested combinations, not blanket platform support.

Register cases from your declarations before collection, evaluate the intact request, then select exactly one outcome by assertion ID. A failing sibling must not fail a passing case solely through aggregate status. Full acceptance must account for every required case; invalid, missing, skipped or expected-failing obligations cannot satisfy it. The examples demonstrate the accounting without adding a new runner, matcher framework or test inventory.

Boopstick does not collect screenshots, control devices, infer expectations or certify a whole interface. Keep visual, accessibility and actionability checks where those claims require them. Provider names and matching metadata are not loaded-code attestation.

## Agent skill

Copy the entire bundled `skills/boopstick` directory into your agent's supported skill location, including its two references. The [skill](skills/boopstick/SKILL.md) teaches expectation authoring, evidence selection, refusal interpretation and ordinary-test accounting. It is agent-neutral and does not require an orchestration framework or private tooling. Installing it grants no device/data access or release authority.

## Develop and verify

With supported Node LTS first on `PATH`, after edits settle:

```sh
bun run typecheck
bun run build
bun run check
```

`check` runs 68 retained behavior cases and qualifies an actual packed artifact in fresh Node/Bun consumers: JS, declarations, CLI outcomes, license, package contents and skill-file closure. It prints retained evidence/tarball locations. This offline check is not an emulator/browser run or independent skill review.

The repository's [plan and qualification record](https://github.com/pranaypratyush/boopstick/blob/prepare/boopstick-extraction-readiness/plans/extract-boopstick.md) retains the detailed executed results, failures and outstanding gates. The [specification](https://github.com/pranaypratyush/boopstick/blob/prepare/boopstick-extraction-readiness/specs/boopstick.md) defines the full RNTL/browser/Android target. Separate proposal PRs are not silently adopted.

## License

[Apache-2.0](LICENSE). [Provenance](docs/provenance.md) identifies the cleared source contributions and transformations. Private application assets/history and unrelated orchestration are excluded. Template-derived code in the optional Android example retains its separate MIT notice.
