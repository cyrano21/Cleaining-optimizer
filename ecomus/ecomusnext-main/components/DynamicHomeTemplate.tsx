"use client";

import * as React from 'react';
import { Suspense } from 'react';
import { useStore, useProducts } from '../hooks/useApi';
import dynamic from 'next/dynamic';
import { TemplateConfig, DEFAULT_HOME_ELECTRONIC_CONFIG } from '@/types/templateConfig';

interface HomeTemplateProps {
  templateId: string;
  storeSlug?: string;
  vitrineConfig?: any;
  fallbackTemplate?: string;
  store?: any; // Données de la boutique passées directement
  templateConfig?: TemplateConfig; // Configuration du template
}

// Mapping des templates home disponibles (seulement ceux qui ont un fichier index)
const AVAILABLE_TEMPLATES = {
  // Templates standard avec fichiers d'index
  'home-01': () => import('./homes/home-1'),
  'home-02': () => import('./homes/home-2'),
  'home-03': () => import('./homes/home-3'),
  'home-04': () => import('./homes/home-4'),
  'home-05': () => import('./homes/home-5'),
  'home-06': () => import('./homes/home-6'),
  'home-07': () => import('./homes/home-7'),
  'home-08': () => import('./homes/home-8'),
  
  // Mapping direct (sans zéro) 
  'home-1': () => import('./homes/home-1'),
  'home-2': () => import('./homes/home-2'),
  'home-3': () => import('./homes/home-3'),
  'home-4': () => import('./homes/home-4'),
  'home-5': () => import('./homes/home-5'),
  'home-6': () => import('./homes/home-6'),
  'home-7': () => import('./homes/home-7'),
  'home-8': () => import('./homes/home-8'),
  
  // Templates thématiques avec fichiers d'index
  'home-electronic': () => import('./homes/home-electronic'),
} as const;

type TemplateKey = keyof typeof AVAILABLE_TEMPLATES;

// Composant de fallback pendant le chargement
const TemplateLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement du template...</p>
    </div>
  </div>
);

// Composant d'erreur si template non trouvé
const TemplateError = ({ templateId, error }: { templateId: string; error?: string }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <div className="text-center max-w-md">
      <div className="text-red-500 mb-4">
        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Template non trouvé
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Le template "{templateId}" n'existe pas ou n'est pas disponible.
      </p>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          Erreur: {error}
        </p>
      )}
    </div>
  </div>
);

export default function DynamicHomeTemplate({ 
  templateId, 
  storeSlug, 
  vitrineConfig,
  fallbackTemplate = 'home-1',
  store: passedStore,
  templateConfig 
}: HomeTemplateProps) {
  // Charger les données de la boutique si c'est pour une boutique (sauf si déjà passées)
  const { data: store, loading: storeLoading, error: storeError } = useStore(passedStore ? null : storeSlug || null);
  
  // Utiliser les données passées en priorité, sinon celles chargées par l'API
  const finalStore = passedStore || store;
  
  // Charger les produits de la boutique ou selon la config vitrine
  const { data: productsData, loading: productsLoading } = useProducts(
    storeSlug && finalStore ? {
      storeId: finalStore.id,
      limit: 12,
      featured: true
    } : vitrineConfig?.productFilters || { limit: 12 }
  );

  // Déterminer quel template utiliser
  const templateToUse = (templateId && templateId in AVAILABLE_TEMPLATES) 
    ? templateId as TemplateKey
    : (fallbackTemplate in AVAILABLE_TEMPLATES ? fallbackTemplate as TemplateKey : 'home-1');

  // Vérifier si le template existe
  if (!(templateToUse in AVAILABLE_TEMPLATES)) {
    return <TemplateError templateId={templateId} error="Template non supporté" />;
  }

  // Charger le composant dynamiquement
  const TemplateComponent = dynamic(
    AVAILABLE_TEMPLATES[templateToUse],
    {
      loading: () => <TemplateLoader />,
      ssr: true
    }
  );

  // Affichage pendant le chargement des données (seulement si on charge via API)
  if (!passedStore && (storeLoading || productsLoading)) {
    return <TemplateLoader />;
  }

  // Gestion d'erreur si boutique non trouvée (seulement si on charge via API)
  if (!passedStore && storeSlug && storeError) {
    return <TemplateError templateId={templateId} error={storeError} />;
  }

  // Obtenir la configuration du template ou utiliser la défaut
  const finalTemplateConfig = React.useMemo(() => {
    if (templateConfig) return templateConfig;
    
    // Configuration par défaut selon le template
    switch (templateToUse) {
      case 'home-electronic':
        return DEFAULT_HOME_ELECTRONIC_CONFIG;
      default:
        return null; // Pas de config pour les autres templates pour l'instant
    }
  }, [templateConfig, templateToUse]);

  // Préparer les props pour le template
  const templateProps = {
    store: finalStore,
    products: productsData,
    storeSlug,
    vitrineConfig,
    templateConfig: finalTemplateConfig
  };

  // Debug logs
  console.log('🔧 DynamicHomeTemplate - templateId:', templateId);
  console.log('🔧 DynamicHomeTemplate - finalStore:', finalStore);
  console.log('🔧 DynamicHomeTemplate - passedStore:', passedStore);
  console.log('🔧 DynamicHomeTemplate - productsData:', productsData);
  console.log('🔧 DynamicHomeTemplate - vitrineConfig:', vitrineConfig);
  console.log('🔧 DynamicHomeTemplate - productsLoading:', productsLoading);

  return (
    <Suspense fallback={<TemplateLoader />}>
      <TemplateComponent {...templateProps} />
    </Suspense>
  );
}

// Hook utilitaire pour obtenir la liste des templates disponibles
export const useAvailableTemplates = () => {
  return Object.keys(AVAILABLE_TEMPLATES).map(templateId => ({
    id: templateId,
    name: templateId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    category: templateId.includes('home-') ? 'Standard' : 'Thématique'
  }));
};

// Fonction utilitaire pour vérifier si un template existe
export const isValidTemplate = (templateId: string): templateId is TemplateKey => {
  return templateId in AVAILABLE_TEMPLATES;
};
