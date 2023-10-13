import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // For the "toBeInTheDocument" matcher
import { AssetsTab } from './AssetsTab';

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ data: { amount: 12 } }),
  })
);
describe('AssetsTab component test', () => {
  it('renders component', async () => {

    const { container, getByText, asFragment } = render(
      <AssetsTab />
    );

    await waitFor(() => {
      expect(container).toMatchSnapshot();

      const collectiblesTab = getByText('Collectibles');
      fireEvent.click(collectiblesTab);
      
      expect(collectiblesTab).toBeInTheDocument();
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
