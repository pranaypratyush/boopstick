# Experiment knowledge base

Use this index for experimental questions, failed approaches, corrections and bounded decisions. Use the [package README](../../README.md), [canonical contract](../../skills/boopstick/references/contract.md) and linked example READMEs for current commands/fields; these notes do not define a second contract or test inventory.

## Start here

- **Current implementation:** [Boopstick 0.1.0 design](design.md) — architecture, ownership, evidence boundaries and accepted platform limits.
- **Why it exists and how it evolved:** [Original user intent and compact timeline](history.md).
- **Questions, failures and decisions:** [Experiment matrix](#questions-and-decisions) — 29 stable knowledge records.
- **Post-release native work:** [Consolidated observation and evidence plan](../../plans/qualify-native-observations.md) — adopted PR2/3 intent, separately held implementation and qualification.

## Current status versus historical checkpoints

**Public 0.1.0 is published and onboarded; PR1 and PR4 are merged and tag `v0.1.0` is published.** The approved inventoried caller/source/skill cutover completed within its qualified scope; remaining downstream review branches deliberately stayed unmerged. Publication does not imply downstream production rollout or broader platform support. The [blocked post-release native plan](../../plans/qualify-native-observations.md) records the adopted planning intent and remaining qualification limits.

The [plan](../../plans/extract-boopstick.md) and [specification](../../specs/boopstick.md) preserve pre-release checkpoints, including pending release/onboarding/cutover wording and older incomplete native milestones. Read those as history, not current release blockers. This status correction summarizes the separately retained postrelease metadata reconciliation and owner acceptance, not a new registry query or runtime campaign. Public release identity: [v0.1.0](https://github.com/pranaypratyush/boopstick/releases/tag/v0.1.0).

PR6 implements the approved first increment of the separate [native-evidence plan](../../plans/qualify-native-observations.md). Its expanded Android matrix is **not qualified: 1/6 accepted acquisitions**, with a second durable but unqualified export; later increments remain held. [AND-10](android.md#and-10--two-subject-relationships-and-an-incomplete-native-continuation) records the new evidence without changing historical0.1.0 acceptance.

## Questions and decisions

IDs identify knowledge entries, not executable cases or acceptance scores. Keep IDs stable when editing a note; links to Android/guidance route to their own detailed histories.

| ID | Question | Disposition | Reusable lesson / note |
|---|---|---|---|
| CORE-01 | Can extraction preserve behavior and independent expectations? | Qualified: 19 authored + 49 oracle cases; exact 3.0 refused | [Freeze predictions; derive historical headers explicitly, not compatibility](core-and-distribution.md#core-01--preserve-behavior-without-inheriting-an-obsolete-evaluator) |
| DIST-01 | Does the actual archive work in fresh consumers? | Qualified: historical 21-file ESM/types/CLI package | [Test shipped bytes; correct invalid fixtures without weakening admission](core-and-distribution.md#dist-01--qualify-the-archive-not-just-the-source-tree) |
| DIST-02 | Did technical success satisfy the required package procedure? | npm procedure violated instructions; Bun correction independently verified | [20/21 identical payload files is not identical archive bytes or retroactive compliance](core-and-distribution.md#dist-02--correct-the-package-manager-procedure-without-rewriting-history) |
| DIST-03 | Can a fresh independent reader use the standalone material? | Qualified: seven frozen offline cases, 14 API + 14 CLI outcomes | [Writer checks and link closure are not independent consumption](core-and-distribution.md#dist-03--fresh-standalone-consumption-is-different-from-writer-verification) |
| DIST-04 | Does fresh public-registry onboarding match the published artifact? | Independently qualified: 25 command outcomes; 21 installed files matched | [Local-archive success is not public onboarding proof](core-and-distribution.md#dist-04--fresh-public-registry-onboarding-after-publication) |
| RUN-01 | Can one ordinary test run alone without approving the whole matrix? | Qualified in pinned Vitest/RNTL/Jest recipes | [Select one intact-request outcome; reconcile every declared runner obligation](runners.md#run-01--select-one-obligation-account-for-the-complete-matrix) |
| RUN-02 | Does malformed green-looking evidence fail closed? | Two supplemental findings corrected; independent replay accepted | [Validate aggregate status and inversion flags; label counterfactuals as report mutations](runners.md#run-02--challenge-malformed-evidence-after-the-happy-path-passes) |
| WEB-01 | Do passing rectangles establish actionability? | No: overlay passed geometry but blocked a real click | [Geometry, qualified absence and interaction require different evidence](browser.md#web-01--geometry-is-not-actionability) |
| WEB-02 | Did raw digests identify saved files? | Initially no; byte-integrity correction independently verified | [Hash exact written bytes and verify file-to-receipt equality](browser.md#web-02--hash-persisted-bytes-then-verify-the-referenced-file) |
| WEB-03 | Did the trial actually release owned resources? | Observed context/process/listener cleanup | [Fixture ownership is not terminal cleanup proof](browser.md#web-03--cleanup-is-an-observed-result-not-a-fixture-declaration) |
| AND-01 | Does compilation prove native behavior? | Build isolation corrected; build-only proof | [Observe inherited tool state; keep runtime claims separate](android.md#and-01--build-isolation-before-runtime-claims) |
| AND-02 | Did strict transport research qualify ordinary local use? | Strict route unqualified; ordinary-local scope separately authorized | [Research envelopes are not runtime qualification](android.md#and-02--transport-research-versus-ordinary-local-use) |
| AND-03 | Does a working toggle measure native geometry? | Interaction smoke only | [Require actual measurement/export evidence](android.md#and-03--local-interaction-is-not-native-measurement) |
| AND-04 | Were actual emulator control endpoints safe? | Unsafe exposure stopped; corrected bounded path accepted | [Check observed listeners, not reassuring flags](android.md#and-04--unsafe-emulator-control-exposure-is-not-a-recipe) |
| AND-05 | Where should native facts and verdicts live? | RN callbacks export facts; external comparator evaluates policy | [Keep observation independent of expectations](android.md#and-05--observed-facts-belong-in-the-app-verdicts-outside-it) |
| AND-06 | Did permission/artifact setup satisfy its guards? | UID-denial and relative-screenshot corrections retained | [Read back permissions; repair without weakening guards](android.md#and-06--permission-and-screenshot-gates-caught-setup-errors) |
| AND-07 | Can export acknowledgment survive target loss? | Durable ingress corrected; target-loss cause unknown | [Persist before ACK; qualification remains separate](android.md#and-07--persist-ingress-before-acknowledging-export) |
| AND-08 | Did every native acquisition and obligation complete? | Five actual acquisitions/15 cases accepted; selected green refused | [Count complete obligations, not green siblings](android.md#and-08--five-acquisitions-and-complete-ordinary-accounting) |
| AND-09 | Can semantic proof substitute for lifecycle proof? | Separate independent reviews and terminal cleanup accepted | [Preserve timed observations and review boundaries](android.md#and-09--independent-lifecycle-and-semantic-checks) |
| AND-10 | Do multiple subjects and a fresh matrix preserve independent relationships? | Implemented/build-verified; native incomplete at1/6 accepted acquisitions | [Bind expected mode/attempt; preserve pending bytes without promoting them](android.md#and-10--two-subject-relationships-and-an-incomplete-native-continuation) |
| AND-11 | Did the diagnostic establish target loss or its own observer failure? | Native incomplete; named host-source repairs reviewed, runtime integration separate | [Keep observer cause, cleanup, privacy and evidence fidelity distinct](android.md#and-11--diagnose-the-observer-before-retrying-native-collection) |
| GUIDE-01 | Which historical method evidence remains reusable? | Impact-based reuse; changed seams separately addressed | [Do not relabel historical execution](guidance.md#guide-01--preserve-historical-evidence-without-relabelling-it) |
| GUIDE-02 | Can simulated consumers separate claims and missing evidence? | Six simulated decisions matched frozen dispositions | [Narrow valid results do not clear overall completion](guidance.md#guide-02--wave-1-separate-claims-acquisition-and-continuity) |
| GUIDE-03 | Does normalization preserve intent or hide defects? | Three simulated reports distinguished valid mapping from concealment | [Judge transformations against the obligation](guidance.md#guide-03--wave-2-legitimate-normalization-versus-hidden-defects) |
| GUIDE-04 | Can a reader discover the upstream method and private review route? | One successful retrieval trace; evidence access stipulated | [Discovery and custody are not package-skill qualification](guidance.md#guide-04--entrypoint-discovery-and-private-standalone-review) |
| GUIDE-05 | Did authority confusion establish a guidance defect? | Prompt-confounded; no unprompted defect established | [Inspect launch wording before causal attribution](guidance.md#guide-05--authority-attribution-was-prompt-confounded) |
| GUIDE-06 | Did semantic review and custody justify a rewrite? | Independent evidence-only disposition; custody gaps corrected | [Separate semantics, receipt freshness and retention](guidance.md#guide-06--independent-review-and-evidence-custody) |
| GUIDE-07 | Do matching final bytes prove an earlier check's coverage? | No; later exact-delta receipt closed the static gap | [A receipt proves only its actual comparison](guidance.md#guide-07--exact-delta-checks-answer-coverage-not-behavior) |
| GUIDE-08 | What did upstream method simulations authorize? | Evidence-only/no rewrite; no project UI acceptance | [Stop at bounded evidence, not method-stage or package-skill qualification](guidance.md#guide-08--stopping-point-evidence-only-not-ui-acceptance) |

## Evidence reading rules

- **Public source** links expose retained code, literal oracle data, contracts and recorded qualification summaries. Source existence is not execution proof.
- **Historical runtime** means the recorded real command/interaction occurred. **Offline replay** rechecks retained inputs. **Counterfactual** means a labelled evidence mutation, not a fabricated runtime event. Counts from these categories are not interchangeable.
- **Writer proof**, **independent verification** and **parent acceptance** are separate events. Neither prose authorship nor a matching hash establishes independent reasoning, loaded-code attestation or authority to collect/release.
- **Private raw receipts** are retained outside this public tree. These newly authored sanitized summaries deliberately provide no machine paths, private source revisions, raw-artifact links or reconstructed receipt contents. Where only a public summary is available, the note says so; no public reproducibility of those private receipts is claimed.
- **Bounded acceptance** covers only the recorded specimen, versions and evidence. Failures stay historical after correction; a later success does not explain an unresolved cause or certify older mismatched artifacts.

No experiments were rerun merely to organize this knowledge base. AND-10/11 summarize separately authorized postrelease qualification, diagnostics and host-only repairs; other entries preserve their historical evidence. These notes grant no execution, publication or consumer-adoption authority.
