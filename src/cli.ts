#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { compare, canonicalReport } from "./index.js";

const args = process.argv.slice(2);
if (args.length === 1 && args[0] === "--help") {
  process.stdout.write("Usage: boopstick <request.json> <capture.json>\n");
} else {
  try {
    if (args.length !== 2) throw new Error("Usage: boopstick <request.json> <capture.json>");
    const request: unknown = JSON.parse(readFileSync(args[0]!, "utf8"));
    const capture: unknown = JSON.parse(readFileSync(args[1]!, "utf8"));
    const report = compare(request, capture);
    const output = canonicalReport(report) + "\n";
    process.stdout.write(output);
    process.exitCode = report.status === "pass" ? 0
      : report.status === "fail" || report.status === "not_measured" ? 1 : 2;
  } catch (error) {
    process.stderr.write(`boopstick: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 2;
  }
}
