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
        state.history.pop();;
      }
    }
  });
  
export const { addSwapItem, updateSwapStatus, removeLatestSwap } = historySlice.actions;
  
export default historySlice.reducer;