import { create, act } from 'react-test-renderer'
import { Swap } from './Swap';

describe('Swap test', () => {
  it('should work', () => {
    let tree

    act(() => {
      tree = create(
          <Swap
          />
      )
    })

    expect(tree).toMatchSnapshot()
  })
  afterAll(() => jest.resetModules())
})
