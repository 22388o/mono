module.exports = class IndexedDB {
  constructor(dbName, storeName) {
    this.dbName = dbName;
    this.storeName = storeName;
    this.db = null;
  }

  async init() {
      return new Promise((resolve, reject) => {
          const request = indexedDB.open(this.dbName, 1);

          request.onupgradeneeded = event => {
              this.db = event.target.result;
              this.db.createObjectStore(this.storeName, { autoIncrement: true });
          };

          request.onsuccess = event => {
              this.db = event.target.result;
              resolve();
          };

          request.onerror = event => {
              reject('Error opening DB', event);
          };
      });
  }

  async put(value) {
      const transaction = this.db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      return store.put(value);
  }

  async get(key) {
      const transaction = this.db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      return new Promise((resolve, reject) => {
          const request = store.get(key);
          request.onsuccess = event => {
              resolve(event.target.result);
          };
          request.onerror = event => {
              reject(event);
          };
      });
  }

  async delete(key) {
      const transaction = this.db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      return new Promise((resolve, reject) => {
          const request = store.delete(key);
          request.onsuccess = event => {
              resolve(event.target.result);
          };
          request.onerror = event => {
              reject(event);
          };
      });
  }
}