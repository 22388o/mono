import React, { useEffect, useState, useSyncExternalStore } from "react";
import { Box, Grid, Stack, Button, IconButton, Divider, Popover, Switch, FormControlLabel } from "@mui/material";
import { getBTCPrice, getETHPrice } from "../../utils/apis";
import styles from '../../styles/SwapCreate.module.css';
import { SwapAmountItem } from "./SwapAmountItem";
import { hashSecret, fromWei, fromSats, toWei, toSats, log } from "../../utils/helpers";
import { DemoSwap } from "./DemoSwap";
import SettingsIcon from '@mui/icons-material/Settings';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import classNames from 'classnames';
import CloseIcon from '@mui/icons-material/Close';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { activitiesStore } from "../../syncstore/activitiesstore";
import { userStore } from "../../syncstore/userstore";
import { walletStore } from "../../syncstore/walletstore";

export const SwapCreate = () => {
  const globalWallet = useSyncExternalStore(walletStore.subscribe, () => walletStore.currentState);
  const ASSET_TYPES = globalWallet.assets;
  const mock = false;

  const [baseQuantity, setBaseQuantity] = useState(0);
  const [quoteQuantity, setQuoteQuantity] = useState(0);
  const [baseAsset, setBaseAsset] = useState(0);
  const [quoteAsset, setQuoteAsset] = useState(1);
  const [limitOrder, setLimitOrder] = useState(true);
  const [settingModalOpen, setSettingModalOpen] = useState(false);
  const [secret, setSecret] = useState(null);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [orderSecret, setOrderSecret] = useState(null);
  const [curPrices, setCurPrices] = useState({
    BTC: 0,
    ETH: 0,
    fetching: true
  });


  const activities = useSyncExternalStore(activitiesStore.subscribe, () => activitiesStore.currentState);
  const user = useSyncExternalStore(userStore.subscribe, () => userStore.currentState);
  const nodeConnected = globalWallet.assets[0].connected;
  const walletConnected = globalWallet.assets[1].connected;
  const node = globalWallet.assets[0];
  const wallet = globalWallet.assets[1];
  const useAdditionalInput = globalWallet.useAdditionalInput;

  const notify = () => toast.error(
    "Balance Limit Exceeded!", 
    {
      theme: "colored", 
      autoClose: 1000
    }
  );

  const handleClickSetting = (e) => {
    //setLimitOrder(!limitOrder);
    setAnchorEl(e.currentTarget);
    setSettingModalOpen(!settingModalOpen);
  }

  async function getBalance() {
    const {balances} = await user.user.getBalance(user.user.credentials);
    console.log({balances})
    if (balances[0].lightning) dispatch(setNodeBalance(fromSats(balances[0].lightning.balance)))
  }

  const logOut = () => {
    dispatch(signOut());
    dispatch(clearNodeData());
    dispatch(clearWalletData());
    setOpen(false);
    return Promise.all([user.user.disconnect()])
  };

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
    setSecret(null);
    setOrderSecret(null);
  }, []);

  useEffect(() => { // when user is logged in, connect to ws
    log("useEffect {user, orderSecret}", { user, orderSecret });
    if(user.isLoggedIn) {
      try {
        log("user", user);
        const connected = user.user.connect();
      } catch (error) {
        console.warn(`sorry an error occurred, due to ${error.message} `);
        // logOut();
      }
    };

    return () => { // clean up function to clear user connection from ws
      if(user.isLoggedIn) user.user.disconnect()
      console.log("useEffect cleanup");
    };
  }, [user]);

  useEffect(() => {
    if(!user.user) return;
    activities.forEach(activity => {
      if(activity.status === 0) {
        log("swapState: swap begins ", activity.status);
        setTimeout(() => { 
          activitiesStore.dispatch({ type: 'UPDATE_SWAP_STATUS', payload: {secretHash: activity.secretHash, status: 1} });
        }, 500);
      }
    });

    user.user.on('swap.created', swap => {
      activities.forEach(activity => {
        if(activity.status !== 1 || user.user.id !== swap.secretSeeker.id || activity.secretHash !== swap.secretSeeker.hash || activity.id !== swap.id) return;
        //log("swapState: swap order request sent ", swapState)

        if(user.user.id === swap.secretSeeker.id) {
          log('swap.created event received', swap)
          const network = swap.secretHolder.network['@type'].toLowerCase();
          const credentials = user.user.credentials;

          console.log("swapOpen (secretSeeker) requested, sent settingSwapState to 2");
          user.user.swapOpen(swap, { [network]: credentials[network]});
          activitiesStore.dispatch({ type: 'UPDATE_SWAP_STATUS', payload: {secretHash: swap.secretSeeker.hash, status: 2} });
        }
      });
    });
    user.user.on("swap.opening", swap => {
      activities.forEach(activity => {
        if(activity.status !== 1 || user.user.id !== swap.secretHolder.id || activity.secretHash !== swap.secretHolder.hash || activity.id !== swap.id) return;
        //log("orderSecret in swap.opening !!!!!!!!!!!!!!!!!!!!!!!!!!! shouldn't be null", orderSecret)

        if(user.user.id == swap.secretHolder.id && orderSecret!=null) {
          const network = swap.secretSeeker.network['@type'].toLowerCase();
          const credentials = user.user.credentials;
          user.user.swapOpen(swap, { [network]: credentials[network], secret });
          console.log("swapOpen (secretHolder) requested, settingSwapState to 2");
          activitiesStore.dispatch({ type: 'UPDATE_SWAP_STATUS', payload: {secretHash: swap.secretHolder.hash, status: 2} });
        }
      });
    });
    user.user.on("swap.opened",swap => {
      activities.forEach(activity => {
        if(activity.status !== 2 || user.user.id !== swap.secretSeeker.id || activity.id !== swap.id) return;
        //log('swap.opened event received', swap)
        if(user.user.id == swap.secretSeeker.id){
          const network = swap.secretHolder.network['@type'].toLowerCase();
          const credentials = user.user.credentials;
          user.user.swapCommit(swap, credentials);
          activitiesStore.dispatch({ type: 'UPDATE_SWAP_STATUS', payload: {secretHash: swap.secretSeeker.hash, status: 3, btcAddress: '5b2458b88205d8c6d6252fcb1440ab5248dc15e4a237086202203f5054128d14'} });
          console.log("swapCommit (secretSeeker) requested, settingSwapState to 3");
        }
      });
    })
    user.user.on("swap.committing",swap => {
      activities.forEach(activity => {
        if(activity.status !== 2 || user.user.id !== swap.secretHolder.id || activity.id !== swap.secretHolder.hash) return;
        //log('swap.committing event received', swap)
        //log("orderSecret in swap.committing",orderSecret)

        if(user.user.id == swap.secretHolder.id){
          const network = swap.secretSeeker.network['@type'].toLowerCase();
          const credentials = user.user.credentials;
          user.user.swapCommit(swap, credentials);
          activitiesStore.dispatch({ type: 'UPDATE_SWAP_STATUS', payload: {secretHash: swap.secretHolder.hash, status: 3} });
          console.log("swapCommit (secretHolder) requested, settingSwapState to 3");
        }
      });
    });
    user.user.on("swap.committed",swap => {
      activities.forEach(activity => {
        if(activity.status !== 3 || (activity.id !== swap.id && activity.id !== swap.secretHolder.hash)) return;
        log('swap.committed event received', swap)
        let ethBal, btcBal;

        if(user.user.id == swap.secretSeeker.id){
          //btcBal = node.balance - fromWei(swap.secretHolder.quantity) * curPrices.ETH / curPrices.BTC;
          ethBal = wallet.balance + fromWei(swap.secretHolder.quantity);
          activitiesStore.dispatch({ type: 'UPDATE_SWAP_STATUS', payload: {secretHash: swap.secretSeeker.hash, status: 4} });
          walletStore.dispatch({ type: 'SET_WALLET_BALANCE', payload: ethBal });
        } else {
          btcBal = node.balance + fromSats(swap.secretSeeker.quantity);
          //ethBal = wallet.balance - fromSats(swap.secretSeeker.quantity) * curPrices.BTC / curPrices.ETH;
          activitiesStore.dispatch({ type: 'UPDATE_SWAP_STATUS', payload: {secretHash: swap.secretHolder.hash, status: 4} });
          walletStore.dispatch({ type: 'SET_NODE_BALANCE', payload: btcBal });
        }

        console.log("swap claim completed, settingSwapState to 4");

        const invoiceETH = user.user.id == swap.secretHolder.id ? swap.secretHolder.quantity : swap.secretSeeker.quantity;
        const invoiceBTC = user.user.id == swap.secretHolder.id ? swap.secretHolder.quantity : swap.secretSeeker.quantity;


    
      });
    })
  }, [activities, user]);

  const coinTypeChanged = (isBase, asset) => {
    let another = isBase ? quoteAsset : baseAsset;

    if(!ASSET_TYPES[baseAsset].isNFT && !ASSET_TYPES[quoteAsset].isNFT) another = ASSET_TYPES[asset].type === 'BTC' ? 1 : 0;
    if(isBase) {
      setBaseAsset(asset);
      setQuoteAsset(another);
      if(!limitOrder) setQuoteQuantity(baseQuantity * curPrices[ASSET_TYPES[asset].type] / curPrices[ASSET_TYPES[another].type]);
      if(ASSET_TYPES[asset].isNFT) setBaseQuantity(1);
    }
    else {
      setQuoteAsset(asset);
      setBaseAsset(another);
      if(!limitOrder) setBaseQuantity(quoteQuantity * curPrices[ASSET_TYPES[asset].type] / curPrices[ASSET_TYPES[another].type]);
      if(ASSET_TYPES[asset].isNFT) setQuoteQuantity(1);
    }
  }

  const onInputBaseQuantity = (e) => {
    if(e.target.value < 0) return;
    setBaseQuantity(e.target.value);
    if(!limitOrder) setQuoteQuantity(e.target.value * curPrices[ASSET_TYPES[baseAsset].type] / curPrices[ASSET_TYPES[quoteAsset].type]);
  }

  const onInputQuoteQuantity = (e) => {
    if(e.target.value < 0) return;
    setQuoteQuantity(e.target.value);
    if(!limitOrder) setBaseQuantity(e.target.value * curPrices[ASSET_TYPES[quoteAsset].type] / curPrices[ASSET_TYPES[baseAsset].type]);
  }

  const onOrderSwap = async (order) => {
    const secret = crypto.getRandomValues(new Uint8Array(32))
    const secretHex = [...secret]
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('')
      const secretHash = await hashSecret(secret);
    
    console.log('secret', secret);
    console.log('secretHex', secretHex);
    console.log('secretHash', secretHash);

    setSecret(secretHex);
    setOrderSecret(secretHash);

    // if(ASSET_TYPES[baseAsset].balance <= baseQuantity) { 
    //   notify();
    //   return;
    // }
    
    await thenOrderSwap(order, secret, secretHash);
  }

  const thenOrderSwap = async (order, secret, secretHash) => {
    const ask = order.side=='ask';
    const baseA = order.baseAsset ? order.baseAsset : ASSET_TYPES[baseAsset].type;
    const quoteA = order.quoteAsset ? order.quoteAsset : ASSET_TYPES[quoteAsset].type;
    const baseQty = order.baseQuantity ? order.baseQuantity : baseQuantity;
    const quoteQty = order.quoteQuantity ? order.quoteQuantity : quoteQuantity;
    const baseNet= order.baseNetwork, quoteNet = order.quoteNetwork;
    const baseO = { asset: baseA, network: baseNet, quantity: baseQty }, 
        quoteO = { asset: quoteA,  network: quoteNet, quantity: quoteQty };

    const args = ask ?  { // if order is an ask, bitcoin as base
      base: baseO,
      quote: quoteO
    } : {
      base: quoteO,
      quote: baseO
    };

    try {
      // setOrderSecret(secretHash);
    } catch (error) { log("error on setOrderSecret(secretHash)", error.message); }
    finally {
      // console.log("ASSET_TYPES[args.base.asset].rate" + ASSET_TYPES[args.base.asset].rate);
      console.log("args.base.asset" + args.base.asset);
      console.log("baseAsset" + baseAsset);
      console.log("ASSET_TYPES[args.base.asset]" + ASSET_TYPES["${args.base.asset}"]);
      console.log("ASSET_TYPES[args.base.asset]" + ASSET_TYPES[args.base.asset]);
      console.log("ASSET_TYPES[baseAsset]" + ASSET_TYPES["${baseAsset}"]);
      console.log(ASSET_TYPES[baseAsset]);
      let bai = 0;
      while (bai < ASSET_TYPES.length)  {
        if(ASSET_TYPES[bai].type == args.base.asset) break;
        bai++;
      }
      let qai = 0;
      while (qai < ASSET_TYPES.length)  {
        if(ASSET_TYPES[qai].type == args.quote.asset) break;
        qai++;
      }

      await user.user.submitLimitOrder(
      {
        uid: user.user.id,
        side: order.side,
        hash: secretHash,
        baseAsset: args.base.asset,
        baseNetwork: args.base.network,
        baseQuantity: 1,
        quoteAsset: args.quote.asset,
        quoteNetwork: args.quote.network,
        quoteQuantity: args.quote.quantity * ASSET_TYPES[qai].rate
      }
    ).then(data => {
      const curDate = new Date();
      const date = {
        year: curDate.getFullYear(),
        month: curDate.getMonth(),
        day: curDate.getDate()
      };

      const baseQ = {
            asset: data.baseAsset,
            network: order.baseNetwork,
            quantity: data.baseQuantity / ASSET_TYPES[bai].rate
          }, quoteQ = {
            asset: data.quoteAsset,
            network: order.quoteNetwork,
            quantity: data.quoteQuantity / ASSET_TYPES[qai].rate
          };

      /*if(order.side == 'ask') {
        dispatch(setNodeBalance(node.balance - fromSats(data.baseQuantity)));
      } else {
        dispatch(setWalletBalance(wallet.balance - fromWei(data.quoteQuantity)));
      }*/
    const args = ask ?  { // if order is an ask, bitcoin as base
      base: baseQ,
      quote: quoteQ
    } : {
      base: quoteQ,
      quote: baseQ
    };          
     /* const args = { // if order is an ask, bitcoin as base
        base: baseQ,
        quote: quoteQ
      }*/

      activitiesStore.dispatch({ type: 'ADD_SWAP_ITEM', payload: {
        key: data.id,
        swapId: data.id,
        ts: data.ts,
        uid: data.uid,
        type: data.type,
        side: data.side,
        secret,
        secretHash,
        hash: data.hash,
        baseAsset: args.base.asset,
        baseQuantity: args.base.quantity,
        baseNetwork: args.base.network,
        quoteAsset: args.quote.asset,
        quoteNetwork: args.quote.network,
        quoteQuantity: args.quote.quantity,
        status: 0,
        createdDate: date
      } })

      walletStore.dispatch({ type: 'REMOVE_BALANCE_ON_SWAP_ORDER', payload: {asset: baseAsset, qty: baseQuantity} })
      setBaseQuantity(ASSET_TYPES[baseAsset].isNFT ? 1 : 0);
      setQuoteQuantity(ASSET_TYPES[quoteAsset].isNFT ? 1 : 0);

    });
    }
  }

  const onExchangeCoinType = () => {
    const tBase = baseQuantity, tQuote = quoteQuantity;
    const aBase = baseAsset, aQuote = quoteAsset;
    setBaseAsset(aQuote);setQuoteAsset(aBase);
    setBaseQuantity(tQuote); setQuoteQuantity(tBase);
  }

  const mockSwap = (order) => {
    onOrderSwap(order);
  }

  return (
    <Box className={styles.SwapCreateContainer}>
      <Stack spacing={1}>
        <Grid container height={35}>
          <Grid item xs={4} textAlign='left' style={{display:'flex',alignItems:'flex-start'}}><h3>Swap</h3></Grid>
          <Grid item xs={8} textAlign='right'>
            <IconButton className={classNames({"gradient-btn": settingModalOpen})} size="medium" style={{color:'grey'}} onClick={handleClickSetting} ><SettingsIcon /></IconButton>
            <Popover 
              anchorEl={anchorEl}
              open={settingModalOpen}
              onClose={() => {setAnchorEl(null);setSettingModalOpen(false)}}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
            >
              <Grid 
                container direction='column'
                style={{backgroundColor:'black',width:'100%',height:'100%',padding:'1em'}}
              >
                <Grid item container direction='row' style={{color:'white'}} className="flex-middle">
                  <Grid item xs='10'>Settings</Grid>
                  <Grid item xs='2'><IconButton onClick={handleClickSetting}><CloseIcon style={{color:'white'}} /></IconButton></Grid>
                </Grid>
                <FormControlLabel control={<Switch checked={limitOrder} onChange={(e) => setLimitOrder(!limitOrder)} />} label="Limit Order" />
                <FormControlLabel control={<Switch checked={useAdditionalInput} onChange={(e) => {walletStore.dispatch({type: 'SET_USE_ADDITIONAL_INPUT', payload: !useAdditionalInput})}} />} label="Use Additional Input" />
                { useAdditionalInput && <h4 style={{color:'white'}}>{ASSET_TYPES[baseAsset].title}</h4> }
                {
                  useAdditionalInput && ASSET_TYPES[baseAsset].options && ASSET_TYPES[baseAsset].options.map((option) => 
                    <FormControlLabel 
                      control={
                        <input 
                          style={{border:'1px solid grey',width:'150px'}} 
                          value={option.value}
                          onChange={(e) => walletStore.dispatch({type: 'SET_ADDITIONAL_INPUT_DATA', payload: {type: baseAsset.type, option_type: option.type, value: e.target.value}})} 
                        />
                      }
                      label={option.title} 
                      labelPlacement='start'
                    />
                  )
                }
                { useAdditionalInput && ASSET_TYPES[quoteAsset].options && <h4 style={{color:'white'}}>{quoteAsset.title}</h4> }
                {
                  useAdditionalInput && ASSET_TYPES[quoteAsset].options && ASSET_TYPES[quoteAsset].options.map((option) => 
                    <FormControlLabel 
                      control={<input style={{border:'1px solid grey',width:'150px'}} />}
                      label={option.title} 
                      labelPlacement='start'
                    />
                  )
                }
              </Grid>
            </Popover>
          </Grid>
        </Grid>
        <Grid className={styles.swapExCont}>
          <SwapAmountItem
            assetId={baseAsset}
            unitPrice={curPrices[ASSET_TYPES[baseAsset].type]}
            amount={baseQuantity}
            availQty={ASSET_TYPES[baseAsset].type === 'BTC' ? node.balance : wallet.balance}
            onAmountChange={onInputBaseQuantity}
            onCoinTypeChange={(asset) => {coinTypeChanged(true, asset);}}
            limitOrder={limitOrder}
          />
          <Divider style={{borderColor:'#202020',marginTop:'0.5em'}} />
          <IconButton className={styles.exchange} onClick={onExchangeCoinType}><SettingsEthernetIcon /></IconButton>
          <SwapAmountItem
            className='mt-m1 mb-0'
            assetId={quoteAsset}
            unitPrice={curPrices[ASSET_TYPES[quoteAsset].type]}
            amount={quoteQuantity}
            availQty={ASSET_TYPES[baseAsset].type === 'ETH' ? node.balance : wallet.balance}
            onAmountChange={onInputQuoteQuantity}
            onCoinTypeChange={(asset) => {coinTypeChanged(false, asset);}}
            limitOrder={limitOrder}
            />
        </Grid>
        <Grid>
          { (nodeConnected && walletConnected)
              ? ((ASSET_TYPES[baseAsset].isNFT || baseQuantity) && (ASSET_TYPES[quoteAsset].isNFT || quoteQuantity)
                ? <>
                    <p className={styles.prices}>{ curPrices.fetching ? 'Loading' : `1 ${ASSET_TYPES[baseAsset].type} = ${Number(curPrices[ASSET_TYPES[baseAsset].type] / curPrices[ASSET_TYPES[quoteAsset].type]).toFixed(6)} ${ASSET_TYPES[quoteAsset].type}` }</p>
                    <Button circular secondary className='gradient-btn w-100 h-3' onClick={e => onOrderSwap({side: (
                      (ASSET_TYPES[baseAsset].type == 'BTCORD' || ASSET_TYPES[baseAsset].isNFT) ? 'ask' : 'bid'),
                      baseNetwork: ASSET_TYPES[baseAsset].network,
                      quoteNetwork: ASSET_TYPES[quoteAsset].network })}>Swap</Button>
                    {mock && <DemoSwap mockSwap={mockSwap} /> }
                  </>
                : <Button circular secondary className='w-100 h-3 gradient-btn-disabled' disabled>Enter Amounts to Swap</Button> )
              : <Button circular secondary className='w-100 h-3 gradient-btn-disabled' disabled>Connect Wallets to Continue</Button>
          }
        </Grid>
        <ToastContainer />
      </Stack>
    </Box>
  );
}
