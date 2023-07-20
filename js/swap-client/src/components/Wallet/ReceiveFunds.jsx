import React, { useEffect, useState, useSyncExternalStore } from 'react';
import styles from '../../styles/wallet/ReceiveFunds.module.css';
import { CHAIN_INFO } from '../../utils/constants';
import classNames from 'classnames';
import { MyModal } from '../MyModal/MyModal';
import { Close, West } from '@mui/icons-material';
import { Button,  Divider, Grid, Stack, Modal, IconButton, TextField } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import { AssetItem } from '../common/AssetItem';
import { getMinimizedAssets } from '../../selector';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { AddOtherAssetsModal } from './AddOtherAssetsModal';
import QRCode from 'qrcode';
import { walletStore } from '../../syncstore/walletstore';

export const ReceiveFunds = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [invoiceCopied, setInvoiceCopied] = useState(false);
  const [selAsset, setSelAsset] = useState(null);
  const [nftChain, setNftChain] = useState('');
  const [otherModalOpen, setOtherModalOpen] = useState(false);
  const [qrData, setQrData] = useState('');

  const globalWallet = useSyncExternalStore(walletStore.subscribe, () => walletStore.currentState);
  const receivingProcess = globalWallet.receivingProcess;
  const assetTypes = getMinimizedAssets(globalWallet);

  useEffect(() => {
    QRCode.toDataURL('LNBC10U1P3PJ257PP5YZTKWJCZ5FTL5LAXKAV23ZMZEKAW37ZK6KMV80PK4XAEV5QHTZ7QDPDWD3XGER9WD5KWM36YPRX7U3QD36KUCMGYP282ETNV3SHJCQZPGXQYZ5VQSP5USYC4LK9CHSFP53KVCNVQ456GANH60D89REYKDNGSMTJ6YW3NHVQ9QYYSSQJCEWM5CJWZ4A6RFJX77C490YCED6PEMK0UPKXHY89CMM7SCT66K8GNEANWYKZGDRWRFJE69H9U5U0W57RRCSYSAS7GADWMZXC8C6T0SPJAZUP6')
    .then(url => {
      setQrData(url);
    })
    .catch(error => {
      console.log(error);
    })
  }, []);

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
        walletStore.dispatch({ type: 'SET_RECEIVING_PROCESS', payload: 3 });
        })
        .catch((error) => {
          console.error('Error:', error.message);
        });

      }, 1000);
    }
  }, [receivingProcess]);

  const onClickAsset = (asset) => {
    setSelAsset(asset);
    walletStore.dispatch({ type: 'SET_RECEIVING_PROCESS', payload: !asset.isNFT ? 2 : 2.5 });
  };

  const onNftChainClick = (chain) => {
    setNftChain(chain);
    walletStore.dispatch({ type: 'SET_RECEIVING_PROCESS', payload: 3.5 });
  }

  return (
    <MyModal open={modalOpen}>
      <Grid container direction='column' spacing={1}>
        <Grid item container direction='row'>
          <Grid item xs={1} textAlign='center' onClick={() => 
          dispatch(setReceivingProcess(receivingProcess == 3 ? receivingProcess - 2 : receivingProcess - 1)) }>
            <IconButton><West /></IconButton>
          </Grid>
          <Grid item xs={10} textAlign='center' width={receivingProcess < 3 ? 250 : 350}>
            <h3>{ receivingProcess === 1 ? 'Select Asset' : 'Receive' }</h3>
          </Grid>
          <Grid item xs={1} textAlign='center'>
            <IconButton onClick={e => { setModalOpen(false); walletStore.dispatch({ type: 'SET_RECEIVING_PROCESS', payload: 0})}}><Close /></IconButton>
          </Grid>
        </Grid>

        { receivingProcess === 1 && <>
          { 
            assetTypes.map((asset, idx) => <span key={idx}><AssetItem asset={asset} handleClick={onClickAsset} /><Divider style={{borderColor:'#3A3A3A',margin:'0.3em'}}/></span>) 
          }
          <a onClick={() => setOtherModalOpen(true)} style={{cursor:'pointer'}}>+ Add Other Asset</a>
        </> }
        

        { /*******************************        Normal Process          *******************************/ }
        { receivingProcess === 2 && <>
          <Grid container direction='row'>
            <Grid item xs={1} textAlign='center'>
              <img width={25} className="ui avatar image" src={CHAIN_INFO['ETH'].url} />
            </Grid>
            <Grid item xs={4} textAlign='left'>
              <h4>{ selAsset.title }</h4>
            </Grid>
            <Grid item xs={7} textAlign='right'>
              <h4>{ selAsset.balance }</h4>
            </Grid>
          </Grid>
          <Grid textAlign='center'><CircularProgress /></Grid>
        </> }

        { receivingProcess === 3 && <>
          <Grid container direction='row'>
            <Grid item xs={1} textAlign='center'>
              <img width={25} className="ui avatar image" src={CHAIN_INFO['ETH'].url} />
            </Grid>
            <Grid item xs={4} textAlign='left'>
              <h4>&nbsp;{ CHAIN_INFO['ETH'].name }</h4>
            </Grid>
            <Grid item xs={7} textAlign='right'>
              <h3>{wallet.balance}</h3>
            </Grid>
          </Grid>
          <Grid textAlign='center'>
            <img src={qrData} alt='QrCode' />
          </Grid>
          <Grid textAlign='left'>
            <h5 style={{color:'grey'}}>Lightning Invoice</h5>
          </Grid>
          <Grid textAlign='center'>
            <h5 style={{overflowWrap: 'anywhere',width:'450px',margin:'auto',textAlign:'center'}}>LNBC10U1P3PJ257PP5YZTKWJCZ5FTL5LAXKAV23ZMZEKAW37ZK6KMV80PK4XAEV5QHTZ7QDPDWD3XGER9WD5KWM36YPRX7U3QD36KUCMGYP282ETNV3SHJCQZPGXQYZ5VQSP5USYC4LK9CHSFP53KVCNVQ456GANH60D89REYKDNGSMTJ6YW3NHVQ9QYYSSQJCEWM5CJWZ4A6RFJX77C490YCED6PEMK0UPKXHY89CMM7SCT66K8GNEANWYKZGDRWRFJE69H9U5U0W57RRCSYSAS7GADWMZXC8C6T0SPJAZUP6</h5>
          </Grid>
          <Grid textAlign='center'>
            <Button
                className={classNames({
                  [styles['copy-btn']]: !invoiceCopied,
                  [styles['copy-btn-active']]: invoiceCopied
                })}
                onClick={() => setInvoiceCopied(true)} >
              { !invoiceCopied ? <><ContentCopyIcon />Copy</>
                : <><CheckCircleOutlineIcon />Copied</>}
            </Button>
          </Grid>
          <Divider style={{margin:'1em',borderColor:'grey'}}/>
          <a className={styles['add-amount']}>
            <EditIcon /> Add Amount
          </a>
          <Divider style={{margin:'1em',borderColor:'grey'}}/>
          <Grid item style={{display:'flex',justifyContent:'space-between'}}>
            <span><h5>Expiration</h5></span>
            <span><h5>23:59:59</h5></span>
          </Grid>
        </> }

        { /*******************************        NFT Process          *******************************/ }
        { receivingProcess === 2.5 && <>
          <Grid item container direction='row' onClick={e => onNftChainClick('BTC')} style={{cursor:'pointer'}}>
            <Grid item xs={1.5}><img width='32px' src='https://github.com/dapphub/trustwallet-assets/blob/master/blockchains/bitcoin/info/logo.png?raw=true' /></Grid>
            <Grid item xs={8} direction='column' textAlign='left'>
              <span><h5>Ordinals on Bitcoin</h5></span>
              <span><h5 style={{fontSize:'0.8em',color:'grey'}}>BTC</h5></span>
            </Grid>
            <Grid item xs={2.5} textAlign='right' alignItems='center'>
              <NavigateNextIcon />
            </Grid>
          </Grid>
          <Divider style={{margin: '0.3em'}} />
          <Grid item container direction='row' onClick={e => onNftChainClick('ETH')} style={{cursor:'pointer'}}>
            <Grid item xs={1.5}><img width='32px' src='https://github.com/dapphub/trustwallet-assets/blob/master/blockchains/bitcoin/info/logo.png?raw=true' /></Grid>
            <Grid item xs={8} direction='column' textAlign='left'>
              <span><h5>NFT on Ethereum</h5></span>
              <span><h5 style={{fontSize:'0.8em',color:'grey'}}>ETH</h5></span>
            </Grid>
            <Grid item xs={2.5} textAlign='right' alignItems='center'>
              <NavigateNextIcon />
            </Grid>
          </Grid>
        </> }

        { receivingProcess === 3.5 && <>
          <Grid container direction='row'>
            <Grid item xs={1} textAlign='center'>
              <img width={25} className="ui avatar image" src={CHAIN_INFO[coinType].url} />
            </Grid>
            <Grid item xs={4} textAlign='left'>
              <h4>&nbsp;{ CHAIN_INFO[coinType].name }</h4>
            </Grid>
            <Grid item xs={7} textAlign='right'>
              <h4>{ coinType == "ETH" ? wallet.balance : node.balance }</h4>
            </Grid>
          </Grid>
          <Grid textAlign='center'>
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${invoiceHash}`}  alt="QR code" />
          </Grid>
          <Grid textAlign='left'>
            <h5 style={{color:'grey'}}>Lightning Invoice</h5>
          </Grid>
          <Grid textAlign='center'>
            <h5 style={{overflowWrap: 'anywhere',width:'450px',margin:'auto'}}>{invoiceHash}</h5>
          </Grid>
          <Grid textAlign='center'>
            <Button
                className={classNames({
                  [styles['copy-btn']]: !invoiceCopied,
                  [styles['copy-btn-active']]: invoiceCopied
                })}
                onClick={() => setInvoiceCopied(true)} >
              { !invoiceCopied ? <><ContentCopyIcon />Copy</>
                : <><CheckCircleOutlineIcon />Copied</>}
            </Button>
          </Grid>
        </> }
      </Grid>
      <AddOtherAssetsModal open={otherModalOpen} handleClose={() => setOtherModalOpen(false)} />
    </MyModal>
  );
};
