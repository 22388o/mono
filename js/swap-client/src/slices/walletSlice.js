import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  node: {
    title: 'Node',
    connected: false,
    data: null
  },
  wallet: {
    title: 'Wallet',
    connected: false,
    data: null
  }
};

export const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setNodeData: (state, action) => {
      state.node.connected = true;
      state.node.data = action.payload;
    },
    setWalletData: (state, action) => {
      state.wallet.connected = true;
      state.wallet.data = action.payload;
    },
  }
});

export const {
  setNodeData,
  setWalletData
} = walletSlice.actions;

export default walletSlice.reducer;