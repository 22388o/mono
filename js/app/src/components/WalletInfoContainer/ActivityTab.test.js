import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // For the "toBeInTheDocument" matcher
import { ActivityTab } from './ActivityTab';

describe('ActivityTab component test', () => {
  it('renders component', async () => {

    const {container} = render(
      <ActivityTab />
    );

    await waitFor(() => {
      expect(container).toMatchSnapshot();
    });
  });
});
