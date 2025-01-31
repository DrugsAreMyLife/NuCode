import { ExtensionState } from '../../shared/ExtensionMessage';

interface CacheEntry {
  context: string;
  timestamp: number;
}

export class ModeCache {
  private cache: Map<string, CacheEntry>;
  private maxSizeMB: number;
  private currentSizeMB: number;

  constructor(maxSizeMB: number) {
    this.cache = new Map();
    this.maxSizeMB = maxSizeMB;
    this.currentSizeMB = 0;
  }

  public set(key: string, value: CacheEntry): void {
    const entrySize = this.calculateSize(value);
    
    // If entry is too large, don't cache it
    if (entrySize > this.maxSizeMB) {
      return;
    }

    // Make space if needed
    while (this.currentSizeMB + entrySize > this.maxSizeMB) {
      const oldestKey = this.getOldestKey();
      if (!oldestKey) break;
      this.delete(oldestKey);
    }

    this.cache.set(key, value);
    this.currentSizeMB += entrySize;
  }

  public get(key: string): CacheEntry | undefined {
    return this.cache.get(key);
  }

  public delete(key: string): void {
    const entry = this.cache.get(key);
    if (entry) {
      this.currentSizeMB -= this.calculateSize(entry);
      this.cache.delete(key);
    }
  }

  public clear(): void {
    this.cache.clear();
    this.currentSizeMB = 0;
  }

  public size(): number {
    return this.currentSizeMB;
  }

  private calculateSize(entry: CacheEntry): number {
    // Rough estimation of memory usage in MB
    return Buffer.from(JSON.stringify(entry)).length / (1024 * 1024);
  }

  private getOldestKey(): string | undefined {
    let oldestKey: string | undefined;
    let oldestTime = Date.now();

    for (const [key, value] of this.cache.entries()) {
      if (value.timestamp < oldestTime) {
        oldestTime = value.timestamp;
        oldestKey = key;
      }
    }

    return oldestKey;
  }
}

export class ResourceManager {
  private loadedModels: Set<string>;
  private maxPreloadedModels: number;
  private modeCache: ModeCache;

  constructor(state: Partial<ExtensionState>) {
    this.loadedModels = new Set();
    this.maxPreloadedModels = state.resourceLimits?.preemptiveLoading || 2;
    this.modeCache = new ModeCache(state.resourceLimits?.modeCaching || 100);
  }

  public preloadModel(model: string): boolean {
    // If model is already loaded or we're at capacity
    if (
      this.loadedModels.has(model) ||
      this.loadedModels.size >= this.maxPreloadedModels
    ) {
      return false;
    }

    // In a real implementation, this would actually load the model
    this.loadedModels.add(model);
    return true;
  }

  public unloadModel(model: string): boolean {
    return this.loadedModels.delete(model);
  }

  public isModelLoaded(model: string): boolean {
    return this.loadedModels.has(model);
  }

  public getLoadedModels(): string[] {
    return Array.from(this.loadedModels);
  }

  public getCacheSize(): number {
    return this.modeCache.size();
  }

  public cacheContext(mode: string, context: string): void {
    this.modeCache.set(mode, {
      context,
      timestamp: Date.now()
    });
  }

  public getCachedContext(mode: string): string | undefined {
    const entry = this.modeCache.get(mode);
    return entry?.context;
  }

  public clearCache(): void {
    this.modeCache.clear();
  }

  public optimizeResources(): void {
    // Unload least recently used models if we're over capacity
    while (this.loadedModels.size > this.maxPreloadedModels) {
      const oldestModel = Array.from(this.loadedModels)[0];
      this.unloadModel(oldestModel);
    }

    // Clean up old cache entries
    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 minutes
    for (const mode of ['code', 'frontend', 'backend', 'security']) {
      const entry = this.modeCache.get(mode);
      if (entry && now - entry.timestamp > maxAge) {
        this.modeCache.delete(mode);
      }
    }
  }
}