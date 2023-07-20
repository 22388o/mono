import React from 'react';
import { Grid, Button, Stack } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const ID_ARR = {'Bitcoin-L1' : 0, 'Ethereum' : 1, 'Bitcoin-lightning' : 2};

export const WalletItem = ({item, setNodeModalOpen, setWalletModalOpen, onConnectLightning}) => {
  const type = item.title, typeId = ID_ARR[type];
  const onClick = [setNodeModalOpen, setWalletModalOpen, onConnectLightning][typeId];
  
  const onPaymentSimulate = () => {
    const core = async () => {
      const result = await webln.keysend({
        destination: "03006fcf3312dae8d068ea297f58e2bd00ec1ffe214b793eda46966b6294a53ce6", 
        amount: "1", 
        customRecords: {
            "34349334": "TEST ACTION"
        }
      });
      console.log(result);      
    };

    core();
  }

  return (
    <Grid container direction='row' spacing={1}>
      <Grid item xs={1} textAlign='left'>
        <img width={32} className="ui avatar image" src={item.img_url} />
      </Grid>
      <Grid item xs={5} textAlign='left'>
        <Stack direction='column'>
          <b>{ type }</b>
          <span style={{fontSize:'0.8em',color:'grey',marginTop:'-5px'}}>{ item.type }</span>
        </Stack>
      </Grid>
      <Grid item xs={6} textAlign='right'>
        { (!item.connected && typeId >= 0)
            ? <Button className='gradient-btn' onClick={e => onClick()}>Connect {['Node', 'Wallet', 'Node'][typeId]}</Button>
            : <h4 style={{ display:'flex', alignItems:'center', justifyContent:'flex-end' }}>
                {type === 'Bitcoin-L1' && <Button onClick={() => onPaymentSimulate()} variant='contained' color='warning'>Simulate</Button>}
                <b>{ Number(Number(item.balance).toFixed(15)) }</b>
                <span style={{fontSize:'0.8em',color:'grey',margin:'0 0.1em'}}>{ item.type }</span>
                <ChevronRightIcon />
              </h4>
        }
      </Grid>
    </Grid>
  );
}