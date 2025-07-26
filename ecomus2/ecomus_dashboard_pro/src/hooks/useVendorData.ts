import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ui/toast';

interface Product {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  discountPercentage?: number;
  sku: string;
  barcode?: string;
  quantity: number;
  lowStockAlert?: number;
  images: string[];
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  tags: string[];
  status: 'active' | 'inactive' | 'draft';
  featured: boolean;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  seoTitle?: string;
  seoDescription?: string;
  variant?: {
    color?: string;
    size?: string;
    material?: string;
  };
  averageRating: number;
  totalReviews: number;
  totalSales: number;
  createdAt: string;
  updatedAt: string;
  store: {
    _id: string;
    name: string;
  };
}

interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  draftProducts: number;
  inactiveProducts: number;
  totalRevenue: number;
  totalSales: number;
  lowStockProducts: number;
  avgRating: number;
}

interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: ProductStats;
}

interface Analytics {
  totalRevenue: number;
  revenueTrend: number;
  activeOrders: number;
  totalOrders: number;
  pendingOrders: number;
  averageRating: number;
  salesData: Array<{
    date: string;
    sales: number;
  }>;
  categoryData: Array<{
    name: string;
    value: number;
  }>;
  overview: ProductStats & {
    totalInventoryValue: number;
    totalReviews: number;
  };
  topProducts: Array<{
    _id: string;
    title: string;
    totalSales: number;
    price: number;
    images: string[];
    averageRating: number;
  }>;
  lowStockProducts: Array<{
    _id: string;
    title: string;
    quantity: number;
    lowStockAlert: number;
    images: string[];
    price: number;
  }>;
  categoryStats: Array<{
    _id: string;
    name: string;
    count: number;
    totalValue: number;
    totalSales: number;
  }>;
  salesTrend: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
  period: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  items: Array<{
    productId: {
      _id: string; 
      title: string;
      sku: string;
      images: string[];
    };
    quantity: number;
    price: number;
  }>;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  updatedAt: string;
}

// Hooks spécialisés e-commerce avec données réelles
export const useVendorProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();

  const fetchProducts = useCallback(async () => {
    // Ne pas faire de requête si la session est en cours de chargement
    if (status === 'loading') {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (status === 'unauthenticated' || !session) {
        throw new Error('Vous devez être connecté pour accéder à vos produits');
      }

      const response = await fetch('/api/vendor/products');
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        } else if (response.status === 403) {
          throw new Error('Accès refusé. Vous devez être vendeur pour accéder à cette fonctionnalité.');
        }
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.success) {
        setProducts(data.data || []);
      } else {
        throw new Error(data.error || 'Erreur lors du chargement des produits');
      }
    } catch (err) {
      console.error('Erreur fetch products:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setProducts([]); // Fallback avec tableau vide
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, status]); // Dépendance stable sur l'ID utilisateur
  useEffect(() => {
    // Ne déclencher fetchProducts que si la session est chargée
    if (status !== 'loading') {
      fetchProducts();
    }
  }, [fetchProducts, status]);

  return { products, loading, error, refetch: fetchProducts };
};

export const useVendorAnalytics = (period: string = 'month') => {
  const [analytics, setAnalytics] = useState({
    totalSales: 0,
    totalProducts: 0,
    totalOrders: 0,
    revenue: 0,
    avgOrderValue: 0,
    conversionRate: 0,
    chartData: [] as Array<{ name: string; value: number }>,
    topProducts: [] as Array<{ id: string; name: string; sales: number; revenue: number }>,
    recentOrders: [] as Array<{ id: string; orderNumber: string; user: any; total: number; status: string; createdAt: string }>
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();

  const fetchAnalytics = useCallback(async () => {
    // Ne pas faire de requête si la session est en cours de chargement
    if (status === 'loading') {
      return;
    }

    if (status === 'unauthenticated' || !session) {
      setLoading(false);
      setError('Vous devez être connecté pour accéder aux analytics');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/vendor/analytics?period=${period}`);
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        } else if (response.status === 403) {
          throw new Error('Accès refusé. Vous devez être vendeur pour accéder aux analytics.');
        }
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.success) {
        const overview = data.data.overview || {};
        const charts = data.data.charts || {};
        setAnalytics({
          totalSales: overview.totalSales || 0,
          totalProducts: overview.totalProducts || 0,
          totalOrders: overview.totalOrders || 0,
          revenue: overview.revenue || 0,
          avgOrderValue: overview.avgOrderValue || 0,
          conversionRate: overview.conversionRate || 0,
          chartData: charts.revenue || [],
          topProducts: data.data.topProducts || [],
          recentOrders: data.data.recentOrders || []
        });
      } else {
        throw new Error(data.error || 'Erreur lors du chargement des analytics');
      }
    } catch (err) {
      console.error('Erreur fetch analytics:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      // Fallback avec données vides
      setAnalytics({
        totalSales: 0,
        totalProducts: 0,
        totalOrders: 0,
        revenue: 0,
        avgOrderValue: 0,
        conversionRate: 0,
        chartData: [],
        topProducts: [],
        recentOrders: []
      });
    } finally {
      setLoading(false);
    }
  }, [period, session?.user?.id, status]); // Dépendances stables
  useEffect(() => {
    // Ne déclencher fetchAnalytics que si la session est chargée
    if (status !== 'loading') {
      fetchAnalytics();
    }
  }, [fetchAnalytics, status]);

  return { analytics, loading, error, refetch: fetchAnalytics };
};

export const useVendorCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { data: session, status } = useSession();

  const fetchCategories = useCallback(async () => {
    // Ne pas faire de requête si la session est en cours de chargement
    if (status === 'loading') {
      return;
    }

    if (status === 'unauthenticated' || !session) {
      toast({
        type: 'error',
        title: 'Erreur',
        description: 'Vous devez être connecté pour accéder aux catégories',
        duration: 5000
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/vendor/categories');
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        } else if (response.status === 403) {
          throw new Error('Accès refusé. Vous devez être vendeur pour accéder à cette fonctionnalité.');
        }
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setCategories(data.data);
      } else {
        throw new Error(data.error || 'Erreur lors du chargement des catégories');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
      toast({
        type: 'error',
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de charger les catégories',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, status, toast]);

  const createCategory = useCallback(async (categoryData: Omit<Category, '_id'>) => {
    try {
      // Vérifier si l'utilisateur est connecté
      if (status === 'unauthenticated' || !session) {
        throw new Error('Vous devez être connecté pour créer une catégorie');
      }

      const response = await fetch('/api/vendor/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        } else if (response.status === 403) {
          throw new Error('Accès refusé. Vous devez être vendeur pour créer une catégorie.');
        }
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        toast({
          type: 'success',
          title: 'Succès',
          description: 'Catégorie créée avec succès',
          duration: 3000
        });
        await fetchCategories(); // Recharger la liste
        return data.data;
      } else {
        throw new Error(data.error || 'Erreur lors de la création de la catégorie');
      }
    } catch (error) {
      console.error('Erreur lors de la création de la catégorie:', error);
      toast({
        type: 'error',
        title: 'Erreur',
        description: 'Impossible de créer la catégorie',
        duration: 5000
      });
      throw error;
    }
  }, [session, status, toast, fetchCategories]);

  const updateCategory = useCallback(async (id: string, categoryData: Partial<Category>) => {
    try {
      const response = await fetch(`/api/vendor/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          type: 'success',
          title: 'Succès',
          description: 'Catégorie mise à jour avec succès',
          duration: 3000
        });
        await fetchCategories(); // Recharger la liste
        return data.data;
      } else {
        throw new Error(data.error || 'Erreur lors de la mise à jour de la catégorie');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la catégorie:', error);
      toast({
        type: 'error',
        title: 'Erreur',
        description: 'Impossible de mettre à jour la catégorie',
        duration: 5000
      });
      throw error;
    }
  }, [toast, fetchCategories]);

  const deleteCategory = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/vendor/categories/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          type: 'success',
          title: 'Succès',
          description: 'Catégorie supprimée avec succès',
          duration: 3000
        });
        await fetchCategories(); // Recharger la liste
        return true;
      } else {
        throw new Error(data.error || 'Erreur lors de la suppression de la catégorie');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la catégorie:', error);
      toast({
        type: 'error',
        title: 'Erreur',
        description: 'Impossible de supprimer la catégorie',
        duration: 5000
      });
      throw error;
    }
  }, [toast, fetchCategories]);
  useEffect(() => {
    // Ne déclencher fetchCategories que si la session est chargée
    if (status !== 'loading') {
      fetchCategories();
    }
  }, [fetchCategories, status]);

  return {
    categories,
    loading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
  };
};

export const useVendorOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { data: session, status } = useSession();

  const fetchOrders = useCallback(async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    sort?: string;
    order?: string;
  }) => {
    // Ne pas faire de requête si la session est en cours de chargement
    if (status === 'loading') {
      return;
    }

    if (status === 'unauthenticated' || !session) {
      toast({
        type: 'error',
        title: 'Erreur',
        description: 'Vous devez être connecté pour accéder aux commandes',
        duration: 5000
      });
      return;
    }

    setLoading(true);
    try {
      const searchParams = new URLSearchParams();
      
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.status) searchParams.set('status', params.status);
      if (params?.search) searchParams.set('search', params.search);
      if (params?.sort) searchParams.set('sort', params.sort);
      if (params?.order) searchParams.set('order', params.order);

      const response = await fetch(`/api/vendor/orders?${searchParams}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        } else if (response.status === 403) {
          throw new Error('Accès refusé. Vous devez être vendeur pour accéder aux commandes.');
        }
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setOrders(data.data.orders || data.data);
      } else {
        throw new Error(data.error || 'Erreur lors du chargement des commandes');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
      toast({
        type: 'error',
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de charger les commandes',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, status, toast]);

  const updateOrderStatus = useCallback(async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/vendor/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchOrders(); // Recharger la liste
        return data.data;
      } else {
        throw new Error(data.error || 'Erreur lors de la mise à jour du statut');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw error;
    }
  }, [fetchOrders]);
  useEffect(() => {
    // Ne déclencher fetchOrders que si la session est chargée
    if (status !== 'loading') {
      fetchOrders();
    }
  }, [fetchOrders, status]);

  return {
    orders,
    loading,
    fetchOrders,
    updateOrderStatus
  };
};
