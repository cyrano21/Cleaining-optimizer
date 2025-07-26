"use client";

import { useState, useEffect } from 'react';
import { Bell, Check, Clock, AlertCircle, Package, TrendingUp, Star, MessageSquare, X, Filter, Search } from 'lucide-react';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all', 'orders', 'reviews', 'system', 'promotions'
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data pour les notifications (à remplacer par une vraie API)
  const mockNotifications = [
    {
      id: '1',
      type: 'order',
      title: 'Nouvelle commande reçue',
      message: 'Commande #12345 - 3 articles pour un montant de 89,97 €',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      isRead: false,
      priority: 'high',
      icon: Package,
      color: 'green',
      actionUrl: '/vendor-dashboard/orders/12345'
    },
    {
      id: '2',
      type: 'review',
      title: 'Nouvel avis client',
      message: 'Marie D. a laissé un avis 5 étoiles sur "T-shirt Premium"',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      isRead: false,
      priority: 'medium',
      icon: Star,
      color: 'yellow',
      actionUrl: '/vendor-dashboard/products/reviews'
    },
    {
      id: '3',
      type: 'system',
      title: 'Mise à jour du template',
      message: 'Votre template "Modern Template" a été mis à jour avec succès',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      isRead: true,
      priority: 'low',
      icon: AlertCircle,
      color: 'blue',
      actionUrl: '/vendor-dashboard/templates'
    },
    {
      id: '4',
      type: 'promotion',
      title: 'Promotion recommandée',
      message: 'Créez une promotion pour augmenter vos ventes ce week-end',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      isRead: true,
      priority: 'medium',
      icon: TrendingUp,
      color: 'purple',
      actionUrl: '/vendor-dashboard/promotions'
    },
    {
      id: '5',
      type: 'message',
      title: 'Nouveau message client',
      message: 'Pierre M. vous a envoyé une question sur un produit',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      isRead: false,
      priority: 'high',
      icon: MessageSquare,
      color: 'indigo',
      actionUrl: '/vendor-dashboard/messages'
    },
    {
      id: '6',
      type: 'order',
      title: 'Commande expédiée',
      message: 'La commande #12340 a été marquée comme expédiée',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      isRead: true,
      priority: 'low',
      icon: Package,
      color: 'green',
      actionUrl: '/vendor-dashboard/orders/12340'
    },
    {
      id: '7',
      type: 'system',
      title: 'Sauvegarde automatique',
      message: 'Vos données ont été sauvegardées automatiquement',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      isRead: true,
      priority: 'low',
      icon: AlertCircle,
      color: 'gray',
      actionUrl: null
    },
    {
      id: '8',
      type: 'review',
      title: 'Avis négatif signalé',
      message: 'Un avis 2 étoiles nécessite votre attention sur "Chaussures Sport"',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      isRead: false,
      priority: 'high',
      icon: Star,
      color: 'red',
      actionUrl: '/vendor-dashboard/products/reviews'
    }
  ];

  useEffect(() => {
    // Simulation du chargement des notifications
    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 500);
  }, []);

  // Filtrer les notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesReadFilter = filter === 'all' || 
      (filter === 'read' && notification.isRead) || 
      (filter === 'unread' && !notification.isRead);
    
    const matchesCategoryFilter = categoryFilter === 'all' || 
      (categoryFilter === 'orders' && notification.type === 'order') ||
      (categoryFilter === 'reviews' && notification.type === 'review') ||
      (categoryFilter === 'system' && notification.type === 'system') ||
      (categoryFilter === 'promotions' && notification.type === 'promotion') ||
      (categoryFilter === 'messages' && notification.type === 'message');

    const matchesSearch = searchTerm === '' || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesReadFilter && matchesCategoryFilter && matchesSearch;
  });

  // Marquer une notification comme lue
  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  // Marquer toutes les notifications comme lues
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  // Supprimer une notification
  const deleteNotification = (notificationId) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  // Compter les notifications non lues
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Fonction pour formater le temps relatif
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return timestamp.toLocaleDateString('fr-FR');
  };

  // Obtenir la couleur selon le type
  const getNotificationColor = (notification) => {
    const colors = {
      green: 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300',
      yellow: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300',
      blue: 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300',
      purple: 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300',
      indigo: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-300',
      red: 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300',
      gray: 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300'
    };
    return colors[notification.color] || colors.gray;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement des notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Gérez vos notifications et restez informé des dernières activités
          </p>
        </div>
        <div className="flex items-center gap-4">
          {unreadCount > 0 && (
            <span className="flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-600 dark:bg-red-900 dark:text-red-300">
              <Bell className="h-4 w-4" />
              {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
            </span>
          )}
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              <Check className="h-4 w-4" />
              Tout marquer comme lu
            </button>
          )}
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800 sm:flex-row sm:items-center sm:justify-between">
        {/* Barre de recherche */}
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Rechercher dans les notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Filtre par statut */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Toutes</option>
              <option value="unread">Non lues</option>
              <option value="read">Lues</option>
            </select>
          </div>

          {/* Filtre par catégorie */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Toutes les catégories</option>
            <option value="orders">Commandes</option>
            <option value="reviews">Avis</option>
            <option value="messages">Messages</option>
            <option value="promotions">Promotions</option>
            <option value="system">Système</option>
          </select>
        </div>
      </div>

      {/* Liste des notifications */}
      <div className="space-y-2">
        {filteredNotifications.length === 0 ? (
          <div className="py-12 text-center">
            <Bell className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              {searchTerm || filter !== 'all' || categoryFilter !== 'all' 
                ? 'Aucune notification trouvée' 
                : 'Aucune notification'}
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {searchTerm || filter !== 'all' || categoryFilter !== 'all'
                ? 'Essayez de modifier vos filtres de recherche'
                : 'Vous n\'avez aucune notification pour le moment'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const IconComponent = notification.icon;
            return (
              <div
                key={notification.id}
                className={`group relative rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-gray-800 ${
                  notification.isRead 
                    ? 'border-gray-200 dark:border-gray-700' 
                    : 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icône */}
                  <div className={`flex-shrink-0 rounded-full p-2 ${getNotificationColor(notification)}`}>
                    <IconComponent className="h-5 w-5" />
                  </div>

                  {/* Contenu */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`text-sm font-medium ${notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-white font-semibold'}`}>
                          {notification.title}
                          {!notification.isRead && (
                            <span className="ml-2 inline-block h-2 w-2 rounded-full bg-blue-600"></span>
                          )}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          {notification.message}
                        </p>
                        <div className="mt-2 flex items-center gap-4">
                          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(notification.timestamp)}
                          </span>
                          {notification.priority === 'high' && (
                            <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-600 dark:bg-red-900 dark:text-red-300">
                              Priorité haute
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                            title="Marquer comme lu"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="rounded-lg p-2 text-gray-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900 dark:hover:text-red-400"
                          title="Supprimer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Action button */}
                    {notification.actionUrl && (
                      <div className="mt-3">
                        <a
                          href={notification.actionUrl}
                          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                        >
                          Voir plus
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
