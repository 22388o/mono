import { NFTCard } from './NFTCard';
import { create, act } from 'react-test-renderer';

describe('AccessOptionComponent', () => {
  it('should work', () => {
    let tree;
    let card = {
      img_url: '123',
      title: 'card'
    }
    let handleClick = jest.fn();

    act(() => {
      tree = create(
        <NFTCard 
          card={card} 
          handleClick={handleClick} />
      );
    });

    expect(tree).toMatchSnapshot();
  });
  afterAll(() => jest.resetModules());
});