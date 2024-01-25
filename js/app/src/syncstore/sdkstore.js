const sdkStore = {
  currentState: { 
    isLoggedIn: false,
    sdk: null
  },
  listeners: [],
  reducer(action) {
    switch(action.type) {
      case 'SIGN_IN':
        return { sdk: action.payload, isLoggedIn: true };
      case 'SIGN_OUT':
        return { sdk: null, isLoggedIn: false };
      default: 
        return sdkStore.currentState
    }
  },
  subscribe(l) {
    sdkStore.listeners.push(l);
  },
  getSnapshot() {
    return sdkStore.currentState
  },
  dispatch(action) {
    sdkStore.currentState = sdkStore.reducer(action);
    sdkStore.listeners.forEach((l) => l());
    return action;
  }
}

export { sdkStore };