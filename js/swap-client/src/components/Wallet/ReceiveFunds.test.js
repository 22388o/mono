import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // For the "toBeInTheDocument" matcher
import { ReceiveFunds } from './ReceiveFunds';

describe('ReceiveFunds component test', () => {
  it('renders component', async () => {

    const {container} = render(
      <ReceiveFunds />
    );

    await waitFor(() => {
      expect(container).toMatchSnapshot();
    });
  });
});
