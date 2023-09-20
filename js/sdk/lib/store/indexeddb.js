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
        const store = IndexedDB.db.createObjectStore(IndexedDB.storeName, { keyPath: 'id', autoIncrement: true });

        store.createIndex('secretHash', 'secretHash', { unique: false });
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
    }
    request.onerror = () => {
      console.error('Error!');
    }
  },

  async get(value) {
    const transaction = IndexedDB.db.transaction(IndexedDB.storeName, 'readonly');
    const store = transaction.objectStore(IndexedDB.storeName);
    const index = store.index('secretHash');
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
    IndexedDB.listeners.push(listener);
  },

  getAllActivities() {
    const curTime = new Date().getTime();
    if (lastCallTime === null || curTime - lastCallTime >= 1000) {
      lastCallTime = new Date().getTime();
      (async () => {
        const data = await IndexedDB.get_all();
        db_data = data || [];
        IndexedDB.emitChanges();
      })();
    }
    return db_data;
  },

  async dispatch(action) {
    console.log('dispatch called', action.type);
    switch(action.type) {
      case 'ADD_SWAP_ITEM':
        await IndexedDB.put(action.payload);
        break;
      case 'UPDATE_SWAP_STATUS':
        const toUpdate = await IndexedDB.get(action.payload.secretHash);
        console.log('to update data', toUpdate)
        console.log("updating activity " + action.payload.secretHash)
        console.log(action.payload)
        if(toUpdate){
          if(action.payload.status) toUpdate.status = action.payload.status;
          if(action.payload.paymentAddress) toUpdate.paymentAddress = action.payload.paymentAddress;
          if(action.payload.tx) toUpdate.tx = action.payload.tx;
        } 
        IndexedDB.put(toUpdate);
        break;
      case 'REMOVE_LATEST_SWAP': 
        await IndexedDB.delete_last();
        break;;
      case 'CANCEL_SWAP':
        const toDelete = await IndexedDB.get(action.payload.secretHash);
        await IndexedDB.delete(toDelete.key);
        break;
    }
    setTimeout(() => IndexedDB.emitChanges(), 1000);
  },

  emitChanges() {
    for(let listener of IndexedDB.listeners) {
      listener();
    }
    console.log(`emitted the change to ${IndexedDB.listeners.length} listeners`);
  }
}

module.exports = IndexedDB;