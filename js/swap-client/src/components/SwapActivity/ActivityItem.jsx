import React from 'react';
import { Button, Grid, Stack } from '@mui/material';
import { getStringFromDate, SWAP_STATUS } from '../../utils/helpers';
import styles from '../../styles/ActivityItem.module.css'
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import { activitiesStore } from '../../syncstore/activitiesstore';

export const ActivityItem = ({ activity, index, handleClick }) => {
  const link='https://bscscan.com/address/' + activity.hash;
  
  const onCancelSwap = (e) => {
    e.stopPropagation();
    activitiesStore.dispatch({ type: 'CANCEL_SWAP', payload: index });
    if(activity.baseAsset === 'BTC') walletStore.dispatch({ type: 'ADD_NODE_BALANCE', payload: activity.baseQuantity });
    else if(activity.baseAsset === 'ETH') walletStore.dispatch({ type: 'ADD_WALLET_BALANCE', payload: activity.baseQuantity });
    else walletStore.dispatch({ type: 'ADD_NFT_BALANCE', payload: {type: activity.baseAsset, balance: 1} });
  }
  return (
    <Grid container direction='row' style={{marginTop:0}} className={styles['activity-item']} onClick={handleClick}>
      <Grid container item xs={8}>
        <Stack direction='row' spacing={1}>
          <RotateLeftIcon />
          <Stack direction='column' textAlign='left'>
            <span>{ SWAP_STATUS[activity.status] }</span>
            <span className='grey'>{ getStringFromDate(activity.createdDate) }</span>
            { activity.status === 4 && <a href={link}>{ activity.hash.slice(0, 20) + '...' }</a> }
          </Stack>
        </Stack>
      </Grid>
      <Grid item xs={4}>
        <Stack direction='column' textAlign='right'>
          <span>- {activity.baseQuantity.toFixed(2)} <span className='grey'>{activity.baseAsset.toLowerCase()}</span></span>
          <span>+ {activity.quoteQuantity.toFixed(2)} <span className='grey'>{activity.quoteAsset.toLowerCase()}</span></span>
          { activity.status < 4 && <span><Button onClick={onCancelSwap} className={styles['cancel-btn']}>
            Cancel
          </Button></span> }
        </Stack>
      </Grid>
    </Grid>
  )
};
