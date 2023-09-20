import { NFTCard } from './NFTCard'
import { create, act } from 'react-test-renderer'

describe('AccessOptionComponent', () => {
  it('should work', () => {
    let tree
    const card = {
      img_url: '123',
      title: 'card',
      info: {
        inscription: '123512341234jaspdofijaos'
      }
    }
    const handleClick = jest.fn()

    act(() => {
      tree = create(
        <NFTCard
          card={card}
          handleClick={handleClick}
        />
      )
    })

    expect(tree).toMatchSnapshot()
  })
  afterAll(() => jest.resetModules())
})
