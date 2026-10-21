import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { startReceiver } from './collector.mjs';
import { hash } from './scenario.mjs';

// Synthetic transport fixtures only; these tests do not establish native qualification.
const attemptId = 'retention-control';
const environment = { density: 2, fontScale: 1, direction: 'ltr', windowWidth: 400, windowHeight: 800 };
const raw = () => ({
  attemptId, mode: 'defect', checkpoint: 'after-toggle', state: 'on',
  startedAt: 10, endedAt: 12, generationBefore: 1, generationAfter: 1,
  environmentBefore: environment, environmentAfter: environment,
  root: { x: 0, y: 0, width: 400, height: 200 },
  subjects: [
    { key: 'body-subject', mounted: true, rect: { x: 24, y: 24, width: 280, height: 22 } },
    { key: 'action-subject', mounted: true, rect: { x: 24, y: 70, width: 48, height: 48 } },
  ], steady: true, errors: [],
});
const post = (receiver, body, id = attemptId) => fetch(`http://127.0.0.1:${receiver.port}/capture/${id}`, {
  method: 'POST', headers: { 'content-type': 'application/json' }, body,
});

test('only persisted exports are acknowledged, and receiver closure does not qualify them', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'boopstick-receiver-'));
  const bytes = Buffer.from(JSON.stringify(raw(), null, 2) + '\n');
  try {
    const receiver = await startReceiver({ attemptId, mode: 'defect', directory });
    try {
      assert.equal((await post(receiver, bytes, 'old-attempt')).status, 409);
      for (const mutate of [
        value => { value.subjects[1].key = 'body-subject'; },
        value => { value.subjects[1].key = 'unknown-subject'; },
        value => { value.subjects[1].mounted = false; },
        value => { value.subjects[1].extra = true; },
      ]) {
        const malformed = raw(); mutate(malformed);
        assert.equal((await post(receiver, JSON.stringify(malformed))).status, 422);
        assert.equal(existsSync(join(directory, 'defect-raw.json')), false);
      }
      assert.equal((await post(receiver, bytes)).status, 200);
      await receiver.body;
      assert.deepEqual(readFileSync(join(directory, 'defect-raw.json')), bytes);
      const pending = JSON.parse(readFileSync(join(directory, 'defect-pending.json')));
      assert.equal(pending.status, 'unqualified'); assert.equal(pending.attemptId, attemptId);
      assert.equal(pending.rawEvidence.sha256, hash(bytes));
      assert.equal((await post(receiver, bytes)).status, 409);
    } finally { await receiver.close(); }
    assert.equal(existsSync(join(directory, 'defect-receipt.json')), false);
    const failing = await startReceiver({ attemptId, mode: 'defect', directory: join(directory, 'missing') });
    try {
      assert.equal((await post(failing, bytes)).status, 500);
      await assert.rejects(failing.body, { code: 'ENOENT' });
    } finally { await failing.close(); }
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
