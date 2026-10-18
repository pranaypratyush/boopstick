import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';
if (!process.env.BOOPSTICK_OUTPUT_DIR) throw new Error('Fresh private runner output directory required');
export default defineConfig({ test: {
  name: 'boopstick-native', include: ['native.test.mjs'], environment: 'node',
  reporters: ['default', 'json'], outputFile: resolve(process.env.BOOPSTICK_OUTPUT_DIR, 'runner.json'),
  retry: 0, fileParallelism: false, allowOnly: false,
} });
