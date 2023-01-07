import { useState } from "react";
import 'semantic-ui-css/semantic.min.css';
import { Button, Card, Form } from 'semantic-ui-react';
import { setSwapId, setSwapHash, setSecretSeekerId, setSecretHolderId, setSecret, setBase, setQuote } from "../slices/swapSlice";
import { useAppDispatch } from "../hooks";
import { fetchSwapCreate } from "../utils/apis";
import { useNavigate } from "react-router-dom";
import { addSwapItem } from "../slices/historySlice";

export const SwapCreate = () => {
  const navigate = useNavigate();
	const dispatch = useAppDispatch();
  const [baseQuantity, setBaseQuantity] = useState(10000)
  const [quoteQuantity, setQuoteQuantity] = useState(30000)
  const [pressed, setPressed] = useState(false);

  const onCreateSwap = async () => {
    fetchSwapCreate({baseQuantity, quoteQuantity})
    .then(res => {
      console.log(res);
      return res.json();
    })
    .then(data => {
      console.log(data.swap.id)
      console.log(`${JSON.stringify(data)}`)
      dispatch(setBase(baseQuantity));
      dispatch(setQuote(quoteQuantity));
      dispatch(setSwapId(data.swap.id));
      dispatch(setSecretSeekerId(data.swap.secretSeeker.id));
      dispatch(setSecretHolderId(data.swap.secretHolder.id));
      dispatch(setSecret(data.swapSecret));
      dispatch(setSwapHash(data.swap.secretHash));
      dispatch(addSwapItem({
        amountBase: baseQuantity,
        amountQuote: quoteQuantity,
        swapId: data.swap.id,
        swapHash: data.swap.secretHash,
        secretSeekerId: data.swap.secretSeeker.id,
        secretHolderId: data.swap.secretHolder.id,
        secret: data.swapSecret
      }));
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
          Initate New Swap
        </Card.Header><br />
        <Form>
        <Form.Group  widths='equal'>
          <Form.Field>
            <label>Base Quantity: 
            <input type='number' value={baseQuantity} onChange={(evt) => setBaseQuantity(evt.target.value)}/></label>
          </Form.Field>
          <Form.Field>
            <label>Quote Quantity: 
            <input type='number' value={quoteQuantity} onChange={(evt) => setQuoteQuantity(evt.target.value)}/></label>
          </Form.Field>
        </Form.Group>
        <p><Button primary onClick={onCreateSwap}>Create Swap</Button></p>
        <p><Button primary onClick={onViewHistory}>Swap History</Button></p>
        </Form>
      </Card.Content>
    </Card>
  );
}
