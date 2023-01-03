import { configureStore } from '@reduxjs/toolkit';
import swapSlice from './slices/swapSlice';
import historySlice from './slices/historySlice';

export const store = configureStore({
  reducer: {
    swap: swapSlice,
    history: historySlice
  }
});