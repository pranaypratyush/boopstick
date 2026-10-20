import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { isDeepStrictEqual } from 'node:util';

export const hash = value => createHash('sha256').update(value).digest('hex');
export const digest = value => hash(JSON.stringify(value));
export const matrix = [
  { name: 'narrow', viewport: { width: 320, height: 720 }, width: 200.5 },
  { name: 'wide', viewport: { width: 1024, height: 768 }, width: 360.25 },
];
export const metrics = ['width', 'height'];
export const controls = ['defect-repair', 'missing-absence-zero-duplicate', 'overlay-recovery', 'identity-origin-refusals'];
export const title = (variant, obligation) => JSON.stringify([variant, metrics.includes(obligation) ? JSON.stringify(['neutral-browser', obligation]) : `control: ${obligation}`]);
export const allTitles = matrix.flatMap(variant => [...metrics, ...controls].map(id => title(variant.name, id)));
export const fixture = { id: 'original-static-dom-v1', sha256: hash(readFileSync(new URL('./specimen.html', import.meta.url))) };
export const artifactSha256 = process.env.BOOPSTICK_ARTIFACT_SHA256;
export const runId = process.env.BOOPSTICK_RUN_ID;
if (!runId?.trim() || !/^[a-f0-9]{64}$/.test(artifactSha256 ?? '')) throw new Error('Fresh run ID and accepted artifact SHA-256 required');
export const candidate = `sha256:${digest({ fixture: fixture.sha256, artifactSha256 })}`;
export const environment = { platform: 'browser-chromium', density: 1, fontScale: 1, direction: 'ltr' };
export const sourceFiles = ['package.json', 'bun.lock', 'specimen.html', 'server.mjs', 'scenario.mjs', 'acquire.mjs', 'browser.spec.mjs', 'playwright.config.mjs', 'setup.mjs', 'qualify.mjs', 'README.md'];
export const sourceManifest = () => Object.fromEntries(sourceFiles.map(name => [name, hash(readFileSync(new URL(name, import.meta.url)))]));
export const binding = variant => ({ runId, artifactSha256, candidate, fixture, variant, checkpoint: 'enabled', project: variant, declarationSha256: digest({ matrix, metrics, controls, environment }) });
export function makeRequest(variant, presence = false) {
  return {
    schemaVersion: 3, contractVersion: '3.1', requestId: `neutral-browser-${variant.name}`,
    claim: { kind: 'qualification', expectationSource: { ref: 'independently-authored:neutral-browser-policy', sha256: digest({ width: variant.width, height: 48, tolerance: 0.02 }) } },
    scenario: { id: `neutral-browser-${variant.name}`, checkpoint: 'enabled' },
    requiredIdentity: { candidate, fixture, environment },
    capturePolicy: { maxIntervalMs: 1000, requireSteady: true },
    subjects: [{ id: 'panel', key: 'panel', kind: 'layout', provider: 'web-dom-border-box', frame: 'window', unit: 'logical-px', spaceId: `viewport:${variant.name}`, match: 'one' }],
    scopes: [{ id: 'panel-scope', subjects: ['panel'] }],
    assertions: presence
      ? [{ id: 'absent', rule: 'presence', scope: 'panel-scope', target: 'panel', mode: 'absent' }]
      : metrics.map(metric => ({ id: metric, rule: 'metric', target: 'panel', metric, comparison: 'eq', value: metric === 'width' ? variant.width : 48, tolerance: 0.02 })),
  };
}
export function requireCurrent(receipt, expected, outputDirectory) {
  for (const key of ['runId', 'artifactSha256', 'candidate', 'variant', 'checkpoint', 'project', 'declarationSha256']) {
    if (receipt.binding[key] !== expected[key]) throw new Error(`Wrong binding: ${key}`);
  }
  if (digest(receipt.binding.fixture) !== digest(expected.fixture)) throw new Error('Wrong fixture binding');
  if (receipt.raw.runId !== expected.runId || receipt.raw.candidate !== expected.candidate || receipt.raw.variant !== expected.variant || receipt.raw.checkpoint !== expected.checkpoint || receipt.raw.fixture !== expected.fixture.sha256) throw new Error('Wrong observed page identity');
  if (receipt.capture.scenario.checkpoint !== expected.checkpoint || receipt.capture.candidate.buildId !== expected.candidate) throw new Error('Wrong capture identity');
  if (receipt.capture.rawEvidence.length !== 1) throw new Error('Exactly one raw observation file required');
  const reference = receipt.capture.rawEvidence[0];
  if (basename(reference.ref) !== reference.ref) throw new Error('Raw evidence reference must name an owned output file');
  const rawPath = resolve(outputDirectory, reference.ref);
  const rawBytes = readFileSync(rawPath);
  const actualSha256 = hash(rawBytes);
  if (actualSha256 !== reference.sha256) throw new Error('Raw evidence file digest mismatch');
  if (!isDeepStrictEqual(JSON.parse(rawBytes.toString('utf8')), receipt.raw)) throw new Error('Raw evidence observation mismatch');
  return { path: rawPath, sha256: actualSha256 };
}
export function requireOrigin(raw, expected = { x: 16, y: 24 }) {
  if (raw.rootRect.x !== expected.x || raw.rootRect.y !== expected.y) throw new Error('Wrong authored viewport origin');
}
