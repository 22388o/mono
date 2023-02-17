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

export const SwapCreate = () => {
  const mock = true;

	const dispatch = useAppDispatch();

  const [baseQuantity, setBaseQuantity] = useState();
  const [quoteQuantity, setQuoteQuantity] = useState();
  const [curPrices, setCurPrices] = useState({
    BTC: 0,
    ETH: 0,
    fetching: true
  });
  const [baseAsset, setBaseAsset] = useState('BTC');
  const [quoteAsset, setQuoteAsset] = useState('ETH');
  const [limitOrder, setLimitOrder] = useState(true);

  const hashSecret = async function hash(string) {    
    const utf8 = new TextEncoder().encode(string);
    const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((bytes) => bytes.toString(16).padStart(2, '0'))
      .join('');
      // log("hashSecret output utf8", utf8);
      // log("hashSecret output hashBuffer", hashBuffer);
      // log("hashSecret output hashArray", hashArray);
      // log("hashSecret output hashHex", hashHex);
    return hashHex;
  }
  const [orderSecret, setOrderSecret] = useState(null);

  const [swapState, setSwapState] = useState(0);
  const [createSwap, setCreateSwap] = useState(false);
  const activities = useAppSelector(state => state.activities.activities);
  const nodeConnected = useAppSelector(state => state.wallet.node.connected);
  const walletConnected = useAppSelector(state => state.wallet.wallet.connected);
  const user = useAppSelector(state => state.user);


  const log = (message, obj, debug = true) => {
    if (debug) {
      console.log(message + " (SwapCreate)")
     console.log(obj)
    }
  }

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
    setOrderSecret(null)

  }, []);

  useEffect(() => {
    log("useEffect {user, orderSecret}", { user, orderSecret })
    if(user.isLoggedIn) {
      try {
        log("user", user);
        const connected = user.user.connect()
      } catch (error) {
        console.warn(`sorry an error occurred, due to ${error.message} `);
        // logOut();
      }
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
          user.user.swapOpen(swap, { [network]: credentials[network], secret: orderSecret.toString('hex') });
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
      })
      
    } 
    // else if(swapState === 4) {
    //   console.log("swapState ", swapState)
    // } else if(swapState === 5) {
    //   console.log("swapState ", swapState)}
    
  }, [swapState]);

  const coinTypeChanged = (isBase, coinType) => {
    if(isBase) setQuoteQuantity(baseQuantity * curPrices[coinType] / curPrices[quoteAsset]);
    else  setBaseQuantity(quoteQuantity * curPrices[coinType] / curPrices[baseAsset]);
  }

  const onInputBaseQuantity = (e) => {
    setBaseQuantity(e.target.value);
    if(!limitOrder) setQuoteQuantity(e.target.value * curPrices[baseAsset] / curPrices[quoteAsset]);
  }

  const onInputQuoteQuantity = (e) => {
    setQuoteQuantity(e.target.value);
    if(!limitOrder) setBaseQuantity(e.target.value * curPrices[quoteAsset] / curPrices[baseAsset]);
  }

  const onCreateSwap = async (order) => {
    const secret = crypto.getRandomValues(new Uint8Array(32))
    // const secret = Math.random().toString(36).slice(2);

    // log("{secret, secretHash, secret256}",{secret, secretHash: await hashSecret(secret)});
    const secretHash = await hashSecret(secret);

    setOrderSecret(secretHash);
    setSwapState(0); // swap begins
    await thenCreateSwap(order, secret, secretHash);
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

    const toWei = (num) => { return num * 1000000000000000000 }
    const toSat = (num) => { return num * 100000000 }
      
    try {

      // setOrderSecret(secretHash);
    } catch (error) {log("error on setOrderSecret(secretHash)", error.message)}
    finally {
      await user.user.submitLimitOrder(
      {
        uid: user.user.id,
        side: order.side,
        hash: secretHash,
        baseAsset: args.base.asset,
        baseNetwork: args.base.network,
        baseQuantity: args.base.quantity,
        quoteAsset: args.quote.asset,
        quoteNetwork: args.quote.network,
        quoteQuantity: args.quote.quantity
      }
    ).then(data => {
      setSwapState(1); // swap request sent
      // log("this is data inside submitLimitOrder", data);

      const curDate = new Date();
      const date = {
        year: curDate.getFullYear(),
        month: curDate.getMonth(),
        day: curDate.getDate()
      };
      
      
      const ask = order.side=='ask';
      const args = ask ?  { // if order is an ask, bitcoin as base
        base: {
          asset: data.baseAsset, 
          network: order.baseNetwork,
          quantity: data.baseQuantity
        },
        quote: {
          asset: data.quoteAsset, 
          network: order.quoteNetwork,
          quantity: data.quoteQuantity
        }
      } : {
        base: {
          asset: data.quoteAsset, 
          network: order.quoteNetwork,
          quantity: data.quoteQuantity
        },
        quote: {
          asset: data.baseAsset, 
          network: order.baseNetwork,
          quantity: data.baseQuantity
        }
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
        status: 1,
        createdDate: date
      }));
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
                  <Button circular secondary className='gradient-btn w-100 h-3' onClick={e => onCreateSwap({side: (baseAsset == 'BTC' ? 'ask' : 'bid'), baseNetwork: 'lightning.btc', quoteNetwork: 'goerli'})}>Swap</Button>
                  {mock && <>
                    <p>demo swap</p>
                    <Button circular secondary className='gradient-btn w-100 h-3' onClick={e => mockSwap({
                      side: 'ask', 
                      baseAsset: 'BTC',
                      baseNetwork: 'lightning.btc', 
                      baseQuantity: 200000, 
                      quoteAsset: 'ETH',
                      quoteNetwork: 'goerli', 
                      quoteQuantity: 100000})}>Swap 200000BTC for 100000ETH</Button>
                    <Button circular secondary className='gradient-btn w-100 h-3' onClick={e => mockSwap({
                      side: 'bid', 
                      baseAsset: 'ETH',
                      baseNetwork: 'goerli', 
                      baseQuantity: 100000, 
                      quoteAsset: 'BTC',
                      quoteNetwork: 'lightning.btc', 
                      quoteQuantity: 200000})}>Swap 100000ETH for 200000 BTC</Button>
                  </>}
                </>
              : <Button circular secondary className='gradient-btn w-100 h-3' disabled>Enter Amounts to Swap</Button> )
            : <Button circular secondary className='gradient-btn w-100 h-3' disabled>Connect Node & Wallet to Swap</Button>
        }
      </Grid.Row>
    </Grid>
  );
}
