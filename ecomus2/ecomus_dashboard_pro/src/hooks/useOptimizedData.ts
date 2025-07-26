'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseOptimizedDataOptions<T> {
  // URL ou fonction pour récupérer les données
  fetcher: () => Promise<T>;
  // Clé unique pour le cache
  key: string;
  // Durée de vie du cache en millisecondes (défaut: 5 minutes)
  cacheTTL?: number;
  // Nombre de tentatives en cas d'échec (défaut: 3)
  retryAttempts?: number;
  // Délai entre les tentatives en millisecondes (défaut: 1000)
  retryDelay?: number;
  // Données initiales
  initialData?: T;
  // Désactiver le cache
  disableCache?: boolean;
  // Revalidation automatique en arrière-plan
  revalidateOnFocus?: boolean;
  // Intervalle de revalidation automatique
  revalidateInterval?: number;
}

interface UseOptimizedDataReturn<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  mutate: (newData: T) => void;
  clearCache: () => void;
}

// Cache global pour partager les données entre les composants
const globalCache = new Map<string, {
  data: any;
  timestamp: number;
  ttl: number;
}>();

// Gestionnaire de requêtes en cours pour éviter les doublons
const ongoingRequests = new Map<string, Promise<any>>();

/**
 * Hook optimisé pour la gestion des données avec cache, retry et revalidation
 * Améliore les performances en évitant les requêtes redondantes
 */
export function useOptimizedData<T>(
  options: UseOptimizedDataOptions<T>
): UseOptimizedDataReturn<T> {
  const {
    fetcher,
    key,
    cacheTTL = 5 * 60 * 1000, // 5 minutes
    retryAttempts = 3,
    retryDelay = 1000,
    initialData,
    disableCache = false,
    revalidateOnFocus = true,
    revalidateInterval
  } = options;

  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);
  const revalidateTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Vérifier si les données sont en cache et valides
  const getCachedData = useCallback((): T | null => {
    if (disableCache) return null;
    
    const cached = globalCache.get(key);
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > cached.ttl;
    if (isExpired) {
      globalCache.delete(key);
      return null;
    }
    
    return cached.data;
  }, [key, disableCache]);

  // Mettre en cache les données
  const setCachedData = useCallback((newData: T) => {
    if (disableCache) return;
    
    globalCache.set(key, {
      data: newData,
      timestamp: Date.now(),
      ttl: cacheTTL
    });
  }, [key, cacheTTL, disableCache]);

  // Fonction de récupération avec retry
  const fetchWithRetry = useCallback(async (attempt = 1): Promise<T> => {
    try {
      const result = await fetcher();
      return result;
    } catch (err) {
      if (attempt < retryAttempts) {
        // Attendre avant de réessayer avec backoff exponentiel
        const delay = retryDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(attempt + 1);
      }
      throw err;
    }
  }, [fetcher, retryAttempts, retryDelay]);

  // Fonction principale de récupération des données
  const fetchData = useCallback(async (forceRefresh = false) => {
    // Vérifier le cache d'abord
    if (!forceRefresh) {
      const cachedData = getCachedData();
      if (cachedData) {
        setData(cachedData);
        setError(null);
        return;
      }
    }

    // Vérifier s'il y a déjà une requête en cours
    const ongoingRequest = ongoingRequests.get(key);
    if (ongoingRequest && !forceRefresh) {
      try {
        const result = await ongoingRequest;
        if (mountedRef.current) {
          setData(result);
          setError(null);
        }
        return;
      } catch (err) {
        // La requête en cours a échoué, on continue avec une nouvelle requête
      }
    }

    setLoading(true);
    setError(null);

    // Créer une nouvelle requête
    const requestPromise = fetchWithRetry();
    ongoingRequests.set(key, requestPromise);

    try {
      const result = await requestPromise;
      
      if (mountedRef.current) {
        setData(result);
        setCachedData(result);
        setError(null);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      }
    } finally {
      ongoingRequests.delete(key);
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [key, getCachedData, setCachedData, fetchWithRetry]);

  // Fonction de refetch manuelle
  const refetch = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  // Fonction de mutation optimiste
  const mutate = useCallback((newData: T) => {
    setData(newData);
    setCachedData(newData);
  }, [setCachedData]);

  // Fonction pour vider le cache
  const clearCache = useCallback(() => {
    globalCache.delete(key);
  }, [key]);

  // Effet pour la récupération initiale
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Effet pour la revalidation sur focus
  useEffect(() => {
    if (!revalidateOnFocus) return;

    const handleFocus = () => {
      fetchData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchData, revalidateOnFocus]);

  // Effet pour la revalidation automatique
  useEffect(() => {
    if (!revalidateInterval) return;

    const interval = setInterval(() => {
      fetchData();
    }, revalidateInterval);

    return () => clearInterval(interval);
  }, [fetchData, revalidateInterval]);

  // Nettoyage au démontage
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (revalidateTimeoutRef.current) {
        clearTimeout(revalidateTimeoutRef.current);
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    mutate,
    clearCache
  };
}

// Hook pour nettoyer le cache global
export function useCacheManager() {
  const clearAllCache = useCallback(() => {
    globalCache.clear();
  }, []);

  const clearCacheByPattern = useCallback((pattern: string | RegExp) => {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    
    for (const [key] of globalCache) {
      if (regex.test(key)) {
        globalCache.delete(key);
      }
    }
  }, []);

  const getCacheStats = useCallback(() => {
    return {
      size: globalCache.size,
      keys: Array.from(globalCache.keys())
    };
  }, []);

  return {
    clearAllCache,
    clearCacheByPattern,
    getCacheStats
  };
}

export default useOptimizedData;