import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import swapSlice from './slices/swapSlice';
import historySlice from './slices/historySlice';
import userSlice from './slices/userSlice';
import walletSlice from './slices/walletSlice';

export const store = configureStore({
  reducer: {
    swap: swapSlice,
    history: historySlice,
    user: userSlice,
    wallet: walletSlice
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false,
  }),
});