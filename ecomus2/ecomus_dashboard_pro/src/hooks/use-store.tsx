"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { Store } from "@/types";

interface StoreContextType {
  currentStore: Store | null;
  stores: Store[];
  setCurrentStore: (store: Store) => void;
  isLoading: boolean;
  refetchStores: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

interface StoreProviderProps {
  children: ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  const { data: session } = useSession();
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Éviter les problèmes d'hydratation
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchStores = async () => {
    if (!isMounted) return;
    
    try {
      setIsLoading(true);
      const response = await fetch("/api/stores");
      if (response.ok) {
        const data = await response.json();
        // L'API retourne les données dans data.data, pas data.stores
        const storesList = data.data || [];
        setStores(storesList);
        
        // Si c'est un vendor, sélectionner automatiquement sa boutique
        if (session?.user?.role === "vendor" && storesList.length > 0) {
          setCurrentStore(storesList[0]);
        }
        // Si c'est un admin et qu'aucune boutique n'est sélectionnée, sélectionner la première
        else if (session?.user?.role === "admin" && storesList.length > 0 && !currentStore) {
          setCurrentStore(storesList[0]);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des boutiques:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refetchStores = async () => {
    await fetchStores();
  };

  useEffect(() => {
    if (session?.user && isMounted) {
      fetchStores();
    }
  }, [session, isMounted]);

  // Sauvegarder la boutique sélectionnée dans le localStorage seulement côté client
  useEffect(() => {
    if (currentStore && isMounted && typeof window !== 'undefined') {
      localStorage.setItem("selectedStoreId", currentStore.id);
    }
  }, [currentStore, isMounted]);

  // Restaurer la boutique sélectionnée depuis le localStorage seulement côté client
  useEffect(() => {
    if (isMounted && typeof window !== 'undefined' && stores.length > 0) {
      const savedStoreId = localStorage.getItem("selectedStoreId");
      if (savedStoreId) {
        const savedStore = stores.find(store => store.id === savedStoreId);
        if (savedStore && session?.user?.role === "admin") {
          setCurrentStore(savedStore);
        }
      }
    }
  }, [stores, session, isMounted]);

  const handleSetCurrentStore = (store: Store) => {
    setCurrentStore(store);
  };

  // Ne pas rendre le provider tant que le composant n'est pas monté côté client
  if (!isMounted) {
    return <>{children}</>;
  }

  return (
    <StoreContext.Provider
      value={{
        currentStore,
        stores,
        setCurrentStore: handleSetCurrentStore,
        isLoading,
        refetchStores,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    // En mode développement, nous voulons toujours savoir s'il y a un problème
    if (process.env.NODE_ENV === 'development') {
      console.warn("useStore called outside of StoreProvider");
    }
    // Retourner des valeurs par défaut plutôt que de lancer une erreur
    return {
      currentStore: null,
      stores: [],
      setCurrentStore: () => {},
      isLoading: true,
      refetchStores: async () => {},
    };
  }
  return context;
}

// Hook pour filtrer les données selon la boutique sélectionnée
export function useStoreFilter() {
  const { currentStore } = useStore();
  const { data: session } = useSession();

  const filterByStore = <T extends { storeId?: string }>(items: T[]): T[] => {
    if (!currentStore || session?.user?.role === "admin") {
      return items;
    }
    
    return items.filter(item => item.storeId === currentStore.id);
  };

  const getStoreQuery = () => {
    if (!currentStore || session?.user?.role === "admin") {
      return {};
    }
    
    return { storeId: currentStore.id };
  };

  return {
    filterByStore,
    getStoreQuery,
    currentStoreId: currentStore?.id || null,
  };
}
