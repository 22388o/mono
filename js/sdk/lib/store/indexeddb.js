module.exports = class IndexedDB {
  constructor() {
    this.db = null;
  }

  /**
   * IndexedDB Initialization
   */
  connectDB () {
    if(!window.indexedDB) {
      console.log(`Your browser doesn't support IndexedDB`);
      return;
    }
    const request = indexedDB.open('SWAP_CLIENT', 1);
    request.onerror = (event) => {
      console.error(`Database Connection Error: ${event.target.errorCode}`);
    };
    request.onsuccess = (event) => {
      this.db = event.target.result;
      console.log(`Connected`);
    }
    request.onupgradeneeded = (event) => {
      this.db = event.target.result;

      // create the Contacts object store 
      // with auto-increment id
      let store = db.createObjectStore('Activities', {
          autoIncrement: true
      });
 
      // create an index on the email property
      let index = store.createIndex('id', 'id', {
          unique: true
      }); 
    };
  }

  addNewActivity(activity) {
    const txn = db.transaction('Activities', 'readwrite');

    const store = txn.objectStore('Activities');

    let query = store.put(activity);

    query.onsuccess = (event) => {
      console.log(event);
    }
    query.onerror = (event) => {
      console.log(event.target.errorCode);
    }

    txn.complete = () => {
      db.close();
    }
  }

  getActivityById(id) {
    const txn = db.transaction('Activities', 'readonly');
    const store = txn.objectStore('Activities');

    let query = store.get(id);

    query.onsuccess = (event) => {
        if (!event.target.result) {
            console.log(`The activity with ${id} not found`);
        } else {
            console.table(event.target.result);
        }
    };

    query.onerror = (event) => {
        console.log(event.target.errorCode);
    }

    txn.oncomplete = function () {
        db.close();
    };
  }
}