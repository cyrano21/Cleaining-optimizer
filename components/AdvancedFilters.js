// components/AdvancedFilters.js
import React, { useState } from "react";

export default function AdvancedFilters({ 
  rooms, 
  staffList, 
  onFiltersChange, 
  selectedDashboard 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    state: "all",
    cleaningStatus: "all",
    controlStatus: "all",
    assignedStatus: "all",
    assignedTo: "all",
    floor: "all",
    roomType: "all",
    hasNotes: "all",
    priority: "all",
    timeRange: "all"
  });

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const resetFilters = () => {
    const resetFilters = {
      state: "all",
      cleaningStatus: "all",
      controlStatus: "all",
      assignedStatus: "all",
      assignedTo: "all",
      floor: "all",
      roomType: "all",
      hasNotes: "all",
      priority: "all",
      timeRange: "all"
    };
    setFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const getFilterCount = () => {
    return Object.values(filters).filter(value => value !== "all").length;
  };

  const getUniqueFloors = () => {
    const floors = [...new Set(rooms.map(room => room.number.charAt(0)))];
    return floors.sort();
  };

  const getUniqueRoomTypes = () => {
    const types = [...new Set(rooms.map(room => room.type))];
    return types.sort();
  };

  const getStats = () => {
    const filteredRooms = applyFilters(rooms, filters);
    return {
      total: filteredRooms.length,
      cleaned: filteredRooms.filter(r => r.cleaned).length,
      controlled: filteredRooms.filter(r => r.controlled).length,
      assigned: filteredRooms.filter(r => r.assignedTo).length,
      withNotes: filteredRooms.filter(r => r.notes && r.notes.trim()).length,
      libre: filteredRooms.filter(r => r.state === "Libre").length,
      depart: filteredRooms.filter(r => r.state === "Départ").length,
      recouche: filteredRooms.filter(r => r.state === "Recouche").length
    };
  };

  const applyFilters = (roomsList, currentFilters) => {
    return roomsList.filter(room => {
      if (currentFilters.state !== "all" && room.state !== currentFilters.state) return false;
      if (currentFilters.cleaningStatus !== "all") {
        if (currentFilters.cleaningStatus === "cleaned" && !room.cleaned) return false;
        if (currentFilters.cleaningStatus === "not_cleaned" && room.cleaned) return false;
      }
      if (currentFilters.controlStatus !== "all") {
        if (currentFilters.controlStatus === "controlled" && !room.controlled) return false;
        if (currentFilters.controlStatus === "not_controlled" && room.controlled) return false;
      }
      if (currentFilters.assignedStatus !== "all") {
        if (currentFilters.assignedStatus === "assigned" && !room.assignedTo) return false;
        if (currentFilters.assignedStatus === "not_assigned" && room.assignedTo) return false;
      }
      if (currentFilters.assignedTo !== "all" && room.assignedTo !== currentFilters.assignedTo) return false;
      if (currentFilters.floor !== "all" && !room.number.startsWith(currentFilters.floor)) return false;
      if (currentFilters.roomType !== "all" && room.type !== currentFilters.roomType) return false;
      if (currentFilters.hasNotes !== "all") {
        const hasNotes = room.notes && room.notes.trim() !== "";
        if (currentFilters.hasNotes === "with_notes" && !hasNotes) return false;
        if (currentFilters.hasNotes === "without_notes" && hasNotes) return false;
      }
      return true;
    });
  };

  const stats = getStats();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-xl font-bold text-indigo-600">
            🔍 Filtres avancés
          </h3>
          {getFilterCount() > 0 && (
            <span className="bg-indigo-100 text-indigo-800 text-sm px-2 py-1 rounded-full">
              {getFilterCount()} actif{getFilterCount() > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={resetFilters}
            className="text-gray-500 hover:text-gray-700 text-sm underline"
          >
            Réinitialiser
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg 
              className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center p-3 bg-indigo-50 rounded-lg">
          <div className="text-2xl font-bold text-indigo-600">{stats.total}</div>
          <div className="text-sm text-indigo-700">Chambres filtrées</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.cleaned}</div>
          <div className="text-sm text-green-700">Nettoyées</div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.controlled}</div>
          <div className="text-sm text-blue-700">Contrôlées</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{stats.assigned}</div>
          <div className="text-sm text-purple-700">Assignées</div>
        </div>
      </div>

      {/* Filtres détaillés */}
      {isExpanded && (
        <div className="space-y-4 border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* État des chambres */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                État des chambres
              </label>
              <select
                value={filters.state}
                onChange={(e) => updateFilter('state', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Tous les états</option>
                <option value="Libre">🟢 Libre</option>
                <option value="Départ">🔴 Départ</option>
                <option value="Recouche">🟡 Recouche</option>
              </select>
            </div>

            {/* Statut nettoyage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut nettoyage
              </label>
              <select
                value={filters.cleaningStatus}
                onChange={(e) => updateFilter('cleaningStatus', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Tous</option>
                <option value="cleaned">✅ Nettoyées</option>
                <option value="not_cleaned">❌ Non nettoyées</option>
              </select>
            </div>

            {/* Statut contrôle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut contrôle
              </label>
              <select
                value={filters.controlStatus}
                onChange={(e) => updateFilter('controlStatus', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Tous</option>
                <option value="controlled">✅ Contrôlées</option>
                <option value="not_controlled">❌ Non contrôlées</option>
              </select>
            </div>

            {/* Assignation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut assignation
              </label>
              <select
                value={filters.assignedStatus}
                onChange={(e) => updateFilter('assignedStatus', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Toutes</option>
                <option value="assigned">👤 Assignées</option>
                <option value="not_assigned">⚪ Non assignées</option>
              </select>
            </div>

            {/* Employé spécifique */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employé assigné
              </label>
              <select
                value={filters.assignedTo}
                onChange={(e) => updateFilter('assignedTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Tous les employés</option>
                {staffList.map((staff) => (
                  <option key={staff.name} value={staff.name}>
                    {staff.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Étage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Étage
              </label>
              <select
                value={filters.floor}
                onChange={(e) => updateFilter('floor', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Tous les étages</option>
                {getUniqueFloors().map((floor) => (
                  <option key={floor} value={floor}>
                    Étage {floor}
                  </option>
                ))}
              </select>
            </div>

            {/* Type de chambre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de chambre
              </label>
              <select
                value={filters.roomType}
                onChange={(e) => updateFilter('roomType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Tous les types</option>
                {getUniqueRoomTypes().map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Présence de notes
              </label>
              <select
                value={filters.hasNotes}
                onChange={(e) => updateFilter('hasNotes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Toutes</option>
                <option value="with_notes">📝 Avec notes</option>
                <option value="without_notes">⚪ Sans notes</option>
              </select>
            </div>

            {/* Priorité (basée sur l'état et le statut) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priorité
              </label>
              <select
                value={filters.priority}
                onChange={(e) => updateFilter('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Toutes priorités</option>
                <option value="urgent">🚨 Urgent (Départ non nettoyé)</option>
                <option value="high">⚡ Haute (Recouche non nettoyé)</option>
                <option value="medium">📋 Moyenne (Assigné non fini)</option>
                <option value="low">✅ Basse (Terminé)</option>
              </select>
            </div>
          </div>

          {/* Boutons d'action rapide */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <button
              onClick={() => updateFilter('state', 'Départ')}
              className="px-3 py-2 bg-pink-100 text-pink-800 rounded-lg hover:bg-pink-200 transition-colors text-sm"
            >
              🔴 Départs uniquement
            </button>
            <button
              onClick={() => updateFilter('cleaningStatus', 'not_cleaned')}
              className="px-3 py-2 bg-orange-100 text-orange-800 rounded-lg hover:bg-orange-200 transition-colors text-sm"
            >
              ❌ Non nettoyées
            </button>
            <button
              onClick={() => updateFilter('assignedStatus', 'not_assigned')}
              className="px-3 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              ⚪ Non assignées
            </button>
            <button
              onClick={() => {
                updateFilter('cleaningStatus', 'cleaned');
                updateFilter('controlStatus', 'controlled');
              }}
              className="px-3 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-sm"
            >
              ✅ Terminées
            </button>
          </div>
        </div>
      )}
    </div>
  );
}