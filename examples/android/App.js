import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {Dimensions, I18nManager, Linking, Pressable, Text, View, useWindowDimensions} from 'react-native';

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
      !/^[A-Za-z0-9_-]{1,128}$/.test(attemptId) ||
      !['valid', 'defect', 'repair', 'missing', 'absent'].includes(mode)) {
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
  const [subjectReady, setSubjectReady] = useState(false);
  const [phase, setPhase] = useState('idle');
  const rootRef = useRef(null);
  const subjectRef = useRef(null);
  const generation = useRef(0);
  const committed = useRef(null);
  const attempted = useRef(false);
  const alive = useRef(true);
  const transport = useRef(null);
  const window = useWindowDimensions();
  const direction = I18nManager.isRTL;

  useLayoutEffect(() => {
    generation.current += 1;
    committed.current = {enabled, invocation};
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

  const absent = invocation?.mode === 'absent';
  const ready = Boolean(invocation && enabled && rootReady && (absent || subjectReady));
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
      const subjectNode = subjectRef.current;
      const errors = [];
      const withheld = invocation.mode === 'missing';
      if (withheld) errors.push('subject-acquisition-withheld');
      const [root, subject] = await Promise.all([
        measure(rootNode, 'root', errors),
        absent || withheld ? Promise.resolve(null) : measure(subjectNode, 'subject', errors),
      ]);
      if (!alive.current) return;
      if (!committed.current?.enabled) throw new Error('checkpoint-changed');
      const environmentAfter = readEnvironment();
      const generationAfter = generation.current;
      const endedAt = Date.now();
      const subjectMounted = subjectRef.current !== null;
      const unchanged = committed.current === stateBefore &&
        generationBefore === generationAfter && rootRef.current === rootNode &&
        subjectRef.current === subjectNode;
      const sameEnvironment = JSON.stringify(environmentBefore) === JSON.stringify(environmentAfter);
      if (!unchanged) errors.push('state-layout-or-ref-changed');
      if (!sameEnvironment) errors.push('environment-changed');
      const steady = unchanged && sameEnvironment && root !== null &&
        (absent ? !subjectMounted : subjectMounted && (withheld || subject !== null)) &&
        errors.every(reason => reason === 'subject-acquisition-withheld');
      // Qualified only for this static fixture; callbacks are not a native transaction.
      const payload = {
        attemptId: invocation.attemptId, mode: invocation.mode,
        checkpoint: 'after-toggle', state: 'on', startedAt, endedAt,
        generationBefore, generationAfter, environmentBefore, environmentAfter,
        root, subject, subjectMounted, steady, errors,
      };
      const body = JSON.stringify(payload);
      if (body.length > 64 * 1024) throw new Error('payload-too-large');
      const controller = new AbortController();
      transport.current = controller;
      timeout = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(
        `http://10.0.2.2:${invocation.port}/capture/${invocation.attemptId}`,
        {method: 'POST', headers: {'Content-Type': 'application/json'}, body, signal: controller.signal},
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
      style={{flex: 1, padding: 24, gap: 16, backgroundColor: '#ffffff'}}>
      <Text style={{color: '#111111', fontSize: 20}}>Neutral Android specimen</Text>
      <Text style={{color: '#111111'}}>Geometry subject</Text>
      {!absent && <View ref={subjectRef} testID="geometry-subject" collapsable={false}
        onLayout={() => { generation.current += 1; setSubjectReady(true); }}
        style={{width: 200.5, height: invocation?.mode === 'defect' ? 47 : 48, backgroundColor: '#2563eb'}} />}
      <Pressable testID="toggle-button" accessibilityRole="button"
        accessibilityLabel="Toggle state" disabled={attempted.current}
        onPress={() => { if (!attempted.current) setEnabled(value => !value); }}
        style={{alignSelf: 'flex-start', padding: 16, backgroundColor: '#e5e7eb'}}>
        <Text style={{color: '#111111'}}>Toggle state</Text>
      </Pressable>
      <Text testID="state-label" style={{color: '#111111'}}>
        State: {enabled ? 'on' : 'off'}
      </Text>
      <Text testID="mode-label" style={{color: '#111111'}}>
        Mode: {invocation?.mode ?? 'unconfigured'}
      </Text>
      <Pressable testID="capture-button" accessibilityRole="button"
        accessibilityLabel="Capture measurements" disabled={status !== 'ready'}
        onPress={capture}
        style={{alignSelf: 'flex-start', padding: 16, backgroundColor: '#e5e7eb'}}>
        <Text style={{color: '#111111'}}>Capture measurements</Text>
      </Pressable>
      <Text testID="capture-status" style={{color: '#111111'}}>Capture: {status}</Text>
    </View>
  );
}
