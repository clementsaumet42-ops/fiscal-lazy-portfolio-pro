/**
 * IndexedDB-based cache for ISIN validation results
 * Provides persistent storage with TTL support
 */

import { ISINValidationResult } from '@/lib/services/isin-validator'

interface CachedEntry {
  isin: string
  result: ISINValidationResult
  timestamp: number
  ttl: number
}

const DB_NAME = 'ISINValidationCache'
const STORE_NAME = 'validations'
const DB_VERSION = 1
const DEFAULT_TTL_DAYS = 7

/**
 * ISIN Cache using IndexedDB
 */
export class ISINCache {
  private db: IDBDatabase | null = null
  private initPromise: Promise<void> | null = null

  /**
   * Initialize the database
   */
  async init(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise
    }

    this.initPromise = new Promise((resolve, reject) => {
      // Check if IndexedDB is available
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not available'))
        return
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'))
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'isin' })
          objectStore.createIndex('timestamp', 'timestamp', { unique: false })
        }
      }
    })

    return this.initPromise
  }

  /**
   * Get TTL from environment or use default
   */
  private getTTL(): number {
    const ttlDays = process.env.NEXT_PUBLIC_ISIN_CACHE_TTL
      ? parseInt(process.env.NEXT_PUBLIC_ISIN_CACHE_TTL, 10)
      : DEFAULT_TTL_DAYS

    return ttlDays * 24 * 60 * 60 * 1000 // Convert days to milliseconds
  }

  /**
   * Get cached validation result
   */
  async get(isin: string): Promise<ISINValidationResult | null> {
    if (!this.db) {
      await this.init()
    }

    if (!this.db) {
      return null
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly')
      const objectStore = transaction.objectStore(STORE_NAME)
      const request = objectStore.get(isin)

      request.onsuccess = () => {
        const entry = request.result as CachedEntry | undefined

        if (!entry) {
          resolve(null)
          return
        }

        // Check if entry has expired
        const now = Date.now()
        if (now - entry.timestamp > entry.ttl) {
          // Entry expired, delete it
          this.delete(isin).catch(console.error)
          resolve(null)
          return
        }

        resolve(entry.result)
      }

      request.onerror = () => {
        reject(new Error('Failed to read from cache'))
      }
    })
  }

  /**
   * Store validation result in cache
   */
  async set(isin: string, result: ISINValidationResult): Promise<void> {
    if (!this.db) {
      await this.init()
    }

    if (!this.db) {
      throw new Error('Database not initialized')
    }

    const entry: CachedEntry = {
      isin,
      result,
      timestamp: Date.now(),
      ttl: this.getTTL(),
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const objectStore = transaction.objectStore(STORE_NAME)
      const request = objectStore.put(entry)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(new Error('Failed to write to cache'))
      }
    })
  }

  /**
   * Delete a specific entry from cache
   */
  async delete(isin: string): Promise<void> {
    if (!this.db) {
      await this.init()
    }

    if (!this.db) {
      return
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const objectStore = transaction.objectStore(STORE_NAME)
      const request = objectStore.delete(isin)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(new Error('Failed to delete from cache'))
      }
    })
  }

  /**
   * Clear all cached entries
   */
  async clear(): Promise<void> {
    if (!this.db) {
      await this.init()
    }

    if (!this.db) {
      return
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const objectStore = transaction.objectStore(STORE_NAME)
      const request = objectStore.clear()

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(new Error('Failed to clear cache'))
      }
    })
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{ count: number; oldestEntry: number | null }> {
    if (!this.db) {
      await this.init()
    }

    if (!this.db) {
      return { count: 0, oldestEntry: null }
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly')
      const objectStore = transaction.objectStore(STORE_NAME)
      const countRequest = objectStore.count()
      const cursorRequest = objectStore.index('timestamp').openCursor()

      let count = 0
      let oldestEntry: number | null = null

      countRequest.onsuccess = () => {
        count = countRequest.result
      }

      cursorRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor && !oldestEntry) {
          oldestEntry = (cursor.value as CachedEntry).timestamp
        }
      }

      transaction.oncomplete = () => {
        resolve({ count, oldestEntry })
      }

      transaction.onerror = () => {
        reject(new Error('Failed to get cache stats'))
      }
    })
  }

  /**
   * Clean up expired entries
   */
  async cleanExpired(): Promise<number> {
    if (!this.db) {
      await this.init()
    }

    if (!this.db) {
      return 0
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const objectStore = transaction.objectStore(STORE_NAME)
      const request = objectStore.openCursor()

      let deletedCount = 0
      const now = Date.now()

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result

        if (cursor) {
          const entry = cursor.value as CachedEntry

          // Delete if expired
          if (now - entry.timestamp > entry.ttl) {
            cursor.delete()
            deletedCount++
          }

          cursor.continue()
        }
      }

      transaction.oncomplete = () => {
        resolve(deletedCount)
      }

      transaction.onerror = () => {
        reject(new Error('Failed to clean expired entries'))
      }
    })
  }

  /**
   * Close the database connection
   */
  close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
      this.initPromise = null
    }
  }
}
