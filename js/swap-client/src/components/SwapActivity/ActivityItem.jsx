import React from 'react';
<<<<<<< HEAD
import { Button, Grid, Stack } from '@mui/material';
import { getStringFromDate, SWAP_STATUS } from '../../utils/helpers';
import styles from '../../styles/ActivityItem.module.css'
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import { activitiesStore } from '../../syncstore/activitiesstore';

export const ActivityItem = ({ activity, index, handleClick }) => {
  const link='https://ordinals.com/tx/' + activity.hash;
  
  const onCancelSwap = (e) => {
    e.stopPropagation();
    activitiesStore.dispatch({ type: 'CANCEL_SWAP', payload: index });
    if(activity.baseAsset === 'BTC') walletStore.dispatch({ type: 'ADD_NODE_BALANCE', payload: activity.baseQuantity });
    else if(activity.baseAsset === 'ETH') walletStore.dispatch({ type: 'ADD_WALLET_BALANCE', payload: activity.baseQuantity });
    else walletStore.dispatch({ type: 'ADD_NFT_BALANCE', payload: {type: activity.baseAsset, balance: 1} });
  }
  return (
    <Grid container direction='row' style={{marginTop:0}} className={styles['activity-item']} onClick={handleClick}>
      <Grid container item xs={7}>
        <Stack direction='row' spacing={1}>
          <RotateLeftIcon />
          <Stack direction='column' textAlign='left'>
            <span>{ SWAP_STATUS[activity.status] }</span>
            <span className='grey'>{ getStringFromDate(activity.createdDate) }</span>
            { activity.status === 4 && activity.hash.slice(0, 20) + '...'  }
          </Stack>
        </Stack>
      </Grid>
      <Grid item xs={5}>
        <Stack direction='column' textAlign='right'>
          <span>- {activity.baseQuantity.toFixed(5).replace(/[.,]0+$/ , "")} <span className='grey'>{activity.baseAsset.toLowerCase()}</span></span>
          <span>+ {activity.quoteQuantity.toFixed(5).replace(/[.,]0+$/ , "")} <span className='grey'>{activity.quoteAsset.toLowerCase()}</span></span>
          { activity.status < 4 && <span><Button onClick={onCancelSwap} className={styles['cancel-btn']}>
            Cancel
          </Button></span> }
        </Stack>
      </Grid>
    </Grid>
  )
=======
import { Button, Container, Grid, Icon } from 'semantic-ui-react';
import { useAppDispatch } from '../../hooks';
import { getStringFromDate, SWAP_STATUS } from '../../utils/helpers';
import styles from '../styles/ActivityItem.module.css'
import { cancelSwap } from '../../slices/activitiesSlice';
import { useNavigate } from 'react-router-dom';

export const ActivityItem = ({ activity, index, onShowDetails }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const onCancelSwap = (e) => {
    e.stopPropagation();
    dispatch(cancelSwap(index));
  }
  
  return (
    <Grid.Row className={styles.itemContainer} onClick={e => onShowDetails(index)}>
      <Grid.Column width={1}>
        <Icon name="random" />
      </Grid.Column>
      <Grid.Column width={10}>
        <Grid.Row>
          { SWAP_STATUS[activity.status] }
        </Grid.Row>
        <Grid.Row>
          { activity.baseQuantity + ' ' + 
          activity.baseAsset + ' > ' + 
          activity.quoteQuantity + ' ' + 
          activity.quoteAsset }
        </Grid.Row>
      </Grid.Column>
      <Grid.Column width={4} className='right'>
        <Grid.Row>
          { getStringFromDate(activity.createdDate) }
        </Grid.Row>
        <Grid.Row>
          { activity.status < 4 && <Button secondary onClick={onCancelSwap} className={styles.cancelBtn}>
            Cancel
          </Button> }
        </Grid.Row>
      </Grid.Column>
    </Grid.Row>
  );
>>>>>>> master
};
