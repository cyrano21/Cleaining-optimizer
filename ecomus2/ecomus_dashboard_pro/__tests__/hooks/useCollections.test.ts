import { renderHook, act, waitFor } from '@testing-library/react';
import { useCollections } from '@/hooks/useCollections';
import { logger } from '@/lib/logger';
import { performanceMonitor } from '@/lib/monitoring/performance-monitor';
import * as ecomusApi from '@/lib/ecomus-api';
import * as schemas from '@/lib/validation/schemas';

// Mock des dépendances
jest.mock('@/lib/logger');
jest.mock('@/lib/monitoring/performance-monitor');
jest.mock('@/lib/ecomus-api');
jest.mock('@/lib/validation/schemas');

const mockCollections = [
  {
    _id: '1',
    title: 'Collection Test 1',
    slug: 'collection-test-1',
    description: 'Description de test',
    imgSrc: '/test-image-1.jpg',
    altText: 'Image de test 1',
    category: { name: 'Catégorie Test' },
    itemCount: 10,
    isActive: true,
    isFeatured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '2',
    title: 'Collection Test 2',
    slug: 'collection-test-2',
    description: 'Description de test 2',
    imgSrc: '/test-image-2.jpg',
    altText: 'Image de test 2',
    category: { name: 'Catégorie Test 2' },
    itemCount: 15,
    isActive: true,
    isFeatured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const mockEcomusApi = ecomusApi as jest.Mocked<typeof ecomusApi>;
const mockLogger = logger as jest.Mocked<typeof logger>;
const mockPerformanceMonitor = performanceMonitor as jest.Mocked<typeof performanceMonitor>;
const mockSchemas = schemas as jest.Mocked<typeof schemas>;

describe('useCollections', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock des fonctions de validation
    mockSchemas.validateCollectionFilters.mockReturnValue({ success: true, data: {} });
    mockSchemas.safeValidateCollection.mockReturnValue({ success: true, data: mockCollections[0] });
    mockSchemas.validateCreateCollection.mockReturnValue({ success: true, data: {} });
    mockSchemas.validateUpdateCollection.mockReturnValue({ success: true, data: {} });
    
    // Mock des réponses API
    mockEcomusApi.getCollections.mockResolvedValue({
      success: true,
      data: mockCollections,
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1
      }
    });
    
    mockEcomusApi.createCollection.mockResolvedValue({
      success: true,
      data: mockCollections[0]
    });
    
    mockEcomusApi.updateCollection.mockResolvedValue({
      success: true,
      data: { ...mockCollections[0], title: 'Titre modifié' }
    });
    
    mockEcomusApi.deleteCollection.mockResolvedValue({
      success: true
    });
    
    mockEcomusApi.toggleCollectionFeatured.mockResolvedValue({
      success: true,
      data: { ...mockCollections[0], isFeatured: true }
    });
    
    mockEcomusApi.toggleCollectionStatus.mockResolvedValue({
      success: true,
      data: { ...mockCollections[0], isActive: false }
    });
    
    // Mock du performance monitor
    mockPerformanceMonitor.startCollectionLoad.mockReturnValue('load-id');
    mockPerformanceMonitor.endCollectionLoad.mockImplementation(() => {});
  });

  describe('Chargement des collections', () => {
    it('devrait charger les collections avec succès', async () => {
      const { result } = renderHook(() => useCollections());
      
      expect(result.current.loading).toBe(true);
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.collections).toHaveLength(2);
        expect(result.current.error).toBeNull();
      });
    });

    it('devrait logger le début et la fin du chargement', async () => {
      const { result } = renderHook(() => useCollections());
      
      await waitFor(() => {
        expect(mockLogger.info).toHaveBeenCalledWith(
          'Starting collections fetch',
          expect.objectContaining({
            operation: 'fetchCollections'
          })
        );
        
        expect(mockLogger.info).toHaveBeenCalledWith(
          'Collections fetched successfully',
          expect.objectContaining({
            operation: 'fetchCollections',
            count: 2
          })
        );
      });
    });

    it('devrait valider les filtres avant la requête', async () => {
      const filters = { category: 'test', isActive: true };
      const { result } = renderHook(() => useCollections(filters));
      
      await waitFor(() => {
        expect(mockSchemas.validateCollectionFilters).toHaveBeenCalledWith(filters);
      });
    });

    it('devrait valider chaque collection reçue', async () => {
      const { result } = renderHook(() => useCollections());
      
      await waitFor(() => {
        expect(mockSchemas.safeValidateCollection).toHaveBeenCalledTimes(2);
      });
    });

    it('devrait gérer les erreurs de validation des filtres', async () => {
      mockSchemas.validateCollectionFilters.mockReturnValue({
        success: false,
        error: { errors: [{ message: 'Filtre invalide' }] }
      });
      
      const { result } = renderHook(() => useCollections({ category: 'invalid' }));
      
      await waitFor(() => {
        expect(mockLogger.error).toHaveBeenCalledWith(
          'Invalid collection filters',
          expect.objectContaining({
            operation: 'fetchCollections'
          })
        );
      });
    });

    it('devrait gérer les erreurs API', async () => {
      mockEcomusApi.getCollections.mockResolvedValue({
        success: false,
        error: 'Erreur API'
      });
      
      const { result } = renderHook(() => useCollections());
      
      await waitFor(() => {
        expect(result.current.error).toBe('Erreur lors du chargement des collections');
        expect(mockLogger.error).toHaveBeenCalledWith(
          'Failed to fetch collections',
          expect.objectContaining({
            operation: 'fetchCollections',
            error: 'Erreur API'
          })
        );
      });
    });

    it('devrait gérer les exceptions', async () => {
      const error = new Error('Erreur de réseau');
      mockEcomusApi.getCollections.mockRejectedValue(error);
      
      const { result } = renderHook(() => useCollections());
      
      await waitFor(() => {
        expect(result.current.error).toBe('Erreur de connexion');
        expect(mockLogger.error).toHaveBeenCalledWith(
          'Exception during collections fetch',
          expect.objectContaining({
            operation: 'fetchCollections',
            error: 'Erreur de réseau'
          })
        );
      });
    });
  });

  describe('Création de collection', () => {
    it('devrait créer une collection avec succès', async () => {
      const { result } = renderHook(() => useCollections());
      
      const newCollection = {
        title: 'Nouvelle Collection',
        description: 'Description',
        category: 'test'
      };
      
      await act(async () => {
        await result.current.createCollection(newCollection);
      });
      
      expect(mockSchemas.validateCreateCollection).toHaveBeenCalledWith(newCollection);
      expect(mockEcomusApi.createCollection).toHaveBeenCalledWith(newCollection);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Collection created successfully',
        expect.objectContaining({
          operation: 'createCollection'
        })
      );
    });

    it('devrait gérer les erreurs de validation lors de la création', async () => {
      mockSchemas.validateCreateCollection.mockReturnValue({
        success: false,
        error: { errors: [{ message: 'Données invalides' }] }
      });
      
      const { result } = renderHook(() => useCollections());
      
      await act(async () => {
        await result.current.createCollection({ title: '' });
      });
      
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Invalid collection data for creation',
        expect.objectContaining({
          operation: 'createCollection'
        })
      );
    });
  });

  describe('Mise à jour de collection', () => {
    it('devrait mettre à jour une collection avec succès', async () => {
      const { result } = renderHook(() => useCollections());
      
      const updateData = {
        title: 'Titre modifié',
        description: 'Description modifiée'
      };
      
      await act(async () => {
        await result.current.updateCollection('1', updateData);
      });
      
      expect(mockSchemas.validateUpdateCollection).toHaveBeenCalledWith(updateData);
      expect(mockEcomusApi.updateCollection).toHaveBeenCalledWith('1', updateData);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Collection updated successfully',
        expect.objectContaining({
          operation: 'updateCollection',
          collectionId: '1'
        })
      );
    });
  });

  describe('Suppression de collection', () => {
    it('devrait supprimer une collection avec succès', async () => {
      const { result } = renderHook(() => useCollections());
      
      // Attendre que les collections soient chargées
      await waitFor(() => {
        expect(result.current.collections).toHaveLength(2);
      });
      
      await act(async () => {
        await result.current.deleteCollection('1');
      });
      
      expect(mockEcomusApi.deleteCollection).toHaveBeenCalledWith('1');
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Collection deleted successfully',
        expect.objectContaining({
          operation: 'deleteCollection',
          collectionId: '1'
        })
      );
      
      // Vérifier que la collection a été supprimée de l'état local
      expect(result.current.collections).toHaveLength(1);
      expect(result.current.collections[0]._id).toBe('2');
    });
  });

  describe('Basculement du statut featured', () => {
    it('devrait basculer le statut featured avec succès', async () => {
      const { result } = renderHook(() => useCollections());
      
      // Attendre que les collections soient chargées
      await waitFor(() => {
        expect(result.current.collections).toHaveLength(2);
      });
      
      await act(async () => {
        await result.current.toggleFeatured('1');
      });
      
      expect(mockEcomusApi.toggleCollectionFeatured).toHaveBeenCalledWith('1');
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Collection featured status toggled successfully',
        expect.objectContaining({
          operation: 'toggleFeatured',
          collectionId: '1'
        })
      );
    });
  });

  describe('Basculement du statut actif', () => {
    it('devrait basculer le statut actif avec succès', async () => {
      const { result } = renderHook(() => useCollections());
      
      // Attendre que les collections soient chargées
      await waitFor(() => {
        expect(result.current.collections).toHaveLength(2);
      });
      
      await act(async () => {
        await result.current.toggleStatus('1');
      });
      
      expect(mockEcomusApi.toggleCollectionStatus).toHaveBeenCalledWith('1');
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Collection status toggled successfully',
        expect.objectContaining({
          operation: 'toggleStatus',
          collectionId: '1'
        })
      );
    });
  });

  describe('Monitoring des performances', () => {
    it('devrait démarrer et arrêter le monitoring pour le chargement', async () => {
      const { result } = renderHook(() => useCollections());
      
      await waitFor(() => {
        expect(mockPerformanceMonitor.startCollectionLoad).toHaveBeenCalled();
        expect(mockPerformanceMonitor.endCollectionLoad).toHaveBeenCalledWith('load-id', 2);
      });
    });
  });

  describe('Gestion de la pagination', () => {
    it('devrait gérer la pagination correctement', async () => {
      const { result } = renderHook(() => useCollections(undefined, { page: 2, limit: 5 }));
      
      await waitFor(() => {
        expect(mockEcomusApi.getCollections).toHaveBeenCalledWith(
          expect.objectContaining({
            page: 2,
            limit: 5
          })
        );
      });
    });
  });
});