import { useState } from 'react';
import Head from 'next/head';
import UnifiedTemplateDemo from '@/components/UnifiedTemplateDemo';
import TemplateConfigEditor from '@/components/TemplateConfigEditor';
import { TEMPLATE_DEFAULTS } from '@/lib/template-config';

const TemplateDemoPage = ({ query }) => {
  const [currentTemplate, setCurrentTemplate] = useState(query?.template || 'home-electronic');
  const [viewMode, setViewMode] = useState('preview'); // 'preview' | 'editor'

  const handleSaveConfig = (templateId, config) => {
    console.log('Saving configuration for template:', templateId, config);
    // Ici, vous pourriez sauvegarder la configuration dans une base de données
    // ou un fichier de configuration
    alert(`Configuration saved for ${templateId}!`);
  };

  const handleTemplateChange = (templateId) => {
    setCurrentTemplate(templateId);
    // Mettre à jour l'URL sans recharger la page
    window.history.pushState({}, '', `?template=${templateId}`);
  };

  return (
    <>
      <Head>
        <title>Ecomus - Unified Template System Demo</title>
        <meta name="description" content="Demonstration of the unified template system with shared components" />
      </Head>

      <div className="min-h-screen bg-gray-100">
        {/* Navigation Header */}
        <nav className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-bold text-gray-900">
                  🎨 Ecomus Unified Template System
                </h1>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  v2.0 - Unified
                </span>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Template Selector */}
                <select
                  value={currentTemplate}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(TEMPLATE_DEFAULTS).map(([templateId, config]) => (
                    <option key={templateId} value={templateId}>
                      {config.name} ({templateId})
                    </option>
                  ))}
                </select>
                
                {/* View Mode Toggle */}
                <div className="flex bg-gray-200 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('preview')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'preview'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    👁️ Preview
                  </button>
                  <button
                    onClick={() => setViewMode('editor')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'editor'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    ⚙️ Editor
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Template Info Bar */}
        <div className="bg-blue-600 text-white py-3">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center space-x-6">
                <span>📋 Current Template: <strong>{TEMPLATE_DEFAULTS[currentTemplate]?.name}</strong></span>
                <span>🧩 Sections: <strong>{TEMPLATE_DEFAULTS[currentTemplate]?.sections?.length || 0}</strong></span>
                <span>🎯 Mode: <strong>{viewMode === 'preview' ? 'Preview' : 'Configuration Editor'}</strong></span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-blue-200">Unified Component System</span>
                <div className="flex space-x-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span className="text-xs">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main>
          {viewMode === 'preview' ? (
            <UnifiedTemplateDemo templateId={currentTemplate} />
          ) : (
            <div className="py-8">
              <TemplateConfigEditor 
                templateId={currentTemplate} 
                onSave={handleSaveConfig}
              />
            </div>
          )}
        </main>

        {/* Footer avec informations techniques */}
        <footer className="bg-gray-900 text-white py-8">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <h3 className="font-semibold mb-3">🏗️ Architecture</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>✅ Composants factorisés</li>
                  <li>✅ Configuration centralisée</li>
                  <li>✅ Props dynamiques</li>
                  <li>✅ Variants par template</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">🎨 Templates</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>Electronics Store</li>
                  <li>Fashion Store</li>
                  <li>Cosmetic Store</li>
                  <li>+ Extensible</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">🧩 Composants</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>Hero, Categories, Products</li>
                  <li>Collections, Testimonials</li>
                  <li>Blogs, Newsletter, Footer</li>
                  <li>Marquee, Countdown</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">⚡ Avantages</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>🚀 Performance optimisée</li>
                  <li>🔧 Maintenance simplifiée</li>
                  <li>🎯 Code DRY</li>
                  <li>📈 Évolutivité</li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
              <p>Ecomus Unified Template System - Développé pour une architecture modulaire et évolutive</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

// Récupération des paramètres de l'URL côté serveur
export async function getServerSideProps({ query }) {
  return {
    props: {
      query
    }
  };
}

export default TemplateDemoPage;
