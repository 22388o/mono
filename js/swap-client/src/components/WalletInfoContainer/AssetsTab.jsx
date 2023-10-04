import { useState } from "react";
import { Grid, Stack, Typography } from "@mui/material"

import styles from "../../styles/WalletInfoContainer.module.css";
import { CoinsSubTab } from "./CoinsSubTab";

export const AssetsTab = () => {
  const [activeTab, setActiveTab] = useState('coins');

  return (
    <>
      <Stack direction='row' sx={{justifyContent:'center', display:'flex'}} gap={1}>
        <Typography sx={{color: 'white', fontSize: '32px', fontFamily: 'NotoBold'}}>1293.00</Typography>
        <Typography sx={{color: '#6A6A6A', fontSize: '16px', marginTop: '18px'}}>USD</Typography>
      </Stack>
      <Grid container sx={{marginTop: '30px'}}>
        <Grid item xs={6}>
          <Typography className={[
              styles['sub-tab-item'], 
              activeTab === 'coins' ? styles['left-sub-tab-active'] : styles['sub-tab-inactive']
            ]}
            onClick={() => setActiveTab('coins')}
          >
            Coins
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography className={[
              styles['sub-tab-item'], 
              activeTab === 'coll' ? styles['right-sub-tab-active'] : styles['sub-tab-inactive']
            ]}
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