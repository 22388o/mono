import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activities: []
};

export const activitiesSlice = createSlice({
  name: 'activities',
  initialState,
  reducers: {
    addSwapItem: (state, action) => {
      state.activities.push({
        ...action.payload,
      });
    },
    updateSwapStatus: (state, action) => {
      console.log("activitiesSlice: action.payload.secretHash", action.payload.secretHash, action.payload.status);
      const toUpdate = state.activities.filter(activity => activity.secretHash == action.payload.secretHash);
      if(toUpdate.length > 0) toUpdate[0].status = action.payload.status;
    },
    removeLatestSwap: (state, action) => {
      state.activities.pop();
    },
    cancelSwap: (state, action) => {
      state.activities.splice(action.payload, 1);
    },
    updateSwapInfo: (state, action) => {
      state.activities.filter(activity => activity.swapId === action.payload.index)[0][action.payload.field] = action.payload.info;
    }
  }
});
  
export const { 
  addSwapItem, 
  updateSwapStatus, 
  removeLatestSwap,
  cancelSwap,
  updateSwapInfo
} = activitiesSlice.actions;
  
export default activitiesSlice.reducer;
