import React from 'react'

import { Grid } from '@mui/material'

import styles from '../styles/SwapHome.module.css'
import { SwapCreate } from './SwapCreate/SwapCreate'
import { WalletInfoContainer } from './WalletInfoContainer'

/**
 * Swap Page Component
 */
export const SwapHome = () => {
  return (
    <Grid container direction='column' sx={{backgroundColor:'#101010'}}>
      <Grid direction='row' container className={styles['page-header']}>
        
      </Grid>
      <Grid item container justifyContent='flex-end' style={{ padding: '1em 2em' }}>

      </Grid>
      <Grid item container direction='row'>
        <Grid item container xs={10} sx={{ transition: 'all 0.5s ease-in-out' }}>
          <SwapCreate />
        </Grid>
      </Grid>

      <WalletInfoContainer show={true} setIsMinimized={() => {}} />
    </Grid>
  )
}
