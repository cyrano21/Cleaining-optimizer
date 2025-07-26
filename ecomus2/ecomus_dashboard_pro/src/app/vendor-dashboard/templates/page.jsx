"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import TemplateGallery from '@/components/stores/TemplateGallery';

export default function TemplateManagement() {
  const { data: session } = useSession();
  const [userStore, setUserStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Détecter si l'utilisateur est admin
  const isAdmin = session?.user && ['admin', 'super_admin', 'ADMIN', 'SUPER_ADMIN'].includes(session.user.role);

  useEffect(() => {
    fetchUserStore();
  }, [session]);

  const fetchUserStore = async () => {
    if (!session?.user?.id) return;

    try {
      // Pour les admins, permettre l'accès même sans boutique spécifique      
      if (isAdmin) {
        // Admin : créer un store virtuel pour l'accès global
        setUserStore({
          _id: 'admin-global',
          name: 'Administration Globale',
          slug: 'admin-global',
          homeTemplate: 'home-01'
        });
        setLoading(false);
        return;
      }

      // Pour les vendeurs : chercher leur boutique spécifique
      const response = await fetch(`/api/stores?ownerId=${session.user.id}`);
      const data = await response.json();
      
      if (data.success && data.data.stores.length > 0) {
        setUserStore(data.data.stores[0]);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du store:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = async (template) => {
    const storeToUse = userStore || (isAdmin ? {
      _id: 'admin-global',
      name: 'Administration Globale',
      slug: 'admin-global',
      homeTemplate: 'home-01'
    } : null);
    
    if (!storeToUse) return;

    setSaving(true);
    setMessage(null);

    try {
      // Pour les admins avec store virtuel, juste afficher un message de confirmation
      const isAdminVirtual = storeToUse._id === 'admin-global';
      
      if (isAdminVirtual) {
        setMessage({ 
          type: 'info', 
          text: `Template "${template.name}" sélectionné. En tant qu'admin, vous pouvez voir tous les templates. Pour l'appliquer à une boutique spécifique, utilisez l'interface admin.` 
        });
        setSaving(false);
        return;
      }

      // Pour les vendeurs avec vraie boutique
      const response = await fetch(`/api/public/stores/${storeToUse.slug}/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ homeTemplate: template.id }),
      });

      const data = await response.json();

      if (data.success) {
        setUserStore(prev => ({
          ...prev,
          homeTemplate: template.id,
          settings: {
            ...prev.settings,
            homeTemplate: template.id
          }
        }));
        setMessage({ type: 'success', text: 'Template mis à jour avec succès!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la mise à jour' });
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du template:', error);
      setMessage({ type: 'error', text: 'Erreur de connexion' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Vérification de l'accès : admin toujours autorisé, vendeur doit avoir une boutique  
  if (!userStore && !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Aucune boutique trouvée</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Vous devez d'abord créer une boutique pour accéder à cette fonctionnalité.</p>
          <a
            href="/vendor-dashboard/stores/create"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Créer ma boutique
          </a>
        </div>
      </div>
    );
  }

  // Si admin sans userStore (cas de fallback), créer un store virtuel ici aussi
  const effectiveStore = userStore || (isAdmin ? {
    _id: 'admin-global',
    name: 'Administration Globale',
    slug: 'admin-global',
    homeTemplate: 'home-01'
  } : null);

  const currentTemplate = effectiveStore.homeTemplate || effectiveStore.settings?.homeTemplate || 'default';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Gestion des Templates</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Choisissez le template parfait pour votre boutique "{effectiveStore.name}"
          </p>
        </div>

        {/* Store Info avec preview du template */}
        <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          {/* Background image du template actuel */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10 dark:opacity-5"
            style={{
              backgroundImage: `url('/images/templates/${currentTemplate}.svg')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/60 to-transparent dark:from-gray-800/80 dark:via-gray-800/60 dark:to-transparent" />
          
          {/* Contenu par-dessus */}
          <div className="relative z-10 p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {isAdmin ? 'Mode Administration' : 'Boutique actuelle'}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 font-medium">{effectiveStore.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Slug: {effectiveStore.slug}</p>
                {isAdmin && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Accès global à tous les templates
                  </p>
                )}
              </div>
              
              {/* Preview et info template */}
              <div className="flex items-center gap-4">
                {/* Mini preview du template */}
                <div className="hidden sm:block">
                  <div className="w-24 h-16 rounded-lg overflow-hidden border-2 border-blue-200 dark:border-blue-700 shadow-lg">
                    <img
                      src={`/images/templates/${currentTemplate}.svg`}
                      alt={`Preview ${currentTemplate}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/images/templates/placeholder.svg';
                      }}
                    />
                  </div>
                </div>
                
                {/* Info template */}
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Template actuel</p>
                  <p className="font-semibold text-blue-600 dark:text-blue-400">{currentTemplate}</p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Actif</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800'
              : message.type === 'info'
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800' 
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Loading overlay */}
        {saving && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-gray-700 dark:text-gray-300">Mise à jour du template...</span>
              </div>
            </div>
          </div>
        )}

        {/* Template Gallery */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <TemplateGallery
            onSelectTemplate={handleTemplateSelect}
            currentTemplate={currentTemplate}
            showAdminAccess={isAdmin}
          />
        </div>

        {/* Preview Button */}
        {!isAdmin && (
          <div className="mt-8 text-center">
            <a
              href={`http://localhost:3000/${effectiveStore.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Prévisualiser ma boutique
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
