const React = require('react');
const { Pressable, Text, View } = require('react-native');

// The event size is supplied by the test, not measured by a native renderer.
module.exports = function SizeToggle({ onSuppliedLayout }) {
  const [enabled, setEnabled] = React.useState(false);
  const [suppliedWidth, setSuppliedWidth] = React.useState(null);
  return React.createElement(
    View,
    {
      testID: 'sample-panel',
      onLayout: event => {
        const layout = event.nativeEvent.layout;
        setSuppliedWidth(layout.width);
        onSuppliedLayout?.(layout);
      },
    },
    React.createElement(
      Pressable,
      {
        accessibilityRole: 'button',
        accessibilityLabel: 'Toggle option',
        accessibilityState: { selected: enabled },
        onPress: () => setEnabled(value => !value),
      },
      React.createElement(Text, null, 'Toggle option'),
    ),
    React.createElement(Text, { testID: 'option-state' }, enabled ? 'Enabled' : 'Disabled'),
    React.createElement(
      Text,
      { testID: 'supplied-size' },
      suppliedWidth === null ? 'No supplied size' : `Synthetic width: ${suppliedWidth}`,
    ),
  );
};
