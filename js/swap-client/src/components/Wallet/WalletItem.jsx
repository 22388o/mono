import React from 'react';
import { 
  Button, 
  Grid, 
  Icon 
} from 'semantic-ui-react';
import styles from '../styles/wallet/WalletItem.module.css';

export const WalletItem = ({type, item, onConnect}) => {
  return (
    <Grid.Row className='space-between'>
      <Grid.Column width={7} className={styles.logoIcon}>
        { 
          type === 'bitcoin' 
            ? <img className="ui avatar image" src="https://github.com/dapphub/trustwallet-assets/blob/master/blockchains/bitcoin/info/logo.png?raw=true" />
            : <img className="ui avatar image" src="https://github.com/dapphub/trustwallet-assets/blob/master/blockchains/ethereum/info/logo.png?raw=true" />
        }
        { type === 'bitcoin' ? 'Bitcoin' : 'Ethereum' }
      </Grid.Column>
      <Grid.Column width={7} className='align-right'>
        { !item.connected 
            ? <Button circular secondary className='gradient-btn' onClick={e => onConnect()}>Connect {item.title}</Button>
            : <h3>0.012 btc</h3>
        }
      </Grid.Column>
    </Grid.Row>
  );
}