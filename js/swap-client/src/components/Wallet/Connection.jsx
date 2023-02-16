import React, { useEffect, useState } from 'react';
import {
  Button,
  Grid,
  Icon
} from 'semantic-ui-react';
import { useAppDispatch, useAppSelector } from "../../hooks.js";
import { signIn, signOut } from '../../slices/userSlice.js';
import { clearNodeData, clearWalletData } from '../../slices/walletSlice';
import styles from '../styles/SwapHome.module.css';

export const ConnectionComponent = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.user);
  const activities = useAppSelector(state => state.activities);
  const secret = useAppSelector(state => state.secret);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [swapActivities, setSwapActivities] = useState(activities);
  const log = (message, obj, debug = true) => {
    if (debug) {
     console.log(message)
     console.log(obj)
    }
  }

  const logOut = () => {
    dispatch(signOut());
    dispatch(clearNodeData());
    dispatch(clearWalletData());
    // return Promise.all([alice.disconnect(), bob.disconnect()]);
    return Promise.all([user.user.disconnect()])
  }

  // useEffect(() => {
  //   if(user.isLoggedIn) {
  //     try {
  //       // setLoggedInUser(user.user.connect())
  //       log("user", user);
  //       const connected = user.user.connect().then(
  //         user.user.on("swap.created",swap => { 

  //           log("activities", swapActivities);
  //           log("secret", secret);
  //           const swapFromActivities = swapActivities.find(order => order.swapId === swap.id);

  //           log('swap.created!!!!!', swap)
  //           if(user.user.id == swap.secretSeeker.id){
  //             const network = swap.secretSeeker.network['@type'].toLowerCase();
  //             const credentials = user.user.credentials;
  //             user.user.swapOpen(swap, { [network]: credentials[network]});
  //           }
  //         })
  //         .on("swap.opening",swap => { 
  //           log('swap.opening!!!!!', swap)
  //           if(user.user.id == swap.secretHolder.id){
  //             const network = swap.secretHolder.network['@type'].toLowerCase();
  //             const credentials = user.user.credentials;
  //             user.user.swapOpen(swap, { [network]: credentials[network], secret: swapActivities.secret})
  //           }
  //         })
  //         .on("swap.opened",swap => { 
  //           log('swap.opened!!!!!', swap)
  //           user.user.swapOpen(swap, 
  //             user.user.id == swap.secretHolder.id  ? swap.secretHolder.network.name : swap.secretSeeker.network.name,
  //             user.user.id == swap.secretHolder.id ? swap.secretHash : ''
  //           )
  //         })
  //       )
  //       // log("connected", connected)
  //       // log("user", user)
  //       // connected.then((data)=>{log("connected",data)})
  //       // connected.finally((data)=>{log("finally",data)})
  //       // user.user.websocket.onopen(data => {log("user.user.websocket.onopen", data)})
  //       // user.user.websocket.onmessage(data => {log("user.user.websocket.onmessage", data)})
  //       // connected.onmessage(event => {
  //       //   log("user.user.onmessage", event);
  //       // })

  //     // if(loggedInUser!=null) {
  //     //   log("loggedInUser", loggedInUser);
  //     //   loggedInUser.onmessage((data)=> {
  //     //     log("user logged in, data", data);
  //     //   });
  //     // }
  //       // .then(res => {
  //       //   if (!res.ok) {
  //       //     throw Error("something wrong, çould not connect to resource");
  //       //   }
  //       // })
  //       // .catch( error => {
  //       //     console.warn(`sorry an error occurred, due to ${error.message} `);
  //       //     console.log({error})
  //       // });
  //     } catch (error) {
  //       console.warn(`sorry an error occurred, due to ${error.message} `);
  //       logOut();
  //     }
  //   } else {
  //     return function cleanup() {
  //       user.user.disconnect();
  //     }
  //   }

  // }, []);




  useEffect(() => {
    setSwapActivities(activities);
  }, [activities])


  return (
    <Grid.Row className='space-between'>
      <Grid.Column >
        <h4><Icon name='stop' className={styles.allSystemOk}/>All systems ok!</h4>
      </Grid.Column>
    </Grid.Row>
  );
}
