/**
 * Hooks React personnalisés
 * Collection de hooks réutilisables pour l'application
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { config } from "./config";
import { logger } from "./logger";
import { monitoring } from "./monitoring";
import { memoryCache as cache } from "./cache";

// ============================================================================
// HOOKS D'ÉTAT ET DONNÉES
// ============================================================================

/**
 * Hook pour gérer l'état de chargement avec gestion d'erreurs
 */
export function useAsyncState<T>(initialValue?: T) {
  const [data, setData] = useState<T | undefined>(initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (asyncFunction: () => Promise<T>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFunction();
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      logger.error("Erreur dans useAsyncState", { error: error.message });
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(initialValue);
    setError(null);
    setLoading(false);
  }, [initialValue]);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    setData,
  };
}

/**
 * Hook pour les requêtes API avec cache et retry
 */
export function useApi<T>(
  url: string | null,
  options: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: any;
    headers?: Record<string, string>;
    cache?: boolean;
    cacheTtl?: number;
    retry?: number;
    retryDelay?: number;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  } = {}
) {
  const {
    method = "GET",
    body,
    headers = {},
    cache: useCache = true,
    cacheTtl = 300000, // 5 minutes
    retry = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const cacheKey = useMemo(() => {
    if (!url || !useCache) return null;
    return `api_${url}_${method}_${JSON.stringify(body || {})}`;
  }, [url, method, body, useCache]);

  const fetchData = useCallback(
    async (retryCount = 0): Promise<T | null> => {
      if (!url) return null;

      try {
        setLoading(true);
        setError(null);

        // Vérifier le cache
        if (cacheKey && method === "GET") {
          const cachedData = await cache.get<T>(cacheKey);
          if (cachedData) {
            setData(cachedData);
            setLoading(false);
            return cachedData;
          }
        }

        // Annuler la requête précédente
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        setData(result);

        // Mettre en cache
        if (cacheKey && method === "GET") {
          await cache.set(cacheKey, result, cacheTtl);
        }

        onSuccess?.(result);
        return result;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return null; // Requête annulée
        }

        const error = err instanceof Error ? err : new Error("Unknown error");

        // Retry logic
        if (retryCount < retry) {
          logger.warn(
            `Tentative ${retryCount + 1}/${retry + 1} échouée, retry dans ${retryDelay}ms`,
            {
              url,
              error: error.message,
            }
          );

          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          return fetchData(retryCount + 1);
        }

        setError(error);
        onError?.(error);
        logger.error("Erreur API", { url, error: error.message });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [
      url,
      method,
      body,
      headers,
      cacheKey,
      cacheTtl,
      retry,
      retryDelay,
      onSuccess,
      onError,
    ]
  );

  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  const mutate = useCallback(
    (newData: T) => {
      setData(newData);
      if (cacheKey) {
        cache.set(cacheKey, newData, cacheTtl);
      }
    },
    [cacheKey, cacheTtl]
  );

  useEffect(() => {
    if (url && method === "GET") {
      fetchData();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [url, method, fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    mutate,
  };
}

/**
 * Hook pour la pagination
 */
export function usePagination<T>({
  data,
  itemsPerPage = 10,
  initialPage = 1,
}: {
  data: T[];
  itemsPerPage?: number;
  initialPage?: number;
}) {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const reset = useCallback(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);

  return {
    currentPage,
    totalPages,
    currentData,
    goToPage,
    nextPage,
    prevPage,
    reset,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
    totalItems: data.length,
  };
}

/**
 * Hook pour la recherche et le filtrage
 */
export function useSearch<T>(
  data: T[],
  searchFields: (keyof T)[],
  options: {
    caseSensitive?: boolean;
    debounceMs?: number;
  } = {}
) {
  const { caseSensitive = false, debounceMs = 300 } = options;
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce de la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  const filteredData = useMemo(() => {
    if (!debouncedQuery.trim()) return data;

    const searchTerm = caseSensitive
      ? debouncedQuery
      : debouncedQuery.toLowerCase();

    return data.filter((item) => {
      return searchFields.some((field) => {
        const value = item[field];
        if (value == null) return false;

        const stringValue = String(value);
        const searchValue = caseSensitive
          ? stringValue
          : stringValue.toLowerCase();

        return searchValue.includes(searchTerm);
      });
    });
  }, [data, debouncedQuery, searchFields, caseSensitive]);

  const clearSearch = useCallback(() => {
    setQuery("");
    setDebouncedQuery("");
  }, []);

  return {
    query,
    setQuery,
    filteredData,
    clearSearch,
    isSearching: query !== debouncedQuery,
  };
}

// ============================================================================
// HOOKS D'INTERFACE UTILISATEUR
// ============================================================================

/**
 * Hook pour gérer les modales
 */
export function useModal(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}

/**
 * Hook pour gérer les notifications toast
 */
export function useToast() {
  const showSuccess = useCallback((message: string, options?: any) => {
    toast.success(message, options);
  }, []);

  const showError = useCallback((message: string, options?: any) => {
    toast.error(message, options);
  }, []);

  const showInfo = useCallback((message: string, options?: any) => {
    toast.info(message, options);
  }, []);

  const showWarning = useCallback((message: string, options?: any) => {
    toast.warning(message, options);
  }, []);

  const showLoading = useCallback((message: string, options?: any) => {
    return toast.loading(message, options);
  }, []);

  const dismiss = useCallback((toastId?: string | number) => {
    toast.dismiss(toastId);
  }, []);

  return {
    success: showSuccess,
    error: showError,
    info: showInfo,
    warning: showWarning,
    loading: showLoading,
    dismiss,
  };
}

/**
 * Hook pour gérer le copier-coller
 */
export function useClipboard() {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, 2000);

      return true;
    } catch (error) {
      logger.error("Erreur lors de la copie", { error });
      return false;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { copy, copied };
}

/**
 * Hook pour détecter les clics en dehors d'un élément
 */
export function useClickOutside<T extends HTMLElement>(callback: () => void) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [callback]);

  return ref;
}

/**
 * Hook pour gérer les raccourcis clavier
 */
export function useKeyboard(
  shortcuts: Record<string, () => void>,
  enabled = true
) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const modifiers = {
        ctrl: event.ctrlKey,
        alt: event.altKey,
        shift: event.shiftKey,
        meta: event.metaKey,
      };

      for (const [shortcut, callback] of Object.entries(shortcuts)) {
        const parts = shortcut.toLowerCase().split("+");
        const targetKey = parts[parts.length - 1];
        const targetModifiers = parts.slice(0, -1);

        if (key === targetKey) {
          const modifierMatch = targetModifiers.every((mod) => {
            switch (mod) {
              case "ctrl":
                return modifiers.ctrl;
              case "alt":
                return modifiers.alt;
              case "shift":
                return modifiers.shift;
              case "meta":
                return modifiers.meta;
              default:
                return false;
            }
          });

          if (modifierMatch) {
            event.preventDefault();
            callback();
            break;
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts, enabled]);
}

// ============================================================================
// HOOKS MÉTIER
// ============================================================================

/**
 * Hook pour gérer l'authentification
 */
export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const user = session?.user;
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  const login = useCallback(
    (redirectTo?: string) => {
      router.push(
        `/auth/signin${redirectTo ? `?callbackUrl=${encodeURIComponent(redirectTo)}` : ""}`
      );
    },
    [router]
  );

  const logout = useCallback(() => {
    router.push("/auth/signout");
  }, [router]);

  const hasRole = useCallback(
    (role: string) => {
      return user?.role === role;
    },
    [user]
  );

  const hasPermission = useCallback(
    (permission: string) => {
      // Note: permissions not implemented in current user type
      // This would need to be extended in the auth configuration
      return false;
    },
    [user]
  );

  const requireAuth = useCallback(
    (redirectTo?: string) => {
      if (!isLoading && !isAuthenticated) {
        login(redirectTo || window.location.pathname);
      }
    },
    [isLoading, isAuthenticated, login]
  );

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    hasRole,
    hasPermission,
    requireAuth,
  };
}

/**
 * Hook pour gérer les stores
 */
export function useStores() {
  const {
    data: stores,
    loading,
    error,
    refetch,
  } = useApi<any[]>("/api/stores");
  const toast = useToast();

  const createStore = useCallback(
    async (storeData: any) => {
      try {
        const response = await fetch("/api/stores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(storeData),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la création du store");
        }

        const newStore = await response.json();
        toast.success("Store créé avec succès");
        refetch();
        return newStore;
      } catch (error) {
        toast.error("Erreur lors de la création du store");
        throw error;
      }
    },
    [refetch, toast]
  );

  const updateStore = useCallback(
    async (storeId: string, updates: any) => {
      try {
        const response = await fetch(`/api/stores/${storeId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la mise à jour du store");
        }

        const updatedStore = await response.json();
        toast.success("Store mis à jour avec succès");
        refetch();
        return updatedStore;
      } catch (error) {
        toast.error("Erreur lors de la mise à jour du store");
        throw error;
      }
    },
    [refetch, toast]
  );

  const deleteStore = useCallback(
    async (storeId: string) => {
      try {
        const response = await fetch(`/api/stores/${storeId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la suppression du store");
        }

        toast.success("Store supprimé avec succès");
        refetch();
      } catch (error) {
        toast.error("Erreur lors de la suppression du store");
        throw error;
      }
    },
    [refetch, toast]
  );

  return {
    stores: stores || [],
    loading,
    error,
    refetch,
    createStore,
    updateStore,
    deleteStore,
  };
}

/**
 * Hook pour gérer les produits
 */
export function useProducts(storeId?: string) {
  const url = storeId ? `/api/stores/${storeId}/products` : "/api/products";
  const { data: products, loading, error, refetch } = useApi<any[]>(url);
  const toast = useToast();

  const createProduct = useCallback(
    async (productData: any) => {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la création du produit");
        }

        const newProduct = await response.json();
        toast.success("Produit créé avec succès");
        refetch();
        return newProduct;
      } catch (error) {
        toast.error("Erreur lors de la création du produit");
        throw error;
      }
    },
    [url, refetch, toast]
  );

  const updateProduct = useCallback(
    async (productId: string, updates: any) => {
      try {
        const response = await fetch(`${url}/${productId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la mise à jour du produit");
        }

        const updatedProduct = await response.json();
        toast.success("Produit mis à jour avec succès");
        refetch();
        return updatedProduct;
      } catch (error) {
        toast.error("Erreur lors de la mise à jour du produit");
        throw error;
      }
    },
    [url, refetch, toast]
  );

  const deleteProduct = useCallback(
    async (productId: string) => {
      try {
        const response = await fetch(`${url}/${productId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la suppression du produit");
        }

        toast.success("Produit supprimé avec succès");
        refetch();
      } catch (error) {
        toast.error("Erreur lors de la suppression du produit");
        throw error;
      }
    },
    [url, refetch, toast]
  );

  return {
    products: products || [],
    loading,
    error,
    refetch,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}

// ============================================================================
// HOOKS DE PERFORMANCE
// ============================================================================

/**
 * Hook pour mesurer les performances d'un composant
 */
export function usePerformance(componentName: string) {
  const renderStartTime = useRef(Date.now());
  const mountTime = useRef<number | undefined>(undefined);

  useEffect(() => {
    mountTime.current = Date.now();
    const mountDuration = mountTime.current - renderStartTime.current;
    
    monitoring.recordMetric({
      name: `component_mount_${componentName}`,
      value: mountDuration,
      type: 'histogram',
      labels: { component: componentName }
    });
    
    return () => {
      if (mountTime.current) {
        const unmountTime = Date.now();
        const lifetimeDuration = unmountTime - mountTime.current;
        monitoring.recordMetric({
          name: `component_lifetime_${componentName}`,
          value: lifetimeDuration,
          type: 'histogram',
          labels: { component: componentName }
        });
      }
    };
  }, [componentName]);

  const measureRender = useCallback((renderName: string, renderFn: () => void) => {
    const start = Date.now();
    renderFn();
    const duration = Date.now() - start;
    monitoring.recordMetric({
      name: `component_render_${componentName}_${renderName}`,
      value: duration,
      type: 'histogram',
      labels: { component: componentName, render: renderName }
    });
  }, [componentName]);

  return { measureRender };
}

/**
 * Hook pour le debouncing
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook pour le throttling
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now());

  return useCallback(
    (...args: Parameters<T>) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    },
    [callback, delay]
  ) as T;
}

/**
 * Hook pour la détection de la taille d'écran
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}

export default {
  useAsyncState,
  useApi,
  usePagination,
  useSearch,
  useModal,
  useToast,
  useClipboard,
  useClickOutside,
  useKeyboard,
  useAuth,
  useStores,
  useProducts,
  usePerformance,
  useDebounce,
  useThrottle,
  useMediaQuery,
};
