let db_data = []; let lastCallTime = null

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
  async init () {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(IndexedDB.dbName, 1)

      request.onupgradeneeded = event => {
        IndexedDB.db = event.target.result
        const store = IndexedDB.db.createObjectStore(IndexedDB.storeName, { keyPath: 'id', autoIncrement: true })

        store.createIndex('secretHash', 'secretHash', { unique: false })
      }

      request.onsuccess = event => {
        IndexedDB.db = event.target.result
        resolve()
      }

      request.onerror = event => {
        reject('Error opening DB', event)
      }
    })
  },

  /**
   * Adds a new item or updates an existing item
   * @param {object} value Item object to add or update
   */
  async put (value) {
    const transaction = IndexedDB.db.transaction(IndexedDB.storeName, 'readwrite')
    const store = transaction.objectStore(IndexedDB.storeName)
    const request = store.put(value)
    request.onsuccess = (event) => {
    }
    request.onerror = () => {
      console.error('Error!')
    }
  },

  /**
   * Finds an item with a specific secretHash index and returns
   * @param {*} value secretHash value to search for
   * @returns Item found in search
   */
  async get (value) {
    const transaction = IndexedDB.db.transaction(IndexedDB.storeName, 'readonly')
    const store = transaction.objectStore(IndexedDB.storeName)
    const index = store.index('secretHash')
    return new Promise((resolve, reject) => {
      const request = index.get(value)
      request.onsuccess = event => {
        resolve(event.target.result)
      }
      request.onerror = event => {
        reject(event)
      }
    })
  },

  /**
   * Deletes an item with the specific secretHash
   * @param {*} id id to delete
   * @returns Promise when finished
   */
  async delete (id) {
    const transaction = IndexedDB.db.transaction(IndexedDB.storeName, 'readwrite')
    const store = transaction.objectStore(IndexedDB.storeName)
    return new Promise((resolve, reject) => {
      const request = store.delete(id)
      request.onsuccess = event => {
        resolve(event.target.result)
      }
      request.onerror = event => {
        reject(event)
      }
    })
  },

  /**
   * Deletes last item in the Store
   */
  async delete_last () {
    const transaction = IndexedDB.db.transaction(IndexedDB.storeName, 'readwrite')
    const store = transaction.objectStore(IndexedDB.storeName)

    const request = store.openCursor(null, 'prev')
    request.onsuccess = (event) => {
      const cursor = event.target.result
      if (cursor) {
        const key = cursor.primaryKey
        store.delete(key)
        console.log('Last item deleted successfully!')
      } else {
        console.error('Error deleting last item: no items found in object store.')
      }
    }
    request.onerror = (event) => {
      console.error('Error deleting last item: ', event.target.error)
    }
  },

  /**
   * Returns all items in the store
   * @returns All Items in the Store
   */
  async get_all () {
    if (IndexedDB.db === null) return null
    const transaction = IndexedDB.db.transaction(IndexedDB.storeName, 'readonly')
    const store = transaction.objectStore(IndexedDB.storeName)
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = event => {
        resolve(event.target.result)
      }
      request.onerror = event => {
        reject(event)
      }
    })
  },

  /**
   * Adds listener to subscribe
   * @param {function} listener to subscribe
   */
  subscribe (listener) {
    IndexedDB.listeners.push(listener)
  },

  /**
   * Getter function to retrieve all activites in store,
   * after retrieve emits the changes to the listeners
   * @returns Activities data
   */
  getAllActivities () {
    const curTime = new Date().getTime()
    if (lastCallTime === null || curTime - lastCallTime >= 1000) {
      lastCallTime = new Date().getTime();
      (async () => {
        const data = await IndexedDB.get_all()
        db_data = data || []
        IndexedDB.emitChanges()
      })()
    }
    return db_data
  },

  /**
   * Emits the changes to the subscribed listeners
   */
  emitChanges () {
    for (const listener of IndexedDB.listeners) {
      listener()
    }
  }
}

export default IndexedDB
