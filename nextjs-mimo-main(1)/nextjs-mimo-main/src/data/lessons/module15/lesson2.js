const lesson2 = {
  id: '15-2',
  title: 'Optimisation des Performance Avancée',
  description:
    "Techniques avancées d'optimisation des performances : lazy loading, prefetching, analyse de bundle, stratégies de cache et métriques Core Web Vitals.",
  difficulty: 'avancé',
  duration: 50,
  tags: [
    'Next.js',
    'Performance',
    'Core Web Vitals',
    'Bundle Analysis',
    'Caching'
  ],
  prerequisites: ['15-1'],

  content: {
    theory: `
      <h2>🚀 Optimisation des Performances Avancée</h2>
      
      <h3>1. Analyse et Optimisation du Bundle</h3>
      <p>Comprendre et optimiser la taille de votre application pour de meilleures performances.</p>
      
      <div class="code-example">
        <pre><code>// next.config.js - Configuration avancée pour l'analyse
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Analyse du bundle
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Bundle analyzer en développement
    if (!dev && !isServer) {
      config.plugins.push(
        new (require('webpack-bundle-analyzer').BundleAnalyzerPlugin)({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: 'bundle-analysis.html'
        })
      )
    }
    
    // Optimisation des chunks
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all'
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true
          }
        }
      }
    }
    
    return config
  },
  
  // Compression et optimisation
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  
  // Optimisation des images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 an
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  },
  
  // Headers de performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          }
        ]
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig</code></pre>
      </div>
      
      <h3>2. Stratégies de Cache Avancées</h3>
      <p>Implémentation de stratégies de cache sophistiquées pour optimiser les performances.</p>
      
      <div class="code-example">
        <pre><code>// lib/cache-strategies.js
export class CacheManager {
  constructor() {
    this.memoryCache = new Map()
    this.cacheStats = {
      hits: 0,
      misses: 0,
      evictions: 0
    }
  }
  
  // Cache multi-niveaux
  async get(key, options = {}) {
    const { ttl = 300, staleWhileRevalidate = false } = options
    
    // 1. Vérifier le cache mémoire
    const memoryResult = this.getFromMemory(key)
    if (memoryResult && !this.isExpired(memoryResult, ttl)) {
      this.cacheStats.hits++
      return memoryResult.data
    }
    
    // 2. Vérifier le cache Redis/externe
    const externalResult = await this.getFromExternal(key)
    if (externalResult && !this.isExpired(externalResult, ttl)) {
      // Rehydrater le cache mémoire
      this.setInMemory(key, externalResult.data)
      this.cacheStats.hits++
      return externalResult.data
    }
    
    // 3. Stratégie stale-while-revalidate
    if (staleWhileRevalidate && (memoryResult || externalResult)) {
      const staleData = memoryResult?.data || externalResult?.data
      // Retourner les données périmées immédiatement
      setImmediate(() => this.revalidateInBackground(key, options))
      return staleData
    }
    
    this.cacheStats.misses++
    return null
  }
  
  async set(key, data, options = {}) {
    const { ttl = 300, tags = [] } = options
    const cacheEntry = {
      data,
      timestamp: Date.now(),
      ttl,
      tags
    }
    
    // Définir dans tous les niveaux de cache
    this.setInMemory(key, data)
    await this.setInExternal(key, cacheEntry)
    
    return data
  }
  
  // Invalidation par tags
  async invalidateByTag(tag) {
    const keysToInvalidate = []
    
    // Parcourir le cache mémoire
    for (const [key, entry] of this.memoryCache) {
      if (entry.tags && entry.tags.includes(tag)) {
        keysToInvalidate.push(key)
      }
    }
    
    // Invalider les clés
    for (const key of keysToInvalidate) {
      await this.invalidate(key)
    }
    
    this.cacheStats.evictions += keysToInvalidate.length
  }
}

// Hook pour utilisation dans les composants
export function useCache() {
  const cacheManager = new CacheManager()
  
  return {
    get: cacheManager.get.bind(cacheManager),
    set: cacheManager.set.bind(cacheManager),
    invalidate: cacheManager.invalidate.bind(cacheManager),
    stats: cacheManager.cacheStats
  }
}</code></pre>
      </div>
      
      <h3>3. Optimisation des Core Web Vitals</h3>
      <p>Surveillance et amélioration des métriques essentielles de performance web.</p>
      
      <div class="code-example">
        <pre><code>// lib/web-vitals.js
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

export class WebVitalsTracker {
  constructor(options = {}) {
    this.analyticsEndpoint = options.endpoint || '/api/analytics/web-vitals'
    this.sampleRate = options.sampleRate || 1
    this.debug = options.debug || false
    
    this.initializeTracking()
  }
  
  initializeTracking() {
    // Suivre toutes les métriques Core Web Vitals
    getCLS(this.sendMetric.bind(this))
    getFID(this.sendMetric.bind(this))
    getFCP(this.sendMetric.bind(this))
    getLCP(this.sendMetric.bind(this))
    getTTFB(this.sendMetric.bind(this))
    
    // Métriques personnalisées
    this.trackCustomMetrics()
  }
  
  sendMetric(metric) {
    // Échantillonnage pour réduire la charge
    if (Math.random() > this.sampleRate) return
    
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      id: metric.id,
      delta: metric.delta,
      rating: this.getRating(metric),
      navigationType: this.getNavigationType(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      
      // Contexte supplémentaire
      connectionType: this.getConnectionType(),
      deviceMemory: navigator.deviceMemory,
      hardwareConcurrency: navigator.hardwareConcurrency
    })
    
    // Envoi non bloquant
    if ('sendBeacon' in navigator) {
      navigator.sendBeacon(this.analyticsEndpoint, body)
    } else {
      fetch(this.analyticsEndpoint, {
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/json' },
        keepalive: true
      }).catch(err => {
        if (this.debug) console.error('Failed to send metric:', err)
      })
    }
  }
  
  getRating(metric) {
    // Seuils pour les Core Web Vitals
    const thresholds = {
      CLS: [0.1, 0.25],
      FID: [100, 300],
      LCP: [2500, 4000],
      FCP: [1800, 3000],
      TTFB: [800, 1800]
    }
    
    const [good, needsImprovement] = thresholds[metric.name] || [0, 0]
    
    if (metric.value <= good) return 'good'
    if (metric.value <= needsImprovement) return 'needs-improvement'
    return 'poor'
  }
  
  trackCustomMetrics() {
    // Temps de premier rendu d'un composant critique
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'hero-component-render') {
          this.sendMetric({
            name: 'HERO_RENDER',
            value: entry.duration,
            id: \`hero-\${Date.now()}\`
          })
        }
      }
    })
    
    observer.observe({ entryTypes: ['measure'] })
    
    // Surveillance de la mémoire
    if ('memory' in performance) {
      setInterval(() => {
        const memory = performance.memory
        this.sendMetric({
          name: 'MEMORY_USAGE',
          value: memory.usedJSHeapSize / memory.totalJSHeapSize,
          id: \`memory-\${Date.now()}\`
        })
      }, 30000) // Toutes les 30 secondes
    }
  }
}</code></pre>
      </div>
      
      <h3>4. Optimisation des Images et Ressources</h3>
      <p>Techniques avancées pour optimiser le chargement des ressources.</p>
      
      <div class="code-example">
        <pre><code>// components/OptimizedImage.js
import Image from 'next/image'
import { useState, useEffect } from 'react'

export function OptimizedImage({ 
  src, 
  alt, 
  priority = false,
  loading = 'lazy',
  quality = 75,
  placeholder = 'blur',
  ...props 
}) {
  const [imageSrc, setImageSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  
  // Détection du support WebP/AVIF
  const [supportsModernFormats, setSupportsModernFormats] = useState(false)
  
  useEffect(() => {
    const checkModernFormats = async () => {
      const webpSupport = await checkWebPSupport()
      const avifSupport = await checkAVIFSupport()
      setSupportsModernFormats(webpSupport || avifSupport)
    }
    
    checkModernFormats()
  }, [])
  
  // Optimisation adaptative de la qualité
  const getOptimalQuality = () => {
    if (typeof window === 'undefined') return quality
    
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    if (connection) {
      switch (connection.effectiveType) {
        case 'slow-2g':
        case '2g':
          return 30
        case '3g':
          return 50
        default:
          return quality
      }
    }
    return quality
  }
  
  // Gestion des erreurs avec fallback
  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
    
    // Essayer une image de fallback
    if (src !== '/images/placeholder.jpg') {
      setImageSrc('/images/placeholder.jpg')
      setHasError(false)
    }
  }
  
  // Préchargement intelligent
  const shouldPreload = priority || (typeof window !== 'undefined' && 
    window.innerWidth <= 768) // Précharger sur mobile
  
  return (
    <div className="optimized-image-container">
      {isLoading && (
        <div className="image-skeleton" aria-hidden="true">
          <div className="skeleton-shimmer"></div>
        </div>
      )}
      
      <Image
        src={imageSrc}
        alt={alt}
        quality={getOptimalQuality()}
        priority={shouldPreload}
        loading={loading}
        placeholder={placeholder}
        onLoad={() => setIsLoading(false)}
        onError={handleError}
        {...props}
      />
      
      {hasError && (
        <div className="image-error" role="img" aria-label={alt}>
          <span>Image non disponible</span>
        </div>
      )}
      
      <style jsx>{\`
        .optimized-image-container {
          position: relative;
          overflow: hidden;
        }
        
        .image-skeleton {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        .image-error {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f5f5;
          color: #666;
          min-height: 200px;
        }
      \`}</style>
    </div>
  )
}

// Utilitaires de détection de support
async function checkWebPSupport() {
  return new Promise((resolve) => {
    const webP = new Image()
    webP.onload = webP.onerror = () => resolve(webP.height === 2)
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
  })
}

async function checkAVIFSupport() {
  return new Promise((resolve) => {
    const avif = new Image()
    avif.onload = avif.onerror = () => resolve(avif.height === 2)
    avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A='
  })
}</code></pre>
      </div>
      
      <h3>5. Optimisation du Prefetching et Lazy Loading</h3>
      <p>Stratégies intelligentes de chargement des ressources.</p>
      
      <div class="code-example">
        <pre><code>// hooks/useIntelligentPrefetch.js
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'

export function useIntelligentPrefetch() {
  const router = useRouter()
  const [prefetchedUrls, setPrefetchedUrls] = useState(new Set())
  const intersectionObserver = useRef(null)
  const idleCallback = useRef(null)
  
  useEffect(() => {
    // Configuration de l'Intersection Observer pour le prefetch
    intersectionObserver.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const link = entry.target
            const href = link.getAttribute('href')
            
            if (href && !prefetchedUrls.has(href)) {
              // Prefetch pendant les périodes d'inactivité
              scheduleIdlePrefetch(href)
            }
          }
        })
      },
      {
        rootMargin: '200px', // Précharger 200px avant d'être visible
        threshold: 0.1
      }
    )
    
    // Observer tous les liens internes
    const links = document.querySelectorAll('a[href^="/"]')
    links.forEach(link => {
      intersectionObserver.current.observe(link)
    })
    
    return () => {
      if (intersectionObserver.current) {
        intersectionObserver.current.disconnect()
      }
      if (idleCallback.current) {
        cancelIdleCallback(idleCallback.current)
      }
    }
  }, [prefetchedUrls])
  
  const scheduleIdlePrefetch = (href) => {
    // Vérifier les conditions avant de précharger
    if (!shouldPrefetch()) return
    
    idleCallback.current = requestIdleCallback(
      () => {
        router.prefetch(href)
        setPrefetchedUrls(prev => new Set([...prev, href]))
      },
      { timeout: 2000 }
    )
  }
  
  const shouldPrefetch = () => {
    // Ne pas précharger sur des connexions lentes
    const connection = navigator.connection || navigator.mozConnection
    if (connection) {
      if (connection.saveData || connection.effectiveType === 'slow-2g') {
        return false
      }
    }
    
    // Ne pas précharger si la batterie est faible
    if ('getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        return battery.level > 0.2 && !battery.charging
      })
    }
    
    // Ne pas précharger si trop de prefetch déjà effectués
    return prefetchedUrls.size < 10
  }
  
  return {
    prefetchedUrls: Array.from(prefetchedUrls),
    forcePrefetch: (url) => {
      router.prefetch(url)
      setPrefetchedUrls(prev => new Set([...prev, url]))
    }
  }
}

// Hook pour le lazy loading avancé
export function useAdvancedLazyLoading(threshold = 0.1, rootMargin = '50px') {
  const [isVisible, setIsVisible] = useState(false)
  const [hasBeenVisible, setHasBeenVisible] = useState(false)
  const elementRef = useRef(null)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          setHasBeenVisible(true)
          
          // Une fois visible, arrêter d'observer
          if (elementRef.current) {
            observer.unobserve(elementRef.current)
          }
        }
      },
      { threshold, rootMargin }
    )
    
    if (elementRef.current) {
      observer.observe(elementRef.current)
    }
    
    return () => observer.disconnect()
  }, [threshold, rootMargin])
  
  return {
    elementRef,
    isVisible,
    hasBeenVisible,
    shouldLoad: hasBeenVisible
  }
}</code></pre>
      </div>
    `,

    practicalExample: `
      <h3>💡 Exemple Pratique : Système d'Optimisation Complet</h3>
      
      <div class="code-example">
        <pre><code>// pages/_app.js - Configuration globale des performances
import { useEffect } from 'react'
import { WebVitalsTracker } from '../lib/web-vitals'
import { CacheManager } from '../lib/cache-strategies'

// Initialisation du tracker de performance
const webVitalsTracker = new WebVitalsTracker({
  endpoint: '/api/analytics/web-vitals',
  sampleRate: 0.1, // 10% des utilisateurs
  debug: process.env.NODE_ENV === 'development'
})

// Initialisation du gestionnaire de cache
const cacheManager = new CacheManager()

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Optimisation du chargement des polyfills
    loadPolyfillsIfNeeded()
    
    // Configuration du service worker pour le cache
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
    }
    
    // Préchargement des ressources critiques
    preloadCriticalResources()
  }, [])
  
  return (
    <>
      {/* Optimisation du chargement des fontes */}
      <link
        rel="preconnect"
        href="https://fonts.googleapis.com"
        crossOrigin="anonymous"
      />
      <link
        rel="preload"
        href="/fonts/inter-var.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      
      <Component {...pageProps} />
    </>
  )
}

async function loadPolyfillsIfNeeded() {
  const polyfills = []
  
  // Vérifier le support d'IntersectionObserver
  if (!window.IntersectionObserver) {
    polyfills.push(import('intersection-observer'))
  }
  
  // Vérifier le support de ResizeObserver
  if (!window.ResizeObserver) {
    polyfills.push(import('@juggle/resize-observer'))
  }
  
  // Charger les polyfills en parallèle
  await Promise.all(polyfills)
}

function preloadCriticalResources() {
  // Précharger les images critiques
  const criticalImages = [
    '/images/hero-bg.webp',
    '/images/logo.svg'
  ]
  
  criticalImages.forEach(src => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = src
    document.head.appendChild(link)
  })
}</code></pre>
      </div>
    `,

    interactiveExercise: {
      type: 'code-challenge',
      title: 'Défi : Optimiseur de Performance Automatique',
      description:
        'Créez un système qui analyse automatiquement les performances et applique des optimisations.',

      starterCode: `// lib/performance-optimizer.js
export class PerformanceOptimizer {
  constructor() {
    this.metrics = new Map()
    this.optimizations = new Map()
  }
  
  // TODO: Implémenter l'analyse des métriques
  analyzeMetrics(metric) {
    // Votre code ici
  }
  
  // TODO: Implémenter les optimisations automatiques
  applyOptimizations() {
    // Votre code ici
  }
  
  // TODO: Implémenter la surveillance continue
  startMonitoring() {
    // Votre code ici
  }
}`,

      solution: `// lib/performance-optimizer.js
export class PerformanceOptimizer {
  constructor() {
    this.metrics = new Map()
    this.optimizations = new Map()
    this.thresholds = {
      LCP: 2500,
      FID: 100,
      CLS: 0.1,
      TTFB: 800
    }
  }
  
  analyzeMetrics(metric) {
    this.metrics.set(metric.name, metric)
    
    // Analyser et suggérer des optimisations
    switch (metric.name) {
      case 'LCP':
        if (metric.value > this.thresholds.LCP) {
          this.optimizations.set('lcp', {
            type: 'image-optimization',
            suggestion: 'Optimiser les images above-the-fold',
            priority: 'high'
          })
        }
        break
        
      case 'FID':
        if (metric.value > this.thresholds.FID) {
          this.optimizations.set('fid', {
            type: 'js-optimization',
            suggestion: 'Réduire le JavaScript bloquant',
            priority: 'medium'
          })
        }
        break
        
      case 'CLS':
        if (metric.value > this.thresholds.CLS) {
          this.optimizations.set('cls', {
            type: 'layout-stability',
            suggestion: 'Définir les dimensions des éléments',
            priority: 'high'
          })
        }
        break
    }
  }
  
  applyOptimizations() {
    for (const [key, optimization] of this.optimizations) {
      switch (optimization.type) {
        case 'image-optimization':
          this.optimizeImages()
          break
        case 'js-optimization':
          this.optimizeJavaScript()
          break
        case 'layout-stability':
          this.improveLayoutStability()
          break
      }
    }
  }
  
  startMonitoring() {
    // Surveillance continue des métriques
    setInterval(() => {
      this.collectMetrics()
      this.analyzePerformanceTrends()
      this.autoOptimize()
    }, 30000)
  }
  
  optimizeImages() {
    // Optimisation automatique des images
    const images = document.querySelectorAll('img[data-optimize]')
    images.forEach(img => {
      if (!img.loading) img.loading = 'lazy'
      if (!img.decoding) img.decoding = 'async'
    })
  }
  
  optimizeJavaScript() {
    // Différer les scripts non critiques
    const scripts = document.querySelectorAll('script[data-non-critical]')
    scripts.forEach(script => {
      script.defer = true
    })
  }
  
  improveLayoutStability() {
    // Ajouter des placeholders pour éviter les shifts
    const dynamicElements = document.querySelectorAll('[data-dynamic]')
    dynamicElements.forEach(el => {
      if (!el.style.minHeight) {
        el.style.minHeight = '200px'
      }
    })
  }
}`
    },

    quiz: {
      title: 'Quiz : Optimisation des Performances Avancée',
      questions: [
        {
          id: 1,
          question:
            'Quelle est la meilleure stratégie pour optimiser le LCP (Largest Contentful Paint) ?',
          options: [
            'Réduire le JavaScript',
            'Optimiser les images et précharger les ressources critiques',
            'Minifier le CSS',
            'Utiliser un CDN'
          ],
          correct: 1,
          explanation:
            "Le LCP est principalement impacté par les images et ressources critiques above-the-fold. L'optimisation des images et le préchargement des ressources critiques sont les leviers les plus efficaces."
        },
        {
          id: 2,
          question:
            'Que signifie "stale-while-revalidate" dans une stratégie de cache ?',
          options: [
            'Servir du contenu périmé pendant la revalidation en arrière-plan',
            'Invalider immédiatement le cache périmé',
            'Ne jamais servir de contenu périmé',
            'Revalider uniquement sur demande utilisateur'
          ],
          correct: 0,
          explanation:
            'La stratégie "stale-while-revalidate" permet de servir immédiatement du contenu périmé à l\'utilisateur tout en revalidant les données en arrière-plan pour les prochaines requêtes.'
        },
        {
          id: 3,
          question: "Quel est l'avantage principal du bundle splitting ?",
          options: [
            'Réduire la taille totale du code',
            'Permettre le cache granulaire et le chargement parallèle',
            'Améliorer la sécurité',
            'Simplifier le débogage'
          ],
          correct: 1,
          explanation:
            'Le bundle splitting permet de créer des chunks séparés qui peuvent être mis en cache individuellement et chargés en parallèle, améliorant les performances de chargement.'
        }
      ]
    },

    practicalProject: {
      title: 'Projet : Dashboard de Performance en Temps Réel',
      description:
        'Créez un dashboard qui surveille et optimise automatiquement les performances de votre application.',

      requirements: [
        'Surveillance des Core Web Vitals en temps réel',
        'Analyse automatique des bottlenecks',
        "Suggestions d'optimisation contextuelles",
        'Graphiques de tendances de performance',
        'Alertes automatiques en cas de dégradation'
      ],

      hints: [
        'Utilisez Chart.js ou D3.js pour les visualisations',
        'Implémentez un système de notifications push',
        'Créez des seuils configurables pour les alertes',
        'Ajoutez des comparaisons avant/après optimisation'
      ]
    }
  }
}

export default lesson2
