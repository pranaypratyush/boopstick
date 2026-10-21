import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { selectOutcome } from '../shared/scenario.mjs';

export { selectOutcome };
export const hash = bytes => createHash('sha256').update(bytes).digest('hex');
export const digest = value => hash(JSON.stringify(value));
export const modes = ['control-1', 'control-2', 'control-3', 'narrow', 'defect', 'repair'];
// Independent policy, frozen before native measurements; never fitted to observations.
export const policy = {
  gap: 16, alignment: 0, inset: 24, relationTolerance: 1, metricTolerance: 0.5,
  bodyWidth: 160, bodyHeight: 22, actionWidth: 48, actionHeight: 48, maxIntervalMs: 1000,
};
export const caseNames = [
  ...modes.flatMap(mode => ['gap', 'alignment', 'body-contained', 'action-contained',
    'body-width', 'body-height', 'action-width', 'action-height'].map(id => `${mode} ${id}`)),
  'narrow body reflows relative to control', 'repair uses the independent unchanged request',
  'canonical replay is deterministic', 'offline missing tuple preserves independent metrics',
  'offline duplicate tuple is invalid evidence', 'offline stale capture is withheld',
  'offline wrong checkpoint is withheld', 'offline wrong kind is not substituted',
  'offline wrong space withholds local relationships', 'offline incomplete scope cannot prove absence',
  'offline receipt tamper is detected', 'receiver retains six acquisition protocol controls',
];
export const sourceFiles = ['App.js', 'android/app/src/main/AndroidManifest.xml',
  'android/app/src/debug/AndroidManifest.xml', 'android/app/src/debug/res/xml/boopstick_network_security_config.xml',
  'scenario.mjs', 'collector.mjs', 'native.test.mjs', 'interaction.yaml', 'qualify.mjs',
  'setup.mjs', 'vitest.config.mjs', 'receiver.test.mjs', 'collector.test.mjs', 'package.json', 'bun.lock', 'README.md'];
export const sourceManifest = () => Object.fromEntries(sourceFiles.map(name => [name, hash(readFileSync(new URL(name, import.meta.url)))]));
export const fixtureIdentity = () => ({ id: 'original-neutral-rn-window-v1', sha256: hash(readFileSync(new URL('./App.js', import.meta.url))) });
export const collectorIdentity = () => ({ id: 'bounded-rn-window-host-v1', sha256: hash(readFileSync(new URL('./collector.mjs', import.meta.url))) });
export const references = {
  root: { key: 'specimen-root', kind: 'layout', provider: 'rn-measure-in-window' },
  body: { key: 'body-subject', kind: 'layout', provider: 'rn-measure-in-window' },
  action: { key: 'action-subject', kind: 'layout', provider: 'rn-measure-in-window' },
};

export function makeRequest(binding) {
  return {
    schemaVersion: 3, contractVersion: '3.1', requestId: 'neutral-android-reflow-v1',
    claim: { kind: 'qualification', expectationSource: { ref: 'independently-authored:neutral-android-reflow-v1', sha256: digest(policy) } },
    scenario: { id: 'neutral-android-window', checkpoint: 'after-toggle' },
    requiredIdentity: { candidate: `sha256:${binding.apkSha256}`, fixture: binding.fixture, environment: binding.environment },
    capturePolicy: { maxIntervalMs: policy.maxIntervalMs, requireSteady: true },
    subjects: Object.entries(references).map(([id, reference]) => ({
      id, ...reference, match: 'one', frame: 'window', unit: 'dp', spaceId: 'boopstick-window',
    })),
    scopes: [{ id: 'subject-scope', subjects: ['root', 'body', 'action'] }],
    assertions: [
      { id: 'gap', rule: 'gap', from: 'body', to: 'action', axis: 'y', comparison: 'eq', value: policy.gap, tolerance: policy.relationTolerance },
      { id: 'alignment', rule: 'alignment', from: 'body', to: 'action', edge: 'left', comparison: 'eq', value: policy.alignment, tolerance: policy.relationTolerance },
      ...['body', 'action'].map(inner => ({ id: `${inner}-contained`, rule: 'containment', outer: 'root', inner, inset: policy.inset, tolerance: policy.relationTolerance })),
      ...['body', 'action'].flatMap(target => ['width', 'height'].map(metric => ({
        id: `${target}-${metric}`, rule: 'metric', target, metric, comparison: 'min',
        value: policy[`${target}${metric[0].toUpperCase()}${metric.slice(1)}`], tolerance: policy.metricTolerance,
      }))),
    ],
  };
}

export function acceptRunner(report, exitCode, expectedNames = caseNames) {
  if (exitCode !== 0 || report.success !== true || report.wasInterrupted === true || report.runExecError || report.numRuntimeErrorTestSuites > 0) throw new Error('Runner did not complete successfully');
  const rows = report.testResults.flatMap(file => {
    if (file.status === 'failed' || file.message) throw new Error('Runner file failed');
    return file.assertionResults;
  });
  if (JSON.stringify(rows.map(row => row.title).sort()) !== JSON.stringify([...expectedNames].sort())) throw new Error('Exact declared case set required; selected feedback is partial');
  for (const row of rows) {
    if (row.status !== 'passed' || row.failing === true || row.wouldRun === true || (row.invocations ?? 1) !== 1 || row.retryReasons?.length
      || row.meta?.native?.expectedFailure !== false || row.meta.native.retry !== 0 || row.meta.native.repeats !== 0) throw new Error('Skipped, inverted, repeated or unattested case');
  }
  return rows;
}
