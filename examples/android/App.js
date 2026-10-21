import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {Dimensions, I18nManager, Linking, Pressable, Text, View, useWindowDimensions} from 'react-native';

const MODES = ['control-1', 'control-2', 'control-3', 'narrow', 'defect', 'repair'];
// Frozen authored geometry for this static specimen; host scenario owns the policy copy.
const BODY_WIDTH = 280;
const NARROW_BODY_WIDTH = 180;
const CORRECT_GAP = 16;
const DEFECT_EXTRA_GAP = 8;

function parseInvocation(url) {
  const match = typeof url === 'string' && url.length <= 1024 &&
    /^boopstick:\/\/capture\/?\?([^#]+)$/.exec(url);
  if (!match || match[1].split('&').some(pair => pair.split('=').length !== 2)) {
    throw new Error('invalid-invocation');
  }
  const query = new URLSearchParams(match[1]);
  const keys = Array.from(query.keys()).sort();
  if (keys.join(',') !== 'attemptId,mode,port' ||
      keys.some(key => query.getAll(key).length !== 1)) {
    throw new Error('invalid-invocation');
  }
  const port = query.get('port');
  const attemptId = query.get('attemptId');
  const mode = query.get('mode');
  if (!/^\d{1,5}$/.test(port) || Number(port) < 1 || Number(port) > 65535 ||
      !/^[A-Za-z0-9_-]{1,128}$/.test(attemptId) || !MODES.includes(mode)) {
    throw new Error('invalid-invocation');
  }
  return {port: Number(port), attemptId, mode};
}

function readEnvironment() {
  const {width, height, scale, fontScale} = Dimensions.get('window');
  if (![width, height, scale, fontScale].every(value => Number.isFinite(value) && value > 0)) {
    throw new Error('invalid-environment');
  }
  return {
    density: scale, fontScale, direction: I18nManager.isRTL ? 'rtl' : 'ltr',
    windowWidth: width, windowHeight: height,
  };
}

function measure(node, name, errors) {
  return new Promise(resolve => {
    let settled = false;
    const finish = (rect, reason) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (reason) errors.push(reason);
      resolve(rect);
    };
    const timer = setTimeout(() => finish(null, `${name}-timeout`), 750);
    if (!node || typeof node.measureInWindow !== 'function') {
      finish(null, `${name}-unavailable`);
      return;
    }
    try {
      node.measureInWindow((x, y, width, height) => {
        if (![x, y, width, height].every(Number.isFinite) || width < 0 || height < 0) {
          finish(null, `${name}-invalid-rect`);
          return;
        }
        finish({x, y, width, height});
      });
    } catch {
      finish(null, `${name}-measurement-failed`);
    }
  });
}

export default function App() {
  const [enabled, setEnabled] = useState(false);
  const [invocation, setInvocation] = useState(null);
  const [rootReady, setRootReady] = useState(false);
  const [bodyReady, setBodyReady] = useState(null);
  const [actionReady, setActionReady] = useState(null);
  const [phase, setPhase] = useState('idle');
  const rootRef = useRef(null);
  const bodyRef = useRef(null);
  const actionRef = useRef(null);
  const generation = useRef(0);
  const committed = useRef(null);
  const attempted = useRef(false);
  const alive = useRef(true);
  const transport = useRef(null);
  const window = useWindowDimensions();
  const direction = I18nManager.isRTL;

  // The real toggle applies each variant; URL selection alone does not apply it.
  const mode = invocation?.mode;
  const variantBodyWidth = mode === 'narrow' && enabled ? NARROW_BODY_WIDTH : BODY_WIDTH;
  const actionGap = mode === 'defect' && enabled ? CORRECT_GAP + DEFECT_EXTRA_GAP :
    mode === 'repair' && !enabled ? CORRECT_GAP + DEFECT_EXTRA_GAP : CORRECT_GAP;
  const bodyLayoutKey = `${invocation?.attemptId ?? 'unconfigured'}:${variantBodyWidth}`;
  const actionLayoutKey = `${bodyLayoutKey}:${actionGap}`;

  useLayoutEffect(() => {
    generation.current += 1;
    committed.current = {enabled, invocation, bodyLayoutKey, actionLayoutKey};
  }, [enabled, invocation, window.width, window.height, window.scale, window.fontScale, direction]);

  useEffect(() => {
    alive.current = true;
    Linking.getInitialURL().then(url => {
      if (!alive.current || url === null) return;
      try {
        setInvocation(parseInvocation(url));
      } catch {
        setPhase('invalid-invocation');
      }
    }, () => {
      if (alive.current) setPhase('invalid-invocation');
    });
    return () => {
      alive.current = false;
      generation.current += 1;
      transport.current?.abort();
    };
  }, []);

  const ready = Boolean(invocation && enabled && rootReady &&
    bodyReady === bodyLayoutKey && actionReady === actionLayoutKey);
  const status = phase !== 'idle' ? phase : !invocation ? 'waiting-invocation' :
    !enabled ? 'waiting-toggle' : ready ? 'ready' : 'waiting-layout';

  async function capture() {
    if (!ready || phase !== 'idle' || attempted.current) return;
    attempted.current = true;
    setPhase('measuring');
    let timeout;
    try {
      const stateBefore = committed.current;
      if (!stateBefore?.enabled || stateBefore.invocation !== invocation) {
        throw new Error('checkpoint-changed');
      }
      const startedAt = Date.now();
      const generationBefore = generation.current;
      const environmentBefore = readEnvironment();
      const rootNode = rootRef.current;
      const bodyNode = bodyRef.current;
      const actionNode = actionRef.current;
      const errors = [];
      const [root, body, action] = await Promise.all([
        measure(rootNode, 'root', errors),
        measure(bodyNode, 'body-subject', errors),
        measure(actionNode, 'action-subject', errors),
      ]);
      if (!alive.current) return;
      if (!committed.current?.enabled) throw new Error('checkpoint-changed');
      const environmentAfter = readEnvironment();
      const generationAfter = generation.current;
      const endedAt = Date.now();
      const unchanged = committed.current === stateBefore &&
        generationBefore === generationAfter && rootRef.current === rootNode &&
        bodyRef.current === bodyNode && actionRef.current === actionNode;
      const sameEnvironment = JSON.stringify(environmentBefore) === JSON.stringify(environmentAfter);
      if (!unchanged) errors.push('state-layout-or-ref-changed');
      if (!sameEnvironment) errors.push('environment-changed');
      // Steady records stable state/generation/ref/environment only; individual callback
      // failures stay honest in errors and their rectangles remain null.
      const steady = unchanged && sameEnvironment;
      const subjects = [
        {key: 'body-subject', mounted: bodyNode !== null, rect: body},
        {key: 'action-subject', mounted: actionNode !== null, rect: action},
      ];
      const payload = {
        attemptId: invocation.attemptId, mode: invocation.mode,
        checkpoint: 'after-toggle', state: 'on', startedAt, endedAt,
        generationBefore, generationAfter, environmentBefore, environmentAfter,
        root, subjects, steady, errors,
      };
      const encoded = JSON.stringify(payload);
      if (encoded.length > 64 * 1024) throw new Error('payload-too-large');
      const controller = new AbortController();
      transport.current = controller;
      timeout = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(
        `http://10.0.2.2:${invocation.port}/capture/${invocation.attemptId}`,
        {method: 'POST', headers: {'Content-Type': 'application/json'}, body: encoded, signal: controller.signal},
      );
      if (!response.ok) throw new Error('export-rejected');
      if (alive.current) setPhase('exported');
    } catch {
      if (alive.current) setPhase('failed');
    } finally {
      clearTimeout(timeout);
      transport.current = null;
    }
  }


  return (
    <View ref={rootRef} testID="specimen-root" collapsable={false}
      onLayout={() => { generation.current += 1; setRootReady(true); }}
      style={{flex: 1, padding: 24, backgroundColor: '#ffffff'}}>
      <Text style={{color: '#111111', fontSize: 20}}>Neutral Android specimen</Text>
      <View key={bodyLayoutKey} ref={bodyRef} testID="body-subject" collapsable={false}
        onLayout={() => {
          generation.current += 1;
          if (committed.current?.bodyLayoutKey === bodyLayoutKey) setBodyReady(bodyLayoutKey);
        }}
        style={{width: variantBodyWidth}}>
        <Text style={{color: '#111111', fontSize: 16, lineHeight: 22}}>
          A quiet path crosses the garden beside a stone wall. Small birds gather near
          the gate while the trees shade a wooden bench. The same fixed words remain
          visible when this body becomes narrower and the text naturally wraps.
        </Text>
      </View>
      {/* Layout keys require fresh variant-node layout, not a queued pre-toggle event.
          Unchanged controls retain their nodes and need no extra layout event.
          Measured container geometry only, not a hit-testing claim; button fills it. */}
      <View key={actionLayoutKey} ref={actionRef} testID="action-subject" collapsable={false}
        onLayout={() => {
          generation.current += 1;
          if (committed.current?.actionLayoutKey === actionLayoutKey) setActionReady(actionLayoutKey);
        }}
        style={{alignSelf: 'flex-start', marginTop: actionGap, width: 144, height: 48}}>
        <Pressable testID="toggle-button" accessibilityRole="button"
          accessibilityLabel="Toggle state" disabled={attempted.current}
          onPress={() => {
            if (attempted.current) return;
            if (mode === 'narrow') setBodyReady(null);
            if (['narrow', 'defect', 'repair'].includes(mode)) setActionReady(null);
            setEnabled(value => !value);
          }}
          style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e5e7eb'}}>
          <Text style={{color: '#111111'}}>Toggle state</Text>
        </Pressable>
      </View>
      <Text testID="state-label" style={{color: '#111111'}}>
        State: {enabled ? 'on' : 'off'}
      </Text>
      <Text testID="mode-label" style={{color: '#111111'}}>
        Mode: {invocation?.mode ?? 'unconfigured'}
      </Text>
      <Pressable testID="capture-button" accessibilityRole="button"
        accessibilityLabel="Capture measurements" disabled={status !== 'ready'}
        onPress={capture}
        style={{alignSelf: 'flex-start', marginTop: 16, padding: 16, backgroundColor: '#e5e7eb'}}>
        <Text style={{color: '#111111'}}>Capture measurements</Text>
      </Pressable>
      <Text testID="capture-status" style={{color: '#111111'}}>Capture: {status}</Text>
    </View>
  );
}
