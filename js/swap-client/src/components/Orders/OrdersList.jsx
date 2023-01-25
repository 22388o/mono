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
import { OrderItem } from './OrderItem';
import { useState } from 'react';
import styles from '../styles/orders/OrdersList.module.css';

export const OrdersList = () => {
  const navigate = useNavigate();
  const history = useAppSelector(state => state.history.history);
  const [open, setOpen] = useState(false);

  const onShowDetails = (index) => {
    setOpen(true);
  };
  
  return (
    <div>
      { /*<Button color='google plus' style={{}} onClick={e => navigate('/')}>
        <Icon name='hand point left' /> Back to Home
      </Button>*/ }
      <Grid className={styles.historyContainer}>
        <Grid.Row className={styles.historyHeader}>
          <h3>Active Orders</h3>
          <Button circular secondary icon='setting' />
        </Grid.Row>
        { 
          history.map((row, index) => 
            <>
              <Divider />
              <OrderItem history={row} index={index} onShowDetails={onShowDetails}/>
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
          
        </Modal.Content>
        <Modal.Actions>
          <Button negative onClick={() => dispatch({ type: 'CLOSE_MODAL' })}>
            Disagree
          </Button>
          <Button positive onClick={() => dispatch({ type: 'CLOSE_MODAL' })}>
            Agree
          </Button>
        </Modal.Actions>
      </Modal>
    </div>
  );
}
