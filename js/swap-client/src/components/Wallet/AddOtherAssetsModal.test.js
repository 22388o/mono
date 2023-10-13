import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // For the "toBeInTheDocument" matcher
import { AddOtherAssetsModal } from './AddOtherAssetsModal';

describe('AddOtherAssetsModal component test', () => {
  it('renders component', async () => {

    const {container} = render(
      <AddOtherAssetsModal open={true} handleClose={() => {}} />
    );

    await waitFor(() => {
      expect(container).toMatchSnapshot();
    });
  });
});
