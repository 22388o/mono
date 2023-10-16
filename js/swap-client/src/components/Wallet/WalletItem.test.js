import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // For the "toBeInTheDocument" matcher
import { WalletItem } from './WalletItem';

describe('WalletItem component test', () => {
  it('renders component', async () => {
    const item = {
      title: 'Bitcoin-Taproot',
      img_url: '',
      connected: false,
      balance: 1,
      type: 'BTC'
    };

    const {container} = render(
      <WalletItem
        item={item}
        setNodeModalOpen={() => {}} 
        setWalletModalOpen={() => {}} 
      />
    );

    await waitFor(() => {
      expect(container).toMatchSnapshot();
    });
  });
});
