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
} from "../hooks";
import { createLimitOrder, getBTCPrice, getETHPrice } from "../utils/apis";
import { useNavigate } from "react-router-dom";
import { addSwapItem } from "../slices/activitiesSlice";
import styles from './styles/SwapCreate.module.css';
import { SwapAmountItem } from "./items/SwapAmountItem";

export const SwapCreate = () => {
	const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.user);
  
  const [baseQuantity, setBaseQuantity] = useState(0);
  const [quoteQuantity, setQuoteQuantity] = useState(0);
  const [curPrices, setCurPrices] = useState({
    btc: 0,
    eth: 0,
    fetching: true
  });
  const [baseCoin, setBaseCoin] = useState('btc');
  const [quoteCoin, setQuoteCoin] = useState('eth');
  const [limitOrder, setLimitOrder] = useState(true);

  const activities = useAppSelector(state => state.activities.activities);
  const nodeConnected = useAppSelector(state => state.wallet.node.connected);
  const walletConnected = useAppSelector(state => state.wallet.wallet.connected);

  useEffect(() => {
    const core = async () => {
      const btc = await getBTCPrice();
      const eth = await getETHPrice();
      setCurPrices({
        btc: btc,
        eth: eth,
        fetching: false
      });
    };
    core();
  }, []);

  const coinTypeChanged = (isBase, coinType) => {
    if(isBase) setQuoteQuantity(baseQuantity * curPrices[coinType] / curPrices[quoteCoin]);
    else  setBaseQuantity(quoteQuantity * curPrices[coinType] / curPrices[baseCoin]);
  }

  const onInputBaseQuantity = (e) => {
    setBaseQuantity(e.target.value);
    setQuoteQuantity(e.target.value * curPrices[baseCoin] / curPrices[quoteCoin]);
  }

  const onInputQuoteQuantity = (e) => {
    setQuoteQuantity(e.target.value);
    setBaseQuantity(e.target.value * curPrices[quoteCoin] / curPrices[baseCoin]);
  }

  const onCreateSwap = async (participant) => {
    /** createLimitOrder({
     *    baseAsset, 
     *    baseNetwork, 
     *    baseQuantity, 
     *    quoteAsset, 
     *    quoteNetwork, 
     *    quoteQuantity, 
     *    hash = 'ignored'}) */
    createLimitOrder({baseAsset: 'BTC', 
                      baseNetwork: 'lightning.btc', 
                      baseQuantity, 
                      quoteAsset: 'ETH', 
                      quoteNetwork: 'goerli', 
                      quoteQuantity, 
                      hash: 'ignored',
                      uid: participant.state.name})
    .then(res => {
      console.log(res);
      return res.json();
    })
    .then(data => {
      const curDate = new Date();
      const date = {
        year: curDate.getFullYear(),
        month: curDate.getMonth(),
        day: curDate.getDate()
      };
      console.log(data.swap.id);
      console.log(`${JSON.stringify(data)}`);
      setTimeout(() => {
      dispatch(setIndex(activities.length));
      dispatch(setBase(baseQuantity));
      dispatch(setQuote(quoteQuantity));
      dispatch(setSwapId(data.swap.id));
      dispatch(setRequest1(null));
      dispatch(setRequest2(null));
      dispatch(setSecretSeekerId(data.swap.secretSeeker.id));
      dispatch(setSecretHolderId(data.swap.secretHolder.id));
      dispatch(setSecret(data.swapSecret));
      dispatch(setSwapHash(data.swap.secretHash));
      dispatch(setSwapStatus(1));
      dispatch(setCreatedDate(curDate));
      dispatch(addSwapItem({
        amountBase: baseQuantity,
        amountQuote: quoteQuantity,
        swapId: data.swap.id,
        swapHash: data.swap.secretHash,
        secretSeekerId: data.swap.secretSeeker.id,
        secretHolderId: data.swap.secretHolder.id,
        secret: data.swapSecret,
        createdDate: date,
        request1: null,
        request2: null,
        status: 0
      }));
      // navigate('/swap');
        console.log("completed createLimitOrder")
        }, 1000
      )
    })
    .catch(err => console.log(err))
    
  }
  
  const onChangeCoinType = () => {
    const tBase = baseQuantity, tQuote = quoteQuantity;
    setBaseCoin(quoteCoin);setQuoteCoin(baseCoin);
    setBaseQuantity(tQuote); setQuoteQuantity(tBase);
  }

  return (
    <Grid centered className={styles.SwapCreateContainer}>
      <Grid.Row className={styles.SwapHeader}>
        <h3>Swap</h3>
        <Button circular secondary icon='setting' className={styles.borderless} onClick={() => {setLimitOrder(!limitOrder)}} />
      </Grid.Row>
      <Grid.Row className={styles.swapExCont}>
        <Form>
          <SwapAmountItem 
            className='mb-1'
            coinType={baseCoin}
            unitPrice={curPrices[baseCoin]}
            amount={baseQuantity} 
            onAmountChange={onInputBaseQuantity}
            onCoinTypeChange={(e, data) => {setBaseCoin(data.value);coinTypeChanged(true, data.value);}}
            limitOrder={limitOrder}
            />
          <Divider />
          <Button className={styles.exchange} onClick={onChangeCoinType}><Icon name='exchange' /></Button>
          <SwapAmountItem 
            className='mt-1 mb-0'
            coinType={quoteCoin}
            unitPrice={curPrices[quoteCoin]}
            amount={quoteQuantity} 
            onAmountChange={onInputQuoteQuantity}
            onCoinTypeChange={(e, data) => {setQuoteCoin(data.value);coinTypeChanged(false, data.value);}}
            limitOrder={limitOrder}
            />
        </Form>
      </Grid.Row>
      <Grid.Row>
        { ((nodeConnected && walletConnected) || true)
            ? <>
                <p className={styles.prices}>{ curPrices.fetching ? 'Loading' : `1 btc = ${Number(curPrices.btc / curPrices.eth).toFixed(6)} eth` }</p>
                <Button circular secondary className='gradient-btn w-100 h-3' onClick={e => onCreateSwap(user.user, 'BTC', 'lightning.btc', 'ETH', 'goerli', "SECRET_HASH")}>SwapB2E</Button> 
                <Button circular secondary className='gradient-btn w-100 h-3' onClick={e => onCreateSwap(user.user, 'ETH', 'goerli', 'BTC', 'lightning.btc')}>SwapE2B</Button> 
                <Button circular secondary className='gradient-btn w-100 h-3' onClick={e => onCreateSwap(user.user)}>Swap</Button> 
              </>
            : <Button circular secondary className='gradient-btn w-100 h-3' disabled>Connect Node & Wallet to Swap</Button> 
        }
      </Grid.Row>
    </Grid>
  );
}
