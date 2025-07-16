// components/LiveStats.js
import React, { useState, useEffect, useCallback } from "react";

export default function LiveStats({ rooms, staffList }) {
  const [animatedStats, setAnimatedStats] = useState({
    totalRooms: 0,
    cleaned: 0,
    controlled: 0,
    assigned: 0,
    libre: 0,
    depart: 0,
    recouche: 0,
    efficiency: 0,
    avgTime: 0,
  });

  const [isVisible, setIsVisible] = useState(false);

  // Calculer les statistiques en temps réel
  const calculateStats = useCallback(() => {
    const total = rooms.length;
    const cleaned = rooms.filter(r => r.cleaned).length;
    const controlled = rooms.filter(r => r.controlled).length;
    const assigned = rooms.filter(r => r.assignedTo).length;
    const libre = rooms.filter(r => r.state === "Libre").length;
    const depart = rooms.filter(r => r.state === "Départ").length;
    const recouche = rooms.filter(r => r.state === "Recouche").length;
    
    // Calcul de l'efficacité (chambres terminées / chambres assignées)
    const completed = rooms.filter(r => r.cleaned && r.controlled).length;
    const efficiency = assigned > 0 ? Math.round((completed / assigned) * 100) : 0;
    
    // Temps moyen simulé (en minutes)
    const avgTime = assigned > 0 ? Math.round(25 + (Math.random() * 10)) : 0;

    return {
      totalRooms: total,
      cleaned,
      controlled,
      assigned,
      libre,
      depart,
      recouche,
      efficiency,
      avgTime,
    };
  }, [rooms]);

  // Animation des nombres
  const animateNumber = (from, to, duration = 1000) => {
    return new Promise((resolve) => {
      const start = Date.now();
      const update = () => {
        const now = Date.now();
        const progress = Math.min((now - start) / duration, 1);
        const value = Math.round(from + (to - from) * progress);
        
        if (progress === 1) {
          resolve(to);
        } else {
          requestAnimationFrame(update);
        }
        return value;
      };
      update();
    });
  };

  useEffect(() => {
    const newStats = calculateStats();
    
    // Animer chaque statistique
    Object.keys(newStats).forEach(key => {
      const from = animatedStats[key];
      const to = newStats[key];
      
      if (from !== to) {
        let currentValue = from;
        const duration = 800;
        const start = Date.now();
        
        const animate = () => {
          const now = Date.now();
          const progress = Math.min((now - start) / duration, 1);
          const easeOut = 1 - Math.pow(1 - progress, 3); // Easing
          currentValue = Math.round(from + (to - from) * easeOut);
          
          setAnimatedStats(prev => ({
            ...prev,
            [key]: currentValue
          }));
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };
        
        animate();
      }
    });
  }, [rooms, staffList, animatedStats, calculateStats]);

  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 80) return "text-green-600 bg-green-100";
    if (efficiency >= 60) return "text-blue-600 bg-blue-100";
    if (efficiency >= 40) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getEfficiencyEmoji = (efficiency) => {
    if (efficiency >= 80) return "🚀";
    if (efficiency >= 60) return "✅";
    if (efficiency >= 40) return "⚠️";
    return "🔥";
  };

  const getWorkloadDistribution = () => {
    const workload = {};
    staffList.forEach(staff => {
      const assignedRooms = rooms.filter(r => r.assignedTo === staff.name);
      workload[staff.name] = {
        total: assignedRooms.length,
        completed: assignedRooms.filter(r => r.cleaned && r.controlled).length,
        inProgress: assignedRooms.filter(r => r.cleaned && !r.controlled).length,
        pending: assignedRooms.filter(r => !r.cleaned).length,
      };
    });
    return workload;
  };

  const workload = getWorkloadDistribution();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-indigo-600 flex items-center">
          📊 Statistiques en Temps Réel
        </h2>
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg 
            className={`w-5 h-5 transition-transform ${isVisible ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200">
          <div className="text-3xl font-bold text-indigo-600 transition-all duration-500">
            {animatedStats.totalRooms}
          </div>
          <div className="text-sm text-indigo-700 font-medium">Total Chambres</div>
          <div className="text-xs text-indigo-500 mt-1">🏨 Inventaire</div>
        </div>

        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
          <div className="text-3xl font-bold text-green-600 transition-all duration-500">
            {animatedStats.cleaned}
          </div>
          <div className="text-sm text-green-700 font-medium">Nettoyées</div>
          <div className="text-xs text-green-500 mt-1">🧹 Terminé</div>
        </div>

        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
          <div className="text-3xl font-bold text-blue-600 transition-all duration-500">
            {animatedStats.controlled}
          </div>
          <div className="text-sm text-blue-700 font-medium">Contrôlées</div>
          <div className="text-xs text-blue-500 mt-1">🔍 Validé</div>
        </div>

        <div className={`text-center p-4 rounded-xl border transition-all duration-500 ${getEfficiencyColor(animatedStats.efficiency)}`}>
          <div className="text-3xl font-bold transition-all duration-500">
            {getEfficiencyEmoji(animatedStats.efficiency)} {animatedStats.efficiency}%
          </div>
          <div className="text-sm font-medium">Efficacité</div>
          <div className="text-xs mt-1">📈 Performance</div>
        </div>
      </div>

      {/* Détails par état */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-600">{animatedStats.libre}</div>
          <div className="text-sm text-green-700">🟢 Libre</div>
        </div>
        <div className="text-center p-3 bg-pink-50 rounded-lg border border-pink-200">
          <div className="text-2xl font-bold text-pink-600">{animatedStats.depart}</div>
          <div className="text-sm text-pink-700">🔴 Départ</div>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="text-2xl font-bold text-yellow-600">{animatedStats.recouche}</div>
          <div className="text-sm text-yellow-700">🟡 Recouche</div>
        </div>
      </div>

      {/* Métriques avancées */}
      {isVisible && (
        <div className="space-y-6 border-t pt-6 animate-fade-in">
          {/* Temps moyen et progression */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                ⏱️ Métriques de Temps
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Temps moyen par chambre</span>
                  <span className="font-bold text-indigo-600">{animatedStats.avgTime} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Progression</span>
                  <span className="font-bold text-green-600">
                    {animatedStats.assigned > 0 ? Math.round((animatedStats.cleaned / animatedStats.assigned) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${animatedStats.assigned > 0 ? (animatedStats.cleaned / animatedStats.assigned) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                📈 Objectifs du Jour
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Objectif nettoyage</span>
                  <span className="font-bold text-blue-600">{Math.round(animatedStats.totalRooms * 0.8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Objectif contrôle</span>
                  <span className="font-bold text-purple-600">{Math.round(animatedStats.totalRooms * 0.7)}</span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Basé sur 80% nettoyage, 70% contrôle
                </div>
              </div>
            </div>
          </div>

          {/* Charge de travail par employé */}
          {Object.keys(workload).length > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                👥 Charge de Travail par Employé
              </h4>
              <div className="space-y-3">
                {Object.entries(workload).map(([name, data]) => (
                  <div key={name} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-gray-800">{name}</span>
                      <span className="text-sm text-gray-500">
                        {data.total} chambre{data.total > 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex space-x-4 text-sm">
                      <span className="text-green-600">✅ {data.completed}</span>
                      <span className="text-yellow-600">🟡 {data.inProgress}</span>
                      <span className="text-gray-600">⏳ {data.pending}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Graphique de progression (simulé avec barres) */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
              📊 Progression par Étage
            </h4>
            <div className="space-y-3">
              {[1, 2, 3].map(floor => {
                const floorRooms = rooms.filter(r => r.number.startsWith(floor.toString()));
                const floorCleaned = floorRooms.filter(r => r.cleaned).length;
                const percentage = floorRooms.length > 0 ? (floorCleaned / floorRooms.length) * 100 : 0;
                
                return (
                  <div key={floor} className="flex items-center space-x-3">
                    <span className="w-16 text-sm font-medium text-gray-700">Étage {floor}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-1000"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="w-12 text-sm font-bold text-indigo-600">
                      {Math.round(percentage)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}