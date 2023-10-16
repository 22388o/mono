import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // For the "toBeInTheDocument" matcher
import { SwapAmountItem } from './SwapAmountItem';

describe('CollectiblesModal component test', () => {
  it('renders coin component', () => {

    const onCoinTypeChange = jest.fn();

    const {container, getByText} = render(
      //coin-select
      <SwapAmountItem
        assetId={0}
        unitPrice={28000}
        amount={1000}
        availQty={1000}
        onAmountChange={() => {}}
        onCoinTypeChange={onCoinTypeChange}
      />
    );

    const coinSelectElement = container.querySelector('.coin-select');
    fireEvent.click(coinSelectElement);

    const modalHeader = getByText('Select Asset');

    expect(container).toMatchSnapshot();
    expect(modalHeader).toBeInTheDocument(); //when cointype select button is clicked, check if modal is opened
    
    const btcBtn = getByText('Bitcoin');
    fireEvent.click(btcBtn);

    expect(onCoinTypeChange).toHaveBeenCalled(); // when coin type is changed, check if the function is called
  });
});
