import { create, act } from 'react-test-renderer'
import { ActivityDetailModal } from './ActivityDetailModal'

describe('ActivityDetailModal test', () => {
  let tree, handleClosefn;
  handleClosefn = jest.fn();
  it('should work', () => {
    act(() => {
      tree = create(
        <ActivityDetailModal
          handleClose={handleClosefn}
          open={false}
          activity={{
            tx: '1',
            paymentAddress: '123',
            status: 1,
            baseQuantity: 1,
            quoteQuantity: 1,
            baseAsset: 'BTC',
            quoteAsset: 'ETH',
            createdDate: {
              year: 2023,
              month: 9,
              year: 1
            },
            baseInfo: {
              inscription: '123',
              location: '123',
              explorer: '123'
            },
            quoteInfo: {
              inscription: '123',
              location: '123',
              explorer: '123'
            },
            hash: 'jva9sdzx',
            key: '123',

          }}
        />
      )
    })

    expect(tree).toMatchSnapshot()
  })
  afterAll(() => jest.resetModules())
})
