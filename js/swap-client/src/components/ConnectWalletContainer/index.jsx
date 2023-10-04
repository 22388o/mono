import { useCallback, useSyncExternalStore } from "react";
import { Button, Container, Divider, IconButton, Stack, Typography } from "@mui/material"
import styles from '../../styles/ConnectWalletContainer.module.css';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import { getEthAddress, getEthBalance } from "../../utils/web3";
import { walletStore } from "../../syncstore/walletstore";
import { getAlice } from "../../utils/constants";
import { getAddress } from "sats-connect";
import { toastError, toastSuccess } from "../../utils/helpers";
import { KeyboardDoubleArrowLeft } from "@mui/icons-material";

export const ConnectWalletContainer = ({ show, isMinimized, setIsMinimized }) => {

  const globalWallet = useSyncExternalStore(walletStore.subscribe, () => walletStore.currentState)
  const node = globalWallet.assets[0] // Bitcoin
  const wallet = globalWallet.assets[1] // Ethereum

  /** Connect Metamask */
  const onConnectMetamask = useCallback(async () => {
    if (window.ethereum) {
      // user.user.ethereum = window.ethereum;
      const accounts = await getEthAddress()
      const balance = await getEthBalance(accounts[0]) / wallet.rate
      walletStore.dispatch({ type: 'SET_WALLET_DATA', payload: accounts[0] })
      walletStore.dispatch({ type: 'SET_WALLET_BALANCE', payload: balance })
      console.log('Metamask Wallet Connected: ', accounts)
      toastSuccess('Metamask Wallet Connected!');
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
        }
      } catch (error) {
        console.log(error)
        toastError('Lightning Wallet not found!');
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
        const result = await unisat.requestAccounts()
        const publicKey = await unisat.getPublicKey()
        const balance = await unisat.getBalance()
        const network = await unisat.getNetwork()

        console.log('Unisat Wallet Connected! ' + JSON.stringify(result))

        walletStore.dispatch({ type: 'SET_NODE_DATA', payload: getAlice().lightning })
        walletStore.dispatch({ type: 'SET_NODE_BALANCE', payload: 1000 })
        setIsBtcWalletConnected('unisat');
        toastSuccess('Unisat Wallet Connected!');
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
            setIsBtcWalletConnected('xverse')
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

  if(isMinimized)
    return (
      <Button className={styles['show-wallets-btn']} onClick={() => setIsMinimized(false)}>
        <KeyboardDoubleArrowLeft style={{color: '#6A6A6A', marginRight: '5px'}}/>
        Wallets
      </Button>
    )

  return (
    <Container className={styles.container} style={{display: show ? 'block' : 'none'}}>
      <Stack>
        <Stack direction='row' className={styles.header}>
          <Typography className={styles['header-font']}>Connect Wallet</Typography>
          <IconButton onClick={() => setIsMinimized(true)}><KeyboardDoubleArrowRightIcon className={styles['header-font']} /></IconButton>
        </Stack>
        <Stack className={styles['item-container']}>
          <Stack direction='row' className={styles['wallet-item']} onClick={onConnectMetamask}>
            <img style={{ borderRadius: '5px' }} width={32} src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMJyiAlYerxZx6dsXo5Pzv5gLdCrHKJ-5gnEs9RTGQ70RNCHoICMQ8&usqp=CAE&s' />
            <Typography className={styles['wallet-title']}>Metamask</Typography>
          </Stack>
          <Divider className={styles['divider']} />
          <Stack direction='row' className={styles['wallet-item']} onClick={onConnectLightning}>
            <img style={{ borderRadius: '5px' }} width={32} src='https://seeklogo.com/images/W/walletconnect-logo-EE83B50C97-seeklogo.com.png' />
            <Typography className={styles['wallet-title']}>Alby</Typography>
          </Stack>
          <Divider className={styles['divider']} />
          <Stack direction='row' className={styles['wallet-item']} onClick={() => onConnectBtcWallet(1)}>
            <img style={{ borderRadius: '5px' }} width={32} src='https://seeklogo.com/images/W/walletconnect-logo-EE83B50C97-seeklogo.com.png' />
            <Typography className={styles['wallet-title']}>Unisat</Typography>
          </Stack>
          <Divider className={styles['divider']} />
          <Stack direction='row' className={styles['wallet-item']} onClick={() => onConnectBtcWallet(2)}>
            <img style={{ borderRadius: '5px' }} width={32} src='https://seeklogo.com/images/W/walletconnect-logo-EE83B50C97-seeklogo.com.png' />
            <Typography className={styles['wallet-title']}>Xverse</Typography>
          </Stack>
        </Stack>
      </Stack>
    </Container>
  )
}