import React from 'react';
import { getTemplateConfig, getComponent } from '@/lib/template-config';

const UnifiedTemplateDemo = ({ templateId = 'home-electronic' }) => {
  const config = getTemplateConfig(templateId);
  
  if (!config) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Template not found</h2>
        <p className="text-gray-600">Template "{templateId}" is not configured.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header informatif */}
      <div className="bg-blue-50 p-4 mb-8">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold text-blue-900 mb-2">
            🎯 Template Unifié : {config.name}
          </h1>
          <p className="text-blue-700">
            Démonstration du système de templates factorisés avec {config.sections.length} sections configurées
          </p>
        </div>
      </div>

      {/* Rendu des sections selon la configuration */}
      {config.sections
        .filter(section => section.enabled)
        .sort((a, b) => a.order - b.order)
        .map((section) => {
          const Component = getComponent(section.component);
          
          if (!Component) {
            return (
              <div key={section.id} className="p-4 bg-red-100 border border-red-300 rounded mb-4">
                <p className="text-red-700">
                  ⚠️ Composant "{section.component}" introuvable pour la section "{section.id}"
                </p>
              </div>
            );
          }

          return (
            <div key={section.id} className="relative">
              {/* Badge de debug */}
              <div className="absolute top-4 right-4 z-10 bg-black/70 text-white px-3 py-1 rounded-full text-xs">
                {section.component} (Order: {section.order})
              </div>
              
              {/* Rendu du composant avec ses props */}
              <Component {...section.props} />
            </div>
          );
        })}
      
      {/* Footer informatif */}
      <div className="bg-gray-900 text-white p-8">
        <div className="container mx-auto text-center">
          <h3 className="text-lg font-semibold mb-4">
            ✅ Système de Templates Unifié - Démonstration Complète
          </h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-medium mb-2">🏗️ Architecture</h4>
              <p>Composants factorisés dans /shared/</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">⚙️ Configuration</h4>
              <p>Gestion centralisée via template-config.js</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">🎨 Personnalisation</h4>
              <p>Variants et props dynamiques par template</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedTemplateDemo;
