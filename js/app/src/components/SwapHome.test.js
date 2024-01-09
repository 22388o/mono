import { create, act } from 'react-test-renderer'
import { SwapHome } from './SwapHome';

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ data: { amount: 12 } }),
  })
);

describe('SwapHome test', () => {
  it('should work', () => {
    let tree

    act(() => {
      tree = create(
        <SwapHome />
      )
    })
    expect(tree).toMatchSnapshot()

  })
  afterAll(() => jest.resetModules())
})
