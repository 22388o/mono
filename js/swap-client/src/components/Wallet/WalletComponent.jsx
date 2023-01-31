import React from 'react';
import { 
  Button, 
  Divider, 
  Grid,
  Icon,
} from 'semantic-ui-react'
import { WalletItem } from './WalletItem';
import styles from '../styles/wallet/WalletComponent.module.css';

export const WalletComponent = () => {
  return (
    <Grid className={styles.walletContainer}>
      <Grid.Row className={styles.walletHeader}>
        <h3>Funds</h3>
        { /*<span>
          <Button circular secondary className={styles.gradientBorder}><Icon name="arrow left" className={styles.leftArrow} />Receive</Button>
          <Button circular secondary className={styles.gradientBorder}><Icon name="arrow right" className={styles.rightArrow} />&nbsp;Send</Button>
        </span> */}
      </Grid.Row>
      <WalletItem type='bitcoin' connect='node' />
      <Divider />
      <WalletItem type='ethereum' connect='wallet' />
    </Grid>
  );
}
