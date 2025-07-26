import { NextRequest, NextResponse } from 'next/server'
import { cache, cacheKeys, cacheTTL } from '@/lib/redis'

// Interface pour les données mises en cache
interface CachedResponse {
  data: any
  status: number
  timestamp: number
}

// Interface pour les options de cache
interface CacheMiddlewareOptions {
  ttl?: number
  keyGenerator?: (req: NextRequest) => string
  skipCache?: (req: NextRequest) => boolean
  prefix?: string
}

// Middleware de cache pour les API routes
export function withCache(options: CacheMiddlewareOptions = {}) {
  return function cacheMiddleware(
    handler: (req: NextRequest, context?: any) => Promise<NextResponse>
  ) {
    return async function cachedHandler(req: NextRequest, context?: any): Promise<NextResponse> {
      // Vérifier si on doit ignorer le cache
      if (options.skipCache && options.skipCache(req)) {
        return handler(req, context)
      }

      // Générer la clé de cache
      const cacheKey = options.keyGenerator 
        ? options.keyGenerator(req)
        : generateDefaultCacheKey(req)

      // Vérifier le cache seulement pour les requêtes GET
      if (req.method === 'GET') {
        try {
          const cachedResponse = await cache.get<CachedResponse>(cacheKey, { prefix: options.prefix })
          if (cachedResponse) {
            console.log(`🎯 Cache hit for key: ${cacheKey}`)
            return new NextResponse(JSON.stringify(cachedResponse.data), {
              status: cachedResponse.status,
              headers: {
                'Content-Type': 'application/json',
                'X-Cache': 'HIT',
                'X-Cache-Key': cacheKey
              }
            })
          }
        } catch (error) {
          console.error('Cache read error:', error)
        }
      }

      // Exécuter le handler original
      const response = await handler(req, context)

      // Mettre en cache la réponse pour les requêtes GET réussies
      if (req.method === 'GET' && response.status === 200) {
        try {
          const responseData = await response.clone().json()
          const cacheData: CachedResponse = {
            data: responseData,
            status: response.status,
            timestamp: Date.now()
          }

          await cache.set(cacheKey, cacheData, {
            ttl: options.ttl || cacheTTL.medium,
            prefix: options.prefix
          })

          console.log(`💾 Cached response for key: ${cacheKey}`)

          // Ajouter des headers de cache
          const newResponse = new NextResponse(JSON.stringify(responseData), {
            status: response.status,
            headers: {
              'Content-Type': 'application/json',
              'X-Cache': 'MISS',
              'X-Cache-Key': cacheKey
            }
          })

          return newResponse
        } catch (error) {
          console.error('Cache write error:', error)
        }
      }

      return response
    }
  }
}

// Générer une clé de cache par défaut basée sur l'URL et les paramètres
function generateDefaultCacheKey(req: NextRequest): string {
  const url = new URL(req.url)
  const pathname = url.pathname
  const searchParams = url.searchParams
  
  // Trier les paramètres pour une clé cohérente
  const sortedParams = Array.from(searchParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')

  return `${pathname}${sortedParams ? `?${sortedParams}` : ''}`
}

// Middleware spécialisé pour les stores
export const withStoreCache = withCache({
  ttl: cacheTTL.medium,
  prefix: 'stores',
  keyGenerator: (req) => {
    const url = new URL(req.url)
    const page = url.searchParams.get('page') || '1'
    const limit = url.searchParams.get('limit') || '10'
    const search = url.searchParams.get('search') || ''
    const category = url.searchParams.get('category') || ''
    
    return `list:${page}:${limit}:${search}:${category}`
  },
  skipCache: (req) => {
    // Ignorer le cache si l'utilisateur est admin (pour voir les données en temps réel)
    const userRole = req.headers.get('x-user-role')
    return userRole === 'admin' || userRole === 'super-admin'
  }
})

// Middleware spécialisé pour les templates
export const withTemplateCache = withCache({
  ttl: cacheTTL.long,
  prefix: 'templates',
  keyGenerator: (req) => {
    const url = new URL(req.url)
    const tier = url.searchParams.get('tier') || 'all'
    const category = url.searchParams.get('category') || 'all'
    
    return `accessible:${tier}:${category}`
  }
})

// Middleware spécialisé pour les analytics
export const withAnalyticsCache = withCache({
  ttl: cacheTTL.short,
  prefix: 'analytics',
  keyGenerator: (req) => {
    const url = new URL(req.url)
    const storeId = url.pathname.split('/').pop()
    const period = url.searchParams.get('period') || '7d'
    const metric = url.searchParams.get('metric') || 'all'
    
    return `${storeId}:${period}:${metric}`
  }
})

// Fonction utilitaire pour invalider le cache
export async function invalidateCache(pattern: string, prefix?: string): Promise<void> {
  try {
    await cache.delPattern(pattern, { prefix })
    console.log(`🗑️ Cache invalidated for pattern: ${pattern}`)
  } catch (error) {
    console.error('Cache invalidation error:', error)
  }
}

// Fonctions d'invalidation spécialisées
export const cacheInvalidation = {
  stores: () => invalidateCache('*', 'stores'),
  store: (storeId: string) => invalidateCache(`*${storeId}*`, 'stores'),
  templates: () => invalidateCache('*', 'templates'),
  analytics: (storeId: string) => invalidateCache(`${storeId}:*`, 'analytics'),
  user: (userId: string) => invalidateCache(`*${userId}*`, 'users')
}

// Hook pour nettoyer le cache périodiquement
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    cache.cleanupMemoryCache()
  }, 5 * 60 * 1000) // Nettoyer toutes les 5 minutes
}