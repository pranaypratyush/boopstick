# Boopstick

A poking stick for overconfident agents.

Boopstick is a planned TypeScript tool for checking explicit UI obligations using observations supplied by existing testing tools. It is not artificial vision and does not certify an entire UI.

**Planning only:** no comparator package, collector or installable skill is released here. Extraction and implementation are on hold pending review and an explicit maintainer go-ahead.

- [Proposed behavior and support boundaries](specs/boopstick.md)
- [Migration plan and readiness gates](plans/extract-boopstick.md)

The target is ordinary named tests: selective local feedback, complete CI accounting, and clear distinctions between synthetic component-test data, real browser observations and real native observations.

License selection and source redistribution clearance are pending. Apache-2.0 is proposed for the eventual release; this repository's visibility does not grant rights to unpublished source material.
