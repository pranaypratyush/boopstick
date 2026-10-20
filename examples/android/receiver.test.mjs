import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { startReceiver } from './collector.mjs';
import { hash } from './scenario.mjs';

test('only persisted exports are acknowledged, and receiver closure does not qualify them', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'boopstick-receiver-'));
  const attemptId = 'retention-control';
  const environment = { density: 2, fontScale: 1, direction: 'ltr', windowWidth: 400, windowHeight: 800 };
  const bytes = Buffer.from(JSON.stringify({
    attemptId, mode: 'defect', checkpoint: 'after-toggle', state: 'on',
    startedAt: 10, endedAt: 12, generationBefore: 1, generationAfter: 1,
    environmentBefore: environment, environmentAfter: environment,
    root: { x: 0, y: 0, width: 400, height: 100 },
    subject: { x: 24, y: 0, width: 200.5, height: 47 },
    subjectMounted: true, steady: true, errors: [],
  }, null, 2) + '\n');
  try {
    const receiver = await startReceiver({ attemptId, mode: 'defect', directory });
    try {
      const response = await fetch(`http://127.0.0.1:${receiver.port}/capture/${attemptId}`, {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: bytes,
      });
      assert.equal(response.status, 200);
      await receiver.body;
    } finally { await receiver.close(); }
    assert.deepEqual(readFileSync(join(directory, 'defect-raw.json')), bytes);
    const pending = JSON.parse(readFileSync(join(directory, 'defect-pending.json')));
    assert.equal(pending.status, 'unqualified');
    assert.equal(pending.attemptId, attemptId);
    assert.equal(pending.rawEvidence.sha256, hash(bytes));
    assert.equal(existsSync(join(directory, 'defect-receipt.json')), false);
    const failing = await startReceiver({ attemptId, mode: 'defect', directory: join(directory, 'missing') });
    try {
      const response = await fetch(`http://127.0.0.1:${failing.port}/capture/${attemptId}`, {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: bytes,
      });
      assert.equal(response.status, 500);
      await assert.rejects(failing.body, { code: 'ENOENT' });
    } finally { await failing.close(); }
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
