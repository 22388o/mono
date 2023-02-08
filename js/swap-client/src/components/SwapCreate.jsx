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
  
  const [baseQuantity, setBaseQuantity] = useState(0);
  const [quoteQuantity, setQuoteQuantity] = useState(0);
  const [curPrices, setCurPrices] = useState({
    btc: 0,
    eth: 0,
    fetching: true
  });
  const [baseCoin, setBaseCoin] = useState('btc');
  const [quoteCoin, setQuoteCoin] = useState('eth');

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

  const onInputBaseQuantity = (e) => {
    setBaseQuantity(e.target.value);
    setQuoteQuantity(e.target.value * curPrices[baseCoin] / curPrices[quoteCoin]);
  }

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
  
  const onChangeCoinType = () => {
    const tBase = baseQuantity, tQuote = quoteQuantity;
    if(baseCoin === 'btc') {
      setBaseCoin('eth'); setQuoteCoin('btc'); 
    } else {
      setBaseCoin('btc'); setQuoteCoin('eth');
    }
    setBaseQuantity(tQuote); setQuoteQuantity(tBase);
  }

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
            coinType={baseCoin} 
            amount={baseQuantity} 
            onChange={onInputBaseQuantity}
            />
          <Divider />
          <Button className={styles.exchange} onClick={onChangeCoinType}><Icon name='exchange' /></Button>
          <SwapAmountItem 
            className='mt-1 mb-0'
            coinType={quoteCoin}
            amount={quoteQuantity} 
            />
        </Form>
      </Grid.Row>
      <Grid.Row>
        { (nodeConnected && walletConnected) 
            ? (baseQuantity 
              ? <>
                  <p className={styles.prices}>{ curPrices.fetching ? 'Loading' : `1 ${baseCoin} = ${Number(curPrices[baseCoin] / curPrices[quoteCoin]).toFixed(6)} ${quoteCoin}` }</p>
                  <Button circular secondary className='gradient-btn w-100 h-3' onClick={e => onCreateSwap()}>Swap</Button> 
                </>
              : <Button circular secondary className='gradient-btn w-100 h-3' onClick={e => onCreateSwap()} disabled>Enter Amounts to Swap</Button> )
            : <Button circular secondary className='gradient-btn w-100 h-3' onClick={e => onCreateSwap()} disabled>Connect Node & Wallet to Swap</Button> 
        }
      </Grid.Row>
    </Grid>
  );
}
