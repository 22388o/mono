import React, { useState } from "react";
import 'semantic-ui-css/semantic.min.css';
import { Button, Card, Form, Modal, Select } from 'semantic-ui-react';
import { setIndex, setSwapId, setSwapHash, setSecretSeekerId, setSecretHolderId, setSecret, setBase, setQuote, setSwapStatus, setRequest1, setRequest2 } from "../slices/swapSlice";
import { useAppDispatch, useAppSelector } from "../hooks";
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

  const [modalOpen, setModalOpen] = React.useState(false)

  const onContinueSwap = () => {
    const options = [];
    for(let i = 0; i < history.length; i ++) if(history[i].status !== 5) {
      options.push({
        key: i, value: i, text: i + 1
      });
    }
    dispatch(setSwapStatus(latestSwap.status));
    dispatch(setIndex(history.length - 1));
    dispatch(setBase(latestSwap.amountBase));
    dispatch(setQuote(latestSwap.amountQuote));
    dispatch(setSwapId(latestSwap.swapId));
    dispatch(setSecretSeekerId(latestSwap.secretSeekerId));
    dispatch(setSecretHolderId(latestSwap.secretHolderId));
    dispatch(setSecret(latestSwap.secret));
    dispatch(setSwapHash(latestSwap.swapHash));
    if(options.length === 1) {
      navigate('/swap');
      setIndex(options[0].key);
    } else {
      setModalOpen(true);
      setPendingSwapOptions(options);
    }
  };

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
        { (latestSwap?.status !== 5 && latestSwap?.status !== undefined) && <p><Button primary onClick={onContinueSwap}>Continue Swap</Button></p> }
        <p><Button primary onClick={onViewHistory}>Swap History</Button></p>
        </Form>
      </Card.Content>
      <Modal
        onClose={() => setModalOpen(false)}
        onOpen={() => setModalOpen(true)}
        open={modalOpen}
      >
        <Modal.Header>Select which swap to continue</Modal.Header>
        <Modal.Content>
          <Modal.Description>
            <Select placeholder='Select Swap Id to continue' options={pendingSwapOptions} />
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <Button color='black' onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button
            content="Continue"
            labelPosition='right'
            icon='checkmark'
            onClick={() => setModalOpen(false)}
            positive
          />
        </Modal.Actions>
      </Modal>
    </Card>
  );
}
