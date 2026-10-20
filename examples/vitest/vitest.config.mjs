import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

if (!process.env.BOOPSTICK_OUTPUT_DIR) throw new Error("BOOPSTICK_OUTPUT_DIR must name a fresh invocation directory");

export default defineConfig({
  test: {
    name: "boopstick-vitest",
    include: ["*.test.mjs"],
    environment: "node",
    reporters: ["default", "json"],
    outputFile: resolve(process.env.BOOPSTICK_OUTPUT_DIR, "runner.json"),
    retry: 0,
    fileParallelism: false,
    allowOnly: false,
  },
});
