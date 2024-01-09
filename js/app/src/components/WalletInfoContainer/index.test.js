import React from 'react';
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // For the "toBeInTheDocument" matcher
import { WalletInfoContainer } from './index';


describe('WalletInfoContainer component test', () => {
  it('renders component', async () => {

    const {container} = render(
      <WalletInfoContainer show={true} setIsMinimized={() => {}} />
    );

    await waitFor(() => {
      expect(container).toMatchSnapshot();
    })
  });
});
