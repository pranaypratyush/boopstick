---
name: boopstick
description: Author and review UI obligations checked with Boopstick, select suitable capture evidence, and reconcile comparator outcomes with ordinary test results. Use when creating Boopstick requests or captures, diagnosing its refusals, or judging UI acceptance from supplied measurements.
license: Apache-2.0
---

# Boopstick

Check explicit UI obligations against supplied observations. A passing comparison establishes only its measured assertions, not a correct whole interface. This skill grants no data/device access, installation, release or consumer-migration authority.

## References on demand

- **Before writing or diagnosing request/capture JSON, interpreting reports, or using the CLI:** read [the exact-3.1 contract](references/contract.md). It is the canonical wire/default/precedence reference, not a second schema to infer from normalized types.
- **When selecting a source, qualifying collection, or inspecting visual/interaction gaps:** read [tools and evidence](references/tools-and-evidence.md). A provider name is not producer qualification.

## Author, challenge, execute, reconcile

1. **Bind obligations.** Inspect the approved behavior/design/reference first. Reuse the project's existing story/scenario declarations for source, candidate, content/state, platform and viewport/container. Account for actions, transitions and responsive conditions, not only measurable boxes. Finish with each in-scope obligation source-linked and missing/conflicting intent named; create no second requirement registry.
2. **Calibrate intent.** Separate approved constraints and necessary derivations from hypotheses and incidental specimen geometry. For each binding predicate, record one legitimate variation it should allow and one defect it should reject. Prefer the actual promise—ordering, minimum or exactness—rather than the implementation's current values. Keep expected values independently justified; an observed discrepancy is not evidence for widening tolerance. Finish with binding, diagnostic and decision-pending criteria distinguished. Resolve material intent changes with the owning human; reuse already settled decisions.
3. **Choose evidence.** Map every obligation to scenarios, stable subjects and an adequate comparator, behavior, interaction or visual check. Select discriminating boundaries from the failure model: content extremes, container transitions, font scale or direction as relevant. Finish with every required claim mapped or explicitly unresolved. Synthetic fixtures, layout, accessibility, semantic text and painted pixels are different evidence kinds.
4. **Challenge independently.** Before seeing comparator output, have an independent reviewer derive likely obligations and omissions from the source, then review the predicates, identities, units, origin, scope, direction and expected values. Work literal valid/variation/defect/missing-evidence expectations. “Each control” includes every member, not a convenient sibling. Finish with material disagreements reconciled and the request/check set frozen before execution; confidence or reviewer votes do not settle product intent.
5. **Execute within authority.** Use the installed package's `compare`/`canonicalReport` or the documented offline CLI. Let the existing runner/driver own registration, interactions, readiness and teardown. Preserve actual results for valid controls, selected faults and missing/ineligible evidence. Synthetic/capture mutations exercise predicates; implementation faults plus fresh collection exercise the producer/check path. Finish with evidence for each required execution or an explicit unexecuted item; a setup refusal is not successful defect detection.
6. **Reconcile, not optimize for green.** Repair invalid authoring or acquisition while retaining refusals. Supply adequate evidence for `not_measured`, or hold that obligation. Investigate measured `fail` against candidate, observation and oracle before repair. A binding `pass` covers only its stated conditions. Changed requirements, predicates, tolerance, reference or producer invalidate affected review/evidence. Finish only when the agreed inventory is evidenced or precisely held; retain required omissions and external behavior/visual checks alongside comparator outcomes.

## Ordinary tests and complete acceptance

Register named cases from canonical declarations before collection, using the runner's normal parameterization and filtering. Evaluate the intact request, then select the unique assertion outcome by stable ID; a sibling failure is not that case's failure. Admission errors and missing/ambiguous outcomes are errors. Reuse immutable reports where useful. Each selected case must set up and clean up independently.

A filtered local run is feedback, not complete approval. Full CI reconciles all required scenario/assertion/variant IDs and current candidate/request/environment identities against ordinary machine reports and comparator outcomes. Skipped, omitted, duplicated/conflicting, invalid, unmeasured or expected-failing UI obligations cannot satisfy acceptance. Keep negative comparator contract tests distinct from application acceptance. Preserve failed attempts; use no automatic acceptance retries, and label immutable replay as replay. If sharded, require the full matching shard set. Reuse existing reports/artifacts, not another inventory or dashboard.

RNTL/Jest can check behavior/state with existing matchers and use synthetic comparator cases; supplied layout events are not native geometry. Browser actionability and actual Android interactions remain external checks. These are evidence boundaries, not claims that these integrations have been qualified by this skill. Pilot on a bounded specimen and an unseen follow-up before broader adoption; assertion counts are not completeness scores.
