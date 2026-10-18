import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { reconcile } from "./reconcile.mjs";

let result;
try {
  const [runner, reportPath, invocationPath, status, ...extra] = process.argv.slice(2);
  if (!["vitest", "jest"].includes(runner) || !reportPath || !invocationPath || !/^\d+$/.test(status ?? "") || extra.length) {
    throw new Error("Usage: node accept.mjs <vitest|jest> <runner.json> <independent-invocation.json> <actual-exit-code>");
  }
  const report = JSON.parse(readFileSync(reportPath, "utf8"));
  const { expected } = JSON.parse(readFileSync(invocationPath, "utf8"));
  const evidence = runner === "jest" ? readFileSync(join(dirname(reportPath), "evidence.jsonl"), "utf8")
    .trim().split("\n").filter(Boolean).map(line => JSON.parse(line)) : [];
  result = reconcile({ runner, report, evidence, expected, exitCode: Number(status) });
} catch (error) {
  result = { accepted: false, errors: [{ code: "artifact-read-or-invocation", detail: error.message }] };
}
console.log(JSON.stringify(result, null, 2));
process.exitCode = result.accepted ? 0 : 1;
