import { useState, useSyncExternalStore } from "react";
import { Grid, Stack, Typography } from "@mui/material"

import styles from "../../styles/WalletInfoContainer.module.css";
import { CoinsSubTab } from "./CoinsSubTab";
import { walletStore } from "../../syncstore/walletstore";
import { formatNumber } from "../../utils/helpers";

export const AssetsTab = () => {
  const [activeTab, setActiveTab] = useState('coins');
  const globalWallet = useSyncExternalStore(walletStore.subscribe, () => walletStore.currentState)
  const assets = globalWallet.assets;
  const coin_prices = globalWallet.coin_prices;

  const getTotalBalance = () => {
    let sum = 0;
    assets.filter(asset => asset.isNFT === false && !asset.isSubNet).forEach(asset => sum += coin_prices[asset.type] * asset.balance);
    return sum;
  }

  return (
    <>
      <Stack direction='row' sx={{justifyContent:'center', display:'flex'}} gap={1}>
        <Typography sx={{color: 'white', fontSize: '32px', fontFamily: 'NotoBold'}}>{ formatNumber(getTotalBalance()) }</Typography>
        <Typography sx={{color: '#6A6A6A', fontSize: '16px', marginTop: '18px'}}>USD</Typography>
      </Stack>
      <Grid container sx={{marginTop: '30px'}}>
        <Grid item xs={6}>
          <Typography className={`
              ${styles['sub-tab-item']} 
              ${activeTab === 'coins' ? styles['left-sub-tab-active'] : styles['sub-tab-inactive']}
            `}
            onClick={() => setActiveTab('coins')}
          >
            Coins
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography className={`
              ${styles['sub-tab-item']} 
              ${activeTab === 'coll' ? styles['right-sub-tab-active'] : styles['sub-tab-inactive']}
            `}
            onClick={() => setActiveTab('coll')}
          >
            Collectibles
          </Typography>
        </Grid>
      </Grid>
      <Grid className={styles['sub-container']}>
        { activeTab === 'coins' && <CoinsSubTab />}
      </Grid>
    </>
  )
}