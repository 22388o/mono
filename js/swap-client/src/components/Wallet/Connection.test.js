import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // For the "toBeInTheDocument" matcher
import { ConnectionComponent } from './Connection';

describe('Connection component test', () => {
  it('renders component', async () => {

    const {container} = render(
      <ConnectionComponent />
    );

    await waitFor(() => {
      expect(container).toMatchSnapshot();
    });
  });
});
