import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  history: []
};

export const historySlice = createSlice({
    name: 'history',
    initialState,
    reducers: {
    }
  });
  
export const {} = historySlice.actions;
  
export default historySlice.reducer;