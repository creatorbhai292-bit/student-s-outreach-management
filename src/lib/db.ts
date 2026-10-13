/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Student,
  ActivitySubmission,
  PointRule,
  RankPointRule,
  PointHistoryRecord,
  FeaturedStudentTitle,
  AchievementBadge,
  IssuedCertificate,
  AppNotification,
  AuditLog,
  AppSettings,
} from '../types';
import {
  isSupabaseConnected,
  fetchCollectionFromSupabase,
  saveDocumentToSupabase,
  saveManyDocumentsToSupabase,
  deleteDocumentFromSupabase,
  deleteManyDocumentsFromSupabase,
  uploadOptimizedImage,
  deleteImageFromSupabaseStorage,
} from './supabase';
import { optimizeImageTo50to80KB } from './imageOptimizer';

export { isSupabaseConnected, uploadOptimizedImage, deleteImageFromSupabaseStorage };

// Keep backward-compatible alias so existing components don't crash
export const isFirebaseConnected = (): boolean => false;

const DB_NAME = 'SOMS_IndexedDB';
const DB_VERSION = 4;

export const STORES = {
  STUDENTS: 'students',
  SUBMISSIONS: 'submissions',
  POINT_RULES: 'pointRules',
  RANK_RULES: 'rankRules',
  POINT_HISTORY: 'pointHistory',
  FEATURED_TITLES: 'featuredTitles',
  BADGES: 'badges',
  CERTIFICATES: 'certificates',
  NOTIFICATIONS: 'notifications',
  AUDIT_LOGS: 'auditLogs',
  SETTINGS: 'settings',
  ANNOUNCEMENTS: 'announcements',
} as const;

export type StoreName = typeof STORES[keyof typeof STORES];

let dbInstance: IDBDatabase | null = null;

export async function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      console.warn('IndexedDB not supported, falling back to localStorage');
      resolve(null as unknown as IDBDatabase);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const storeNames = Object.values(STORES);

      for (const name of storeNames) {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name, { keyPath: 'id' });
        }
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.error('IndexedDB open error:', (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

// In-memory cache to guarantee zero runtime failures
const memoryStore = new Map<string, any[]>();

// Heavy stores that shouldn't clog localStorage
const HEAVY_STORES: readonly string[] = [
  STORES.SUBMISSIONS,
  STORES.CERTIFICATES,
  STORES.AUDIT_LOGS,
  STORES.POINT_HISTORY,
  STORES.STUDENTS,
];

/**
 * Prunes heavy or redundant entries from localStorage
 */
export function pruneHeavyLocalStorage(): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    for (const heavy of HEAVY_STORES) {
      try {
        localStorage.removeItem(`soms_${heavy}`);
      } catch {
        // ignore
      }
    }
  } catch {
    // ignore
  }
}

// Automatically prune redundant heavy keys on initial load
pruneHeavyLocalStorage();

/**
 * Creates a quota-safe clone of data for localStorage backup.
 */
function sanitizeForLocalStorage<T>(items: T[]): T[] {
  try {
    return items.map((item) => {
      if (!item || typeof item !== 'object') return item;
      const copy: Record<string, any> = { ...item };
      for (const key of Object.keys(copy)) {
        const val = copy[key];
        if (typeof val === 'string' && val.startsWith('data:') && val.length > 40000) {
          copy[key] = '';
        }
      }
      return copy as T;
    });
  } catch {
    return items;
  }
}

function getLocalFallback<T>(storeName: string): T[] {
  if (memoryStore.has(storeName)) {
    return (memoryStore.get(storeName) as T[]) || [];
  }
  try {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const raw = localStorage.getItem(`soms_${storeName}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      memoryStore.set(storeName, parsed);
      return parsed;
    }
  } catch (err) {
    console.warn(`LocalStorage get failed for ${storeName}:`, err);
  }
  return [];
}

function setLocalFallback<T>(storeName: string, items: T[]): void {
  memoryStore.set(storeName, items);

  if (HEAVY_STORES.includes(storeName)) {
    try {
      localStorage.removeItem(`soms_${storeName}`);
    } catch {
      // ignore
    }
    return;
  }

  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const sanitized = sanitizeForLocalStorage(items);
    localStorage.setItem(`soms_${storeName}`, JSON.stringify(sanitized));
  } catch (err: any) {
    const isQuota =
      err &&
      (err.name === 'QuotaExceededError' ||
        err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        err.code === 22 ||
        err.number === -2147024882);

    if (isQuota) {
      try {
        pruneHeavyLocalStorage();
        const sanitized = sanitizeForLocalStorage(items);
        localStorage.setItem(`soms_${storeName}`, JSON.stringify(sanitized));
      } catch {
        console.warn(`[Storage] Saved soms_${storeName} to memory cache (quota full)`);
      }
    } else {
      console.warn(`[Storage] LocalStorage unavailable for soms_${storeName}:`, err);
    }
  }
}

/**
 * Fetch all items from store.
 * Priority 1: Supabase Cloud Database (if configured)
 * Priority 2: IndexedDB
 * Priority 3: In-memory/localStorage fallback
 */
export async function getAllFromStore<T extends { id: string } = any>(storeName: StoreName): Promise<T[]> {
  try {
    // 1. If Supabase is connected, fetch from authoritative cloud Postgres database
    if (isSupabaseConnected()) {
      try {
        const cloudDocs = await fetchCollectionFromSupabase<T>(storeName);
        if (cloudDocs !== null) {
          memoryStore.set(storeName, cloudDocs);
          // Mirror to local IndexedDB for fast offline availability
          openDB()
            .then((db) => {
              if (db) {
                const tx = db.transaction(storeName, 'readwrite');
                const store = tx.objectStore(storeName);
                store.clear();
                cloudDocs.forEach((d) => store.put(d));
              }
            })
            .catch(() => {});
          return cloudDocs;
        }
      } catch (cloudErr) {
        console.warn(`[Supabase] Cloud fetch for "${storeName}" fell back to local store:`, cloudErr);
      }
    }

    // 2. Read from local IndexedDB
    const db = await openDB();
    if (!db) return getLocalFallback<T>(storeName);

    return new Promise((resolve) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const result = (request.result as T[]) || [];
        memoryStore.set(storeName, result);
        resolve(result);
      };

      request.onerror = () => {
        console.warn(`IndexedDB getAll failed for ${storeName}, falling back to memory/local`);
        resolve(getLocalFallback<T>(storeName));
      };
    });
  } catch (err) {
    console.warn(`Error in getAllFromStore(${storeName}), falling back:`, err);
    return getLocalFallback<T>(storeName);
  }
}

/**
 * Save single item into store and sync to Supabase Cloud
 */
export async function putInStore<T extends { id: string }>(
  storeName: StoreName,
  item: T
): Promise<T> {
  // 1. Immediately update memory cache
  const items = getLocalFallback<T>(storeName);
  const index = items.findIndex((i) => i.id === item.id);
  if (index >= 0) items[index] = item;
  else items.push(item);
  memoryStore.set(storeName, items);

  if (storeName === STORES.SETTINGS) {
    setLocalFallback(storeName, items);
  }

  // 2. Persist to Supabase Cloud Database (if connected)
  if (isSupabaseConnected()) {
    saveDocumentToSupabase(storeName, item).catch((err) => {
      console.warn(`[Supabase] Cloud save to "${storeName}/${item.id}" failed:`, err);
    });
  }

  // 3. Persist to local IndexedDB
  try {
    const db = await openDB();
    if (db) {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      store.put(item);
    }
  } catch (err) {
    console.warn(`[Database] IndexedDB put error on ${storeName}:`, err);
  }

  return item;
}

/**
 * Batch save items into store and sync to Supabase Cloud
 */
export async function putManyInStore<T extends { id: string }>(
  storeName: StoreName,
  items: T[]
): Promise<void> {
  memoryStore.set(storeName, items);
  if (!HEAVY_STORES.includes(storeName)) {
    setLocalFallback(storeName, items);
  }

  // 2. Persist to Supabase Cloud Database (if connected)
  if (isSupabaseConnected() && items.length > 0) {
    saveManyDocumentsToSupabase(storeName, items).catch((err) => {
      console.warn(`[Supabase] Cloud batch save to "${storeName}" failed:`, err);
    });
  }

  // 3. Persist to local IndexedDB
  try {
    const db = await openDB();
    if (db) {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      items.forEach((item) => store.put(item));
    }
  } catch (err) {
    console.warn(`[Database] IndexedDB putMany error on ${storeName}:`, err);
  }
}

/**
 * Delete item from store and sync delete to Supabase Cloud
 */
export async function deleteFromStore(storeName: StoreName, id: string): Promise<void> {
  // 1. Memory and local cache update
  const items = getLocalFallback<{ id: string }>(storeName).filter((i) => i.id !== id);
  memoryStore.set(storeName, items);
  setLocalFallback(storeName, items);

  // 2. Cloud delete from Supabase (awaited for real-time guarantee)
  if (isSupabaseConnected()) {
    try {
      await deleteDocumentFromSupabase(storeName, id);
    } catch (err) {
      console.warn(`[Supabase] Cloud delete failed on "${storeName}/${id}":`, err);
    }
  }

  // 3. Local IndexedDB delete
  try {
    const db = await openDB();
    if (db) {
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    }
  } catch (err) {
    console.warn(`[Database] IndexedDB delete error on ${storeName}:`, err);
  }
}

/**
 * Batch delete items from store and sync delete to Supabase Cloud
 */
export async function deleteManyFromStore(storeName: StoreName, ids: string[]): Promise<void> {
  if (!ids || ids.length === 0) return;
  const idSet = new Set(ids);
  const items = getLocalFallback<{ id: string }>(storeName).filter((i) => !idSet.has(i.id));
  memoryStore.set(storeName, items);
  setLocalFallback(storeName, items);

  // Cloud batch delete from Supabase
  if (isSupabaseConnected()) {
    try {
      await deleteManyDocumentsFromSupabase(storeName, ids);
    } catch (err) {
      console.warn(`[Supabase] Cloud batch delete failed on "${storeName}":`, err);
    }
  }

  // Local IndexedDB batch delete
  try {
    const db = await openDB();
    if (db) {
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        ids.forEach((id) => store.delete(id));
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    }
  } catch (err) {
    console.warn(`[Database] IndexedDB batch delete error on ${storeName}:`, err);
  }
}

export async function clearEntireStore(storeName: StoreName): Promise<void> {
  try {
    memoryStore.set(storeName, []);
    setLocalFallback(storeName, []);

    // Also clear from Supabase if connected
    if (isSupabaseConnected()) {
      try {
        const currentItems = await fetchCollectionFromSupabase<{ id: string }>(storeName);
        if (currentItems && currentItems.length > 0) {
          const ids = currentItems.map((i) => i.id);
          await deleteManyDocumentsFromSupabase(storeName, ids);
        }
      } catch (err) {
        console.warn(`[Supabase] Failed to clear cloud store "${storeName}":`, err);
      }
    }

    const db = await openDB();
    if (!db) {
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error(`Error clearing ${storeName}:`, err);
  }
}

/**
 * Unified File & Image processor:
 * 1. Automatically enforces strict 50 KB - 80 KB compression on all uploaded images.
 * 2. If Supabase is connected, uploads to Supabase Storage and returns the public HTTPS URL!
 * 3. If Supabase is not connected yet, returns the 50-80KB compressed data URL.
 * Storage stays minimal while maintaining crisp visual quality!
 */
export async function fileToBase64(
  file: File,
  folder = 'uploads'
): Promise<string> {
  // If not an image (e.g. PDF document), read as data URL
  if (!file.type.startsWith('image/')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }

  try {
    // Process with strict 50-80 KB optimizer & Supabase storage upload
    const result = await uploadOptimizedImage(file, folder);
    return result.url;
  } catch (err) {
    console.warn('Failed to upload/optimize image, falling back to base64 canvas:', err);
    const optimized = await optimizeImageTo50to80KB(file, 50, 80);
    return optimized.dataUrl;
  }
}
