let db_data = [], lastCallTime = null;

const IndexedDB = {
  dbName: 'swap_client',
  storeName: 'activities',
  db: null,
  listeners: [],

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(IndexedDB.dbName, 1);

      request.onupgradeneeded = event => {
        IndexedDB.db = event.target.result;
        IndexedDB.db.createObjectStore(IndexedDB.storeName, { autoIncrement: true });
      };

      request.onsuccess = event => {
        IndexedDB.db = event.target.result;
        resolve();
      };

      request.onerror = event => {
        reject('Error opening DB', event);
      };
    });
  },

  async put(value) {
    const transaction = IndexedDB.db.transaction(IndexedDB.storeName, 'readwrite');
    const store = transaction.objectStore(IndexedDB.storeName);
    const request = store.put(value);
    request.onsuccess = (event) => {
      console.log('emitted the change');
    }
    request.onerror = () => {
      console.error('Error!');
    }
  },

  async get(key, value) {
    const transaction = IndexedDB.db.transaction(IndexedDB.storeName, 'readonly');
    const store = transaction.objectStore(IndexedDB.storeName);
    const index = store.index(key);
    return new Promise((resolve, reject) => {
      const request = index.get(value);
      request.onsuccess = event => {
        resolve(event.target.result);
      };
      request.onerror = event => {
        reject(event);
      };
    });
  },

  async delete(key) {
    const transaction = IndexedDB.db.transaction(IndexedDB.storeName, 'readwrite');
    const store = transaction.objectStore(IndexedDB.storeName);
    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = event => {
        resolve(event.target.result);
      };
      request.onerror = event => {
        reject(event);
      };
    });
  },

  async delete_last() {
    const transaction = IndexedDB.db.transaction(IndexedDB.storeName, 'readwrite');
    const store = transaction.objectStore(IndexedDB.storeName);
    
    const request = store.openCursor(null, "prev");
    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        const key = cursor.primaryKey;
        store.delete(key);
        console.log("Last item deleted successfully!");
      } else {
        console.error("Error deleting last item: no items found in object store.");
      }
    };
    request.onerror = (event) => {
      console.error("Error deleting last item: ", event.target.error);
    };
  },
  
  async get_all() {
    if(IndexedDB.db === null) return null;
    const transaction = IndexedDB.db.transaction(IndexedDB.storeName, 'readonly');
    const store = transaction.objectStore(IndexedDB.storeName);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = event => {
        resolve(event.target.result);
      };
      request.onerror = event => {
        reject(event);
      };
    });
  },

  subscribe(listener) {
    /*listeners = [...listeners, listener];
    return () => {
      listeners = listeners.filter(l => l !== listener);
    }*/
    IndexedDB.listeners.push(listener);
  },

  getAllActivities() {
    const curTime = new Date().getTime();
    if (lastCallTime === null || curTime - lastCallTime >= 1000) {
      lastCallTime = new Date().getTime();
      (async () => {
        const data = await IndexedDB.get_all();
        db_data = data;
        IndexedDB.emitChanges();
      })();
    }
    return db_data;
  },

  async dispatch(action) {
    switch(action.type) {
      case 'ADD_SWAP_ITEM':
        await IndexedDB.put(action.payload);
        break;
      case 'UPDATE_SWAP_STATUS':
        // TODO: right now only checking activity item with the same status
        // const toUpdate = newState.filter(activity => activity.secretHash == action.payload.secretHash);
        const toUpdate = IndexedDB.get('secretHash', action.payload.secretHash);
        console.log("updating activity " + action.payload.secretHash)
        console.log(action.payload)
        if(toUpdate.length > 0){
          if(action.payload.status) toUpdate[0].status = action.payload.status;
          if(action.payload.paymentAddress) toUpdate[0].paymentAddress = action.payload.paymentAddress;
          if(action.payload.tx) toUpdate[0].tx = action.payload.tx;
        } 
        IndexedDB.put(toUpdate);
        break;
      case 'REMOVE_LATEST_SWAP': 
        await IndexedDB.delete_last();
        break;;
      case 'CANCEL_SWAP':
        const toDelete = IndexedDB.get('secretHash', action.payload.secretHash);
        await IndexedDB.delete(toDelete.key);
        break;
    }
    IndexedDB.emitChanges();
  },

  emitChanges() {
    IndexedDB.listeners.forEach(listener => listener());
  }
}

module.exports = IndexedDB;