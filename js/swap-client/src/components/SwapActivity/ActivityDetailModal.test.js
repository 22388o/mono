import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // For the "toBeInTheDocument" matcher
import { ActivityDetailModal } from './ActivityDetailModal'

describe('CollectiblesModal component test', () => {
  it('renders component', () => {

    const {container} = render(
      <ActivityDetailModal
          handleClose={() => {}}
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
    );

    expect(container).toMatchSnapshot();
  });
});
