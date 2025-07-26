// Service API pour connecter le dashboard à l'API principale Ecomus
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Types
interface LoginCredentials {
  email: string;
  password: string;
}

interface ProductParams {
  page?: number;
  limit?: number;
  search?: string;
}

interface Product {
  id?: string;
  name: string;
  description?: string;
  price: number;
}

interface OrderParams {
  page?: number;
  limit?: number;
  status?: string;
}

interface UserParams {
  page?: number;
  limit?: number;
  role?: string;
}

interface User {
  id?: string;
  name: string;
  email: string;
  role?: string;
}

interface Category {
  id?: string;
  name: string;
  description?: string;
}

// Instance axios configurée
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Services API pour chaque entité
export const apiService = {
  // Authentification
  auth: {
    login: (credentials: LoginCredentials) => apiClient.post('/auth/signin', credentials),
    logout: () => apiClient.post('/auth/logout'),
    getProfile: () => apiClient.get('/auth/profile'),
  },

  // Produits
  products: {
    getAll: (params?: ProductParams) => apiClient.get('/products', { params }),
    getById: (id: string) => apiClient.get(`/products/${id}`),
    create: (product: Product) => apiClient.post('/products', product),
    update: (id: string, product: Product) => apiClient.put(`/products/${id}`, product),
    delete: (id: string) => apiClient.delete(`/products/${id}`),
    getStats: () => apiClient.get('/products/stats'),
  },

  // Commandes
  orders: {
    getAll: (params?: OrderParams) => apiClient.get('/orders', { params }),
    getById: (id: string) => apiClient.get(`/orders/${id}`),
    updateStatus: (id: string, status: string) => apiClient.patch(`/orders/${id}/status`, { status }),
    getStats: () => apiClient.get('/orders/stats'),
    getRecent: (limit: number = 10) => apiClient.get(`/orders/recent?limit=${limit}`),
  },

  // Utilisateurs
  users: {
    getAll: (params?: UserParams) => apiClient.get('/users', { params }),
    getById: (id: string) => apiClient.get(`/users/${id}`),
    create: (user: User) => apiClient.post('/users', user),
    update: (id: string, user: User) => apiClient.put(`/users/${id}`, user),
    delete: (id: string) => apiClient.delete(`/users/${id}`),
    getStats: () => apiClient.get('/users/stats'),
  },

  // Catégories
  categories: {
    getAll: () => apiClient.get('/categories'),
    getById: (id: string) => apiClient.get(`/categories/${id}`),
    create: (category: Category) => apiClient.post('/categories', category),
    update: (id: string, category: Category) => apiClient.put(`/categories/${id}`, category),
    delete: (id: string) => apiClient.delete(`/categories/${id}`),
  },

  // Dashboard Analytics
  dashboard: {
    getStats: () => apiClient.get('/dashboard/stats'),
    getSalesData: (period: string) => apiClient.get(`/dashboard/sales?period=${period}`),
    getTopProducts: (limit: number = 5) => apiClient.get(`/dashboard/top-products?limit=${limit}`),
    getRevenueChart: (period: string) => apiClient.get(`/dashboard/revenue-chart?period=${period}`),
  },
};

export default apiService;
