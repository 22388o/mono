import { fireEvent, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SwapAmountItem } from './SwapAmountItem';

describe('SwapAmountItem component test', () => {
  it('renders component', () => {
    const onCoinTypeChange = jest.fn();
    const { container } = render(
      <SwapAmountItem
        assetId={0}
        unitPrice={28000}
        amount={1000}
        availQty={1000}
        onAmountChange={onCoinTypeChange}
      />
    );

    expect(container).toMatchSnapshot();

    const qtyInput = container.querySelector('.qty-input');
    fireEvent.change(qtyInput, { target: {value: 10 }});
    expect(qtyInput.value).toBe("1000");
    expect(onCoinTypeChange).toHaveBeenCalled();

    fireEvent.keyDown(qtyInput, {
      key: "A",
      code: "A"
    })
  });

});
