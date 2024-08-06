// RoomSearch.js
import React, { useState } from "react";
import PropTypes from "prop-types";
import { performSearch } from "../utils/searchUtils";

const RoomSearch = ({ rooms, onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    const results = performSearch(rooms, searchQuery);
    onSearch(results);
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
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Numéro de chambre, nom d'employé ou étage (ex: 3)"
          className="w-2/3 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          Rechercher
        </button>
      </div>
    </div>
  );
};

RoomSearch.propTypes = {
  rooms: PropTypes.arrayOf(
    PropTypes.shape({
      number: PropTypes.string.isRequired,
      state: PropTypes.string.isRequired,
      assignedTo: PropTypes.string,
    })
  ).isRequired,
  onSearch: PropTypes.func.isRequired,
};

export default RoomSearch;
