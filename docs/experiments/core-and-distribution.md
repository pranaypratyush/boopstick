# Core and distribution experiments

[Experiment index](README.md). These are sanitized historical summaries, not new executions. See the index for evidence labels and current release status.

## CORE-01 — Preserve behavior without inheriting an obsolete evaluator

- **Why/question:** Can a clean extraction preserve the accepted comparator while keeping expectations independent of the implementation under test?
- **Setup/version:** Exact contract 3.1; request schema 3, capture schema 2, report version 3. Five core modules; changes limited to relative ESM import suffixes and stale header wording. Retain 19 authored cases plus 49 independently derived literal oracle cases.
- **Observations:** All 68 retained cases passed destination qualification and independent core/package verification. Oracle projections check status/counts and per-assertion status, reason, measurement and deviation, including nulls/refusals; canonical serialization is checked too. Source parity and frozen JSON byte identity were separately reviewed.
- **Failures/corrections:** The old checker depended on an obsolete evaluator; adaptation removed that dependency rather than shipping two engines. Frozen historical headers remain in the JSON: explicit in-memory derivation maps historical 3.0 to current 3.1 and historical future-minor 3.1 to refused 3.0, preserving incompatible-version negatives. Current authored discriminators separately refuse exact 3.0 requests/captures, unknown providers and incompatible geometry/environment facts. DOM admission cases use static authored JSON, not browser execution.
- **Lesson/decision:** Preserve independently worked predictions, not implementation-generated golden reports. The recorded oracle construction used frozen formulas/input facts without successor code or comparator output; hashes establish retained content, not independence. Never reinterpret historical header derivation as runtime backward compatibility.
- **Limits:** Finite behavior coverage is not universal correctness, live capture truth or collector qualification. Upstream source evidence is not destination execution evidence.
- **Evidence:** [Public provenance and construction account](../provenance.md#independent-expectations-and-historical-labels), [retained checker](../../tests/check.ts), [frozen oracle data](../../tests/oracles/cases.json), [Phase B qualification record](../../plans/extract-boopstick.md#validation). Wire semantics live only in the [canonical contract](../../skills/boopstick/references/contract.md). Raw execution/review receipts are privately retained, not public artifacts linked here.

## DIST-01 — Qualify the archive, not just the source tree

- **Why/question:** Can a fresh consumer use the actual package without repository imports, a TypeScript loader or hidden runtime dependencies?
- **Setup/version:** Phase B used Node LTS 24.22.0, Bun 1.4.3 and TypeScript 7.0.2. The actual archive contained 21 files: compiled ESM/declarations, CLI, complete three-file skill, provenance, license, README and manifest. Optional examples were outside that payload.
- **Observations:** Fresh Node/Bun consumers exercised JS imports, external declaration checking, pass/fail/not-measured/invalid-request/invalid-capture reports, canonical stdout with one newline, usage/read/parse errors, help and installed bin. Dependency fields were empty. Skill-directory-only frontmatter/reference closure passed. Independent verification also exercised the public API/types and CLI; the reviewed source-candidate file count was not the archive file count.
- **Failures/corrections:** The initial neutral package fixture omitted rectangular `spaceId` and actually produced `invalid_capture`. The fixture was corrected, not the evaluator or expected result; only the affected package gate resumed. Earlier successful runtime checks stayed historical.
- **Lesson/decision:** Install and inspect the shipped bytes in fresh consumers. Treat refusal as useful authoring feedback, not a reason to weaken validation. File closure proves portability of references, not independent skill usability.
- **Limits:** Offline package qualification does not qualify browser/native producers, release authority or arbitrary consumer environments. These historical archive counts do not assert that later repository docs/examples were packaged. The CLI is offline, not a collector.
- **Evidence:** [Package checker](../../tests/package-check.mjs), [CLI implementation](../../src/cli.ts), [recorded Phase B results and fixture failure](../../plans/extract-boopstick.md#notes). Use the current [API/CLI contract](../../README.md#api-and-cli) and [development commands](../../README.md#develop-and-verify), rather than a copied recipe. Raw archive/consumer receipts remain privately retained.

## DIST-02 — Correct the package-manager procedure without rewriting history

- **Why/question:** Does a successful technical result also satisfy the prescribed Bun-only procedure, and what changed when that violation was repaired?
- **Setup/version:** The original checker used npm pack/install despite the Bun-only instruction. The correction used documented `bun pm pack` and local `bun add`, lifecycle scripts disabled, on Node LTS 24.22.0/Bun 1.4.3.
- **Observations:** The affected gate and targeted independent verification passed; independent Bun repacking matched the corrected archive. Compared with the earlier archive, 20/21 payload files were byte-identical. Only `package.json` whitespace differed; parsed values and key order matched.
- **Failures/corrections:** The npm procedure and its actual results remain a noncompliant historical event. Bun correction did not rerun unchanged 68-case/build/fresh-skill campaigns, and did not make the earlier archive byte-identical or retroactively compliant.
- **Lesson/decision:** Separate behavioral equivalence, payload identity, archive identity and procedural compliance. Correct the affected proof, preserving the original failure.
- **Limits:** Payload comparison is not a claim that npm and Bun always produce equivalent archives, nor a registry publication check.
- **Evidence:** [Tooling correction and archive identity record](../../plans/extract-boopstick.md#notes), [corrected packaging implementation](../../tests/package-check.mjs). The public record retains the corrected historical digest; raw comparison and review receipts remain private.

## DIST-03 — Fresh standalone consumption is different from writer verification

- **Why/question:** Can an independent consumer use only the standalone skill/package to author and interpret bounded cases, rather than relying on the writer's environment or tacit knowledge?
- **Setup/version:** Seven independently frozen offline cases on Node LTS 24.21.0 and Bun 1.4.3, distinct from the package gate's Node 24.22.0. Expectations/oracle files were not rewritten to match observed outputs.
- **Observations:** All 14 API and 14 CLI outcomes matched independent expectations. Parent acceptance followed independent consumption, not merely writer-authored guidance or relative-link closure.
- **Failures/corrections:** No separate fresh-consumer failure is reported in the public qualification summary. Package fixture/procedural failures above remain separate events; this study did not erase or rerun them.
- **Lesson/decision:** Keep writer checks, file-closure checks and independent consumption as different evidence. A self-contained document can still need an actual unseen reader trial.
- **Limits:** Seven offline cases are bounded authoring/interpretation evidence, not general UI acceptance, live collection or a completeness score. Individual case inputs and raw session receipts are not publicly available here; their identities or contents are not reconstructed from the count.
- **Evidence:** [Recorded seven-case result](../../plans/extract-boopstick.md#validation), [specification qualification history](../../specs/boopstick.md#qualification-history), [bundled skill](../../skills/boopstick/SKILL.md). Independent raw consumption receipts are privately retained. The separate [upstream method study](guidance.md) is not evidence for this package-skill qualification.

## DIST-04 — Fresh public-registry onboarding after publication

- **Why/question:** Does the published package work for a fresh public consumer? A working local archive does not prove registry availability, published-byte identity or onboarding without the private/source checkout.
- **Setup/version:** Independently executed public-registry onboarding of Boopstick 0.1.0 on Node LTS 24.21.0 and Bun 1.4.3, after the tagged plan snapshot. The published archive SHA-256 is `ae637cf7a63d1d9f4cf72edfd43f3b0a4ad6260ef36e46b53ba969a90e491ae9`, distinct from the historical Phase B archive.
- **Observations:** The release records 25 command outcomes covering API, README example, CLI/bin/error behavior and declarations. All 21 installed files matched the public archive. Published bytes were identical to the independently reviewed release archive; publication used no repack, retag or additional native campaign.
- **Failures/corrections:** The tagged qualification record still showed then-pending onboarding/cutover gates. Postrelease onboarding and metadata reconciliation superseded those status statements without rewriting historical results. No separate onboarding failure is reported in the public release summary.
- **Lesson/decision:** Qualify public installation separately from local-archive consumption, and bind the result to the exact published bytes. Report postrelease evidence as a later event, not a claim that the release-source snapshot already contained it.
- **Limits:** These 25 outcomes are bounded offline onboarding evidence, not new browser/native qualification or hosted-CI success. The approved inventoried caller/source/skill cutover completed within its qualified scope; downstream review branches deliberately remained unmerged and no production rollout is claimed.
- **Evidence:** [Public v0.1.0 release: onboarding, boundaries and exact artifact identity](https://github.com/pranaypratyush/boopstick/releases/tag/v0.1.0), [published archive](https://registry.npmjs.org/boopstick/-/boopstick-0.1.0.tgz). The release summary and archive are public; raw command/review receipts remain privately retained. This knowledge-base update read the static release summary, not a new registry installation or campaign.
