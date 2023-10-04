import { useEffect, useSyncExternalStore } from "react";

import { Divider, Stack, Typography } from "@mui/material"
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

import styles from "../../styles/WalletInfoContainer.module.css";
import { walletStore } from "../../syncstore/walletstore";
import { getBTCPrice, getETHPrice } from "../../utils/apis";


export const CollectiblesSubTab = () => {
  const globalWallet = useSyncExternalStore(walletStore.subscribe, () => walletStore.currentState)
  const assets = globalWallet.assets;
  const coin_prices = globalWallet.coin_prices;

  useEffect(() => {
    const core = async () => {
      const btc = await getBTCPrice();
      const eth = await getETHPrice();
      walletStore.dispatch({ type: 'SET_COIN_PRICES', payload: {
        BTC: btc,
        ETH: eth,
        fetching: false
      }});
    };
    core();
  }, []);

  const renderItem = (asset) => {
    return (
      <Stack direction='row' className={styles['wallet-collectible-item']}>
        <Stack direction='row' gap={1} sx={{alignItems:'center', marginTop: '2px'}}>
          <img width={45} src={asset.img_url} />
          <Typography className={styles['wallet-item-title']}>{asset.title}</Typography>
        </Stack>
        <Stack direction='row' gap={1} sx={{alignItems:'center'}}>
          <Stack direction='row' sx={{alignItems:'flex-end'}} gap={0.5}>
            <Typography sx={{fontFamily:'NotoBold', color:'white', fontSize:'20px'}}>{ asset.balance }</Typography>
            <Typography sx={{color:'#AAAAAA', marginBottom: '1px'}}>{ asset.type }</Typography>
          </Stack>
          <KeyboardArrowRightIcon />
        </Stack>
      </Stack>
    )
  }

  return (
    <Stack>
      { assets.filter(asset => asset.isNFT === true).map((asset, idx) => 
        <div key={idx}>
          { renderItem(asset) }
          { <Divider /> }
        </div>
      ) }
    </Stack>
  )
}