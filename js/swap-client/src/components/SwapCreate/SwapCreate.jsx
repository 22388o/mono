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
  const [secretHash, setSecretHash] = useState(Math.random().toString(36).slice(2));

  const activities = useAppSelector(state => state.activities.activities);
  const nodeConnected = useAppSelector(state => state.wallet.node.connected);
  const walletConnected = useAppSelector(state => state.wallet.wallet.connected);
  const user = useAppSelector(state => state.user);


  let swapOrder;
  const log = (message, obj, debug = true) => {
    if (debug) {
     console.log(message)
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

    // if(user.user) {
    //   log("user",user);
    //   // user.user
    //   // .once('swap.created', swap => { swapOrder.userSwapCreated = swap })
    //   // .once('swap.opened', swap => { swapOrder.userSwapOpened = swap })
    //   // .once('swap.committed', swap => { swapOrder.userSwapCommitted = swap })
    //   user.user.websocket.onmessage(data => {log("data",data)})
    // }
  }, []);


  useEffect(() => {
    // console.log(`SwapCreate: activities.length: ${activities.length}`);
    if(swapOrder != undefined){
      console.log("swapOrder changed");
      console.log({swapOrder})
    }

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
    // console.log("SwapCreate: onCreateSwap", order);
    // log("SwapCreate: onCreateSwap ", user)
    // fetchSwapCreate({baseQuantity, quoteQuantity})
    // .then(res => {
    //   console.log(res);
    //   return res.json();
    // })
    // .then(data => {
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
      }
    ).then(data => {
      
        const curDate = new Date();
        const date = {
          year: curDate.getFullYear(),
          month: curDate.getMonth(),
          day: curDate.getDate()
        };
        // let data = Object.assign(order, {
        //   swapHash: order.secretHash,
        //   secret: order.swapSecret,
        //   createdDate: curDate})
        // log('SwapCreate: submitLimitOrder.then(data ', data);
        // console.log(data.swap.id);
        // console.log(`${JSON.stringify(data)}`);
        // setTimeout(() => {
        // dispatch(setIndex(activities.length));
        // dispatch(setBaseQuantity({baseQuantity}));
        // dispatch(setQuoteQuantity(quoteQuantity));
        // dispatch(setSwapId(data.swap.id));
        // dispatch(setRequest1(null));
        // dispatch(setRequest2(null));
        // dispatch(setSecretSeekerId(data.swap.secretSeeker.id));
        // dispatch(setSecretHolderId(data.swap.secretHolder.id));
        // dispatch(setSecret(data.swapSecret));
        // dispatch(setSecretHash(data.swap.secretHash));
        // dispatch(setSwapStatus(1));
        // dispatch(setCreatedDate(curDate));
        dispatch(addSwapItem({
          key: data.id,
          swapId: data.id,
          ts: data.ts,
          uid: data.uid,
          type: data.type,
          side: data.side,
          hash: data.hash,
          baseAsset: data.side == 'bid' ? data.baseAsset : data.quoteAsset,
          baseQuantity: data.baseQuantity,
          baseNetwork: order.baseNetwork,
          quoteAsset: data.side != 'bid' ? data.baseAsset : data.quoteAsset,
          quoteNetwork: order.quoteNetwork,
          quoteQuantity: data.quoteQuantity,
          status: 1,
          // secretSeekerId: data.swap.secretSeeker.id,
          // secretHolderId: data.swap.secretHolder.id,
          createdDate: date
        }));
          // console.log("completed submitLimitOrder")
          // }, 1000)
        // })
        // .catch(err => console.log(err))
        // console.log(`SwapCreate: submitLimitOrder completed`)
        // console.log({swapOrder})
    })
    
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
                  <Button circular secondary className='gradient-btn w-100 h-3' onClick={e => onCreateSwap({side: (baseAsset == 'BTC' ? 'bid' : 'ask'), baseNetwork: 'lightning.btc', quoteNetwork: 'goerli'})}>Swap</Button> 
                  {mock && <>
                    <p>demo swap</p>
                    <Button circular secondary className='gradient-btn w-100 h-3' onClick={e => mockSwap({side: 'bid', baseNetwork: 'lightning.btc', baseQuantity: 1, quoteNetwork: 'goerli', quoteQuantity: 1})}>Swap 1BTC for 1ETH</Button> 
                    <Button circular secondary className='gradient-btn w-100 h-3' onClick={e => mockSwap({side: 'ask', baseNetwork: 'lightning.btc', baseQuantity: 1, quoteNetwork: 'goerli', quoteQuantity: 1})}>Swap 1ETH for 1 BTC</Button> 
                  </>}
                </>
              : <Button circular secondary className='gradient-btn w-100 h-3' disabled>Enter Amounts to Swap</Button> )
            : <Button circular secondary className='gradient-btn w-100 h-3' disabled>Connect Node & Wallet to Swap</Button> 
        }
      </Grid.Row>
    </Grid>
  );
}
