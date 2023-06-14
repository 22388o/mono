import { Grid, IconButton } from '@mui/material';
import React, { useSyncExternalStore } from 'react';
import { MyModal } from '../MyModal/MyModal';
import { Close } from '@mui/icons-material';
import { NFTCard } from './NFTCard';
import { walletStore } from '../../syncstore/walletstore';

export const CollectiblesModal = ({ open, handleClose, handleItemClick=()=>{} }) => {
  const globalWallet = useSyncExternalStore(walletStore.subscribe, () => walletStore.currentState);
  const ASSET_TYPES = globalWallet.assets;
  return (
    <MyModal open={open}>
      <Grid container direction='column' spacing={1}>
        <Grid item container direction='row' width={800}>
          <Grid item xs={1}></Grid>
          <Grid item xs={10} className='flex-center flex-middle'><h3>Collectibles</h3></Grid>
          <Grid item xs={1} textAlign='right'><IconButton onClick={handleClose}><Close /></IconButton></Grid>
        </Grid>
        {/* <Grid item container direction='row'>
          <Grid item xs={3}>11 Collectibles</Grid>
          <Grid item xs={3}>All Networks</Grid>
          <Grid item xs={6} textAlign='right'>List Ordinal with PSBT</Grid>
        </Grid> */}
        <Grid item container direction='row' spacing={1.5} width={800}>
          { ASSET_TYPES.filter(asset => asset.isNFT === true && asset.balance > 0).map((card, idx) => <NFTCard handleClick={handleItemClick} key={idx} card={card} />) }
        </Grid>
      </Grid>
    </MyModal>
  );
}