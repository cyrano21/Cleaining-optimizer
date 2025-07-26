import React from 'react';

interface DynamicTemplateProps {
  storeConfig: {
    id: string;
    slug: string;
    template: string;
    sections: SectionConfig[];
    theme: any;
  };
  templateData: {
    products: any[];
    categories: any[];
    collections: any[];
  };
}

interface SectionConfig {
  id: string;
  type: string; // 'header', 'hero', 'categories', 'products', 'footer'
  component: string; // 'hero1', 'categories', 'products1'
  props: {
    [key: string]: any;
  };
  data?: any;
}

/**
 * MOTEUR DE RENDU DYNAMIQUE
 * 
 * Ce composant remplace TOUS les templates hardcodés (home-1, home-4, etc.)
 * Il rend dynamiquement le store selon la configuration du dashboard
 * 
 * PRINCIPE :
 * - Le dashboard envoie la configuration complète
 * - Ce composant rend les sections dans l'ordre configuré
 * - Chaque section utilise FactorizedComponents pour le rendu
 */
export default function DynamicTemplateRenderer({ 
  storeConfig, 
  templateData 
}: DynamicTemplateProps) {
  
  // Import dynamique des composants depuis FactorizedComponents
  const { getComponent } = require('@/components/common/FactorizedComponents');

  return (
    <div className={`template-${storeConfig.template}`}>
      {storeConfig.sections.map((section, index) => {
        // Récupération du composant via la factory
        const Component = getComponent(
          section.type,           // 'header', 'hero', 'categories', etc.
          storeConfig.template,   // 'home-1', 'home-4', etc.
          {
            ...section.props,
            ...section.data
          },
          storeConfig,            // Store config
          templateData            // Données (products, categories, etc.)
        );

        if (!Component) {
          console.warn(`Component not found for section: ${section.type} in template: ${storeConfig.template}`);
          return null;
        }

        return (
          <section 
            key={section.id || index}
            className={`section-${section.type}`}
            data-section-id={section.id}
          >
            {Component}
          </section>
        );
      })}
    </div>
  );
}

/**
 * HOOK POUR RÉCUPÉRER LA CONFIGURATION DU STORE
 * 
 * Remplace tous les appels API dispersés dans les composants
 */
export async function getStoreConfiguration(storeSlug: string) {
  try {
    // API UNIQUE qui retourne TOUTE la configuration
    const response = await fetch(`/api/stores/${storeSlug}/config`);
    
    if (!response.ok) {
      throw new Error(`Store not found: ${storeSlug}`);
    }
    
    const data = await response.json();
    
    return {
      storeConfig: data.store,      // Configuration du store
      templateData: data.data       // Données (products, categories, etc.)
    };
    
  } catch (error) {
    console.error('Error loading store configuration:', error);
    throw error;
  }
}

/**
 * COMPOSANT PAGE STORE DYNAMIQUE
 * 
 * Remplace toutes les pages [slug] hardcodées
 */
export async function DynamicStorePage({ params }: { params: { slug: string } }) {
  try {
    const { storeConfig, templateData } = await getStoreConfiguration(params.slug);
    
    return (
      <DynamicTemplateRenderer 
        storeConfig={storeConfig} 
        templateData={templateData} 
      />
    );
    
  } catch (error) {
    return (
      <div className="error-page">
        <h1>Store not found</h1>
        <p>Le store "{params.slug}" n'existe pas ou n'est pas accessible.</p>
      </div>
    );
  }
}