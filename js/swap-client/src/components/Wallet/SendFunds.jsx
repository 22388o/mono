import React, { useEffect, useState } from 'react';
import {
  Button, 
  Divider, 
  Form, 
  Grid,
  Modal,
  TextArea,
  Icon,
  Loader
} from 'semantic-ui-react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { setSendingProcess } from '../../slices/walletSlice';
import styles from '../styles/wallet/SendFunds.module.css';
import { CHAIN_INFO } from '../../utils/constants';

export const SendFunds = () => {
  const dispatch = useAppDispatch();
  const [modalOpen, setModalOpen] = useState(false);
  const [coinType, setCoinType] = useState('BTC');
  const [addAmountOpen, setAddAmountOpen] = useState(false);
  const [recipAddr, setRecipAddr] = useState('');
  const sendingProcess = useAppSelector(state => state.wallet.sendingProcess);

  useEffect(() => {
    if(sendingProcess === 1) setModalOpen(true);
  }, [sendingProcess]);

  const onAssetClick = (coin) => {
    setCoinType(coin);
    dispatch(setSendingProcess(2));
  };

  return (
    <Modal
      basic
      closeIcon
      dimmer={'blurring'}
      open={modalOpen}
      onOpen={() => setModalOpen(true)}
      onClose={() => {setModalOpen(false); dispatch(setSendingProcess(0));}}
      className={styles.connectModal}
    >
      <Modal.Header>
        <div style={{display:'flex',justifyContent:'space-between'}}>
          <Icon name='arrow left' />
          { sendingProcess === 1 ? 'Select Asset' : 'Send' }
          <b></b>
        </div>
      </Modal.Header>
      <Modal.Content className='pb-1 pt-1'>
        { sendingProcess === 1 && <><Grid.Row container className={styles.item} onClick={() => onAssetClick('BTC')}>
          <Grid.Column width={4} className={styles.logoIcon}>
            <img className="ui avatar image" src={CHAIN_INFO['BTC'].url} />
            { CHAIN_INFO['BTC'].name }
          </Grid.Column>
          <Grid.Column width={8} className='align-right'>
            <h3>0.042</h3>
          </Grid.Column>
        </Grid.Row>
        <Divider />
        <Grid.Row container className={styles.item} onClick={() => onAssetClick('ETH')}>
          <Grid.Column width={4} className={styles.logoIcon}>
          <img className="ui avatar image" src={CHAIN_INFO['ETH'].url} />
            { CHAIN_INFO['ETH'].name }
          </Grid.Column>
          <Grid.Column width={8} className='align-right'>            
            <h3>0.12</h3>
          </Grid.Column>
        </Grid.Row></> }

        { sendingProcess === 2 && <>
          <Grid.Row>
            <h2 className='fs-1half'>Set Recipient</h2>
          </Grid.Row>
          <Grid.Row>
            <input className={styles['recipient-addr']} placeholder='Enter Address' value={recipAddr} onChange={(e) => setRecipAddr(e.target.value)} />
          </Grid.Row>
          <Grid.Row>
            <Button className='gradient-btn w-100 p-1' disabled={recipAddr.length === 0} onClick={() => dispatch(setSendingProcess(3))}>Enter an address</Button>
          </Grid.Row>
        </> }

        { sendingProcess === 3 && <>
          <Grid container>
            <Grid.Row>
              <Grid.Column width={6}><h4>Set Amount</h4></Grid.Column>
              <Grid.Column width={6}><h4>Use all funds</h4></Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column width={13}>
                <Grid.Row columns={2}>
                  <Grid.Column>
                    <input />
                  </Grid.Column>
                  <Grid.Column><h6>btc</h6></Grid.Column>
                </Grid.Row>
                <Grid.Row>
                  <h6>0 usd</h6>
                </Grid.Row>
              </Grid.Column>
              <Grid.Column width={3}>
                <Button className={styles['exchange-btn']}><Icon name='exchange'/></Button>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </>}
      </Modal.Content>

    </Modal>
  )
};