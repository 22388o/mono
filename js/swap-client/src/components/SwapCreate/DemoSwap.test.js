import { create, act } from 'react-test-renderer'
import configureStore from 'redux-mock-store'
import { DemoSwap } from './DemoSwap'

describe('DemoSwap test', () => {
  it('should work', () => {
    let tree
    let mockSwap = jest.fn();

    act(() => {
      tree = create(
          <DemoSwap
            mockSwap={mockSwap}
          />
      )
    })

    expect(tree).toMatchSnapshot()
  })
  afterAll(() => jest.resetModules())
})
