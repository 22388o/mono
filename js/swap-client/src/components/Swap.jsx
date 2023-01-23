import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Button, Header, Image, Modal, Form, TextArea } from 'semantic-ui-react'
import { useAppDispatch, useAppSelector } from "../hooks.js";
import { signIn, signOut } from '../slices/userSlice.js';
import styles from './styles/Swap.module.css';

export const Swap = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.user);
  const [open, setOpen] = useState(false);

  const logIn = () => {
    dispatch(signIn(data));
    setOpen(false);
  }
  
  const signInAsAlice = () => {
    dispatch(signIn('alice'));
    setOpen(false);
  }

  const signInAsCarol = () => {
    dispatch(signIn('carol'));
    setOpen(false);
  }

  const logOut = () => {
    dispatch(signOut());
    setOpen(false);
  }

  return (
    <div className="App">
      { !user.isLoggedIn && <Button color='green' className={styles.signin} onClick={e => setOpen(true)}>
        Sign in   
      </Button> }
      { user.isLoggedIn && <Button color='red' className={styles.signin} onClick={e => logOut(true)}>
        Logout   
      </Button> }
      <div>
        <Image
          centered
          circular
          size='large'
          src='https://pbs.twimg.com/profile_banners/1082726135941586949/1650477093/1500x500'
        />
        <Header as='h2' icon textAlign='center'>
          <Header.Content>Portal Lightning Swap Demo</Header.Content>
        </Header>
        <br />
      </div>
      <Outlet />
      {/* <SwapDemo /> */}
      <Modal
        dimmer={'blurring'}
        open={open}
        onClose={() => setOpen(false)}
        className={styles.signInModal}
      >
        <Modal.Header>Enter your credentials</Modal.Header>
        <Modal.Content>
          
        </Modal.Content>
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
          <Button onClick={signInAsAlice} left>
            Sign in as Alice
          </Button>
          <Button onClick={signInAsCarol}>
            Sign in as Carol
          </Button>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <Button type='submit' onClick={(e) => {logIn(e.data)}}>Sign In</Button>
        </Form>
        </Modal.Actions>
      </Modal>
    </div>
  );
}
