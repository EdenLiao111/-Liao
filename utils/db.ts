import { PortfolioItem } from '../types';

const DB_NAME = 'DarkStreamDB';
const DB_VERSION = 1;
const STORE_NAME = 'portfolio_items';

interface StoredItem extends PortfolioItem {
  blob: Blob;
}

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const savePortfolioItem = async (item: PortfolioItem, file: File): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const storedItem: StoredItem = { ...item, blob: file };
    const request = store.put(storedItem);
    request.onsuccess = () => {
        resolve();
        db.close();
    };
    request.onerror = () => {
        reject(request.error);
        db.close();
    };
  });
};

export const deletePortfolioItem = async (id: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    // Explicitly deleting by ID
    const request = store.delete(id);
    
    request.onsuccess = () => {
        console.log(`Item ${id} deleted successfully from DB`);
        resolve();
        // Important: Close the DB connection to ensure the lock is released
        // This helps prevent issues where the file is considered "in use"
        db.close();
    };
    request.onerror = () => {
        console.error(`Failed to delete item ${id}`, request.error);
        reject(request.error);
        db.close();
    };
  });
};

export const getPortfolioItems = async (): Promise<PortfolioItem[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => {
      const storedItems = request.result as StoredItem[];
      // Convert blobs back to URLs
      const items = storedItems.map(item => {
        // Create new object URL from the stored blob
        const url = URL.createObjectURL(item.blob);
        return {
          ...item,
          url
        };
      });
      items.sort((a, b) => b.timestamp - a.timestamp);
      resolve(items);
      db.close();
    };
    request.onerror = () => { 
        reject(request.error);
        db.close();
    };
  });
};