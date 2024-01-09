import { create, act } from 'react-test-renderer'
import App from './App';

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ data: { amount: 12 } }),
  })
);

describe('App test', () => {
  it('should work', () => {
    let tree

    act(() => {
      tree = create(
        <App />
      )
    })
    expect(tree).toMatchSnapshot()

  })
  afterAll(() => jest.resetModules())
})
