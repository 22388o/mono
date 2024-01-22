import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WalletInfoContainer } from './index';


describe('WalletInfoContainer component test', () => {
  it('renders component', async () => {

    const {container} = render(
      <WalletInfoContainer show={true} setIsMinimized={() => {}} />
    );

    expect(container).toMatchSnapshot();
  });
});
