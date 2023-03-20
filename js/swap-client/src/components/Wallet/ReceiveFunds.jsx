import React, { useEffect, useState } from 'react';
import {
  Button, 
  Divider, 
  Form, 
  Grid,
  Modal,
  TextArea,
  Icon,
  Loader,
  Input
} from 'semantic-ui-react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { setReceivingProcess } from '../../slices/walletSlice';
import styles from '../styles/wallet/ReceiveFunds.module.css';
import { CHAIN_INFO } from '../../utils/constants';
import classNames from 'classnames';

export const ReceiveFunds = () => {
  const dispatch = useAppDispatch();
  const [modalOpen, setModalOpen] = useState(false);
  const [coinType, setCoinType] = useState('BTC');
  const [addAmountOpen, setAddAmountOpen] = useState(false);
  const [invoiceHash, setInvoiceHash] = useState();
  const user = useAppSelector(state => state.user);
  const node = useAppSelector(state => state.wallet.node);
  const wallet = useAppSelector(state => state.wallet.wallet);
  const receivingProcess = useAppSelector(state => state.wallet.receivingProcess);
  // const lightningPayReq = require('bolt11');
  const [invoiceCopied, setInvoiceCopied] = useState(false);


  useEffect(() => {
    if(receivingProcess === 1) setModalOpen(true);
    if(receivingProcess === 2) {
      setTimeout(async () => {

        const macaroon = user.user.credentials.default;
        console.log({macaroon})
        const paymentAmount = 1000; // Satoshis (optional)
        await user.user.createInvoice({lndCreds: macaroon, paymentAmount})
        .then((invoice) => {

          const qrCodeSrc = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${invoice}`;
          console.log({qrCodeSrc});
          console.log({invoice});
          console.log('Invoice:', invoice);
          setInvoiceHash(invoice.invoices[0].createInvoice.request);
          dispatch(setReceivingProcess(3));
        })
        .catch((error) => {
          console.error('Error:', error.message);
        });

      }, 1000);
    }
  }, [receivingProcess]);

  const onAssetClick = (coin) => {
    setCoinType(coin);
    dispatch(setReceivingProcess(2));
  };

  return (
    <Modal
      basic
      closeIcon
      dimmer={'blurring'}
      open={modalOpen}
      onOpen={() => setModalOpen(true)}
      onClose={() => {setModalOpen(false); dispatch(setReceivingProcess(0));}}
      className={styles.connectModal}
    >
      <Modal.Header>
        <div style={{display:'flex',justifyContent:'space-between'}}>
          <Icon name='arrow left' />
          { receivingProcess === 1 ? 'Select Asset' : 'Receive' }
          <b></b>
        </div>
      </Modal.Header>
      <Modal.Content className='pb-1 pt-1'>
        { receivingProcess === 1 && <><Grid.Row container className={styles.item} onClick={() => onAssetClick('BTC')}>
          <Grid.Column width={4} className={styles.logoIcon}>
            <img className="ui avatar image" src={CHAIN_INFO['BTC'].url} />
            { CHAIN_INFO['BTC'].name }
          </Grid.Column>
          <Grid.Column width={8} className='align-right'>
            <h3>{node.balance}</h3>
          </Grid.Column>
        </Grid.Row>
        <Divider />
        <Grid.Row container className={styles.item} onClick={() => onAssetClick('ETH')}>
          <Grid.Column width={4} className={styles.logoIcon}>
          <img className="ui avatar image" src={CHAIN_INFO['ETH'].url} />
            { CHAIN_INFO['ETH'].name }
          </Grid.Column>
          <Grid.Column width={8} className='align-right'>            
            <h3>{wallet.balance}</h3>
          </Grid.Column>
        </Grid.Row></> }

        { receivingProcess === 2 && <>
          <Grid.Row container className={styles.itemCollapsed}>
            <Grid.Column width={4} className={styles.logoIcon}>
              <img className="ui avatar image" src={CHAIN_INFO[coinType].url} />
              { CHAIN_INFO[coinType].name }
            </Grid.Column>
            <Grid.Column width={8} className='align-right'>
              <h3>{ coinType == "BTC" ? node.balance : wallet.balance }</h3>
            </Grid.Column>
          </Grid.Row>
          <Loader active inline='centered' />
        </> }

        { receivingProcess === 3 && <>
          <Grid.Row container className={`${styles['flex-between']} ${'mb-1'}`}>
            <Grid.Column width={4} className={styles.logoIcon}>
              <img className="ui avatar image" src={CHAIN_INFO[coinType].url} />
              { CHAIN_INFO[coinType].name }
            </Grid.Column>
            <Grid.Column width={8} className='align-right'>
              <h3>{ coinType == "ETH" ? wallet.balance : node.balance }</h3>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row textAlign='center' className='flex-center mb-1'>
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${invoiceHash}`} alt="QR code"/>
          </Grid.Row>
          <Grid.Row textAlign='center'>
            <h4 style={{color:'grey'}}>Lightning Invoice</h4>
          </Grid.Row>
          <Grid.Row textAlign='center mb-1'>
            <h4 style={{overflowWrap: 'anywhere'}}>{invoiceHash}</h4>
          </Grid.Row>
          <Grid.Row textAlign='center'>
            <Button 
                className={classNames({
                  [styles['copy-btn']]: !invoiceCopied,
                  [styles['copy-btn-active']]: invoiceCopied
                })}
                onClick={() => setInvoiceCopied(true)} >
              { !invoiceCopied ? <><Icon name='copy outline' />Copy</>
                : <><Icon name='check circle' />Copied</>}
            </Button>
          </Grid.Row>
          <Divider className='m-1' />
          <Grid.Row>
            <a className={styles['add-amount']} onClick={() => setAddAmountOpen(true)}>
              <Icon name='pencil alternate' /> Add Amount
            </a>
          </Grid.Row>
          <Divider className='m-1' />
          <Grid.Row container className={styles['flex-between']}>
            <Grid.Column width={4} className={styles.logoIcon}>
              <h5>Expiration</h5>
            </Grid.Column>
            <Grid.Column width={8} className='align-right'>
              <h5>23:59:59</h5>
            </Grid.Column>
          </Grid.Row>
        </>}
      </Modal.Content>

      <Modal
        basic
        closeIcon
        dimmer={'blurring'}
        onClose={() => setAddAmountOpen(false)}
        onOpen={() => setAddAmountOpen(true)}
        open={addAmountOpen}
        className={styles['add-amount-modal']}
      >
        <Modal.Header className={styles['add-modal-header']}><h5 className='fs-1'>Add Amount</h5></Modal.Header>
        <Modal.Content className={styles['add-amount-content']}>
          <Grid container>
            <Grid.Column width={13}>
              <Grid.Row>
                <Grid.Column width={6} style={{width: '100px',float: 'left'}}>
                  <input type='number' style={{width:'90px',background:'none',border:'none',color:'white',textAlign:'right',outline:'none'}}/>
                </Grid.Column>
                <Grid.Column width={1} style={{width: '10px',float: 'left'}}>
                <div style={{borderLeft:'3px solid purple',height:'20px'}} />
                </Grid.Column>
                <Grid.Column width={6} style={{width: '100px',float: 'left'}}>
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
          </Grid>
        </Modal.Content>
        <Modal.Actions style={{display:'flex',justifyContent:'space-between'}}>
          <Button className={styles['cancel-btn']} onClick={() => setAddAmountOpen(false)}>Cancel</Button>
          <Button className={`gradient-btn ${styles['add-amount-btn']}`}>Add Amount</Button>
        </Modal.Actions>
      </Modal>
    </Modal>
  )
};
