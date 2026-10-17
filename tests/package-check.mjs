import assert from "node:assert/strict";
import { cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createHash } from "node:crypto";

assert(process.release.lts && Number(process.versions.node.split(".")[0]) >= 24,
  "Run package qualification with supported Node LTS >=24, not the current/non-LTS channel");
const root = fileURLToPath(new URL("../", import.meta.url));
const evidence = mkdtempSync(join(tmpdir(), "boopstick-package-"));
const env = { ...process.env, NODE_PATH: "", NODE_OPTIONS: "", PATH: `${dirname(process.execPath)}:${process.env.PATH}` };
function run(binary, args, cwd = root) {
  const result = spawnSync(binary, args, { cwd, env, encoding: "utf8" });
  assert.ifError(result.error);
  assert.equal(result.signal, null, `${binary}: ${result.signal}`);
  return result;
}
function ok(binary, args, cwd) {
  const result = run(binary, args, cwd);
  assert.equal(result.status, 0, `${binary} ${args.join(" ")}: ${result.stderr}\n${result.stdout}`);
  return result.stdout;
}
const hash = "a".repeat(64);
const request = {
  schemaVersion: 3, contractVersion: "3.1", requestId: "neutral-width",
  claim: { kind: "qualification", expectationSource: { ref: "independently-authored-width" } },
  scenario: { id: "neutral-panel", checkpoint: "ready" },
  requiredIdentity: { candidate: "neutral-build", fixture: { id: "neutral-data", sha256: hash }, environment: { platform: "offline", density: 1, fontScale: 1, direction: "ltr" } },
  subjects: [{ id: "panel", key: "panel", kind: "layout", provider: "synthetic", frame: "window", unit: "dp", match: "one" }],
  assertions: [{ id: "width", rule: "metric", target: "panel", metric: "width", comparison: "eq", value: 7, tolerance: 0 }],
};
const capture = {
  schemaVersion: 2, contractVersion: "3.1", captureId: "neutral-capture", origin: "synthetic", provider: "synthetic",
  collector: { id: "authored-offline", sha256: hash }, scenario: request.scenario,
  candidate: { buildId: "neutral-build" }, fixture: request.requiredIdentity.fixture, environment: request.requiredIdentity.environment,
  epoch: { id: "one", startedAt: 0, endedAt: 1, steady: true }, coverage: [], rawEvidence: [],
  elements: [{ key: "panel", kind: "layout", provider: "synthetic", frame: "window", unit: "dp", spaceId: "neutral-space", rect: { x: 0, y: 0, width: 7, height: 2 } }],
};
const scenarios = [
  { id: "pass", request, capture, status: "pass", exit: 0, measured: 7, deviation: 0, reason: null },
  { id: "fail", request: { ...request, assertions: [{ ...request.assertions[0], value: 8 }] }, capture, status: "fail", exit: 1, measured: 7, deviation: -1, reason: null },
  { id: "not-measured", request, capture: { ...capture, elements: [] }, status: "not_measured", exit: 1, measured: null, deviation: null, reason: "missing-fact" },
  { id: "invalid-request", request: null, capture, status: "invalid_request", exit: 2, error: "request-not-object" },
  { id: "invalid-capture", request, capture: null, status: "invalid_capture", exit: 2, error: "capture-not-object" },
];
const script = `import assert from 'node:assert/strict';
import { compare, canonicalReport } from 'boopstick';
const scenarios = ${JSON.stringify(scenarios)};
for (const c of scenarios) {
  const before = structuredClone({ request: c.request, capture: c.capture });
  const report = compare(c.request, c.capture);
  assert.equal(report.contractVersion, '3.1'); assert.equal(report.status, c.status, c.id);
  assert.deepEqual(JSON.parse(canonicalReport(report)), report);
  assert.deepEqual({ request: c.request, capture: c.capture }, before);
  if (c.error) {
    assert.deepEqual(report.outcomes, []);
    assert((c.status === 'invalid_request' ? report.errors : report.evidenceErrors).some(e => e.code === c.error));
  } else {
    assert.equal(report.outcomes[0].measured, c.measured, c.id);
    assert.equal(report.outcomes[0].deviation, c.deviation, c.id);
    assert.equal(report.outcomes[0].reason, c.reason, c.id);
  }
}
console.log(JSON.stringify({ statuses: scenarios.map(c => c.status) }));
`;
try {
  const { name, version } = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  const artifact = join(evidence, `${name}-${version}.tgz`);
  ok("bun", ["pm", "pack", "--ignore-scripts", "--filename", artifact, "--quiet"]);
  const files = ok("tar", ["-tzf", artifact]).trim().split("\n")
    .filter(path => !path.endsWith("/")).map(path => ({ path: path.replace(/^package\//, "") }));
  const packed = {
    files,
    integrity: `sha512-${createHash("sha512").update(readFileSync(artifact)).digest("base64")}`,
  };
  const distFiles = ["vocab", "request", "assertion", "measure", "compare", "index", "cli"].flatMap(name => [`dist/${name}.js`, `dist/${name}.d.ts`]);
  const skillFiles = ["SKILL.md", "references/contract.md", "references/tools-and-evidence.md"].map(name => `skills/boopstick/${name}`);
  const allowed = [...distFiles, ...skillFiles, "docs/provenance.md", "LICENSE", "README.md", "package.json"].sort();
  assert.deepEqual(packed.files.map(f => f.path).sort(), allowed, "actual tarball file allowlist");
  const unpacked = join(evidence, "unpacked");
  mkdirSync(unpacked);
  ok("tar", ["-xzf", artifact, "-C", unpacked]);
  const pkg = join(unpacked, "package");
  const manifest = JSON.parse(readFileSync(join(pkg, "package.json"), "utf8"));
  assert.equal(manifest.private, true); assert.equal(manifest.license, "Apache-2.0");
  assert.equal(Object.keys(manifest.dependencies ?? {}).length, 0);
  for (const path of allowed) {
    assert(lstatSync(join(pkg, path)).isFile(), `regular packed file required: ${path}`);
    const text = readFileSync(join(pkg, path), "utf8");
    assert(!/\/(?:home|Users)\/[\w.-]+\//.test(text), `personal/machine path in ${path}`);
    assert(!/\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/i.test(text), `personal email in ${path}`);
  }
  const skillOnly = join(evidence, "skill-only");
  cpSync(join(pkg, "skills/boopstick"), skillOnly, { recursive: true });
  const entry = readFileSync(join(skillOnly, "SKILL.md"), "utf8");
  const frontmatter = entry.match(/^---\n([\s\S]*?)\n---\n/);
  assert(frontmatter, "standalone skill YAML frontmatter");
  assert.match(frontmatter[1], /^name: boopstick$/m);
  assert.match(frontmatter[1], /^description: .+$/m);
  assert.match(frontmatter[1], /^license: Apache-2\.0$/m);
  assert(!/^allowed-tools:/m.test(entry), "skill metadata grants no tool permissions");
  for (const name of ["SKILL.md", "references/contract.md", "references/tools-and-evidence.md"]) {
    const file = join(skillOnly, name);
    for (const match of readFileSync(file, "utf8").matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      if (/^https?:\/\//.test(match[1])) continue;
      const [link, anchor] = match[1].split("#");
      const resolved = link ? resolve(dirname(file), decodeURIComponent(link)) : file;
      assert(!relative(skillOnly, resolved).startsWith(".."), `skill-only link escapes: ${match[1]}`);
      assert(existsSync(resolved), `skill-only link missing: ${match[1]}`);
      if (anchor) {
        const headings = [...readFileSync(resolved, "utf8").matchAll(/^#{1,6} (.+)$/gm)].map(m =>
          m[1].toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, "").replace(/\s+/g, "-"));
        assert(headings.includes(decodeURIComponent(anchor)), `skill-only anchor missing: ${match[1]}`);
      }
    }
  }
  const results = [];
  for (const runtime of [process.execPath, "bun"]) {
    const consumer = join(evidence, runtime === "bun" ? "consumer-bun" : "consumer-node");
    mkdirSync(consumer);
    writeFileSync(join(consumer, "package.json"), JSON.stringify({ private: true, type: "module" }));
    ok("bun", ["add", "--ignore-scripts", "--no-save", artifact], consumer);
    writeFileSync(join(consumer, "consumer.mjs"), script);
    const observed = JSON.parse(ok(runtime, ["consumer.mjs"], consumer));
    const installed = join(consumer, "node_modules/boopstick");
    const cli = join(installed, "dist/cli.js");
    for (const c of scenarios) {
      const req = join(consumer, "request.json"), cap = join(consumer, "capture.json");
      writeFileSync(req, JSON.stringify(c.request)); writeFileSync(cap, JSON.stringify(c.capture));
      const result = run(runtime, [cli, req, cap], consumer);
      assert.equal(result.status, c.exit, `${runtime}/${c.id}: ${result.stderr}`);
      assert.equal(result.stderr, "", c.id);
      assert(result.stdout.endsWith("\n") && !result.stdout.endsWith("\n\n"), c.id);
      const report = JSON.parse(result.stdout);
      assert.equal(report.status, c.status, c.id);
      const { compare, canonicalReport } = await import(pathToFileURL(join(installed, "dist/index.js")).href);
      assert.equal(result.stdout, canonicalReport(compare(c.request, c.capture)) + "\n", c.id);
    }
    writeFileSync(join(consumer, "bad.json"), "{");
    for (const args of [[], ["missing.json", "missing.json"], ["bad.json", "capture.json"], ["request.json", "bad.json"]]) {
      const result = run(runtime, [cli, ...args], consumer);
      assert.equal(result.status, 2); assert.equal(result.stdout, "");
      assert.match(result.stderr, /^boopstick: .+\n$/);
    }
    const help = run(runtime, [cli, "--help"], consumer);
    assert.equal(help.status, 0); assert.equal(help.stderr, "");
    assert.equal(help.stdout, "Usage: boopstick <request.json> <capture.json>\n");
    assert.equal(ok(join(consumer, "node_modules/.bin/boopstick"), ["--help"], consumer), help.stdout);
    writeFileSync(join(consumer, "consumer.mts"), `import { compare, canonicalReport, type Report, type Outcome } from 'boopstick';\nexport const report: Report = compare(${JSON.stringify(request)}, ${JSON.stringify(capture)});\nexport const outcomes: Outcome[] = report.outcomes;\nexport const canonical: string = canonicalReport(report);\n`);
    writeFileSync(join(consumer, "tsconfig.json"), JSON.stringify({ compilerOptions: { target: "ES2022", lib: ["ES2022"], module: "NodeNext", moduleResolution: "NodeNext", strict: true, noEmit: true, types: [] }, files: ["consumer.mts"] }));
    ok(process.execPath, [join(root, "node_modules/typescript/bin/tsc"), "-p", join(consumer, "tsconfig.json")], consumer);
    results.push({ runtime: runtime === "bun" ? "bun" : "node", version: ok(runtime, ["--version"], consumer).trim(), ...observed, declarations: "passed", cli: "5 reports + 4 operational/usage errors + help + installed bin" });
    rmSync(consumer, { recursive: true });
  }
  const result = { artifact, integrity: packed.integrity, fileCount: packed.files.length, nodeLts: process.release.lts, consumers: results, skillOnly: "frontmatter and relative-reference closure passed; independent consumption still required" };
  writeFileSync(join(evidence, "verification.json"), JSON.stringify(result, null, 2) + "\n");
  rmSync(unpacked, { recursive: true }); rmSync(skillOnly, { recursive: true });
  console.log(JSON.stringify(result));
} catch (error) {
  console.error(`Preserved failed package qualification: ${evidence}`);
  throw error;
}
