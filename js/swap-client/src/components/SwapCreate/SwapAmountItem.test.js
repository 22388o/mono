import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // For the "toBeInTheDocument" matcher
import { SwapAmountItem } from './SwapAmountItem';

describe('CollectiblesModal component test', () => {
  it('renders component', () => {

    const {container} = render(
      <SwapAmountItem assetId={0} handleClose={() => {}} />
    );

    expect(container).toMatchSnapshot();
  });
});
