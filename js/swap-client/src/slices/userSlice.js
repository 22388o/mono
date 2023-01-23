import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userType: null,
  isLoggedIn: false
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    signIn: (state, action) => {
      state.user = action.payload
      state.isLoggedIn = true;
    },
    signOut: (state, action) => {
      state.isLoggedIn = false;
      state.user = null;
    }
  }
});

export const {
  signIn,
  signOut
} = userSlice.actions;

export default userSlice.reducer;