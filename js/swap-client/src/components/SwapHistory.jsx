import React from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { 
  Button, 
  Table,
  Icon
} from 'semantic-ui-react'
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
} from "../slices/swapSlice";
import { cancelSwap } from '../slices/historySlice';
import { useNavigate } from 'react-router-dom';

export const SwapHistory = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const SWAP_STATUS = ['', 'PENDING', 'Order Matched', 'Claimed', 'Committing', 'Completed'];
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

  return (
    <div>
      <Button style={{position:'absolute',left:'100px',top:'100px'}} primary onClick={e => navigate('/')}>Back to Home</Button>
      <Table celled color='grey' inverted>
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
                  { row.status !== 5 && <Button primary onClick={e => onContinueSwap(index)}>Modify</Button> }<br />
                  { row.status !== 5 && <Button primary onClick={e => onCancelSwap(index)}>Cancel</Button> }
                </Table.Cell>
              </Table.Row>
            )
          }
        </Table.Body>
      </Table>
    </div>
  );
}