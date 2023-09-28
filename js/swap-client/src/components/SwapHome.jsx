import React, { useCallback, useSyncExternalStore } from 'react'
import RectangleRoundedIcon from '@mui/icons-material/RectangleRounded'
import { SwapCreate } from './SwapCreate/SwapCreate'
import { SwapActivity } from './SwapActivity/SwapActivity'
import { WalletComponent } from './Wallet/WalletComponent'
import { ConnectionComponent } from './Wallet/Connection'
import { getAlice, getBob } from '../utils/constants'
import Sdk from '@portaldefi/sdk'
import { Menu, MenuItem, Button, Grid, Typography } from '@mui/material'
import styles from '../styles/SwapHome.module.css'
import { userStore } from '../syncstore/userstore'
import { walletStore } from '../syncstore/walletstore'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useEffect } from 'react'
import { IndexedDB } from '@portaldefi/sdk';
import { isMobile } from 'react-device-detect';
import { MobileWarningPage } from './MobileWarningPage'

export const SwapHome = () => {
  const user = useSyncExternalStore(userStore.subscribe, () => userStore.currentState)
  const globalWallet = useSyncExternalStore(walletStore.subscribe, () => walletStore.currentState)
  const wallet = globalWallet.assets[1]

  const [anchorEl, setAnchorEl] = React.useState(null)
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

  /** Alice clicks sign in to connect with ws */
  const signInAsAlice = useCallback(() => {
    if (wallet.connected === true) { aliceCred.ethereum.public = wallet.data } else {
      walletStore.dispatch({ type: 'SET_WALLET_DATA', payload: aliceCred.ethereum })
      walletStore.dispatch({ type: 'SET_WALLET_BALANCE', payload: 1000 })
    }
    const alice = new Sdk({ network: { id: 'alice', hostname, port }, credentials: aliceCred })
    userStore.dispatch({ type: 'SIGN_IN', payload: alice })
    walletStore.dispatch({ type: 'SET_NODE_DATA', payload: alice.credentials.lightning })
    walletStore.dispatch({ type: 'SET_NODE_BALANCE', payload: 1000 })
  }, [walletStore, aliceCred])

  /** Bob clicks sign in to connect with ws */
  const signInAsBob = useCallback(() => {
    if (wallet.connected === true) { bobCred.ethereum.public = wallet.data } else {
      walletStore.dispatch({ type: 'SET_WALLET_DATA', payload: bobCred.ethereum })
      walletStore.dispatch({ type: 'SET_WALLET_BALANCE', payload: 1000 })
    }
    const bob = new Sdk({ network: { id: 'bob', hostname, port }, credentials: bobCred })
    userStore.dispatch({ type: 'SIGN_IN', payload: bob })
    walletStore.dispatch({ type: 'SET_NODE_DATA', payload: bob.credentials.lightning })
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
          {!user.isLoggedIn
          ? <>
            <Button 
              className='gradient-border-btn'
              id='connect-wallet'
              aria-controls={open ? 'connect-wallet' : undefined}
              aria-haspopup='true'
              aria-expanded={open ? 'true' : undefined}
              onClick={handleClick}
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
          : <span>
            Signed in as&nbsp;<u>{user.user.id.toUpperCase()}</u>&nbsp;
            <Button
              id='logout'
              variant='contained'
              color='error'
              onClick={e => logOut()}
            ><b>Logout</b>
            </Button>
          </span>}
        </Grid>
      </Grid>
      <Grid item container justifyContent='flex-end' style={{ padding: '1em 2em' }}>
        
      </Grid>
      <Grid item container direction='row'>
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
      </Grid>
      <ToastContainer />
    </Grid>
  )
}
