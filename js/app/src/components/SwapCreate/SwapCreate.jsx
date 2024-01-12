import React, { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { Box, Grid, Stack, Button, IconButton, Divider } from "@mui/material";
import { getBTCPrice, getETHPrice } from "../../utils/apis";
import styles from '../../styles/SwapCreate.module.css';
import { SwapAmountItem } from "./SwapAmountItem";
import { hashSecret, log } from "../../utils/helpers";
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import { walletStore } from "../../syncstore/walletstore";
import { activitiesStore } from "../../syncstore/activitiesstore";
import { toast } from "react-toastify";

/**
 * Swap Form Component which handles swap
 */
export const SwapCreate = () => {
  const globalWallet = useSyncExternalStore(walletStore.subscribe, () => walletStore.currentState);
  const ASSET_TYPES = globalWallet.assets;

  const [baseQuantity, setBaseQuantity] = useState(0);
  const [quoteQuantity, setQuoteQuantity] = useState(0);
  const [baseAsset, setBaseAsset] = useState(0);
  const [quoteAsset, setQuoteAsset] = useState(1);
  const [curPrices, setCurPrices] = useState({
    BTC: 0,
    ETH: 0,
    fetching: true
  });

  const node = globalWallet.assets[0];
  const wallet = globalWallet.assets[1];

  useEffect(() => {
    const core = async () => {
      const btc = await getBTCPrice();
      const eth = await getETHPrice();
      setCurPrices({
        BTC: btc,
        ETH: eth,
        fetching: false
      });
    };
    core();
  }, []);

  /**
   * Handler for input base quantity
   */
  const onInputBaseQuantity = useCallback((e) => {
    if(e.target.value < 0) return;
    setBaseQuantity(e.target.value);
  }, [curPrices, ASSET_TYPES, baseAsset, quoteAsset]);

  /**
   * Handler for input quote quantity
   */
  const onInputQuoteQuantity = useCallback((e) => {
    if(e.target.value < 0) return;
    setQuoteQuantity(e.target.value);
  }, [curPrices, ASSET_TYPES, quoteAsset, baseAsset]);

  /**
   * Handles swap order
   */
  const onOrderSwap = useCallback(async (order) => {
    const randomValues = crypto.getRandomValues(new Uint8Array(32))
    const secretHex = [...randomValues]
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('')
    const secretHash = await hashSecret(randomValues);

    if(ASSET_TYPES[baseAsset].balance < baseQuantity) {
      toast.error(
        "Error",
        {
          theme: 'colored',
          autoClose: 1000
        }
      )
      return;
    }

    await thenOrderSwap(order, secretHex, secretHash);
  }, [crypto, ASSET_TYPES, baseAsset, baseQuantity, quoteQuantity, quoteAsset]);

  /**
   * Process Order
   * @param {Object} order 
   * @param {string} secret 
   * @param {string} secretHash 
   */
  const thenOrderSwap = async (order, secret, secretHash) => {
    const ask = order.side=='ask';
    const baseA = order.baseAsset ? order.baseAsset : ASSET_TYPES[baseAsset].type;
    const quoteA = order.quoteAsset ? order.quoteAsset : ASSET_TYPES[quoteAsset].type;
    const baseQty = order.baseQuantity ? order.baseQuantity : baseQuantity;
    const quoteQty = order.quoteQuantity ? order.quoteQuantity : quoteQuantity;
    const baseNet= order.baseNetwork, quoteNet = order.quoteNetwork;
    const baseO = { asset: baseA, network: baseNet, quantity: baseQty },
        quoteO = { asset: quoteA,  network: quoteNet, quantity: quoteQty };

    let args = ask ?  { // if order is an ask, bitcoin as base
      base: baseO,
      quote: quoteO
    } : {
      base: quoteO,
      quote: baseO
    };

    let bai = ASSET_TYPES.findIndex(asset => asset.type === args.base.asset);
    let qai = ASSET_TYPES.findIndex(asset => asset.type === args.quote.asset);

    const request = {
      uid: 'alice', // Change: user.user.id,
      side: order.side,
      hash: secretHash,
      baseAsset: args.base.asset.split('-')[0],
      baseNetwork: args.base.network,
      baseQuantity: (args.base.asset.split('-')[0] === 'BTCORD' || args.quote.asset.split('-')[0] === 'BTCORD') ? 4000 : Math.round(args.base.quantity * ASSET_TYPES[bai].rate),
      baseInfo: ASSET_TYPES[baseAsset].info,
      quoteAsset: args.quote.asset.split('-')[0],
      quoteNetwork: args.quote.network,
      quoteQuantity: Math.round(args.quote.quantity * ASSET_TYPES[qai].rate),
      quoteInfo: ASSET_TYPES[quoteAsset].info
    };
    
    const curDate = new Date();
    const date = {
      year: curDate.getFullYear(),
      month: curDate.getMonth(),
      day: curDate.getDate()
    };

    const baseQ = {
          asset: request.baseAsset,
          network: order.baseNetwork,
          quantity: request.baseQuantity / ASSET_TYPES[bai].rate
        }, quoteQ = {
          asset: request.quoteAsset,
          network: order.quoteNetwork,
          quantity: request.quoteQuantity / ASSET_TYPES[qai].rate
        };

    args = ask ?  { // if order is an ask, bitcoin as base
      base: baseQ,
      quote: quoteQ
    } : {
      base: quoteQ,
      quote: baseQ
    };

    activitiesStore.dispatch({ type: 'ADD_SWAP_ITEM', payload: {
      key: request.id,
      orderId: request.id,
      ts: request.ts,
      uid: request.uid,
      type: request.type,
      side: request.side,
      secret: secret,
      secretHash,
      hash: request.hash,
      baseAsset: args.base.asset.split('-')[0],
      baseQuantity: args.base.quantity,
      baseNetwork: args.base.network,
      baseInfo: ASSET_TYPES[baseAsset].info,
      quoteAsset: args.quote.asset.split('-')[0],
      quoteNetwork: args.quote.network,
      quoteQuantity: args.quote.quantity,
      quoteInfo: ASSET_TYPES[quoteAsset].info,
      ordinalLocation: args.ordinalLocation,
      status: 0,
      createdDate: date
    } })

    walletStore.dispatch({ type: 'REMOVE_BALANCE_ON_SWAP_ORDER', payload: {asset: baseAsset, qty: baseQuantity} })
    setBaseQuantity(ASSET_TYPES[baseAsset].isNFT ? 1 : 0);
    setQuoteQuantity(ASSET_TYPES[quoteAsset].isNFT ? 1 : 0);
  }

  /**
   * Handler to exchange base & quote coin type
   */
  const onExchangeCoinType = useCallback(() => {
    const tBase = baseQuantity, tQuote = quoteQuantity;
    const aBase = baseAsset, aQuote = quoteAsset;
    setBaseAsset(aQuote);setQuoteAsset(aBase);
    setBaseQuantity(tQuote); setQuoteQuantity(tBase);
  }, [baseQuantity, quoteQuantity, baseAsset, quoteAsset]);

  return (
    <Box className={styles.SwapCreateContainer}>
      <Stack sx={{alignItems: 'center'}}>
        <Grid container height={35} sx={{marginBottom:'1em'}}>
          <Grid item xs={4} textAlign='left' style={{display:'flex', alignItems:'center'}}><h3>Swap</h3></Grid>
        </Grid>
        <Grid className={styles.swapExCont}>
          <SwapAmountItem
            assetId={baseAsset}
            unitPrice={curPrices[ASSET_TYPES[baseAsset].type]}
            amount={baseQuantity}
            availQty={ASSET_TYPES[baseAsset].type === 'BTC' ? node.balance : wallet.balance}
            onAmountChange={onInputBaseQuantity}
            onCoinTypeChange={(asset) => {coinTypeChanged(true, asset);}}
          />
          <Divider style={{borderColor:'#202020',margin: '0.5em -1em 0 -1em'}} />
          <IconButton className={`${styles.exchange} exchange`} onClick={onExchangeCoinType}><SettingsEthernetIcon /></IconButton>
          <SwapAmountItem
            className='mt-m1 mb-0'
            assetId={quoteAsset}
            unitPrice={curPrices[ASSET_TYPES[quoteAsset].type]}
            amount={quoteQuantity}
            availQty={ASSET_TYPES[baseAsset].type === 'ETH' ? node.balance : wallet.balance}
            onAmountChange={onInputQuoteQuantity}
            onCoinTypeChange={(asset) => {coinTypeChanged(false, asset);}}
            />
        </Grid>
        <Grid sx={{width:'100%', marginTop:'1em'}}>
          { 
            ((ASSET_TYPES[baseAsset].isNFT || baseQuantity) && (ASSET_TYPES[quoteAsset].isNFT || quoteQuantity)
                ? <>
                    { (ASSET_TYPES[baseAsset].isNFT==false && ASSET_TYPES[quoteAsset].isNFT==false) ?  <p className={styles.prices}>{ curPrices.fetching ? 'Loading' : `1 ${ASSET_TYPES[baseAsset].type} = ${Number(curPrices[ASSET_TYPES[baseAsset].type] / curPrices[ASSET_TYPES[quoteAsset].type]).toFixed(6)} ${ASSET_TYPES[quoteAsset].type}` }</p> :
                    <p></p>}
                    <Button circular="true" secondary="true" className='gradient-btn w-100 h-3' onClick={e => onOrderSwap({
                      side: (
                      (ASSET_TYPES[quoteAsset].type.split('-')[0] !== 'BTCORD' && (ASSET_TYPES[baseAsset].type == 'BTC' || ASSET_TYPES[baseAsset].type.split('-')[0] == 'BTCORD' || ASSET_TYPES[baseAsset].isNFT)) ? 'ask' : 'bid'),
                      baseNetwork: ASSET_TYPES[baseAsset].network,
                      quoteNetwork: ASSET_TYPES[quoteAsset].network,
                      ordinalLocation:  (
                        (ASSET_TYPES[baseAsset].isNFT || ASSET_TYPES[quoteAsset].isNFT )?
                          (ASSET_TYPES[baseAsset].isNFT ?
                            ASSET_TYPES[baseAsset].info.location :
                            ASSET_TYPES[quoteAsset].info.location) :
                          false )})}>Swap</Button>
                  </>
                : <Button circular="true" secondary="true" className='w-100 h-3 gradient-btn-disabled' disabled>Enter Amounts to Swap</Button> )
          }
        </Grid>
      </Stack>
    </Box>
  );
}
