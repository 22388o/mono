import React, { useEffect, useCallback, useState, useSyncExternalStore } from 'react'
import { ToastContainer } from 'react-toastify'
import { isMobile } from 'react-device-detect';

import { Menu, MenuItem, Button, Grid, Typography } from '@mui/material'
import { KeyboardDoubleArrowLeft } from "@mui/icons-material";

import { SwapCreate } from './SwapCreate/SwapCreate'
import { getAlice, getBob } from '../utils/constants'
import styles from '../styles/SwapHome.module.css'
import { userStore } from '../syncstore/userstore'
import { walletStore } from '../syncstore/walletstore'
import 'react-toastify/dist/ReactToastify.css'
import { MobileWarningPage } from './MobileWarningPage'
import { Footer } from './Footer'
import { ConnectWalletContainer } from './ConnectWalletContainer'
import { WalletInfoContainer } from './WalletInfoContainer'
import { IndexedDB } from '@portaldefi/sdk';
import SDK from '@portaldefi/sdk';
import { config } from '../utils/constants';

const onSwap = (user, event) => [event, swap => console.log(`${user}.${event}`, swap.status)]

export const SwapHome = () => {
  const user = useSyncExternalStore(userStore.subscribe, () => userStore.currentState)
  const globalWallet = useSyncExternalStore(walletStore.subscribe, () => walletStore.currentState)
  const wallet = globalWallet.assets[1]
  const [isMinimized, setIsMinimized] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null)
  const [isStart, setIsStart] = useState(true)

  const open = anchorEl !== null
  const handleClick = useCallback((event) => {
    setAnchorEl(event.currentTarget)
  }, [])
  const handleClose = useCallback(() => {
    setAnchorEl(null)
  }, [])
  const selectUser = useCallback((user) => {
    if (user == 'alice') signInAsAlice()
    if (user == 'bob') signInAsBob()
    handleClose()
  }, [])

  useEffect(() => {
    IndexedDB.init();
  }, []);

  // Client ws
  const hostname = window.location.hostname
  const port = window.location.port
  const aliceCred = getAlice()
  const bobCred = getBob()

  const { blockchains } = config
  
  /** Alice clicks sign in to connect with ws */
  const signInAsAlice = useCallback(async () => {
    if (wallet.connected === true) { aliceCred.ethereum.public = wallet.data } else {
      walletStore.dispatch({ type: 'SET_WALLET_DATA', payload: aliceCred.ethereum })
      walletStore.dispatch({ type: 'SET_WALLET_BALANCE', payload: 1000 })
    }
    const alice = new SDK({
      id: 'alice',
      hostname, port, credentials: aliceCred, 
      blockchains: Object.assign({}, blockchains, {
          bitcoin: Object.assign({}, blockchains.bitcoin, aliceCred.bitcoin),
          ethereum: Object.assign({}, blockchains.ethereum, aliceCred.ethereum),
          lightning: Object.assign({}, blockchains.lightning, aliceCred.lightning)
      })
    })
    // alice.on(...onSwap('alice', 'swap.received'))
    //   .on(...onSwap('alice', 'swap.created'))
    //   .on(...onSwap('alice', 'swap.holder.invoice.created'))
    //   .on(...onSwap('alice', 'swap.holder.invoice.sent'))
    //   .on(...onSwap('alice', 'swap.seeker.invoice.created'))
    //   .on(...onSwap('alice', 'swap.seeker.invoice.sent'))
    //   .on(...onSwap('alice', 'swap.holder.invoice.paid'))
    //   .on(...onSwap('alice', 'swap.seeker.invoice.paid'))
    //   .on(...onSwap('alice', 'swap.holder.invoice.settled'))
    //   .on(...onSwap('alice', 'swap.seeker.invoice.settled'))
    //   .on(...onSwap('alice', 'swap.completed'))
    userStore.dispatch({ type: 'SIGN_IN', payload: alice })
    walletStore.dispatch({ type: 'SET_NODE_DATA', payload: alice.toJSON().blockchains })
    console.log("alice.toJSON()",alice.toJSON())
    walletStore.dispatch({ type: 'SET_NODE_BALANCE', payload: 1000 })
  }, [walletStore, aliceCred])

  /** Bob clicks sign in to connect with ws */
  const signInAsBob = useCallback(async () => {
    if (wallet.connected === true) { bobCred.ethereum.public = wallet.data } else {
      walletStore.dispatch({ type: 'SET_WALLET_DATA', payload: bobCred.ethereum })
      walletStore.dispatch({ type: 'SET_WALLET_BALANCE', payload: 1000 })
    }
    const bob = new SDK({ id: 'bob', hostname, port, credentials: bobCred, 
    blockchains: Object.assign({}, blockchains, {
        bitcoin: Object.assign({}, blockchains.bitcoin, bobCred.bitcoin),
        ethereum: Object.assign({}, blockchains.ethereum, bobCred.ethereum),
        lightning: Object.assign({}, blockchains.lightning, bobCred.lightning)
      })
    })
    // bob.on(...onSwap('bob', 'swap.received'))
    //   .on(...onSwap('bob', 'swap.created'))
    //   .on(...onSwap('bob', 'swap.holder.invoice.created'))
    //   .on(...onSwap('bob', 'swap.holder.invoice.sent'))
    //   .on(...onSwap('bob', 'swap.seeker.invoice.created'))
    //   .on(...onSwap('bob', 'swap.seeker.invoice.sent'))
    //   .on(...onSwap('bob', 'swap.holder.invoice.paid'))
    //   .on(...onSwap('bob', 'swap.seeker.invoice.paid'))
    //   .on(...onSwap('bob', 'swap.holder.invoice.settled'))
    //   .on(...onSwap('bob', 'swap.seeker.invoice.settled'))
    //   .on(...onSwap('bob', 'swap.completed'))
    userStore.dispatch({ type: 'SIGN_IN', payload: bob })
    walletStore.dispatch({ type: 'SET_NODE_DATA', payload: bob.toJSON().blockchains })
    walletStore.dispatch({ type: 'SET_NODE_BALANCE', payload: 1000 })
  }, [bobCred, walletStore])

  /** Log out from the server */
  const logOut = useCallback(() => {
    userStore.dispatch({ type: 'SIGN_OUT' })
    walletStore.dispatch({ type: 'CLEAR_NODE_DATA' })
    walletStore.dispatch({ type: 'CLEAR_WALLET_DATA' })
    console.log("user")
    console.log(user)
    return // Promise.all([user.user.stop()])
  }, [userStore, walletStore])

  if (isMobile) return <MobileWarningPage />

  return (
    <Grid container direction='column' sx={{backgroundColor:'#101010'}}>
      <Grid direction='row' container className={styles['page-header']}>
        <Grid item xs={3}>
          <img style={{ width: '40px' }} src='logo.png' />
        </Grid>
        <Grid item xs={6} className='flex-center'>
          <Typography className={styles['title']}>P2P DEX</Typography>
        </Grid>
        <Grid item xs={3} className='flex-center'>
          {(!user.isLoggedIn && isStart)
          && <>
            <Button 
              className='gradient-border-btn'
              id='connect-wallet'
              aria-controls={open ? 'connect-wallet' : undefined}
              aria-haspopup='true'
              aria-expanded={open ? 'true' : undefined}
              onClick={handleClick}
              sx={{ color: 'white', marginRight: '10px' }}
            >Demo</Button>
            <Button 
              className='gradient-border-btn'
              onClick={() => setIsStart(false)}
              style={{ color: 'white' }}
            >Connect Wallet(s)</Button>
            <Menu
              id='connect-wallet'
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                'aria-labelledby': 'connect-wallet'
              }}
            >
              <MenuItem disabled>Previous Logins:</MenuItem>
              <MenuItem onClick={() => selectUser('alice')}>Alice</MenuItem>
              <MenuItem onClick={() => selectUser('bob')}>Bob</MenuItem>
            </Menu>
          </>
          /*: <span>
            Signed in as&nbsp;<u>{user.user.id.toUpperCase()}</u>&nbsp;
            <Button
              id='logout'
              variant='contained'
              color='error'
              onClick={e => logOut()}
            ><b>Logout</b>
            </Button>
            </span>*/}
        </Grid>
      </Grid>
      <Grid item container justifyContent='flex-end' style={{ padding: '1em 2em' }}>
        
      </Grid>
      <Grid item container direction='row'>
        <Grid item container xs={((user.isLoggedIn || !isStart) && !isMinimized) ? 10 : 12} sx={{ transition: 'all 0.5s ease-in-out' }}>
          <SwapCreate />
        </Grid>
      </Grid>
      {/* <Grid item container direction='row'>
        <Grid item container direction='column' md={6} sm={12} spacing={6}>
          <Grid item>
            <WalletComponent />
          </Grid>
        </Grid>
        <Grid item container direction='column' md={6} sm={12} spacing={6}>
          <Grid item>
            <SwapCreate />
          </Grid>
          <Grid item>
            <SwapActivity />
          </Grid>
        </Grid>
      </Grid> */}
      {/* <WalletComponent />
      <SwapActivity /> */}

      <ConnectWalletContainer show={!isStart && !isMinimized} setIsMinimized={setIsMinimized} />
      <WalletInfoContainer show={user.isLoggedIn && !isMinimized} setIsMinimized={setIsMinimized} />
      <Footer />
      <ToastContainer />
      
      { isMinimized 
        && <Button className='show-right-container-btn' onClick={() => setIsMinimized(false)}>
            <KeyboardDoubleArrowLeft style={{color: '#6A6A6A', marginRight: '5px'}}/>
            Wallets
          </Button>
      }
    </Grid>
  )
}