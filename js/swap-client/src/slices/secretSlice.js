import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  secret: []
};

export const secretSlice = createSlice({
  name: 'secret',
  initialState,
  reducers: {
    addSecret: (state, action) => {
      state.secret.push({
        ...action.payload
      });
    },
    // updateSwapStatus: (state, action) => {
    //   state.secret.filter(activity => activity.swapId === action.payload.index)[0].status = action.payload.status;
    // },
    // removeLatestSwap: (state, action) => {
    //   state.secret.pop();
    // },
    // cancelSwap: (state, action) => {
    //   state.secret.splice(action.payload, 1);
    // },
    // updateSwapInfo: (state, action) => {
    //   state.secret.filter(activity => activity.swapId === action.payload.index)[0][action.payload.field] = action.payload.info;
    // }
  }
});
  
export const { 
  addSecret
} = secretSlice.actions;
  
export default secretSlice.reducer;
