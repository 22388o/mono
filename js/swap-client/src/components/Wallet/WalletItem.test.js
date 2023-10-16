import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // For the "toBeInTheDocument" matcher
import { WalletItem } from './WalletItem';
import { WALLET_COINS } from '../../utils/constants';

describe('WalletItem component test', () => {
  it('Bitcoin-Taproot WalletItem renders', async () => {
    const {container} = render(
      <WalletItem
        item={WALLET_COINS[0]}
        setNodeModalOpen={() => {}} 
        setWalletModalOpen={() => {}} 
      />
    );

    await waitFor(() => { expect(container).toMatchSnapshot(); });
  });
  
  it('Ethereum WalletItem renders', async () => {
    const {container} = render(
      <WalletItem
        item={WALLET_COINS[1]}
        setNodeModalOpen={() => {}} 
        setWalletModalOpen={() => {}} 
      />
    );

    await waitFor(() => { expect(container).toMatchSnapshot(); });
  });

  it('Bitcoin-Lightning WalletItem renders', async () => {
    const {container} = render(
      <WalletItem
        item={WALLET_COINS[2]}
        setNodeModalOpen={() => {}} 
        setWalletModalOpen={() => {}} 
      />
    );

    await waitFor(() => { expect(container).toMatchSnapshot(); });
  });
});
