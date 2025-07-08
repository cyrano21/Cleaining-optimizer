/**
 * Composant Dashboard Intégré pour Ecomus SaaS
 * Intègre les fonctionnalités avancées : 3D, IA, Chatbot, Profils
 */

'use client';
import React, { useState, useEffect } from 'react';
import AdvancedUserProfile from './AdvancedUserProfile';
import Model3DViewer from '../shop/Model3DViewer';
import Model3DUpload from '../shop/Model3DUpload';
import AIGenerator from '../common/AIGenerator';

const IntegratedDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [userModels, setUserModels] = useState([]);
  const [loading, setLoading] = useState(false);

  // Onglets du dashboard basés sur les permissions utilisateur
  const getDashboardTabs = () => {
    const baseTabs = [
      { id: 'profile', label: 'Mon Profil', icon: 'fa-user' },
      { id: 'orders', label: 'Mes Commandes', icon: 'fa-shopping-bag' },
      { id: 'wishlist', label: 'Ma Liste', icon: 'fa-heart' }
    ];

    // Ajout des onglets avancés selon les permissions
    if (user?.dashboardAccess?.includes('3d_models')) {
      baseTabs.push(
        { id: '3d-gallery', label: 'Galerie 3D', icon: 'fa-cube' },
        { id: '3d-upload', label: 'Upload 3D', icon: 'fa-upload' }
      );
    }

    if (user?.dashboardAccess?.includes('ai_tools')) {
      baseTabs.push(
        { id: 'ai-generator', label: 'IA Créative', icon: 'fa-magic' },
        { id: 'ai-analytics', label: 'Analytics IA', icon: 'fa-chart-bar' }
      );
    }

    if (user?.role === 'admin' || user?.role === 'seller') {
      baseTabs.push(
        { id: 'admin', label: 'Administration', icon: 'fa-cogs' },
        { id: 'analytics', label: 'Analytics', icon: 'fa-analytics' }
      );
    }

    return baseTabs;
  };

  // Chargement des modèles 3D de l'utilisateur
  useEffect(() => {
    const loadUserModels = async () => {
      if (user?.dashboardAccess?.includes('3d_models')) {
        setLoading(true);
        try {
          const response = await fetch(`/api/users/${user.id}/models`);
          if (response.ok) {
            const models = await response.json();
            setUserModels(models);
          }
        } catch (error) {
          console.error('Erreur lors du chargement des modèles:', error);
        }
        setLoading(false);
      }
    };

    loadUserModels();
  }, [user, activeTab]);

  // Gestionnaire d'upload de modèle 3D
  const handleModelUploaded = (newModel) => {
    setUserModels(prev => [...prev, newModel]);
    // Notification de succès
    showNotification('Modèle 3D uploadé avec succès!', 'success');
  };

  // Système de notifications
  const showNotification = (message, type = 'info') => {
    // Implémentation simple - peut être étendue avec une librairie de toast
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} notification-toast`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      min-width: 300px;
      animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.remove();
    }, 5000);
  };

  // Rendu du contenu selon l'onglet actif
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <AdvancedUserProfile user={user} />;
      
      case '3d-gallery':
        return (
          <div className="row">
            <div className="col-12">
              <h4 className="mb-4">
                <i className="fas fa-cube me-2"></i>
                Ma Galerie 3D
              </h4>
              {loading ? (
                <div className="text-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                </div>
              ) : userModels.length > 0 ? (
                <div className="row">
                  {userModels.map((model, index) => (
                    <div key={model.id || index} className="col-md-6 col-lg-4 mb-4">
                      <div className="card">
                        <div className="card-body">
                          <h6 className="card-title">{model.name}</h6>
                          <Model3DViewer 
                            modelUrl={model.url}
                            autoRotate={false}
                            controls={true}
                            style={{ height: '200px' }}
                          />
                          <div className="mt-2">
                            <small className="text-muted">
                              Créé le {new Date(model.createdAt).toLocaleDateString()}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="fas fa-cube fa-3x text-muted mb-3"></i>
                  <p className="text-muted">Aucun modèle 3D trouvé</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setActiveTab('3d-upload')}
                  >
                    Uploader votre premier modèle
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      
      case '3d-upload':
        return (
          <div className="row">
            <div className="col-12">
              <h4 className="mb-4">
                <i className="fas fa-upload me-2"></i>
                Upload de Modèles 3D
              </h4>
              <Model3DUpload onUploadSuccess={handleModelUploaded} />
            </div>
          </div>
        );
      
      case 'ai-generator':
        return (
          <div className="row">
            <div className="col-12">
              <h4 className="mb-4">
                <i className="fas fa-magic me-2"></i>
                Générateur IA
              </h4>
              <AIGenerator 
                context="dashboard"
                user={user}
                onGenerationComplete={(result) => {
                  showNotification('Contenu généré avec succès!', 'success');
                }}
              />
            </div>
          </div>
        );
      
      case 'ai-analytics':
        return (
          <div className="row">
            <div className="col-12">
              <h4 className="mb-4">
                <i className="fas fa-chart-bar me-2"></i>
                Analytics IA
              </h4>
              <div className="row">
                <div className="col-md-6 mb-4">
                  <div className="card">
                    <div className="card-body">
                      <h6 className="card-title">Interactions IA</h6>
                      <div className="d-flex align-items-center">
                        <i className="fas fa-robot fa-2x text-primary me-3"></i>
                        <div>
                          <h3 className="mb-0">{user?.aiInteractions?.length || 0}</h3>
                          <small className="text-muted">Total conversations</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-4">
                  <div className="card">
                    <div className="card-body">
                      <h6 className="card-title">Contenus Générés</h6>
                      <div className="d-flex align-items-center">
                        <i className="fas fa-magic fa-2x text-success me-3"></i>
                        <div>
                          <h3 className="mb-0">{user?.generatedContent?.length || 0}</h3>
                          <small className="text-muted">Éléments créés</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'orders':
        return (
          <div className="row">
            <div className="col-12">
              <h4 className="mb-4">
                <i className="fas fa-shopping-bag me-2"></i>
                Mes Commandes
              </h4>
              <div className="card">
                <div className="card-body">
                  <p className="text-muted">Historique des commandes à implémenter</p>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'admin':
        return (
          <div className="row">
            <div className="col-12">
              <h4 className="mb-4">
                <i className="fas fa-cogs me-2"></i>
                Administration
              </h4>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <div className="card text-center">
                    <div className="card-body">
                      <i className="fas fa-users fa-2x text-primary mb-3"></i>
                      <h6>Gestion Utilisateurs</h6>
                      <button className="btn btn-outline-primary btn-sm">
                        Accéder
                      </button>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="card text-center">
                    <div className="card-body">
                      <i className="fas fa-cube fa-2x text-success mb-3"></i>
                      <h6>Modèles 3D</h6>
                      <button className="btn btn-outline-success btn-sm">
                        Gérer
                      </button>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="card text-center">
                    <div className="card-body">
                      <i className="fas fa-robot fa-2x text-info mb-3"></i>
                      <h6>Config IA</h6>
                      <button className="btn btn-outline-info btn-sm">
                        Configurer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="text-center py-5">
            <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
            <p className="text-muted">Contenu non disponible</p>
          </div>
        );
    }
  };

  const tabs = getDashboardTabs();

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar avec onglets */}
        <div className="col-md-3 col-lg-2">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="fas fa-tachometer-alt me-2"></i>
                Dashboard
              </h6>
            </div>
            <div className="list-group list-group-flush">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`list-group-item list-group-item-action ${
                    activeTab === tab.id ? 'active' : ''
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <i className={`fas ${tab.icon} me-2`}></i>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="col-md-9 col-lg-10">
          <div className="card">
            <div className="card-body">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Styles CSS intégrés */}
      <style jsx>{`
        .notification-toast {
          animation: slideIn 0.3s ease-out;
        }
        
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .list-group-item-action:hover {
          background-color: #f8f9fa;
        }
        
        .card {
          box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
          border: 1px solid rgba(0, 0, 0, 0.125);
        }
        
        .card-header {
          background-color: #f8f9fa;
          border-bottom: 1px solid rgba(0, 0, 0, 0.125);
        }
      `}</style>
    </div>
  );
};

export default IntegratedDashboard;
