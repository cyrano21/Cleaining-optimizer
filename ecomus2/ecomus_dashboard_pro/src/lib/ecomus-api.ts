import { getSession } from 'next-auth/react';

// Service pour communiquer avec l'API principale Ecomus
class EcomusApiService {
  private baseURL: string;

  constructor() {
    // Utiliser l'URL GitHub Codespaces en priorité
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    console.log('🔧 EcomusApiService initialized with baseURL:', this.baseURL);
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Récupérer la session NextAuth
    const session = await getSession();
    const token = session?.accessToken;
    
    console.log('🔗 API Request:', {
      url,
      hasSession: !!session,
      hasToken: !!token,
      userEmail: session?.user?.email
    });
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);
      
      console.log('📡 API Response:', {
        url,
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        throw new Error(`API Error ${response.status}: ${response.statusText} - ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('❌ API Request failed:', {
        url,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Relancer l'erreur avec plus de contexte
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error(`Connection failed to ${url}. Please check if the API server is running and accessible.`);
      }
      
      throw error;
    }
  }

  // Products API
  async getProducts(params?: { page?: number; limit?: number; category?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.category) searchParams.append('category', params.category);
    
    const query = searchParams.toString();
    return this.request(`/dashboard/products${query ? `?${query}` : ''}`);
  }

  async getProduct(id: string) {
    return this.request(`/dashboard/products/${id}`);
  }

  async createProduct(product: any) {
    return this.request('/dashboard/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateProduct(id: string, product: any) {
    return this.request(`/dashboard/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/dashboard/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Orders API
  async getOrders(params?: { page?: number; limit?: number; status?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    
    const query = searchParams.toString();
    return this.request(`/dashboard/orders${query ? `?${query}` : ''}`);
  }

  async getOrder(id: string) {
    return this.request(`/dashboard/orders/${id}`);
  }

  async updateOrderStatus(id: string, status: string) {
    return this.request(`/dashboard/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Users API
  async getUsers(params?: { page?: number; limit?: number; role?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.role) searchParams.append('role', params.role);
    
    const query = searchParams.toString();
    return this.request(`/dashboard/users${query ? `?${query}` : ''}`);
  }

  async getUser(id: string) {
    return this.request(`/dashboard/users/${id}`);
  }

  async updateUser(id: string, user: any) {
    return this.request(`/dashboard/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    });
  }

  // Categories API
  async getCategories() {
    return this.request('/dashboard/categories');
  }

  async createCategory(category: any) {
    return this.request('/dashboard/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  }

  async updateCategory(id: string, category: any) {
    return this.request(`/dashboard/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    });
  }

  async deleteCategory(id: string) {
    return this.request(`/dashboard/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Collections API
  async getCollections(params?: { page?: number; limit?: number; search?: string; featured?: boolean; category?: string; status?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.featured !== undefined) searchParams.append('featured', params.featured.toString());
    if (params?.category) searchParams.append('category', params.category);
    if (params?.status) searchParams.append('status', params.status);
    
    const query = searchParams.toString();
    return this.request(`/collections${query ? `?${query}` : ''}`);
  }

  async getCollection(id: string) {
    return this.request(`/collections/${id}`);
  }

  async createCollection(collection: any) {
    return this.request('/collections', {
      method: 'POST',
      body: JSON.stringify(collection),
    });
  }

  async updateCollection(id: string, collection: any) {
    return this.request(`/collections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(collection),
    });
  }

  async deleteCollection(id: string) {
    return this.request(`/collections/${id}`, {
      method: 'DELETE',
    });
  }

  // Public Collections API
  async getPublicCollections(params?: { limit?: number; featured?: boolean; category?: string; storeId?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.featured !== undefined) searchParams.append('featured', params.featured.toString());
    if (params?.category) searchParams.append('category', params.category);
    if (params?.storeId) searchParams.append('storeId', params.storeId);
    
    const query = searchParams.toString();
    return this.request(`/public/collections${query ? `?${query}` : ''}`);
  }

  async getPublicCollection(id: string, includeProducts?: boolean) {
    const searchParams = new URLSearchParams();
    if (includeProducts !== undefined) searchParams.append('includeProducts', includeProducts.toString());
    
    const query = searchParams.toString();
    return this.request(`/public/collections/${id}${query ? `?${query}` : ''}`);
  }

  // Analytics API
  async getDashboardStats() {
    return this.request('/dashboard/analytics/dashboard');
  }

  async getSalesData(period: string = '30d') {
    return this.request(`/dashboard/analytics/sales?period=${period}`);
  }
}

export const ecomusApi = new EcomusApiService();
