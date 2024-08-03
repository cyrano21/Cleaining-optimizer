// components/RoomSearch.js
import React, { useState } from "react";

const RoomSearch = ({ rooms }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = () => {
    const results = rooms.filter(
      (room) =>
        room.number.includes(searchQuery) ||
        (room.assignedTo &&
          room.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setSearchResults(results);
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 border-t-4 border-indigo-500">
      <h2 className="text-2xl font-bold mb-4 text-indigo-600">
        Recherche de chambres
      </h2>
      <div className="flex items-center space-x-4 mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Numéro de chambre ou nom d'employé"
          className="w-2/3 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          Rechercher
        </button>
      </div>
      <div className="mt-4 max-h-48 overflow-y-auto">
        {searchResults.map((room) => (
          <div
            key={room.number}
            className="flex justify-between items-center p-2 border-b"
          >
            <span>
              Chambre {room.number} - État: {room.state} - Employé:{" "}
              {room.assignedTo || "Non attribué"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
export default RoomSearch;
