import { NFTCard } from './NFTCard'
import { fireEvent, render } from '@testing-library/react'

describe('AccessOptionComponent', () => {
  it('should work', () => {
    const card = {
      img_url: '123',
      title: 'card',
      info: {
        inscription: '123512341234jaspdofijaos'
      }
    }
    const handleClick = jest.fn()

    const { container } = render(
      <NFTCard
        card={card}
        handleClick={handleClick}
      />
    )

    const nftCard = container.querySelector('.nft-card');
    fireEvent.click(nftCard);

    expect(container).toMatchSnapshot()
    expect(handleClick).toHaveBeenCalled();
  })
  afterAll(() => jest.resetModules())
})
