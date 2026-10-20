import { defineConfig } from '@playwright/test';
import { join } from 'node:path';
import { matrix } from './scenario.mjs';

const output = process.env.BOOPSTICK_OUTPUT_DIR;
const port = process.env.BOOPSTICK_BROWSER_PORT;
if (!output || !port || !process.env.PLAYWRIGHT_BROWSERS_PATH) throw new Error('Owned output/cache and loopback port required');
export default defineConfig({
  testDir: '.', testMatch: 'browser.spec.mjs', fullyParallel: false, workers: 1,
  retries: 0, timeout: 20000, forbidOnly: true,
  outputDir: join(output, 'tests'), preserveOutput: 'always',
  reporter: [['list'], ['json', { outputFile: join(output, 'runner.json') }]],
  use: {
    browserName: 'chromium', headless: true, deviceScaleFactor: 1,
    locale: 'en-US', colorScheme: 'light', actionTimeout: 3000,
    baseURL: `http://127.0.0.1:${port}`, screenshot: 'only-on-failure',
    trace: 'retain-on-failure', acceptDownloads: false,
  },
  projects: matrix.map(variant => ({ name: variant.name, use: { viewport: variant.viewport } })),
  webServer: {
    command: `${JSON.stringify(process.execPath)} server.mjs`,
    url: `http://127.0.0.1:${port}/`, reuseExistingServer: false, timeout: 10000,
    gracefulShutdown: { signal: 'SIGTERM', timeout: 2000 }, stdout: 'pipe', stderr: 'pipe',
  },
});
