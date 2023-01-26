import React, { useState } from "react";
import 'semantic-ui-css/semantic.min.css';
import { 
  Button, 
  Card, 
  Divider,
  Form, 
  Grid,
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
import { fetchSwapCreate } from "../utils/apis";
import { useNavigate } from "react-router-dom";
import { addSwapItem } from "../slices/historySlice";
import styles from './styles/SwapCreate.module.css';

export const SwapCreate = () => {
  const navigate = useNavigate();
	const dispatch = useAppDispatch();
  const [baseQuantity, setBaseQuantity] = useState(10000)
  const [quoteQuantity, setQuoteQuantity] = useState(30000)
  const latestSwap = useAppSelector(state => state.history.history[state.history.history.length - 1]);
  const history = useAppSelector(state => state.history.history);
  const [pendingSwapOptions, setPendingSwapOptions] = useState([]);
  
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
      navigate('/swap');
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
      </Grid.Row>
      <Grid.Row>
        <Form>
        <Form.Group  widths='equal'>
          <Form.Field>
            <input type='number' value={baseQuantity} onChange={(evt) => setBaseQuantity(evt.target.value)}/>
          </Form.Field>
          <Form.Field>
            <div className="ui inline dropdown">
              <div className={styles.SwapFormText}>
                <img className="ui avatar image" src="https://github.com/dapphub/trustwallet-assets/blob/master/blockchains/bitcoin/info/logo.png?raw=true" />
                BTC
              </div>
              {/* <i className="dropdown icon"></i> */}
              <div className="menu">
                <div className="item">
                  <img className="ui avatar image" src="https://github.com/dapphub/trustwallet-assets/blob/master/blockchains/bitcoin/info/logo.png?raw=true" />
                  BTC
                </div>
                <div className="item">
                  <img className="ui avatar image" src="https://github.com/dapphub/trustwallet-assets/blob/master/blockchains/ethereum/info/logo.png?raw=true" />
                  ETH
                </div>
              </div>
            </div>
          </Form.Field>
        </Form.Group>

        <Form.Group widths='equal'>
          <Form.Field>
            <i className="arrow down"></i>
          </Form.Field>
        </Form.Group>
        <Form.Group  widths='equal'>
          <Form.Field>
            <input type='number' value={quoteQuantity} onChange={(evt) => setQuoteQuantity(evt.target.value)}/>
          </Form.Field>
          <Form.Field>
            <div className="ui inline dropdown">
              <div className={styles.SwapFormText}>
                <img className="ui avatar image" src="https://github.com/dapphub/trustwallet-assets/blob/master/blockchains/ethereum/info/logo.png?raw=true" />
                ETH
              </div>
              {/* <i className="dropdown icon"></i> */}
              <div className="menu">
                <div className="item">
                  <img className="ui avatar image" src="https://github.com/dapphub/trustwallet-assets/blob/master/blockchains/ethereum/info/logo.png?raw=true" />
                  ETH
                </div>
                <div className="item">
                  <img className="ui avatar image" src="https://github.com/dapphub/trustwallet-assets/blob/master/blockchains/bitcoin/info/logo.png?raw=true" />
                  BTC
                </div>
              </div>
            </div>
          </Form.Field>
        </Form.Group>
        <p><Button primary onClick={onCreateSwap}>Create Swap</Button></p>
        {/* { (history.length>0) && <p><Button primary onClick={onViewHistory}>Swap History</Button></p> } */}
        </Form>
      </Grid.Row>
    </Grid>
  );
}
