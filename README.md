# Boopstick

A poking stick for overconfident agents.

Boopstick checks explicit UI obligations against supplied observations. It is not artificial vision and does not certify an entire UI. The local offline implementation is present; registry release, supported runner/collector integrations and consumer cutover are not claimed.

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

## Skill, provenance and remaining scope

The [agent-neutral skill](skills/boopstick/SKILL.md) carries its own contract and evidence references; copy its entire directory, not only the entrypoint. Skill use grants no device/data access, installation or release authority.

- [Accepted behavior and support boundaries](specs/boopstick.md)
- [Implementation plan and qualification gates](plans/extract-boopstick.md)
- [Cleared content identities and derivations](docs/provenance.md)
- [Apache-2.0 license](LICENSE)

The owner approved redistribution of selected owned comparator code, independent fixtures and generic prose under Apache-2.0; parent accepted the audited selection and exclusions. Uncleared third-party material, private application assets/history and machine receipts are not distribution inputs. New contrary rights findings hold or exclude affected material.

RNTL/Jest, Vitest complete-CI accounting, neutral real-browser and Android qualification remain full target scope, not present support claims. Collection scopes, source/target merges, registry release and active-consumer cutover retain separate approval gates. PR2/3 amendments are not adopted by this extraction.
