<<<<<<< HEAD
import React from 'react';
import { Grid, Button, Stack } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export const WalletItem = ({item, setNodeModalOpen, setWalletModalOpen}) => {
  const type = item.title;
  const onClick = item.title === 'Bitcoin' ? setNodeModalOpen : setWalletModalOpen;
  return (
    <Grid container direction='row' spacing={1}>
      <Grid item xs={1} textAlign='left'>
        <img width={32} className="ui avatar image" src={item.img_url} />
      </Grid>
      <Grid item xs={5} textAlign='left'>
        <Stack direction='column'>
          <b>{ item.title }</b>
          <span style={{fontSize:'0.8em',color:'grey',marginTop:'-5px'}}>{ item.type }</span>
        </Stack>
      </Grid>
      <Grid item xs={6} textAlign='right'>
        { (!item.connected && (item.title === 'Bitcoin' || item.title === 'Ethereum'))
            ? <Button className='gradient-btn' onClick={e => onClick()}>Connect {item.title === 'Bitcoin' ? 'Node' : 'Wallet'}</Button>
            : <h4 style={{display:'flex',alignItems:'center',justifyContent:'flex-end'}}>
                <b>{ Number(Number(item.balance).toFixed(15)) }</b>
                <span style={{fontSize:'0.8em',color:'grey',margin:'0 0.1em'}}>{ item.type }</span>
                <ChevronRightIcon />
              </h4>
        }
      </Grid>
    </Grid>
=======
import { node } from 'prop-types';
import React from 'react';
import { 
  Button, 
  Grid, 
  Icon 
} from 'semantic-ui-react';
import styles from '../styles/wallet/WalletItem.module.css';

export const WalletItem = ({type, item, onConnect}) => {
  return (
    <Grid.Row className='space-between'>
      <Grid.Column width={4} className={styles.logoIcon}>
        { 
          type === 'bitcoin' 
            ? <img className="ui avatar image" src="https://github.com/dapphub/trustwallet-assets/blob/master/blockchains/bitcoin/info/logo.png?raw=true" />
            : <img className="ui avatar image" src="https://github.com/dapphub/trustwallet-assets/blob/master/blockchains/ethereum/info/logo.png?raw=true" />
        }&nbsp;
        { type === 'bitcoin' ? 'Bitcoin' : 'Ethereum' }
      </Grid.Column>
      <Grid.Column width={10} className='align-right'>
        { !item.connected 
            ? <Button circular secondary className='gradient-btn' onClick={e => onConnect()}>Connect {item.title}</Button>
            : <h3>{ Number(Number(item.balance).toFixed(15)) } { type === 'bitcoin' ? 'BTC' : 'ETH' }</h3>
        }
      </Grid.Column>
    </Grid.Row>
>>>>>>> master
  );
}