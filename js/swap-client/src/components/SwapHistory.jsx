import React from 'react';
import { useAppSelector } from '../hooks';
import { Button, Table } from 'semantic-ui-react'
import { useNavigate } from 'react-router-dom';

export const SwapHistory = () => {
  const navigate = useNavigate();
  const SWAP_STATUS = ['', 'Created', 'Opening', 'Opened', 'Committing', 'Completed'];
  const history = useAppSelector(state => state.history.history);
  console.log(history);
  return (
    <div>
      <Button style={{position:'absolute',left:'100px',top:'100px'}} primary onClick={e => navigate('/')}>Back to Home</Button>
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell singleLine>Status</Table.HeaderCell>
            <Table.HeaderCell singleLine>Base Amount</Table.HeaderCell>
            <Table.HeaderCell singleLine>Quote Amount</Table.HeaderCell>
            <Table.HeaderCell width='three'>Swap Id</Table.HeaderCell>
            <Table.HeaderCell width={10}>Hash</Table.HeaderCell>
            <Table.HeaderCell singleLine>Secret Seeker Id</Table.HeaderCell>
            <Table.HeaderCell singleLine>Secret Holder Id</Table.HeaderCell>
            <Table.HeaderCell width={10}>Secret</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {
            history.map(row => 
              <Table.Row key={row.swapId}>
                <Table.Cell>{SWAP_STATUS[row.status]}</Table.Cell>
                <Table.Cell>{row.amountBase}</Table.Cell>
                <Table.Cell>{row.amountQuote}</Table.Cell>
                <Table.Cell>{row.swapId}</Table.Cell>
                <Table.Cell>{row.swapHash}</Table.Cell>
                <Table.Cell>{row.secretSeekerId}</Table.Cell>
                <Table.Cell>{row.secretHolderId}</Table.Cell>
                <Table.Cell>{row.secret}</Table.Cell>
              </Table.Row>
            )
          }
        </Table.Body>
      </Table>
    </div>
  );
}