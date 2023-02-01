import React from 'react';
import { Button, Container, Grid, Icon } from 'semantic-ui-react';
import { useAppDispatch } from '../../hooks';
import { getStringFromDate, SWAP_STATUS } from '../../utils/helpers';
import styles from '../styles/HistoryItem.module.css'
import {
  setIndex, 
  setSwapId, 
  setSwapHash, 
  setSecretSeekerId, 
  setSecretHolderId, 
  setSecret, 
  setBase, 
  setQuote, 
  setSwapStatus,
  setCreatedDate, 
} from "../../slices/swapSlice";
import { cancelSwap } from '../../slices/historySlice';
import { useNavigate } from 'react-router-dom';

export const HistoryItem = ({ history, index, onShowDetails }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const onContinueSwap = (e) => {
    dispatch(setSwapStatus(history.status));
    dispatch(setBase(history.amountBase));
    dispatch(setQuote(history.amountQuote));
    dispatch(setSwapId(history.swapId));
    dispatch(setSecretSeekerId(history.secretSeekerId));
    dispatch(setSecretHolderId(history.secretHolderId));
    dispatch(setSecret(history.secret));
    dispatch(setSwapHash(history.swapHash));
    dispatch(setIndex(index));
    dispatch(setCreatedDate(history.createdDate));
    navigate('/swap');
  };

  const onCancelSwap = (e) => {
    e.stopPropagation();
    dispatch(cancelSwap(index));
  }
  
  return (
    <Grid.Row className={styles.itemContainer} onClick={e => onShowDetails(index)}>
      <Grid.Column width={1}>
        <Icon name="random" />
      </Grid.Column>
      <Grid.Column width={9}>
        <Grid.Row>
          { SWAP_STATUS[history.status] }
        </Grid.Row>
        <Grid.Row>
          { getStringFromDate(history.createdDate) }
        </Grid.Row>
        <Grid.Row>
          { history.amountBase + ' > ' + history.amountQuote }
        </Grid.Row>
      </Grid.Column>
      <Grid.Column width={5} className='right'>
        <Grid.Row>
          { history.amountBase }
        </Grid.Row>
        <Grid.Row>
          <Button secondary onClick={onCancelSwap} className={styles.cancelBtn}>
            Cancel
          </Button>
        </Grid.Row>
      </Grid.Column>
    </Grid.Row>
  );
};
