// Version Timeline / File Undo storage
// Stores file snapshots after each tool operation for instant rollback

export interface FileVersion {
  id: string;
  originalFileName: string;
  stepName: string;
  timestamp: number;
  size: number;
  blob: Blob;
}

const TIMELINE_DB_NAME = 'offlineforge_timeline';
const STORE_NAME = 'versions';

function openTimelineDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('No IndexedDB'));
    const req = indexedDB.open(TIMELINE_DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('originalFileName', 'originalFileName', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export class VersionTimeline {
  public static async recordVersion(
    originalFileName: string,
    stepName: string,
    blob: Blob
  ): Promise<FileVersion> {
    const version: FileVersion = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      originalFileName,
      stepName,
      timestamp: Date.now(),
      size: blob.size,
      blob,
    };

    if (typeof indexedDB === 'undefined') {
      return version;
    }

    try {
      const db = await openTimelineDb();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(version);
    } catch (e) {
      console.warn('Failed to record version snapshot in IndexedDB', e);
    }

    return version;
  }

  public static async getHistory(originalFileName: string): Promise<FileVersion[]> {
    try {
      const db = await openTimelineDb();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const index = store.index('originalFileName');
        const req = index.getAll(IDBKeyRange.only(originalFileName));
        req.onsuccess = () => {
          const res: FileVersion[] = req.result || [];
          res.sort((a, b) => b.timestamp - a.timestamp);
          resolve(res);
        };
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  public static async getAllVersions(): Promise<FileVersion[]> {
    try {
      const db = await openTimelineDb();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => {
          const res: FileVersion[] = req.result || [];
          res.sort((a, b) => b.timestamp - a.timestamp);
          resolve(res);
        };
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  public static async clearHistory(): Promise<void> {
    try {
      const db = await openTimelineDb();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).clear();
    } catch {}
  }
}
