import React, { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import RectangleRoundedIcon from '@mui/icons-material/RectangleRounded';
//import { activitiesStore } from '../../syncstore/activitiesstore.js';
import { userStore } from '../../syncstore/userstore.js';
import { walletStore } from '../../syncstore/walletstore.js';
import { IndexedDB } from '@portaldefi/sdk';

export const ConnectionComponent = () => {
  const user = useSyncExternalStore(userStore.subscribe, () => userStore.currentState);
  const activities = useSyncExternalStore(IndexedDB.subscribe, IndexedDB.getAllActivities);
  const [swapActivities, setSwapActivities] = useState(activities);

  const logOut = useCallback(() => {
    // dispatch(signOut());
    walletStore.dispatch({ type: 'CLEAR_NODE_DATA' })
    walletStore.dispatch({ type: 'CLEAR_WALLET_DATA' })
    // return Promise.all([alice.stop(), bob.stop()]);
    return //Promise.all([user.user.stop()])
  }, [walletStore])

  useEffect(() => {
    setSwapActivities(activities);
  }, [activities])


  return (
    <h4 className='flex-center lightgreen'><RectangleRoundedIcon />&nbsp;All systems ok!</h4>
  );
}
