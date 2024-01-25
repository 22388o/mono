import React, { useState, useCallback } from 'react';
import styles from '../../styles/SwapCreate.module.css';
import { WALLET_COINS } from '../../utils/constants';
import { AssetItem } from './AssetItem';
import { MyModal } from '../../MyModal/MyModal';
import { Grid, IconButton, Divider } from '@mui/material';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import {Close} from '@mui/icons-material';

export const SwapAmountItem = ({ assetId, amount, className, onAmountChange, unitPrice, availQty, onCoinTypeChange }) => {
  // Use WALLET_COINS for the initial assets state
  const [assets, setAssets] = useState(WALLET_COINS);
  const [selectedAsset, setSelectedAsset] = useState(assets[0]);
  const [assetStep, setAssetStep] = useState(0)
  const getMinimizedAssets = (wallet) => {
    let nftCount = 0
    wallet.forEach(asset => {
      if (asset.isNFT && asset.balance > 0) nftCount++
    })
  
    const arr = []; const assets = wallet
    assets.forEach(asset => {
      if (asset.isNFT === false) {
        arr.push({
          title: asset.title,
          type: asset.type,
          amount: 0.53,
          isNFT: false,
          img_url: asset.img_url,
          rate: asset.rate
        })
      }
    })
    arr.push({
      title: 'Collectibles',
      type: null,
      amount: nftCount,
      isNFT: true,
      img_url: '/public/nft/1.png',
      rate: 1
    })
    return arr
  }
  const assetTypes = getMinimizedAssets(WALLET_COINS);

  const onClickAsset = useCallback((asset) => {
    if (asset.isNFT === false) {
      onCoinTypeChange(WALLET_COINS.findIndex(ast => ast.title === asset.title))
      setAssetStep(0)
    } else {
      setAssetStep(2)
    }
  }, [WALLET_COINS])
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
      <MyModal open={assetStep === 1}>
        <Grid container direction='column' spacing={1}>
          <Grid item container direction='row' width={350} sx={{ marginBottom: '1em'}}>
            <Grid item xs={1}><IconButton onClick={() => setAssetStep(0)}><KeyboardBackspaceIcon /></IconButton></Grid>
            <Grid item xs={10} className='flex-center flex-middle'><h3>Select Asset</h3></Grid>
            <Grid item xs={1} textAlign='right'><IconButton onClick={() => setAssetStep(0)}><Close /></IconButton></Grid>
          </Grid>
          {
            assetTypes.map((asset, idx) => 
              <span key={idx}>
                <AssetItem asset={asset} handleClick={onClickAsset} />
                { idx !== assetTypes.length - 1 && <Divider style={{ borderColor: '#3A3A3A', margin: '0.5em' }} /> }
              </span>
            )
          }
        </Grid>
      </MyModal>
    </>
  );
}
