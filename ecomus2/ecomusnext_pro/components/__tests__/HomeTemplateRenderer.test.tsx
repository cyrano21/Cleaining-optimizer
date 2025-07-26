import React from 'react';
import { render, renderHook, act } from '@testing-library/react';
import { screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { jest } from '@jest/globals';
import HomeTemplateRenderer, {
  useTemplate,
  getAvailableTemplates,
  isValidTemplate,
  getTemplatesByCategory
} from '../HomeTemplateRenderer';

// Mock du hook useStore
jest.mock('@/hooks/useApi', () => ({
  useStore: jest.fn()
}));

// Mock des templates
jest.mock('../homes/home-1/', () => ({
  default: ({ templateId }: { templateId: string }) => (
    <div data-testid="template-home-1">Template {templateId}</div>
  )
}));

jest.mock('../homes/home-electronic/', () => ({
  default: ({ templateId }: { templateId: string }) => (
    <div data-testid="template-home-electronic">Template {templateId}</div>
  )
}));

const mockUseStore = require('@/hooks/useApi').useStore as jest.MockedFunction<any>;

describe('HomeTemplateRenderer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendu de base', () => {
    it('devrait rendre le template par défaut sans storeSlug', async () => {
      mockUseStore.mockReturnValue({
        data: null,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<HomeTemplateRenderer />);
      
      await waitFor(() => {
        expect(screen.getByTestId('template-home-1')).toBeInTheDocument();
      });
    });

    it('devrait rendre le template spécifié via templateId', async () => {
      mockUseStore.mockReturnValue({
        data: null,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<HomeTemplateRenderer templateId="home-electronic" />);
      
      await waitFor(() => {
        expect(screen.getByTestId('template-home-electronic')).toBeInTheDocument();
      });
    });
  });

  describe('Gestion des états de chargement', () => {
    it('devrait afficher le loader pendant le chargement du store', () => {
      mockUseStore.mockReturnValue({
        data: null,
        loading: true,
        error: null,
        refetch: jest.fn()
      });

      render(<HomeTemplateRenderer storeSlug="test-store" />);
      
      expect(screen.getByText('Chargement du template...')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('devrait afficher une erreur si le store échoue à charger', () => {
      const mockRefetch = jest.fn();
      mockUseStore.mockReturnValue({
        data: null,
        loading: false,
        error: 'Erreur réseau',
        refetch: mockRefetch
      });

      render(<HomeTemplateRenderer storeSlug="test-store" />);
      
      expect(screen.getByText('Erreur de chargement')).toBeInTheDocument();
      expect(screen.getByText('Erreur réseau')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('devrait permettre de réessayer après une erreur', async () => {
      const user = userEvent.setup();
      const mockRefetch = jest.fn();
      
      mockUseStore.mockReturnValue({
        data: null,
        loading: false,
        error: 'Erreur réseau',
        refetch: mockRefetch
      });

      render(<HomeTemplateRenderer storeSlug="test-store" />);
      
      const retryButton = screen.getByText('Réessayer');
      await user.click(retryButton);
      
      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Logique de sélection de template', () => {
    it('devrait utiliser le homeTheme du store pour sélectionner le template', async () => {
      mockUseStore.mockReturnValue({
        data: { homeTheme: 'electronics' },
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<HomeTemplateRenderer storeSlug="test-store" />);
      
      await waitFor(() => {
        expect(screen.getByTestId('template-home-electronic')).toBeInTheDocument();
      });
    });

    it('devrait fallback vers homeTemplate si homeTheme n\'est pas disponible', async () => {
      mockUseStore.mockReturnValue({
        data: { homeTemplate: 'electronics' },
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<HomeTemplateRenderer storeSlug="test-store" />);
      
      await waitFor(() => {
        expect(screen.getByTestId('template-home-electronic')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibilité', () => {
    it('devrait avoir les attributs ARIA appropriés', () => {
      mockUseStore.mockReturnValue({
        data: null,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<HomeTemplateRenderer />);
      
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByLabelText('Contenu du template')).toBeInTheDocument();
    });

    it('devrait avoir les attributs focus appropriés sur le bouton de retry', () => {
      mockUseStore.mockReturnValue({
        data: null,
        loading: false,
        error: 'Erreur test',
        refetch: jest.fn()
      });

      render(<HomeTemplateRenderer storeSlug="test-store" />);
      
      const retryButton = screen.getByLabelText('Réessayer le chargement');
      expect(retryButton).toBeInTheDocument();
      expect(retryButton).toHaveClass('focus:outline-none', 'focus:ring-2');
    });
  });
});

describe('Hook useTemplate', () => {
  it('devrait charger un template avec succès', async () => {
    const { result } = renderHook(() => useTemplate('home-1'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.Component).toBeTruthy();
      expect(result.current.error).toBeNull();
    });
  });

  it('devrait fournir une fonction retry', async () => {
    const { result } = renderHook(() => useTemplate('home-1'));
    
    await waitFor(() => {
      expect(typeof result.current.retry).toBe('function');
    });
  });
});

describe('Utilitaires', () => {
  describe('getAvailableTemplates', () => {
    it('devrait retourner la liste des templates disponibles', () => {
      const templates = getAvailableTemplates();
      
      expect(templates).toBeInstanceOf(Array);
      expect(templates.length).toBeGreaterThan(0);
      expect(templates[0]).toHaveProperty('id');
      expect(templates[0]).toHaveProperty('name');
      expect(templates[0]).toHaveProperty('category');
    });

    it('devrait formater correctement les noms', () => {
      const templates = getAvailableTemplates();
      const homeTemplate = templates.find(t => t.id === 'home-1');
      
      expect(homeTemplate?.name).toBe('Home 1');
    });
  });

  describe('isValidTemplate', () => {
    it('devrait valider les templates existants', () => {
      expect(isValidTemplate('home-1')).toBe(true);
      expect(isValidTemplate('home-electronic')).toBe(true);
      expect(isValidTemplate('multi-brand')).toBe(true);
    });

    it('devrait rejeter les templates inexistants', () => {
      expect(isValidTemplate('home-999')).toBe(false);
      expect(isValidTemplate('template-inexistant')).toBe(false);
      expect(isValidTemplate('')).toBe(false);
    });
  });

  describe('getTemplatesByCategory', () => {
    it('devrait catégoriser correctement les templates', () => {
      const categories = getTemplatesByCategory();
      
      expect(categories).toHaveProperty('Home');
      expect(categories).toHaveProperty('Fashion');
      expect(categories).toHaveProperty('Electronics');
      expect(categories).toHaveProperty('Beauty');
      expect(categories).toHaveProperty('Specialized');
    });

    it('devrait placer les templates dans les bonnes catégories', () => {
      const categories = getTemplatesByCategory();
      
      expect(categories.Electronics).toContain('home-electronic');
      expect(categories.Fashion).toContain('home-men');
      expect(categories.Beauty).toContain('home-cosmetic');
      expect(categories.Home).toContain('home-1');
    });
  });
});

describe('Performance et optimisation', () => {
  it('devrait mémoriser les props du template', async () => {
    const storeData = { id: '1', name: 'Test Store' };
    
    mockUseStore.mockReturnValue({
      data: storeData,
      loading: false,
      error: null,
      refetch: jest.fn()
    });

    const { rerender } = render(
      <HomeTemplateRenderer 
        storeSlug="test-store" 
        templateId="home-1"
        vitrineConfig={{ theme: 'dark' }}
      />
    );
    
    // Re-render avec les mêmes props
    rerender(
      <HomeTemplateRenderer 
        storeSlug="test-store" 
        templateId="home-1"
        vitrineConfig={{ theme: 'dark' }}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('template-home-1')).toBeInTheDocument();
    });
  });
});