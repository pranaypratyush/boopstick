import React, {useState} from 'react';
import {Pressable, Text, View} from 'react-native';

export default function App() {
  const [enabled, setEnabled] = useState(false);
  return (
    <View testID="specimen-root" collapsable={false}
      style={{flex: 1, padding: 24, gap: 16, backgroundColor: '#ffffff'}}>
      <Text style={{color: '#111111', fontSize: 20}}>Neutral Android specimen</Text>
      <Text style={{color: '#111111'}}>Geometry subject</Text>
      <View testID="geometry-subject" collapsable={false}
        style={{width: 200.5, height: 48, backgroundColor: '#2563eb'}} />
      <Pressable testID="toggle-button" accessibilityRole="button"
        accessibilityLabel="Toggle state" onPress={() => setEnabled(value => !value)}
        style={{alignSelf: 'flex-start', padding: 16, backgroundColor: '#e5e7eb'}}>
        <Text style={{color: '#111111'}}>Toggle state</Text>
      </Pressable>
      <Text testID="state-label" style={{color: '#111111'}}>
        State: {enabled ? 'on' : 'off'}
      </Text>
    </View>
  );
}
