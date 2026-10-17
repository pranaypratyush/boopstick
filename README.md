# Boopstick

A poking stick for overconfident agents.

Boopstick checks explicit UI obligations against supplied observations. It is not artificial vision and does not certify an entire UI. The offline implementation, bounded ordinary-runner/synthetic examples and bounded real-browser trial are independently qualified and parent accepted; Android runtime qualification, registry release and consumer cutover are not claimed.

## Core and contract

The dependency-free ESM library exports `compare(request, capture)` and `canonicalReport(report)`, with public `Report`, `ReportStatus` and `Outcome` types. Importing the core does not load CLI, test-runner or collection code.

Read the [canonical exact-3.1 contract](skills/boopstick/references/contract.md) before authoring inputs: request schema 3, capture schema 2, report version 3. Exact `3.0` is refused. `web-dom-border-box` is admitted, but its name and declared provenance do not qualify a collector or attest loaded code. Synthetic, browser/native layout, accessibility, painted pixels and actionability remain different evidence.

For a consumer supplied with an approved local packed artifact:

```js
import { readFileSync } from "node:fs";
import { compare, canonicalReport } from "boopstick";

const request = JSON.parse(readFileSync("request.json", "utf8"));
const capture = JSON.parse(readFileSync("capture.json", "utf8"));
const report = compare(request, capture);
console.log(canonicalReport(report));
```

`pass`, `fail` and `not_measured` are distinct; malformed requests/captures have admission-error statuses. A passing sibling outcome does not discharge an unmeasured obligation. Keep expectations independently justified and evaluate the intact request before selecting a unique outcome by assertion ID.

## Offline CLI

The built command accepts only `boopstick <request.json> <capture.json>` or `boopstick --help`. In a local checkout after building:

```sh
node dist/cli.js request.json capture.json
node dist/cli.js --help
```

Comparator results are canonical JSON plus one newline on stdout. Exit 0 means all obligations pass; exit 1 means measured failure or `not_measured`; exit 2 means invalid request/capture or an operational error. Read/parse/internal errors use stderr without a fabricated report; help exits 0. There is no stdin, watch, daemon, retry, browser or native collection mode.

## Local development and qualification

Use Bun 1.4.3 or newer and supported Node LTS 24 or newer. Development dependencies are pinned; the distributed runtime has none. Run only after implementation edits settle:

```sh
bun install --frozen-lockfile --ignore-scripts
bun run typecheck
bun run build
bun run check
```

Run these with the supported Node LTS binary first on `PATH`; the package qualification rejects non-LTS Node. `check` runs all 68 retained behavior cases, then packs a real local artifact and exercises fresh Node/Bun consumers, public declarations, CLI outcomes and skill-file closure. It prints the retained tarball/evidence location. Failed package attempts are retained, not replaced with success assertions. This offline check does not establish fresh independent skill consumption or any platform integration. See the plan for executed results and remaining gates.

No registry installation command is advertised: the package is `private: true` and no registry release is authorized. Source/API comparison checks and independent review remain part of delivery, not implied by creating files.

## Ordinary-runner examples

The optional [Vitest and RNTL/Jest consumers](examples/README.md) install a caller-supplied packed artifact into separate pinned dev closures. Local qualification passed on Node **24.21.0 LTS** and Bun **1.4.3**: full and individual named cases, real skipped/expected-failing cases, measured mismatch, missing observation and request/capture admission failures. Exact-ID reconciliation refuses partial or wrongly bound evidence even when the runner is green; the original campaign rejected 23 labelled report counterfactuals per consumer.

RNTL exercises an actual awaited interaction with existing matchers and explicitly supplied synthetic layout events, not native geometry. Its native Node ESM recipe uses queries returned by `await render(...)`, avoiding a stale named CJS `screen` export. The initial integration failure and affected-only repair rerun are retained. General independent Phase C verification passed; supplemental probes then found unknown aggregate statuses and missing/nonboolean Jest `failing` flags were accepted. The bounded repair rejected 24 Vitest/26 Jest counterfactuals and replayed all 18 retained real inputs offline without changing their dispositions or losing diagnostics. Targeted independent correction verification passed with both findings closed and no new findings; parent accepted bounded Phase C. This complements the prior real-run proof, not a fresh runner campaign; these Phase C results do not qualify browser/Android collection.

## Bounded real-browser trial

The optional [Playwright browser example](examples/browser/README.md) uses an original local specimen, Playwright Test **1.64.1** and Chromium headless shell **156.0.8078.4**, on Node **24.21.0 LTS** / Bun **1.4.3**. Parent accepted independent qualification of two viewports, actual interaction, fractional DOM border boxes, defect/repair, missing/absence/zero/duplicate observations, overlay/actionability separation and owned teardown. This is a CachyOS-specific trial, not official distro certification or an arbitrary-page collector.

Independent review found raw-file digest mismatches; the correction's affected full run passed **12 tests**, **26/26** raw-byte references, **26/26** attached copies and **32/32** reference occurrences including labelled counterfactuals. Whitespace tamper, missing files and self-consistent observation substitution refused. Independent verification closed the finding with no new findings; historical failures and earlier selected/setup receipts remain unchanged, not retroactively byte-correct. The accepted packed artifact is unchanged and does not include the new repository examples/docs. No native, registry-release or cutover claim follows.

## Skill, provenance and remaining scope

The [agent-neutral skill](skills/boopstick/SKILL.md) carries its own contract and evidence references; copy its entire directory, not only the entrypoint. Skill use grants no device/data access, installation or release authority.

- [Accepted behavior and support boundaries](specs/boopstick.md)
- [Implementation plan and qualification gates](plans/extract-boopstick.md)
- [Cleared content identities and derivations](docs/provenance.md)
- [Apache-2.0 license](LICENSE)

The owner approved redistribution of selected owned comparator code, independent fixtures and generic prose under Apache-2.0; parent accepted the audited selection and exclusions. Uncleared third-party material, private application assets/history and machine receipts are not distribution inputs. New contrary rights findings hold or exclude affected material.

Bounded Vitest/RNTL ordinary-test accounting is not live UI acceptance. The separately accepted browser trial qualifies only its stated specimen/host obligations; Android runtime qualification remains outstanding. New collection scopes, source/target merges, registry release and active-consumer cutover retain separate approval gates. PR2/3 amendments are not adopted by this extraction.
