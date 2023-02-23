import React, { useEffect, useState } from 'react';
import {
  Button,
  Grid,
  Icon
} from 'semantic-ui-react';
import { useAppDispatch, useAppSelector } from "../../hooks.js";
import { signIn, signOut } from '../../slices/userSlice.js';
import { clearNodeData, clearWalletData } from '../../slices/walletSlice';
import styles from '../styles/SwapHome.module.css';

export const ConnectionComponent = () => {


  return (
    <Grid.Row className='space-between'>
      <Grid.Column >
        <h4><Icon name='stop' className={styles.allSystemOk}/>All systems ok!</h4>
      </Grid.Column>
    </Grid.Row>
  );
}
