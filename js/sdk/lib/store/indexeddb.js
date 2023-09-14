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
    store.put(value);
    IndexedDB.emitChanges();
  },

  async get(key) {
    const transaction = IndexedDB.db.transaction(IndexedDB.storeName, 'readonly');
    const store = transaction.objectStore(IndexedDB.storeName);
    return new Promise((resolve, reject) => {
      const request = store.get(key);
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
  
  async get_all() {
    if(IndexedDB.db === null) return null;
    const transaction = IndexedDB.db.transaction(IndexedDB.storeName, 'readonly');
    const store = transaction.objectStore(IndexedDB.storeName);
    return new Promise((resolve, reject) => {
      const request = store.get();
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

  async getSnapshot() {
    return await IndexedDB.get_all();
  },

  emitChanges() {
    for(let listener of IndexedDB.listeners) {
      listener();
    }
  }
}

module.exports = IndexedDB;