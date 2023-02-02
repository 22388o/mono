import React, { useEffect, useState } from "react";
import 'semantic-ui-css/semantic.min.css';
import { 
  Button, 
  Card, 
  Divider,
  Form, 
  Grid,
  Icon,
  Modal, 
  Select 
} from 'semantic-ui-react';
import { 
  setIndex, 
  setSwapId, 
  setSwapHash, 
  setSecretSeekerId, 
  setSecretHolderId, 
  setSecret, 
  setBase, 
  setQuote, 
  setSwapStatus, 
  setRequest1, 
  setRequest2, 
  setCreatedDate
} from "../slices/swapSlice";
import { 
  useAppDispatch, 
  useAppSelector 
} from "../hooks";
import { fetchSwapCreate, getBTCPrice, getETHPrice } from "../utils/apis";
import { useNavigate } from "react-router-dom";
import { addSwapItem } from "../slices/historySlice";
import styles from './styles/SwapCreate.module.css';
import { SwapAmountItem } from "./items/SwapAmountItem";

export const SwapCreate = () => {
  const navigate = useNavigate();
	const dispatch = useAppDispatch();
  
  const [baseQuantity, setBaseQuantity] = useState(10000)
  const [quoteQuantity, setQuoteQuantity] = useState(30000)
  const [pendingSwapOptions, setPendingSwapOptions] = useState([]);
  const [curPrices, setCurPrices] = useState({
    btc: 0,
    eth: 0,
    fetching: true
  });

  const latestSwap = useAppSelector(state => state.history.history[state.history.history.length - 1]);
  const history = useAppSelector(state => state.history.history);
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

  const onCreateSwap = async () => {
    fetchSwapCreate({baseQuantity, quoteQuantity})
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
      dispatch(setIndex(history.length));
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
        createdDate: curDate
      }));
      // navigate('/swap');
        console.log("completed fetchSwapCreate")
        }, 1000
      )
    })
    .catch(err => console.log(err))
    
  }

  const onViewHistory = () => {
    navigate('/history');
  };

  return (
    <Grid centered className={styles.SwapCreateContainer}>
      <Grid.Row className={styles.SwapHeader}>
        <h3>Swap</h3>
        <Button circular secondary icon='setting' className={styles.borderless} />
      </Grid.Row>
      <Grid.Row className={styles.swapExCont}>
        <Form>
          <SwapAmountItem 
            className='mb-1'
            coinType='BTC' 
            amount={baseQuantity} 
            amountToUSD='1209.12 usd'
            balance='Balance: 1.0023'
            />
          <Divider />
          <Button className={styles.exchange}><Icon name='exchange' /></Button>
          <SwapAmountItem 
            className='mt-1 mb-0'
            coinType='ETH' 
            amount={quoteQuantity} 
            amountToUSD=''
            balance='Balance: 0'
            />
        </Form>
      </Grid.Row>
      <Grid.Row>
        { (nodeConnected && walletConnected) 
            ? <>
                <p className={styles.prices}>{ curPrices.fetching ? 'Loading' : `1 btc = ${Number(curPrices.btc / curPrices.eth).toFixed(6)} eth` }</p>
                <Button circular secondary className='gradient-btn w-100 h-3' onClick={e => onCreateSwap()}>Swap</Button> 
              </>
            : <Button circular secondary className='gradient-btn w-100 h-3' onClick={e => onCreateSwap()} disabled>Connect Node & Wallet to Swap</Button> 
        }
      </Grid.Row>
    </Grid>
  );
}
