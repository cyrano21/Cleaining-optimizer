"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Settings, BarChart3, Package, Heart, 
  ShoppingCart, MessageCircle, Camera, 
  Star, TrendingUp, Bell, Download
} from 'lucide-react';
import AdvancedUserProfile from './AdvancedUserProfile';

const AdvancedDashboard = ({ userRole = 'customer' }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  // Configuration des onglets selon le rôle
  const getTabsForRole = (role) => {
    const baseTabs = [
      { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
      { id: 'profile', label: 'Profil', icon: User },
      { id: 'orders', label: 'Commandes', icon: Package },
      { id: 'wishlist', label: 'Favoris', icon: Heart },
    ];

    const roleTabs = {
      admin: [
        ...baseTabs,
        { id: 'analytics', label: 'Analyses', icon: TrendingUp },
        { id: 'users', label: 'Utilisateurs', icon: User },
        { id: 'products', label: 'Produits', icon: Package },
        { id: 'ai-tools', label: 'Outils IA', icon: MessageCircle },
      ],
      vendor: [
        ...baseTabs,
        { id: 'products', label: 'Mes Produits', icon: Package },
        { id: 'analytics', label: 'Ventes', icon: TrendingUp },
        { id: 'ai-tools', label: 'IA Marketing', icon: MessageCircle },
      ],
      customer: [
        ...baseTabs,
        { id: 'reviews', label: 'Avis', icon: Star },
        { id: 'support', label: 'Support', icon: MessageCircle },
      ]
    };

    return roleTabs[role] || roleTabs.customer;
  };

  const tabs = getTabsForRole(userRole);

  useEffect(() => {
    loadDashboardData();
  }, [userRole]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Simuler le chargement des données utilisateur
      const mockUserData = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: userRole,
        avatar: '/images/avatar-placeholder.jpg',
        joinDate: '2023-01-15',
        totalOrders: 12,
        totalSpent: 1549.99,
        favoriteProducts: 8,
        reviewsWritten: 5
      };

      const mockStats = {
        overview: {
          totalOrders: 12,
          totalSpent: 1549.99,
          averageOrder: 129.17,
          pendingOrders: 2,
          completedOrders: 10,
          monthlySpending: [120, 450, 200, 380, 290, 340],
          recentActivity: [
            { type: 'order', message: 'Commande #1234 expédiée', date: '2024-01-20' },
            { type: 'wishlist', message: 'Produit ajouté aux favoris', date: '2024-01-19' },
            { type: 'review', message: 'Avis publié pour "T-shirt Premium"', date: '2024-01-18' }
          ]
        },
        vendor: {
          totalProducts: 45,
          totalSales: 15420,
          monthlyRevenue: [1200, 2300, 1800, 2100, 1950, 2400],
          topProducts: [
            { name: 'T-shirt Premium', sales: 120, revenue: 2400 },
            { name: 'Jeans Vintage', sales: 89, revenue: 3560 },
            { name: 'Sneakers Classic', sales: 76, revenue: 4560 }
          ]
        },
        admin: {
          totalUsers: 1250,
          totalOrders: 3420,
          totalRevenue: 125400,
          monthlyGrowth: 12.5,
          activeVendors: 25,
          pendingApprovals: 8
        }
      };

      setUserData(mockUserData);
      setStats(mockStats);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setLoading(false);
    }
  };

  const renderOverview = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="dashboard-overview"
    >
      <div className="row">
        {/* Statistiques principales */}
        <div className="col-lg-8">
          <div className="stats-grid mb-4">
            <div className="row g-3">
              <div className="col-md-3">
                <div className="stat-card bg-primary text-white">
                  <div className="stat-icon">
                    <Package size={24} />
                  </div>
                  <div className="stat-content">
                    <h3>{stats.overview?.totalOrders || 0}</h3>
                    <p>Commandes</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="stat-card bg-success text-white">
                  <div className="stat-icon">
                    <TrendingUp size={24} />
                  </div>
                  <div className="stat-content">
                    <h3>${stats.overview?.totalSpent || 0}</h3>
                    <p>Total dépensé</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="stat-card bg-info text-white">
                  <div className="stat-icon">
                    <Heart size={24} />
                  </div>
                  <div className="stat-content">
                    <h3>{userData?.favoriteProducts || 0}</h3>
                    <p>Favoris</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="stat-card bg-warning text-white">
                  <div className="stat-icon">
                    <Star size={24} />
                  </div>
                  <div className="stat-content">
                    <h3>{userData?.reviewsWritten || 0}</h3>
                    <p>Avis publiés</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Graphique de dépenses */}
          <div className="chart-container">
            <h5 className="mb-3">Dépenses mensuelles</h5>
            <div className="spending-chart">
              {stats.overview?.monthlySpending?.map((amount, index) => (
                <div key={index} className="chart-bar">
                  <div 
                    className="bar" 
                    style={{ height: `${(amount / Math.max(...(stats.overview?.monthlySpending || [100]))) * 100}%` }}
                  ></div>
                  <span className="bar-label">${amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activités récentes */}
        <div className="col-lg-4">
          <div className="activity-panel">
            <h5 className="mb-3">Activités récentes</h5>
            <div className="activity-list">
              {stats.overview?.recentActivity?.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className={`activity-icon ${activity.type}`}>
                    {activity.type === 'order' && <Package size={16} />}
                    {activity.type === 'wishlist' && <Heart size={16} />}
                    {activity.type === 'review' && <Star size={16} />}
                  </div>
                  <div className="activity-content">
                    <p>{activity.message}</p>
                    <span className="activity-date">{activity.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderProfile = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <AdvancedUserProfile userData={userData} />
    </motion.div>
  );

  const renderVendorAnalytics = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="vendor-analytics"
    >
      <div className="row">
        <div className="col-lg-8">
          <h5 className="mb-3">Revenus mensuels</h5>
          <div className="revenue-chart">
            {stats.vendor?.monthlyRevenue?.map((amount, index) => (
              <div key={index} className="chart-bar">
                <div 
                  className="bar revenue-bar" 
                  style={{ height: `${(amount / Math.max(...(stats.vendor?.monthlyRevenue || [1000]))) * 100}%` }}
                ></div>
                <span className="bar-label">${amount}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="col-lg-4">
          <h5 className="mb-3">Produits populaires</h5>
          <div className="top-products">
            {stats.vendor?.topProducts?.map((product, index) => (
              <div key={index} className="product-stat">
                <div className="product-info">
                  <h6>{product.name}</h6>
                  <p>{product.sales} ventes</p>
                </div>
                <div className="product-revenue">
                  <span>${product.revenue}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'profile':
        return renderProfile();
      case 'analytics':
        return userRole === 'vendor' ? renderVendorAnalytics() : renderOverview();
      case 'orders':
        return <div className="orders-content">Gestion des commandes</div>;
      case 'wishlist':
        return <div className="wishlist-content">Liste de souhaits</div>;
      case 'ai-tools':
        return <div className="ai-tools-content">Outils d'IA marketing</div>;
      default:
        return renderOverview();
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="advanced-dashboard">
      <div className="dashboard-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h3>Tableau de bord</h3>
            <p className="text-muted">Bienvenue, {userData?.name}</p>
          </div>
          <div className="dashboard-actions">
            <button className="btn btn-outline-primary me-2">
              <Download size={16} className="me-1" />
              Exporter
            </button>
            <button className="btn btn-primary">
              <Settings size={16} className="me-1" />
              Paramètres
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-nav">
        <nav className="nav nav-pills">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <IconComponent size={16} className="me-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="dashboard-content">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .advanced-dashboard {
          min-height: 100vh;
          background: #f8f9fa;
          padding: 2rem;
        }

        .dashboard-header {
          background: white;
          padding: 2rem;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          margin-bottom: 2rem;
        }

        .dashboard-nav {
          background: white;
          padding: 1rem 2rem;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          margin-bottom: 2rem;
        }

        .dashboard-content {
          background: white;
          padding: 2rem;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          min-height: 500px;
        }

        .stat-card {
          padding: 1.5rem;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .stat-icon {
          padding: 0.75rem;
          background: rgba(255,255,255,0.2);
          border-radius: 0.5rem;
        }

        .stat-content h3 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .stat-content p {
          margin: 0;
          opacity: 0.9;
        }

        .chart-container, .revenue-chart {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
        }

        .spending-chart, .revenue-chart {
          display: flex;
          align-items: end;
          gap: 1rem;
          height: 200px;
          padding: 1rem 0;
        }

        .chart-bar {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .bar {
          background: linear-gradient(135deg, #007bff, #0056b3);
          border-radius: 0.25rem;
          min-height: 20px;
          width: 100%;
          transition: all 0.3s ease;
        }

        .revenue-bar {
          background: linear-gradient(135deg, #28a745, #1e7e34);
        }

        .bar-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #6c757d;
        }

        .activity-panel {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 0.5rem;
          height: fit-content;
        }

        .activity-item {
          display: flex;
          gap: 1rem;
          padding: 1rem 0;
          border-bottom: 1px solid #e9ecef;
        }

        .activity-item:last-child {
          border-bottom: none;
        }

        .activity-icon {
          padding: 0.5rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .activity-icon.order { background: #e3f2fd; color: #1976d2; }
        .activity-icon.wishlist { background: #fce4ec; color: #c2185b; }
        .activity-icon.review { background: #fff3e0; color: #f57c00; }

        .activity-content p {
          margin: 0 0 0.25rem 0;
          font-weight: 500;
        }

        .activity-date {
          font-size: 0.75rem;
          color: #6c757d;
        }

        .product-stat {
          display: flex;
          justify-content: between;
          align-items: center;
          padding: 1rem 0;
          border-bottom: 1px solid #e9ecef;
        }

        .product-stat:last-child {
          border-bottom: none;
        }

        .product-info h6 {
          margin: 0 0 0.25rem 0;
          font-weight: 600;
        }

        .product-info p {
          margin: 0;
          font-size: 0.875rem;
          color: #6c757d;
        }

        .product-revenue {
          font-weight: 700;
          color: #28a745;
        }

        .dashboard-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 400px;
        }

        @media (max-width: 768px) {
          .advanced-dashboard {
            padding: 1rem;
          }
          
          .dashboard-header {
            padding: 1rem;
          }
          
          .dashboard-nav {
            padding: 1rem;
          }
          
          .dashboard-content {
            padding: 1rem;
          }
          
          .nav-pills {
            flex-wrap: wrap;
          }
          
          .stat-card {
            margin-bottom: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AdvancedDashboard;
