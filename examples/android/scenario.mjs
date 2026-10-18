import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { selectOutcome } from '../shared/scenario.mjs';

export { selectOutcome };
export const hash = bytes => createHash('sha256').update(bytes).digest('hex');
export const digest = value => hash(JSON.stringify(value));
export const modes = ['valid', 'defect', 'repair', 'missing', 'absent'];
// Independent policy, frozen before native measurements; never fitted to observations.
export const policy = { width: 200.5, height: 48, tolerance: 0.5, leftPadding: 24, maxIntervalMs: 1000 };
export const caseNames = [
  'valid width', 'valid height', 'defect height fails while width passes',
  'repair width', 'repair height', 'missing is unmeasured', 'qualified absence',
  'incomplete acquisition is not absence', 'wrong candidate refused',
  'wrong checkpoint refused', 'wrong environment refused', 'overlong capture refused',
  'unsteady capture refused', 'raw file binding enforced', 'receiver rejects stale and malformed exports',
];
export const sourceFiles = ['App.js', 'android/app/src/main/AndroidManifest.xml',
  'android/app/src/debug/AndroidManifest.xml', 'android/app/src/debug/res/xml/boopstick_network_security_config.xml',
  'scenario.mjs', 'collector.mjs', 'native.test.mjs', 'interaction.yaml', 'qualify.mjs',
  'setup.mjs', 'vitest.config.mjs', 'receiver.test.mjs', 'package.json', 'bun.lock', 'README.md'];
export const sourceManifest = () => Object.fromEntries(sourceFiles.map(name => [name, hash(readFileSync(new URL(name, import.meta.url)))]));
export const fixtureIdentity = () => ({ id: 'original-neutral-rn-window-v1', sha256: hash(readFileSync(new URL('./App.js', import.meta.url))) });
export const collectorIdentity = () => ({ id: 'bounded-rn-window-host-v1', sha256: hash(readFileSync(new URL('./collector.mjs', import.meta.url))) });
export const reference = { key: 'geometry-subject', kind: 'layout', provider: 'rn-measure-in-window' };

export function makeRequest(binding, presence = false) {
  return {
    schemaVersion: 3, contractVersion: '3.1', requestId: 'neutral-android-window-v1',
    claim: { kind: 'qualification', expectationSource: { ref: 'independently-authored:neutral-android-200.5-by-48', sha256: digest(policy) } },
    scenario: { id: 'neutral-android-window', checkpoint: 'after-toggle' },
    requiredIdentity: { candidate: `sha256:${binding.apkSha256}`, fixture: binding.fixture, environment: binding.environment },
    capturePolicy: { maxIntervalMs: policy.maxIntervalMs, requireSteady: true },
    subjects: [{ id: 'subject', ...reference, match: 'one', frame: 'window', unit: 'dp', spaceId: 'boopstick-window' }],
    scopes: [{ id: 'subject-scope', subjects: ['subject'] }],
    assertions: presence ? [{ id: 'absent', rule: 'presence', scope: 'subject-scope', target: 'subject', mode: 'absent' }]
      : ['width', 'height'].map(metric => ({ id: metric, rule: 'metric', target: 'subject', metric, comparison: 'eq', value: policy[metric], tolerance: policy.tolerance })),
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
