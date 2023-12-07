import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // For the "toBeInTheDocument" matcher
import { CollectiblesModal } from './CollectiblesModal';

describe('CollectiblesModal component test', () => {
  it('renders component', () => {

    const {container} = render(
      <CollectiblesModal open={true} handleClose={() => {}} />
    );

    expect(container).toMatchSnapshot();
  });

  it('renders component', () => {

    const {getByText} = render(
      <CollectiblesModal open={true} handleClose={() => {}} />
    );

    const addCustomBtn = getByText('+ Add Custom Ordinal');
    fireEvent.click(addCustomBtn);

    const customHeader = getByText('Add Custom Ordinal');
    expect(customHeader).toBeInTheDocument();
  });
});
