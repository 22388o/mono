import React from 'react';
import { 
  Button, 
  Grid, 
  Icon 
} from 'semantic-ui-react';
import styles from '../styles/wallet/WalletItem.module.css';

export const WalletItem = ({type, connect, onConnect}) => {
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
        { connect === 'node' 
            ? <Button circular secondary className='gradient-btn' onClick={e => onConnect()}>Connect Node</Button>
            : <Button circular secondary className='gradient-btn' onClick={e => onConnect()}>Connect Wallet</Button>
        }
      </Grid.Column>
    </Grid.Row>
  );
}