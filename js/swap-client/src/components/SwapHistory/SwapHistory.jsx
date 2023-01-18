import React from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { 
  Button, 
  Table,
  Icon,
  Container,
  Header,
  Grid,
  Divider
} from 'semantic-ui-react'
import { useNavigate } from 'react-router-dom';
import styles from '../styles/SwapHistory.module.css';
import { HistoryItem } from './HistoryItem';

export const SwapHistory = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const history = useAppSelector(state => state.history.history);

  const onContinueSwap = (index) => {
    dispatch(setSwapStatus(history[index].status));
    dispatch(setBase(history[index].amountBase));
    dispatch(setQuote(history[index].amountQuote));
    dispatch(setSwapId(history[index].swapId));
    dispatch(setSecretSeekerId(history[index].secretSeekerId));
    dispatch(setSecretHolderId(history[index].secretHolderId));
    dispatch(setSecret(history[index].secret));
    dispatch(setSwapHash(history[index].swapHash));
    dispatch(setIndex(index));
    navigate('/swap');
  };

  const onCancelSwap = (index) => {
    dispatch(cancelSwap(index));
  }
  console.log(history);
  return (
    <div>
      <Button color='google plus' style={{position:'absolute',left:'100px',top:'100px'}} onClick={e => navigate('/')}>
        <Icon name='hand point left' /> Back to Home
      </Button>
      <Grid className={styles.historyContainer}>
        <Grid.Row className={styles.historyHeader}>
          <h3>History</h3>
          <Button circular secondary icon='setting' />
        </Grid.Row>
        { 
          history.map((row, index) => <><Divider /><HistoryItem history={row} index/></>)
        }
      </Grid>
      {/* <Table celled color='black' inverted>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell width={1} singleLine>Status</Table.HeaderCell>
            <Table.HeaderCell singleLine>Base Amount</Table.HeaderCell>
            <Table.HeaderCell singleLine>Quote Amount</Table.HeaderCell>
            <Table.HeaderCell>Swap Id</Table.HeaderCell>
            <Table.HeaderCell >Hash</Table.HeaderCell>
            <Table.HeaderCell singleLine>Secret Seeker Id</Table.HeaderCell>
            <Table.HeaderCell singleLine>Secret Holder Id</Table.HeaderCell>
            <Table.HeaderCell>Secret</Table.HeaderCell>
            <Table.HeaderCell width={1}>Action</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {
            history.map((row, index) => 
              <Table.Row key={row.swapId}>
                <Table.Cell singleLine>
                  { SWAP_STATUS[row.status] }
                </Table.Cell>
                <Table.Cell>{row.amountBase}</Table.Cell>
                <Table.Cell>{row.amountQuote}</Table.Cell>
                <Table.Cell>{row.swapId}</Table.Cell>
                <Table.Cell>{row.swapHash}</Table.Cell>
                <Table.Cell>{row.secretSeekerId}</Table.Cell>
                <Table.Cell>{row.secretHolderId}</Table.Cell>
                <Table.Cell>{row.secret}</Table.Cell>
                <Table.Cell singleLine>
                  { row.status !== 5 && 
                    <Button.Group vertical>
                      <Button color='facebook' onClick={e => onContinueSwap(index)}>Modify</Button>
                      <Button color='facebook' onClick={e => onCancelSwap(index)}>Cancel</Button>
                    </Button.Group>
                  }
                </Table.Cell>
              </Table.Row>
            )
          }
        </Table.Body>
      </Table> */ }

    </div>
  );
}
