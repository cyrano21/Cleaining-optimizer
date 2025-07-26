import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DynamicCollections from '@/components/shared/DynamicCollections';
import { logger } from '@/lib/logger';
import { performanceMonitor } from '@/lib/monitoring/performance-monitor';
import * as ecomusApi from '@/lib/ecomus-api';

// Mock des dépendances
jest.mock('@/lib/logger');
jest.mock('@/lib/monitoring/performance-monitor');
jest.mock('@/lib/ecomus-api');
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});
jest.mock('next/link', () => {
  return function MockLink({ href, children, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

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

describe('DynamicCollections', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEcomusApi.getPublicCollections.mockResolvedValue({
      success: true,
      data: mockCollections
    });
  });

  describe('Rendu et fonctionnalité de base', () => {
    it('devrait afficher le loader pendant le chargement', () => {
      render(<DynamicCollections config={{ variant: 'fashion' }} />);
      expect(screen.getByText('Chargement des collections...')).toBeInTheDocument();
    });

    it('devrait afficher les collections après le chargement', async () => {
      render(<DynamicCollections config={{ variant: 'fashion' }} />);
      
      await waitFor(() => {
        expect(screen.getByText('Collection Test 1')).toBeInTheDocument();
        expect(screen.getByText('Collection Test 2')).toBeInTheDocument();
      });
    });

    it('devrait afficher un message quand aucune collection n\'est disponible', async () => {
      mockEcomusApi.getPublicCollections.mockResolvedValue({
        success: true,
        data: []
      });

      render(<DynamicCollections config={{ variant: 'fashion' }} />);
      
      await waitFor(() => {
        expect(screen.getByText('Aucune collection disponible pour le moment.')).toBeInTheDocument();
      });
    });

    it('devrait afficher une erreur en cas d\'échec de l\'API', async () => {
      mockEcomusApi.getPublicCollections.mockResolvedValue({
        success: false,
        error: 'Erreur API'
      });

      render(<DynamicCollections config={{ variant: 'fashion' }} />);
      
      await waitFor(() => {
        expect(screen.getByText('Erreur lors du chargement des collections')).toBeInTheDocument();
        expect(screen.getByText('Réessayer')).toBeInTheDocument();
      });
    });
  });

  describe('Logging et monitoring', () => {
    it('devrait logger le début du chargement des collections', async () => {
      render(<DynamicCollections config={{ variant: 'fashion' }} />);
      
      await waitFor(() => {
        expect(mockLogger.info).toHaveBeenCalledWith(
          'Fetching collections for dynamic component',
          expect.objectContaining({
            component: 'DynamicCollections',
            variant: 'fashion'
          })
        );
      });
    });

    it('devrait logger le succès du chargement', async () => {
      render(<DynamicCollections config={{ variant: 'fashion' }} />);
      
      await waitFor(() => {
        expect(mockLogger.info).toHaveBeenCalledWith(
          'Collections loaded successfully in dynamic component',
          expect.objectContaining({
            component: 'DynamicCollections',
            count: 2,
            variant: 'fashion'
          })
        );
      });
    });

    it('devrait logger les erreurs d\'API', async () => {
      mockEcomusApi.getPublicCollections.mockResolvedValue({
        success: false,
        error: 'Erreur API'
      });

      render(<DynamicCollections config={{ variant: 'fashion' }} />);
      
      await waitFor(() => {
        expect(mockLogger.error).toHaveBeenCalledWith(
          'Failed to load collections in dynamic component',
          expect.objectContaining({
            component: 'DynamicCollections',
            error: 'Erreur API'
          })
        );
      });
    });

    it('devrait logger les exceptions', async () => {
      const error = new Error('Erreur de réseau');
      mockEcomusApi.getPublicCollections.mockRejectedValue(error);

      render(<DynamicCollections config={{ variant: 'fashion' }} />);
      
      await waitFor(() => {
        expect(mockLogger.error).toHaveBeenCalledWith(
          'Exception while loading collections in dynamic component',
          expect.objectContaining({
            component: 'DynamicCollections',
            error: 'Erreur de réseau'
          })
        );
      });
    });
  });

  describe('Layouts différents', () => {
    it('devrait rendre le layout grid correctement', async () => {
      render(
        <DynamicCollections 
          config={{ 
            variant: 'fashion',
            layout: 'grid'
          }} 
        />
      );
      
      await waitFor(() => {
        const gridContainer = document.querySelector('.row');
        expect(gridContainer).toBeInTheDocument();
      });
    });

    it('devrait rendre le layout circle correctement', async () => {
      render(
        <DynamicCollections 
          config={{ 
            variant: 'fashion',
            layout: 'circle'
          }} 
        />
      );
      
      await waitFor(() => {
        const circleItems = document.querySelectorAll('.collection-item-circle');
        expect(circleItems).toHaveLength(2);
      });
    });

    it('devrait rendre le layout banner correctement', async () => {
      render(
        <DynamicCollections 
          config={{ 
            variant: 'fashion',
            layout: 'banner'
          }} 
        />
      );
      
      await waitFor(() => {
        const bannerItems = document.querySelectorAll('.collection-item-banner');
        expect(bannerItems).toHaveLength(2);
      });
    });
  });

  describe('Fonctionnalité de réessai', () => {
    it('devrait permettre de réessayer après une erreur', async () => {
      // Premier appel échoue
      mockEcomusApi.getPublicCollections.mockResolvedValueOnce({
        success: false,
        error: 'Erreur API'
      });
      
      // Deuxième appel réussit
      mockEcomusApi.getPublicCollections.mockResolvedValueOnce({
        success: true,
        data: mockCollections
      });

      render(<DynamicCollections config={{ variant: 'fashion' }} />);
      
      // Attendre l'erreur
      await waitFor(() => {
        expect(screen.getByText('Erreur lors du chargement des collections')).toBeInTheDocument();
      });

      // Cliquer sur réessayer
      const retryButton = screen.getByText('Réessayer');
      fireEvent.click(retryButton);

      // Vérifier que les collections sont chargées
      await waitFor(() => {
        expect(screen.getByText('Collection Test 1')).toBeInTheDocument();
      });

      // Vérifier que l'API a été appelée deux fois
      expect(mockEcomusApi.getPublicCollections).toHaveBeenCalledTimes(2);
    });
  });

  describe('Configuration et personnalisation', () => {
    it('devrait afficher le titre et sous-titre quand configurés', async () => {
      render(
        <DynamicCollections 
          config={{ 
            variant: 'fashion',
            showTitle: true,
            title: 'Titre de test',
            subtitle: 'Sous-titre de test'
          }} 
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('Titre de test')).toBeInTheDocument();
        expect(screen.getByText('Sous-titre de test')).toBeInTheDocument();
      });
    });

    it('devrait appliquer les classes CSS personnalisées', async () => {
      render(
        <DynamicCollections 
          config={{ 
            variant: 'fashion',
            className: 'custom-class'
          }} 
        />
      );
      
      await waitFor(() => {
        const section = document.querySelector('section');
        expect(section).toHaveClass('custom-class');
      });
    });
  });
});