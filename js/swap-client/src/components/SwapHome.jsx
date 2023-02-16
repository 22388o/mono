import React, { useState, useEffect } from 'react';
import { Button, Header, Image, Grid, Menu, Modal, Form, TextArea, Icon } from 'semantic-ui-react';
import { SwapCreate } from './SwapCreate/SwapCreate';
import { SwapActivity } from './SwapActivity/SwapActivity';
import { WalletComponent } from './Wallet/WalletComponent';
import { ConnectionComponent } from './Wallet/Connection';
import styles from './styles/SwapHome.module.css';
import { useAppDispatch, useAppSelector } from "../hooks.js";
import { signIn, signOut } from '../slices/userSlice.js';
import { setNodeData, setWalletData, clearNodeData, clearWalletData } from '../slices/walletSlice';
import { 
	updateSwapInfo, 
	updateSwapStatus 
} from "../slices/activitiesSlice.js";
import { 
  openSwap,
  commitSwap
} from "../utils/apis";
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
  
	const simulateOpen = async (index, participant, swapId, id, secret, firstParty) => {
		openSwap({participant, swapId, id, secret})
		.then(data => {
			if(firstParty) 	dispatch(updateSwapInfo({index, field: 'request1', info: data.publicInfo.request}))
			else						dispatch(updateSwapInfo({index, field: 'request2', info: data.publicInfo.request}));
		})
		.catch(err => console.log(err));
	}

	const simulateCommit = async (index, participant, swapId, id, firstParty) => {
		commitSwap({swapId, id, participant})
		.then(data => {
			if(firstParty)	dispatch(updateSwapInfo({index, field: 'commit1', info: true}));
			else 						dispatch(updateSwapInfo({index, field: 'commit2', info: true}));
		})
		.catch(err => console.log(err));
	}

  useEffect(() => {
    activities.forEach((swap, index) => {
      if(swap.status === 1 && swap.swapHash && (!swap.request1 && !swap.arequest2)) {
        setTimeout(() => {
          simulateOpen(swap.swapId, alice, swap.swapId, swap.secretSeekerId, null, true);
          dispatch(updateSwapStatus({index: swap.swapId, status: 1}));
          console.log("alice opens the swap");
          }, 1000
        );
      }
      if(swap.status === 1 && ((swap.request1 && !swap.request2) || (!swap.request1 && swap.request2))) {
        setTimeout(() => {
          console.log("bob opens the swap");
          simulateOpen(swap.swapId, bob, swap.swapId, swap.secretHolderId, swap.secret, false);
          dispatch(updateSwapStatus({index: swap.swapId, status: 2}));
          }, 1000
        );
      }
      if(swap.status === 2 && swap.request1 && swap.request2){
        setTimeout(() => {
          console.log("alice commits the swap");
          simulateCommit(swap.swapId, alice, swap.swapId, swap.secretSeekerId, true);
          dispatch(updateSwapStatus({index: swap.swapId, status: 3}));
          }, 1000
        );
      }
      if(swap.status === 3 && swap.commit1 && !swap.commit2){
        setTimeout(() => {
          console.log("bob commits the swap");
          simulateCommit(swap.swapId, bob, swap.swapId, swap.secretHolderId, false);
          dispatch(updateSwapStatus({index: swap.swapId, status: 4}));
          }, 1000
        );
      }
      if(swap.status === 4 && swap.commit1 && swap.commit2){
        setTimeout(() => {
          dispatch(updateSwapStatus({index: swap.swapId, status: 5}));
          }, 1000
        );
      }
    });
  }, [activities]);

  // Client ws
  const hostname = window.location.hostname;
  const port = window.location.port;
  let aliceCred = getAlice();
  let bobCred = getBob();
	// const [alice, setAlice] = useState(new Client({ id: 'alice', hostname, port, credentials: aliceCred }));
	// const [bob, setBob] = useState(new Client({ id: 'bob', hostname, port, credentials: bobCred }));
	const alice = new Client({ id: 'alice', hostname, port, credentials: aliceCred });
	const bob = new Client({ id: 'bob', hostname, port, credentials: bobCred });


  


  // useEffect(() => {
  //   if(user.isLoggedIn) {
      
  //   }
  // },[])

  // alice
  // .once('swap.created', swap => { aliceSwapCreated = swap })
  // .once('swap.opened', swap => { aliceSwapOpened = swap })
  // .once('swap.committed', swap => { aliceSwapCommitted = swap })

  // bob
  // .once('swap.created', swap => { bobSwapCreated = swap })
  // .once('swap.opened', swap => { bobSwapOpened = swap })
  // .once('swap.committed', swap => { bobSwapCommitted = swap })

  
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
    setOpen(false);
    // return Promise.all([alice.connect()]);
  }

  const signInAsBob = () => {
    dispatch(signIn(bob));
    dispatch(setNodeData(bob.credentials.lightning));
    dispatch(setWalletData(bob.credentials.ethereum));
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
              {/* <Button primary onClick={() => setOpen(true)} className='gradient-btn'>Sign In</Button>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; */}
              <Button onClick={signInAsAlice}>
                Sign in as Alice
              </Button>
              <Button onClick={signInAsBob}>
                Sign in as Bob
              </Button>
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
      <Modal
        basic
        closeIcon
        dimmer={'blurring'}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        className={styles.signInModal}
      >
        <Modal.Header>Enter your credentials</Modal.Header>
        <Modal.Actions>
          
        <Form>
          <Form.Field>
            <label>Lightning Network Client Info</label>
            <TextArea placeholder="Input in JSON format: {
                isSecretHolder: true,
                secret: secret,
                left: {
                  client: 'ln-client',
                  node: 'lnd',
                  request: null,
                  clientInfo: {
                    cert: '',
                    adminMacaroon: '',
                    invoiceMacaroon: '',
                    socket: 'localhost:00000'
                  },
                  lnd: {
                    admin: null,
                    invoice: null
                  }
                },
                right: {
                    client: 'ln-client',
                    node: 'lnd',
                    request: null,
                    clientInfo: {
                        cert: '',
                        adminMacaroon: '',
                        invoiceMacaroon: '',
                        socket: 'localhost:00000'
                    },
                    lnd: {
                        admin: null,
                        invoice: null
                    }
                }
              }" />
          </Form.Field>
          <Form.Field>
            <label>Ethereum Private Key</label>
            <input placeholder='Ethereum Private Key' />
          </Form.Field>
          <Button type='submit' onClick={(e) => {logIn(e.data)}} className='gradient-btn'>Sign In</Button>
        </Form>
        </Modal.Actions>
      </Modal>
    </div>
  )
}
