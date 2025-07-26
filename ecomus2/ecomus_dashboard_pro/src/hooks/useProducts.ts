import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  comparePrice?: number;
  sku: string;
  quantity: number;
  category: string;
  status: 'active' | 'inactive' | 'draft';
  featured: boolean;
  images: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  store: {
    _id: string;
    name: string;
    slug?: string;
  };
  owner?: {
    _id: string;
    email: string;
  };
}

export interface ProductStats {
  total: number;
  active: number;
  draft: number;
  lowStock: number;
  featured: number;
}

export interface ProductFilters {
  searchTerm: string;
  filterStatus: string;
  selectedStore: string;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ProductStats>({
    total: 0,
    active: 0,
    draft: 0,
    lowStock: 0,
    featured: 0
  });

  const calculateStats = useCallback((productList: Product[]): ProductStats => {
    return {
      total: productList.length,
      active: productList.filter(p => p.status === 'active').length,
      draft: productList.filter(p => p.status === 'draft').length,
      lowStock: productList.filter(p => p.quantity < 10).length,
      featured: productList.filter(p => p.featured).length
    };
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/products', {
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const productList = data.products || [];
      
      setProducts(productList);
      setStats(calculateStats(productList));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue';
      setError(errorMessage);
      console.error('Erreur lors de la récupération des produits:', error);
      
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les produits.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [calculateStats]);

  const deleteProduct = useCallback(async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Optimistic update
      setProducts(prev => {
        const updated = prev.filter(p => p._id !== productId);
        setStats(calculateStats(updated));
        return updated;
      });

      toast({
        title: "Produit supprimé",
        description: "Le produit a été supprimé avec succès.",
      });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le produit.",
        variant: "destructive",
      });
    }
  }, [calculateStats]);

  const addProduct = useCallback((newProduct: Product) => {
    setProducts(prev => {
      const updated = [newProduct, ...prev];
      setStats(calculateStats(updated));
      return updated;
    });
  }, [calculateStats]);

  const updateProduct = useCallback((updatedProduct: Product) => {
    setProducts(prev => {
      const updated = prev.map(p => 
        p._id === updatedProduct._id ? updatedProduct : p
      );
      setStats(calculateStats(updated));
      return updated;
    });
  }, [calculateStats]);

  const filterProducts = useCallback((products: Product[], filters: ProductFilters) => {
    return products.filter(product => {
      const matchesSearch = (product.title?.toLowerCase() || '').includes(filters.searchTerm.toLowerCase()) ||
                           (product.sku?.toLowerCase() || '').includes(filters.searchTerm.toLowerCase());
      const matchesStatus = filters.filterStatus === 'all' || product.status === filters.filterStatus;
      const matchesStore = filters.selectedStore === 'all' || product.store?._id === filters.selectedStore;
      
      return matchesSearch && matchesStatus && matchesStore;
    });
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    stats,
    fetchProducts,
    deleteProduct,
    addProduct,
    updateProduct,
    filterProducts,
  };
};