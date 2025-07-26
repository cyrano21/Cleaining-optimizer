import { Redis } from 'ioredis'

let redis: Redis | null = null

// Configuration Redis
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000
}

// Initialiser Redis seulement en production ou si explicitement activé
if (process.env.NODE_ENV === 'production' || process.env.REDIS_ENABLED === 'true') {
  try {
    redis = new Redis(redisConfig)
    
    redis.on('connect', () => {
      console.log('✅ Redis connected successfully')
    })
    
    redis.on('error', (error) => {
      console.error('❌ Redis connection error:', error)
    })
    
    redis.on('close', () => {
      console.log('🔌 Redis connection closed')
    })
  } catch (error) {
    console.error('❌ Failed to initialize Redis:', error)
    redis = null
  }
}

// Interface pour les options de cache
interface CacheOptions {
  ttl?: number // Time to live en secondes
  prefix?: string
}

// Classe de gestion du cache
export class CacheManager {
  private static instance: CacheManager
  private redis: Redis | null
  private memoryCache: Map<string, { data: any; expires: number }> = new Map()

  constructor() {
    this.redis = redis
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  // Générer une clé de cache avec préfixe
  private generateKey(key: string, prefix?: string): string {
    const appPrefix = process.env.REDIS_KEY_PREFIX || 'ecommerce'
    return `${appPrefix}:${prefix || 'default'}:${key}`
  }

  // Obtenir une valeur du cache
  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    const cacheKey = this.generateKey(key, options.prefix)

    try {
      if (this.redis) {
        const value = await this.redis.get(cacheKey)
        return value ? JSON.parse(value) : null
      } else {
        // Fallback vers le cache mémoire
        const cached = this.memoryCache.get(cacheKey)
        if (cached && cached.expires > Date.now()) {
          return cached.data
        }
        this.memoryCache.delete(cacheKey)
        return null
      }
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  // Définir une valeur dans le cache
  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<boolean> {
    const cacheKey = this.generateKey(key, options.prefix)
    const ttl = options.ttl || 3600 // 1 heure par défaut

    try {
      if (this.redis) {
        await this.redis.setex(cacheKey, ttl, JSON.stringify(value))
        return true
      } else {
        // Fallback vers le cache mémoire
        this.memoryCache.set(cacheKey, {
          data: value,
          expires: Date.now() + (ttl * 1000)
        })
        return true
      }
    } catch (error) {
      console.error('Cache set error:', error)
      return false
    }
  }

  // Supprimer une valeur du cache
  async del(key: string, options: CacheOptions = {}): Promise<boolean> {
    const cacheKey = this.generateKey(key, options.prefix)

    try {
      if (this.redis) {
        await this.redis.del(cacheKey)
        return true
      } else {
        this.memoryCache.delete(cacheKey)
        return true
      }
    } catch (error) {
      console.error('Cache delete error:', error)
      return false
    }
  }

  // Supprimer toutes les clés avec un pattern
  async delPattern(pattern: string, options: CacheOptions = {}): Promise<boolean> {
    const cachePattern = this.generateKey(pattern, options.prefix)

    try {
      if (this.redis) {
        const keys = await this.redis.keys(cachePattern)
        if (keys.length > 0) {
          await this.redis.del(...keys)
        }
        return true
      } else {
        // Pour le cache mémoire, supprimer les clés qui matchent
        const keysToDelete = Array.from(this.memoryCache.keys())
          .filter(key => key.includes(pattern))
        keysToDelete.forEach(key => this.memoryCache.delete(key))
        return true
      }
    } catch (error) {
      console.error('Cache delete pattern error:', error)
      return false
    }
  }

  // Vérifier si Redis est disponible
  isRedisAvailable(): boolean {
    return this.redis !== null && this.redis.status === 'ready'
  }

  // Nettoyer le cache mémoire des entrées expirées
  cleanupMemoryCache(): void {
    const now = Date.now()
    for (const [key, value] of this.memoryCache.entries()) {
      if (value.expires <= now) {
        this.memoryCache.delete(key)
      }
    }
  }

  // Obtenir les statistiques du cache
  async getStats(): Promise<{ redis: boolean; memoryKeys: number; redisInfo?: any }> {
    const stats = {
      redis: this.isRedisAvailable(),
      memoryKeys: this.memoryCache.size,
      redisInfo: undefined as any
    }

    if (this.redis) {
      try {
        stats.redisInfo = await this.redis.info('memory')
      } catch (error) {
        console.error('Error getting Redis stats:', error)
      }
    }

    return stats
  }
}

// Instance singleton du gestionnaire de cache
export const cache = CacheManager.getInstance()

// Fonctions utilitaires pour le cache
export const cacheKeys = {
  stores: (page: number = 1, limit: number = 10) => `stores:list:${page}:${limit}`,
  store: (slug: string) => `store:${slug}`,
  storeProducts: (storeId: string, page: number = 1) => `store:${storeId}:products:${page}`,
  templates: (tier: string) => `templates:${tier}`,
  userSession: (userId: string) => `session:${userId}`,
  analytics: (storeId: string, period: string) => `analytics:${storeId}:${period}`
}

// TTL constants (en secondes)
export const cacheTTL = {
  short: 300,    // 5 minutes
  medium: 1800,  // 30 minutes
  long: 3600,    // 1 heure
  day: 86400,    // 24 heures
  week: 604800   // 7 jours
}

export default redis