import { useCallback, useState, useSyncExternalStore } from "react";
import { getAddress, signTransaction } from 'sats-connect'

// mui imports
import { Button, Container, Divider, IconButton, Stack, Typography } from "@mui/material"
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';

// proj imports
import styles from '../../styles/ConnectWalletContainer.module.css';
import { getEthAddress, getEthBalance } from "../../utils/web3";
import { walletStore } from "../../syncstore/walletstore";
import { getAlice } from "../../utils/constants";
import { toastError, toastSuccess } from "../../utils/helpers";

export const ConnectWalletContainer = ({ show, setIsMinimized }) => {
  const globalWallet = useSyncExternalStore(walletStore.subscribe, () => walletStore.currentState)
  const node = globalWallet.assets[0] // Bitcoin
  const wallet = globalWallet.assets[1] // Ethereum

  const [unisatConnected, setUnisatConnected] = useState(false);
  const [xverseConnected, setXverseConnected] = useState(false);
  const [albyConnected, setAlbyConnected] = useState(false);
  const [btcAddrs, setBtcAddrs] = useState(null)
  
  const unisat = window.unisat

  /** Connect Metamask */
  const onConnectMetamask = useCallback(async () => {
    if (window.ethereum) {
      // user.user.ethereum = window.ethereum;
      try {
        const accounts = await getEthAddress()
        const balance = await getEthBalance(accounts[0]) / wallet.rate
        walletStore.dispatch({ type: 'SET_WALLET_DATA', payload: accounts[0] })
        walletStore.dispatch({ type: 'SET_WALLET_BALANCE', payload: balance })
        console.log('Metamask Wallet Connected: ', accounts)
        toastSuccess('Metamask Wallet Connected!');  
      } catch (e) {
        throw (e);
      }
    }
  }, [walletStore])

  
  /** Alby Wallet Connect */
  const onConnectLightning = useCallback(() => {
    const core = async () => {
      try {
        if (window.webln !== 'undefined') {
          await window.webln.enable()
          // setIsBtcWalletConnected(true);
          const info = await window.webln.getInfo()
          console.log('Alby Wallet Connected: ', info)
          toastSuccess('Alby Wallet Connected!');

          walletStore.dispatch({ type: 'SET_LIGHTNING_DATA', payload: getAlice().lightning })
          walletStore.dispatch({ type: 'SET_LIGHTNING_BALANCE', payload: 1000 })
          setAlbyConnected(true);
        }
      } catch (error) {
        console.log(error)
        toastError('Something Went Wrong!');
      }
    }
    core()
  }, [walletStore]);

  
  /** When Bitcoin-Taproot Connect is clicked */
  const onConnectBtcWallet = useCallback(async (selWal) => {
    //const selWal = prompt('Which wallet would you like to connect? 1 - Unisat, 2 - Xverse', 1)
    if (selWal == 1) {
      /** Unisat Wallet Extension Connection */
      if (unisat) {
        try {
          const result = await unisat.requestAccounts()
          const publicKey = await unisat.getPublicKey()
          const balance = await unisat.getBalance()
          const network = await unisat.getNetwork()

          console.log('Unisat Wallet Connected! ' + JSON.stringify(result))

          walletStore.dispatch({ type: 'SET_NODE_DATA', payload: getAlice().lightning })
          walletStore.dispatch({ type: 'SET_NODE_BALANCE', payload: 1000 })
          toastSuccess('Unisat Wallet Connected!');
          setUnisatConnected(true);
        } catch (e) {
          toastError('Something Went Wrong!');
        }
        // user.user.unisat = unisat;
      } else {
        toastError('Unisat not found!');
      }
      return
    }
    /** Xverse Wallet Extension Connection */
    const core = async () => {
      try {
        const getAddressOptions = {
          payload: {
            purposes: ['ordinals', 'payment'],
            message: 'Address for receiving Ordinals and payments',
            network: {
              type: 'Mainnet'
            }
          },
          onFinish: (response) => {
            walletStore.dispatch({ type: 'SET_NODE_DATA', payload: getAlice().lightning })
            walletStore.dispatch({ type: 'SET_NODE_BALANCE', payload: 1000 })
            setXverseConnected(true);
            setBtcAddrs(response)
            console.log('Xverse Wallet Connected! Address: ' + JSON.stringify(response))
          },
          onCancel: () => {
            toastError('Request Canceled');
          }
        }

        await getAddress(getAddressOptions)
      } catch (error) {
        toastError('Xverse not found!');
      }
    }
    core()
  }, [unisat, walletStore])

  const onPaymentSimulateUnisat = async () => {
    try {
      const txid = await window.unisat.sendBitcoin(
        'tb1qmfla5j7cpdvmswtruldgvjvk87yrflrfsf6hh0',
        1000
      )
      console.log('Payment Simulation Complete!')
    } catch (e) {
      console.error(e)
    }
  }

  const onPaymentSimulateXverse = async () => {
    const signPsbtOptions = {
      payload: {
        network: {
          type: 'Mainnet'
        },
        message: 'Sign Transaction',
        psbtBase64: 'cHNidP8BAJwCAmO+JvQJxhVDDpm3tV5PmPfzvJOSL4GOdjEOpAAAAAAnrAAA==',
        broadcast: false,
        inputsToSign: [{
          address: btcAddrs.addresses[1].address,
          signingIndexes: [1]
        }]
      },
      onFinish: (response) => {
        console.log(response.psbtBase64)
        alert(response.psbtBase64)
      },
      onCancel: () => toast.error(
        'Canceled!',
        {
          theme: 'colored',
          autoClose: 1000
        }
      )
    }
    await signTransaction(signPsbtOptions)
  }

  const onPaymentSimulateAlby = async () => {
    const result = await webln.keysend({
      destination: '03006fcf3312dae8d068ea297f58e2bd00ec1ffe214b793eda46966b6294a53ce6',
      amount: '1',
      customRecords: {
        34349334: 'TEST ACTION'
      }
    })
    console.log(result)
  }

  return (
    <Container className={styles.container} style={{display: show ? 'block' : 'none'}}>
      <Stack>
        <Stack direction='row' className={styles.header}>
          <Typography className={styles['header-font']}>Connect Wallet</Typography>
          <IconButton onClick={() => setIsMinimized(true)}><KeyboardDoubleArrowRightIcon className={styles['header-font']} /></IconButton>
        </Stack>
        <Stack className={styles['item-container']}>
          <Stack direction='row' id='metamask-connect-btn' className={styles['wallet-item']} onClick={onConnectMetamask}>
            <img style={{ borderRadius: '5px' }} width={32} src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMJyiAlYerxZx6dsXo5Pzv5gLdCrHKJ-5gnEs9RTGQ70RNCHoICMQ8&usqp=CAE&s' />
            <Typography className={styles['wallet-title']}>Metamask</Typography>
          </Stack>
          <Divider className={styles['divider']} />
          <Stack direction='row' sx={{justifyContent:'space-between', alignItems:'center'}}>
            <Stack direction='row' id='alby-connect-btn' className={styles['wallet-item']} onClick={onConnectLightning}>
              <img style={{ borderRadius: '5px' }} width={32} src='https://seeklogo.com/images/W/walletconnect-logo-EE83B50C97-seeklogo.com.png' />
              <Typography className={styles['wallet-title']}>Alby</Typography>
            </Stack>
            { albyConnected && <Stack>
              <Button color='primary' className='simulate-alby' variant='contained' onClick={() => onPaymentSimulateAlby()}>Simulate</Button>
            </Stack> }
          </Stack>
          <Divider className={styles['divider']} />
          <Stack direction='row' sx={{justifyContent:'space-between', alignItems:'center'}}>
            <Stack direction='row' id='unisat-connect-btn' className={styles['wallet-item']} onClick={() => onConnectBtcWallet(1)}>
              <img style={{ borderRadius: '5px' }} width={32} src='https://seeklogo.com/images/W/walletconnect-logo-EE83B50C97-seeklogo.com.png' />
              <Typography className={styles['wallet-title']}>Unisat</Typography>
            </Stack>
            { unisatConnected && <Stack>
              <Button color='primary' className='simulate-unisat' variant='contained' onClick={() => onPaymentSimulateUnisat()}>Simulate</Button>
            </Stack> }
          </Stack>
          <Divider className={styles['divider']} />
          <Stack direction='row' sx={{justifyContent:'space-between', alignItems:'center'}}>
            <Stack direction='row' id='xverse-connect-btn' className={styles['wallet-item']} onClick={() => onConnectBtcWallet(2)}>
              <img style={{ borderRadius: '5px' }} width={32} src='https://seeklogo.com/images/W/walletconnect-logo-EE83B50C97-seeklogo.com.png' />
              <Typography className={styles['wallet-title']}>Xverse</Typography>
            </Stack>
            { xverseConnected && <Stack>
              <Button color='primary' className='simulate-xverse' variant='contained' onClick={() => onPaymentSimulateXverse()}>Simulate</Button>
            </Stack> }
          </Stack>
        </Stack>
      </Stack>
    </Container>
  )
}