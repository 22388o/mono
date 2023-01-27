import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import swapSlice from './slices/swapSlice';
import historySlice from './slices/historySlice';
import userSlice from './slices/userSlice';

export const store = configureStore({
  reducer: {
    swap: swapSlice,
    history: historySlice,
    user: userSlice
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false,
  }),
});