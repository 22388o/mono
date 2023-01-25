import React from 'react';
import { 
  Button, 
  Grid,
  Icon,
} from 'semantic-ui-react'
import styles from '../styles/WalletComponent.module.css'

export const WalletComponent = () => {
  return (
    <Grid className={styles.walletContainer}>
      <Grid.Row className={styles.walletHeader}>
        <h3>Wallet</h3>
        <span>
          <Button circular secondary className={styles.gradientBorder}><Icon name="arrow left" />Receive</Button>
          <Button circular secondary className={styles.gradientBorder}><Icon name="arrow right" className={styles.rightArrow} />&nbsp;Send</Button>
        </span>
      </Grid.Row>
    </Grid>
  );
}
