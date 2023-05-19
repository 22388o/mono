const activitiesStore = {
  currentState: [],
  listeners: [],
  reducer(action) {
    const newState = [...activitiesStore.currentState];
    switch(action.type) {
      case 'ADD_SWAP_ITEM':
        newState.push(action.payload);
        return newState;
      case 'UPDATE_SWAP_STATUS':
        const toUpdate = newState.filter(activity => activity.secretHash == action.payload.secretHash);
        if(toUpdate.length > 0){
          if(action.payload.btcAddress) toUpdate[0].btcAddress = action.payload.btcAddress;
          toUpdate[0].status = action.payload.status;
        } 
        return newState;
      case 'REMOVE_LATEST_SWAP': 
        newState.pop();
        return newState;
      case 'CANCEL_SWAP':
        newState.splice(action.payload, 1);
        return newState;
      case 'UPDATE_SWAP_INFO':
        newState.filter(activity => activity.swapId === action.payload.index)[0][action.payload.field] = action.payload.info;
        return newState;
      default: 
        return activitiesStore.currentState
    }
  },
  subscribe(l) {
    activitiesStore.listeners.push(l);
  },
  getSnapshot() {
    return activitiesStore.currentState
  },
  dispatch(action) {
    activitiesStore.currentState = activitiesStore.reducer(action);
    activitiesStore.listeners.forEach((l) => l());
    return action;
  }
}

export { activitiesStore };