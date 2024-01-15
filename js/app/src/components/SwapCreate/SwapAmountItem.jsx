import React, { useCallback, useSyncExternalStore } from 'react'
import styles from '../../styles/SwapCreate.module.css'
import { Grid, Button } from '@mui/material'
import { walletStore } from '../../syncstore/walletstore'

/**
 * Component for swap form with input, coin type
 * @param {string} assetId
 * @param {number} amount
 * @param {string} className
 * @param {function} onAmountChange
 * @param {number} unitPrice
 * @param {number} availQty
 */
export const SwapAmountItem = ({ assetId, amount, className, onAmountChange, unitPrice, availQty }) => {
  const globalWallet = useSyncExternalStore(walletStore.subscribe, () => walletStore.currentState)
  const asset = globalWallet.assets[assetId]

  const onKeyDown = useCallback((e) => {
    if (e.keyCode === 109) {
      e.preventDefault()
    }
  }, [])

  return (
    <>
      <Grid container direction='row' className={className} sx={{ height:'48px' }}>
        <Grid item xs={7} container direction='column' textAlign='left'>
          <input
            className={`${styles['qty-input']} qty-input quantity`}
            placeholder={availQty}
            type='number'
            value={(amount === 0) ? '' : amount}
            onChange={onAmountChange}
            onKeyDown={onKeyDown}
          />
          {unitPrice * amount > 0 ? <span className={styles.prices}>${unitPrice * amount}</span> : ''}
        </Grid>
        <Grid item xs={5} textAlign='right' sx={{display:'flex',alignItems:'center',justifyContent:'flex-end'}}>
          <Button className={`${styles['coin-select']} coin-select asset`} onClick={() => {}}><img src={asset.img_url} />{asset.type.split('-')[0]}</Button>
        </Grid>
      </Grid>
    </>
  )
}
