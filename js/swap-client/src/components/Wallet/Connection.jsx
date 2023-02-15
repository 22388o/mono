import React, { useEffect, useState } from 'react';
import { 
  Button, 
  Grid, 
  Icon 
} from 'semantic-ui-react';
import { useAppDispatch, useAppSelector } from "../../hooks.js";
import styles from '../styles/SwapHome.module.css';

export const ConnectionComponent = () => {
  const user = useAppSelector(state => state.user);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const log = (message, obj, debug = true) => {
    if (debug) {
     console.log(message)
     console.log(obj)
    }
  }
  
  useEffect(() => {
    try {
        // setLoggedInUser(user.user.connect())
        const connected = user.user.connect()
        log("connected", connected)
        connected.onopen(()=>{log("connected",this)})
        connected.onmessage(event => {
          log("user.user.onmessage", event);
        })
      
      // if(loggedInUser!=null) {
      //   log("loggedInUser", loggedInUser);
      //   loggedInUser.onmessage((data)=> {
      //     log("user logged in, data", data);
      //   });
      // }
        // .then(res => {
        //   if (!res.ok) {
        //     throw Error("something wrong, çould not connect to resource");
        //   }
        // })
        // .catch( error => {
        //     console.warn(`sorry an error occurred, due to ${error.message} `);
        //     console.log({error})
        // });
    } catch (error) {
      console.warn(`sorry an error occurred, due to ${error.message} `);
    }

    // return function cleanup() {
    //   user.user.disconnect();
    // }

  }, []);
  return (
    <Grid.Row className='space-between'>
      <Grid.Column >
        <h4><Icon name='stop' className={styles.allSystemOk}/>All systems ok!</h4>
      </Grid.Column>
    </Grid.Row>
  );
}