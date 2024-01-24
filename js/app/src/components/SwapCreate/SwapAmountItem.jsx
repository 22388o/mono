import React, { useState } from 'react';
import { Grid } from '@mui/material';
import styles from '../../styles/SwapCreate.module.css';
import { WALLET_COINS } from '../../utils/constants';

export const SwapAmountItem = ({ assetId, amount, className, onAmountChange, unitPrice, availQty, onCoinTypeChange }) => {
  // Use WALLET_COINS for the initial assets state
  const [assets, setAssets] = useState(WALLET_COINS);
  const [selectedAsset, setSelectedAsset] = useState(assets[0]);

  const handleAssetChange = (event) => {
    const selectedAsset = assets.find(asset => asset.title === event.target.value);
    setSelectedAsset(selectedAsset);
    onCoinTypeChange(selectedAsset);
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
          <select value={selectedAsset.title} onChange={handleAssetChange} className={`${styles['coin-select']} coin-select asset`}>
            {assets.map((asset, index) => (
              <option key={index} value={asset.title}>{asset.title}</option>
            ))}
          </select>
        </Grid>
      </Grid>
      {/* Rest of your component */}
    </>
  );
}
