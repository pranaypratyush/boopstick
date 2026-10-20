import { writeFileSync } from 'node:fs';
import { compare, canonicalReport } from 'boopstick';
import { binding, candidate, digest, fixture, hash, makeRequest, requireCurrent, requireOrigin, runId } from './scenario.mjs';
import { readFileSync } from 'node:fs';

export async function openSpecimen(page, variant, mode = 'normal', checkpoint = 'enabled') {
  const parameters = new URLSearchParams({ mode, runId, candidate, fixture: fixture.sha256, checkpoint, variant: variant.name });
  await page.goto(`/?${parameters}`);
  await page.evaluate(() => {
    window.observationMutations = new MutationObserver(() => {});
    window.observationMutations.observe(document.getElementById('specimen'), { attributes: true, childList: true, characterData: true, subtree: true });
  });
}

export async function acquire(page, testInfo, variant, label, { incomplete = false, presence = false, checkpoint = 'enabled', state = 'enabled' } = {}) {
  await page.evaluate(() => document.fonts.ready);
  const raw = await page.evaluate(({ incomplete }) => {
    const startedAt = Date.now();
    const roots = [...document.querySelectorAll('#specimen')];
    if (roots.length !== 1) throw new Error('Exactly one specimen root required');
    const root = roots[0];
    const rect = element => {
      const { x, y, width, height } = element.getBoundingClientRect();
      return { x, y, width, height };
    };
    const items = incomplete ? [] : [...root.querySelectorAll('[data-observation]')].map(element => ({
      key: element.getAttribute('data-observation'), connected: element.isConnected,
      rect: rect(element), transform: getComputedStyle(element).transform,
    }));
    return {
      startedAt, runId: root.dataset.runId, candidate: root.dataset.candidate,
      fixture: root.dataset.fixture, variant: root.dataset.variant, checkpoint: root.dataset.checkpoint,
      state: root.dataset.state, pressed: document.getElementById('toggle').getAttribute('aria-pressed'),
      rootRect: rect(root), items, complete: !incomplete,
      viewport: { width: innerWidth, height: innerHeight }, density: devicePixelRatio,
      direction: getComputedStyle(root).direction, fontSize: getComputedStyle(root).fontSize,
      readyState: document.readyState, fontsStatus: document.fonts.status,
      scroll: { x: scrollX, y: scrollY }, animations: document.getAnimations().length,
      mutationRecords: window.observationMutations.takeRecords().map(record => ({ type: record.type, attribute: record.attributeName })),
      overlay: Boolean(document.getElementById('overlay')),
      endedAt: Date.now(),
    };
  }, { incomplete });
  const rawBytes = Buffer.from(`${JSON.stringify(raw, null, 2)}\n`);
  writeFileSync(testInfo.outputPath(`${label}-raw.json`), rawBytes, { flag: 'wx' });
  if (raw.items.some(item => item.key !== 'panel' || !item.connected) || raw.items.length > 1) throw new Error('Malformed or duplicate observation identity');
  if (raw.state !== state || raw.pressed !== String(state === 'enabled')) throw new Error('Wrong interaction checkpoint');
  if (digest(raw.viewport) !== digest(variant.viewport) || raw.density !== 1 || raw.direction !== 'ltr' || raw.fontSize !== '16px') throw new Error('Wrong browser environment');
  if (raw.readyState !== 'complete' || raw.fontsStatus !== 'loaded' || raw.scroll.x !== 0 || raw.scroll.y !== 0 || raw.animations || raw.items.some(item => item.transform !== 'none')) throw new Error('Static specimen envelope not ready');
  requireOrigin(raw);
  const request = makeRequest(variant, presence);
  request.scenario.checkpoint = checkpoint;
  const currentBinding = { ...binding(variant.name), checkpoint };
  const reference = { key: 'panel', kind: 'layout', provider: 'web-dom-border-box' };
  const capture = {
    schemaVersion: 2, contractVersion: '3.1', captureId: `${runId}:${testInfo.testId}:${label}`,
    origin: 'live', provider: 'web-dom-border-box',
    collector: { id: 'bounded-static-dom', sha256: hash(readFileSync(new URL('./acquire.mjs', import.meta.url))) },
    scenario: { ...request.scenario }, candidate: { buildId: raw.candidate }, fixture: { id: fixture.id, sha256: raw.fixture },
    environment: { platform: 'browser-chromium', density: raw.density, fontScale: 1, direction: raw.direction },
    epoch: { id: `${runId}:${testInfo.testId}:${label}`, startedAt: raw.startedAt, endedAt: raw.endedAt, steady: true },
    coverage: [{ scope: 'panel-scope', requested: [reference], observed: raw.items.map(() => reference), complete: raw.complete, qualified: raw.complete }],
    elements: raw.items.map(item => ({ ...reference, frame: 'window', unit: 'logical-px', spaceId: `viewport:${variant.name}`, rect: item.rect })),
    rawEvidence: [{ ref: `${label}-raw.json`, sha256: hash(rawBytes) }],
  };
  const report = JSON.parse(canonicalReport(compare(request, capture)));
  const receipt = { binding: currentBinding, browserVersion: page.context().browser().version(), raw, request, capture, report };
  writeFileSync(testInfo.outputPath(`${label}-receipt.json`), `${JSON.stringify(receipt, null, 2)}\n`, { flag: 'wx' });
  requireCurrent(receipt, currentBinding, testInfo.outputDir);
  await testInfo.attach(label, { path: testInfo.outputPath(`${label}-receipt.json`), contentType: 'application/json' });
  return receipt;
}
