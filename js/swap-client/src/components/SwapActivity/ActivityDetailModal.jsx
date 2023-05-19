import React, { useEffect, useState } from 'react';
import { MyModal } from '../MyModal/MyModal';
import { Button, Divider, Grid, IconButton, Input } from '@mui/material';
import { Close, West } from '@mui/icons-material';
import { SWAP_STATUS } from '../../utils/helpers';
import QRCode from 'qrcode';


export const ActivityDetailModal = ({ open, handleClose, activity }) => {
  const [qrData, setQrData] = useState('');

  useEffect(() => {
    QRCode.toDataURL(activity.btcAddress)
    .then(url => {
      setQrData(url)
    })
    .catch(error => {
      console.log(error);
    })
  }, [activity.btcAddress]);
  console.log

  return <MyModal open={open}>
    <Grid container direction='column' spacing={1}>
      <Grid item container direction='row' width={400}>
        <Grid item xs={1}><IconButton onClick={() => setSelectedAsset(null)}><West /></IconButton></Grid>
        <Grid item xs={10} className='flex-center flex-middle'><h3>Activity Details</h3></Grid>
        <Grid item xs={1} textAlign='right'><IconButton onClick={handleClose}><Close /></IconButton></Grid>
      </Grid>
      <Grid item container direction='column' className='flex-middle'>
        <Grid item container direction='row'>
          <Grid item xs={5}>Base Asset: </Grid>
          <Grid item xs={3} textAlign='left'>{ activity.baseQuantity + ' ' + activity.baseAsset }</Grid>
          <Grid item xs={4} textAlign='right'>{ activity.createdDate.year + '-' + activity.createdDate.month + '-' + activity.createdDate.day }</Grid>
        </Grid>
        <Grid item container direction='row'>
          <Grid item xs={5}>Quote Asset: </Grid>
          <Grid item xs={3} textAlign='left'>{ activity.quoteQuantity + ' ' + activity.quoteAsset }</Grid>
          <Grid item xs={4} textAlign='right'></Grid>
        </Grid>
        <Grid container item style={{textOverflow:'clip'}}>
          <Grid item xs={5}>Hash:</Grid>
          <Grid item xs={7}>{ activity.hash.slice(0, 20) + '...' }</Grid>
        </Grid>
        <Grid container item style={{textOverflow:'clip'}}>
          <Grid item xs={5}>Key:</Grid>
          <Grid item xs={7}>{ activity.key.slice(0, 15) + '...' }</Grid>
        </Grid>
        <Grid container item style={{textOverflow:'clip'}}>
          <Grid item xs={5}>Status:</Grid>
          <Grid item xs={7}>{ SWAP_STATUS[activity.status] }</Grid>
        </Grid>
        { activity.status === 1 && <Grid container item style={{textOverflow:'clip'}}>
          <Grid item xs={6} textAlign='center'><Button variant='contained' color='error'><b>swap.open</b></Button></Grid>
          <Grid item xs={6} textAlign='center'><Button variant='contained' color='error'><b>swap.commit</b></Button></Grid>
        </Grid> }
        { activity.status !== 4 && activity.btcAddress && <Grid item style={{marginTop:'0.5em'}}>
            <img src={qrData} alt='QrCode' />
          </Grid>
        }
      </Grid>
      <Button className='gradient-btn w-100 h-100 p-1 mt-1' onClick={handleClose}>
        Close
      </Button>
    </Grid>
  </MyModal>
};