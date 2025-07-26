import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware de performance pour optimiser les requêtes et monitorer les performances
 */

interface PerformanceMetrics {
  timestamp: number;
  method: string;
  url: string;
  duration: number;
  status: number;
  userAgent?: string;
  ip?: string;
}

// Cache en mémoire pour les métriques (en production, utiliser Redis)
const metricsCache = new Map<string, PerformanceMetrics[]>();
const METRICS_RETENTION = 24 * 60 * 60 * 1000; // 24 heures
const MAX_METRICS_PER_ENDPOINT = 1000;

// Configuration des headers de performance
const PERFORMANCE_HEADERS = {
  // Cache Control optimisé
  'Cache-Control': 'public, max-age=31536000, immutable',
  // Sécurité
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  // Performance
  'X-DNS-Prefetch-Control': 'on',
  'X-Powered-By': 'Next.js Optimized'
};

// Endpoints qui nécessitent un cache agressif
const STATIC_CACHE_PATTERNS = [
  /\/_next\/static\//,
  /\/favicon\.ico$/,
  /\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/
];

// Endpoints API qui nécessitent un cache modéré
const API_CACHE_PATTERNS = [
  /\/api\/products\/featured$/,
  /\/api\/categories$/,
  /\/api\/stores\/public$/
];

// Endpoints qui ne doivent jamais être cachés
const NO_CACHE_PATTERNS = [
  /\/api\/auth\//,
  /\/api\/admin\//,
  /\/api\/user\//,
  /\/api\/orders\//
];

function shouldApplyStaticCache(pathname: string): boolean {
  return STATIC_CACHE_PATTERNS.some(pattern => pattern.test(pathname));
}

function shouldApplyAPICache(pathname: string): boolean {
  return API_CACHE_PATTERNS.some(pattern => pattern.test(pathname));
}

function shouldSkipCache(pathname: string): boolean {
  return NO_CACHE_PATTERNS.some(pattern => pattern.test(pathname));
}

function getOptimizedCacheHeaders(pathname: string, method: string) {
  const headers: Record<string, string> = {};

  if (method !== 'GET') {
    headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    return headers;
  }

  if (shouldSkipCache(pathname)) {
    headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    headers['Pragma'] = 'no-cache';
    headers['Expires'] = '0';
  } else if (shouldApplyStaticCache(pathname)) {
    headers['Cache-Control'] = 'public, max-age=31536000, immutable';
    headers['Expires'] = new Date(Date.now() + 31536000000).toUTCString();
  } else if (shouldApplyAPICache(pathname)) {
    headers['Cache-Control'] = 'public, max-age=300, s-maxage=600'; // 5min client, 10min CDN
    headers['Expires'] = new Date(Date.now() + 300000).toUTCString();
  } else {
    headers['Cache-Control'] = 'public, max-age=60, s-maxage=300'; // 1min client, 5min CDN
  }

  return headers;
}

function recordMetrics(metrics: PerformanceMetrics) {
  const endpoint = `${metrics.method}:${metrics.url}`;
  
  if (!metricsCache.has(endpoint)) {
    metricsCache.set(endpoint, []);
  }
  
  const endpointMetrics = metricsCache.get(endpoint)!;
  
  // Ajouter la nouvelle métrique
  endpointMetrics.push(metrics);
  
  // Limiter le nombre de métriques par endpoint
  if (endpointMetrics.length > MAX_METRICS_PER_ENDPOINT) {
    endpointMetrics.splice(0, endpointMetrics.length - MAX_METRICS_PER_ENDPOINT);
  }
  
  // Nettoyer les anciennes métriques
  const cutoff = Date.now() - METRICS_RETENTION;
  const filteredMetrics = endpointMetrics.filter(m => m.timestamp > cutoff);
  metricsCache.set(endpoint, filteredMetrics);
}

function getPerformanceInsights(endpoint?: string): any {
  if (endpoint) {
    const metrics = metricsCache.get(endpoint) || [];
    if (metrics.length === 0) return null;
    
    const durations = metrics.map(m => m.duration);
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    const min = Math.min(...durations);
    const max = Math.max(...durations);
    const p95 = durations.sort((a, b) => a - b)[Math.floor(durations.length * 0.95)];
    
    return {
      endpoint,
      count: metrics.length,
      avgDuration: Math.round(avg),
      minDuration: min,
      maxDuration: max,
      p95Duration: p95 || 0,
      lastRequest: new Date(Math.max(...metrics.map(m => m.timestamp)))
    };
  }
  
  // Retourner un résumé global
  const allEndpoints = Array.from(metricsCache.keys());
  const insights = allEndpoints.map(ep => getPerformanceInsights(ep)).filter(Boolean);
  
  return {
    totalEndpoints: allEndpoints.length,
    totalRequests: insights.reduce((sum, insight) => sum + (insight?.count || 0), 0),
    slowestEndpoints: insights
      .sort((a, b) => (b?.avgDuration || 0) - (a?.avgDuration || 0))
      .slice(0, 5)
  };
}

export function performanceMiddleware(request: NextRequest) {
  const startTime = Date.now();
  const { pathname, search } = request.nextUrl;
  const method = request.method;
  const userAgent = request.headers.get('user-agent') || undefined;
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';

  // Créer la réponse avec les headers optimisés
  const response = NextResponse.next();
  
  // Appliquer les headers de performance de base
  Object.entries(PERFORMANCE_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // Appliquer les headers de cache optimisés
  const cacheHeaders = getOptimizedCacheHeaders(pathname, method);
  Object.entries(cacheHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // Ajouter des headers de monitoring
  response.headers.set('X-Request-ID', crypto.randomUUID());
  response.headers.set('X-Timestamp', startTime.toString());
  
  // Enregistrer les métriques de manière asynchrone
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  // Utiliser setTimeout pour éviter de bloquer la réponse
  setTimeout(() => {
    recordMetrics({
      timestamp: startTime,
      method,
      url: pathname + search,
      duration,
      status: response.status,
      userAgent,
      ip
    });
  }, 0);
  
  return response;
}

// Fonction pour exposer les métriques (à utiliser dans une API route)
export function getMetrics(endpoint?: string) {
  return getPerformanceInsights(endpoint);
}

// Fonction pour nettoyer les métriques
export function clearMetrics(endpoint?: string) {
  if (endpoint) {
    metricsCache.delete(endpoint);
  } else {
    metricsCache.clear();
  }
}

// Fonction pour optimiser automatiquement les performances
export function autoOptimize() {
  const insights = getPerformanceInsights();
  const recommendations: any[] = [];
  
  if (typeof insights === 'object' && 'slowestEndpoints' in insights) {
    insights.slowestEndpoints?.forEach((endpoint: any) => {
      if (endpoint && endpoint.avgDuration > 1000) {
        recommendations.push({
          endpoint: endpoint.endpoint,
          issue: 'Slow response time',
          avgDuration: endpoint.avgDuration,
          recommendation: 'Consider adding caching or optimizing database queries'
        });
      }
      
      if (endpoint && endpoint.count > 1000) {
        recommendations.push({
          endpoint: endpoint.endpoint,
          issue: 'High traffic',
          requestCount: endpoint.count,
          recommendation: 'Consider implementing rate limiting or load balancing'
        });
      }
    });
  }
  
  return recommendations;
}

export default performanceMiddleware;