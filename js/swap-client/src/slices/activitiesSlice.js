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
        status: 1
      });
    },
    updateSwapStatus: (state, action) => {
      state.activities[action.payload.index].status = action.payload.status
    },
    removeLatestSwap: (state, action) => {
      state.activities.pop();
    },
    cancelSwap: (state, action) => {
      state.activities.splice(action.payload, 1);
    },
    updateSwapInfo: (state, action) => {
      state.activities[action.payload.index][action.payload.field] = action.payload.info;
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
