import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export interface Supplier {
  _id: string;
  name: string;
  country: string;
  rating: number;
  totalProducts?: number;
  products?: number;
  activeStores?: number;
  status: 'active' | 'pending' | 'inactive' | 'verified' | 'suspended' | 'rejected';
  commission: number;
  shippingTime: string;
  minOrder: number;
  website?: string;
  description: string;
  categories: string[];
  joinedDate?: string;
  totalRevenue?: number;
  totalOrders?: number;
  compliance?: {
    taxCompliant: boolean;
    certifications: string[];
    lastAudit: string;
  };
}

export interface DropshippingProduct {
  _id: string;
  title: string;
  supplier: string;
  price: number;
  margin: number;
  stock: number;
  orders: number;
  status: 'active' | 'draft' | 'out_of_stock';
  image: string;
  category: string;
  productInfo?: {
    name: string;
    images: string[];
    price: number;
  };
}

export interface DropshippingOrder {
  _id: string;
  orderId: string;
  supplier: string;
  product: string;
  quantity: number;
  totalAmount: number;
  dropshippingStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  createdAt: string;
  productInfo?: {
    name: string;
    image: string;
  };
}

export interface StoreDropshipping {
  id: string;
  storeName: string;
  owner: string;
  suppliers: number;
  products: number;
  orders: number;
  revenue: number;
  status: 'active' | 'inactive' | 'suspended';
  lastActivity: string;
}

export function useDropshippingSuppliers(filters?: {
  status?: string;
  country?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const { data: session } = useSession();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchSuppliers = async () => {
    if (!session?.user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.country) params.append('country', filters.country);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      const response = await fetch(`/api/dropshipping/suppliers?${params}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des fournisseurs');
      }
      
      const data = await response.json();
      setSuppliers(data.suppliers || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [session, filters?.status, filters?.country, filters?.search, filters?.page, filters?.limit]);

  const connectSupplier = async (supplierData: Partial<Supplier>) => {
    try {
      const response = await fetch('/api/dropshipping/suppliers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(supplierData),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la connexion du fournisseur');
      }
      
      await fetchSuppliers(); // Recharger la liste
      return await response.json();
    } catch (err) {
      throw err;
    }
  };

  return {
    suppliers,
    loading,
    error,
    total,
    refetch: fetchSuppliers,
    connectSupplier
  };
}

export function useDropshippingProducts(filters?: {
  supplier?: string;
  status?: string;
  search?: string;
  store?: string;
  page?: number;
  limit?: number;
}) {
  const { data: session } = useSession();
  const [products, setProducts] = useState<DropshippingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchProducts = async () => {
    if (!session?.user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (filters?.supplier) params.append('supplier', filters.supplier);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.store) params.append('store', filters.store);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      const response = await fetch(`/api/dropshipping/products?${params}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des produits');
      }
      
      const data = await response.json();
      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [session, filters?.supplier, filters?.status, filters?.search, filters?.store, filters?.page, filters?.limit]);

  const importProducts = async (supplierId: string, productIds: string[], options: any) => {
    try {
      const response = await fetch('/api/dropshipping/products/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ supplierId, productIds, options }),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'importation des produits');
      }
      
      await fetchProducts(); // Recharger la liste
      return await response.json();
    } catch (err) {
      throw err;
    }
  };

  return {
    products,
    loading,
    error,
    total,
    refetch: fetchProducts,
    importProducts
  };
}

export function useDropshippingOrders(filters?: {
  status?: string;
  supplier?: string;
  store?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}) {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<DropshippingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchOrders = async () => {
    if (!session?.user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.supplier) params.append('supplier', filters.supplier);
      if (filters?.store) params.append('store', filters.store);
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      const response = await fetch(`/api/dropshipping/orders?${params}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des commandes');
      }
      
      const data = await response.json();
      setOrders(data.orders || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [session, filters?.status, filters?.supplier, filters?.store, filters?.dateFrom, filters?.dateTo, filters?.page, filters?.limit]);

  const syncOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/dropshipping/orders/${orderId}/sync`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la synchronisation de la commande');
      }
      
      await fetchOrders(); // Recharger la liste
      return await response.json();
    } catch (err) {
      throw err;
    }
  };

  return {
    orders,
    loading,
    error,
    total,
    refetch: fetchOrders,
    syncOrder
  };
}

export function useDropshippingStats() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    totalSuppliers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    conversionRate: 0,
    avgOrderValue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!session?.user) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/dropshipping/stats');
        
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des statistiques');
        }
        
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [session]);

  return { stats, loading, error };
}