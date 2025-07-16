// components/RoomGrid.js
import React from "react";

export default function RoomGrid({
  rooms,
  onRoomClick,
  toggleStar,
  toggleCleaned,
  toggleControlled,
  staffList,
  handleNoteChange,
  selectedNote,
  manualAssignmentActive,
  selectedEmployee,
  selectedDashboard,
}) {
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

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-indigo-600">
          État des chambres
        </h2>
        <div className="flex space-x-4 text-sm">
          <span className="flex items-center">
            <span className="w-3 h-3 bg-green-200 rounded-full mr-2"></span>
            Libre
          </span>
          <span className="flex items-center">
            <span className="w-3 h-3 bg-pink-200 rounded-full mr-2"></span>
            Départ
          </span>
          <span className="flex items-center">
            <span className="w-3 h-3 bg-yellow-200 rounded-full mr-2"></span>
            Recouche
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {rooms.map((room) => (
          <div
            key={room.number}
            className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${getStateColor(
              room.state
            )} ${manualAssignmentActive && selectedEmployee ? "hover:ring-2 hover:ring-blue-400" : ""}`}
            onClick={() => onRoomClick(room.number)}
          >
            {/* Numéro de chambre */}
            <div className="text-center mb-2">
              <div className="text-lg font-bold flex items-center justify-center">
                {getStateIcon(room.state)} {room.number}
              </div>
              <div className="text-xs font-semibold text-gray-600 mt-1">
                {room.state}
              </div>
            </div>

            {/* Zone de notes */}
            <div className="mb-3">
              <textarea
                value={selectedNote[room.number] || room.notes || ""}
                onChange={(e) => handleNoteChange(room.number, e.target.value)}
                placeholder="Notes (objets oubliés, problèmes, etc.)"
                className="w-full text-xs p-2 border rounded resize-none bg-white/50 placeholder-gray-400"
                rows="2"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Statuts de nettoyage */}
            <div className="space-y-1">
              <div
                className={`text-xs px-2 py-1 rounded text-center cursor-pointer ${
                  room.cleaned ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCleaned(room.number);
                }}
              >
                {room.cleaned ? "✅ Nettoyée" : "❌ Non Nettoyée"}
              </div>
              <div
                className={`text-xs px-2 py-1 rounded text-center cursor-pointer ${
                  room.controlled ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleControlled(room.number);
                }}
              >
                {room.controlled ? "✅ Contrôlée" : "❌ Non Contrôlée"}
              </div>
            </div>

            {/* Assignation */}
            {room.assignedTo && (
              <div className="mt-2 p-1 bg-indigo-100 text-indigo-800 text-xs rounded text-center">
                👤 {room.assignedTo}
              </div>
            )}

            {/* Indicateur d'assignation manuelle active */}
            {manualAssignmentActive && selectedEmployee && (
              <div className="absolute top-1 right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            )}

            {/* Étoile/Favori */}
            {room.star && (
              <div className="absolute top-1 left-1 text-yellow-500">
                ⭐
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Informations supplémentaires */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-bold text-lg text-indigo-600">
              {rooms.length}
            </div>
            <div className="text-gray-600">Total chambres</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg text-green-600">
              {rooms.filter(r => r.cleaned).length}
            </div>
            <div className="text-gray-600">Nettoyées</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg text-blue-600">
              {rooms.filter(r => r.controlled).length}
            </div>
            <div className="text-gray-600">Contrôlées</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg text-purple-600">
              {rooms.filter(r => r.assignedTo).length}
            </div>
            <div className="text-gray-600">Assignées</div>
          </div>
        </div>
      </div>
    </div>
  );
}