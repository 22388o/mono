import { fireEvent, render } from '@testing-library/react';
import { SwapCreate } from './SwapCreate';

Object.defineProperty(global.self, "crypto", {
  value: {
    getRandomValues: (arr) => "123123123",
    subtle: {
      digest: (algorithm, data) => {
        return new Promise((resolve, reject) =>
          resolve(
            "123123"
          )
        );
      },
    },
  },
});

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

  it('should call handler when input', () => {

    const { container } = render(
      <SwapCreate />
    );

    const inputs = container.querySelectorAll('.qty-input');
    fireEvent.change(inputs[0], { target: {value: "1235"} });
    expect(inputs[0].value).toBe("1235");
    fireEvent.change(inputs[1], { target: {value: "123"} });
    expect(inputs[1].value).toBe("123");
    const swapBtn = container.querySelector('.gradient-btn');
    fireEvent.click(swapBtn);

    fireEvent.change(inputs[0], { target: {value: "12"} });
    expect(inputs[0].value).toBe("12");
    fireEvent.click(swapBtn);
  })
  afterAll(() => jest.resetModules())
})
