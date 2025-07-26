import React, { Suspense, lazy, useMemo, useCallback } from 'react';
import { useStore } from '@/hooks/useApi';
import { Store } from '@/types/store';

// Types améliorés
type TemplateId = typeof AVAILABLE_TEMPLATES[number];

interface VitrineConfig {
  theme?: string;
  customization?: Record<string, any>;
  features?: string[];
}

interface HomeTemplateProps {
  storeSlug?: string;
  templateId?: TemplateId;
  vitrineConfig?: VitrineConfig;
  fallbackTemplate?: TemplateId;
}

interface TemplateComponentProps {
  store?: Store;
  vitrineConfig?: VitrineConfig;
  templateId: TemplateId;
  isStore: boolean;
  isVitrine: boolean;
}

interface TemplateErrorProps {
  error: string;
  onRetry?: () => void;
}

// Constantes et mappings
const AVAILABLE_TEMPLATES = [
  'home-1', 'home-2', 'home-3', 'home-4', 'home-5', 'home-6',
  'home-7', 'home-8', 'home-handbag',
  'home-fashion', 'home-cosmetic', 'home-jewerly', 'home-electronic',
  'home-furniture', 'home-grocery', 'home-kids', 'home-accessories',
  'home-activewear', 'home-footwear', 'home-men', 'home-decor',
  'home-skincare', 'home-swimwear', 'multi-brand'
] as const;

const THEME_TEMPLATE_MAPPING: Record<string, TemplateId> = {
  'electronics': 'home-electronic',
  'fashion': 'home-men',
  'beauty': 'home-cosmetic',
  'modern': 'home-1',
  'default': 'home-1'
} as const;

const DEFAULT_TEMPLATE: TemplateId = 'home-1';

// Utilitaires
const normalizeTemplateId = (templateId: string): TemplateId => {
  let normalized = templateId;
  if (templateId.startsWith('home-0')) {
    normalized = templateId.replace('home-0', 'home-');
  }
  
  return AVAILABLE_TEMPLATES.includes(normalized as TemplateId) 
    ? normalized as TemplateId 
    : DEFAULT_TEMPLATE;
};

const getTemplateFromTheme = (theme: string): TemplateId => {
  return THEME_TEMPLATE_MAPPING[theme] || DEFAULT_TEMPLATE;
};

// Logger structuré
const logger = {
  templateLoad: (templateId: TemplateId, success: boolean) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Template] ${success ? 'Loaded' : 'Failed'}: ${templateId}`);
    }
  },
  templateError: (templateId: TemplateId, error: Error) => {
    console.error(`[Template Error] ${templateId}:`, error);
  }
};

// Loader de template optimisé avec cache
const templateCache = new Map<TemplateId, React.ComponentType<any>>();

const loadTemplateComponent = (templateId: string): React.ComponentType<TemplateComponentProps> => {
  const normalizedId = normalizeTemplateId(templateId);
  
  // Vérifier le cache
  if (templateCache.has(normalizedId)) {
    logger.templateLoad(normalizedId, true);
    return templateCache.get(normalizedId)!;
  }

  const LazyComponent = lazy(async () => {
    try {
      const module = await import(`./homes/${normalizedId}/`);
      logger.templateLoad(normalizedId, true);
      return module;
    } catch (error) {
      logger.templateError(normalizedId, error as Error);
      
      // Fallback vers le template par défaut
      if (normalizedId !== DEFAULT_TEMPLATE) {
        try {
          const fallbackModule = await import(`./homes/${DEFAULT_TEMPLATE}/`);
          logger.templateLoad(DEFAULT_TEMPLATE, true);
          return fallbackModule;
        } catch (fallbackError) {
          logger.templateError(DEFAULT_TEMPLATE, fallbackError as Error);
          throw fallbackError;
        }
      }
      throw error;
    }
  });

  // Mettre en cache
  templateCache.set(normalizedId, LazyComponent);
  return LazyComponent;
};

// Composants UI améliorés
const TemplateLoader = React.memo(() => (
  <div className="flex items-center justify-center min-h-screen" role="status" aria-label="Chargement du template">
    <div className="text-center">
      <div 
        className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
        aria-hidden="true"
      />
      <p className="text-gray-600">Chargement du template...</p>
    </div>
  </div>
));

TemplateLoader.displayName = 'TemplateLoader';

const TemplateError = React.memo<TemplateErrorProps>(({ error, onRetry }) => (
  <div className="flex items-center justify-center min-h-screen" role="alert">
    <div className="text-center">
      <div className="text-red-500 mb-4" aria-hidden="true">
        <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" 
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
      <p className="text-gray-600 mb-4">{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Réessayer le chargement"
        >
          Réessayer
        </button>
      )}
    </div>
  </div>
));

TemplateError.displayName = 'TemplateError';

// Hook personnalisé pour la logique de template
const useTemplateLogic = ({
  storeSlug,
  propTemplateId,
  fallbackTemplate = DEFAULT_TEMPLATE
}: {
  storeSlug?: string;
  propTemplateId?: TemplateId;
  fallbackTemplate?: TemplateId;
}) => {
  const { 
    data: storeData, 
    loading: storeLoading, 
    error: storeError,
    refetch
  } = useStore(storeSlug || '');

  const templateId = useMemo(() => {
    if (propTemplateId) return propTemplateId;
    
    const storeTheme = storeData?.homeTheme || storeData?.homeTemplate || 'modern';
    return getTemplateFromTheme(storeTheme) || fallbackTemplate;
  }, [propTemplateId, storeData?.homeTheme, storeData?.homeTemplate, fallbackTemplate]);

  const TemplateComponent = useMemo(
    () => loadTemplateComponent(templateId),
    [templateId]
  );

  return {
    storeData,
    storeLoading,
    storeError,
    refetch,
    templateId,
    TemplateComponent
  };
};

/**
 * Composant principal pour gérer le rendu dynamique des templates
 * Supporte le chargement de templates basé sur les thèmes de boutique
 * et la configuration de vitrine personnalisée
 * 
 * @param storeSlug - Identifiant unique de la boutique
 * @param templateId - Override pour forcer un template spécifique
 * @param vitrineConfig - Configuration personnalisée de vitrine
 * @param fallbackTemplate - Template de fallback en cas d'erreur
 */
export default function HomeTemplateRenderer({ 
  storeSlug, 
  templateId: propTemplateId,
  vitrineConfig,
  fallbackTemplate = DEFAULT_TEMPLATE
}: HomeTemplateProps) {
  
  const {
    storeData,
    storeLoading,
    storeError,
    refetch,
    templateId,
    TemplateComponent
  } = useTemplateLogic({ storeSlug, propTemplateId, fallbackTemplate });

  // États de chargement et d'erreur
  if (storeSlug && storeLoading) {
    return <TemplateLoader />;
  }

  if (storeSlug && storeError) {
    return <TemplateError error={storeError} onRetry={refetch} />;
  }

  if (storeSlug && !storeData) {
    return <TemplateError error="Boutique non trouvée" />;
  }

  // Props optimisées pour le template
  const templateProps: TemplateComponentProps = useMemo(() => ({
    ...(storeData && { store: storeData }),
    ...(vitrineConfig && { vitrineConfig }),
    templateId,
    isStore: !!storeSlug,
    isVitrine: !!vitrineConfig
  }), [storeData, vitrineConfig, templateId, storeSlug]);

  return (
    <main role="main" aria-label="Contenu du template">
      <Suspense fallback={<TemplateLoader />}>
        <TemplateComponent {...templateProps} />
      </Suspense>
    </main>
  );
}

// Hook pour utiliser les templates dans d'autres composants
export function useTemplate(templateId: string) {
  const [Component, setComponent] = React.useState<React.ComponentType<any> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadTemplate = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const comp = loadTemplateComponent(templateId);
      setComponent(() => comp);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(`Erreur chargement template: ${errorMessage}`);
      logger.templateError(templateId as TemplateId, err as Error);
    } finally {
      setLoading(false);
    }
  }, [templateId]);

  React.useEffect(() => {
    loadTemplate();
  }, [loadTemplate]);

  return { Component, loading, error, retry: loadTemplate };
}

// Utilitaires exportés
export function getAvailableTemplates() {
  return AVAILABLE_TEMPLATES.map(id => ({
    id,
    name: id.charAt(0).toUpperCase() + id.slice(1).replace('-', ' '),
    category: id.includes('home-') ? 'Home' : 'Specialized'
  }));
}

export function isValidTemplate(templateId: string): templateId is TemplateId {
  return AVAILABLE_TEMPLATES.includes(templateId as TemplateId);
}

export function getTemplatesByCategory() {
  const categories = {
    'Home': [] as TemplateId[],
    'Fashion': [] as TemplateId[],
    'Electronics': [] as TemplateId[],
    'Beauty': [] as TemplateId[],
    'Specialized': [] as TemplateId[]
  };

  AVAILABLE_TEMPLATES.forEach(template => {
    if (template.includes('fashion') || template.includes('men')) {
      categories.Fashion.push(template);
    } else if (template.includes('electronic')) {
      categories.Electronics.push(template);
    } else if (template.includes('cosmetic') || template.includes('skincare')) {
      categories.Beauty.push(template);
    } else if (template.startsWith('home-') && /home-\d+$/.test(template)) {
      categories.Home.push(template);
    } else {
      categories.Specialized.push(template);
    }
  });

  return categories;
}
