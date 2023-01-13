import React, { useState } from "react";
import 'semantic-ui-css/semantic.min.css';
import { 
  Button, 
  Card, 
  Form, 
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
  setRequest2 
} from "../slices/swapSlice";
import { 
  useAppDispatch, 
  useAppSelector 
} from "../hooks";
import { fetchSwapCreate } from "../utils/apis";
import { useNavigate } from "react-router-dom";
import { addSwapItem } from "../slices/historySlice";

export const SwapManage = () => {
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
      dispatch(addSwapItem({
        amountBase: baseQuantity,
        amountQuote: quoteQuantity,
        swapId: data.swap.id,
        swapHash: data.swap.secretHash,
        secretSeekerId: data.swap.secretSeeker.id,
        secretHolderId: data.swap.secretHolder.id,
        secret: data.swapSecret
      }));
      navigate('/swap');
    })
    .catch(err => console.log(err))
    
  }

  const onViewHistory = () => {
    navigate('/history');
  };

  return (
    <Card centered>
      <Card.Content>
        <Card.Header>
          Swap
        </Card.Header><br />
        <Form>
        <Form.Group  widths='equal'>
          <Form.Field>
            <input type='number' value={baseQuantity} onChange={(evt) => setBaseQuantity(evt.target.value)}/>
          </Form.Field>
          <Form.Field>
            <div class="ui inline dropdown">
              <div class="text">
                {/* <img class="ui avatar image" src="/images/avatar/small/jenny.jpg" /> */}
                ABC
              </div>
              <i class="dropdown icon"></i>
              <div class="menu">
                <div class="item">
                  <img class="ui avatar image" src="/images/avatar/small/jenny.jpg" />
                  ABC
                </div>
                <div class="item">
                  <img class="ui avatar image" src="/images/avatar/small/elliot.jpg" />
                  DEF
                </div>
              </div>
            </div>
          </Form.Field>
        </Form.Group>

        <Form.Group widths='equal'>
          <Form.Field>
            <i class="arrow down"></i>
          </Form.Field>
        </Form.Group>
        <Form.Group  widths='equal'>
          <Form.Field>
            <input type='number' value={quoteQuantity} onChange={(evt) => setQuoteQuantity(evt.target.value)}/>
          </Form.Field>
          <Form.Field>
            <div class="ui inline dropdown">
              <div class="text">
                {/* <img class="ui avatar image" src="/images/avatar/small/jenny.jpg" /> */}
                DEF
              </div>
              <i class="dropdown icon"></i>
              <div class="menu">
                <div class="item">
                  <img class="ui avatar image" src="/images/avatar/small/jenny.jpg" />
                  ABC
                </div>
                <div class="item">
                  <img class="ui avatar image" src="/images/avatar/small/elliot.jpg" />
                  DEF
                </div>
              </div>
            </div>
          </Form.Field>
        </Form.Group>
        <p><Button primary onClick={onCreateSwap}>Create Swap</Button></p>
        { (history.length>0) && <p><Button primary onClick={onViewHistory}>Swap History</Button></p> }
        </Form>
      </Card.Content>
    </Card>
  );
}
