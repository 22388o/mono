import React from 'react';
import { Grid } from 'semantic-ui-react';
import styles from '../styles/wallet/WalletItem.module.css';

export const WalletItem = ({type}) => {
  return (
    <Grid.Row>
      <Grid.Column width={1} className={styles.logoIcon}>
        { 
          type === 'bitcoin' 
            ? <img className="ui avatar image" src="https://github.com/dapphub/trustwallet-assets/blob/master/blockchains/bitcoin/info/logo.png?raw=true" />
            : <img className="ui avatar image" src="https://github.com/dapphub/trustwallet-assets/blob/master/blockchains/ethereum/info/logo.png?raw=true" />
        }
      </Grid.Column>
      <Grid.Column width={8}>
        { type === 'bitcoin' ? 'Bitcoin' : 'Ethereum' }
      </Grid.Column>
      <Grid.Column width={6}>
        asdf
      </Grid.Column>
    </Grid.Row>
  );
}