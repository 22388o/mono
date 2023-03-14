import React, { useState, useEffect } from 'react';
import { Button, Dropdown, Header, Image, Grid, Menu, Modal, Form, TextArea, Icon } from 'semantic-ui-react';
import { SwapCreate } from './SwapCreate/SwapCreate';
import { SwapActivity } from './SwapActivity/SwapActivity';
import { WalletComponent } from './Wallet/WalletComponent';
import { ConnectionComponent } from './Wallet/Connection';
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
  
  // Client ws
  const hostname = window.location.hostname;
  const port = window.location.port;
  let aliceCred = getAlice();
  let bobCred = getBob();
	const alice = new Client({ id: 'alice', hostname, port, credentials: aliceCred });
	const bob = new Client({ id: 'bob', hostname, port, credentials: bobCred });
 
  const logIn = (data) => {
    dispatch(signIn(data));
    setOpen(false);
  }
  
  const signInAsAlice = () => {
    // log("alice", alice);
    // log("aliceCred", aliceCred);
    dispatch(signIn(alice));
    // log("user", user);
    dispatch(setNodeData(alice.credentials.lightning));
    dispatch(setWalletData(alice.credentials.ethereum));
    // dispatch(setNodeBalance(1));
    // dispatch(setWalletBalance(1));
    setOpen(false);
  }

  const signInAsBob = () => {
    dispatch(signIn(bob));
    dispatch(setNodeData(bob.credentials.lightning));
    dispatch(setWalletData(bob.credentials.ethereum));
    // dispatch(setNodeBalance(1));
    // dispatch(setWalletBalance(1));
    setOpen(false);
  }

  const logOut = () => {
    dispatch(signOut());
    dispatch(clearNodeData());
    dispatch(clearWalletData());
    setOpen(false);
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
}
