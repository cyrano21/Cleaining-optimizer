import React, { Suspense, lazy } from 'react';
import { useStore } from '@/hooks/useApi';

interface HomeTemplateProps {
  storeSlug?: string;
  templateId?: string;
  vitrineConfig?: any;
  fallbackTemplate?: string;
}

// Mapping des templates disponibles
const AVAILABLE_TEMPLATES = [
  'home-1', 'home-2', 'home-3', 'home-4', 'home-5', 'home-6',
  'home-7', 'home-8', 'home-handbag',
  'home-fashion', 'home-cosmetic', 'home-jewerly', 'home-electronic',
  'home-furniture', 'home-grocery', 'home-kids', 'home-accessories',
  'home-activewear', 'home-footwear', 'home-men', 'home-decor',
  'home-skincare', 'home-swimwear', 'multi-brand'
];

// Loader de template dynamique
function loadTemplateComponent(templateId: string) {
  // Normaliser le templateId (home-01 -> home-1, etc.)
  let normalizedId = templateId;
  if (templateId.startsWith('home-0')) {
    normalizedId = templateId.replace('home-0', 'home-');
  }

  // Vérifier si le template existe
  if (!AVAILABLE_TEMPLATES.includes(normalizedId)) {
    console.warn(`Template ${normalizedId} non trouvé, utilisation du template par défaut`);
    normalizedId = 'home-1'; // Template par défaut
  }

  try {
    // Import dynamique du composant template depuis components/homes
    return lazy(() => 
      import(`./homes/${normalizedId}/`)
        .catch(() => {
          console.error(`Erreur chargement template ${normalizedId}`);
          // Fallback vers le template par défaut
          return import(`./homes/home-1/`);
        })
    );
  } catch (error) {
    console.error(`Erreur lors du chargement du template ${normalizedId}:`, error);
    // Retour vers le template par défaut
    return lazy(() => import(`./homes/home-1/`));
  }
}

// Composant de loading
function TemplateLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement du template...</p>
      </div>
    </div>
  );
}

// Composant d'erreur
function TemplateError({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        )}
      </div>
    </div>
  );
}

// Composant principal pour gérer le rendu dynamique des templates
export default function HomeTemplateRenderer({ 
  storeSlug, 
  templateId: propTemplateId,
  vitrineConfig,
  fallbackTemplate = 'home-1'
}: HomeTemplateProps) {
  
  // Si on a un storeSlug, récupérer les données de la boutique
  const { 
    data: storeData, 
    loading: storeLoading, 
    error: storeError,
    refetch
  } = useStore(storeSlug || '');

  // Mapping des thèmes vers les templates React (même logique que StoreHomeRenderer)
  const getTemplateFromTheme = (theme: string) => {
    const themeMapping: Record<string, string> = {
      'electronics': 'home-electronic',
      'fashion': 'home-men', // Utiliser home-men pour fashion
      'beauty': 'home-cosmetic',
      'modern': 'home-1',
      'default': 'home-1'
    };
    
    return themeMapping[theme] || 'home-1';
  };

  // Déterminer quel template utiliser - prioriser homeTheme puis homeTemplate
  const storeTheme = storeData?.homeTheme || storeData?.homeTemplate || 'modern';
  const templateId = propTemplateId || getTemplateFromTheme(storeTheme) || fallbackTemplate;

  // Loading state
  if (storeSlug && storeLoading) {
    return <TemplateLoader />;
  }

  // Error state
  if (storeSlug && storeError) {
    return <TemplateError error={storeError} onRetry={refetch} />;
  }

  // Si on a un storeSlug mais pas de données, c'est une erreur
  if (storeSlug && !storeData) {
    return <TemplateError error="Boutique non trouvée" />;
  }

  // Charger le composant template
  const TemplateComponent = loadTemplateComponent(templateId);

  // Props à passer au template
  const templateProps = {
    // Données de la boutique si disponibles (l'API retourne les propriétés à plat)
    ...(storeData && { store: storeData }),
    
    // Configuration de vitrine si fournie
    ...(vitrineConfig && { vitrineConfig }),
    
    // Métadonnées du template
    templateId,
    isStore: !!storeSlug,
    isVitrine: !!vitrineConfig
  };

  return (
    <Suspense fallback={<TemplateLoader />}>
      <TemplateComponent {...templateProps} />
    </Suspense>
  );
}

// Hook pour utiliser les templates dans d'autres composants
export function useTemplate(templateId: string) {
  const [Component, setComponent] = React.useState<React.ComponentType<any> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLoading(true);
    setError(null);
    
    try {
      const comp = loadTemplateComponent(templateId);
      setComponent(() => comp);
      setLoading(false);
    } catch (err) {
      setError(`Erreur chargement template: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
      setLoading(false);
    }
  }, [templateId]);

  return { Component, loading, error };
}

// Utilitaire pour lister les templates disponibles
export function getAvailableTemplates() {
  return AVAILABLE_TEMPLATES.map(id => ({
    id,
    name: id.charAt(0).toUpperCase() + id.slice(1).replace('-', ' '),
    category: 'General' // À adapter selon vos besoins
  }));
}
