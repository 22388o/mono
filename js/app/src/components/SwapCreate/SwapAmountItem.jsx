import React, { useState, useCallback } from 'react';
import styles from '../../styles/SwapCreate.module.css';
import { WALLET_COINS } from '../../utils/constants';
import { Grid } from '@mui/material';

export const SwapAmountItem = ({ assetId, amount, className, onAmountChange, unitPrice, availQty, onCoinTypeChange }) => {
  // Use WALLET_COINS for the initial assets state

  const handleAssetChange = (event) => {
    const selAsset = WALLET_COINS.find(asset => asset.type === event.target.value);
    onCoinTypeChange(selAsset);
  };

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
          />
          {unitPrice * amount > 0 ? <span className={styles.prices}>${unitPrice * amount}</span> : ''}
        </Grid>
        <Grid item xs={5} textAlign='right' sx={{display:'flex',alignItems:'center',justifyContent:'flex-end'}}>
          <select value={WALLET_COINS[assetId].type} onChange={handleAssetChange} className={`${styles['coin-select']} coin-select asset`}>
            {WALLET_COINS.map((asset, index) => (
              <option key={index} value={asset.type}>{asset.type}</option>
            ))}
          </select>
        </Grid>
      </Grid>
    </>
  );
}
