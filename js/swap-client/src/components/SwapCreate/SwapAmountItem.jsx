import React from 'react';
import { Dropdown, Form } from 'semantic-ui-react';
import styles from '../styles/SwapCreate.module.css';

const friendOptions = [
  {
    key: 'btc',
    text: 'BTC',
    value: 'btc',
    image: { avatar: true, src: 'https://github.com/dapphub/trustwallet-assets/blob/master/blockchains/bitcoin/info/logo.png?raw=true' },
  },
  {
    key: 'eth',
    text: 'ETH',
    value: 'eth',
    image: { avatar: true, src: 'https://github.com/dapphub/trustwallet-assets/blob/master/blockchains/ethereum/info/logo.png?raw=true' },
  }
]

export const SwapAmountItem = ({coinType, amount, className, onAmountChange, unitPrice, onCoinTypeChange, limitOrder = true}) => {
  const links = {
    'btc': "https://github.com/dapphub/trustwallet-assets/blob/master/blockchains/bitcoin/info/logo.png?raw=true",
    'eth': "https://github.com/dapphub/trustwallet-assets/blob/master/blockchains/ethereum/info/logo.png?raw=true"
  };

  return <Form.Group widths='equal' className={className}>
    <Form.Field className={styles.swapAmountInput}>
      { limitOrder ? 
          <input className={styles.swapInput} type='number' onChange={onAmountChange}/>
        :
          <input className={styles.swapInput} type='number' value={amount} onChange={onAmountChange}/>
      }
      { unitPrice * amount > 0 ? <p className={styles.price}>${unitPrice * amount}</p> : ''}
    </Form.Field>
    <Form.Field className={styles.coinType}>
      <Dropdown
        className={styles.swapCoinSelect}
        floating
        fluid
        labeled
        button
        value={coinType}
        options={friendOptions}
        onChange={onCoinTypeChange}
      />
    </Form.Field>
  </Form.Group>
};