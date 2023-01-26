import React from 'react';
import { Grid } from 'semantic-ui-react';
import { SwapCreate } from './SwapCreate';
import { SwapHistory } from './SwapHistory/SwapHistory';
import { WalletComponent } from './Wallet/WalletComponent';
import { OrdersList } from './Orders/OrdersList';
import styles from './styles/SwapHome.module.css';

export const SwapHome = () => {
  return (
    <Grid className={styles.homeContainer} centered>
      <Grid.Column width={7} stretched>
        <Grid.Row centered>
          <WalletComponent />
        </Grid.Row>
        <Grid.Row>
          <SwapHistory />
        </Grid.Row>
      </Grid.Column>
      <Grid.Column width={7} stretched>
        <Grid.Row>
          <SwapCreate />
        </Grid.Row>
        {/* <Grid.Row>
          <OrdersList />
        </Grid.Row> */}
      </Grid.Column>
    </Grid>
  )
}