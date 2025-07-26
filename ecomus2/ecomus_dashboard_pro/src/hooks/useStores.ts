import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export interface Store {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  status?: 'active' | 'inactive';
  owner?: {
    _id: string;
    email: string;
  };
}

export const useStores = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/stores', {
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setStores(data.stores || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue';
      setError(errorMessage);
      console.error('Erreur lors de la récupération des boutiques:', error);
      
      // Ne pas afficher de toast pour les stores car c'est moins critique
      // que les produits principaux
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  return {
    stores,
    loading,
    error,
    fetchStores,
  };
};