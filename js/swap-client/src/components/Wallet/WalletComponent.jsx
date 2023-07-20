import React, { useEffect, useSyncExternalStore } from 'react';
import { Box, Button, ButtonGroup, Divider, Grid, Stack, IconButton, TextField } from '@mui/material';
import { WalletItem } from './WalletItem';
import styles from '../../styles/wallet/WalletComponent.module.css';
import { useState } from 'react';
import Client from '../../utils/client';
import { ReceiveFunds } from './ReceiveFunds';
import { SendFunds } from './SendFunds';
import { MyModal } from '../MyModal/MyModal';
import { Close, West } from '@mui/icons-material';
import { CollectiblesModal } from '../Collectibles/CollectiblesModal';
import { getAvailableNFTCount } from '../../selector';
import { AddOtherAssetsModal } from './AddOtherAssetsModal';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import QRCode from 'qrcode';
import { getEthAddress, getEthBalance } from '../../utils/web3';
import { WalletConnectModal } from './WalletConnectModal';
import { userStore } from '../../syncstore/userstore';
import { walletStore } from '../../syncstore/walletstore';
import { Web3ModalSign, useConnect } from '@web3modal/sign-react';
import { getAlice } from '../../utils/constants';
import { getAddress, signTransaction } from 'sats-connect'

export const WalletComponent = () => {
  const [nodeModalOpen, setNodeModalOpen] = useState(false);
  const [nodeInput, setNodeInput] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [nftModalOpen, setNftModalOpen] = useState(false);
  const [walletInput, setWalletInput] = useState(false);
  const [otherModalOpen, setOtherModalOpen] = useState(false);
  const [qrData, setQrData] = useState('');
  const [expireSec, setExpireSec] = useState(10);
  const [timerId, setTimerId] = useState(null);
  const [walletConnectModalOpen, setWalletConnectModalOpen] = useState(false);
  const [isBtcWalletConnected, setIsBtcWalletConnected] = useState(false);
  const [btcAddrs, setBtcAddrs] = useState(null);
  
  const globalWallet = useSyncExternalStore(walletStore.subscribe, () => walletStore.currentState);
  const NFT_COUNT = getAvailableNFTCount(globalWallet);
  const node = globalWallet.assets[0];
  const wallet = globalWallet.assets[1];
  const assets = globalWallet.assets;
  const user = useSyncExternalStore(userStore.subscribe, () => userStore.currentState);

  const fromSats = (num) => { return num / 100000000 }
  
  useEffect(() => {
    QRCode.toDataURL('LNBC10U1P3PJ257PP5YZTKWJCZ5FTL5LAXKAV23ZMZEKAW37ZK6KMV80PK4XAEV5QHTZ7QDPDWD3XGER9WD5KWM36YPRX7U3QD36KUCMGYP282ETNV3SHJCQZPGXQYZ5VQSP5USYC4LK9CHSFP53KVCNVQ456GANH60D89REYKDNGSMTJ6YW3NHVQ9QYYSSQJCEWM5CJWZ4A6RFJX77C490YCED6PEMK0UPKXHY89CMM7SCT66K8GNEANWYKZGDRWRFJE69H9U5U0W57RRCSYSAS7GADWMZXC8C6T0SPJAZUP6')
    .then(url => {
      setQrData(url);
    })
    .catch(error => {
      console.log(error);
    });
  }, []);

  useEffect(() => {
    // console.log("node or wallet updated")
    // console.log({wallet})
    if (node.connected) {
      setNodeModalOpen(false);
    }
    if (wallet.connected) {
      setWalletModalOpen(false);
    }

    if (node.connected && wallet.connected && user.user.id==undefined) {
      const hostname = window.location.hostname;
      const port = window.location.port;
//      dispatch(signIn(new Client({ id: 'unnamed', hostname, port, credentials: Object.assign(nodeInput,walletInput) })));
      userStore.dispatch({ type: 'SIGN_IN', payload: new Client({ id: 'unnamed', hostname, port, credentials: Object.assign(nodeInput,walletInput) }) });
    }
  
    else if (!node.connected && !wallet.connected) {
//      dispatch(signOut());
      userStore.dispatch({ type: 'SIGN_OUT' });    
    }

  }, [node, wallet]);

  const { connect, data, error, loading } = useConnect({
    requiredNamespaces: {
      eip155: {
        methods: ['eth_sendTransaction', 'personal_sign'],
        chains: ['eip155:1'],
        events: ['chainChanged', 'accountsChanged']
      }
    }
  })

  async function onConnectWC() {
    const data = await connect()
  }

  useEffect(() => {
    async function getBalance() {
      const {balances} = await user.user.getBalance(user.user.credentials);
      if (balances[0].lightning) dispatch(setNodeBalance(fromSats(balances[0].lightning.balance)))
    }

    if (!user.isLoggedIn) {
      walletStore.dispatch({ type: 'CLEAR_NODE_DATA' });
      walletStore.dispatch({ type: 'CLEAR_WALLET_DATA' });
    } else if(user.isLoggedIn) {
      getBalance();
    }
  }, [user.isLoggedIn]);

  useEffect(() => {
    if(expireSec === 0) clearInterval(timerId);
  }, [expireSec]);

  const onConnectNode = (data = null) => {
    walletStore.dispatch({ type: 'SET_NODE_DATA', payload: data || {
      'lightning': {
      'admin': '',
      'invoice': '',
      'socket': '',
      'cert': '',
    }}});
    setNodeModalOpen(false);
  }

  const onNodeModalOpenClick = () => {
    setNodeModalOpen(true);

    const id = setInterval(() => {
      setExpireSec(expireSec => expireSec - 1);
    }, 1000);
    setTimerId(id);
  }

  const onConnectMetamask = async () => {
    if (window.ethereum) {
      const accounts = await getEthAddress();
      const balance = await getEthBalance(accounts[0]) / wallet.rate;
      setWalletModalOpen(false);
      walletStore.dispatch({ type: 'SET_WALLET_DATA', payload: accounts[0]});
      walletStore.dispatch({ type: 'SET_WALLET_BALANCE', payload: balance});
    }
  }

  const onConnectWalletConnect = () => {
    onConnectWC();
    setWalletModalOpen(false);
  };

  const onConnectBtcWallet = () => {
    const core = async () => {
      try {
        const getAddressOptions = {
          payload: {
            purposes: ['ordinals', 'payment'],
            message: 'Address for receiving Ordinals and payments',
            network: {
              type:'Mainnet'
            },
          },
          onFinish: (response) => {
            walletStore.dispatch({ type: 'SET_NODE_DATA', payload: getAlice().lightning});
            walletStore.dispatch({ type: 'SET_NODE_BALANCE', payload: 1000});
            setIsBtcWalletConnected(true);
            setBtcAddrs(response);
          },
          onCancel: () => alert('Request canceled'),
          }
            
        await getAddress(getAddressOptions);
        
        /*if(window.webln !== 'undefined'){
          await window.webln.enable();
          setIsBtcWalletConnected(true);
          const info = await window.webln.getInfo();
          console.log(info);

          walletStore.dispatch({ type: 'SET_NODE_DATA', payload: getAlice().lightning});
          walletStore.dispatch({ type: 'SET_NODE_BALANCE', payload: 1000});
        }*/
      }
      catch(error){
        console.log(error);
        alert('Cannot find bitcoin wallet!');
      }  
    }
    core();
  }
  
  const onPaymentSimulate = () => {
    const core = async () => {
      /*const result = await webln.keysend({
        destination: "03006fcf3312dae8d068ea297f58e2bd00ec1ffe214b793eda46966b6294a53ce6", 
        amount: "1", 
        customRecords: {
            "34349334": "HELLO AMBOSS"
        }
      });
      console.log(result);    */
      console.log(btcAddrs);
      const signPsbtOptions = {
        payload: {
          network: {
            type:'Mainnet'
          },
          message: 'Sign Transaction',
          psbtBase64: `cHNidP8BAJwCAmO+JvQJxhVDDpm3tV5PmPfzvJOSL4GOdjEOpAAAAAAnrAAA==`,
          broadcast: false,
          inputsToSign: [{
              address: btcAddrs.addresses[1].address,
              signingIndexes: [1],
          }],
        },
        onFinish: (response) => {
          console.log(response.psbtBase64)
          alert(response.psbtBase64)
        },
        onCancel: () => alert('Canceled'),
      }
      
      await signTransaction(signPsbtOptions);
    };

    core();
  }

  return (
    <>
      <Box direction='column' className={styles.walletContainer}>
        <Stack spacing={1.5} textAlign='left'>
          <Grid container direction='row'>
            <Grid item xs={4} textAlign='left' style={{display:'flex',justifyContent:'flex-start',alignItems:'center'}}><h3>Assets</h3></Grid>
            { user.isLoggedIn && <Grid item xs={8} textAlign='right'><ButtonGroup>
              <Button variant='text' onClick={() => walletStore.dispatch({ type: 'SET_RECEIVING_PROCESS', payload: 1})}><img style={{height:'1.7rem'}} src='./receive.png' /></Button>
              <Button variant='text' onClick={() => walletStore.dispatch({ type: 'SET_SENDING_PROCESS', payload: 1})}><img style={{height:'1.7rem'}} src='./send.png' /></Button>
            </ButtonGroup></Grid> }
          </Grid>
          { 
            assets.filter(asset => asset.isNFT === false).map((asset, idx) => <span key={idx}><Divider /><WalletItem item={asset} setNodeModalOpen={onNodeModalOpenClick} setWalletModalOpen={() => setWalletModalOpen(true)} /></span>) 
          }
          <Divider />
          <Grid container direction='row' style={{display:'flex',justifyContent:'space-between'}}>
            <Grid item><h4 className='flex-middle'><img width={32} src='/cube.png' />Collectibles</h4></Grid>
            <Grid style={{cursor:'pointer'}} item onClick={() => setNftModalOpen(true)}><h4 className='flex-middle'>{ NFT_COUNT } <ChevronRightIcon /></h4></Grid>
          </Grid>
          <Divider />
          <a onClick={() => setOtherModalOpen(true)} style={{cursor:'pointer'}}>+ Add Other Asset</a>
        </Stack>
      </Box>
      <MyModal open={nodeModalOpen} classme='connect-modal-color'>
        <Grid container direction='column' spacing={2}>
          <Grid item container direction='row'>
            <Grid item xs={1} textAlign='center'>
              <IconButton><West /></IconButton>
            </Grid>
            <Grid container direction='row' item xs={10} textAlign='center' width={250} className='flex-vh-center'>
              <img width={32} className="ui avatar image" src="https://github.com/dapphub/trustwallet-assets/blob/master/blockchains/bitcoin/info/logo.png?raw=true" />
              <Stack direction='column' item xs={10} textAlign='left'>
                <h5>Bitcoin</h5>
                <h6 style={{color:'grey'}}>BTC * Lightning</h6>
              </Stack>
            </Grid>
            <Grid item xs={1} textAlign='center'>
              <IconButton onClick={e => setNodeModalOpen(false)} ><Close /></IconButton>
            </Grid>
          </Grid>
          <Grid item container direction='column' className='flex-vh-center' spacing={2}>
            { !isBtcWalletConnected 
                ? <Button circular="true" secondary="true" className={`${styles['gradient-border-btn']}`} onClick={onConnectBtcWallet}>Connect Browser Wallet</Button>
                : 'Wallet Connected' }
            { window.webln && <h6 style={{color:'grey'}}>WebLN detected</h6> } 
            <Divider style={{borderColor:'#202020',marginTop:'0.5em',width:'100%'}} />
            { !isBtcWalletConnected 
                ?
                  <>
                    <h5>Scan with a Lightning Wallet</h5>
                    <h6 style={{color:'grey'}}>Requires LNURL Support</h6>
                    <img src={qrData} alt='QrCode' />
                    <h5>Expires in {expireSec} second(s)</h5>
                  </>
                : <Button color='primary' variant='contained' onClick={onPaymentSimulate}>Simulate Button</Button>
            }
          </Grid>
        </Grid>
      </MyModal>

      <MyModal open={walletModalOpen} classme='connect-modal-color'>
        <Grid container direction='column' spacing={2}>
          <Grid item container direction='row'>
            <Grid item xs={1} textAlign='center'>
              <IconButton><West /></IconButton>
            </Grid>
            <Grid container direction='row' item xs={10} textAlign='center' width={250} className='flex-vh-center'>
              <img width={32} src="https://github.com/dapphub/trustwallet-assets/blob/master/blockchains/ethereum/info/logo.png?raw=true" />
              <Stack direction='column' item xs={10} textAlign='left'>
                <h5>Ethereum</h5>
                <h6 style={{color:'grey'}}>ETH * Network</h6>
              </Stack>
            </Grid>
            <Grid item xs={1} textAlign='center'>
              <IconButton onClick={e => setWalletModalOpen(false)} ><Close /></IconButton>
            </Grid>
          </Grid>
          <Grid item container direction='column' className='flex-vh-center' spacing={2}>
            <Grid item container direction='row' className={styles['eth-con-col1']} onClick={onConnectMetamask}>
              <img style={{borderRadius:'5px'}} width={32} src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMJyiAlYerxZx6dsXo5Pzv5gLdCrHKJ-5gnEs9RTGQ70RNCHoICMQ8&usqp=CAE&s' />
              <h5 className='ml-1'>Metamask</h5>
            </Grid>
            <Grid item container direction='row' className={styles['eth-con-col2']} onClick={onConnectWalletConnect}>
              <img style={{borderRadius:'5px'}} width={32} src='https://seeklogo.com/images/W/walletconnect-logo-EE83B50C97-seeklogo.com.png' />
              <h5 className='ml-1'>Wallet Connect</h5>
            </Grid>
          </Grid>
        </Grid>
      </MyModal>

      <CollectiblesModal open={nftModalOpen} handleClose={() => setNftModalOpen(false)} />
      <AddOtherAssetsModal open={otherModalOpen} handleClose={() => setOtherModalOpen(false)} />
      <WalletConnectModal open={walletConnectModalOpen} handleClose={() => setWalletConnectModalOpen(false)} />
      <ReceiveFunds />
      <Web3ModalSign
        projectId="33eaf37ba0badd61cecfe4f3582f18ac"
        metadata={{
          name: 'My Dapp',
          description: 'My Dapp description',
          url: 'https://my-dapp.com',
          icons: ['https://my-dapp.com/logo.png']
        }}
        modalOptions={{
          explorerRecommendedWalletIds: [
            'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96'
          ]          
        }}
      />
      <SendFunds />
    </>
  );
}
