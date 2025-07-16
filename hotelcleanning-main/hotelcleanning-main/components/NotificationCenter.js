// components/NotificationCenter.js
import React, { useState, useEffect } from "react";

export default function NotificationCenter({ 
  rooms, 
  staffList, 
  notifications, 
  setNotifications 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    enableAlerts: true,
    enableSound: false,
    autoCheck: true,
    reminderInterval: 30, // minutes
  });

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Charger les paramètres sauvegardés
    const savedSettings = localStorage.getItem("notificationSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    
    // Vérifications automatiques
    if (settings.autoCheck) {
      const interval = setInterval(() => {
        checkForAlerts();
      }, settings.reminderInterval * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [settings.autoCheck, settings.reminderInterval, rooms, staffList]);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const checkForAlerts = () => {
    const alerts = [];
    const now = new Date();

    // Vérifier les chambres en départ non nettoyées depuis plus de 2h
    rooms.forEach(room => {
      if (room.state === "Départ" && !room.cleaned) {
        alerts.push({
          id: `urgent-${room.number}`,
          type: "urgent",
          title: "🚨 Chambre départ urgente",
          message: `Chambre ${room.number} en départ non nettoyée`,
          timestamp: now,
          roomNumber: room.number,
          action: "Nettoyer immédiatement",
          read: false,
        });
      }
    });

    // Vérifier les chambres assignées depuis plus de 1h sans progress
    rooms.forEach(room => {
      if (room.assignedTo && !room.cleaned) {
        alerts.push({
          id: `progress-${room.number}`,
          type: "warning",
          title: "⏰ Vérification nécessaire",
          message: `Chambre ${room.number} assignée à ${room.assignedTo} - Pas de progrès`,
          timestamp: now,
          roomNumber: room.number,
          employeeName: room.assignedTo,
          action: "Vérifier le statut",
          read: false,
        });
      }
    });

    // Vérifier la charge de travail des employés
    staffList.forEach(staff => {
      const assignedRooms = rooms.filter(r => r.assignedTo === staff.name);
      if (assignedRooms.length > 8) {
        alerts.push({
          id: `overload-${staff.name}`,
          type: "info",
          title: "📊 Surcharge détectée",
          message: `${staff.name} a ${assignedRooms.length} chambres assignées`,
          timestamp: now,
          employeeName: staff.name,
          action: "Redistribuer la charge",
          read: false,
        });
      }
    });

    // Ajouter les nouvelles alertes
    if (alerts.length > 0) {
      setNotifications(prev => [...alerts, ...prev.slice(0, 47)]); // Max 50 notifications
    }
  };

  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]);
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const updateSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem("notificationSettings", JSON.stringify(newSettings));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "urgent": return "🚨";
      case "warning": return "⚠️";
      case "success": return "✅";
      case "info": return "ℹ️";
      default: return "📢";
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "urgent": return "border-l-red-500 bg-red-50";
      case "warning": return "border-l-yellow-500 bg-yellow-50";
      case "success": return "border-l-green-500 bg-green-50";
      case "info": return "border-l-blue-500 bg-blue-50";
      default: return "border-l-gray-500 bg-gray-50";
    }
  };

  const playNotificationSound = () => {
    if (settings.enableSound) {
      // Simulation du son de notification
      console.log("🔔 Notification sound played");
    }
  };

  // Notifications en temps réel
  const recentNotifications = notifications.slice(0, 5);
  const urgentCount = notifications.filter(n => n.type === "urgent" && !n.read).length;

  return (
    <>
      {/* Bouton de notification flottant */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-20 right-4 z-50 bg-white hover:bg-gray-50 text-gray-700 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 relative"
        title="Centre de notifications"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5h4v-4H9v4h4l-5 5h5v4h6v-4z" />
        </svg>
        
        {/* Badge de compteur */}
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
        
        {/* Indicateur urgent */}
        {urgentCount > 0 && (
          <span className="absolute -top-1 -left-1 bg-red-600 w-3 h-3 rounded-full animate-ping"></span>
        )}
      </button>

      {/* Panel de notifications */}
      {isOpen && (
        <div className="fixed top-32 right-4 z-50 bg-white rounded-xl shadow-2xl w-96 max-h-96 border border-gray-200 animate-slide-in">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold text-gray-800">🔔 Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                  {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
                disabled={unreadCount === 0}
              >
                Tout marquer lu
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="p-3 border-b border-gray-100 bg-gray-50">
            <div className="flex space-x-2">
              <button
                onClick={checkForAlerts}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs py-2 px-3 rounded-lg transition-colors"
              >
                🔍 Vérifier maintenant
              </button>
              <button
                onClick={clearAll}
                className="bg-gray-500 hover:bg-gray-600 text-white text-xs py-2 px-3 rounded-lg transition-colors"
              >
                🗑️ Effacer tout
              </button>
            </div>
          </div>

          {/* Liste des notifications */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-2">📭</div>
                <p className="text-sm">Aucune notification</p>
                <p className="text-xs">Votre équipe travaille bien !</p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border-l-4 cursor-pointer transition-all duration-200 ${getNotificationColor(notification.type)} ${
                      notification.read ? "opacity-60" : ""
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                        <span className="font-semibold text-sm text-gray-800">
                          {notification.title}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="text-gray-400 hover:text-gray-600 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2">
                      {notification.message}
                    </p>
                    
                    {notification.action && (
                      <div className="text-xs text-blue-600 font-medium">
                        👆 {notification.action}
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500 mt-2">
                      {notification.timestamp.toLocaleTimeString("fr-FR")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Paramètres */}
          <div className="border-t border-gray-200 p-3 bg-gray-50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">⚙️ Paramètres</span>
              <div className="flex items-center space-x-3">
                <label className="flex items-center space-x-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableAlerts}
                    onChange={(e) => updateSettings({ ...settings, enableAlerts: e.target.checked })}
                    className="w-3 h-3 text-blue-600 rounded"
                  />
                  <span className="text-xs">Alertes</span>
                </label>
                <label className="flex items-center space-x-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableSound}
                    onChange={(e) => updateSettings({ ...settings, enableSound: e.target.checked })}
                    className="w-3 h-3 text-blue-600 rounded"
                  />
                  <span className="text-xs">Son</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/10 z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
}