
"use client";

import { useStore } from '../../../hooks/useApi';
import DynamicHomeTemplate from '../../../components/DynamicHomeTemplate';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Store } from '../../../types/store';

interface BoutiquePageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Composant de chargement
const LoadingPage = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement de la boutique...</p>
    </div>
  </div>
);

// Composant d'erreur
const ErrorPage = ({ error, slug }: { error: string; slug: string }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <div className="text-center max-w-md">
      <div className="text-red-500 mb-4">
        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Boutique non trouvée
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        La boutique "{slug}" n'existe pas ou n'est plus disponible.
      </p>
      <p className="text-sm text-red-600 dark:text-red-400">
        {error}
      </p>
      <button 
        onClick={() => window.history.back()}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Retour
      </button>
    </div>
  </div>
);

export default function BoutiquePage({ params }: BoutiquePageProps) {
  const router = useRouter();
  const [slug, setSlug] = useState<string>('');
  
  useEffect(() => {
    params.then(resolvedParams => {
      setSlug(resolvedParams.slug);
    });
  }, [params]);
  
  // Charger les données de la boutique
  const { data: store, loading, error } = useStore(slug);

  useEffect(() => {
    if (store && !store.isActive) {
      router.push('/');
    }
  }, [store, router]);

  // Show loading while slug is being resolved or store is loading
  if (!slug || loading) {
    return <LoadingPage />;
  }

  if (error) {
    return <ErrorPage error={error} slug={slug} />;
  }

  if (!store) {
    return <ErrorPage error="Aucune donnée reçue" slug={slug} />;
  }

  const getTemplateFromTheme = (theme: string) => {
    const themeMapping: Record<string, string> = {
      'electronics': 'home-electronic',
      'fashion': 'home-men',
      'beauty': 'home-cosmetic',
      'modern': 'home-1',
      'default': 'home-1'
    };
    return themeMapping[theme] || 'home-1';
  };

  const storeTheme = store.homeTheme || store.homeTemplate || 'modern';
  const templateId = getTemplateFromTheme(storeTheme) || store.design?.selectedTemplate?.id || 'home-01';

  const sections = store.sections || []; // ✅ Ajout pour gérer les sections activables

  console.log('🏪 Store data:', { 
    name: store.name, 
    slug: store.slug,
    homeTheme: store.homeTheme,
    homeTemplate: store.homeTemplate,
    mappedTemplate: templateId,
    sections
  });

  return (
    <div className="min-h-screen">
      <head>
        <title>{store.name} - Boutique en ligne</title>
        <meta name="description" content={store.description || `Découvrez ${store.name}, une boutique unique`} />
        {store.logo && <link rel="icon" href={store.logo} />}
      </head>

      {/* ✅ DynamicHomeTemplate reçoit maintenant les sections activées */}
      <DynamicHomeTemplate 
        templateId={templateId}
        storeSlug={slug}
        store={store}
        sections={sections}  // ✅ Passe sections au composant enfant
        fallbackTemplate="home-01"
      />

      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded-lg text-xs">
          <div>Boutique: {store.name}</div>
          <div>homeTheme: {store.homeTheme}</div>
          <div>homeTemplate: {store.homeTemplate}</div>
          <div>Template final: {templateId}</div>
          <div>ID: {store.id}</div>
          <div>Sections: {JSON.stringify(sections)}</div>
        </div>
      )}
    </div>
  );
}

// generateMetadata removed - incompatible with "use client" directive
// Metadata is now handled in the head section within the component
