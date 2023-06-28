<<<<<<< HEAD
import React, { useEffect, useState, useSyncExternalStore } from 'react';
import RectangleRoundedIcon from '@mui/icons-material/RectangleRounded';
import { activitiesStore } from '../../syncstore/activitiesstore.js';
import { userStore } from '../../syncstore/userstore.js';
import { walletStore } from '../../syncstore/walletstore.js';

export const ConnectionComponent = () => {
  const user = useSyncExternalStore(userStore.subscribe, () => userStore.currentState);
  const activities = useSyncExternalStore(activitiesStore.subscribe, () => activitiesStore.currentState);
=======
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
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.user);
  const activities = useAppSelector(state => state.activities);
  const secret = useAppSelector(state => state.secret);
  const [loggedInUser, setLoggedInUser] = useState(null);
>>>>>>> master
  const [swapActivities, setSwapActivities] = useState(activities);
  const log = (message, obj, debug = true) => {
    if (debug) {
     console.log(message)
     console.log(obj)
    }
  }

  const logOut = () => {
<<<<<<< HEAD
    //dispatch(signOut());
    walletStore.dispatch({ type: 'CLEAR_NODE_DATA' });
    walletStore.dispatch({ type: 'CLEAR_WALLET_DATA' });
=======
    dispatch(signOut());
    dispatch(clearNodeData());
    dispatch(clearWalletData());
>>>>>>> master
    // return Promise.all([alice.disconnect(), bob.disconnect()]);
    return Promise.all([user.user.disconnect()])
  }


  useEffect(() => {
    setSwapActivities(activities);
  }, [activities])


  return (
<<<<<<< HEAD
    <h4 className='flex-center lightgreen'><RectangleRoundedIcon />&nbsp;All systems ok!</h4>
=======
    <Grid.Row className='space-between'>
      <Grid.Column >
        <h4><Icon name='stop' className={styles.allSystemOk}/>All systems ok!</h4>
      </Grid.Column>
    </Grid.Row>
>>>>>>> master
  );
}
