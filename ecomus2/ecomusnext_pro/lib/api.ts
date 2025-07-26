// Configuration API pour communiquer avec ecomus-dashboard-core
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiCall(endpoint: string, options?: RequestInit) {
  const url = `${API_BASE}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      ...options,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status, 
        errorData.error || `HTTP ${response.status}: ${response.statusText}`
      );
    }
    
    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Erreurs réseau, timeout, etc.
    const errorMessage = (error as Error)?.message || 'Erreur inconnue';
    throw new ApiError(0, `Erreur de connexion: ${errorMessage}`);
  }
}

// API client pour ecomusnext
export const api = {
  // Boutiques
  getStores: (params?: { 
    page?: number; 
    limit?: number; 
    category?: string; 
    search?: string; 
    featured?: boolean; 
  }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.featured) query.append('featured', 'true');
    
    return apiCall(`/api/public/stores?${query}`);
  },
  
  getStore: (slug: string) => 
    apiCall(`/api/public/store/${slug}`),
  
  // Produits
  getProducts: (params?: { 
    page?: number; 
    limit?: number; 
    category?: string; 
    storeId?: string;
    search?: string;
    featured?: boolean;
    sortBy?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.category) query.append('category', params.category);
    if (params?.storeId) query.append('storeId', params.storeId);
    if (params?.search) query.append('search', params.search);
    if (params?.featured) query.append('featured', 'true');
    if (params?.sortBy) query.append('sortBy', params.sortBy);
    
    return apiCall(`/api/public/products?${query}`);
  },
  
  getProduct: (id: string) => 
    apiCall(`/api/public/product/${id}`),
  
  // Catégories
  getCategories: (params?: { storeId?: string }) => {
    const query = new URLSearchParams();
    if (params?.storeId) query.append('storeId', params.storeId);
    
    return apiCall(`/api/public/categories?${query}`);
  },
  
  // Recherche globale
  search: (query: string, params?: { category?: string; storeId?: string }) => {
    const searchParams = new URLSearchParams({ q: query });
    if (params?.category) searchParams.append('category', params.category);
    if (params?.storeId) searchParams.append('storeId', params.storeId);
    
    return apiCall(`/api/public/search?${searchParams}`);
  },
  
  // Vitrines thématiques (pour plus tard)
  getVitrines: () => 
    apiCall('/api/public/vitrines'),
    
  getVitrine: (slug: string) => 
    apiCall(`/api/public/vitrine/${slug}`),
};

export default api;
