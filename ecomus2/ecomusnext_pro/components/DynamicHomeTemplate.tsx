"use client";

import * as React from 'react';
import { Suspense } from 'react';
import { useStore, useProducts } from '../hooks/useApi';
import dynamic from 'next/dynamic';
import { TemplateConfig, getDefaultConfigForTemplate } from '@/types/templateConfig';
import UniversalTemplate from './UniversalTemplate';

interface HomeTemplateProps {
  templateId: string;
  storeSlug?: string;
  vitrineConfig?: any;
  fallbackTemplate?: string;
  store?: any; // Données de la boutique passées directement
  templateConfig?: TemplateConfig; // Configuration du template
  sections?: string[]; // ✅ Sections activables passées
}

const AVAILABLE_TEMPLATES = {
  'home-01': () => import('./homes/home-1'),
  'home-02': () => import('./homes/home-2'),
  'home-03': () => import('./homes/home-3'),
  'home-04': () => import('./homes/home-4'),
  'home-05': () => import('./homes/home-5'),
  'home-06': () => import('./homes/home-6'),
  'home-07': () => import('./homes/home-7'),
  'home-08': () => import('./homes/home-8'),
  'home-1': () => import('./homes/home-1'),
  'home-2': () => import('./homes/home-2'),
  'home-3': () => import('./homes/home-3'),
  'home-4': () => import('./homes/home-4'),
  'home-5': () => import('./homes/home-5'),
  'home-6': () => import('./homes/home-6'),
  'home-7': () => import('./homes/home-7'),
  'home-8': () => import('./homes/home-8'),
  'home-electronic': () => import('./homes/home-electronic'),
} as const;

type TemplateKey = keyof typeof AVAILABLE_TEMPLATES;

const TemplateLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement du template...</p>
    </div>
  </div>
);

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
  templateConfig,
  sections = [], // ✅ récupération sections activées
}: HomeTemplateProps) {
  const { data: store, loading: storeLoading, error: storeError } = useStore(passedStore ? null : storeSlug || null);
  const finalStore = passedStore || store;

  const { data: productsData, loading: productsLoading } = useProducts(
    storeSlug && finalStore ? {
      storeId: finalStore.id,
      limit: 12,
      featured: true
    } : vitrineConfig?.productFilters || { limit: 12 }
  );

  const templateToUse = (templateId && templateId in AVAILABLE_TEMPLATES)
    ? templateId as TemplateKey
    : (fallbackTemplate in AVAILABLE_TEMPLATES ? fallbackTemplate as TemplateKey : 'home-1');

  if (!(templateToUse in AVAILABLE_TEMPLATES)) {
    return <TemplateError templateId={templateId} error="Template non supporté" />;
  }

  if (!passedStore && (storeLoading || productsLoading)) {
    return <TemplateLoader />;
  }

  if (!passedStore && storeSlug && storeError) {
    return <TemplateError templateId={templateId} error={storeError} />;
  }

  const finalTemplateConfig = React.useMemo(() => {
    if (templateConfig) return templateConfig;
    return getDefaultConfigForTemplate(templateToUse);
  }, [templateConfig, templateToUse]);

  const useUniversalTemplate = React.useMemo(() => {
    const specializedTemplates = ['home-electronic'];
    return !specializedTemplates.includes(templateToUse) || templateConfig;
  }, [templateToUse, templateConfig]);

  // ✅ Rendu via UniversalTemplate avec sections activables
  if (useUniversalTemplate) {
    return (
      <Suspense fallback={<TemplateLoader />}>
        <UniversalTemplate
          store={finalStore}
          products={productsData}
          templateId={templateToUse}
          isStore={!!storeSlug}
          isVitrine={!storeSlug}
          vitrineConfig={vitrineConfig}
          templateConfig={finalTemplateConfig}
          sections={sections} // ✅ PASSE LES SECTIONS AU UNIVERSAL
        />
      </Suspense>
    );
  }

  const TemplateComponent = dynamic(
    AVAILABLE_TEMPLATES[templateToUse],
    {
      loading: () => <TemplateLoader />,
      ssr: true
    }
  );

  const templateProps = {
    store: finalStore,
    products: productsData,
    storeSlug,
    vitrineConfig,
    templateConfig: finalTemplateConfig,
    sections, // ✅ PASSE LES SECTIONS ICI AUSSI POUR LES TEMPLATES SPÉCIALISÉS
  };

  return (
    <Suspense fallback={<TemplateLoader />}>
      <TemplateComponent {...templateProps} />
    </Suspense>
  );
}

export const useAvailableTemplates = () => {
  return Object.keys(AVAILABLE_TEMPLATES).map(templateId => ({
    id: templateId,
    name: templateId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    category: templateId.includes('home-') ? 'Standard' : 'Thématique'
  }));
};

export const isValidTemplate = (templateId: string): templateId is TemplateKey => {
  return templateId in AVAILABLE_TEMPLATES;
};

