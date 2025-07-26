import { useState, useEffect, useCallback } from 'react';
import { ecomusApi } from '@/lib/ecomus-api';
import { logger } from '@/lib/logger';
import { performanceMonitor, measureAsync } from '@/lib/monitoring/performance-monitor';
import { 
  validateCollection, 
  validateCreateCollection, 
  validateUpdateCollection,
  validateCollectionFilters,
  safeValidateCollection,
  type Collection as ValidatedCollection,
  type CreateCollection,
  type UpdateCollection,
  type CollectionFilters as ValidatedFilters
} from '@/lib/validation/schemas';

export interface Collection {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  imgSrc?: string;
  image?: string;
  altText?: string;
  subheading?: string;
  heading?: string;
  price?: number;
  originalPrice?: number;
  backgroundColor?: string;
  featured: boolean;
  isActive: boolean;
  status: 'active' | 'inactive' | 'draft';
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
  products?: string[];
  itemCount?: number;
  storeId?: string;
  store?: {
    _id: string;
    name: string;
    slug: string;
  };
  tags?: string[];
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface CollectionsFilters {
  page?: number;
  limit?: number;
  search?: string;
  featured?: boolean;
  category?: string;
  categoryId?: string;
  status?: 'active' | 'inactive' | 'draft' | 'all';
  storeId?: string;
  sortBy?: 'createdAt' | 'title' | 'featured' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CollectionsPagination {
  currentPage: number;
  totalPages: number;
  totalCollections: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface UseCollectionsResult {
  collections: Collection[];
  loading: boolean;
  error: string | null;
  pagination: CollectionsPagination | null;
  refetch: () => Promise<void>;
  fetchMore: () => Promise<void>;
  hasMore: boolean;
  createCollection: (data: Partial<Collection>) => Promise<Collection | null>;
  updateCollection: (id: string, data: Partial<Collection>) => Promise<Collection | null>;
  deleteCollection: (id: string) => Promise<boolean>;
  toggleFeatured: (id: string) => Promise<boolean>;
  toggleStatus: (id: string) => Promise<boolean>;
}

export function useCollections(filters: CollectionsFilters = {}, isPublic: boolean = false): UseCollectionsResult {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<CollectionsPagination | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchCollections = useCallback(async (reset: boolean = true) => {
    const operationId = `fetch-collections-${Date.now()}`;
    
    try {
      // Validation des filtres
      const validatedFilters = validateCollectionFilters(filters);
      
      if (reset) {
        setLoading(true);
        performanceMonitor.startCollectionLoad(operationId);
      }
      setError(null);

      const params = {
        ...validatedFilters,
        page: reset ? 1 : (validatedFilters.page || 1)
      };

      logger.info('Fetching collections', {
        component: 'useCollections',
        params,
        isPublic,
        reset
      });

      const response = await measureAsync(
        `collections.fetch.${isPublic ? 'public' : 'admin'}`,
        async () => {
          if (isPublic) {
            return await ecomusApi.getPublicCollections(params);
          } else {
            return await ecomusApi.getCollections(params);
          }
        }
      );

      if (response.success) {
        const newCollections = response.data || [];
        
        // Validation des données reçues
        const validatedCollections = newCollections.map((collection: any) => {
          const validation = safeValidateCollection(collection);
          if (!validation.success) {
            logger.warn('Invalid collection data received', {
              component: 'useCollections',
              collectionId: collection._id,
              errors: validation.error.errors
            });
            return collection; // Retourner les données non validées en cas d'erreur
          }
          return validation.data;
        });
        
        if (reset) {
          setCollections(validatedCollections);
        } else {
          setCollections(prev => [...prev, ...validatedCollections]);
        }

        if (response.pagination) {
          setPagination(response.pagination);
          setHasMore(response.pagination.hasNextPage);
        } else {
          setPagination(null);
          setHasMore(false);
        }

        logger.info('Collections fetched successfully', {
          component: 'useCollections',
          count: validatedCollections.length,
          totalPages: response.pagination?.totalPages
        });

        if (reset) {
          performanceMonitor.endCollectionLoad(operationId, validatedCollections.length);
        }
      } else {
        const errorMessage = response.error || 'Erreur lors du chargement des collections';
        setError(errorMessage);
        logger.error('Failed to fetch collections', {
          component: 'useCollections',
          error: errorMessage,
          params
        });
      }
    } catch (err: any) {
      const errorMessage = 'Erreur de connexion';
      logger.error('Exception while fetching collections', {
        component: 'useCollections',
        error: err.message,
        stack: err.stack,
        params: filters
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters, isPublic]);

  const fetchMore = useCallback(async () => {
    if (!hasMore || loading || !pagination) return;

    const nextPage = pagination.currentPage + 1;
    await fetchCollections(false);
  }, [hasMore, loading, pagination, fetchCollections]);

  const refetch = useCallback(() => {
    return fetchCollections(true);
  }, [fetchCollections]);

  const createCollection = useCallback(async (data: Partial<Collection>): Promise<Collection | null> => {
    try {
      // Validation des données avant envoi
      const validatedData = validateCreateCollection(data);
      
      logger.info('Creating collection', {
        component: 'useCollections',
        title: validatedData.title,
        storeId: validatedData.storeId
      });

      setError(null);
      const response = await measureAsync(
        'collections.create',
        () => ecomusApi.createCollection(validatedData)
      );
      
      if (response.success && response.data) {
        // Validation de la réponse
        const validatedCollection = validateCollection(response.data);
        
        logger.info('Collection created successfully', {
          component: 'useCollections',
          collectionId: validatedCollection._id,
          title: validatedCollection.title
        });
        
        // Ajouter la nouvelle collection au début de la liste
        setCollections(prev => [validatedCollection, ...prev]);
        return validatedCollection;
      } else {
        const errorMessage = response.error || 'Erreur lors de la création de la collection';
        setError(errorMessage);
        logger.error('Failed to create collection', {
          component: 'useCollections',
          error: errorMessage,
          data: validatedData
        });
        return null;
      }
    } catch (err: any) {
      const errorMessage = err.name === 'ZodError' 
        ? 'Données invalides pour la création de la collection'
        : 'Erreur de connexion';
      
      logger.error('Exception while creating collection', {
        component: 'useCollections',
        error: err.message,
        stack: err.stack,
        validationErrors: err.name === 'ZodError' ? err.errors : undefined
      });
      
      setError(errorMessage);
      return null;
    }
  }, []);

  const updateCollection = useCallback(async (id: string, data: Partial<Collection>): Promise<Collection | null> => {
    try {
      // Validation des données avant envoi
      const validatedData = validateUpdateCollection(data);
      
      logger.info('Updating collection', {
        component: 'useCollections',
        collectionId: id,
        updateFields: Object.keys(validatedData)
      });

      setError(null);
      const response = await measureAsync(
        'collections.update',
        () => ecomusApi.updateCollection(id, validatedData)
      );
      
      if (response.success && response.data) {
        // Validation de la réponse
        const validatedCollection = validateCollection(response.data);
        
        logger.info('Collection updated successfully', {
          component: 'useCollections',
          collectionId: validatedCollection._id,
          title: validatedCollection.title
        });
        
        // Mettre à jour la collection dans la liste
        setCollections(prev => 
          prev.map(collection => 
            collection._id === id ? { ...collection, ...validatedCollection } : collection
          )
        );
        return validatedCollection;
      } else {
        const errorMessage = response.error || 'Erreur lors de la mise à jour de la collection';
        setError(errorMessage);
        logger.error('Failed to update collection', {
          component: 'useCollections',
          error: errorMessage,
          collectionId: id,
          data: validatedData
        });
        return null;
      }
    } catch (err: any) {
      const errorMessage = err.name === 'ZodError' 
        ? 'Données invalides pour la mise à jour de la collection'
        : 'Erreur de connexion';
      
      logger.error('Exception while updating collection', {
        component: 'useCollections',
        error: err.message,
        stack: err.stack,
        collectionId: id,
        validationErrors: err.name === 'ZodError' ? err.errors : undefined
      });
      
      setError(errorMessage);
      return null;
    }
  }, []);

  const deleteCollection = useCallback(async (id: string): Promise<boolean> => {
    try {
      logger.info('Deleting collection', {
        component: 'useCollections',
        collectionId: id
      });

      setError(null);
      const response = await measureAsync(
        'collections.delete',
        () => ecomusApi.deleteCollection(id)
      );
      
      if (response.success) {
        logger.info('Collection deleted successfully', {
          component: 'useCollections',
          collectionId: id
        });
        
        // Supprimer la collection de la liste
        setCollections(prev => prev.filter(collection => collection._id !== id));
        return true;
      } else {
        const errorMessage = response.error || 'Erreur lors de la suppression de la collection';
        setError(errorMessage);
        logger.error('Failed to delete collection', {
          component: 'useCollections',
          error: errorMessage,
          collectionId: id
        });
        return false;
      }
    } catch (err: any) {
      logger.error('Exception while deleting collection', {
        component: 'useCollections',
        error: err.message,
        stack: err.stack,
        collectionId: id
      });
      
      setError('Erreur de connexion');
      return false;
    }
  }, []);

  const toggleFeatured = useCallback(async (id: string): Promise<boolean> => {
    try {
      logger.info('Toggling collection featured status', {
        component: 'useCollections',
        collectionId: id
      });
      
      setError(null);
      const response = await measureAsync(
        'collections.toggle-featured',
        () => ecomusApi.toggleCollectionFeatured(id)
      );
      
      if (response.success && response.data) {
        logger.info('Collection featured status toggled successfully', {
          component: 'useCollections',
          collectionId: id,
          newFeaturedStatus: response.data.featured
        });
        
        // Mettre à jour la collection dans la liste
        setCollections(prev => 
          prev.map(collection => 
            collection._id === id ? { ...collection, featured: response.data.featured } : collection
          )
        );
        return true;
      } else {
        const errorMessage = response.error || 'Erreur lors de la mise à jour du statut vedette';
        setError(errorMessage);
        logger.error('Failed to toggle collection featured status', {
          component: 'useCollections',
          error: errorMessage,
          collectionId: id
        });
        return false;
      }
    } catch (err: any) {
      logger.error('Exception while toggling collection featured status', {
        component: 'useCollections',
        error: err.message,
        stack: err.stack,
        collectionId: id
      });
      
      setError('Erreur de connexion');
      return false;
    }
  }, []);

  const toggleStatus = useCallback(async (id: string): Promise<boolean> => {
    try {
      logger.info('Toggling collection status', {
        component: 'useCollections',
        collectionId: id
      });
      
      setError(null);
      const response = await measureAsync(
        'collections.toggle-status',
        () => ecomusApi.toggleCollectionStatus(id)
      );
      
      if (response.success && response.data) {
        logger.info('Collection status toggled successfully', {
          component: 'useCollections',
          collectionId: id,
          newStatus: response.data.status,
          newIsActive: response.data.isActive
        });
        
        // Mettre à jour la collection dans la liste
        setCollections(prev => 
          prev.map(collection => 
            collection._id === id ? { 
              ...collection, 
              status: response.data.status,
              isActive: response.data.isActive 
            } : collection
          )
        );
        return true;
      } else {
        const errorMessage = response.error || 'Erreur lors de la mise à jour du statut';
        setError(errorMessage);
        logger.error('Failed to toggle collection status', {
          component: 'useCollections',
          error: errorMessage,
          collectionId: id
        });
        return false;
      }
    } catch (err: any) {
      logger.error('Exception while toggling collection status', {
        component: 'useCollections',
        error: err.message,
        stack: err.stack,
        collectionId: id
      });
      
      setError('Erreur de connexion');
      return false;
    }
  }, []);

  useEffect(() => {
    fetchCollections(true);
  }, [fetchCollections]);

  return {
    collections,
    loading,
    error,
    pagination,
    refetch,
    fetchMore,
    hasMore,
    createCollection,
    updateCollection,
    deleteCollection,
    toggleFeatured,
    toggleStatus
  };
}

// Hook spécialisé pour les collections publiques
export function usePublicCollections(filters: Omit<CollectionsFilters, 'status'> = {}) {
  return useCollections({ ...filters, status: 'active' }, true);
}

// Hook spécialisé pour les collections en vedette
export function useFeaturedCollections(filters: Omit<CollectionsFilters, 'featured'> = {}) {
  return usePublicCollections({ ...filters, featured: true });
}

// Hook spécialisé pour les collections par catégorie
export function useCollectionsByCategory(categoryId: string, filters: CollectionsFilters = {}) {
  return usePublicCollections({ ...filters, categoryId });
}

// Hook spécialisé pour les collections par store
export function useCollectionsByStore(storeId: string, filters: CollectionsFilters = {}) {
  return usePublicCollections({ ...filters, storeId });
}

// Hook pour une collection unique
export function useCollection(id: string, isPublic: boolean = false) {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCollection = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (isPublic) {
        response = await ecomusApi.getPublicCollection(id);
      } else {
        response = await ecomusApi.getCollection(id);
      }

      if (response.success && response.data) {
        setCollection(response.data);
      } else {
        setError(response.error || 'Collection non trouvée');
      }
    } catch (err) {
      console.error('Erreur lors du chargement de la collection:', err);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }, [id, isPublic]);

  const updateCollection = useCallback(async (data: Partial<Collection>): Promise<Collection | null> => {
    try {
      setError(null);
      const response = await ecomusApi.updateCollection(id, data);
      
      if (response.success && response.data) {
        setCollection(response.data);
        return response.data;
      } else {
        setError(response.error || 'Erreur lors de la mise à jour');
        return null;
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      setError('Erreur de connexion');
      return null;
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchCollection();
    }
  }, [fetchCollection]);

  return {
    collection,
    loading,
    error,
    refetch: fetchCollection,
    updateCollection
  };
}