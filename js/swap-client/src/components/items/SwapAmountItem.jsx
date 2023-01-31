import React from 'react';
import { Form } from 'semantic-ui-react';
import styles from '../styles/SwapCreate.module.css';

export const SwapAmountItem = ({coinType, amount, amountToUSD, balance, className}) => {
  const links = {
    'BTC': "https://github.com/dapphub/trustwallet-assets/blob/master/blockchains/bitcoin/info/logo.png?raw=true",
    'ETH': "https://github.com/dapphub/trustwallet-assets/blob/master/blockchains/ethereum/info/logo.png?raw=true"
  };
  return <Form.Group widths='equal' className={className}>
    <Form.Field>
      <input className={styles.swapInput} type='text' value={amount} onChange={(e) => setBaseQuantity(e.target.value)}/>
    </Form.Field>
    <Form.Field className={styles.coinType}>
      <div className='ui inline dropdown'>
        <div className={styles.SwapFormText}>
          <img className="ui avatar image" src={links[coinType]} />
          {coinType}
        </div>
        {/* <i className="dropdown icon"></i> */}
        <div className="menu">
          <div className="item">
            <img className="ui avatar image" src={links[coinType]} />
            BTC
          </div>
          <div className="item">
            <img className="ui avatar image" src={links[coinType]} />
            ETH
          </div>
        </div>
      </div>
    </Form.Field>
  </Form.Group>
};