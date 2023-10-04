import React, { useState, useSyncExternalStore } from 'react'

// mui imports
import { Button, Grid, IconButton, Stack, Typography } from '@mui/material'
import { Close, West } from '@mui/icons-material'

// proj imports
import { NFTCard } from './NFTCard'
import { MyModal } from '../MyModal/MyModal'
import { walletStore } from '../../syncstore/walletstore'
import styles from '../../styles/collectibles/index.module.css'

export const CollectiblesModal = ({ open, handleClose, handleItemClick = () => {} }) => {
  const globalWallet = useSyncExternalStore(walletStore.subscribe, () => walletStore.currentState)
  const ASSET_TYPES = globalWallet.assets

  const [customOrdModalOpen, setCustomOrdModalOpen] = useState(false)

  return (
    <>
      <MyModal open={open} handleClose={handleClose}>
        <Stack>
          <Grid item container direction='row' width={800} sx={{ marginBottom: '20px' }} alignItems='center' >
            <Grid item xs={1} />
            <Grid item xs={10} className='flex-center flex-middle'><Typography sx={{fontSize:'25px', fontFamily:'NotoBold'}}>Collectibles</Typography></Grid>
            <Grid item xs={1} textAlign='right'><IconButton onClick={handleClose}><Close /></IconButton></Grid>
          </Grid>
          <Grid item container direction='row' gap={2} width={800}>
            {ASSET_TYPES.filter(asset => asset.isNFT === true && asset.balance > 0).map((card, idx) => <NFTCard handleClick={handleItemClick} key={idx} card={card} />)}
          </Grid>
          <a onClick={() => setCustomOrdModalOpen(true)} className={styles['add-custom-button']}>+ Add Custom Ordinal</a>
        </Stack>
      </MyModal>
      <MyModal open={customOrdModalOpen} handleClose={() => setCustomOrdModalOpen(false)}>
        <Stack gap={2}>
          <Stack direction='row' sx={{justifyContent:'space-between', width: '400px', alignItems: 'center'}}>
            <IconButton onClick={() => setCustomOrdModalOpen(false)}><West /></IconButton>
            <h3>Add Custom Ordinal</h3>
            <IconButton onClick={() => setCustomOrdModalOpen(false)}><Close /></IconButton>
          </Stack>
          <Stack>
            <Typography sx={{fontSize:'20px', color: '#AAAAAA'}}>Address</Typography>
            <input className={styles['recipient-addr']} placeholder='Enter Address' />
          </Stack>
          <Grid item>
            <Button className='gradient-btn w-100'>Continue</Button>
          </Grid>
        </Stack>
      </MyModal>
    </>
  )
}
