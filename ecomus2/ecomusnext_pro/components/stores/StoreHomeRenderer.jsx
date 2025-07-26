"use client";

import { useState, useEffect } from 'react';
import HomeTemplateRenderer from '@/components/HomeTemplateRenderer';

const StoreHomeRenderer = ({ store }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler un petit délai pour l'effet de chargement
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Chargement de {store.name}</h2>
          <p className="text-gray-600">Template: {store.homeTemplate || 'default'}</p>
        </div>
      </div>
    );
  }

  // Mapping des thèmes vers les templates React
  const getTemplateFromTheme = (theme) => {
    const themeMapping = {
      'electronics': 'home-electronic',
      'fashion': 'home-men', // Utiliser home-men pour fashion
      'beauty': 'home-cosmetic',
      'modern': 'home-1',
      'default': 'home-1'
    };
    
    return themeMapping[theme] || 'home-1';
  };

  // Déterminer le template à utiliser (homeTheme ou homeTemplate)
  const template = store.homeTheme || store.homeTemplate || 'modern';
  const templateId = getTemplateFromTheme(template);

  // Utiliser le nouveau composant HomeTemplateRenderer
  return (
    <div className="store-view" data-store={store.slug} data-template={templateId} data-theme={template}>
      {/* Header avec informations de la boutique (masqué par défaut) */}
      <div className="sr-only">
        <h1>{store.name}</h1>
        <p>{store.description}</p>
      </div>

      {/* Rendu du template avec HomeTemplateRenderer */}
      <HomeTemplateRenderer 
        storeSlug={store.slug}
        templateId={templateId}
        fallbackTemplate="home-1"
      />

      {/* Footer avec informations légales de la boutique */}
      <div className="hidden">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Store",
              "name": store.name,
              "description": store.description,
              "url": `${process.env.NEXTAUTH_URL}/${store.slug}`,
              "logo": store.logo,
              "contactPoint": {
                "@type": "ContactPoint",
                "email": store.contact?.email,
                "telephone": store.contact?.phone,
              },
              "address": store.contact?.address ? {
                "@type": "PostalAddress",
                "streetAddress": store.contact.address.street,
                "addressLocality": store.contact.address.city,
                "postalCode": store.contact.address.postalCode,
                "addressCountry": store.contact.address.country,
              } : undefined,
            }),
          }}
        />
      </div>
    </div>
  );
};

export default StoreHomeRenderer;