import React from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { 
  Button, 
  Icon,
  Grid,
  Divider, 
  Modal
} from 'semantic-ui-react'
import { useNavigate } from 'react-router-dom';
import { HistoryItem } from './HistoryItem';
import { useState } from 'react';
import styles from '../styles/SwapHistory.module.css';
import { SWAP_STATUS } from '../../utils/helpers';

export const SwapHistory = () => {
  const navigate = useNavigate();
  const history = useAppSelector(state => state.history.history);
  const [open, setOpen] = useState(false);
  const [showIndex, setShowIndex] = useState(0);

  const onShowDetails = (index) => {
    setShowIndex(index);
    setOpen(true);
    console.log("this is history: ");
    console.log(history[0]);
    console.log(showIndex);
  };
  
  return (
    <div>
      <Button color='google plus' style={{}} onClick={e => navigate('/')}>
        <Icon name='hand point left' /> Back to Home
      </Button>
      <Grid className={styles.historyContainer}>
        <Grid.Row className={styles.historyHeader}>
          <h3>History</h3>
          <Button circular secondary icon='setting' />
        </Grid.Row>
        { 
          history.map((row, index) => 
            <>
              <Divider />
              <HistoryItem history={row} index={index} onShowDetails={onShowDetails}/>
            </>)
        }
      </Grid>
      <Modal
        dimmer={'blurring'}
        open={open}
        onClose={() => setOpen(false)}
        className={styles.historyModal}
      >
        <Modal.Header>Swap Information</Modal.Header>
        <Modal.Content>
          
          {/* <Grid.Row key={history[showIndex].swapId}> */}
            <div singleLine>
              { SWAP_STATUS[history[showIndex].status] }
            </div>
            <div>{history[showIndex].amountBase}</div>
            <div>{history[showIndex].amountQuote}</div>
            <div>{history[showIndex].swapId}</div>
            <div>{history[showIndex].swapHash}</div>
            <div>{history[showIndex].secretSeekerId}</div>
            <div>{history[showIndex].secretHolderId}</div>
            <div>{history[showIndex].secret}</div>
          {/* </Grid.Row> */}
        </Modal.Content>
        <Modal.Actions>
          { history[showIndex].status !== 5 && 
            <Button.Group horizontal>
              <Button color='facebook' onClick={e => onContinueSwap(index)}>Modify</Button>
              <Button color='facebook' onClick={e => onCancelSwap(index)}>Cancel</Button>
            </Button.Group>
          }
          <Button.Group horizontal>
            <Button onClick={() => dispatch({ type: 'CLOSE_MODAL' })}>
              Close
            </Button>
          </Button.Group>
        </Modal.Actions>
      </Modal>
    </div>
  );
}
