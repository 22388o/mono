import React from 'react';
import { Button, Grid, Icon } from 'semantic-ui-react';
import { useAppDispatch } from '../../hooks';
import { getStringFromDate, SWAP_STATUS } from '../../utils/helpers';
import styles from '../styles/ActivityItem.module.css'
import { cancelSwap } from '../../slices/activitiesSlice';

export const ActivityItem = ({ activity, index, onShowDetails }) => {
  const dispatch = useAppDispatch();
  
  const onCancelSwap = (e) => {
    e.stopPropagation();
    dispatch(cancelSwap(index));
  }
  
  return (
    <Grid.Row className={styles.itemContainer} onClick={e => onShowDetails(index)}>
      <Grid.Column width={1}>
        <Icon name="random" />
      </Grid.Column>
      <Grid.Column width={8}>
        <Grid.Row>
          { SWAP_STATUS[activity.status] }
        </Grid.Row>
        <Grid.Row>
          { getStringFromDate(activity.createdDate) }
        </Grid.Row>
        { /* <Grid.Row>
          { activity.baseQuantity + ' ' + 
          activity.baseAsset + ' > ' + 
          activity.quoteQuantity + ' ' + 
          activity.quoteAsset }
        </Grid.Row> */ }
      </Grid.Column>
      <Grid.Column width={6} className={styles['swap-amount']}>
        { /* <Grid.Row>
          { getStringFromDate(activity.createdDate) }
        </Grid.Row> */ }
        <Grid.Row textAlign='right'>{activity.baseQuantity.toFixed(2) + ' ' + activity.baseAsset}</Grid.Row>
        <Grid.Row textAlign='right'>{activity.quoteQuantity.toFixed(2) + ' ' + activity.quoteAsset}</Grid.Row>
        <Grid.Row>
          { activity.status < 4 && <Button secondary onClick={onCancelSwap} className={styles['cancel-btn']}>
            Cancel
          </Button> }
        </Grid.Row>
      </Grid.Column>
    </Grid.Row>
  );
};
