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
import { validateInvoiceAddress } from '../../utils/helpers';

export const SendFunds = () => {
  const dispatch = useAppDispatch();
  const [modalOpen, setModalOpen] = useState(false);
  const [coinType, setCoinType] = useState('BTC');
  const [addAmountOpen, setAddAmountOpen] = useState(false);
  const [recipAddr, setRecipAddr] = useState('');
  const sendingProcess = useAppSelector(state => state.wallet.sendingProcess);

  useEffect(() => {
    if(sendingProcess === 1) setModalOpen(true);
    if(sendingProcess === 4) 
      setTimeout(() => {
        dispatch(setSendingProcess(5));
      }, 1000);
  }, [sendingProcess]);

  const onAssetClick = (coin) => {
    setCoinType(coin);
    dispatch(setSendingProcess(2));
  };

  const onComplete = () => {
    dispatch(setSendingProcess(0));
    setModalOpen(false);
  }

  if(sendingProcess === 1) 
    return (
      <Modal
        basic
        closeIcon
        dimmer={'blurring'}
        open={modalOpen}
        onOpen={() => setModalOpen(true)}
        onClose={() => {setModalOpen(false); dispatch(setSendingProcess(0));}}
        className={`${styles.connectModal} w-500`}
      >
        <Modal.Header>
          <div style={{display:'flex',justifyContent:'space-between'}}>
            <Icon name='arrow left' />
            Select Asset
            <b></b>
          </div>
        </Modal.Header>
        <Modal.Content className='pb-1 pt-1'>
          <Grid.Row container className={styles.item} onClick={() => onAssetClick('BTC')}>
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
          </Grid.Row>
        </Modal.Content>  
      </Modal>
    )
  
  if(sendingProcess === 2) 
    return (
    <Modal
      basic
      closeIcon
      dimmer={'blurring'}
      open={modalOpen}
      onOpen={() => setModalOpen(true)}
      onClose={() => {setModalOpen(false); dispatch(setSendingProcess(0));}}
      className={`${styles.connectModal} w-400`}
    >
      <Modal.Header>
        <div style={{display:'flex',justifyContent:'space-between'}}>
          <Icon name='arrow left' />Send
          <b></b>
        </div>
      </Modal.Header>
      <Modal.Content className='pb-1 pt-1'>
        <Grid.Row>
          <h2 className='fs-1half'>Set Recipient Payment Invoice</h2>
        </Grid.Row>
        <Grid.Row>
          <input className={styles['recipient-addr']} placeholder='Enter Payment Invoice Hash' value={recipAddr} onChange={(e) => setRecipAddr(e.target.value)} autoFocus/>
        </Grid.Row>
        <Grid.Row>
          <Button className='gradient-btn w-100 p-1' disabled={recipAddr.length === 0 || !validateInvoiceAddress(recipAddr) } onClick={() => dispatch(setSendingProcess(3))}>
            { recipAddr.length === 0
              ? 'Enter a payment invoice'
              : !validateInvoiceAddress(recipAddr) 
                  ? 'Enter a supported payment invoice' 
                  : 'Continue' }
          </Button>
        </Grid.Row>
      </Modal.Content>
    </Modal>
    )

  if(sendingProcess === 2) return (
    <Modal
      basic
      closeIcon
      dimmer={'blurring'}
      open={modalOpen}
      onOpen={() => setModalOpen(true)}
      onClose={() => {setModalOpen(false); dispatch(setSendingProcess(0));}}
      className={`${styles.connectModal} w-350`}
    >
      <Modal.Header>
        <div style={{display:'flex',justifyContent:'space-between'}}>
          <Icon name='arrow left' />Send
          <b></b>
        </div>
      </Modal.Header>
      <Modal.Content className='pb-1 pt-1'>
        <Grid container>
          <Grid.Row>
            <Grid.Column width={7}><h4 style={{fontWeight:'bold'}}>Set Amount</h4></Grid.Column>
            <Grid.Column width={7}><h4 style={{color:'#748AFE',fontWeight:'bold'}}>Use all funds</h4></Grid.Column>
          </Grid.Row>
          <Grid.Row className={styles['modal-black-content']}>
            <Grid.Column width={13}>
              <Grid.Row>
                <Grid.Column width={6} style={{width: '95px',float: 'left'}}>
                  <input type='number' style={{width:'90px',background:'none',border:'none',color:'white',textAlign:'right',outline:'none'}}/>
                </Grid.Column>
                <Grid.Column width={1} style={{width: '10px',float: 'left'}}>
                <div style={{borderLeft:'3px solid purple',height:'20px'}} />
                </Grid.Column>
                <Grid.Column width={6} style={{width: '90px',float: 'left'}}>
                  <h6>btc</h6>
                </Grid.Column>
              </Grid.Row><br />
              <Grid.Row>
                <h6 style={{textAlign:'center',marginTop:'0.5em',fontSize:'0.7em'}}>0 usd</h6>
              </Grid.Row>
            </Grid.Column>
            <Grid.Column width={3}>
              <Button className={styles['exchange-btn']}><Icon name='exchange'/></Button>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={7}>Asset Balance</Grid.Column>
            <Grid.Column width={8} textAlign='right'>
              <Grid.Row>0.1250000 btc</Grid.Row>
              <Grid.Row>2,409.84 eth</Grid.Row>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Modal.Content>
      <Modal.Actions>
        <Button className='gradient-btn w-100 p-1' disabled={recipAddr.length === 0 || !validateInvoiceAddress(recipAddr) } onClick={() => dispatch(setSendingProcess(3))}>
          Continue
        </Button>
      </Modal.Actions>
    </Modal>
  )

  if(sendingProcess > 2) return (
    <Modal
      basic
      closeIcon={sendingProcess != 4}
      dimmer={'blurring'}
      open={modalOpen}
      onOpen={() => setModalOpen(true)}
      onClose={() => {setModalOpen(false); dispatch(setSendingProcess(0));}}
      className={`${styles.connectModal} w-350`}
    >
      <Modal.Header>
        { sendingProcess !== 4 && <div style={{display:'flex',justifyContent:'space-between'}}>
          <Icon name='arrow left' />
          <b></b>
        </div>}
      </Modal.Header> 
      <Modal.Content className='pb-1 pt-1'>
        <Grid container>
          <Grid.Row>
            <h3>
              {sendingProcess === 3 
                ? 'Review Transaction' 
                : sendingProcess === 4 
                   ? 'Sending...'
                   : <><Icon name='check circle' style={{color:'lightgreen'}}/>Payment Sent!</>}
            </h3>
          </Grid.Row>
          <Grid.Row className={styles['rev-act-amount']}>
            <span>0.0042btc<br/>
            1290.00usd</span>
          </Grid.Row>
          <Grid.Row className={styles['data-row']}>
            <Grid.Column width={4}>Recipient</Grid.Column>
            <Grid.Column width={12} textAlign='right'>LNBC QWEI DVSA EF#C</Grid.Column>
          </Grid.Row>
          <Grid.Row className={styles['data-row']}>
            <Grid.Column width={4}>Network Fees</Grid.Column>
            <Grid.Column width={12} textAlign='right'>0.0000002btc<br />0.00usd</Grid.Column>
          </Grid.Row>
          <Grid.Row className={styles['data-row']}>
            <Grid.Column width={4}>Total</Grid.Column>
            <Grid.Column width={12} textAlign='right'>0.04202btc<br />1290.30usd</Grid.Column>
          </Grid.Row>
        </Grid>
      </Modal.Content>
      <Modal.Actions>
        { sendingProcess === 3 && <Grid container>
          <Grid.Column width={8} className='pl-05 pr-05'>
            <Button className={`${styles['cancel-btn']} w-100 p-1`}>
              Cancel
            </Button>
          </Grid.Column>
          <Grid.Column width={8} className='pl-05 pr-05'>
            <Button className='gradient-btn w-100 p-1' onClick={() => dispatch(setSendingProcess(4))}>
              Continue
            </Button>
          </Grid.Column>
        </Grid> }
        { sendingProcess === 4 && <Loader active inline='centered' /> }
        { sendingProcess === 5 
           && <Button className={`${styles['cancel-btn']} w-100 p-1`} onClick={onComplete}>
              Close
            </Button>
        }
      </Modal.Actions>
    </Modal>
  );
};
