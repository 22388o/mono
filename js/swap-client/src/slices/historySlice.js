import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  history: []
};

export const historySlice = createSlice({
    name: 'history',
    initialState,
    reducers: {
      addSwapItem: (state, action) => {
        state.history.push(action.payload);
      },
    }
  });
  
export const { addSwapItem } = historySlice.actions;
  
export default historySlice.reducer;