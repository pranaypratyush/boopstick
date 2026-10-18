import React from 'react';
import { expect, jest, test } from '@jest/globals';
import { fireEvent, render, userEvent } from '@testing-library/react-native';
import SizeToggle from './SizeToggle.cjs';

test('behavior: user toggles an option with independent initial state', async () => {
  const view = await render(React.createElement(SizeToggle));
  const user = userEvent.setup();
  expect(view.getByTestId('option-state')).toHaveTextContent('Disabled');
  await user.press(view.getByRole('button', { name: 'Toggle option' }));
  expect(view.getByTestId('option-state')).toHaveTextContent('Enabled');
  await user.press(view.getByRole('button', { name: 'Toggle option' }));
  expect(view.getByTestId('option-state')).toHaveTextContent('Disabled');
});

test('behavior: a supplied synthetic layout event changes the size response', async () => {
  const onSuppliedLayout = jest.fn();
  const view = await render(React.createElement(SizeToggle, { onSuppliedLayout }));
  expect(view.getByTestId('supplied-size')).toHaveTextContent('No supplied size');
  const supplied = { x: 0, y: 0, width: 120, height: 40 };
  await fireEvent.layout(view.getByTestId('sample-panel'), supplied);
  expect(onSuppliedLayout).toHaveBeenCalledWith(supplied);
  expect(view.getByTestId('supplied-size')).toHaveTextContent('Synthetic width: 120');
});
