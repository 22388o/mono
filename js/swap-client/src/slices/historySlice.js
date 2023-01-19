import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  history: []
};

export const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    addSwapItem: (state, action) => {
      state.history.push({
        ...action.payload,
        status: 1
      });
    },
    updateSwapStatus: (state, action) => {
      state.history[action.payload.index] = {
        ...state.history[action.payload.index],
        status: action.payload.status
      };
    },
    removeLatestSwap: (state, action) => {
      state.history.pop();
    },
    cancelSwap: (state, action) => {
      state.history.splice(action.payload, 1);
    }
  }
});
  
export const { 
  addSwapItem, 
  updateSwapStatus, 
  removeLatestSwap,
  cancelSwap
} = historySlice.actions;
  
export default historySlice.reducer;