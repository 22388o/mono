import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // For the "toBeInTheDocument" matcher
import { ConnectWalletContainer } from './index';

describe('ConnectWalletContainer component test', () => {
  it('renders component', async () => {

    const {container} = render(
      <ConnectWalletContainer />
    );

    await waitFor(() => {
      expect(container).toMatchSnapshot();
    });
  });
});
