import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import { createServer, connect } from 'node:net';
import { existsSync, mkdirSync, mkdtempSync, openSync, closeSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { caseNames, modes, policy, hash, digest, sourceManifest, fixtureIdentity, collectorIdentity, acceptRunner } from './scenario.mjs';
import { startReceiver, collect, verifyReceipt } from './collector.mjs';

const [archive, archiveSha, apk, apkSha, sdkArgument, maestroArgument, ...extra] = process.argv.slice(2);
if (![archiveSha, apkSha].every(value => /^[a-f0-9]{64}$/.test(value ?? '')) || !sdkArgument || !maestroArgument || extra.length) throw new Error('Usage: node qualify.mjs <accepted.tgz> <archive-sha256> <built.apk> <apk-sha256> <installed-sdk> <private-maestro-bin>');
assert.equal(hash(readFileSync(resolve(archive))), archiveSha); assert.equal(hash(readFileSync(resolve(apk))), apkSha);
assert.equal(process.version, 'v24.21.0', 'Pinned Node runtime');
assert.ok(process.env.JAVA_HOME, 'Provide the existing approved JDK17 through JAVA_HOME');
const cwd = dirname(fileURLToPath(import.meta.url));
const root = mkdtempSync(join(tmpdir(), 'boopstick-native-qualification-'));
console.log(`Evidence: ${root}`);
const save = (name, value) => writeFileSync(join(root, name), `${JSON.stringify(value, null, 2)}\n`, { flag: 'wx' });
let diagnosticError;
const event = (type, details) => {
  try { appendFileSync(join(root, 'lifecycle.jsonl'), `${JSON.stringify({ at: new Date().toISOString(), monotonicNs: process.hrtime.bigint().toString(), type, ...details })}\n`); }
  catch (error) { diagnosticError ??= error; process.exitCode = 1; }
};
const sdk = resolve(sdkArgument), maestro = resolve(maestroArgument), adb = join(sdk, 'platform-tools/adb');
const source = sourceManifest();
const commands = [];
let serial, emulator, emulatorExit, receiver, port, baseline, binding;
let commandIndex = 0, maestroProcess, targetFault;
for (const name of ['avd-home', 'android-user', 'emulator-home', 'tmp', 'cache', 'home', 'runtime']) mkdirSync(join(root, name), { mode: 0o700 });
const env = { ...process.env, ANDROID_HOME: sdk, ANDROID_SDK_ROOT: sdk,
  ANDROID_AVD_HOME: join(root, 'avd-home'), ANDROID_USER_HOME: join(root, 'android-user'), ANDROID_EMULATOR_HOME: join(root, 'emulator-home'),
  TMPDIR: join(root, 'tmp'), XDG_CACHE_HOME: join(root, 'cache'), XDG_RUNTIME_DIR: join(root, 'runtime'),
  MAESTRO_CLI_NO_ANALYTICS: '1', MAESTRO_CLI_ANALYSIS_NOTIFICATION_DISABLED: 'true',
  JAVA_TOOL_OPTIONS: `-Duser.home=${join(root, 'home')} -Djava.io.tmpdir=${join(root, 'tmp')}` };
// Keep the existing shared ADB server/key home; only Maestro's Java user.home is owned.
async function run(command, args, { timeout = 20000, allowFailure = false, binary = false, group = false, childEnv = env, origin = 'operation' } = {}) {
  const id = String(++commandIndex).padStart(3, '0');
  const child = spawn(command, args, { env: childEnv, cwd, detached: group, stdio: ['ignore', 'pipe', 'pipe'] });
  if (group) maestroProcess = child;
  const chunks = [], errors = []; child.stdout.on('data', value => chunks.push(value)); child.stderr.on('data', value => errors.push(value));
  const record = { id, command, args, pid: child.pid, origin, startedAt: new Date().toISOString(), timeout };
  event('command-start', record);
  let expired = false;
  const kill = () => {
    event('kill-intent', { origin: 'command-deadline', id, pid: child.pid, group, signal: 'SIGKILL' });
    try { group ? process.kill(-child.pid, 'SIGKILL') : child.kill('SIGKILL'); } catch (error) { if (error.code !== 'ESRCH') throw error; }
  };
  const timer = setTimeout(() => { expired = true; kill(); }, timeout);
  let execution;
  try { execution = await new Promise((fulfill, reject) => {
    child.once('error', reject);
    child.once('close', (code, signal) => {
      const terminal = { code, signal, endedAt: new Date().toISOString() };
      event('command-end', { id, pid: child.pid, ...terminal }); fulfill(terminal);
    });
  }); }
  finally { clearTimeout(timer); if (group) maestroProcess = null; }
  const bytes = Buffer.concat(chunks); const stderr = Buffer.concat(errors).toString('utf8');
  writeFileSync(join(root, `${id}-stdout.${binary ? 'png' : 'log'}`), bytes, { flag: 'wx' }); writeFileSync(join(root, `${id}-stderr.log`), stderr, { flag: 'wx' });
  Object.assign(record, execution, { expired, stdoutFile: `${id}-stdout.${binary ? 'png' : 'log'}`, stderrFile: `${id}-stderr.log` }); commands.push(record);
  writeFileSync(join(root, 'commands.json'), `${JSON.stringify(commands, null, 2)}\n`);
  assert.equal(expired, false, 'Command deadline');
  if (!allowFailure) assert.equal(execution.code, 0, `${command} failed; see ${id} stderr`);
  return { ...record, bytes, stdout: bytes.toString('utf8'), stderr };
}
const device = (args, options) => run(adb, ['-s', serial, ...args], options);
const delay = ms => new Promise(fulfill => setTimeout(fulfill, ms));
async function available(number) {
  return new Promise(fulfill => { const server = createServer(); server.once('error', () => fulfill(false)); server.listen(number, '127.0.0.1', () => server.close(() => fulfill(true))); });
}
async function refused(number) {
  return new Promise(fulfill => { const socket = connect({ host: '127.0.0.1', port: number }); socket.setTimeout(1000); socket.once('connect', () => { socket.destroy(); fulfill(false); }); socket.once('error', error => fulfill(error.code === 'ECONNREFUSED')); socket.once('timeout', () => { socket.destroy(); fulfill(false); }); });
}
async function requireTarget(origin = 'target-check') {
  assert.ok(emulator && !emulatorExit, 'Owned emulator still running');
  assert.equal((await device(['get-state'], { timeout: 3000, origin })).stdout.trim(), 'device');
  assert.equal((await device(['emu', 'avd', 'name'], { timeout: 3000, origin })).stdout.trim(), `${avdName}\r\nOK`);
}
function processIdentity(pid) {
  try {
    const stat = readFileSync(`/proc/${pid}/stat`, 'utf8');
    const fields = stat.slice(stat.lastIndexOf(')') + 2).trim().split(/\s+/);
    return { pid, state: fields[0], startTicks: fields[19] };
  } catch (error) { return { pid, error: error.code ?? error.message }; }
}
async function observeContinuity(origin) {
  const filter = `( sport = :5037${port ? ` or sport = :${port} or sport = :${port + 1}` : ''} )`;
  const result = await run('ss', ['-ltnp', filter], { timeout: 2000, origin: 'passive-continuity' });
  const listeners = result.stdout.trim().split('\n').slice(1);
  const serverRows = listeners.filter(line => /:5037$/.test(line.trim().split(/\s+/)[3]));
  const serverPids = [...new Set(serverRows.flatMap(line => [...line.matchAll(/pid=(\d+)/g)].map(match => Number(match[1]))))];
  event('continuity', { origin, commandId: result.id, listeners, adbServers: serverPids.map(processIdentity), emulator: emulator ? processIdentity(emulator.pid) : null, emulatorExit: emulatorExit ?? null });
}
const avdName = `boopstick-native-${randomUUID().slice(0, 8)}`;
const summary = { root, node: process.version, source, archiveSha256: archiveSha, apkSha256: apkSha, policy, declaredCases: caseNames, status: 'not-complete', observations: [], controls: { oldAttempts: [], duplicates: [] } };
save('pre-execution.json', summary);
try {
  assert.equal((await run('hostname', [])).stdout.trim(), 'legion', 'Approved local host');
  const require = createRequire(import.meta.url);
  assert.equal(JSON.parse(readFileSync(require.resolve('vitest/package.json'))).version, '5.0.5');
  const installedEntry = fileURLToPath(import.meta.resolve('boopstick')); assert.ok(installedEntry.includes('/node_modules/boopstick/'));
  summary.externalComparator = { entry: installedEntry, sha256: hash(readFileSync(installedEntry)) };
  const version = await run(maestro, ['--version']); assert.equal(version.stdout.trim(), '2.11.0');
  const image = readFileSync(join(sdk, 'system-images/android-35/google_apis/x86_64/source.properties'), 'utf8');
  assert.match(image, /Pkg.Revision=9(?:\r?\n|$)/); assert.match(image, /SystemImage.Abi=x86_64/);
  summary.tools = { maestro: version.stdout.trim(), adb: (await run(adb, ['version'])).stdout, emulator: (await run(join(sdk, 'emulator/emulator'), ['-version'])).stdout, image };
  summary.tools.java = (await run(join(process.env.JAVA_HOME, 'bin/java'), ['-version'])).stderr;
  summary.tools.maestroExecutableSha256 = hash(readFileSync(maestro));
  assert.match(summary.tools.java, /version "17\./); assert.match(summary.tools.adb, /Version 37\.0\.1-/);
  assert.match(summary.tools.emulator, /Android emulator version 37\.1\.11\.0/);
  baseline = (await run(adb, ['devices', '-l'])).stdout; save('devices-before.json', { stdout: baseline });
  summary.originalAvds = (await run(join(sdk, 'emulator/emulator'), ['-list-avds'], { childEnv: process.env })).stdout;
  for (let candidate = 5580; candidate <= 5680; candidate += 2) if (await available(candidate) && await available(candidate + 1) && !baseline.includes(`emulator-${candidate}`)) { port = candidate; break; }
  assert.ok(port, 'Free explicit emulator port pair'); serial = `emulator-${port}`;
  await run(join(sdk, 'cmdline-tools/latest/bin/avdmanager'), ['create', 'avd', '--name', avdName, '--package', 'system-images;android-35;google_apis;x86_64', '--path', join(root, 'device.avd'), '--device', 'pixel_7'], { timeout: 30000 });
  assert.ok(existsSync(join(root, 'device.avd/config.ini')));
  // No -grpc flag: documented opt-in control service is unnecessary. JWT is defense in depth if a default service appears.
  const args = ['-avd', avdName, '-ports', `${port},${port + 1}`, '-grpc-use-jwt', '-no-metrics', '-no-window', '-no-snapshot', '-no-audio', '-camera-back', 'none', '-camera-front', 'none', '-cores', '2', '-memory', '2048', '-accel', 'on', '-gpu', 'swiftshader'];
  const logPath = join(root, 'emulator.log'), log = openSync(logPath, 'wx');
  emulator = spawn(join(sdk, 'emulator/emulator'), args, { env, stdio: ['ignore', log, log] }); closeSync(log);
  emulator.once('exit', (code, signal) => {
    emulatorExit = { code, signal, at: new Date().toISOString() };
    event('emulator-exit', { pid: emulator.pid, ...emulatorExit });
  });
  save('launch.json', { pid: emulator.pid, args, avdName, serial, env: Object.fromEntries(Object.entries(env).filter(([key]) => ['ANDROID_AVD_HOME', 'ANDROID_USER_HOME', 'ANDROID_EMULATOR_HOME', 'TMPDIR', 'XDG_CACHE_HOME', 'XDG_RUNTIME_DIR'].includes(key))) });
  const started = Date.now(); let booted = false;
  while (Date.now() - started < 300000 && !emulatorExit) {
    const bootLog = readFileSync(logPath, 'utf8');
    assert.ok(!/security:\s*Insecure|No gRPC protection active/.test(bootLog), 'Stop immediately on observed insecure control service');
    const socketRows = (await run('ss', ['-ltnp'], { timeout: 2000 })).stdout.split('\n').filter(line => line.includes(`pid=${emulator.pid},`));
    for (const line of socketRows) assert.match(line.trim().split(/\s+/)[3], /^(127\.0\.0\.1:|\[::1\]:)/, 'Stop on non-loopback owned listener');
    const result = await device(['shell', 'getprop', 'sys.boot_completed'], { allowFailure: true, timeout: Math.min(5000, 300000 - (Date.now() - started)) });
    if (result.code === 0 && result.stdout.trim() === '1') { booted = true; break; }
    await delay(Math.min(1000, Math.max(0, 300000 - (Date.now() - started))));
  }
  assert.ok(booted, 'One 300-second boot attempt; no retry'); summary.bootMs = Date.now() - started;
  await requireTarget('boot-ready');
  const listeners = (await run('ss', ['-ltnp'])).stdout;
  const ownedListeners = listeners.split('\n').filter(line => line.includes(`pid=${emulator.pid},`));
  const logText = readFileSync(logPath, 'utf8');
  save('control-endpoints.json', { ownedListeners, grpcLog: logText.split('\n').filter(line => /grpc|jwt|auth/i.test(line)) });
  summary.ownedTcpPorts = [...new Set(ownedListeners.map(line => Number(line.trim().split(/\s+/)[3].split(':').at(-1))))];
  assert.ok(!/security:\s*Insecure|No gRPC protection active/.test(logText), 'No insecure gRPC service');
  for (const line of ownedListeners) assert.match(line.trim().split(/\s+/)[3], /^(127\.0\.0\.1:|\[::1\]:)/, 'Owned TCP listener must be loopback-only');
  if (/Started GRPC server/.test(logText)) assert.match(logText, /JWT|jwt|security:\s*(Local|Token)/, 'Authentication evidence for any control service');
  assert.equal((await device(['shell', 'getprop', 'ro.product.cpu.abi'])).stdout.trim(), 'x86_64');
  assert.equal((await device(['shell', 'getprop', 'ro.build.version.sdk'])).stdout.trim(), '35');
  await device(['install', resolve(apk)], { timeout: 60000 });
  const activity = (await device(['shell', 'cmd', 'package', 'resolve-activity', '--brief', 'org.boopstick.specimen'])).stdout.trim().split('\n').at(-1);
  assert.equal(activity, 'org.boopstick.specimen/.MainActivity');
  // Explicit UID mode overrides package mode for this fresh owned fixture; never grant permissions.
  await device(['shell', 'cmd', 'appops', 'set', '--uid', 'org.boopstick.specimen', 'SYSTEM_ALERT_WINDOW', 'deny']);
  const overlay = await device(['shell', 'cmd', 'appops', 'get', 'org.boopstick.specimen', 'SYSTEM_ALERT_WINDOW']); assert.match(overlay.stdout, /Uid mode:\s*SYSTEM_ALERT_WINDOW:\s*deny/);
  save('overlay-denied.json', { stdout: overlay.stdout });
  const density = Number((await device(['shell', 'wm', 'density'])).stdout.match(/(?:Override|Physical) density: (\d+)/g)?.at(-1)?.match(/(\d+)$/)[1]) / 160;
  const fontValue = (await device(['shell', 'settings', 'get', 'system', 'font_scale'])).stdout.trim(); const fontScale = fontValue === 'null' ? 1 : Number(fontValue);
  assert.ok(Number.isFinite(density) && density >= 1 && Number.isFinite(fontScale) && fontScale > 0);
  binding = { runId: randomUUID(), artifactSha256: archiveSha, apkSha256: apkSha, fixture: fixtureIdentity(), collector: collectorIdentity(), environment: { platform: 'android-emulator', density, fontScale, direction: 'ltr' }, declarationSha256: digest({ policy, modes, caseNames }) };
  save('binding.json', binding);
  let previous;
  for (const mode of modes) {
    await requireTarget(`${mode}:before-launch`);
    const attemptId = randomUUID(); receiver = await startReceiver({ attemptId, mode, directory: root, timeoutMs: 90000 });
    if (previous) {
      const response = await fetch(`http://127.0.0.1:${receiver.port}/capture/${previous.attemptId}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: previous.bytes });
      summary.controls.oldAttempts.push({ oldAttemptId: previous.attemptId, currentAttemptId: attemptId, status: response.status, kind: 'actual prior device export bytes replayed by host' }); assert.equal(response.status, 409);
      const bodyResponse = await fetch(`http://127.0.0.1:${receiver.port}/capture/${attemptId}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: previous.bytes });
      Object.assign(summary.controls.oldAttempts.at(-1), { currentPathOldBodyStatus: bodyResponse.status });
      assert.equal(bodyResponse.status, 422, 'Old actual payload refused even on current route');
    }
    const url = `boopstick://capture?${new URLSearchParams({ port: String(receiver.port), attemptId, mode })}`;
    save(`${mode}-launch-url.json`, { attemptId, mode, url });
    await device(['shell', 'am', 'force-stop', 'org.boopstick.specimen']);
    await device(['shell', 'am', 'start', '-W', '-a', 'android.intent.action.VIEW', '-d', `'${url.replaceAll("'", "'\\''")}'`, '-n', activity], { timeout: 30000 });
    let checking = false;
    const guard = setInterval(async () => {
      if (checking || targetFault) return; checking = true;
      try { await requireTarget(`${mode}:poll`); } catch (error) {
        targetFault = error;
        if (maestroProcess) {
          event('kill-intent', { origin: `${mode}:target-guard`, pid: maestroProcess.pid, group: true, signal: 'SIGKILL' });
          try { process.kill(-maestroProcess.pid, 'SIGKILL'); } catch {}
        }
      }
      finally { checking = false; }
    }, 1000);
    try {
      await observeContinuity(`${mode}:before-driver`);
      await run(maestro, ['--device', serial, '--platform', 'android', 'test', '--format', 'JUNIT', '--output', join(root, `${mode}-maestro.xml`), '--test-output-dir', join(root, `${mode}-maestro`), '--debug-output', join(root, `${mode}-maestro-debug`), '-e', `MODE=${mode}`, '-e', `SCREENSHOT=${mode}-screen`, join(cwd, 'interaction.yaml')], { timeout: 120000, group: true });
    } finally { clearInterval(guard); }
    assert.equal(targetFault, undefined, 'Never retarget after loss'); await requireTarget(`${mode}:post-driver`);
    await observeContinuity(`${mode}:after-driver`);
    const observation = await receiver.body;
    await device(['shell', 'uiautomator', 'dump', `/data/local/tmp/boopstick-${mode}.xml`]);
    await device(['pull', `/data/local/tmp/boopstick-${mode}.xml`, join(root, `${mode}-ui.xml`)]);
    const ui = readFileSync(join(root, `${mode}-ui.xml`), 'utf8');
    assert.match(ui, /text="State: on"/); const subjectAbsent = !ui.includes('resource-id="geometry-subject"'); assert.equal(subjectAbsent, mode === 'absent');
    const receipt = collect({ ...observation, binding, attemptId, mode, directory: root, driver: { attemptId, state: 'on', subjectAbsent, uiEvidence: { ref: `${mode}-ui.xml`, sha256: hash(readFileSync(join(root, `${mode}-ui.xml`))) }, kind: 'Maestro 2.11.0 plus explicit-serial UI corroboration' } });
    const duplicate = await fetch(`http://127.0.0.1:${receiver.port}/capture/${attemptId}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: observation.bytes });
    summary.controls.duplicates.push({ attemptId, status: duplicate.status }); assert.equal(duplicate.status, 409);
    const receiverPort = receiver.port; await receiver.close(); receiver = null; assert.ok(await refused(receiverPort), 'Receiver closed');
    previous = { attemptId, bytes: observation.bytes }; summary.observations.push({ mode, attemptId, reportStatus: receipt.report.status, rawSha256: receipt.capture.rawEvidence[0].sha256 });
  }
  save('receiver-controls.json', summary.controls);
  const cli = join(dirname(require.resolve('vitest/package.json')), 'vitest.mjs');
  for (const selected of [true, false]) {
    const label = selected ? 'selected' : 'full'; mkdirSync(join(root, label));
    const result = await run(process.execPath, [cli, 'run', '--config', join(cwd, 'vitest.config.mjs'), ...(selected ? ['-t', '^valid width$'] : [])], { timeout: 60000, childEnv: { ...env, BOOPSTICK_NATIVE_EVIDENCE: root, BOOPSTICK_OUTPUT_DIR: join(root, label) } });
    const report = JSON.parse(readFileSync(join(root, label, 'runner.json')));
    if (selected) {
      // Vitest includes skipped registered siblings; retain the real report and prove full accounting refuses it.
      assert.throws(() => acceptRunner(report, result.code));
      const executed = report.testResults.flatMap(file => file.assertionResults).filter(row => row.status === 'passed'); assert.deepEqual(executed.map(row => row.title), ['valid width']);
      summary.selected = { feedbackPassed: true, fullAcceptance: 'refused' };
    } else {
      const rows = acceptRunner(report, result.code);
      for (const row of rows) assert.deepEqual(row.meta.native.binding, binding);
      summary.ordinaryCases = rows.length;
    }
  }
  for (const mode of modes) verifyReceipt(JSON.parse(readFileSync(join(root, `${mode}-receipt.json`))), binding, root);
  assert.deepEqual(sourceManifest(), source, 'No mid-campaign source mutation'); summary.status = 'qualified-bounded-native-path';
} catch (error) { summary.failure = error.stack; process.exitCode = 1; }
finally {
  event('cleanup-start', { failure: summary.failure ?? null });
  if (emulator) {
    try { await observeContinuity('before-cleanup'); }
    catch (error) { diagnosticError ??= error; process.exitCode = 1; }
  }
  if (receiver) await receiver.close();
  const cleanup = { sharedAdbStopped: false };
  if (emulator && !emulatorExit) {
    try {
      assert.equal(targetFault, undefined, 'Do not send device mutations after target loss');
      await requireTarget('cleanup');
      await device(['shell', 'am', 'force-stop', 'org.boopstick.specimen'], { timeout: 5000, allowFailure: true });
      await device(['emu', 'kill'], { timeout: 5000, allowFailure: true });
    } catch (error) {
      cleanup.error = error.message;
      event('kill-intent', { origin: 'cleanup-fallback', pid: emulator.pid, signal: 'SIGTERM' });
      emulator.kill('SIGTERM');
    }
    const started = Date.now(); while (!emulatorExit && Date.now() - started < 20000) await delay(200);
    if (!emulatorExit) {
      event('kill-intent', { origin: 'cleanup-wait', pid: emulator.pid, signal: 'SIGTERM' });
      emulator.kill('SIGTERM'); await delay(2000);
    }
    if (!emulatorExit) {
      event('kill-intent', { origin: 'cleanup-wait', pid: emulator.pid, signal: 'SIGKILL' });
      emulator.kill('SIGKILL'); await delay(1000);
    }
  }
  cleanup.emulatorExit = emulatorExit ?? null;
  cleanup.pid = emulator?.pid;
  if (port) cleanup.portsRefused = { [port]: await refused(port), [port + 1]: await refused(port + 1) };
  if (summary.ownedTcpPorts) cleanup.controlPortsRefused = Object.fromEntries(await Promise.all(summary.ownedTcpPorts.map(async number => [number, await refused(number)])));
  try {
    cleanup.devices = (await run(adb, ['devices', '-l'])).stdout;
    cleanup.originalAvds = (await run(join(sdk, 'emulator/emulator'), ['-list-avds'], { childEnv: process.env })).stdout;
    if (summary.originalAvds !== undefined) assert.equal(cleanup.originalAvds, summary.originalAvds);
    if (baseline !== undefined) {
      const unrelated = text => text.split('\n').filter(line => line.trim() && !line.startsWith('List of devices') && !line.startsWith(serial ?? 'never-owned')).sort();
      assert.deepEqual(unrelated(cleanup.devices), unrelated(baseline), 'Observed unrelated devices unchanged');
    }
    if (emulator) {
      assert.ok(emulatorExit, 'Owned emulator ended'); assert.ok(Object.values(cleanup.portsRefused).every(Boolean));
      assert.ok(Object.values(cleanup.controlPortsRefused ?? {}).every(Boolean), 'Owned control endpoints closed');
      try { process.kill(emulator.pid, 0); throw new Error('Owned PID still present'); } catch (error) { if (error.code !== 'ESRCH') throw error; }
    }
  } catch (error) { cleanup.failure = error.stack; summary.status = 'cleanup-failed'; process.exitCode = 1; }
  if (diagnosticError) {
    summary.diagnosticFailure = diagnosticError.stack;
    if (summary.status === 'qualified-bounded-native-path') summary.status = 'diagnostic-evidence-failed';
  }
  save('cleanup.json', cleanup); save('summary.json', summary); console.log(JSON.stringify({ root, status: summary.status, failure: summary.failure, cleanupFailure: cleanup.failure }));
}
