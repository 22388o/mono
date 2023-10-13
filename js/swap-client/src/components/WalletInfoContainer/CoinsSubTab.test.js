import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // For the "toBeInTheDocument" matcher
import { CoinsSubTab } from './CoinsSubTab';

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ data: { amount: 12 } }),
  })
);


describe('CoinsSubTab component test', () => {
  it('renders component', () => {

    const {container} = render(
      <CoinsSubTab />
    );

    expect(container).toMatchSnapshot();
  });
});
