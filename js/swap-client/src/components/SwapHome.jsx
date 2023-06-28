<<<<<<< HEAD
import React, { useSyncExternalStore } from 'react';
import RectangleRoundedIcon from '@mui/icons-material/RectangleRounded';
=======
import React, { useState, useEffect } from 'react';
import { Button, Dropdown, Header, Image, Grid, Menu, Modal, Form, TextArea, Icon } from 'semantic-ui-react';
>>>>>>> master
import { SwapCreate } from './SwapCreate/SwapCreate';
import { SwapActivity } from './SwapActivity/SwapActivity';
import { WalletComponent } from './Wallet/WalletComponent';
import { ConnectionComponent } from './Wallet/Connection';
<<<<<<< HEAD
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import { getAlice, getBob } from '../utils/constants';
import Client from '../utils/client';
import { Menu, MenuItem, Button, Grid } from '@mui/material';
import styles from '../styles/SwapHome.module.css';
import { userStore } from '../syncstore/userstore';
import { walletStore } from '../syncstore/walletstore';

export const SwapHome = () => {
  const user = useSyncExternalStore(userStore.subscribe, () => userStore.currentState);
  const globalWallet = useSyncExternalStore(walletStore.subscribe, () => walletStore.currentState);
  const wallet = globalWallet.assets[1];

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = anchorEl !== null;
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const selectUser = (user) => {
    if (user == "alice") signInAsAlice();
    if (user == "bob") signInAsBob();
    handleClose();
  }

  
=======
import styles from './styles/SwapHome.module.css';
import { useAppDispatch, useAppSelector } from "../hooks.js";
import { signIn, signOut } from '../slices/userSlice.js';
import { setNodeData, 
         setWalletData,
         setNodeBalance,
         setWalletBalance, 
         clearNodeData, 
         clearWalletData } from '../slices/walletSlice';
import { 
	updateSwapInfo, 
	updateSwapStatus 
} from "../slices/activitiesSlice.js";

import { getAlice, getBob } from '../utils/constants';
import Client from '../utils/client';

export const SwapHome = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.user);
  const activities = useAppSelector(state => state.activities.activities);
  const secret = '';
  const [open, setOpen] = useState(false);

  const log = (message, obj, debug = true) => {
    if (debug) {
     console.log(message)
     console.log(obj)
    }
  }
  
	// const simulateOpen = async (index, participant, swapId, id, secret, firstParty) => {
	// 	openSwap({participant, swapId, id, secret})
	// 	.then(data => {
	// 		if(firstParty) 	dispatch(updateSwapInfo({index, field: 'request1', info: data.publicInfo.request}))
	// 		else						dispatch(updateSwapInfo({index, field: 'request2', info: data.publicInfo.request}));
	// 	})
	// 	.catch(err => console.log(err));
	// }

	// const simulateCommit = async (index, participant, swapId, id, firstParty) => {
	// 	commitSwap({swapId, id, participant})
	// 	.then(data => {
	// 		if(firstParty)	dispatch(updateSwapInfo({index, field: 'commit1', info: true}));
	// 		else 						dispatch(updateSwapInfo({index, field: 'commit2', info: true}));
	// 	})
	// 	.catch(err => console.log(err));
	// }

  // useEffect(() => {
  //   activities.forEach((swap, index) => {
  //     if(swap.status === 1 && swap.swapHash && (!swap.request1 && !swap.arequest2)) {
  //       setTimeout(() => {
  //         simulateOpen(swap.swapId, alice, swap.swapId, swap.secretSeekerId, null, true);
  //         dispatch(updateSwapStatus({index: swap.swapId, status: 1}));
  //         console.log("alice opens the swap");
  //         }, 1000
  //       );
  //     }
  //     if(swap.status === 1 && ((swap.request1 && !swap.request2) || (!swap.request1 && swap.request2))) {
  //       setTimeout(() => {
  //         console.log("bob opens the swap");
  //         simulateOpen(swap.swapId, bob, swap.swapId, swap.secretHolderId, swap.secret, false);
  //         dispatch(updateSwapStatus({index: swap.swapId, status: 2}));
  //         }, 1000
  //       );
  //     }
  //     if(swap.status === 2 && swap.request1 && swap.request2){
  //       setTimeout(() => {
  //         console.log("alice commits the swap");
  //         simulateCommit(swap.swapId, alice, swap.swapId, swap.secretSeekerId, true);
  //         dispatch(updateSwapStatus({index: swap.swapId, status: 3}));
  //         }, 1000
  //       );
  //     }
  //     if(swap.status === 3 && swap.commit1 && !swap.commit2){
  //       setTimeout(() => {
  //         console.log("bob commits the swap");
  //         simulateCommit(swap.swapId, bob, swap.swapId, swap.secretHolderId, false);
  //         dispatch(updateSwapStatus({index: swap.swapId, status: 4}));
  //         }, 1000
  //       );
  //     }
  //     if(swap.status === 4 && swap.commit1 && swap.commit2){
  //       setTimeout(() => {
  //         dispatch(updateSwapStatus({index: swap.swapId, status: 5}));
  //         }, 1000
  //       );
  //     }
  //   });
  // }, [activities]);

>>>>>>> master
  // Client ws
  const hostname = window.location.hostname;
  const port = window.location.port;
  let aliceCred = getAlice();
  let bobCred = getBob();
<<<<<<< HEAD
  
  const signInAsAlice = () => {
    if(wallet.connected === true)
      aliceCred.ethl2.public = wallet.data;
    else {
      walletStore.dispatch({ type: 'SET_WALLET_DATA', payload: aliceCred.ethl2});
      walletStore.dispatch({ type: 'SET_WALLET_BALANCE', payload: 1000});
    }
    const alice = new Client({ id: 'alice', hostname, port, credentials: aliceCred });
    userStore.dispatch({ type: 'SIGN_IN', payload: alice });
    walletStore.dispatch({ type: 'SET_NODE_DATA', payload: alice.credentials.lightning});
    walletStore.dispatch({ type: 'SET_NODE_BALANCE', payload: 1000});
  }
  
  const signInAsBob = () => {
    if(wallet.connected === true)
      bobCred.ethl2.public = wallet.data;
    else {
      walletStore.dispatch({ type: 'SET_WALLET_DATA', payload: bobCred.ethl2});
      walletStore.dispatch({ type: 'SET_WALLET_BALANCE', payload: 1000});
    }
    const bob = new Client({ id: 'bob', hostname, port, credentials: bobCred });
    userStore.dispatch({ type: 'SIGN_IN', payload: bob })
    walletStore.dispatch({ type: 'SET_NODE_DATA', payload: bob.credentials.lightning});
    walletStore.dispatch({ type: 'SET_NODE_BALANCE', payload: 1000});
  }

  const logOut = () => {
    userStore.dispatch({ type: 'SIGN_OUT' });
    walletStore.dispatch({ type: 'CLEAR_NODE_DATA'});
    walletStore.dispatch({ type: 'CLEAR_WALLET_DATA'});
    return Promise.all([user.user.disconnect()])
  }

  return (
    <Grid container direction='column' style={{backgroundColor:'#242424'}}>
      <Grid direction='row' container className={styles['page-header']}>
        <Grid item xs={1}>
          <img style={{width:'24px'}} src='https://i.imgur.com/ztFM4Jq.png' />
        </Grid>
        <Grid item xs={10} className='flex-center'>
          { user.isLoggedIn ?
            <ConnectionComponent/> :
            <h4 className='flex-center'><RectangleRoundedIcon />&nbsp;Disconnected</h4>}
        </Grid>
        <Grid item xs={1}>
          <h4>v0.2</h4>
        </Grid>
      </Grid>
      <Grid item container justifyContent='flex-end' style={{padding:'1em 2em'}}>
        { !user.isLoggedIn
            ? <>
                <Button
                  id="connect-wallet"
                  aria-controls={open ? 'connect-wallet' : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? 'true' : undefined}
                  onClick={handleClick}
                  variant='contained'
                  style={{color:'white'}}
                >
                  <BusinessCenterIcon />Connect Wallet
                </Button>
                <Menu
                  id="connect-wallet"
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  MenuListProps={{
                    'aria-labelledby': 'connect-wallet',
                  }}
                >
                  <MenuItem disabled>Previous Logins:</MenuItem>
                  <MenuItem onClick={() => selectUser('alice')}>Alice</MenuItem>
                  <MenuItem onClick={() => selectUser('bob')}>Bob</MenuItem>
                </Menu>
              </> 
            : <span>
                Signed in as&nbsp;<u>{user.user.id.toUpperCase()}</u>&nbsp;
                <Button variant='contained' color='error' onClick={e => logOut()}><b>Logout</b></Button>
              </span>
        }
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
    </Grid>
  );
=======
	const alice = new Client({ id: 'alice', hostname, port, credentials: aliceCred });
	const bob = new Client({ id: 'bob', hostname, port, credentials: bobCred });


  

 
  const logIn = (data) => {
    dispatch(signIn(data));
    setOpen(false);
  }
  
  const signInAsAlice = () => {
    // console.log({alice})
    // console.log({aliceCred})
    dispatch(signIn(alice));
    // console.log({user});
    dispatch(setNodeData(alice.credentials.lightning));
    dispatch(setWalletData(alice.credentials.ethereum));
    dispatch(setNodeBalance(1));
    dispatch(setWalletBalance(1));
    setOpen(false);
    // return Promise.all([alice.connect()]);
  }

  const signInAsBob = () => {
    dispatch(signIn(bob));
    dispatch(setNodeData(bob.credentials.lightning));
    dispatch(setWalletData(bob.credentials.ethereum));
    dispatch(setNodeBalance(1));
    dispatch(setWalletBalance(1));
    setOpen(false);
    // return Promise.all([bob.connect()]);
  }

  const logOut = () => {
    dispatch(signOut());
    dispatch(clearNodeData());
    dispatch(clearWalletData());
    setOpen(false);
    // return Promise.all([alice.disconnect(), bob.disconnect()]);
    return Promise.all([user.user.disconnect()])
  }

  const savedLogins = [
    {
      key: 'user',
      text: (
        <span>
          Previous logins:
        </span>
      ),
      disabled: true,
    },
    { key: "alice", text: "alice", name: "alice", value: "alice" },
    { key: "bob", text: "bob", name: "bob", value: "bob" }
  ];
  const selectSavedLogin = (e, { value }) => {
    log("e",e)
    log("value",value)
    setSelectedLogin(value.name)
    if (value == "alice") signInAsAlice()
    if (value == "bob") signInAsBob()
  };
  const trigger = (
    <span className={styles.coinType}>
      <Icon name='suitcase' /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Connect Wallet
    </span>
  )

  const [selectedLogin, setSelectedLogin] = useState();


  return (
    <div id="container">
      <Menu.Menu className='nav-container'>
        <Menu.Item name='logo'>
          <img src='https://portaldefi.com/assets/favicon.png' />
        </Menu.Item>
        <Menu.Item name='ok'>
          { user.isLoggedIn ?
            <ConnectionComponent/> :
            <h4><Icon name='stop' className={styles.disconnected}/>Disconnected</h4>}
        </Menu.Item>
        <Menu.Item name='signin'>
          <h4>v0.1</h4>
        </Menu.Item>
      </Menu.Menu>
      <div className='sign-in-container'>
        { !user.isLoggedIn 
            ? <>
              <Form.Field className={styles.coinType}>
                <Dropdown 
                 icon=''
                  className={styles.swapCoinSelect}
                  placeholder='Connect'
                  compact
                  selection
                  value={selectedLogin}
                  onChange={selectSavedLogin}
                  options={savedLogins}
                  trigger={trigger}
                />
              </Form.Field>
              </>
            : <>
                <Menu.Menu position='right'>
                  <Menu.Item name='logout'>
                    <Button inverted color='red' onClick={e => logOut()}>Logout</Button>
                  </Menu.Item>
                </Menu.Menu>
                {user.credentials!=null && <Menu.Menu position='right'>
                  <Menu.Item name='logout' onClick={() => console.log(user)}>
                    Signed in as {JSON.stringify(user.credentials.lightning.admin).slice(0, 18).replace(/['"]+/g, '')}
                  </Menu.Item>
                </Menu.Menu>}
              </> 
        }
      </div>
      <div>
        {/* <Image
          centered
          circular
          size='large'
          src='https://pbs.twimg.com/profile_banners/1082726135941586949/1650477093/1500x500'
        />
        <Header as='h2' icon textAlign='center'>
          <Header.Content>Portal Lightning Swap Demo</Header.Content>
        </Header>
        <br /> */}
      </div><br />
      <Grid className={styles.homeContainer} centered>
        <Grid.Column className={styles.column}>
          <Grid.Row centered className='mb-3'>
            <WalletComponent />
          </Grid.Row>
          <Grid.Row>
            <SwapActivity />
          </Grid.Row>
        </Grid.Column>
        <Grid.Column className={styles.column}>
          <Grid.Row>
            <SwapCreate />
          </Grid.Row>
        </Grid.Column>
      </Grid>
    </div>
  )
>>>>>>> master
}
