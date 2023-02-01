import React from 'react';
import { 
  Button, 
  Divider, 
  Form, 
  Grid,
  Icon,
  Modal,
  TextArea,
} from 'semantic-ui-react'
import { WalletItem } from './WalletItem';
import styles from '../styles/wallet/WalletComponent.module.css';
import { useState } from 'react';

export const WalletComponent = () => {
  const [nodeModalOpen, setNodeModalOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  return (
    <>
      <Grid className={styles.walletContainer}>
        <Grid.Row className={styles.walletHeader}>
        <h3>Funds</h3>
          { /*<span>
            <Button circular secondary className={styles.gradientBorder}><Icon name="arrow left" className={styles.leftArrow} />Receive</Button>
            <Button circular secondary className={styles.gradientBorder}><Icon name="arrow right" className={styles.rightArrow} />&nbsp;Send</Button>
          </span>*/ }
        </Grid.Row>
        <WalletItem type='bitcoin' connect='node' onConnect={() => setNodeModalOpen(true)} />
        <Divider />
        <WalletItem type='ethereum' connect='wallet' onConnect={() => setWalletModalOpen(true)} />
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
              <TextArea placeholder="0xdB055877e6c13b6A6B25aBcAA29B393777dD0a73" />
            </Form.Field>
          </Form>
        </Modal.Content>
        <Modal.Actions className='pt-0'>
          <Button circular secondary className={styles.gradientBack} onClick={e => onConnectNode()}>Connect Wallet</Button>
        </Modal.Actions>
      </Modal>
    </>
  );
}
