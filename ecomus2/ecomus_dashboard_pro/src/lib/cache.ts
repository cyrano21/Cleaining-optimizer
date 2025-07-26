/**
 * Système de cache performant et flexible
 * Supporte différentes stratégies de cache et backends
 */

import { logger } from './logger';

// ============================================================================
// TYPES ET INTERFACES
// ============================================================================

export interface CacheOptions {
  ttl?: number; // Time to live en millisecondes
  maxSize?: number; // Taille maximale du cache
  strategy?: CacheStrategy;
  serialize?: boolean; // Sérialiser les valeurs complexes
  namespace?: string; // Namespace pour éviter les collisions
}

export interface CacheEntry<T = any> {
  value: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  size: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  evictions: number;
  size: number;
  maxSize: number;
  hitRate: number;
}

export enum CacheStrategy {
  LRU = 'LRU', // Least Recently Used
  LFU = 'LFU', // Least Frequently Used
  FIFO = 'FIFO', // First In First Out
  TTL = 'TTL' // Time To Live only
}

export interface CacheBackend {
  get<T>(key: string): Promise<T | null> | T | null;
  set<T>(key: string, value: T, ttl?: number): Promise<void> | void;
  delete(key: string): Promise<boolean> | boolean;
  clear(): Promise<void> | void;
  has(key: string): Promise<boolean> | boolean;
  keys(): Promise<string[]> | string[];
}

// ============================================================================
// BACKENDS DE CACHE
// ============================================================================

/**
 * Backend de cache en mémoire
 */
export class MemoryBackend implements CacheBackend {
  private store = new Map<string, CacheEntry>();
  private timers = new Map<string, NodeJS.Timeout>();

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    // Vérifier l'expiration
    if (this.isExpired(entry)) {
      this.delete(key);
      return null;
    }

    // Mettre à jour les statistiques d'accès
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    return entry.value;
  }

  set<T>(key: string, value: T, ttl?: number): void {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      value,
      timestamp: now,
      ttl: ttl || 0,
      accessCount: 0,
      lastAccessed: now,
      size: this.calculateSize(value)
    };

    this.store.set(key, entry);

    // Configurer l'expiration automatique
    if (ttl && ttl > 0) {
      this.clearTimer(key);
      const timer = setTimeout(() => {
        this.delete(key);
      }, ttl);
      this.timers.set(key, timer);
    }
  }

  delete(key: string): boolean {
    this.clearTimer(key);
    return this.store.delete(key);
  }

  clear(): void {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    this.store.clear();
  }

  has(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;
    
    if (this.isExpired(entry)) {
      this.delete(key);
      return false;
    }
    
    return true;
  }

  keys(): string[] {
    return Array.from(this.store.keys());
  }

  getEntry(key: string): CacheEntry | undefined {
    return this.store.get(key);
  }

  getAllEntries(): Map<string, CacheEntry> {
    return new Map(this.store);
  }

  private isExpired(entry: CacheEntry): boolean {
    if (entry.ttl <= 0) return false;
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private clearTimer(key: string): void {
    const timer = this.timers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(key);
    }
  }

  private calculateSize(value: any): number {
    if (typeof value === 'string') return value.length * 2;
    if (typeof value === 'number') return 8;
    if (typeof value === 'boolean') return 4;
    if (value === null || value === undefined) return 0;
    
    try {
      return JSON.stringify(value).length * 2;
    } catch {
      return 100; // Estimation pour les objets non sérialisables
    }
  }
}

/**
 * Backend de cache utilisant localStorage
 */
export class LocalStorageBackend implements CacheBackend {
  private prefix: string;

  constructor(prefix = 'cache_') {
    this.prefix = prefix;
  }

  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) return null;

      const entry: CacheEntry<T> = JSON.parse(item);
      
      // Vérifier l'expiration
      if (this.isExpired(entry)) {
        this.delete(key);
        return null;
      }

      // Mettre à jour les statistiques d'accès
      entry.accessCount++;
      entry.lastAccessed = Date.now();
      localStorage.setItem(this.prefix + key, JSON.stringify(entry));

      return entry.value;
    } catch (error) {
      logger.warn('Erreur lors de la lecture du cache localStorage', { key, error });
      return null;
    }
  }

  set<T>(key: string, value: T, ttl?: number): void {
    if (typeof window === 'undefined') return;
    
    try {
      const now = Date.now();
      const entry: CacheEntry<T> = {
        value,
        timestamp: now,
        ttl: ttl || 0,
        accessCount: 0,
        lastAccessed: now,
        size: 0
      };

      localStorage.setItem(this.prefix + key, JSON.stringify(entry));
    } catch (error) {
      logger.warn('Erreur lors de l\'écriture du cache localStorage', { key, error });
    }
  }

  delete(key: string): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      localStorage.removeItem(this.prefix + key);
      return true;
    } catch (error) {
      logger.warn('Erreur lors de la suppression du cache localStorage', { key, error });
      return false;
    }
  }

  clear(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const keys = this.keys();
      keys.forEach(key => this.delete(key));
    } catch (error) {
      logger.warn('Erreur lors du nettoyage du cache localStorage', { error });
    }
  }

  has(key: string): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) return false;

      const entry: CacheEntry = JSON.parse(item);
      if (this.isExpired(entry)) {
        this.delete(key);
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  keys(): string[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keys.push(key.substring(this.prefix.length));
        }
      }
      return keys;
    } catch {
      return [];
    }
  }

  private isExpired(entry: CacheEntry): boolean {
    if (entry.ttl <= 0) return false;
    return Date.now() - entry.timestamp > entry.ttl;
  }
}

// ============================================================================
// GESTIONNAIRE DE CACHE PRINCIPAL
// ============================================================================

export class CacheManager {
  private backend: CacheBackend;
  private options: Required<CacheOptions>;
  private stats: CacheStats;

  constructor(
    backend: CacheBackend = new MemoryBackend(),
    options: CacheOptions = {}
  ) {
    this.backend = backend;
    this.options = {
      ttl: options.ttl || 300000, // 5 minutes par défaut
      maxSize: options.maxSize || 1000,
      strategy: options.strategy || CacheStrategy.LRU,
      serialize: options.serialize ?? true,
      namespace: options.namespace || 'default'
    };
    
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      size: 0,
      maxSize: this.options.maxSize,
      hitRate: 0
    };

    // Nettoyage périodique
    this.startCleanupInterval();
  }

  /**
   * Récupère une valeur du cache
   */
  async get<T>(key: string): Promise<T | null> {
    const namespacedKey = this.getNamespacedKey(key);
    
    try {
      const value = await this.backend.get<T>(namespacedKey);
      
      if (value !== null) {
        this.stats.hits++;
        this.updateHitRate();
        return value;
      } else {
        this.stats.misses++;
        this.updateHitRate();
        return null;
      }
    } catch (error) {
      logger.warn('Erreur lors de la récupération du cache', { key, error });
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }
  }

  /**
   * Stocke une valeur dans le cache
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const namespacedKey = this.getNamespacedKey(key);
    const effectiveTtl = ttl || this.options.ttl;
    
    try {
      // Vérifier si on doit faire de l'éviction
      await this.evictIfNecessary();
      
      await this.backend.set(namespacedKey, value, effectiveTtl);
      this.stats.sets++;
      this.stats.size++;
    } catch (error) {
      logger.warn('Erreur lors du stockage en cache', { key, error });
    }
  }

  /**
   * Supprime une valeur du cache
   */
  async delete(key: string): Promise<boolean> {
    const namespacedKey = this.getNamespacedKey(key);
    
    try {
      const deleted = await this.backend.delete(namespacedKey);
      if (deleted) {
        this.stats.deletes++;
        this.stats.size = Math.max(0, this.stats.size - 1);
      }
      return deleted;
    } catch (error) {
      logger.warn('Erreur lors de la suppression du cache', { key, error });
      return false;
    }
  }

  /**
   * Vide complètement le cache
   */
  async clear(): Promise<void> {
    try {
      await this.backend.clear();
      this.stats.size = 0;
    } catch (error) {
      logger.warn('Erreur lors du nettoyage du cache', { error });
    }
  }

  /**
   * Vérifie si une clé existe dans le cache
   */
  async has(key: string): Promise<boolean> {
    const namespacedKey = this.getNamespacedKey(key);
    
    try {
      return await this.backend.has(namespacedKey);
    } catch (error) {
      logger.warn('Erreur lors de la vérification du cache', { key, error });
      return false;
    }
  }

  /**
   * Récupère ou calcule une valeur (pattern cache-aside)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T> | T,
    ttl?: number
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, ttl);
    return value;
  }

  /**
   * Récupère plusieurs valeurs en une fois
   */
  async mget<T>(keys: string[]): Promise<Map<string, T | null>> {
    const results = new Map<string, T | null>();
    
    await Promise.all(
      keys.map(async (key) => {
        const value = await this.get<T>(key);
        results.set(key, value);
      })
    );
    
    return results;
  }

  /**
   * Stocke plusieurs valeurs en une fois
   */
  async mset<T>(entries: Map<string, T>, ttl?: number): Promise<void> {
    await Promise.all(
      Array.from(entries.entries()).map(([key, value]) =>
        this.set(key, value, ttl)
      )
    );
  }

  /**
   * Récupère les statistiques du cache
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Remet à zéro les statistiques
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      size: this.stats.size,
      maxSize: this.options.maxSize,
      hitRate: 0
    };
  }

  /**
   * Met à jour les options du cache
   */
  updateOptions(newOptions: Partial<CacheOptions>): void {
    this.options = { ...this.options, ...newOptions };
    this.stats.maxSize = this.options.maxSize;
  }

  private getNamespacedKey(key: string): string {
    return `${this.options.namespace}:${key}`;
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  private async evictIfNecessary(): Promise<void> {
    if (this.stats.size < this.options.maxSize) return;

    try {
      const keys = await this.backend.keys();
      const namespacedKeys = keys.filter(key => 
        key.startsWith(this.options.namespace + ':')
      );

      if (namespacedKeys.length === 0) return;

      let keyToEvict: string;

      switch (this.options.strategy) {
        case CacheStrategy.LRU:
          keyToEvict = await this.findLRUKey(namespacedKeys);
          break;
        case CacheStrategy.LFU:
          keyToEvict = await this.findLFUKey(namespacedKeys);
          break;
        case CacheStrategy.FIFO:
          keyToEvict = await this.findFIFOKey(namespacedKeys);
          break;
        default:
          keyToEvict = namespacedKeys[0];
      }

      await this.backend.delete(keyToEvict);
      this.stats.evictions++;
      this.stats.size--;
    } catch (error) {
      logger.warn('Erreur lors de l\'éviction du cache', { error });
    }
  }

  private async findLRUKey(keys: string[]): Promise<string> {
    if (!(this.backend instanceof MemoryBackend)) {
      return keys[0]; // Fallback pour les autres backends
    }

    let oldestKey = keys[0];
    let oldestTime = Infinity;

    for (const key of keys) {
      const entry = this.backend.getEntry(key);
      if (entry && entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  private async findLFUKey(keys: string[]): Promise<string> {
    if (!(this.backend instanceof MemoryBackend)) {
      return keys[0]; // Fallback pour les autres backends
    }

    let leastUsedKey = keys[0];
    let leastCount = Infinity;

    for (const key of keys) {
      const entry = this.backend.getEntry(key);
      if (entry && entry.accessCount < leastCount) {
        leastCount = entry.accessCount;
        leastUsedKey = key;
      }
    }

    return leastUsedKey;
  }

  private async findFIFOKey(keys: string[]): Promise<string> {
    if (!(this.backend instanceof MemoryBackend)) {
      return keys[0]; // Fallback pour les autres backends
    }

    let oldestKey = keys[0];
    let oldestTime = Infinity;

    for (const key of keys) {
      const entry = this.backend.getEntry(key);
      if (entry && entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  private startCleanupInterval(): void {
    // Nettoyage toutes les 5 minutes
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  private async cleanup(): Promise<void> {
    try {
      const keys = await this.backend.keys();
      const namespacedKeys = keys.filter(key => 
        key.startsWith(this.options.namespace + ':')
      );

      for (const key of namespacedKeys) {
        // Vérifier si la clé existe encore (cela déclenchera la suppression si expirée)
        await this.backend.has(key);
      }
    } catch (error) {
      logger.warn('Erreur lors du nettoyage automatique du cache', { error });
    }
  }
}

// ============================================================================
// INSTANCES GLOBALES
// ============================================================================

// Cache en mémoire par défaut
export const memoryCache = new CacheManager(new MemoryBackend(), {
  ttl: 300000, // 5 minutes
  maxSize: 1000,
  strategy: CacheStrategy.LRU,
  namespace: 'memory'
});

// Cache localStorage pour la persistance
export const persistentCache = new CacheManager(new LocalStorageBackend(), {
  ttl: 3600000, // 1 heure
  maxSize: 500,
  strategy: CacheStrategy.LRU,
  namespace: 'persistent'
});

// ============================================================================
// DÉCORATEURS ET UTILITAIRES
// ============================================================================

/**
 * Décorateur pour mettre en cache le résultat d'une méthode
 */
export function cached(
  cache: CacheManager = memoryCache,
  ttl?: number,
  keyGenerator?: (...args: any[]) => string
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const key = keyGenerator 
        ? keyGenerator(...args)
        : `${target.constructor.name}.${propertyKey}:${JSON.stringify(args)}`;

      return cache.getOrSet(key, () => originalMethod.apply(this, args), ttl);
    };

    return descriptor;
  };
}

/**
 * Fonction utilitaire pour créer une version mise en cache d'une fonction
 */
export function withCache<T extends (...args: any[]) => any>(
  fn: T,
  cache: CacheManager = memoryCache,
  ttl?: number,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  return (async (...args: Parameters<T>) => {
    const key = keyGenerator 
      ? keyGenerator(...args)
      : `${fn.name}:${JSON.stringify(args)}`;

    return cache.getOrSet(key, () => fn(...args), ttl);
  }) as T;
}

/**
 * Invalidation de cache basée sur des tags
 */
export class TaggedCache {
  private cache: CacheManager;
  private tagMap = new Map<string, Set<string>>();

  constructor(cache: CacheManager = memoryCache) {
    this.cache = cache;
  }

  async set<T>(key: string, value: T, tags: string[] = [], ttl?: number): Promise<void> {
    await this.cache.set(key, value, ttl);
    
    // Associer les tags à la clé
    for (const tag of tags) {
      if (!this.tagMap.has(tag)) {
        this.tagMap.set(tag, new Set());
      }
      this.tagMap.get(tag)!.add(key);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    return this.cache.get<T>(key);
  }

  async invalidateByTag(tag: string): Promise<void> {
    const keys = this.tagMap.get(tag);
    if (!keys) return;

    await Promise.all(
      Array.from(keys).map(key => this.cache.delete(key))
    );

    // Nettoyer les références
    this.tagMap.delete(tag);
    for (const [otherTag, otherKeys] of this.tagMap) {
      for (const key of keys) {
        otherKeys.delete(key);
      }
    }
  }

  async invalidateByTags(tags: string[]): Promise<void> {
    await Promise.all(tags.map(tag => this.invalidateByTag(tag)));
  }
}

export const taggedCache = new TaggedCache(memoryCache);