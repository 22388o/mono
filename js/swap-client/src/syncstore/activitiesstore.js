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
        const toUpdate = newState.filter(activity => activity.orderId == action.payload.orderId);
        console.log("updating activity " + action.payload.orderId)
        console.log(action.payload)
        if(toUpdate.length > 0){
          if(action.payload.status) toUpdate[0].status = action.payload.status;
          if(action.payload.paymentAddress) toUpdate[0].paymentAddress = action.payload.paymentAddress;
          if(action.payload.tx) toUpdate[0].tx = action.payload.tx;
        } 
        return newState;
      case 'REMOVE_LATEST_SWAP': 
        newState.pop();
        return newState;
      case 'CANCEL_SWAP':
        newState.splice(action.payload, 1);
        return newState;
      case 'UPDATE_SWAP_INFO':
        newState.filter(activity => activity.orderId === action.payload.index)[0][action.payload.field] = action.payload.info;
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
