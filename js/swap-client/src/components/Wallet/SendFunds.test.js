import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // For the "toBeInTheDocument" matcher
import { SendFunds } from './SendFunds';

describe('SendFunds component test', () => {
  it('renders component', async () => {

    const {container} = render(
      <SendFunds />
    );

    await waitFor(() => {
      expect(container).toMatchSnapshot();
    });
  });
});
