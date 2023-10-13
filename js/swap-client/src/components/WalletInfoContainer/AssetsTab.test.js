import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // For the "toBeInTheDocument" matcher
import { AssetsTab } from './AssetsTab';

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ data: { amount: 12 } }),
  })
);
describe('AssetsTab component test', () => {
  it('renders component', async () => {

    const {container} = render(
      <AssetsTab />
    );

    await waitFor(() => {
      expect(container).toMatchSnapshot();
    });
  });
});
