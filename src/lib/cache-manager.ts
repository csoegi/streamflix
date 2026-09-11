// /lib/cache-manager.ts
class CacheManager {
  // Metadata Cache
  private metadataCache = new Map<string, { value: any; expiry: number }>();
  private metadataKeyOrder: string[] = [];
  private readonly METADATA_MAX = 5000;
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes
  // Grid Cache
  private gridCache = new Map<string, any>();
  private gridKeyOrder: string[] = [];
  private readonly GRID_MAX = 1000;

  private globalVersion = 1;

  // --- METADATA (TTL + FIFO) ---
  public setMetadata(key: string, value: any, ttl = this.CACHE_TTL) {
    const finalKey = `${this.globalVersion}_${key}`;
    
    if (this.metadataCache.size >= this.METADATA_MAX) {
      const oldestKey = this.metadataKeyOrder.shift();
      if (oldestKey) this.metadataCache.delete(oldestKey);
    }

    if (this.metadataCache.has(finalKey)) {
      this.metadataCache.delete(finalKey);
    }

    this.metadataCache.set(finalKey, { value, expiry: Date.now() + ttl });
    this.metadataKeyOrder.push(finalKey);
  }

  public getMetadata<T = any>(key: string): T | null {
    const finalKey = `${this.globalVersion}_${key}`;
    const item = this.metadataCache.get(finalKey);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.metadataCache.delete(finalKey);
      return null;
    }
    return item.value as T;
  }

  // --- GRID (SWR + FIFO) ---
  public setGrid(key: string, value: any) {
    const finalKey = `${this.globalVersion}_${key}`;
    
    if (this.gridCache.size >= this.GRID_MAX) {
      const oldestKey = this.gridKeyOrder.shift();
      if (oldestKey) this.gridCache.delete(oldestKey);
    }

    if (this.gridCache.has(finalKey)) {
      this.gridCache.delete(finalKey);
    }

    this.gridCache.set(finalKey, value);
    this.gridKeyOrder.push(finalKey);
  }

  public getGrid<T = any>(key: string): T | null {
    const finalKey = `${this.globalVersion}_${key}`;
    return (this.gridCache.get(finalKey) as T) || null;
  }

  public clearAll() {
    this.globalVersion++; 
    this.metadataCache.clear();
    this.gridCache.clear();
    this.metadataKeyOrder = [];
    this.gridKeyOrder = [];
  }
}

export const cacheManager = new CacheManager();
