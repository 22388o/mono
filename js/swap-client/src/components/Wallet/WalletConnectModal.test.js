import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // For the "toBeInTheDocument" matcher
import { WalletConnectModal } from './WalletConnectModal';

describe('WalletConnectModal component test', () => {
  it('renders component', async () => {

    const {container} = render(
      <WalletConnectModal open={true} handleClose={() => {}} />
    );

    await waitFor(() => {
      expect(container).toMatchSnapshot();
    });
  });
});
