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
  const history = useAppSelector(state => state.history.history);
  
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
          history.map((row, index) => <><Divider /><HistoryItem history={row} index={index}/></>)
        }
      </Grid>
    </div>
  );
}
