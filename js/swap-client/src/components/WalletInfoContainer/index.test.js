import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // For the "toBeInTheDocument" matcher
import { WalletInfoContainer } from './index';

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ data: { amount: 12 } }),
  })
);


describe('WalletInfoContainer component test', () => {
  it('renders component', () => {

    const {container} = render(
      <WalletInfoContainer show={true} setIsMinimized={() => {}} />
    );

    expect(container).toMatchSnapshot();
  });
});
