import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
<<<<<<< HEAD

export const store = configureStore({
  reducer: {
=======
import activitiesSlice from './slices/activitiesSlice';
import userSlice from './slices/userSlice';
import walletSlice from './slices/walletSlice';

export const store = configureStore({
  reducer: {
    activities: activitiesSlice,
    user: userSlice,
    wallet: walletSlice
>>>>>>> master
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false,
  }),
});