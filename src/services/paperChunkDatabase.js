const DATABASE_NAME = "researchai-paper-chunks";
const STORE_NAME = "paperChunks";
const DATABASE_VERSION = 1;

let databasePromise;

function openDatabase() {
  if (!("indexedDB" in window)) {
    return Promise.reject(new Error("This browser does not support IndexedDB."));
  }

  if (!databasePromise) {
    databasePromise = new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

      request.onupgradeneeded = () => {
        const database = request.result;
        const store = database.createObjectStore(STORE_NAME, {
          keyPath: ["userId", "paperId"],
        });
        store.createIndex("paperId", "paperId", { unique: false });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () =>
        reject(request.error || new Error("Unable to open local paper storage."));
      request.onblocked = () =>
        reject(new Error("Local paper storage is blocked by another browser tab."));
    }).catch((error) => {
      databasePromise = null;
      throw error;
    });
  }

  return databasePromise;
}

async function runTransaction(mode, operation) {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    let result;

    try {
      result = operation(store);
    } catch (error) {
      reject(error);
      return;
    }

    transaction.oncomplete = () => resolve(result?.result);
    transaction.onerror = () =>
      reject(transaction.error || new Error("Local paper storage failed."));
    transaction.onabort = () =>
      reject(transaction.error || new Error("Local paper storage was interrupted."));
  });
}

export function getPaperChunkCache(userId, paperId) {
  return runTransaction("readonly", (store) =>
    store.get([userId, paperId])
  );
}

export function savePaperChunkCache(userId, paperId, chunks) {
  return runTransaction("readwrite", (store) =>
    store.put({ userId, paperId, chunks })
  );
}

export async function deletePaperChunkCache(paperId) {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    const index = transaction.objectStore(STORE_NAME).index("paperId");
    const request = index.openKeyCursor(IDBKeyRange.only(paperId));

    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) {
        transaction.objectStore(STORE_NAME).delete(cursor.primaryKey);
        cursor.continue();
      }
    };
    request.onerror = () =>
      reject(request.error || new Error("Unable to find local paper chunks."));
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error || new Error("Unable to remove local paper chunks."));
    transaction.onabort = () =>
      reject(transaction.error || new Error("Local paper storage was interrupted."));
  });
}
