import React, { useEffect, useState } from "react";
import 'semantic-ui-css/semantic.min.css';
import { 
  Button, Divider, Form, Grid, Icon,
} from 'semantic-ui-react';
import { useAppDispatch, useAppSelector } from "../../hooks";
import { getBTCPrice, getETHPrice } from "../../utils/apis";
import { addSwapItem } from "../../slices/activitiesSlice";
import styles from '../styles/SwapCreate.module.css';
import { SwapAmountItem } from "./SwapAmountItem";
import { updateSwapStatus } from "../../slices/activitiesSlice.js";
import { setNodeBalance, setWalletBalance } from '../../slices/walletSlice';
import { hashSecret, fromWei, fromSats, toWei, toSats, log } from "../../utils/helpers";
import { DemoSwap } from "./DemoSwap";
import { NETWORK_DATA } from "../../config/network";

export const SwapCreate = () => {
  const mock = false;
	const dispatch = useAppDispatch();

  const [baseQuantity, setBaseQuantity] = useState(0);
  const [quoteQuantity, setQuoteQuantity] = useState(0);
  const [baseAsset, setBaseAsset] = useState('BTC');
  const [quoteAsset, setQuoteAsset] = useState('ETH');
  const [limitOrder, setLimitOrder] = useState(true);
  const [secret, setSecret] = useState(null);
  const [orderSecret, setOrderSecret] = useState(null);
  const [curPrices, setCurPrices] = useState({
    BTC: 0,
    ETH: 0,
    fetching: true
  });

  const activities = useAppSelector(state => state.activities.activities);
  const nodeConnected = useAppSelector(state => state.wallet.node.connected);
  const walletConnected = useAppSelector(state => state.wallet.wallet.connected);
  const user = useAppSelector(state => state.user);
  const node = useAppSelector(state => state.wallet.node);
  const wallet = useAppSelector(state => state.wallet.wallet);

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
        setTimeout(() => { dispatch(updateSwapStatus({secretHash: activity.secretHash, status: 1}))}, 500);
      }
    });

    user.user.on('swap.created', swap => {
      activities.forEach(activity => {
        if(activity.status !== 1 || user.user.id !== swap.secretSeeker.id || activity.secretHash !== swap.secretSeeker.hash) return;
        //log("swapState: swap order request sent ", swapState)

        if(user.user.id === swap.secretSeeker.id) {
          log('swap.created event received', swap)
          const network = swap.secretHolder.network['@type'].toLowerCase();
          const credentials = user.user.credentials;

          console.log("swapOpen (secretSeeker) requested, sent settingSwapState to 2");
          user.user.swapOpen(swap, { [network]: credentials[network]});
          dispatch(updateSwapStatus({secretHash: swap.secretSeeker.hash, status: 2}));
        }
      });
    });
    user.user.on("swap.opening", swap => {
      activities.forEach(activity => {
        if(activity.status !== 1 || user.user.id !== swap.secretHolder.id || activity.secretHash !== swap.secretHolder.hash) return;
        //log("orderSecret in swap.opening !!!!!!!!!!!!!!!!!!!!!!!!!!! shouldn't be null", orderSecret)

        if(user.user.id == swap.secretHolder.id && orderSecret!=null) {
          const network = swap.secretSeeker.network['@type'].toLowerCase();
          const credentials = user.user.credentials;
          user.user.swapOpen(swap, { [network]: credentials[network], secret });
          console.log("swapOpen (secretHolder) requested, settingSwapState to 2");
          dispatch(updateSwapStatus({secretHash: swap.secretHolder.hash, status: 2}));
        }
      });
    });
    user.user.on("swap.opened",swap => {
      activities.forEach(activity => {
        if(activity.status !== 2 || user.user.id !== swap.secretSeeker.id || activity.secretHash !== swap.secretSeeker.hash) return;
        //log('swap.opened event received', swap)
        if(user.user.id == swap.secretSeeker.id){
          const network = swap.secretHolder.network['@type'].toLowerCase();
          const credentials = user.user.credentials;
          user.user.swapCommit(swap, credentials);
          dispatch(updateSwapStatus({secretHash: swap.secretSeeker.hash, status: 3}));
          console.log("swapCommit (secretSeeker) requested, settingSwapState to 3");
        }
      });
    })
    user.user.on("swap.committing",swap => {
      activities.forEach(activity => {
        if(activity.status !== 2 || user.user.id !== swap.secretHolder.id || activity.secretHash !== swap.secretHolder.hash) return;
        //log('swap.committing event received', swap)
        //log("orderSecret in swap.committing",orderSecret)

        if(user.user.id == swap.secretHolder.id){
          const network = swap.secretSeeker.network['@type'].toLowerCase();
          const credentials = user.user.credentials;
          user.user.swapCommit(swap, credentials);
          //setSwapState(3);
          dispatch(updateSwapStatus({secretHash: swap.secretHolder.hash, status: 3}));
          console.log("swapCommit (secretHolder) requested, settingSwapState to 3");
        }
      });
    });
    user.user.on("swap.committed",swap => {
      activities.forEach(activity => {
        if(activity.status !== 3 || (activity.secretHash !== swap.secretSeeker.hash && activity.secretHash !== swap.secretHolder.hash)) return;
        log('swap.committed event received', swap)
        let ethBal, btcBal;

        if(user.user.id == swap.secretSeeker.id){
          //btcBal = node.balance - fromWei(swap.secretHolder.quantity) * curPrices.ETH / curPrices.BTC;
          ethBal = wallet.balance + fromWei(swap.secretHolder.quantity);
          dispatch(updateSwapStatus({secretHash: swap.secretSeeker.hash, status: 4}));
          dispatch(setWalletBalance(ethBal));
        } else {
          btcBal = node.balance + fromSats(swap.secretSeeker.quantity);
          //ethBal = wallet.balance - fromSats(swap.secretSeeker.quantity) * curPrices.BTC / curPrices.ETH;
          dispatch(updateSwapStatus({secretHash: swap.secretHolder.hash, status: 4}));
          // dispatch(setNodeBalance(btcBal));
          getBalance();
        }

        console.log("swap claim completed, settingSwapState to 4");

        const invoiceETH = user.user.id == swap.secretHolder.id ? swap.secretHolder.quantity : swap.secretSeeker.quantity;
        const invoiceBTC = user.user.id == swap.secretHolder.id ? swap.secretHolder.quantity : swap.secretSeeker.quantity;


    
      });
    })


    /*activities.map(activity => {
      const swapState = activity.status;
      if(swapState === 0) {
        log("swapState: swap begins ", swapState);
        setTimeout(() => { dispatch(updateSwapStatus({secretHash: activity.secretHash, status: 1}))}, 500);
      } else if(swapState === 1) {
        log("swapState: swap order request sent ", swapState)
        user.user.on("swap.created",swap => {
          log('swap.created event received', swap)
          if(user.user.id == swap.secretSeeker.id){
            const network = swap.secretHolder.network['@type'].toLowerCase();
            const credentials = user.user.credentials;

            console.log("swapOpen (secretSeeker) requested, sent settingSwapState to 2");
            user.user.swapOpen(swap, { [network]: credentials[network]});
            dispatch(updateSwapStatus({secretHash: swap.secretSeeker.hash, status: 2}));
          }
        })
        user.user.on("swap.opening", swap => {
          log('swap.opening event received', swap)
          log("orderSecret in swap.opening !!!!!!!!!!!!!!!!!!!!!!!!!!! shouldn't be null", orderSecret)

          if(user.user.id == swap.secretHolder.id && orderSecret!=null) {
            const network = swap.secretSeeker.network['@type'].toLowerCase();
            const credentials = user.user.credentials;
            user.user.swapOpen(swap, { [network]: credentials[network], secret });
            console.log("swapOpen (secretHolder) requested, settingSwapState to 2");
            dispatch(updateSwapStatus({secretHash: swap.secretHolder.hash, status: 2}));
          }
        })

      } else if(swapState === 2) {
        log("swapState: swap.created/opening swapOpen sent", swapState)
        user.user.on("swap.opened",swap => {
          log('swap.opened event received', swap)
          if(user.user.id == swap.secretSeeker.id){
            const network = swap.secretHolder.network['@type'].toLowerCase();
            const credentials = user.user.credentials;
            user.user.swapCommit(swap, credentials);
            dispatch(updateSwapStatus({secretHash: swap.secretSeeker.hash, status: 3}));
            console.log("swapCommit (secretSeeker) requested, settingSwapState to 3");
          }
        })
        user.user.on("swap.committing",swap => {
          log('swap.committing event received', swap)
          log("orderSecret in swap.committing",orderSecret)

          if(user.user.id == swap.secretHolder.id){
            const network = swap.secretSeeker.network['@type'].toLowerCase();
            const credentials = user.user.credentials;
            user.user.swapCommit(swap, credentials);
            //setSwapState(3);
            dispatch(updateSwapStatus({secretHash: swap.secretHolder.hash, status: 3}));
            console.log("swapCommit (secretHolder) requested, settingSwapState to 3");
          }
        })
      } else if(swapState === 3) {
        log("swapState swap.opened/committing swapCommit sent", swapState)
        user.user.on("swap.committed",swap => {
          log('swap.committed event received', swap)
          let ethBal, btcBal;

          if(user.user.id == swap.secretSeeker.id){
            //btcBal = node.balance - fromWei(swap.secretHolder.quantity) * curPrices.ETH / curPrices.BTC;
            ethBal = wallet.balance + fromSats(swap.secretSeeker.quantity) * curPrices.BTC / curPrices.ETH;
            dispatch(updateSwapStatus({secretHash: swap.secretSeeker.hash, status: 4}));
            dispatch(setWalletBalance(ethBal));
          } else {
            btcBal = node.balance + fromWei(swap.secretHolder.quantity) * curPrices.ETH / curPrices.BTC;
            //ethBal = wallet.balance - fromSats(swap.secretSeeker.quantity) * curPrices.BTC / curPrices.ETH;
            dispatch(updateSwapStatus({secretHash: swap.secretHolder.hash, status: 4}));
            dispatch(setNodeBalance(btcBal));
          }

          console.log("swap claim completed, settingSwapState to 4");

          const invoiceETH = user.user.id == swap.secretHolder.id ? swap.secretHolder.quantity : swap.secretSeeker.quantity;
          const invoiceBTC = user.user.id == swap.secretHolder.id ? swap.secretHolder.quantity : swap.secretSeeker.quantity;
        })

      }
    });*/
  }, [activities, user]);

  const coinTypeChanged = (isBase, coinType) => {
    if(!limitOrder) {
      let another = coinType === 'BTC' ? 'ETH' : 'BTC';
      if(isBase) {
        setBaseAsset(coinType);
        setQuoteAsset(another);
        setQuoteQuantity(baseQuantity * curPrices[coinType] / curPrices[another]);
      }
      else {
        setQuoteAsset(coinType);
        setBaseAsset(another);
        setBaseQuantity(quoteQuantity * curPrices[coinType] / curPrices[another]);
      }
    }
  }

  const onInputBaseQuantity = (e) => {
    if(e.target.value < 0) return;
    setBaseQuantity(e.target.value);
    if(!limitOrder) setQuoteQuantity(e.target.value * curPrices[baseAsset] / curPrices[quoteAsset]);
  }

  const onInputQuoteQuantity = (e) => {
    if(e.target.value < 0) return;
    setQuoteQuantity(e.target.value);
    if(!limitOrder) setBaseQuantity(e.target.value * curPrices[quoteAsset] / curPrices[baseAsset]);
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
    if(baseQuantity==0 || quoteQuantity==0) {
      alert("baseQuantity or quoteQuantity is 0");
      return;
    }

    let btcQty, ethQty;
    btcQty = baseAsset === 'BTC' ? baseQuantity : quoteQuantity;
    ethQty = baseAsset === 'ETH' ? baseQuantity : quoteQuantity;
    if(btcQty < 1e-8 || ethQty < 1e-6) {
      alert('Input higher quantity');
      return;
    }
    
    setBaseQuantity();
    setQuoteQuantity();
    await thenOrderSwap(order, secret, secretHash);
  }

  const thenOrderSwap = async (order, secret, secretHash) => {
    const ask = order.side=='ask';
    const baseA = order.baseAsset ? order.baseAsset : baseAsset;
    const quoteA = order.quoteAsset ? order.quoteAsset : quoteAsset;
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
      await user.user.submitLimitOrder(
      {
        uid: user.user.id,
        side: order.side,
        hash: secretHash,
        baseAsset: args.base.asset,
        baseNetwork: args.base.network,
        baseQuantity: toSats(args.base.quantity),
        quoteAsset: args.quote.asset,
        quoteNetwork: args.quote.network,
        quoteQuantity: toWei(args.quote.quantity)
      }
    ).then(data => {
      const curDate = new Date();
      const date = {
        year: curDate.getFullYear(),
        month: curDate.getMonth(),
        day: curDate.getDate()
      };

      const ask = order.side=='ask',
          baseQ = {
            asset: data.baseAsset,
            network: order.baseNetwork,
            quantity: fromSats(data.baseQuantity)
          }, quoteQ = {
            asset: data.quoteAsset,
            network: order.quoteNetwork,
            quantity: fromWei(data.quoteQuantity)
          };

      if(order.side == 'ask') {
        dispatch(setNodeBalance(node.balance - fromSats(data.baseQuantity)));
      } else {
        dispatch(setWalletBalance(wallet.balance - fromWei(data.quoteQuantity)));
      }
          
      const args = ask ?  { // if order is an ask, bitcoin as base
        base: baseQ,
        quote: quoteQ
      } : {
        base: quoteQ,
        quote: baseQ
      }

      dispatch(addSwapItem({
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
      }));

      setBaseQuantity(0);
      setQuoteQuantity(0);
    });
    }
  }

  const onChangeCoinType = () => {
    const tBase = baseQuantity, tQuote = quoteQuantity;
    const aBase = baseAsset, aQuote = quoteAsset;
    setBaseAsset(aQuote);setQuoteAsset(aBase);
    setBaseQuantity(tQuote); setQuoteQuantity(tBase);
  }

  const mockSwap = (order) => {
    onOrderSwap(order);
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
            availQty={baseAsset === 'BTC' ? node.balance : wallet.balance}
            onAmountChange={onInputBaseQuantity}
            onCoinTypeChange={(e, data) => {coinTypeChanged(true, data.value);}}
            limitOrder={limitOrder}
            />
          <Divider />
          <Button className={styles.exchange} onClick={onChangeCoinType}><Icon name='exchange' /></Button>
          <SwapAmountItem
            className='mt-1 mb-0'
            coinType={quoteAsset}
            unitPrice={curPrices[quoteAsset]}
            amount={quoteQuantity}
            availQty={baseAsset === 'ETH' ? node.balance : wallet.balance}
            onAmountChange={onInputQuoteQuantity}
            onCoinTypeChange={(e, data) => {coinTypeChanged(false, data.value);}}
            limitOrder={limitOrder}
            />
        </Form>
      </Grid.Row>
      <Grid.Row>
        { (nodeConnected && walletConnected)
            ? ((baseQuantity || true)
              ? <>
                  <p className={styles.prices}>{ curPrices.fetching ? 'Loading' : `1 ${baseAsset} = ${Number(curPrices[baseAsset] / curPrices[quoteAsset]).toFixed(6)} ${quoteAsset}` }</p>
                  <Button circular secondary className='gradient-btn w-100 h-3' onClick={e => onOrderSwap({side: (
                    baseAsset == 'BTC' ? 'ask' : 'bid'),
                    baseNetwork: (baseAsset == 'BTC' ? 'lightning.btc' :'eth-l2.eth'),
                    quoteNetwork: (baseAsset == 'BTC' ? 'eth-l2.eth' : 'lightning.btc') })}>Swap</Button>
                  {mock && <DemoSwap mockSwap={mockSwap} /> }
                </>
              : <Button circular secondary className='gradient-btn w-100 h-3' disabled>Enter Amounts to Swap</Button> )
            : <Button circular secondary className='gradient-btn w-100 h-3' disabled>Connect Node & Wallet to Swap</Button>
        }
      </Grid.Row>
    </Grid>
  );
}
