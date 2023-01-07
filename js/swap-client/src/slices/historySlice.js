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
          status: 'PENDING'
        });
      },
      updateLatestSwapStatus: (state, action) => {
        let len = state.history.length;
        state.history[len - 1] = {
          ...state.history[len - 1],
          status: action.payload
        };
      }
    }
  });
  
export const { addSwapItem, updateLatestSwapStatus } = historySlice.actions;
  
export default historySlice.reducer;