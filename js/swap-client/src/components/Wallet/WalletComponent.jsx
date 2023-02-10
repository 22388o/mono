import React, { useEffect } from 'react';
import {
  Button, 
  Divider, 
  Form, 
  Grid,
  Modal,
  TextArea,
} from 'semantic-ui-react';
import { WalletItem } from './WalletItem';
import styles from '../styles/wallet/WalletComponent.module.css';
import { useState } from 'react';
import { setNodeData, setWalletData } from '../../slices/walletSlice';
import { useAppDispatch, useAppSelector } from "../../hooks.js";


export const WalletComponent = () => {
  const dispatch = useAppDispatch();
  const [nodeModalOpen, setNodeModalOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const node= useAppSelector(state => state.wallet.node);
  const wallet = useAppSelector(state => state.wallet.wallet);

  useEffect(() => {
    console.log({wallet})
    if (node.connected) {
      setNodeModalOpen(false);
    }
    if (wallet.connected) {
      setWalletModalOpen(false);
    }
  }, [node, wallet]);

  const onConnectNode = () => {
    dispatch(setNodeData({
      'lightning': {
      'admin': '',
      'invoice': '',
      'socket': '',
      'cert': '',
    }}));
    setNodeModalOpen(false);
  }
  const onConnectWallet = () => {
    dispatch(setWalletData('0xab5801a7d398351b8be11c439e05c5b3259aec9b'));
    setWalletModalOpen(false);
  }

  return (
    <>
      <Grid className={styles.walletContainer}>
        <Grid.Row className={styles.walletHeader}>
        <h3>Funds</h3>
        </Grid.Row>
        <WalletItem type='bitcoin' item={node} onConnect={() => setNodeModalOpen(true)} />
        <Divider />
        <WalletItem type='ethereum' item={wallet} onConnect={() => setWalletModalOpen(true)} />
      </Grid>
      <Modal
        basic
        closeIcon
        dimmer={'blurring'}
        open={nodeModalOpen}
        onOpen={() => setNodeModalOpen(true)}
        onClose={() => setNodeModalOpen(false)}
        className={styles.connectModal}
      >
        <Modal.Header><img className="ui avatar image" src="https://github.com/dapphub/trustwallet-assets/blob/master/blockchains/bitcoin/info/logo.png?raw=true" />&nbsp;Bitcoin</Modal.Header>
        <Modal.Content className='pb-1 pt-1'>
          <Form className={styles.connectForm}>
            <Form.Field>
              <label>Lightning Network Client Info</label>
              <TextArea placeholder="{
                'lightning': {
                'admin': ',
                'invoice': ',
                'socket': ',
                'cert': ',
                }'" />
            </Form.Field>
          </Form>
        </Modal.Content>
        <Modal.Actions className='pt-0'>
          <Button circular secondary className='gradient-btn w-100 h-3' onClick={e => onConnectNode()}>Connect Node</Button>
        </Modal.Actions>
      </Modal>
      <Modal
        basic
        closeIcon
        dimmer={'blurring'}
        open={walletModalOpen}
        onOpen={() => setWalletModalOpen(true)}
        onClose={() => setWalletModalOpen(false)}
        className={styles.connectModal}
      >
        <Modal.Header><img className="ui avatar image" src="https://github.com/dapphub/trustwallet-assets/blob/master/blockchains/ethereum/info/logo.png?raw=true" />&nbsp;Ethereum</Modal.Header>
        <Modal.Content className='pb-1 pt-1'>
          <Form className={styles.connectForm}>
            <Form.Field>
              <label>Private Key</label>
              <TextArea placeholder="0xab5801a7d398351b8be11c439e05c5b3259aec9b" />
            </Form.Field>
          </Form>
        </Modal.Content>
        <Modal.Actions className='pt-0'>
          <Button circular secondary className={styles.gradientBack} onClick={e => onConnectWallet()}>Connect Wallet</Button>
        </Modal.Actions>
      </Modal>
    </>
  );
}
