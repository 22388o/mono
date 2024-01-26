import React, { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { Box, Grid, Stack, Button, IconButton, Divider } from "@mui/material";
import { getBTCPrice, getETHPrice } from "../../utils/apis";
import styles from '../../styles/SwapCreate.module.css';
import { SwapAmountItem } from "./SwapAmountItem";
import { log } from '../../utils/helpers'
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import { sdkStore } from "../../syncstore/sdkstore";
import { walletStore } from "../../syncstore/walletstore";
import { activitiesStore } from "../../syncstore/activitiesstore";
import { toast } from "react-toastify";
import { WALLET_COINS } from '../../utils/constants';


/**
 * Swap Form Component which handles swap
 */
export const SwapCreate = () => {
  const SDK = useSyncExternalStore(sdkStore.subscribe, () => sdkStore.currentState);
  const activities = useSyncExternalStore(activitiesStore.subscribe, () => activitiesStore.currentState);
  const globalWallet = useSyncExternalStore(walletStore.subscribe, () => walletStore.currentState);
  const ASSET_TYPES = WALLET_COINS;

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

  const coinTypeChanged = useCallback((isBase, asset) => {
    let anotherAssetIndex = isBase ? quoteAsset : baseAsset;
    let currentAssetIndex = ASSET_TYPES.findIndex(a => a.type === asset.type);

    if (currentAssetIndex !== -1) {
      if (!ASSET_TYPES[baseAsset].isNFT && !ASSET_TYPES[quoteAsset].isNFT) {
        anotherAssetIndex = ASSET_TYPES[currentAssetIndex].type === 'BTC' ? 1 : 0;
      }
      if (isBase) {
        setBaseAsset(currentAssetIndex);
        setQuoteAsset(anotherAssetIndex);
      } else {
        setQuoteAsset(currentAssetIndex);
        setBaseAsset(anotherAssetIndex);
      }
    }
  }, [ASSET_TYPES, baseAsset, quoteAsset]);



  /**
   * Handler for input base quantity
   */
  const onInputBaseQuantity = useCallback((e) => {
    if (e.target.value < 0) return;
    setBaseQuantity(e.target.value);
  }, [curPrices, ASSET_TYPES, baseAsset, quoteAsset]);

  /**
   * Handler for input quote quantity
   */
  const onInputQuoteQuantity = useCallback((e) => {
    if (e.target.value < 0) return;
    setQuoteQuantity(e.target.value);
  }, [curPrices, ASSET_TYPES, quoteAsset, baseAsset]);

  /**
   * Handles swap order
   */
  const onOrderSwap = useCallback(async (order) => {
    if (ASSET_TYPES[baseAsset].balance < baseQuantity) {
      toast.error(
        "Error",
        {
          theme: 'colored',
          autoClose: 1000
        }
      )
      return;
    }

    console.log("onorderswap here")
    await thenOrderSwap(order);
  }, [crypto, ASSET_TYPES, baseAsset, baseQuantity, quoteQuantity, quoteAsset]);

  /**
   * Process Order
   * @param {Object} order
   */
  const thenOrderSwap = async (order) => {
    const ask = order.side == 'ask';
    const baseA = order.baseAsset ? order.baseAsset : ASSET_TYPES[baseAsset].type;
    const quoteA = order.quoteAsset ? order.quoteAsset : ASSET_TYPES[quoteAsset].type;
    const baseQty = order.baseQuantity ? order.baseQuantity : baseQuantity;
    const quoteQty = order.quoteQuantity ? order.quoteQuantity : quoteQuantity;
    const baseNet = order.baseNetwork, quoteNet = order.quoteNetwork;
    const baseO = { asset: baseA, network: baseNet, quantity: baseQty },
      quoteO = { asset: quoteA, network: quoteNet, quantity: quoteQty };

    let args = ask ? { // if order is an ask, bitcoin as base
      base: baseO,
      quote: quoteO
    } : {
      base: quoteO,
      quote: baseO
    };

    let bai = ASSET_TYPES.findIndex(asset => asset.type === args.base.asset);
    let qai = ASSET_TYPES.findIndex(asset => asset.type === args.quote.asset);

    const request = {
      side: order.side,
      baseAsset: args.base.asset,
      baseNetwork: args.base.network,
      baseQuantity: Math.round(args.base.quantity * ASSET_TYPES[bai].rate),
      quoteAsset: args.quote.asset,
      quoteNetwork: args.quote.network,
      quoteQuantity: Math.round(args.quote.quantity * ASSET_TYPES[qai].rate)
    };

    console.log("submitting limit order")
    await SDK.sdk.dex.submitLimitOrder(request).then(data => {
      console.log("submitLimitOrder response", data)

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

      args = ask ? { // if order is an ask, bitcoin as base
        base: baseQ,
        quote: quoteQ
      } : {
        base: quoteQ,
        quote: baseQ
      };


      activitiesStore.dispatch({
        type: 'ADD_SWAP_ITEM', payload: {
          key: data.id,
          orderId: data.id,
          ts: data.ts,
          uid: data.uid,
          type: data.type,
          side: data.side,
          // secret: secret,
          // secretHash,
          hash: data.hash,
          baseAsset: args.base.asset.split('-')[0],
          baseQuantity: args.base.quantity,
          baseNetwork: args.base.network,
          // baseInfo: ASSET_TYPES[baseAsset].info,
          quoteAsset: args.quote.asset.split('-')[0],
          quoteNetwork: args.quote.network,
          quoteQuantity: args.quote.quantity,
          // quoteInfo: ASSET_TYPES[quoteAsset].info,
          ordinalLocation: args.ordinalLocation,
          status: 0,
          createdDate: date
        }
      })

      walletStore.dispatch({ type: 'REMOVE_BALANCE_ON_SWAP_ORDER', payload: { asset: baseAsset, qty: baseQuantity } })
      setBaseQuantity(ASSET_TYPES[baseAsset].isNFT ? 1 : 0);
      setQuoteQuantity(ASSET_TYPES[quoteAsset].isNFT ? 1 : 0);
    });
  }

  /**
   * Handler to exchange base & quote coin type
   */
  const onExchangeCoinType = useCallback(() => {
    const tBase = baseQuantity, tQuote = quoteQuantity;
    const aBase = baseAsset, aQuote = quoteAsset;
    setBaseAsset(aQuote); setQuoteAsset(aBase);
    setBaseQuantity(tQuote); setQuoteQuantity(tBase);
  }, [baseQuantity, quoteQuantity, baseAsset, quoteAsset]);


  const getSwapPairId = (activity, swap) => {
    const SWAP_PAIRS = [{
      base: 'BTC',
      quote: 'ETH',
      seeker: 'ETH',
      holder: 'BTC',
      process: [
        1,
        2,
        4,
        5
      ],
      required_chains: [
        'bitcoin',
        'ethereum'
      ]
    }]
    
    /**
     * Function to match swap pair with activity item
     * -----------------------------------------
     * base: 0 if current activity is from base, 1 if current activity is from quote, otherwise -1
     * curUser: user object of current user in this swap
     * nor: normal swap, true if the curUser is this user and orderId matches activity orderId
     * index: index of swap pair
     * next: next step id of swap process
     * f means flag which is used temporarily in distinguishing variable names
     */
    let nor, base, index, nextSt
    SWAP_PAIRS.forEach((pair, idx) => {
      let fBase = -1
      if (pair.base === activity.baseAsset && pair.quote === activity.quoteAsset) fBase = 0
      else if (pair.base === activity.quoteAsset && pair.quote === activity.baseAsset) fBase = 1
      if (fBase == -1) return

      let fNor, curUser
      if ((fBase == 0 && pair.base === pair.seeker) || (fBase == 1 && pair.base === pair.holder)) curUser = swap.secretSeeker
      if ((fBase == 1 && pair.base === pair.seeker) || (fBase == 0 && pair.base === pair.holder)) curUser = swap.secretHolder

      // TODO: right now only checking activity item with the same status
      // fNor = (user.user.id === substrname(curUser.id) && activity.secretHash === swap.secretHash);

      nextSt = pair.process[pair.process.indexOf(activity.status) + 1]
      // nor = fNor;
      nor = true
      base = fBase
      index = idx
    })
    return {
      fNor: nor,
      fBase: base,
      fIndex: index,
      fNext: nextSt
    }
  }
  const substrname = useCallback((name) => {
    return name
    // return name.substring(0, name.indexOf('--'));
  }, [])
  /**
   * Event watchers to update swap progress
   */
   useEffect(() => {
    if (!SDK.sdk) return
    // log("SDK.sdk", SDK.sdk);
    activities.forEach(activity => {
      if (activity.status === 0) {
        log('swapState: swap begins ', activity.status)
        // setTimeout(() => {
        activitiesStore.dispatch({ type: 'UPDATE_SWAP_STATUS', payload: { orderId: activity.id, status: 1 } })
        log('swapState: swap iter: activity.secretHash  ', activity.secretHash)
        log('swapState: swap iter: activity.status  ', activity.status)
        // }, 50);
      }
    })
    SDK.sdk.on('swap.received', swap => {
      log('swap.created event', swap)
      console.log('swap.created event', activities, swap)
      activities.forEach(activity => {
        const { fNor, fBase, fIndex, fNext } = getSwapPairId(activity, swap)
        if (activity.status !== 1 || !fNor) return
        // log("orderSecret in swap.opening !!!!!!!!!!!!!!!!!!!!!!!!!!! shouldn't be null", orderSecret)

        log('activity.secret', activity)

        if (fIndex === 0) { // Check if BTC-ETH swap
          // TODO: temp fix for single swap / order in orderbook at any given moment

          if (SDK.sdk.id === swap.secretSeeker.id) {
            log('swap.created event received', swap)
            const network = swap.secretSeeker.blockchain.toLowerCase()

            const credentials = SDK.sdk.credentials

            log('swapOpen (secretSeeker) requested, sent settingSwapState to 2')
            SDK.sdk.swapOpen(swap, { ...credentials })

            // TODO: right now only checking activity item with the same status
            activitiesStore.dispatch({ type: 'UPDATE_SWAP_STATUS', payload: { orderId: swap.secretSeeker.oid, status: fNext } })
          }
        } else {
          if (SDK.sdk.id == substrname(swap.secretHolder.id) && orderSecret != null) {
            log('swapOpen (secretHolder) requested, sent settingSwapState to 2', swap.id)

            // TODO: right now only checking activity item with the same status
            activitiesStore.dispatch({ type: 'UPDATE_SWAP_STATUS', payload: { orderId: swap.secretHolder.oid, status: 2 } })
          } else {
          // TODO: right now only checking activity item with the same status
            activitiesStore.dispatch({ type: 'UPDATE_SWAP_STATUS', payload: { orderId: swap.secretSeeker.oid, status: 2 } })
          }
        }
      })
    })
    SDK.sdk.on('swap.created', swap => {
      log('swap.created event', swap)
      console.log('swap.created event', activities, swap)
      activities.forEach(activity => {
        const { fNor, fBase, fIndex, fNext } = getSwapPairId(activity, swap)
        if (activity.status !== 1 || !fNor) return
        // log("orderSecret in swap.opening !!!!!!!!!!!!!!!!!!!!!!!!!!! shouldn't be null", orderSecret)

        log('activity.secret', activity)

        if (fIndex === 0) { // Check if BTC-ETH swap
          // TODO: temp fix for single swap / order in orderbook at any given moment

          if (SDK.sdk.id === swap.secretSeeker.id) {
            log('swap.created event received', swap)
            const network = swap.secretSeeker.blockchain.toLowerCase()

            const credentials = SDK.sdk.credentials

            log('swapOpen (secretSeeker) requested, sent settingSwapState to 2')
            SDK.sdk.swapOpen(swap, { ...credentials })

            // TODO: right now only checking activity item with the same status
            activitiesStore.dispatch({ type: 'UPDATE_SWAP_STATUS', payload: { orderId: swap.secretSeeker.oid, status: 3 } })
          }
        } else {
          if (SDK.sdk.id == substrname(swap.secretHolder.id) && orderSecret != null) {
            log('swapOpen (secretHolder) requested, sent settingSwapState to 2', swap.id)

            // TODO: right now only checking activity item with the same status
            activitiesStore.dispatch({ type: 'UPDATE_SWAP_STATUS', payload: { orderId: swap.secretHolder.oid, status: 3 } })
          } else {
          // TODO: right now only checking activity item with the same status
            activitiesStore.dispatch({ type: 'UPDATE_SWAP_STATUS', payload: { orderId: swap.secretSeeker.oid, status: 3 } })
          }
        }
      })
    })
    SDK.sdk.on('swap.holder.invoice.created', swap => {
      activities.forEach(activity => {
        const { fNor, fBase, fIndex, fNext } = getSwapPairId(activity, swap)

        console.log(fNor, fIndex, fNext)
        if (!fNor) return
        log('swapState: swap order request sent ', swap.status)

        if (fIndex === 0) {
          const network = swap.secretSeeker.blockchain.toLowerCase()
          const credentials = SDK.sdk.credentials
          log('swapOpen (secretHolder) requested, settingSwapState to 2')

          // TODO: right now only checking activity item with the same status
          activitiesStore.dispatch({ type: 'UPDATE_SWAP_STATUS', payload: { orderId: swap.secretSeeker.oid, status: 4 } })
        } else {
          if (activity.status !== 2 || SDK.sdk.id == substrname(swap.secretSeeker.id)) {
            log('swap.opening event received', swap)
            log('swapOpen (secretSeeker) requested, sent settingSwapState to 3')

            // TODO: right now only checking activity item with the same status
            activitiesStore.dispatch({ type: 'UPDATE_SWAP_STATUS', payload: { orderId: swap.secretSeeker.oid, status: 4 } })
          } else {
            // TODO: right now only checking activity item with the same status
            activitiesStore.dispatch({ type: 'UPDATE_SWAP_STATUS', payload: { orderId: swap.secretHolder.oid, status: 4 } })
          }
        }
      })
    })
    SDK.sdk.on('swap.holder.invoice.sent', swap => {
      log('swap.opened event received', swap)
      // alert(1);
      activities.forEach(activity => {
        const { fNor, fBase, fIndex, fNext } = getSwapPairId(activity, swap)
        log('swap.opened event received', swap)
        const network = swap.secretHolder.blockchain.toLowerCase()
        const credentials = SDK.sdk.credentials

        if (fIndex === 0) {
          if (SDK.sdk.id === swap.secretSeeker.id) {
            // SDK.sdk.swapCommit(swap, credentials)
            log('swapCommit by secretSeeker', swap)

            // TODO: right now only checking activity item with the same status
            activitiesStore.dispatch({ type: 'UPDATE_SWAP_STATUS', payload: { orderId: swap.secretSeeker.oid, status: 5 } })
          }
        }
      })
    })
    SDK.sdk.on('swap.seeker.invoice.created', swap => {
      activities.forEach(activity => {
        if (activity.status !== 3 || (
          activity.orderId !== swap.secretHolder.orderId &&
          activity.orderId !== swap.secretSeeker.orderId)) return
        log('swap.opened event received', swap)
        if (SDK.sdk.id == substrname(swap.secretHolder.id)) {
          activitiesStore.dispatch({ type: 'UPDATE_SWAP_STATUS', payload: { orderId: swap.secretHolder.oid, status: 6 } })
          // activitiesStore.dispatch({
          //   type: 'UPDATE_SWAP_STATUS',
          //   payload: {
          //     orderId: swap.secretHolder.orderId,
          //     paymentAddress: swap.secretSeeker.state.shared.swapinfo.descriptor.match(/\(([^)]+)\)/)[1]
          //   }
          // })
        } else {
          activitiesStore.dispatch({ type: 'UPDATE_SWAP_STATUS', payload: { orderId: swap.secretSeeker.oid, status: 6 } })
          // activitiesStore.dispatch({
          //   type: 'UPDATE_SWAP_STATUS',
          //   payload: {
          //     orderId: swap.secretSeeker.orderId,
          //     paymentAddress: swap.secretSeeker.state.shared.swapinfo.descriptor.match(/\(([^)]+)\)/)[1]
          //   }
          // })
        }
      })
    })
    SDK.sdk.on('swap.seeker.invoice.sent', swap => {
      activities.forEach(activity => {
        if (activity.status !== 3 || activity.orderId !== swap.secretSeeker.orderId) return

        if (SDK.sdk.id == substrname(swap.secretSeeker.id)) {
          const network = swap.secretSeeker.blockchain.toLowerCase()
          const credentials = SDK.sdk.credentials
          // SDK.sdk.swapCommitV2({
          //   swap: {
          //     id: swap.id
          //   },
          //   party: {
          //     id: swap.secretSeeker.id,
          //     state: {
          //       secret: activity.secret
          //     }
          //   },
          //   opts: {

          //   }
          // })
          activitiesStore.dispatch({ type: 'UPDATE_SWAP_STATUS', payload: { orderId: swap.secretSeeker.oid, status: 7 } })
        } else {
          activitiesStore.dispatch({ type: 'UPDATE_SWAP_STATUS', payload: { orderId: swap.secretHolder.oid, status: 7 } })
        }
      })
    })
    SDK.sdk.on('swap.holder.invoice.paid', swap => {
      log('swap.commiting event received', swap)
      activities.forEach(activity => {
        const { fNor, fBase, fIndex, fNext } = getSwapPairId(activity, swap)

        if (!fNor) return
        if (fIndex === 0) {
          const network = swap.secretSeeker.blockchain.toLowerCase()
          const credentials = SDK.sdk.credentials
          if (SDK.sdk.id === swap.secretHolder.id) {
            // SDK.sdk.swapCommit(swap, credentials)
            log('swapCommit by secretHolder', swap)
            log('secretHolder credentials', credentials)

            // TODO: right now only checking activity item with the same status
            activitiesStore.dispatch({ type: 'UPDATE_SWAP_STATUS', payload: { orderId: swap.secretHolder.oid, status: 8 } })
          }
        } else {
          if (SDK.sdk.id == substrname(swap.secretSeeker.id)) {
            // TODO: right now only checking activity item with the same status
            activitiesStore.dispatch({ type: 'UPDATE_SWAP_STATUS', payload: { orderId: swap.secretSeeker.oid, status: 8 } })
          } else {
            // TODO: right now only checking activity item with the same status
            activitiesStore.dispatch({ type: 'UPDATE_SWAP_STATUS', payload: { orderId: swap.secretHolder.oid, status: 8 } })
          }
        }
      })
    })
    SDK.sdk.on('swap.seeker.invoice.paid', swap => {
      activities.forEach(activity => {
        let ethBal, btcBal

        if (SDK.sdk.id == substrname(swap.secretSeeker.id)) {

          // TODO: right now only checking activity item with the same status
          activitiesStore.dispatch({ type: 'UPDATE_SWAP_STATUS', payload: { orderId: swap.secretSeeker.oid, status: 9 } })
        } else {

          // TODO: right now only checking activity item with the same status
          activitiesStore.dispatch({ type: 'UPDATE_SWAP_STATUS', payload: { orderId: swap.secretHolder.oid, status: 9 } })
        }
      })
    })
    SDK.sdk.on('swap.holder.invoice.settled', swap => {
      activities.forEach(activity => {
        let ethBal, btcBal

        if (SDK.sdk.id == substrname(swap.secretSeeker.id)) {

          // TODO: right now only checking activity item with the same status
          activitiesStore.dispatch({ type: 'UPDATE_SWAP_STATUS', payload: { orderId: swap.secretSeeker.oid, status: 10 } })
        } else {

          // TODO: right now only checking activity item with the same status
          activitiesStore.dispatch({ type: 'UPDATE_SWAP_STATUS', payload: { orderId: swap.secretHolder.oid, status: 10 } })
        }
      })
    })
    SDK.sdk.on('swap.seeker.invoice.settled', swap => {
      activities.forEach(activity => {
        let ethBal, btcBal

        if (SDK.sdk.id == substrname(swap.secretSeeker.id)) {

          // TODO: right now only checking activity item with the same status
          activitiesStore.dispatch({ type: 'UPDATE_SWAP_STATUS', payload: { orderId: swap.secretSeeker.oid, status: 11 } })
        } else {

          // TODO: right now only checking activity item with the same status
          activitiesStore.dispatch({ type: 'UPDATE_SWAP_STATUS', payload: { orderId: swap.secretHolder.oid, status: 11 } })
        }
      })
    })
    return () => {
      SDK.sdk.removeAllListeners()
    }
  }, [activities, SDK])

  return (
    <Box className={`${styles.SwapCreateContainer} panelSwap`}>
      <Stack sx={{ alignItems: 'center' }}>
        <Grid container height={35} sx={{ marginBottom: '1em' }}>
          <Grid item xs={4} textAlign='left' style={{ display: 'flex', alignItems: 'center' }}><h3>Swap</h3></Grid>
        </Grid>
        <Grid className={styles.swapExCont}>
          <SwapAmountItem
            className='base'
            assetId={baseAsset}
            unitPrice={curPrices[ASSET_TYPES[baseAsset].type]}
            amount={baseQuantity}
            availQty={ASSET_TYPES[baseAsset].type === 'BTC' ? node.balance : wallet.balance}
            onAmountChange={onInputBaseQuantity}
            onCoinTypeChange={(asset) => { coinTypeChanged(true, asset); }}
          />
          <Divider style={{ borderColor: '#202020', margin: '0.5em -1em 0 -1em' }} />
          <IconButton className={`${styles.exchange} exchange switchBaseQuoteAsset`} onClick={onExchangeCoinType}><SettingsEthernetIcon /></IconButton>
          <SwapAmountItem
            className='mt-m1 mb-0 quote'
            assetId={quoteAsset}
            unitPrice={curPrices[ASSET_TYPES[quoteAsset].type]}
            amount={quoteQuantity}
            availQty={ASSET_TYPES[baseAsset].type === 'ETH' ? node.balance : wallet.balance}
            onAmountChange={onInputQuoteQuantity}
            onCoinTypeChange={(asset) => { coinTypeChanged(false, asset); }}
          />
        </Grid>
        <Grid sx={{ width: '100%', marginTop: '1em' }}>
          {
            ((ASSET_TYPES[baseAsset].isNFT || baseQuantity) && (ASSET_TYPES[quoteAsset].isNFT || quoteQuantity)
              ? <>
                {(ASSET_TYPES[baseAsset].isNFT == false && ASSET_TYPES[quoteAsset].isNFT == false) ? <p className={styles.prices}>{curPrices.fetching ? 'Loading' : `1 ${ASSET_TYPES[baseAsset].type} = ${Number(curPrices[ASSET_TYPES[baseAsset].type] / curPrices[ASSET_TYPES[quoteAsset].type]).toFixed(6)} ${ASSET_TYPES[quoteAsset].type}`}</p> :
                  <p></p>}
                <Button circular="true" secondary="true" className='gradient-btn w-100 h-3 buttonSwapSubmit' onClick={e => onOrderSwap({
                  side: (
                    (ASSET_TYPES[quoteAsset].type.split('-')[0] !== 'BTCORD' && (ASSET_TYPES[baseAsset].type == 'BTC' || ASSET_TYPES[baseAsset].type.split('-')[0] == 'BTCORD' || ASSET_TYPES[baseAsset].isNFT)) ? 'ask' : 'bid'),
                  baseNetwork: ASSET_TYPES[baseAsset].network,
                  quoteNetwork: ASSET_TYPES[quoteAsset].network,
                  ordinalLocation: (
                    (ASSET_TYPES[baseAsset].isNFT || ASSET_TYPES[quoteAsset].isNFT) ?
                      (ASSET_TYPES[baseAsset].isNFT ?
                        ASSET_TYPES[baseAsset].info.location :
                        ASSET_TYPES[quoteAsset].info.location) :
                      false)
                })}>Swap</Button>
              </>
              : <Button circular="true" secondary="true" className='w-100 h-3 gradient-btn-disabled' disabled>Enter Amounts to Swap</Button>)
          }
        </Grid>
      </Stack>
    </Box>
  );
}
