<<<<<<< HEAD
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
=======
import React, { useEffect, useState } from "react";
import 'semantic-ui-css/semantic.min.css';
import {
  Button,
  Divider,
  Form,
  Grid,
  Icon,
} from 'semantic-ui-react';
import {
  useAppDispatch,
  useAppSelector
} from "../../hooks";
import { getBTCPrice, getETHPrice } from "../../utils/apis";
import { addSwapItem } from "../../slices/activitiesSlice";
import styles from '../styles/SwapCreate.module.css';
import { SwapAmountItem } from "./SwapAmountItem";
import {
	updateSwapInfo,
	updateSwapStatus
} from "../../slices/activitiesSlice.js";
import { setNodeBalance, setWalletBalance } from '../../slices/walletSlice';

export const SwapCreate = () => {
  const mock = false;

	const dispatch = useAppDispatch();

  const [baseQuantity, setBaseQuantity] = useState();
  const [quoteQuantity, setQuoteQuantity] = useState();
>>>>>>> master
  const [curPrices, setCurPrices] = useState({
    BTC: 0,
    ETH: 0,
    fetching: true
  });
<<<<<<< HEAD


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
=======
  const [baseAsset, setBaseAsset] = useState('BTC');
  const [quoteAsset, setQuoteAsset] = useState('ETH');
  const [limitOrder, setLimitOrder] = useState(true);

  const hashSecret = async function hash(bytes) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
    console.log('hashBuffer', hashBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    console.log('hashArray', hashArray)
    const hashHex = hashArray
      .map(bytes => bytes.toString(16).padStart(2, '0'))
      .join('');
    console.log('hashHex', hashHex);
      // log("hashSecret output utf8", utf8);
      // log("hashSecret output hashBuffer", hashBuffer);
      // log("hashSecret output hashArray", hashArray);
      // log("hashSecret output hashHex", hashHex);
    return hashHex;
  }
  const [secret, setSecret] = useState(null);
  const [orderSecret, setOrderSecret] = useState(null);

  const [swapState, setSwapState] = useState(0);
  const [createSwap, setCreateSwap] = useState(false);
  const activities = useAppSelector(state => state.activities.activities);
  const nodeConnected = useAppSelector(state => state.wallet.node.connected);
  const walletConnected = useAppSelector(state => state.wallet.wallet.connected);
  const user = useAppSelector(state => state.user);
  const node = useAppSelector(state => state.wallet.node);
  const wallet = useAppSelector(state => state.wallet.wallet);
>>>>>>> master

  const logOut = () => {
    dispatch(signOut());
    dispatch(clearNodeData());
    dispatch(clearWalletData());
    setOpen(false);
<<<<<<< HEAD
    return Promise.all([user.user.disconnect()])
  };
=======
    // return Promise.all([alice.disconnect(), bob.disconnect()]);
    return Promise.all([user.user.disconnect()])
  }

  const log = (message, obj, debug = true) => {
    if (debug) {
      console.log(message + " (SwapCreate)")
     console.log(obj)
    }
  }

  const toWei = (num) => { return num * 1000000000000000000 }
  const fromWei = (num) => { return num / 1000000000000000000 }
  const toSats = (num) => { return num * 100000000 }
  const fromSats = (num) => { return num / 100000000 }
>>>>>>> master

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
<<<<<<< HEAD
    setSecret(null);
    setOrderSecret(null);
  }, []);

  useEffect(() => { // when user is logged in, connect to ws
    // log("useEffect {user, orderSecret}", { user, orderSecret });
    if(user.isLoggedIn) {
      try {
        log("user", user);
        const connected = user.user.connect();
=======
    setSecret(null)
    setOrderSecret(null)

  }, []);

  useEffect(() => {
    log("useEffect {user, orderSecret}", { user, orderSecret })
    if(user.isLoggedIn) {
      try {
        log("user", user);
        const connected = user.user.connect()
>>>>>>> master
      } catch (error) {
        console.warn(`sorry an error occurred, due to ${error.message} `);
        // logOut();
      }
<<<<<<< HEAD
    };

    return () => { // clean up function to clear user connection from ws
      if(user.isLoggedIn) user.user.disconnect()
      console.log("useEffect cleanup");
    };
  }, [user]);

  useEffect(() => {
    if(!user.user) return;
    // log("user.user.id", user.user.id);
    activities.forEach(activity => {
      if(activity.status === 0) {
        log("swapState: swap begins ", activity.status);
        // setTimeout(() => { 
          activitiesStore.dispatch({ type: 'UPDATE_SWAP_STATUS', payload: {orderId: activity.orderId, status: 1} });
          log("swapState: swap iter: activity.orderId  ", activity.orderId);
          log("swapState: swap iter: activity.status  ", activity.status);
        // }, 50);
      }
    });
    user.user.on("swap.created", swap => {
      activities.forEach(activity => {
        // log("activity",activity)
        // activity.status !== 1 || 
        if(activity.status !== 1 || user.user.id !== swap.secretHolder.id.substring(0, swap.secretHolder.id.indexOf('--')) || 
          activity.orderId !== swap.secretHolder.orderId) return;
        //log("orderSecret in swap.opening !!!!!!!!!!!!!!!!!!!!!!!!!!! shouldn't be null", orderSecret)
                
        console.log("activity.secret")
        console.log(activity)
        console.log(activity.secret)
        
        // log("activity.status", activity.status);
        // log("swap.secretHolder.id", swap.secretHolder.id);
        // log("user.user.id", user.user.id);
        // log("swap.secretHolder.id.substring(0, swap.secretHolder.id.indexOf('--'))",swap.secretHolder.id.substring(0, swap.secretHolder.id.indexOf('--')))
        if(user.user.id == swap.secretHolder.id.substring(0, swap.secretHolder.id.indexOf('--')) && orderSecret!=null) {
          // const network = swap.secretSeeker.network['@type'].toLowerCase();
          // const credentials = user.user.credentials;
          user.user.swapOpenV2({
                                  swap: {
                                    id: swap.id, 
                                    swapHash: swap.secretHash
                                  },
                                  party: {
                                    id: swap.secretHolder.id,
                                    state:  
                                      { isSecretHolder: swap.secretHolder.isSecretHolder,
                                        secret: activity.secret,
                                        swapCreationResponder: swap.secretHolder.isSecretHolder
                                       }
                                  },
                                  opts: {

                                  }
                                }).then(data => {
                                  console.log("response from swapOpenV2")
                                  console.log(data)
                                });
          log("swapOpen (secretHolder) requested, sent settingSwapState to 2", swap.id);

           activitiesStore.dispatch({ type: 'UPDATE_SWAP_STATUS', payload: {orderId: swap.secretHolder.orderId, status: 3} });
        } else {
          activitiesStore.dispatch({ type: 'UPDATE_SWAP_STATUS', payload: {orderId: swap.secretSeekerer.orderId, status: 2} });
        }
      });
    });

    user.user.on("swap.opening", swap => {
      activities.forEach(activity => {
        // 
        if(user.user.id !== swap.secretSeeker.id.substring(0, swap.secretSeeker.id.indexOf('--')) || 
          activity.orderId !== swap.secretSeeker.orderId ) return;
        //log("swapState: swap order request sent ", swapState)

        if(activity.status !== 2 || user.user.id == swap.secretSeeker.id.substring(0, swap.secretSeeker.id.indexOf('--'))) {
          log('swap.opening event received', swap)
          // const network = swap.secretHolder.network['@type'].toLowerCase();
          // const credentials = user.user.credentials;

          user.user.swapOpenV2( {
                                  swap: {
                                    id: swap.id, 
                                    swapHash: swap.secretHash
                                  },
                                  party: {
                                    id: swap.secretSeeker.id,
                                    state:  
                                      { isSecretHolder: swap.secretSeeker.isSecretHolder,
                                        secret: activity.secret,
                                        swapCreationResponder: swap.secretSeeker.isSecretHolder
                                       }
                                  },
                                  opts: {

                                  }
                                });
          console.log("swapOpen (secretSeeker) requested, sent settingSwapState to 3");
          activitiesStore.dispatch({ type: 'UPDATE_SWAP_STATUS', payload: {orderId: swap.secretSeeker.orderId, status: 3} });
        } else {
          activitiesStore.dispatch({ type: 'UPDATE_SWAP_STATUS', payload: {orderId: swap.secretHolder.orderId, status: 3} });
        }
      });
    });
    user.user.on("swap.holderPaymentPending",swap => {
      activities.forEach(activity => {
        // 
        if(activity.status !== 3 || (
          activity.orderId !== swap.secretHolder.orderId &&
          activity.orderId !== swap.secretSeeker.orderId)) return;
        //log('swap.opened event received', swap)
        if(user.user.id == swap.secretHolder.id.substring(0, swap.secretHolder.id.indexOf('--'))){
          // const network = swap.secretHolder.network['@type'].toLowerCase();
          // const credentials = user.user.credentials;
          // user.user.swapCommit(swap, credentials);
          activitiesStore.dispatch({ type: 'UPDATE_SWAP_STATUS', 
            payload: {
              orderId: swap.secretHolder.orderId, 
              paymentAddress: swap.secretSeeker.state.shared.swapinfo.descriptor.match(/\(([^)]+)\)/)[1]} });
          // console.log("swapCommit (secretHolder) requested, settingSwapState to 3");
        } else {          
          activitiesStore.dispatch({ type: 'UPDATE_SWAP_STATUS', 
            payload: {
              orderId: swap.secretSeeker.orderId, 
              paymentAddress: swap.secretSeeker.state.shared.swapinfo.descriptor.match(/\(([^)]+)\)/)[1]} });
        }
      });
    })
    user.user.on("swap.holderPaid",swap => {
      activities.forEach(activity => {
        if(activity.status !== 3 || activity.orderId !== swap.secretSeeker.orderId) return;
        //log('swap.committing event received', swap)
        //log("orderSecret in swap.committing",orderSecret)

        if(user.user.id == swap.secretSeeker.id.substring(0, swap.secretSeeker.id.indexOf('--'))){
          const network = swap.secretSeeker.network['@type'].toLowerCase();
          const credentials = user.user.credentials;
          user.user.swapCommitV2({
            swap: {
              id: swap.id
            },
            party: {
              id: swap.secretSeeker.id,
              state: {
                secret: activity.secret
              }
            },
            opts: {

            }
          });
          activitiesStore.dispatch({ type: 'UPDATE_SWAP_STATUS', payload: {orderId: swap.secretSeeker.orderId, status: 4} });
        } else {
          activitiesStore.dispatch({ type: 'UPDATE_SWAP_STATUS', payload: {orderId: swap.secretHolder.orderId, status: 4} });
        }
        console.log("swapCommit (secretSeeker) requested, settingSwapState to 4");
      });
    });
    user.user.on("swap.committing",swap => {
      activities.forEach(activity => {
        // || (activity.orderId !== swap.id && activity.orderId !== swap.secretHolder.orderId)
        let ethBal, btcBal;

        if(user.user.id == swap.secretSeeker.id.substring(0, swap.secretSeeker.id.indexOf('--'))){
          //btcBal = node.balance - fromWei(swap.secretHolder.quantity) * curPrices.ETH / curPrices.BTC;
          // ethBal = wallet.balance + fromWei(swap.secretHolder.quantity);
          activitiesStore.dispatch({ type: 'UPDATE_SWAP_STATUS', payload: {orderId: swap.secretSeeker.orderId, status: 4} });
          // walletStore.dispatch({ type: 'SET_WALLET_BALANCE', payload: ethBal });
        } else {
          // btcBal = node.balance + fromSats(swap.secretSeeker.quantity);
          //ethBal = wallet.balance - fromSats(swap.secretSeeker.quantity) * curPrices.BTC / curPrices.ETH;
          activitiesStore.dispatch({ type: 'UPDATE_SWAP_STATUS', payload: {orderId: swap.secretHolder.orderId, status: 4} });
          // walletStore.dispatch({ type: 'SET_NODE_BALANCE', payload: btcBal });
        }

        console.log("swap.committing: swap claim submitted, settingSwapState to 4");

        // const invoiceETH = user.user.id == swap.secretHolder.id.substring(0, swap.secretHolder.id.indexOf('--')) ? swap.secretHolder.quantity : swap.secretSeeker.quantity;
        // const invoiceBTC = user.user.id == swap.secretHolder.id.substring(0, swap.secretHolder.id.indexOf('--')) ? swap.secretHolder.quantity : swap.secretSeeker.quantity;


    
      });
    })
    user.user.on("swap.committed",swap => {
      activities.forEach(activity => {
        // || (activity.orderId !== swap.id && activity.orderId !== swap.secretHolder.orderId)
        let ethBal, btcBal;

        if(user.user.id == swap.secretSeeker.id.substring(0, swap.secretSeeker.id.indexOf('--'))){
          //btcBal = node.balance - fromWei(swap.secretHolder.quantity) * curPrices.ETH / curPrices.BTC;
          // ethBal = wallet.balance + fromWei(swap.secretHolder.quantity);
          activitiesStore.dispatch({ type: 'UPDATE_SWAP_STATUS', payload: {orderId: swap.secretSeeker.orderId, status: 4} });
          // walletStore.dispatch({ type: 'SET_WALLET_BALANCE', payload: ethBal });
        } else {
          // btcBal = node.balance + fromSats(swap.secretSeeker.quantity);
          //ethBal = wallet.balance - fromSats(swap.secretSeeker.quantity) * curPrices.BTC / curPrices.ETH;
          activitiesStore.dispatch({ type: 'UPDATE_SWAP_STATUS', payload: {orderId: swap.secretHolder.orderId, status: 4} });
          // walletStore.dispatch({ type: 'SET_NODE_BALANCE', payload: btcBal });
        }

        console.log("swap.committed: swap claim completed, settingSwapState to 4");

        // const invoiceETH = user.user.id == swap.secretHolder.id.substring(0, swap.secretHolder.id.indexOf('--')) ? swap.secretHolder.quantity : swap.secretSeeker.quantity;
        // const invoiceBTC = user.user.id == swap.secretHolder.id.substring(0, swap.secretHolder.id.indexOf('--')) ? swap.secretHolder.quantity : swap.secretSeeker.quantity;


    
      });
    })
    return () => {
      // cleanup
      user.user.removeAllListeners("swap.created", () => {console.log("swap.created event listener cleanup")});
      user.user.removeAllListeners("swap.opening", () => {console.log("swap.opening event listener cleanup")});
      user.user.removeAllListeners("swap.holderPaymentPending", () => {console.log("swap.holderPaymentPending event listener cleanup")});
      user.user.removeAllListeners("swap.holderPaid", () => {console.log("swap.holderPaid event listener cleanup")});
      user.user.removeAllListeners("swap.committing", () => {console.log("swap.committing event listener cleanup")});
      user.user.removeAllListeners("swap.committed", () => {console.log("swap.committed event listener cleanup")});
      
    }
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
=======
    }

    return () => {
      if(user.isLoggedIn) user.user.disconnect()
      console.log("useEffect cleanup");
    };

  }, [user]);

  useEffect(() => {
    log("running useEffect", swapState)
    if(swapState === 0) {
      console.log("swapState: swap begins ", swapState)

    } else if(swapState === 1) {
      console.log("swapState: swap order request sent ", swapState)

      user.user.on("swap.created",swap => {
        // dispatch(updateSwapStatus({ status: 2 }));
        log('swap.created event received', swap)
        if(user.user.id == swap.secretSeeker.id){ // TODO also add check if swapOpen already called on swap id
          const network = swap.secretHolder.network['@type'].toLowerCase();
          const credentials = user.user.credentials;
          setSwapState(2);
          console.log("swapOpen (secretSeeker) requested, sentsettingSwapState to 2");
          user.user.swapOpen(swap, { [network]: credentials[network]});
        }
      })
      user.user.on("swap.opening", swap => {
        // dispatch(updateSwapStatus({ status: 3 }));
        log('swap.opening event received', swap)
        log("orderSecret in swap.opening !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! shouldn't be null",orderSecret)
        if(user.user.id == swap.secretHolder.id && orderSecret!=null) { // TODO also add check if swapOpen already called on swap id
          const network = swap.secretSeeker.network['@type'].toLowerCase();
          const credentials = user.user.credentials;
          // setSwapState(2);
          // console.log("settingSwapState to 2");
          user.user.swapOpen(swap, { [network]: credentials[network], secret });
          setSwapState(2);
          console.log("swapOpen (secretHolder) requested, settingSwapState to 2");
        }
      })

    } else if(swapState === 2) {
      console.log("swapState: swap.created/opening swapOpen sent", swapState)
      user.user.on("swap.opened",swap => {
        // dispatch(updateSwapStatus({ status: 4 }));
        log('swap.opened event received', swap)
        // log("orderSecret in swap.opened",orderSecret)
        if(user.user.id == swap.secretSeeker.id){
          const network = swap.secretHolder.network['@type'].toLowerCase();
          const credentials = user.user.credentials;
          user.user.swapCommit(swap, credentials);
          setSwapState(3);
          console.log("swapCommit (secretSeeker) requested, settingSwapState to 3");
        }
      })
      user.user.on("swap.committing",swap => {
        // dispatch(updateSwapStatus({ status: 5 }));
        log('swap.committing event received', swap)
        log("orderSecret in swap.committing",orderSecret)

        if(user.user.id == swap.secretHolder.id){
          const network = swap.secretSeeker.network['@type'].toLowerCase();
          const credentials = user.user.credentials;
          user.user.swapCommit(swap, credentials);
          setSwapState(3);
          console.log("swapCommit (secretHolder) requested, settingSwapState to 3");
        }

      })

    } else if(swapState === 3) {
      console.log("swapState swap.opened/committing swapCommit sent", swapState)
      user.user.on("swap.committed",swap => {
        log('swap.committed event received', swap)

        let ethBal, btcBal;

        if(user.user.id == swap.secretHolder.id){
            btcBal = toSats(node.balance) - swap.secretHolder.quantity;
            ethBal = toWei(wallet.balance) + swap.secretSeeker.quantity;
        } else {
          btcBal = toSats(node.balance) + swap.secretHolder.quantity;
          ethBal = toWei(wallet.balance) - swap.secretSeeker.quantity;
        }

        console.log("swap claim completed, settingSwapState to 4");
        setSwapState(4);

        const invoiceETH = user.user.id == swap.secretHolder.id ? swap.secretHolder.quantity : swap.secretSeeker.quantity;
        const invoiceBTC = user.user.id == swap.secretHolder.id ? swap.secretHolder.quantity : swap.secretSeeker.quantity;
        dispatch(setNodeBalance(fromSats(btcBal)))
        dispatch(setWalletBalance(fromWei(ethBal)))
      })

    }
    // else if(swapState === 4) {
    //   console.log("swapState ", swapState)
    // } else if(swapState === 5) {
    //   console.log("swapState ", swapState)}

  }, [swapState]);
  useEffect(() => {
    // log("activities", activities)
    if(activities.length > 0)
    dispatch(updateSwapStatus({ secretHash: orderSecret ,status: swapState + 1 }));
  }, [swapState, activities]);

  const coinTypeChanged = (isBase, coinType) => {
    if(!limitOrder) {
      if(isBase) setQuoteQuantity(baseQuantity * curPrices[coinType] / curPrices[quoteAsset]);
      else  setBaseQuantity(quoteQuantity * curPrices[coinType] / curPrices[baseAsset]);
>>>>>>> master
    }
  }

  const onInputBaseQuantity = (e) => {
<<<<<<< HEAD
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
    const randomValues = crypto.getRandomValues(new Uint8Array(32))
    const secretHex = [...randomValues]
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('')
    const secretHash = await hashSecret(randomValues);
    
    console.log('randomValues', randomValues);
    console.log('secretHex', secretHex);
    console.log('secretHash', secretHash);

    setSecret(secretHex);
    setOrderSecret(secretHash);
    // setSecret('e77cc1219f6db5019777f9f94d54a92589adef20aa8f72ac042d241434062da7');
    // setOrderSecret('ab441ccd82da7c1a4dcfd0ce711cc108ce54c6289293eb8d1755ece4463fb0af');

    // if(ASSET_TYPES[baseAsset].balance <= baseQuantity) { 
    //   notify();
    //   return;
    // }
    
    await thenOrderSwap(order, secretHex, secretHash);
    // await thenOrderSwap(order, 'e77cc1219f6db5019777f9f94d54a92589adef20aa8f72ac042d241434062da7', 'ab441ccd82da7c1a4dcfd0ce711cc108ce54c6289293eb8d1755ece4463fb0af');
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

      const ordinalLocation = !args.ordinalLocation ? args.ordinalLocation : false

=======
    setBaseQuantity(e.target.value);
    if(!limitOrder) setQuoteQuantity(e.target.value * curPrices[baseAsset] / curPrices[quoteAsset]);
  }

  const onInputQuoteQuantity = (e) => {
    setQuoteQuantity(e.target.value);
    if(!limitOrder) setBaseQuantity(e.target.value * curPrices[quoteAsset] / curPrices[baseAsset]);
  }

  const onCreateSwap = async (order) => {
    const secret = crypto.getRandomValues(new Uint8Array(32))
    const secretHex = [...secret]
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('')
    console.log('secret', secret)
    console.log('secretHex', secretHex)
    // const secret = Math.random().toString(36).slice(2);

    // log("{secret, secretHash, secret256}",{secret, secretHash: await hashSecret(secret)});
    const secretHash = await hashSecret(secret);
    console.log('secretHash', secretHash)

    setSecret(secretHex);
    setOrderSecret(secretHash);
    if(baseQuantity==0 || quoteQuantity==0) {
      console.log("baseQuantity or quoteQuantity is 0");
    }
    else {
      setBaseQuantity();
      setQuoteQuantity();
      setSwapState(0); // swap begins
      await thenCreateSwap(order, secret, secretHash);
    }
  }

const thenCreateSwap = async (order, secret, secretHash) => {

    const ask = order.side=='ask';
    const baseA = order.baseAsset ? order.baseAsset : baseAsset
    const quoteA = order.quoteAsset ? order.quoteAsset : quoteAsset
    const baseQty = order.baseQuantity ? order.baseQuantity : baseQuantity
    const quoteQty = order.quoteQuantity ? order.quoteQuantity : quoteQuantity
    const baseNet= order.baseNetwork
    const quoteNet = order.quoteNetwork

    const args = ask ?  { // if order is an ask, bitcoin as base
      base: {
        asset: baseA,
        network: baseNet,
        quantity: baseQty
      },
      quote: {
        asset: quoteA,
        network: quoteNet,
        quantity: quoteQty
      }
    } : {
      base: {
        asset: quoteA,
        network: quoteNet,
        quantity: quoteQty
      },
      quote: {
        asset: baseA,
        network: baseNet,
        quantity: baseQty
      }
    }

    try {

      // setOrderSecret(secretHash);
    } catch (error) {log("error on setOrderSecret(secretHash)", error.message)}
    finally {
>>>>>>> master
      await user.user.submitLimitOrder(
      {
        uid: user.user.id,
        side: order.side,
        hash: secretHash,
<<<<<<< HEAD
        baseAsset: args.base.asset.split('-')[0],
        baseNetwork: args.base.network,
        baseQuantity: 4000,
        quoteAsset: args.quote.asset.split('-')[0],
        quoteNetwork: args.quote.network,
        quoteQuantity: Math.round(args.quote.quantity * ASSET_TYPES[qai].rate),
        ordinalLocation: order.ordinalLocation
      }
    ).then(data => {
      console.log("order opened with this response data")
      console.log(data)
=======
        baseAsset: args.base.asset,
        baseNetwork: args.base.network,
        baseQuantity: toSats(args.base.quantity),
        quoteAsset: args.quote.asset,
        quoteNetwork: args.quote.network,
        quoteQuantity: toWei(args.quote.quantity)
      }
    ).then(data => {
      setSwapState(1); // swap request sent
      // log("this is data inside submitLimitOrder", data);

>>>>>>> master
      const curDate = new Date();
      const date = {
        year: curDate.getFullYear(),
        month: curDate.getMonth(),
        day: curDate.getDate()
      };

<<<<<<< HEAD
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
        orderId: data.id,
=======

      const ask = order.side=='ask';
      const args = ask ?  { // if order is an ask, bitcoin as base
        base: {
          asset: data.baseAsset,
          network: order.baseNetwork,
          quantity: fromSats(data.baseQuantity)
        },
        quote: {
          asset: data.quoteAsset,
          network: order.quoteNetwork,
          quantity: fromWei(data.quoteQuantity)
        }
      } : {
        base: {
          asset: data.quoteAsset,
          network: order.quoteNetwork,
          quantity: fromWei(data.quoteQuantity)
        },
        quote: {
          asset: data.baseAsset,
          network: order.baseNetwork,
          quantity: fromSats(data.baseQuantity)
        }
      }

      dispatch(addSwapItem({
        key: data.id,
        swapId: data.id,
>>>>>>> master
        ts: data.ts,
        uid: data.uid,
        type: data.type,
        side: data.side,
<<<<<<< HEAD
        secret: secret,
=======
        secret,
>>>>>>> master
        secretHash,
        hash: data.hash,
        baseAsset: args.base.asset,
        baseQuantity: args.base.quantity,
        baseNetwork: args.base.network,
        quoteAsset: args.quote.asset,
        quoteNetwork: args.quote.network,
        quoteQuantity: args.quote.quantity,
<<<<<<< HEAD
        ordinalLocation: args.ordinalLocation,
        status: 0,
        createdDate: date
      } })

      walletStore.dispatch({ type: 'REMOVE_BALANCE_ON_SWAP_ORDER', payload: {asset: baseAsset, qty: baseQuantity} })
      setBaseQuantity(ASSET_TYPES[baseAsset].isNFT ? 1 : 0);
      setQuoteQuantity(ASSET_TYPES[quoteAsset].isNFT ? 1 : 0);

=======
        status: 1,
        createdDate: date
      }));

      setBaseQuantity(0);
      setQuoteQuantity(0);
>>>>>>> master
    });
    }
  }

<<<<<<< HEAD
  const onExchangeCoinType = () => {
=======
  const onChangeCoinType = () => {
>>>>>>> master
    const tBase = baseQuantity, tQuote = quoteQuantity;
    const aBase = baseAsset, aQuote = quoteAsset;
    setBaseAsset(aQuote);setQuoteAsset(aBase);
    setBaseQuantity(tQuote); setQuoteQuantity(tBase);
  }

  const mockSwap = (order) => {
<<<<<<< HEAD
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
                { (useAdditionalInput && ASSET_TYPES[baseAsset].options?.length>0) && <h4 style={{color:'white'}}>{ASSET_TYPES[baseAsset].title}</h4> }
                {
                  useAdditionalInput && ASSET_TYPES[baseAsset].options && ASSET_TYPES[baseAsset].options.map((option) => 
                    <FormControlLabel 
                      control={
                        <input 
                          style={{border:'1px solid grey',
                                  borderRadius:'10px',
                                  width:'90px',
                                  marginLeft:'15px',
                                  marginRight:'15px'}} 
                          value={option.value}
                          onChange={(e) => walletStore.dispatch({type: 'SET_ADDITIONAL_INPUT_DATA', payload: {type: baseAsset.type, option_type: option.type, value: e.target.value}})} 
                        />
                      }
                      label={option.title} 
                      labelPlacement='start'
                    />
                  )
                }
                { (useAdditionalInput && ASSET_TYPES[quoteAsset].options?.length>0) && <h4 style={{color:'white'}}>{ASSET_TYPES[quoteAsset].title}</h4> }
                { useAdditionalInput && ASSET_TYPES[quoteAsset].options && <h4 style={{color:'white'}}>{quoteAsset.title}</h4> }
                {
                  useAdditionalInput && ASSET_TYPES[quoteAsset].options && ASSET_TYPES[quoteAsset].options.map((option) => 
                    <FormControlLabel 
                      control={<input style={{border:'1px solid grey',
                                              borderRadius:'10px',
                                              width:'90px',
                                              marginLeft:'15px',
                                              marginRight:'15px'}} />}
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
                    { (ASSET_TYPES[baseAsset].isNFT==false && ASSET_TYPES[quoteAsset].isNFT==false) ?  <p className={styles.prices}>{ curPrices.fetching ? 'Loading' : `1 ${ASSET_TYPES[baseAsset].type} = ${Number(curPrices[ASSET_TYPES[baseAsset].type] / curPrices[ASSET_TYPES[quoteAsset].type]).toFixed(6)} ${ASSET_TYPES[quoteAsset].type}` }</p> :
                    <p></p>}
                    <Button circular secondary className='gradient-btn w-100 h-3' onClick={e => onOrderSwap({
                      side: (
                      (ASSET_TYPES[baseAsset].type.split('-')[0] == 'BTCORD' || ASSET_TYPES[baseAsset].isNFT) ? 'ask' : 'bid'),
                      baseNetwork: ASSET_TYPES[baseAsset].network,
                      quoteNetwork: ASSET_TYPES[quoteAsset].network,
                      ordinalLocation:  (
                        (ASSET_TYPES[baseAsset].isNFT || ASSET_TYPES[quoteAsset].isNFT )? 
                          (ASSET_TYPES[baseAsset].isNFT ? 
                            ASSET_TYPES[baseAsset].info.location : 
                            ASSET_TYPES[quoteAsset].info.location) : 
                          false )})}>Swap</Button>
                    {mock && <DemoSwap mockSwap={mockSwap} /> }
                  </>
                : <Button circular secondary className='w-100 h-3 gradient-btn-disabled' disabled>Enter Amounts to Swap</Button> )
              : <Button circular secondary className='w-100 h-3 gradient-btn-disabled' disabled>Connect Wallets to Continue</Button>
          }
        </Grid>
        <ToastContainer />
      </Stack>
    </Box>
=======
    onCreateSwap(order);
    // setBaseQuantity(1);
    // setQuoteQuantity(1);
  }

  return (
    <Grid centered className={styles.SwapCreateContainer}>
      <Grid.Row className={styles.SwapHeader}>
        <h3>Swap</h3>
        <Button circular secondary={limitOrder} primary={!limitOrder} icon='setting' className={styles.borderless} onClick={() => {setLimitOrder(!limitOrder)}} />
      </Grid.Row>
      <Grid.Row className={styles.swapExCont}>
        <Form>
          <SwapAmountItem
            className='mb-1'
            coinType={baseAsset}
            unitPrice={curPrices[baseAsset]}
            amount={baseQuantity}
            onAmountChange={onInputBaseQuantity}
            onCoinTypeChange={(e, data) => {setBaseAsset(data.value);coinTypeChanged(true, data.value);}}
            limitOrder={limitOrder}
            />
          <Divider />
          <Button className={styles.exchange} onClick={onChangeCoinType}><Icon name='exchange' /></Button>
          <SwapAmountItem
            className='mt-1 mb-0'
            coinType={quoteAsset}
            unitPrice={curPrices[quoteAsset]}
            amount={quoteQuantity}
            onAmountChange={onInputQuoteQuantity}
            onCoinTypeChange={(e, data) => {setQuoteAsset(data.value);coinTypeChanged(false, data.value);}}
            limitOrder={limitOrder}
            />
        </Form>
      </Grid.Row>
      <Grid.Row>
        { (nodeConnected && walletConnected)
            ? ((baseQuantity || true)
              ? <>
                  <p className={styles.prices}>{ curPrices.fetching ? 'Loading' : `1 ${baseAsset} = ${Number(curPrices[baseAsset] / curPrices[quoteAsset]).toFixed(6)} ${quoteAsset}` }</p>
                  <Button circular secondary className='gradient-btn w-100 h-3' onClick={e => onCreateSwap({side: (
                    baseAsset == 'BTC' ? 'ask' : 'bid'),
                    baseNetwork: (baseAsset == 'BTC' ? 'lightning.btc' :'eth-l2.eth'),
                    quoteNetwork: (baseAsset == 'BTC' ? 'eth-l2.eth' : 'lightning.btc') })}>Swap</Button>
                  {mock && <>
                    <p>demo swap</p>
                    <Button circular secondary className='gradient-btn w-100 h-3' onClick={e => mockSwap({
                      side: 'ask',
                      baseAsset: 'BTC',
                      baseNetwork: 'lightning.btc',
                      baseQuantity: 0.001,
                      quoteAsset: 'ETH',
                      quoteNetwork: 'eth-l2.eth',
                      quoteQuantity: 0.0000000000001})}>Swap 0.001 BTC for 0.0000000000001 ETH</Button>
                    <Button circular secondary className='gradient-btn w-100 h-3' onClick={e => mockSwap({
                      side: 'bid',
                      baseAsset: 'ETH',
                      baseNetwork: 'eth-l2.eth',
                      baseQuantity: 0.0000000000001,
                      quoteAsset: 'BTC',
                      quoteNetwork: 'lightning.btc',
                      quoteQuantity: 0.001})}>Swap 0.0000000000001 ETH for 0.001 BTC</Button>
                  </>}
                </>
              : <Button circular secondary className='gradient-btn w-100 h-3' disabled>Enter Amounts to Swap</Button> )
            : <Button circular secondary className='gradient-btn w-100 h-3' disabled>Connect Node & Wallet to Swap</Button>
        }
      </Grid.Row>
    </Grid>
>>>>>>> master
  );
}
