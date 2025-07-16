const lesson2 = {
  id: '14-2',
  title: 'Optimisation des Performances de Base de Données',
  description:
    'Techniques avancées pour optimiser les performances des requêtes et gérer efficacement les connexions aux bases de données dans Next.js.',
  difficulty: 'avancé',
  duration: 45,
  tags: [
    'Next.js',
    'Base de données',
    'Performance',
    'Optimisation',
    'Mise en cache'
  ],
  prerequisites: ['module14-lesson1'],

  content: {
    theory: `
      <h2>🚀 Optimisation des Performances de Base de Données</h2>
      
      <h3>1. Gestion des Connexions</h3>
      <p>La gestion efficace des connexions est cruciale pour les performances.</p>
      
      <div class="code-example">
        <pre><code>// lib/db-pool.js
import { Pool } from 'pg'

let pool

if (!global.__dbPool) {
  global.__dbPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  })
}

pool = global.__dbPool

export default pool</code></pre>
      </div>
      
      <h3>2. Techniques de Mise en Cache</h3>
      <p>Implémentation de différentes stratégies de cache pour améliorer les performances.</p>
      
      <div class="code-example">
        <pre><code>// lib/cache.js
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

export class CacheManager {
  static async get(key) {
    try {
      const data = await redis.get(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }
  
  static async set(key, data, ttl = 3600) {
    try {
      await redis.setex(key, ttl, JSON.stringify(data))
    } catch (error) {
      console.error('Cache set error:', error)
    }
  }
  
  static async invalidate(pattern) {
    try {
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } catch (error) {
      console.error('Cache invalidation error:', error)
    }
  }
}</code></pre>
      </div>
      
      <h3>3. Optimisation des Requêtes</h3>
      <p>Techniques pour optimiser les requêtes SQL et NoSQL.</p>
      
      <div class="code-example">
        <pre><code>// lib/optimized-queries.js
import prisma from './prisma'

export class OptimizedQueries {
  // Pagination efficace
  static async getPaginatedPosts(page = 1, limit = 10) {
    const skip = (page - 1) * limit
    
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        skip,
        take: limit,
        include: {
          author: {
            select: { id: true, name: true, avatar: true }
          },
          _count: {
            select: { comments: true, likes: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.post.count()
    ])
    
    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }
  
  // Requête avec agrégation
  static async getUserStats(userId) {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            posts: true,
            comments: true,
            followers: true,
            following: true
          }
        }
      }
    })
  }
  
  // Batch loading pour éviter N+1
  static async getPostsWithAuthors(postIds) {
    return await prisma.post.findMany({
      where: {
        id: { in: postIds }
      },
      include: {
        author: true
      }
    })
  }
}</code></pre>
      </div>
      
      <h3>4. Indexation Intelligente</h3>
      <p>Stratégies pour créer des index efficaces.</p>
      
      <div class="code-example">
        <pre><code>// prisma/migrations/add_performance_indexes.sql
-- Index composé pour les requêtes fréquentes
CREATE INDEX idx_posts_author_created 
ON posts(author_id, created_at DESC);

-- Index partiel pour les posts publiés
CREATE INDEX idx_posts_published 
ON posts(created_at DESC) 
WHERE status = 'published';

-- Index pour la recherche textuelle
CREATE INDEX idx_posts_search 
ON posts USING gin(to_tsvector('french', title || ' ' || content));

-- Index pour les requêtes géographiques
CREATE INDEX idx_users_location 
ON users USING gist(location);</code></pre>
      </div>
      
      <h3>5. Monitoring et Analyse</h3>
      <p>Outils pour surveiller les performances des requêtes.</p>
      
      <div class="code-example">
        <pre><code>// lib/db-monitor.js
export class DatabaseMonitor {
  static logSlowQuery(query, duration, params = []) {
    if (duration > 1000) { // Plus d'1 seconde
      console.warn('Slow query detected:', {
        query: query.substring(0, 200),
        duration: \`\${duration}ms\`,
        params: params.length > 0 ? params : 'none',
        timestamp: new Date().toISOString()
      })
    }
  }
  
  static async analyzeQuery(query) {
    const start = Date.now()
    
    try {
      const result = await prisma.$queryRaw\`EXPLAIN ANALYZE \${query}\`
      const duration = Date.now() - start
      
      this.logSlowQuery(query, duration)
      
      return {
        result,
        duration,
        performance: duration < 100 ? 'excellent' : 
                    duration < 500 ? 'good' : 
                    duration < 1000 ? 'fair' : 'poor'
      }
    } catch (error) {
      console.error('Query analysis failed:', error)
      throw error
    }
  }
}</code></pre>
      </div>
    `,

    practicalExample: {
      title: 'Système de Cache Multi-Niveaux',
      code: `// pages/api/posts/optimized.js
import { CacheManager } from '../../../lib/cache'
import { OptimizedQueries } from '../../../lib/optimized-queries'
import { DatabaseMonitor } from '../../../lib/db-monitor'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  const { page = 1, category, search } = req.query
  const cacheKey = \`posts:\${page}:\${category || 'all'}:\${search || 'none'}\`
  
  try {
    // Niveau 1: Cache mémoire
    let posts = await CacheManager.get(cacheKey)
    
    if (!posts) {
      console.log('Cache miss, querying database...')
      const start = Date.now()
      
      // Niveau 2: Base de données optimisée
      if (search) {
        posts = await searchPosts(search, page)
      } else if (category) {
        posts = await getPostsByCategory(category, page)
      } else {
        posts = await OptimizedQueries.getPaginatedPosts(page, 10)
      }
      
      const duration = Date.now() - start
      DatabaseMonitor.logSlowQuery('getPosts', duration, { page, category, search })
      
      // Mise en cache avec TTL adaptatif
      const ttl = posts.posts.length > 0 ? 3600 : 300 // 1h si résultats, 5min sinon
      await CacheManager.set(cacheKey, posts, ttl)
    }
    
    res.status(200).json({
      success: true,
      data: posts,
      cached: !!posts.cached,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Posts API error:', error)
    res.status(500).json({
      error: 'Failed to fetch posts',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

async function searchPosts(query, page) {
  return await prisma.post.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
        { tags: { has: query } }
      ],
      status: 'published'
    },
    include: {
      author: { select: { id: true, name: true, avatar: true } },
      _count: { select: { comments: true, likes: true } }
    },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * 10,
    take: 10
  })
}`,
      explanation:
        'Cet exemple montre un système de cache multi-niveaux avec monitoring des performances et requêtes optimisées.'
    },

    exercise: {
      question:
        'Quelle est la meilleure pratique pour gérer les connexions à la base de données dans Next.js ?',
      options: [
        'Créer une nouvelle connexion pour chaque requête',
        'Utiliser un pool de connexions global',
        'Garder une seule connexion ouverte en permanence',
        'Utiliser des connexions temporaires'
      ],
      correctAnswer: 1,
      explanation:
        'Un pool de connexions global permet de réutiliser les connexions efficacement tout en limitant leur nombre, évitant ainsi les problèmes de performance et de mémoire.'
    },

    quiz: [
      {
        question: "Qu'est-ce qu'un index composé en base de données ?",
        options: [
          'Un index sur une seule colonne',
          'Un index sur plusieurs colonnes',
          'Un index temporaire',
          'Un index automatique'
        ],
        correctAnswer: 1
      },
      {
        question: 'Quelle stratégie de cache a le TTL le plus long ?',
        options: [
          'Cache de session',
          'Cache de requête',
          'Cache statique',
          'Cache temporaire'
        ],
        correctAnswer: 2
      }
    ],

    project: {
      title: "Système d'Optimisation Automatique",
      description:
        'Créez un système qui optimise automatiquement les requêtes et gère le cache intelligemment.',
      initialCode: `// lib/auto-optimizer.js
export class AutoOptimizer {
  constructor() {
    this.queryStats = new Map()
    this.cacheHitRates = new Map()
  }
  
  // À compléter
  async optimizeQuery(query, params) {
    // Votre code ici
  }
  
  // À compléter
  async adaptiveCaching(key, data) {
    // Votre code ici
  }
}`,
      solution: `// lib/auto-optimizer.js
import { CacheManager } from './cache'
import { DatabaseMonitor } from './db-monitor'

export class AutoOptimizer {
  constructor() {
    this.queryStats = new Map()
    this.cacheHitRates = new Map()
    this.performanceThresholds = {
      excellent: 100,
      good: 500,
      fair: 1000
    }
  }
  
  async optimizeQuery(query, params) {
    const queryHash = this.hashQuery(query, params)
    const stats = this.queryStats.get(queryHash) || {
      count: 0,
      totalDuration: 0,
      avgDuration: 0
    }
    
    const start = Date.now()
    
    try {
      // Vérifier si la requête est fréquente et lente
      if (stats.count > 10 && stats.avgDuration > this.performanceThresholds.fair) {
        console.warn(\`Slow query detected: \${queryHash}\`, {
          avgDuration: stats.avgDuration,
          count: stats.count
        })
        
        // Suggérer des optimisations
        this.suggestOptimizations(query, stats)
      }
      
      const result = await this.executeQuery(query, params)
      const duration = Date.now() - start
      
      // Mettre à jour les statistiques
      stats.count += 1
      stats.totalDuration += duration
      stats.avgDuration = stats.totalDuration / stats.count
      this.queryStats.set(queryHash, stats)
      
      DatabaseMonitor.logSlowQuery(query, duration, params)
      
      return result
      
    } catch (error) {
      console.error('Query optimization error:', error)
      throw error
    }
  }
  
  async adaptiveCaching(key, data, options = {}) {
    const hitRate = this.cacheHitRates.get(key) || { hits: 0, misses: 0 }
    
    // Calculer le taux de hit
    const totalRequests = hitRate.hits + hitRate.misses
    const hitRatePercent = totalRequests > 0 ? (hitRate.hits / totalRequests) * 100 : 0
    
    // Adapter le TTL basé sur le taux de hit
    let ttl = options.baseTtl || 3600
    
    if (hitRatePercent > 80) {
      ttl *= 2 // Cache plus longtemps si très utilisé
    } else if (hitRatePercent < 20) {
      ttl /= 2 // Cache moins longtemps si peu utilisé
    }
    
    // Adapter la stratégie de cache
    if (totalRequests > 100 && hitRatePercent > 70) {
      // Utiliser un cache persistant pour les données très demandées
      await this.setPersistentCache(key, data, ttl)
    } else {
      // Cache standard
      await CacheManager.set(key, data, ttl)
    }
    
    console.log(\`Adaptive caching for \${key}:\`, {
      hitRate: \`\${hitRatePercent.toFixed(2)}%\`,
      ttl,
      strategy: hitRatePercent > 70 ? 'persistent' : 'standard'
    })
  }
  
  hashQuery(query, params) {
    return require('crypto')
      .createHash('md5')
      .update(query + JSON.stringify(params))
      .digest('hex')
  }
  
  async executeQuery(query, params) {
    // Simulation d'exécution de requête
    // Dans un vrai projet, utiliser Prisma ou votre ORM
    return { data: 'mock result' }
  }
  
  suggestOptimizations(query, stats) {
    const suggestions = []
    
    if (query.includes('SELECT *')) {
      suggestions.push('Évitez SELECT * - sélectionnez seulement les colonnes nécessaires')
    }
    
    if (!query.includes('LIMIT') && !query.includes('WHERE')) {
      suggestions.push('Ajoutez des clauses WHERE et LIMIT pour limiter les résultats')
    }
    
    if (stats.avgDuration > 2000) {
      suggestions.push('Considérez l\\'ajout d\\'index sur les colonnes utilisées dans WHERE et ORDER BY')
    }
    
    console.log('Optimizations suggérées:', suggestions)
    return suggestions
  }
  
  async setPersistentCache(key, data, ttl) {
    // Implémentation du cache persistant
    await CacheManager.set(\`persistent:\${key}\`, data, ttl * 2)
  }
  
  getCacheHitRate(key) {
    const hitRate = this.cacheHitRates.get(key)
    if (!hitRate) return 0
    
    const total = hitRate.hits + hitRate.misses
    return total > 0 ? (hitRate.hits / total) * 100 : 0
  }
}`
    }
  }
}

export default lesson2
