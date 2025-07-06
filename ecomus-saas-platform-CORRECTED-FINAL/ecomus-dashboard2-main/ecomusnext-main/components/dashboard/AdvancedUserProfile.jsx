'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { User, Edit3, Save, X, Globe, Building, Users, Shield, Eye, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function AdvancedUserProfile({ className = '' }) {
  const { data: session, update } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    bio: '',
    website: '',
    company: '',
    socialLinks: {
      twitter: '',
      linkedin: '',
      instagram: '',
      github: ''
    },
    dashboardAccess: {
      permissions: [],
      customDashboard: false
    }
  });

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'permissions', label: 'Permissions', icon: Shield },
    { id: 'dashboard', label: 'Dashboard', icon: Settings },
    { id: 'activity', label: 'Activité', icon: Eye }
  ];

  const socialPlatforms = [
    { key: 'twitter', label: 'Twitter', placeholder: '@username' },
    { key: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/username' },
    { key: 'instagram', label: 'Instagram', placeholder: '@username' },
    { key: 'github', label: 'GitHub', placeholder: 'github.com/username' }
  ];

  const availablePermissions = [
    { id: 'manage_products', label: 'Gérer les produits', description: 'Créer, modifier et supprimer des produits' },
    { id: 'manage_orders', label: 'Gérer les commandes', description: 'Voir et traiter les commandes' },
    { id: 'manage_users', label: 'Gérer les utilisateurs', description: 'Administrer les comptes utilisateurs' },
    { id: 'view_analytics', label: 'Voir les analyses', description: 'Accéder aux statistiques et rapports' },
    { id: 'manage_content', label: 'Gérer le contenu', description: 'Modifier le contenu du site' },
    { id: 'use_ai_tools', label: 'Outils IA', description: 'Utiliser les fonctionnalités d\'IA' }
  ];

  useEffect(() => {
    if (session?.user) {
      fetchUserProfile();
    }
  }, [session]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      const data = await response.json();
      
      if (response.ok) {
        setProfileData({
          bio: data.profile?.bio || '',
          website: data.profile?.website || '',
          company: data.profile?.company || '',
          socialLinks: data.profile?.socialLinks || {
            twitter: '',
            linkedin: '',
            instagram: '',
            github: ''
          },
          dashboardAccess: data.dashboardAccess || {
            permissions: [],
            customDashboard: false
          }
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la sauvegarde');
      }

      // Mettre à jour la session
      await update({
        ...session,
        user: {
          ...session.user,
          profile: profileData.profile,
          dashboardAccess: profileData.dashboardAccess
        }
      });

      setIsEditing(false);
      toast.success('Profil mis à jour avec succès');

    } catch (error) {
      console.error('Save error:', error);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const getUserRole = () => {
    if (session?.user?.role === 'admin') return 'Administrateur';
    if (session?.user?.role === 'vendor') return 'Vendeur';
    return 'Client';
  };

  const getRoleColor = () => {
    if (session?.user?.role === 'admin') return 'bg-red-100 text-red-800';
    if (session?.user?.role === 'vendor') return 'bg-blue-100 text-blue-800';
    return 'bg-green-100 text-green-800';
  };

  if (!session?.user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Veuillez vous connecter pour voir votre profil</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-semibold">
              {session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {session.user.name || 'Utilisateur'}
              </h1>
              <p className="text-gray-600">{session.user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor()}`}>
                  {getUserRole()}
                </span>
                {profileData.company && (
                  <span className="flex items-center gap-1 text-sm text-gray-600">
                    <Building className="w-4 h-4" />
                    {profileData.company}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            {isEditing ? (
              <>
                <X className="w-4 h-4" />
                Annuler
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4" />
                Modifier
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Biographie
                </label>
                {isEditing ? (
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Parlez-nous de vous..."
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="4"
                  />
                ) : (
                  <p className="text-gray-700 text-sm bg-gray-50 rounded-lg p-3 min-h-[100px]">
                    {profileData.bio || 'Aucune biographie renseignée'}
                  </p>
                )}
              </div>

              {/* Website & Company */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site web
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={profileData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://example.com"
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                      <Globe className="w-4 h-4" />
                      {profileData.website ? (
                        <a 
                          href={profileData.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {profileData.website}
                        </a>
                      ) : (
                        <span className="text-gray-500">Aucun site web</span>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Entreprise
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      placeholder="Nom de votre entreprise"
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                      <Building className="w-4 h-4" />
                      {profileData.company || 'Aucune entreprise'}
                    </div>
                  )}
                </div>
              </div>

              {/* Social Links */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Réseaux sociaux
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {socialPlatforms.map((platform) => (
                    <div key={platform.key}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        {platform.label}
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.socialLinks[platform.key]}
                          onChange={(e) => handleInputChange(`socialLinks.${platform.key}`, e.target.value)}
                          placeholder={platform.placeholder}
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="text-sm text-gray-700 bg-gray-50 rounded-lg p-2">
                          {profileData.socialLinks[platform.key] || 'Non renseigné'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'permissions' && (
            <motion.div
              key="permissions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-gray-900">Permissions actuelles</h3>
              
              <div className="space-y-3">
                {availablePermissions.map((permission) => {
                  const hasPermission = profileData.dashboardAccess.permissions.includes(permission.id);
                  return (
                    <div key={permission.id} className={`p-4 rounded-lg border ${hasPermission ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{permission.label}</h4>
                          <p className="text-sm text-gray-600">{permission.description}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm ${
                          hasPermission ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {hasPermission ? 'Accordée' : 'Non accordée'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-900">Configuration du Dashboard</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Dashboard personnalisé</h4>
                    <p className="text-sm text-gray-600">Accès à une interface dashboard adaptée à votre rôle</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm ${
                    profileData.dashboardAccess.customDashboard ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {profileData.dashboardAccess.customDashboard ? 'Activé' : 'Désactivé'}
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">Accès selon votre rôle</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {session?.user?.role === 'admin' && (
                      <>
                        <li>• Gestion complète des produits et commandes</li>
                        <li>• Analytiques avancées et rapports</li>
                        <li>• Gestion des utilisateurs et permissions</li>
                        <li>• Outils IA et génération de contenu</li>
                      </>
                    )}
                    {session?.user?.role === 'vendor' && (
                      <>
                        <li>• Gestion de vos produits</li>
                        <li>• Suivi de vos commandes</li>
                        <li>• Statistiques de vente</li>
                        <li>• Outils IA pour vos produits</li>
                      </>
                    )}
                    {session?.user?.role === 'client' && (
                      <>
                        <li>• Suivi de vos commandes</li>
                        <li>• Historique d'achat</li>
                        <li>• Gestion de vos informations</li>
                        <li>• Support et FAQ</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-900">Activité récente</h3>
              
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Fonctionnalité en développement</p>
                  <p className="text-xs text-gray-500 mt-1">
                    L'historique des activités sera bientôt disponible
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Save Button */}
        {isEditing && (
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Sauvegarder
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
