// components/FemmeChambureView.js
import React, { useState } from "react";
import { AnimatedCard } from "./AnimatedTransitions";

export default function FemmeChambureView({ 
  user,
  rooms, 
  onRoomClick,
  toggleCleaned,
  toggleControlled,
  handleNoteChange,
  selectedNote,
  onLogout
}) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Filtrer uniquement les chambres assignées à cette femme de chambre
  const myRooms = rooms.filter(room => room.assignedTo === user.name);
  
  const stats = {
    total: myRooms.length,
    cleaned: myRooms.filter(r => r.cleaned).length,
    controlled: myRooms.filter(r => r.controlled).length,
    completed: myRooms.filter(r => r.cleaned && r.controlled).length,
    pending: myRooms.filter(r => !r.cleaned).length,
    libre: myRooms.filter(r => r.state === "Libre").length,
    depart: myRooms.filter(r => r.state === "Départ").length,
    recouche: myRooms.filter(r => r.state === "Recouche").length,
  };

  const getStateColor = (state) => {
    switch (state) {
      case "Libre":
        return "bg-green-50 border-green-200 text-green-800";
      case "Départ":
        return "bg-pink-50 border-pink-200 text-pink-800";
      case "Recouche":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const getStateIcon = (state) => {
    switch (state) {
      case "Libre":
        return "🟢";
      case "Départ":
        return "🔴";
      case "Recouche":
        return "🟡";
      default:
        return "⚪";
    }
  };

  const getProgressPercentage = () => {
    if (stats.total === 0) return 0;
    return Math.round((stats.completed / stats.total) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-600">
      {/* Header simplifié pour femme de chambre */}
      <div className="bg-gradient-to-r from-teal-500 via-cyan-600 to-blue-700 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                🧹 Mes Chambres
              </h1>
              <p className="text-cyan-100">
                Bonjour {user.name} ! Voici vos chambres assignées
              </p>
            </div>
            <div className="text-right">
              <div className="text-white text-sm mb-2">
                {currentTime.toLocaleDateString("fr-FR")}
              </div>
              <button
                onClick={onLogout}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                🚪 Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Statistiques personnelles */}
        <AnimatedCard className="mb-8">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              📊 Votre Progression
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-blue-700">Chambres assignées</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                <div className="text-2xl font-bold text-green-600">{stats.cleaned}</div>
                <div className="text-sm text-green-700">Nettoyées</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                <div className="text-2xl font-bold text-purple-600">{stats.controlled}</div>
                <div className="text-sm text-purple-700">Contrôlées</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl">
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-sm text-yellow-700">En attente</div>
              </div>
            </div>

            {/* Barre de progression */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Progression totale</span>
                <span className="text-sm font-bold text-indigo-600">{getProgressPercentage()}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.completed} chambres terminées sur {stats.total}
              </div>
            </div>

            {/* Distribution par état */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-lg font-bold text-green-600">{stats.libre}</div>
                <div className="text-xs text-green-700">🟢 Libre</div>
              </div>
              <div className="text-center p-3 bg-pink-50 rounded-lg border border-pink-200">
                <div className="text-lg font-bold text-pink-600">{stats.depart}</div>
                <div className="text-xs text-pink-700">🔴 Départ</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-lg font-bold text-yellow-600">{stats.recouche}</div>
                <div className="text-xs text-yellow-700">🟡 Recouche</div>
              </div>
            </div>
          </div>
        </AnimatedCard>

        {/* Liste des chambres */}
        <AnimatedCard delay={200}>
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              🏨 Mes Chambres ({myRooms.length})
            </h2>

            {myRooms.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Aucune chambre assignée
                </h3>
                <p className="text-gray-500">
                  Contactez votre gouvernante pour recevoir vos assignations
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myRooms.map((room) => (
                  <div
                    key={room.number}
                    className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${getStateColor(room.state)}`}
                    onClick={() => onRoomClick(room.number)}
                  >
                    {/* Header de la chambre */}
                    <div className="text-center mb-4">
                      <div className="text-2xl font-bold flex items-center justify-center mb-2">
                        {getStateIcon(room.state)} Chambre {room.number}
                      </div>
                      <div className="text-sm font-semibold text-gray-600">
                        {room.state} • {room.type}
                      </div>
                    </div>

                    {/* Actions de nettoyage */}
                    <div className="space-y-3 mb-4">
                      <button
                        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                          room.cleaned 
                            ? "bg-green-500 text-white" 
                            : "bg-gray-200 text-gray-700 hover:bg-green-100"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCleaned(room.number);
                        }}
                      >
                        {room.cleaned ? "✅ Nettoyée" : "🧹 Marquer comme nettoyée"}
                      </button>

                      {room.cleaned && (
                        <button
                          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors text-sm ${
                            room.controlled 
                              ? "bg-blue-500 text-white" 
                              : "bg-gray-200 text-gray-700 hover:bg-blue-100"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleControlled(room.number);
                          }}
                        >
                          {room.controlled ? "✅ Contrôlée" : "🔍 En attente de contrôle"}
                        </button>
                      )}
                    </div>

                    {/* Zone de notes */}
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-gray-600 mb-2">
                        📝 Notes et observations
                      </label>
                      <textarea
                        value={selectedNote[room.number] || room.notes || ""}
                        onChange={(e) => handleNoteChange(room.number, e.target.value)}
                        placeholder="Objets oubliés, problèmes rencontrés..."
                        className="w-full text-sm p-3 border rounded-lg resize-none bg-white/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                        rows="3"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    {/* Statut visuel */}
                    <div className="flex justify-center space-x-2">
                      {room.cleaned && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          ✅ Nettoyée
                        </span>
                      )}
                      {room.controlled && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          🔍 Contrôlée
                        </span>
                      )}
                      {room.cleaned && room.controlled && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                          🎉 Terminée
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </AnimatedCard>

        {/* Message de motivation */}
        {stats.total > 0 && (
          <AnimatedCard delay={400} className="mt-8">
            <div className="p-6 text-center">
              <div className="text-4xl mb-3">
                {getProgressPercentage() === 100 ? "🎉" : 
                 getProgressPercentage() >= 75 ? "💪" :
                 getProgressPercentage() >= 50 ? "👍" : "🚀"}
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {getProgressPercentage() === 100 ? "Félicitations ! Toutes vos chambres sont terminées !" :
                 getProgressPercentage() >= 75 ? "Excellent travail ! Vous y êtes presque !" :
                 getProgressPercentage() >= 50 ? "Bon rythme ! Continuez comme ça !" :
                 "C'est parti ! Vous pouvez le faire !"}
              </h3>
              <p className="text-gray-600">
                {getProgressPercentage() === 100 ? 
                  "Vous pouvez prendre une pause bien méritée." :
                  `Plus que ${stats.pending} chambre${stats.pending > 1 ? 's' : ''} à nettoyer.`
                }
              </p>
            </div>
          </AnimatedCard>
        )}
      </div>
    </div>
  );
}