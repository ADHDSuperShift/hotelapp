// Simple IndexedDB helpers to persist photos beyond localStorage limits

const DB_NAME = 'hotel_photos_db'
const STORE_NAME = 'photos'
const KEY = 'photos_v1'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function idbSave(key: string, data: unknown): Promise<void> {
  try {
    const db = await openDB()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const req = store.put(data, key)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
    db.close()
  } catch (e) {
    // Best-effort; fail silently in UI, can log if needed
    console.warn('idbSavePhotos failed', e)
  }
}

export async function idbLoad<T = unknown>(key: string): Promise<T | undefined> {
  try {
    const db = await openDB()
    const result = await new Promise<T | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const req = store.get(key)
      req.onsuccess = () => resolve(req.result as T | undefined)
      req.onerror = () => reject(req.error)
    })
    db.close()
    return result
  } catch (e) {
    console.warn('idbLoadPhotos failed', e)
    return undefined
  }
}

// Back-compat wrappers
export async function idbSavePhotos(data: unknown): Promise<void> {
  return idbSave('photos_v1', data)
}
export async function idbLoadPhotos<T = unknown>(): Promise<T | undefined> {
  return idbLoad<T>('photos_v1')
}

// Rooms wrappers
export async function idbSaveRooms(data: unknown): Promise<void> {
  return idbSave('rooms_v1', data)
}
export async function idbLoadRooms<T = unknown>(): Promise<T | undefined> {
  return idbLoad<T>('rooms_v1')
}
