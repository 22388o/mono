import { IndexedDB } from "@portaldefi/sdk";

export const IndexedDB_dispatch = async (action) => {
  switch(action.type) {
    case 'ADD_SWAP_ITEM':
      await IndexedDB.put(action.payload);
      break;
    case 'UPDATE_SWAP_STATUS':
      const toUpdate = await IndexedDB.get(action.payload.secretHash);
      console.log('to update data', toUpdate)
      console.log("updating activity " + action.payload.secretHash)
      if(toUpdate){
        if(action.payload.status) toUpdate.status = action.payload.status;
        if(action.payload.paymentAddress) toUpdate.paymentAddress = action.payload.paymentAddress;
        if(action.payload.tx) toUpdate.tx = action.payload.tx;
      } 
      IndexedDB.put(toUpdate);
      break;
    case 'REMOVE_LATEST_SWAP': 
      await IndexedDB.delete_last();
      break;
    case 'CANCEL_SWAP':
      const toDelete = await IndexedDB.get(action.payload.secretHash);
      await IndexedDB.delete(toDelete.key);
      break;
  }
  setTimeout(() => IndexedDB.emitChanges(), 1000);
}