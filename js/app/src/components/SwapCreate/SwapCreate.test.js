import { fireEvent, render } from '@testing-library/react';
import { SwapCreate } from './SwapCreate';

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ data: { amount: 12 } }),
  })
);

describe('SwapCreate test', () => {
  it('should work', () => {

    const { container } = render(
      <SwapCreate />
    );
    expect(container).toMatchSnapshot();

    const exchangeBtn = container.querySelector('.exchange');
    fireEvent.click(exchangeBtn);
    expect(container).toMatchSnapshot();
  })
  afterAll(() => jest.resetModules())
})
