// Wipe everything: CacheStorage, IndexedDB, OPFS, localStorage, sessionStorage

export interface MemoryStorageReport {
  localStorageKeys: number;
  sessionStorageKeys: number;
  indexedDbDatabases: string[];
  cacheNames: string[];
  opfsSupported: boolean;
  estimatedQuotaUsedBytes: number;
}

export async function inspectStorage(): Promise<MemoryStorageReport> {
  const report: MemoryStorageReport = {
    localStorageKeys: localStorage.length,
    sessionStorageKeys: sessionStorage.length,
    indexedDbDatabases: [],
    cacheNames: [],
    opfsSupported: typeof navigator !== 'undefined' && 'storage' in navigator && 'getDirectory' in navigator.storage,
    estimatedQuotaUsedBytes: 0,
  };

  if (typeof indexedDB !== 'undefined' && indexedDB.databases) {
    try {
      const dbs = await indexedDB.databases();
      report.indexedDbDatabases = dbs.map(db => db.name || 'unnamed');
    } catch (e) {
      console.warn('Could not list IDB databases', e);
    }
  }

  if (typeof caches !== 'undefined') {
    try {
      report.cacheNames = await caches.keys();
    } catch (e) {
      console.warn('Could not list caches', e);
    }
  }

  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      report.estimatedQuotaUsedBytes = estimate.usage || 0;
    } catch (e) {
      console.warn('Could not estimate quota', e);
    }
  }

  return report;
}

export async function wipeEverythingNow(): Promise<void> {
  // 1. Clear LocalStorage & SessionStorage
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch (e) {
    console.error('Failed to clear Web Storage', e);
  }

  // 2. Clear IndexedDB
  if (typeof indexedDB !== 'undefined') {
    try {
      if (indexedDB.databases) {
        const dbs = await indexedDB.databases();
        for (const db of dbs) {
          if (db.name) {
            indexedDB.deleteDatabase(db.name);
          }
        }
      }
      // Explicitly delete known databases
      indexedDB.deleteDatabase('offlineforge_db');
      indexedDB.deleteDatabase('offlineforge_timeline');
    } catch (e) {
      console.error('Failed to clear IndexedDB', e);
    }
  }

  // 3. Clear CacheStorage
  if (typeof caches !== 'undefined') {
    try {
      const keys = await caches.keys();
      for (const key of keys) {
        await caches.delete(key);
      }
    } catch (e) {
      console.error('Failed to clear CacheStorage', e);
    }
  }

  // 4. Clear OPFS
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.getDirectory) {
    try {
      const root = await navigator.storage.getDirectory();
      // Remove all entries
      // @ts-ignore
      for await (const name of root.keys()) {
        try {
          await root.removeEntry(name, { recursive: true });
        } catch {}
      }
    } catch (e) {
      console.error('Failed to clear OPFS', e);
    }
  }
}
