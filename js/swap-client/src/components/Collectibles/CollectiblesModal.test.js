import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // For the "toBeInTheDocument" matcher
import { CollectiblesModal } from './CollectiblesModal';

describe('CollectiblesModal component test', () => {
  it('renders component', () => {

    const {container} = render(
      <CollectiblesModal open={true} handleClose={() => {}} />
    );

    expect(container).toMatchSnapshot();
  });
});
