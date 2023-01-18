import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  index: 0,
  amountBase: null,
	amountQuote: null,
	swapState: null,
	swapId: null,
	swapHash: null,
	secretSeekerId: null,
	secretHolderId: null,
	secret: null,
	request1: null,
	request2: null,
  commit1: false,
  commit2: false,
  createdDate: null
};

export const swapSlice = createSlice({
  name: 'swap',
  initialState,
  reducers: {
    setIndex: (state, action) => {state.index = action.payload},
    setBase: (state, action) => { state.amountBase = action.payload; },
    setQuote: (state, action) => { state.amountQuote = action.payload; },
    setSwapStatus: (state, action) => { state.swapState = action.payload; },
    setSwapId: (state, action) => { state.swapId = action.payload; },
    setSwapHash: (state, action) => { state.swapHash = action.payload; },
    setSecretSeekerId: (state, action) => { state.secretSeekerId = action.payload; },
    setSecretHolderId: (state, action) => { state.secretHolderId = action.payload; },
    setSecret: (state, action) => { state.secret = action.payload; },
    setRequest1: (state, action) => { state.request1 = action.payload; },
    setRequest2: (state, action) => { state.request2 = action.payload; },
    setCommit1: (state, action) => { state.commit1 = action.payload; },
    setCommit2: (state, action) => { state.commit2 = action.payload; },
    setCreatedDate: (state, action) => { state.createdDate = action.payload; },
    clearSwapInfo: (state, action) => {
      state.index = 0;
      state.amountBase = null;
      state.amountQuote = null;
      state.swapState = null;
      state.swapId = null;
      state.swapHash = null;
      state.secretSeekerId = null;
      state.secretHolderId = null;
      state.secret = null;
      state.request1 = null;
      state.request2 = null;
      state.commit1 = false;
      state.commit2 = false;
      state.createdDate = null;
    }
  }
});

export const { 
  setIndex, 
  clearSwapInfo, 
  setBase, 
  setQuote, 
  setSwapStatus, 
  setSwapId, 
  setSwapHash, 
  setSecretSeekerId, 
  setSecretHolderId, 
  setSecret, 
  setRequest1, 
  setRequest2, 
  setCommit1, 
  setCommit2,
  setCreatedDate
} = swapSlice.actions;

export default swapSlice.reducer;
