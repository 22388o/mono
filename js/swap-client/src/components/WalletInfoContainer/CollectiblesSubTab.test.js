import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // For the "toBeInTheDocument" matcher
import { CollectiblesSubTab } from './CollectiblesSubTab';

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ data: { amount: 12 } }),
  })
);


describe('CollectiblesSubTab component test', () => {
  it('renders component', async () => {

    const {container} = render(
      <CollectiblesSubTab />
    );

    await waitFor(() => {
      expect(container).toMatchSnapshot();
    })
  });
});
