/**
 * @file Store implementation for the browser
 */

const { BaseClass } = require('@portaldefi/core')

/**
 * A weak-map storing private data for each instance of the class
 * @type {WeakMap}
 */
const INSTANCES = new WeakMap()

/**
 * Store implementation for the browser
 * @type {Store}
 */
class Store extends BaseClass {
  constructor (props) {
    super()

    INSTANCES.set(this, Object.seal({
      namespaces: {}
    }))

    this.db = null;

    Object.seal(this)
  }

  /**
   * Returns whether or not the store is open
   * @returns {Boolean}
   */
  get isOpen () {
    return null
  }

  /**
   * Returns the JSON representation of this instance
   * @returns {Object}
   */
  toJSON () {
    return Object.assign(super.toJSON(), { })
  }

  /**
   * Connects to the store.
   * @returns {Promise<Void>}
   */
  open () {
    this.emit('open', this)
    return Promise.resolve(this)
  }

  /**
   * Reads data from the store
   * @param {String} namespace The namespace of the data
   * @param {String} key The unique identifier of the data
   * @returns {Promise<Object>}
   */
  get (namespace, key) {
    const instance = INSTANCES.get(this)
    const namespaceMap = instance.namespaces[namespace]

    if (namespaceMap != null && namespaceMap.has(key)) {
      const data = Object.assign({}, namespaceMap.get(key))
      this.emit('get', namespace, key, data)
      return Promise.resolve(data)
    } else {
      this.emit('get', namespace, key)
      return Promise.reject(new Error('not found'))
    }
  }

  /**
   * Writes data to the store
   * @param {String} namespace The namespace of the data
   * @param {String} key The unique identifier of the data
   * @param {Object} data The data to be stored
   * @returns {Promise<Object>} The previously stored data, if any
   */
  put (namespace, key, data) {
    const instance = INSTANCES.get(this)
    const namespaceMap = instance.namespaces[namespace] || new Map()
    instance.namespaces[namespace] = namespaceMap

    const oldData = namespaceMap.get(key)
    const newData = Object.freeze(Object.assign({}, data))
    namespaceMap.set(key, newData)

    this.emit('put', namespace, key, newData, oldData)
    return Promise.resolve(oldData)
  }

  update (namespace, key, modifier) {
    const instance = INSTANCES.get(this)
    const namespaceMap = instance.namespaces[namespace]

    if (namespaceMap != null && namespaceMap.has(key)) {
      const data = Object.assign({}, namespaceMap.get(key))
      this.emit('get', namespace, key, data)
      return Promise.resolve(data)
    } else {
      this.emit('get', namespace, key)
      return Promise.reject(new Error('not found'))
    }
  }

  /**
   * Deletes data from the store
   * @param {String} namespace The namespace of the data
   * @param {String} key The unique identifier of the data
   * @returns {Promise<Void>}
   */
  del (namespace, key) {
    const instance = INSTANCES.get(this)
    const namespaceMap = instance.namespaces[namespace]

    if (namespaceMap.has(key)) {
      const data = namespaceMap.get(key)
      namespaceMap.delete(key)
      this.emit('del', namespace, key, data)
      return Promise.resolve(data)
    } else {
      this.emit('del', namespace, key)
      return Promise.reject(new Error('not found'))
    }
  }

  /**
   * Closes the connection to the server
   * @returns {Promise<Void>}
   */
  close () {
    this.emit('close', this)
    return Promise.resolve()
  }
}

let db_data = [], lastCallTime = null;

/**
 * IndexedDB management class for implementation of idb, only available in browsers
 *    It allows subscription to listen to the changes made to the idb
 * @member dbName: Database name 
 * @member storeName: Store name in db
 * @member db: Database object for management
 * @member listeners: Subscribed listeners to listen to the idb changes
 */
const IndexedDB = {
  dbName: 'swap_client',
  storeName: 'activities',
  db: null,
  listeners: [],

  /**
   * Initializes IndexedDB database for the browser
   * @returns Promise when the init is finished
   */
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

  /**
   * Adds a new item or updates an existing item
   * @param {object} value Item object to add or update
   */
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

  /**
   * Finds an item with a specific secretHash index and returns
   * @param {*} value secretHash value to search for
   * @returns Item found in search
   */
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

  /**
   * Deletes an item with the specific secretHash
   * @param {*} id id to delete
   * @returns Promise when finished
   */
  async delete(id) {
    const transaction = IndexedDB.db.transaction(IndexedDB.storeName, 'readwrite');
    const store = transaction.objectStore(IndexedDB.storeName);
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = event => {
        resolve(event.target.result);
      };
      request.onerror = event => {
        reject(event);
      };
    });
  },

  /**
   * Deletes last item in the Store
   */
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
  
  /**
   * Returns all items in the store
   * @returns All Items in the Store
   */
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

  /**
   * Adds listener to subscribe
   * @param {function} listener to subscribe
   */
  subscribe(listener) {
    IndexedDB.listeners.push(listener);
  },

  /**
   * Getter function to retrieve all activites in store, 
   * after retrieve emits the changes to the listeners
   * @returns Activities data
   */
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

  /**
   * Emits the changes to the subscribed listeners
   */
  emitChanges() {
    for(let listener of IndexedDB.listeners) {
      listener();
    }
  }
}

module.exports = {
  IndexedDB,
  Store 
};
