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
import { fetchSwapCreate, getBTCPrice, getETHPrice } from "../../utils/apis";
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

  const [swapOrders, setSwapOrders] = useState([]);
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

  }, []);

  const abortController = new AbortController();

  useEffect(() => {

    if(user.isLoggedIn) {
      try {
        log("user", user);
        const connected = user.user.connect().then(
          user.user.on("swap.created",swap => {
            dispatch(updateSwapStatus({ status: 2 }));
            // log('swap.created event received', swap)
            if(user.user.id == swap.secretSeeker.id){ // TODO also add check if swapOpen already called on swap id
              const network = swap.secretHolder.network['@type'].toLowerCase();
              const credentials = user.user.credentials;
              user.user.swapOpen(swap, { [network]: credentials[network]});
            }
          })
          .on("swap.opening",swap => {
            dispatch(updateSwapStatus({ status: 3 }));
            log('swap.opening event received', swap)
            // log("orderSecret in swap.opening",orderSecret)
            if(user.user.id == swap.secretHolder.id) { // TODO also add check if swapOpen already called on swap id
              const network = swap.secretSeeker.network['@type'].toLowerCase();
              const credentials = user.user.credentials;
              user.user.swapOpen(swap, { [network]: credentials[network], secret: orderSecret });
            }
          })
          .on("swap.opened",swap => {
            dispatch(updateSwapStatus({ status: 4 }));
            log('swap.opened event received', swap)
            // log("orderSecret in swap.opened",orderSecret)
            if(user.user.id == swap.secretSeeker.id){
              const network = swap.secretHolder.network['@type'].toLowerCase();
              const credentials = user.user.credentials;
              user.user.swapCommit(swap, credentials);
            }
          })
          .on("swap.committing",swap => {
            dispatch(updateSwapStatus({ status: 5 }));
            log('swap.committing event received', swap)
            log("orderSecret in swap.committing",orderSecret)
            if(user.user.id == swap.secretHolder.id){
              const network = swap.secretSeeker.network['@type'].toLowerCase();
              const credentials = user.user.credentials;
              user.user.swapCommit(swap, credentials);
            }
            // user.user.swapCommit(swap,
            //   user.user.id == swap.secretHolder.id  ? swap.secretHolder.network.name : swap.secretSeeker.network.name,
            //   user.user.id == swap.secretHolder.id ? swap.secretHash : ''
            // )
          })
          .on("swap.committed",swap => {
            log('swap.committed event received', swap)
          })
        )
      } catch (error) {
        console.warn(`sorry an error occurred, due to ${error.message} `);
        logOut();
      }
    }
    // else {
    //   return function cleanup() {
    //     user.user.disconnect();
    //   }
    // }
    return () => {
      abortController.abort();
    };

  }, [user]);


  useEffect(() => {
    // console.log(`SwapCreate: activities.length: ${activities.length}`);
    // if(swapOrders != undefined){
    //   console.log("swapOrders changed");
    //   console.log({swapOrders})
    // }


    // if(swapOrders.length > 0) {
    //   log("swapOrder",{swapOrders})
    //   // swapOrders[swapOrders.length].then( data => {
    //   //     log("data",data);
    //   //     if(data.event.type == "swap.created"){
    //   //       console.log("swap.created!!!");
    //   //     }
    //   //   }
    //   // )
    // }
    log("activities", activities)
    setSwapOrders(activities);

  }, [activities])


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
    const secret = Math.random().toString(36).slice(2);

    // log("{secret, secretHash, secret256}",{secret, secretHash: await hashSecret(secret)});
    const secretHash = await hashSecret(secret);
    setOrderSecret(secretHash)
      
    await user.user.submitLimitOrder(
    {
      uid: user.user.id,
      side: order.side,
      hash: secretHash,
      baseAsset: baseAsset=='BTC' ? baseAsset : quoteAsset,
      baseNetwork: order.baseNetwork,
      baseQuantity: order.baseQuantity ? order.baseQuantity : baseQuantity,
      quoteAsset: baseAsset=='BTC'? quoteAsset : baseAsset,
      quoteNetwork: order.quoteNetwork,
      quoteQuantity: order.quoteQuantity ? order.quoteQuantity : quoteQuantity,
      signal: abortController.signal
    }
  ).then(data => {

    // log("this is data inside submitLimitOrder", data);

    const curDate = new Date();
    const date = {
      year: curDate.getFullYear(),
      month: curDate.getMonth(),
      day: curDate.getDate()
    };
    
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
      baseAsset: data.side == 'bid' ? data.baseAsset : data.quoteAsset,
      baseQuantity: data.baseQuantity,
      baseNetwork: order.baseNetwork,
      quoteAsset: data.side != 'bid' ? data.baseAsset : data.quoteAsset,
      quoteNetwork: order.quoteNetwork,
      quoteQuantity: data.quoteQuantity,
      status: 1,
      createdDate: date
    }));
      // console.log("completed submitLimitOrder")
      // }, 1000)
    // })
    // .catch(err => console.log(err))
    // console.log(`SwapCreate: submitLimitOrder completed`)
    // console.log({swapOrder})
  });
  // .on("swap.created", data => {
  //   log("swap.created!!!!", data);
  // })
    
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
                    <Button circular secondary className='gradient-btn w-100 h-3' onClick={e => mockSwap({side: 'ask', baseNetwork: 'lightning.btc', baseQuantity: 200000, quoteNetwork: 'goerli', quoteQuantity: 10000000000})}>Swap 200000BTC for 10000000000ETH</Button>
                    <Button circular secondary className='gradient-btn w-100 h-3' onClick={e => mockSwap({side: 'bid', baseNetwork: 'lightning.btc', baseQuantity: 200000, quoteNetwork: 'goerli', quoteQuantity: 10000000000})}>Swap 10000000000ETH for 200000 BTC</Button>
                  </>}
                </>
              : <Button circular secondary className='gradient-btn w-100 h-3' disabled>Enter Amounts to Swap</Button> )
            : <Button circular secondary className='gradient-btn w-100 h-3' disabled>Connect Node & Wallet to Swap</Button>
        }
      </Grid.Row>
    </Grid>
  );
}
