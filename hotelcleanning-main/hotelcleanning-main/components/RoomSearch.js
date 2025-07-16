// components/RoomSearch.js
import React from "react";

const RoomSearch = ({ rooms, searchQuery, setSearchQuery }) => {
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const searchResults = rooms.filter(room => {
    if (!searchQuery) return false;
    return room.number.includes(searchQuery) || 
           (room.assignedTo && room.assignedTo.toLowerCase().includes(searchQuery.toLowerCase())) ||
           room.notes.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4 text-indigo-600">
        Recherche de chambres
      </h2>
      
      <div className="relative mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Numéro de chambre, nom d'employé ou étage (ex: 101, Marie, 2)"
          className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        
        <div className="absolute right-12 top-3 text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <button
        onClick={() => handleSearch(searchQuery)}
        disabled={!searchQuery}
        className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
          searchQuery 
            ? "bg-blue-500 hover:bg-blue-600 shadow-lg hover:shadow-xl" 
            : "bg-gray-300 cursor-not-allowed"
        }`}
      >
        Rechercher
      </button>

      {/* Résultats de recherche */}
      {searchQuery && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">
            Résultats de recherche ({searchResults.length})
          </h3>
          
          {searchResults.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {searchResults.map((room) => (
                <div
                  key={room.number}
                  className="p-3 border rounded-lg hover:shadow-md transition-shadow bg-white"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-indigo-600">
                        Chambre {room.number}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        room.state === "Libre" ? "bg-green-100 text-green-800" :
                        room.state === "Départ" ? "bg-pink-100 text-pink-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {room.state}
                      </span>
                    </div>
                    <div className="flex space-x-1">
                      {room.cleaned && <span className="text-green-500 text-sm">✅</span>}
                      {room.controlled && <span className="text-blue-500 text-sm">🔍</span>}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    {room.assignedTo && (
                      <div>
                        <strong>Assigné à:</strong> {room.assignedTo}
                      </div>
                    )}
                    {room.notes && (
                      <div>
                        <strong>Notes:</strong> {room.notes}
                      </div>
                    )}
                    <div className="flex space-x-4 text-xs">
                      <span className={room.cleaned ? "text-green-600" : "text-gray-400"}>
                        {room.cleaned ? "Nettoyée" : "Non nettoyée"}
                      </span>
                      <span className={room.controlled ? "text-blue-600" : "text-gray-400"}>
                        {room.controlled ? "Contrôlée" : "Non contrôlée"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <svg className="mx-auto w-12 h-12 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg">Aucun résultat trouvé</p>
              <p className="text-sm">Essayez un autre terme de recherche</p>
            </div>
          )}
        </div>
      )}

      {/* Suggestions de recherche */}
      {!searchQuery && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-700 mb-2">💡 Suggestions de recherche</h4>
          <div className="flex flex-wrap gap-2">
            {["101", "102", "2", "3", "Libre", "Départ"].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSearch(suggestion)}
                className="px-3 py-1 bg-white border rounded-full text-sm hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomSearch;