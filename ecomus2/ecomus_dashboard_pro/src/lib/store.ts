/**
 * Store global avec Zustand
 * Gestion d'état centralisée pour l'application
 */

import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { logger } from './logger';
import { memoryCache } from './cache';

// ============================================================================
// TYPES ET INTERFACES
// ============================================================================

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'vendor' | 'customer';
  avatar?: string;
  permissions: string[];
  stores?: string[];
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    notifications: boolean;
    emailNotifications: boolean;
  };
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  status: 'active' | 'inactive' | 'suspended';
  ownerId: string;
  settings: {
    currency: string;
    timezone: string;
    taxRate: number;
    shippingEnabled: boolean;
  };
  stats: {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    monthlyRevenue: number;
  };
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  comparePrice?: number;
  cost?: number;
  sku?: string;
  barcode?: string;
  trackQuantity: boolean;
  quantity?: number;
  status: 'active' | 'draft' | 'archived';
  visibility: 'public' | 'private';
  images: string[];
  category?: string;
  tags: string[];
  variants: ProductVariant[];
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  price: number;
  comparePrice?: number;
  cost?: number;
  sku?: string;
  barcode?: string;
  quantity?: number;
  options: Record<string, string>;
  image?: string;
}

export interface Order {
  id: string;
  number: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  fulfillmentStatus: 'unfulfilled' | 'partial' | 'fulfilled';
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  shippingAddress: Address;
  billingAddress: Address;
  notes?: string;
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  title: string;
  variant?: string;
  price: number;
  quantity: number;
  total: number;
  image?: string;
}

export interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone?: string;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  actionText?: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  notifications: {
    desktop: boolean;
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
  privacy: {
    analytics: boolean;
    cookies: boolean;
    tracking: boolean;
  };
}

// ============================================================================
// STORE PRINCIPAL
// ============================================================================

interface AppState {
  // État d'authentification
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Données métier
  stores: Store[];
  currentStore: Store | null;
  products: Product[];
  orders: Order[];
  notifications: Notification[];

  // État de l'interface
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  settings: AppSettings;

  // Cache et performance
  lastSync: Record<string, number>;
  pendingActions: string[];

  // Actions d'authentification
  setUser: (user: User | null) => void;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  updateUserPreferences: (preferences: Partial<User['preferences']>) => void;

  // Actions pour les stores
  setStores: (stores: Store[]) => void;
  setCurrentStore: (store: Store | null) => void;
  addStore: (store: Store) => void;
  updateStore: (storeId: string, updates: Partial<Store>) => void;
  deleteStore: (storeId: string) => void;

  // Actions pour les produits
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  getProductsByStore: (storeId: string) => Product[];

  // Actions pour les commandes
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  getOrdersByStore: (storeId: string) => Order[];
  getOrdersByStatus: (status: Order['status']) => Order[];

  // Actions pour les notifications
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  getUnreadNotifications: () => Notification[];

  // Actions de l'interface
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  updateSettings: (settings: Partial<AppSettings>) => void;

  // Actions de synchronisation
  syncData: (entity: string) => Promise<void>;
  addPendingAction: (action: string) => void;
  removePendingAction: (action: string) => void;
  clearPendingActions: () => void;

  // Actions utilitaires
  reset: () => void;
  hydrate: () => Promise<void>;
}

// État initial
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  stores: [],
  currentStore: null,
  products: [],
  orders: [],
  notifications: [],
  sidebarOpen: true,
  theme: 'system' as const,
  settings: {
    theme: 'system' as const,
    language: 'fr',
    currency: 'EUR',
    timezone: 'Europe/Paris',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '24h' as const,
    notifications: {
      desktop: true,
      email: true,
      push: false,
      marketing: false,
    },
    privacy: {
      analytics: true,
      cookies: true,
      tracking: false,
    },
  },
  lastSync: {},
  pendingActions: [],
};

// ============================================================================
// CRÉATION DU STORE
// ============================================================================

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get) => ({
          ...initialState,

          // Actions d'authentification
          setUser: (user) => {
            set((state) => {
              state.user = user;
              state.isAuthenticated = !!user;
              state.isLoading = false;
            });
          },

          login: async (credentials) => {
            set((state) => {
              state.isLoading = true;
            });

            try {
              // Simulation d'appel API
              const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
              });

              if (!response.ok) {
                throw new Error('Échec de la connexion');
              }

              const user = await response.json();
              get().setUser(user);
              
              logger.info('Utilisateur connecté', { userId: user.id });
            } catch (error) {
              logger.error('Erreur de connexion', { error });
              set((state) => {
                state.isLoading = false;
              });
              throw error;
            }
          },

          logout: () => {
            set((state) => {
              state.user = null;
              state.isAuthenticated = false;
              state.currentStore = null;
              state.stores = [];
              state.products = [];
              state.orders = [];
              state.notifications = [];
            });
            
            // Nettoyer le cache
            memoryCache.clear();
            logger.info('Utilisateur déconnecté');
          },

          updateUserPreferences: (preferences) => {
            set((state) => {
              if (state.user) {
                state.user.preferences = { ...state.user.preferences, ...preferences };
              }
            });
          },

          // Actions pour les stores
          setStores: (stores) => {
            set((state) => {
              state.stores = stores;
              state.lastSync.stores = Date.now();
            });
          },

          setCurrentStore: (store) => {
            set((state) => {
              state.currentStore = store;
            });
          },

          addStore: (store) => {
            set((state) => {
              state.stores.push(store);
            });
          },

          updateStore: (storeId, updates) => {
            set((state) => {
              const index = state.stores.findIndex((s: Store) => s.id === storeId);
              if (index !== -1) {
                state.stores[index] = { ...state.stores[index], ...updates };
              }
              if (state.currentStore?.id === storeId) {
                state.currentStore = { ...state.currentStore, ...updates };
              }
            });
          },

          deleteStore: (storeId) => {
            set((state) => {
              state.stores = state.stores.filter((s: Store) => s.id !== storeId);
              if (state.currentStore?.id === storeId) {
                state.currentStore = null;
              }
              // Supprimer les produits et commandes associés
              state.products = state.products.filter((p: Product) => p.storeId !== storeId);
              state.orders = state.orders.filter((o: Order) => o.storeId !== storeId);
            });
          },

          // Actions pour les produits
          setProducts: (products) => {
            set((state) => {
              state.products = products;
              state.lastSync.products = Date.now();
            });
          },

          addProduct: (product) => {
            set((state) => {
              state.products.push(product);
            });
          },

          updateProduct: (productId, updates) => {
            set((state) => {
              const index = state.products.findIndex((p: Product) => p.id === productId);
              if (index !== -1) {
                state.products[index] = { ...state.products[index], ...updates };
              }
            });
          },

          deleteProduct: (productId) => {
            set((state) => {
              state.products = state.products.filter((p: Product) => p.id !== productId);
            });
          },

          getProductsByStore: (storeId) => {
            return get().products.filter((p: Product) => p.storeId === storeId);
          },

          // Actions pour les commandes
          setOrders: (orders) => {
            set((state) => {
              state.orders = orders;
              state.lastSync.orders = Date.now();
            });
          },

          addOrder: (order) => {
            set((state) => {
              state.orders.unshift(order); // Ajouter au début
            });
          },

          updateOrder: (orderId, updates) => {
            set((state) => {
              const index = state.orders.findIndex((o: Order) => o.id === orderId);
              if (index !== -1) {
                state.orders[index] = { ...state.orders[index], ...updates };
              }
            });
          },

          getOrdersByStore: (storeId) => {
            return get().orders.filter((o: Order) => o.storeId === storeId);
          },

          getOrdersByStatus: (status) => {
            return get().orders.filter((o: Order) => o.status === status);
          },

          // Actions pour les notifications
          setNotifications: (notifications) => {
            set((state) => {
              state.notifications = notifications;
            });
          },

          addNotification: (notification) => {
            set((state) => {
              const newNotification: Notification = {
                ...notification,
                id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                read: false,
                createdAt: new Date().toISOString(),
              };
              state.notifications.unshift(newNotification);
            });
          },

          markNotificationAsRead: (notificationId) => {
            set((state) => {
              const notification = state.notifications.find((n: Notification) => n.id === notificationId);
              if (notification) {
                notification.read = true;
              }
            });
          },

          markAllNotificationsAsRead: () => {
            set((state) => {
              state.notifications.forEach((n: Notification) => {
                n.read = true;
              });
            });
          },

          deleteNotification: (notificationId) => {
            set((state) => {
              state.notifications = state.notifications.filter((n: Notification) => n.id !== notificationId);
            });
          },

          getUnreadNotifications: () => {
            return get().notifications.filter((n: Notification) => !n.read);
          },

          // Actions de l'interface
          toggleSidebar: () => {
            set((state) => {
              state.sidebarOpen = !state.sidebarOpen;
            });
          },

          setSidebarOpen: (open) => {
            set((state) => {
              state.sidebarOpen = open;
            });
          },

          setTheme: (theme) => {
            set((state) => {
              state.theme = theme;
              state.settings.theme = theme;
            });
          },

          updateSettings: (settings) => {
            set((state) => {
              state.settings = { ...state.settings, ...settings };
            });
          },

          // Actions de synchronisation
          syncData: async (entity) => {
            const lastSync = get().lastSync[entity] || 0;
            const now = Date.now();
            
            // Éviter les syncs trop fréquentes (moins de 30 secondes)
            if (now - lastSync < 30000) {
              return;
            }

            try {
              get().addPendingAction(`sync_${entity}`);
              
              const response = await fetch(`/api/${entity}`);
              if (!response.ok) {
                throw new Error(`Erreur de synchronisation ${entity}`);
              }
              
              const data = await response.json();
              
              switch (entity) {
                case 'stores':
                  get().setStores(data);
                  break;
                case 'products':
                  get().setProducts(data);
                  break;
                case 'orders':
                  get().setOrders(data);
                  break;
                case 'notifications':
                  get().setNotifications(data);
                  break;
              }
              
              logger.info(`Synchronisation ${entity} réussie`);
            } catch (error) {
              logger.error(`Erreur de synchronisation ${entity}`, { error });
            } finally {
              get().removePendingAction(`sync_${entity}`);
            }
          },

          addPendingAction: (action) => {
            set((state) => {
              if (!state.pendingActions.includes(action)) {
                state.pendingActions.push(action);
              }
            });
          },

          removePendingAction: (action) => {
            set((state) => {
              state.pendingActions = state.pendingActions.filter((a: string) => a !== action);
            });
          },

          clearPendingActions: () => {
            set((state) => {
              state.pendingActions = [];
            });
          },

          // Actions utilitaires
          reset: () => {
            set(() => ({ ...initialState }));
          },

          hydrate: async () => {
            set((state) => {
              state.isLoading = true;
            });

            try {
              // Charger les données depuis le cache ou l'API
              const cachedUser = await memoryCache.get<User>('current_user');
              if (cachedUser) {
                get().setUser(cachedUser);
              }

              // Synchroniser les données si l'utilisateur est connecté
              if (get().isAuthenticated) {
                await Promise.all([
                  get().syncData('stores'),
                  get().syncData('products'),
                  get().syncData('orders'),
                  get().syncData('notifications'),
                ]);
              }
            } catch (error) {
              logger.error('Erreur lors de l\'hydratation', { error });
            } finally {
              set((state) => {
                state.isLoading = false;
              });
            }
          },
        }))
      ),
      {
        name: 'app-store',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          currentStore: state.currentStore,
          sidebarOpen: state.sidebarOpen,
          theme: state.theme,
          settings: state.settings,
        }),
      }
    ),
    {
      name: 'app-store',
    }
  ));

// ============================================================================
// HOOKS SÉLECTEURS
// ============================================================================

// Hook pour l'authentification
export const useAuth = () => {
  return useAppStore((state) => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    login: state.login,
    logout: state.logout,
    updateUserPreferences: state.updateUserPreferences,
  }));
};

// Hook pour les stores
export const useStores = () => {
  return useAppStore((state) => ({
    stores: state.stores,
    currentStore: state.currentStore,
    setCurrentStore: state.setCurrentStore,
    addStore: state.addStore,
    updateStore: state.updateStore,
    deleteStore: state.deleteStore,
    syncData: state.syncData,
  }));
};

// Hook pour les produits
export const useProducts = () => {
  return useAppStore((state) => ({
    products: state.products,
    addProduct: state.addProduct,
    updateProduct: state.updateProduct,
    deleteProduct: state.deleteProduct,
    getProductsByStore: state.getProductsByStore,
    syncData: state.syncData,
  }));
};

// Hook pour les commandes
export const useOrders = () => {
  return useAppStore((state) => ({
    orders: state.orders,
    addOrder: state.addOrder,
    updateOrder: state.updateOrder,
    getOrdersByStore: state.getOrdersByStore,
    getOrdersByStatus: state.getOrdersByStatus,
    syncData: state.syncData,
  }));
};

// Hook pour les notifications
export const useNotifications = () => {
  return useAppStore((state) => ({
    notifications: state.notifications,
    addNotification: state.addNotification,
    markNotificationAsRead: state.markNotificationAsRead,
    markAllNotificationsAsRead: state.markAllNotificationsAsRead,
    deleteNotification: state.deleteNotification,
    getUnreadNotifications: state.getUnreadNotifications,
  }));
};

// Hook pour l'interface
export const useUI = () => {
  return useAppStore((state) => ({
    sidebarOpen: state.sidebarOpen,
    theme: state.theme,
    settings: state.settings,
    toggleSidebar: state.toggleSidebar,
    setSidebarOpen: state.setSidebarOpen,
    setTheme: state.setTheme,
    updateSettings: state.updateSettings,
  }));
};

// Hook pour les actions en cours
export const usePendingActions = () => {
  return useAppStore((state) => ({
    pendingActions: state.pendingActions,
    addPendingAction: state.addPendingAction,
    removePendingAction: state.removePendingAction,
    clearPendingActions: state.clearPendingActions,
  }));
};

// ============================================================================
// MIDDLEWARE ET UTILITAIRES
// ============================================================================

// Middleware pour la synchronisation automatique
useAppStore.subscribe(
  (state) => state.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      // Synchroniser les données toutes les 5 minutes
      const interval = setInterval(() => {
        const store = useAppStore.getState();
        store.syncData('notifications');
      }, 5 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }
);

// Middleware pour la sauvegarde du cache
useAppStore.subscribe(
  (state) => state.user,
  (user) => {
    if (user) {
      memoryCache.set('current_user', user, 24 * 60 * 60 * 1000); // 24h
    } else {
      memoryCache.delete('current_user');
    }
  }
);

export default useAppStore;