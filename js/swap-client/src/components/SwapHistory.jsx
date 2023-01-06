import React from 'react';
import { useAppSelector } from '../hooks';
import { Icon, Label, Menu, Table } from 'semantic-ui-react'

export const SwapHistory = () => {
  const history = useAppSelector(state => state.history.history);

  return (
    <Table collapsing celled>
      <Table.Header>
        <Table.Row>
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
            <Table.Row>
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
  );
}