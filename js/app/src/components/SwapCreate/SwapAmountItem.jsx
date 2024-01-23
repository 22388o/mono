import React, { useState, useCallback, useSyncExternalStore } from 'react'
import styles from '../../styles/SwapCreate.module.css'
import { Grid, Button, IconButton, Divider } from '@mui/material'
import { walletStore } from '../../syncstore/walletstore'
import { MyModal } from '../../MyModal/MyModal'
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace'
import { AssetItem } from './AssetItem'
import { Close } from '@mui/icons-material'

/**
 * Component for swap form with input, coin type
 * @param {string} assetId
 * @param {number} amount
 * @param {string} className
 * @param {function} onAmountChange
 * @param {number} unitPrice
 * @param {number} availQty
 */
export const SwapAmountItem = ({ assetId, amount, className, onAmountChange, unitPrice, availQty, onCoinTypeChange }) => {
  const globalWallet = useSyncExternalStore(walletStore.subscribe, () => walletStore.currentState)
  const assetTypes = getMinimizedAssets(globalWallet)
  const asset = globalWallet.assets[assetId]
  const [assetStep, setAssetStep] = useState(0)

  
  const onClickAsset = useCallback((asset) => {
    if (asset.isNFT === false) {
      onCoinTypeChange(globalWallet.assets.findIndex(ast => ast.title === asset.title))
      setAssetStep(0)
    } else {
      setAssetStep(2)
    }
  }, [globalWallet])

  const onKeyDown = useCallback((e) => {
    if (e.keyCode === 109) {
      e.preventDefault()
    }
  }, [])

  const getMinimizedAssets = (wallet) => {
    let nftCount = 0
    wallet.assets.forEach(asset => {
      if (asset.isNFT && asset.balance > 0) nftCount++
    })
  
    const arr = []; const assets = wallet.assets
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
          <Button className={`${styles['coin-select']} coin-select asset`} onClick={() => setAssetStep(1)}><img src={asset.img_url} />{asset.type.split('-')[0]}</Button>
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
  )
}
