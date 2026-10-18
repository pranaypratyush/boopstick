import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { caseName, makeBinding } from "./scenario.mjs";
import { reconcile } from "./reconcile.mjs";
import { checkAccounting } from "./accounting-check.mjs";

assert(process.release.lts && Number(process.versions.node.split(".")[0]) >= 24, "Use supported Node LTS >=24, not the current/non-LTS channel");
const [artifact, expectedSha256, only, ...extra] = process.argv.slice(2);
assert(artifact && /^[a-f0-9]{64}$/.test(expectedSha256 ?? "") && !extra.length && (!only || ["vitest", "rntl"].includes(only)),
  "Usage: node examples/shared/qualify.mjs <boopstick.tgz> <expected-sha256> [vitest|rntl]");
assert.equal(createHash("sha256").update(readFileSync(artifact)).digest("hex"), expectedSha256, "Independently supplied artifact identity");
const examples = fileURLToPath(new URL("../", import.meta.url));
const output = mkdtempSync(join(tmpdir(), "boopstick-phase-c-"));
console.log(`Retained integration evidence: ${output}`);
const env = { ...process.env, NODE_PATH: "", NODE_OPTIONS: "", PATH: `${dirname(process.execPath)}:${process.env.PATH}` };
const bun = spawnSync("bun", ["--version"], { encoding: "utf8", env });
assert.ifError(bun.error);
assert.equal(bun.status, 0);
const summary = { node: process.version, lts: process.release.lts, bun: bun.stdout.trim(), artifactSha256: expectedSha256, runs: [] };
const saveSummary = () => writeFileSync(join(output, "summary.json"), JSON.stringify(summary, null, 2));
saveSummary();
const escape = text => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

for (const variant of only ? [only] : ["vitest", "rntl"]) {
  const cwd = join(examples, variant);
  const runner = variant === "vitest" ? "vitest" : "jest";
  const packages = variant === "vitest" ? { vitest: "5.0.5", vite: "8.3.4" }
    : { jest: "30.5.2", react: "19.3.1", "react-native": "0.88.0", "@testing-library/react-native": "14.1.0", "test-renderer": "1.3.1", "@react-native/jest-preset": "0.88.0", "@react-native/babel-preset": "0.88.0", "babel-jest": "30.5.2", "@babel/core": "7.29.7", "jest-environment-node": "30.5.2" };
  const metadata = Object.fromEntries(Object.entries(packages).map(([name, version]) => {
    const manifest = JSON.parse(readFileSync(join(cwd, "node_modules", name, "package.json"), "utf8"));
    assert.equal(manifest.version, version, `${variant}: ${name}`);
    return [name, { version: manifest.version, engines: manifest.engines, peerDependencies: manifest.peerDependencies }];
  }));
  const core = JSON.parse(readFileSync(join(cwd, "node_modules/boopstick/package.json"), "utf8"));
  assert.equal(core.private, true);
  assert.equal(core.type, "module");
  for (const field of ["dependencies", "optionalDependencies", "peerDependencies"]) assert.equal(Object.keys(core[field] ?? {}).length, 0, `Core-only ${field}`);
  const runtimeDigests = {};
  for (const module of ["index", "cli", "compare", "request", "assertion", "measure", "vocab"]) {
    for (const extension of ["js", "d.ts"]) {
      const file = `dist/${module}.${extension}`;
      const packed = spawnSync("tar", ["-xOf", artifact, `package/${file}`], { maxBuffer: 4 * 1024 * 1024 });
      assert.ifError(packed.error);
      assert.equal(packed.status, 0, `Read packed ${file}`);
      const installed = readFileSync(join(cwd, "node_modules/boopstick", file));
      assert(installed.equals(packed.stdout), `Installed bytes must match the supplied packed artifact: ${file}`);
      runtimeDigests[file] = createHash("sha256").update(installed).digest("hex");
    }
  }
  if (variant === "rntl") {
    const fromPreset = createRequire(join(cwd, "node_modules/@react-native/jest-preset/package.json"));
    const resolvedEnvironment = fromPreset.resolve("jest-environment-node/package.json");
    const resolvedManifest = JSON.parse(readFileSync(resolvedEnvironment, "utf8"));
    assert.equal(resolvedManifest.version, "30.5.2", "RN preset must resolve the approved dev-only environment override");
    metadata.presetResolvedEnvironment = { path: resolvedEnvironment, version: resolvedManifest.version };
  }
  const runnerOutput = join(output, variant);
  mkdirSync(runnerOutput);
  writeFileSync(join(runnerOutput, "installed-metadata.json"), JSON.stringify({ packages: metadata, core, runtimeDigests }, null, 2));

  for (const [label, control, selected, expectedExit, accepted] of [
    ["full", "full", false, 0, true],
    ["filtered", "full", true, 0, false],
    ["passing-sibling-filtered", "sibling-failure", true, 0, false],
    ["skip", "skip", false, 0, false],
    ["expected-failure", "expected-failure", false, 0, false],
    ["mismatch", "mismatch", false, 1, false],
    ["missing-observation", "missing-observation", false, 1, false],
    ["invalid-request", "invalid-request", false, 1, false],
    ["invalid-capture", "invalid-capture", false, 1, false],
  ]) {
    const directory = join(runnerOutput, label);
    mkdirSync(directory);
    const expected = {
      binding: makeBinding({ runId: randomUUID(), artifactSha256: expectedSha256, variant }),
      project: `boopstick-${variant}`, file: join(cwd, "policy.test.mjs"),
    };
    const args = variant === "vitest" ? ["node_modules/vitest/vitest.mjs", "run"]
      : ["--experimental-vm-modules", "node_modules/jest/bin/jest.js", "--runInBand", "--json", `--outputFile=${join(directory, "runner.json")}`];
    if (selected) args.push("-t", `^${escape(caseName("width", variant))}$`);
    const invocation = { expected, control, selected, executable: process.execPath, args, cwd };
    writeFileSync(join(directory, "invocation.json"), JSON.stringify(invocation, null, 2));
    const result = spawnSync(process.execPath, args, {
      cwd, encoding: "utf8", maxBuffer: 16 * 1024 * 1024,
      env: { ...env, BOOPSTICK_RUN_ID: expected.binding.runId, BOOPSTICK_ARTIFACT_SHA256: expectedSha256, BOOPSTICK_OUTPUT_DIR: directory, BOOPSTICK_CONTROL: control },
    });
    writeFileSync(join(directory, "stdout.log"), result.stdout ?? "");
    writeFileSync(join(directory, "stderr.log"), result.stderr ?? "");
    writeFileSync(join(directory, "process.json"), JSON.stringify({ exitCode: result.status, signal: result.signal, error: result.error?.message }, null, 2));
    let report, evidence = [], readError;
    try {
      report = JSON.parse(readFileSync(join(directory, "runner.json"), "utf8"));
      if (runner === "jest") evidence = readFileSync(join(directory, "evidence.jsonl"), "utf8").trim().split("\n").filter(Boolean).map(line => JSON.parse(line));
    } catch (error) { readError = error.message; }
    const input = { runner, report, evidence, expected, exitCode: result.status };
    const accounting = reconcile(input);
    if (readError) { accounting.accepted = false; accounting.errors.push({ code: "artifact-read", detail: readError }); }
    writeFileSync(join(directory, "reconciliation.json"), JSON.stringify(accounting, null, 2));
    summary.runs.push({ variant, label, exitCode: result.status, signal: result.signal, accepted: accounting.accepted, directory });
    saveSummary();
    assert.ifError(result.error);
    assert.equal(result.signal, null, `${variant}/${label}: ${directory}`);
    assert.equal(result.status, expectedExit, `${variant}/${label}: inspect ${directory}`);
    assert.equal(accounting.accepted, accepted, `${variant}/${label}: ${JSON.stringify(accounting.errors)}`);
    assert.equal(readError, undefined, `${variant}/${label}: ${readError}`);
    const rows = report.testResults.flatMap(file => file.assertionResults);
    const width = rows.find(row => row.title === caseName("width", variant));
    const height = rows.find(row => row.title === caseName("height", variant));
    const receipt = id => runner === "vitest" ? rows.find(row => row.title === caseName(id, variant))?.meta?.boopstick : evidence.find(item => item.assertionId === id);
    if (label === "full") {
      assert.equal(receipt("width").report.outcomes.length, 2);
      if (variant === "rntl") {
        assert(rows.some(row => !row.title.startsWith("[") && row.status === "passed"), "Actual non-obligation behavior tests must run");
        const refusal = JSON.parse(readFileSync(join(directory, "refusal.json"), "utf8"));
        const refusalReport = refusal.report ?? refusal;
        assert.equal(refusalReport.status, "not_measured");
        assert(refusalReport.outcomes.every(outcome => outcome.reason === "synthetic-not-live-evidence"));
      }
      checkAccounting(input, directory);
    }
    if (selected) {
      assert.equal(width.status, "passed");
      assert.equal(receipt("width").report.outcomes.length, 2, "Selection retains the intact comparison");
    }
    if (label === "passing-sibling-filtered" || label === "expected-failure" || label === "mismatch") {
      assert.equal(receipt("width").report.status, "fail");
      const outcome = receipt("width").report.outcomes.find(item => item.id === "height");
      assert.equal(outcome.status, "fail"); assert.equal(outcome.measured, 24); assert.equal(outcome.deviation, -24);
    }
    if (label === "expected-failure") {
      assert.equal(height.status, "passed");
      assert.equal(runner === "vitest" ? receipt("height").expectedFailure : height.failing, true);
      assert(accounting.errors.some(error => error.code === "expected-failure"));
    }
    if (label === "skip") assert(["skipped", "pending"].includes(height.status));
    if (label === "missing-observation") {
      assert.equal(receipt("width").report.status, "not_measured");
      assert(receipt("width").report.outcomes.every(outcome => outcome.status === "not_measured" && outcome.reason === "missing-fact" && outcome.measured === null));
    }
    if (label === "invalid-request" || label === "invalid-capture") {
      const comparison = receipt("width").report;
      assert.equal(comparison.status, label.replace("-", "_"));
      assert.deepEqual(comparison.outcomes, []);
      assert((label === "invalid-request" ? comparison.errors : comparison.evidenceErrors).length > 0);
      assert(accounting.errors.some(error => error.code === "admission"));
    }
    console.log(`${variant}/${label}: runner ${result.status}, full acceptance ${accounting.accepted}; ${directory}`);
  }
}
console.log(`Integration qualification complete; retained evidence: ${output}`);
