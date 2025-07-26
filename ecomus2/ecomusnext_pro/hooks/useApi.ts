"use client";

import { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '../lib/api';
import { Store, StoreApiResponse } from '../types/store';

// Type générique pour les données API
interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Hook générique pour les appels API
export function useApiData<T>(
  apiCall: () => Promise<T>, 
  deps: any[] = []
): ApiState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: true,
    error: null
  });

  const fetchData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const result = await apiCall();
      setState({ data: result, loading: false, error: null });
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Erreur de chargement';
      setState({ data: null, loading: false, error: errorMessage });
    }
  }, [apiCall]);

  useEffect(() => {
    fetchData();
  }, deps);

  return {
    ...state,
    refetch: fetchData
  };
}

// Hooks spécialisés pour les boutiques
export function useStores(params?: Parameters<typeof api.getStores>[0]) {
  return useApiData(
    () => api.getStores(params), 
    [JSON.stringify(params)]
  );
}

export function useStore(slug: string | null): ApiState<Store> & { refetch: () => Promise<void> } {
  return useApiData<Store>(
    () => slug ? api.getStore(slug) : Promise.resolve(null as any), 
    [slug]
  );
}

// Hooks spécialisés pour les produits
export function useProducts(params?: Parameters<typeof api.getProducts>[0]) {
  return useApiData(
    () => api.getProducts(params), 
    [JSON.stringify(params)]
  );
}

export function useProduct(id: string) {
  return useApiData(
    () => api.getProduct(id), 
    [id]
  );
}

// Hook pour les catégories
export function useCategories(params?: Parameters<typeof api.getCategories>[0]) {
  return useApiData(
    () => api.getCategories(params), 
    [JSON.stringify(params)]
  );
}

// Hook avec état de recherche
export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (searchQuery: string, params?: Parameters<typeof api.search>[1]) => {
    if (!searchQuery.trim()) {
      setResults(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await api.search(searchQuery, params);
      setResults(result);
      setQuery(searchQuery);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erreur de recherche');
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults(null);
    setError(null);
  }, []);

  return {
    query,
    results,
    loading,
    error,
    search,
    clearSearch
  };
}

// Hook pour la gestion d'état paginé
interface PaginationParams {
  page?: number;
  limit?: number;
  [key: string]: any;
}

export function usePaginatedData<T>(
  apiCall: (params: PaginationParams) => Promise<{ data?: T; pagination?: any }>,
  initialParams: PaginationParams = { page: 1, limit: 10 }
) {
  const [params, setParams] = useState<PaginationParams>(initialParams);
  
  const { data, loading, error, refetch } = useApiData(
    () => apiCall(params),
    [JSON.stringify(params)]
  );

  const updateParams = useCallback((newParams: Partial<PaginationParams>) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  const nextPage = useCallback(() => {
    if (data?.pagination?.hasNext) {
      updateParams({ page: (params.page || 1) + 1 });
    }
  }, [data?.pagination?.hasNext, params.page, updateParams]);

  const prevPage = useCallback(() => {
    if (data?.pagination?.hasPrev) {
      updateParams({ page: Math.max((params.page || 1) - 1, 1) });
    }
  }, [data?.pagination?.hasPrev, params.page, updateParams]);

  const goToPage = useCallback((page: number) => {
    updateParams({ page });
  }, [updateParams]);

  return {
    data: data?.data || null,
    pagination: data?.pagination || null,
    loading,
    error,
    params,
    updateParams,
    nextPage,
    prevPage,
    goToPage,
    refetch
  };
}
