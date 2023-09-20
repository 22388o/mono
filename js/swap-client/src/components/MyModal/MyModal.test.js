import { create, act } from 'react-test-renderer'
import { MyModal } from './MyModal'

describe('MyModal test', () => {
  let tree
  it('should work', () => {
    act(() => {
      tree = create(
        <MyModal
          classme={null}
          children={null}
          open={false}
        />
      )
    })

    expect(tree).toMatchSnapshot()
  })
  afterAll(() => jest.resetModules())
})
