// components/RoomGrid.js

import React, { useState } from "react";
import PropTypes from "prop-types";

export default function RoomGrid({
  rooms,
  onRoomClick,
  toggleStar,
  toggleRoomChecked,
  toggleRoomControlled,
  handleNoteChange,
  manualAssignmentActive,
  selectedEmployee,
  handleLateDepartureTimeChange,
  handleNotesChange,
  handleCleaningQuality,
  userRole, // Rôle de l'utilisateur
  reportError, // Fonction pour signaler une erreur
}) {
  const [selectedRoomError, setSelectedRoomError] = useState("");
  const [errorState, setErrorState] = useState("");
  const [errorFloor, setErrorFloor] = useState("All");

  const getNoteOptions = (room) => {
    if (room.state === "Départ") {
      return ["Départ tardif"];
    } else if (room.state === "Recouche") {
      return ["DND", "Refus"];
    }
    return [];
  };

  const handleRoomClickInternal = (e, room) => {
    // Vérifier si le clic provient d'un élément interactif
    if (
      e.target.tagName === "INPUT" ||
      e.target.tagName === "BUTTON" ||
      e.target.tagName === "SELECT" ||
      e.target.tagName === "TEXTAREA"
    ) {
      return; // Ne rien faire si le clic vient d'un input, bouton, select ou textarea
    }
    // Autoriser uniquement les gouvernantes à modifier l'état de la chambre
    if (userRole === "gouvernante" && !room.checked) {
      onRoomClick(room.number);
    }
  };

  const getQualityColor = (quality) => {
    switch (quality) {
      case "bien":
        return "bg-green-200";
      case "moyennement":
        return "bg-orange-200";
      case "mal":
        return "bg-red-200";
      default:
        return "bg-gray-200";
    }
  };

  const handleReportError = () => {
    if (!selectedRoomError || !errorState) {
      alert("Veuillez sélectionner une chambre et son état.");
      return;
    }
    reportError(selectedRoomError, errorState);
    setSelectedRoomError("");
    setErrorState("");
    setErrorFloor("All"); // Reset the floor selection after reporting an error
  };

  const getFloors = () => {
    const floorSet = new Set(rooms.map((room) => room.number.charAt(0)));
    return Array.from(floorSet);
  };

  const filteredErrorRooms =
    errorFloor === "All"
      ? rooms
      : rooms.filter((room) => room.number.startsWith(errorFloor));

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 sm:p-8 md:p-10 border-t-4 border-indigo-500 segment w-full">
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-indigo-600 text-shadow">
        État des chambres
      </h2>
      {manualAssignmentActive && selectedEmployee && (
        <p className="text-sm text-indigo-600 mb-2">
          Assignation en cours : {selectedEmployee}
        </p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4 overflow-y-auto max-h-[calc(100vh-300px)]">
        {rooms.map((room) => (
          <div
            key={room.number}
            className={`flex flex-col border border-gray-300 rounded-lg overflow-hidden ${
              room.state === "Départ"
                ? "bg-pink-200"
                : room.state === "Recouche"
                ? "bg-green-200"
                : "bg-white"
            } ${room.checked ? "border-2 border-blue-500" : ""}
            ${
              manualAssignmentActive && !room.assignedTo ? "cursor-pointer" : ""
            }
            ${
              room.assignedTo === selectedEmployee
                ? "ring-2 ring-indigo-500"
                : ""
            }`}
            onClick={(e) => handleRoomClickInternal(e, room)}
          >
            <div className="p-2 sm:p-3 text-center font-bold text-sm sm:text-base text-shadow">
              {room.number}
            </div>
            <div className="flex-grow p-2 sm:p-3 text-sm">
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm sm:text-base text-gray-600 truncate text-shadow">
                  {room.assignedTo ||
                    (manualAssignmentActive ? "Assigner" : "")}
                </span>
                {room.state === "Recouche" && (
                  <span
                    className={`cursor-pointer ${
                      room.star ? "text-yellow-500" : "text-gray-300"
                    } ${room.checked ? "pointer-events-none opacity-50" : ""}`} // Désactiver l'étoile si la chambre est nettoyée
                    onClick={(e) => {
                      if (!room.checked) {
                        // Ne pas permettre le clic si la chambre est nettoyée
                        e.stopPropagation();
                        toggleStar(room.number);
                      }
                    }}
                  >
                    ★
                  </span>
                )}
              </div>
              <div className="mt-1 space-y-1 text-shadow">
                {getNoteOptions(room).map((note) => (
                  <label key={note} className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={room.notes?.includes(note) || false}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleNoteChange(room.number, note, e.target.checked);
                      }}
                      className="mr-1 h-4 w-4"
                      disabled={userRole !== "gouvernante" || room.checked} // Désactiver si la chambre est nettoyée
                    />
                    <span className="truncate">{note}</span>
                  </label>
                ))}
              </div>
              {room.state === "Départ" &&
                room.notes?.includes("Départ tardif") && (
                  <div className="mt-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Heure de départ :
                    </label>
                    <input
                      type="time"
                      className="w-full p-2 text-sm border rounded focus:outline-none focus:ring focus:border-indigo-500"
                      value={room.lateDepartureTime || ""}
                      onChange={(e) =>
                        handleLateDepartureTimeChange(
                          room.number,
                          e.target.value
                        )
                      }
                      disabled={userRole !== "gouvernante" || room.checked} // Désactiver si la chambre est nettoyée
                    />
                  </div>
                )}
              {/* Ajouter un champ pour les notes des objets oubliés ou autres */}
              <textarea
                className="w-full p-2 mt-2 text-sm border rounded resize-none focus:outline-none focus:ring focus:border-indigo-500"
                placeholder="Notes (objets oubliés, problèmes, etc.)"
                value={room.customNotes || ""}
                onChange={(e) => handleNotesChange(room.number, e.target.value)}
                rows={3}
                disabled={userRole === "femmeDeChambre" && room.controlled} // La femme de chambre ne peut pas modifier les notes si la chambre est contrôlée
              ></textarea>
              {/* Indicateur de chambre nettoyée */}
              {userRole === "gouvernante" ? (
                <p
                  className={`mt-2 text-sm p-2 rounded ${
                    room.checked
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {room.checked ? "Nettoyée" : "Non Nettoyée"}
                </p>
              ) : (
                // Bouton pour marquer comme nettoyée pour la femme de chambre
                <button
                  className={`mt-2 w-full text-sm py-2 px-3 rounded ${
                    room.checked
                      ? "bg-blue-500 text-white"
                      : room.controlled
                      ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                      : "bg-gray-200"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleRoomChecked(room.number);
                  }}
                  disabled={room.checked || room.controlled} // Désactiver si la chambre est nettoyée ou contrôlée
                >
                  {room.checked ? "Nettoyée" : "Marquer Nettoyée"}
                </button>
              )}
              {/* Indicateur de chambre contrôlée */}
              <div
                className={`mt-2 text-sm p-2 rounded ${
                  room.controlled ? "bg-green-500 text-white" : "bg-gray-200"
                }`}
              >
                {room.controlled ? "Contrôlée" : "Non Contrôlée"}
              </div>
              {/* Bouton pour marquer comme contrôlée pour la gouvernante */}
              {userRole === "gouvernante" && room.checked && (
                <button
                  className={`mt-2 w-full text-sm py-2 px-3 rounded ${
                    room.controlled ? "bg-green-500 text-white" : "bg-gray-200"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleRoomControlled(room.number);
                  }}
                  disabled={room.controlled} // Désactiver le bouton si la chambre est déjà contrôlée
                >
                  {room.controlled ? "Déjà Contrôlée" : "Marquer Contrôlée"}
                </button>
              )}
              {/* Options de qualité du nettoyage (seulement pour la gouvernante) */}
              {userRole === "gouvernante" && room.controlled && (
                <div className="mt-3 flex justify-around">
                  <button
                    className={`w-8 h-8 rounded-full ${
                      room.cleaningQuality === "bien"
                        ? "bg-green-500"
                        : "bg-gray-200"
                    }`}
                    title="Bien Nettoyée"
                    onClick={() => handleCleaningQuality(room.number, "bien")}
                  />
                  <button
                    className={`w-8 h-8 rounded-full ${
                      room.cleaningQuality === "moyennement"
                        ? "bg-orange-500"
                        : "bg-gray-200"
                    }`}
                    title="Moyennement Nettoyée"
                    onClick={() =>
                      handleCleaningQuality(room.number, "moyennement")
                    }
                  />
                  <button
                    className={`w-8 h-8 rounded-full ${
                      room.cleaningQuality === "mal"
                        ? "bg-red-500"
                        : "bg-gray-200"
                    }`}
                    title="Mal Nettoyée"
                    onClick={() => handleCleaningQuality(room.number, "mal")}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {userRole === "femmeDeChambre" && (
        <div className="mt-6 p-6 border-t-2 border-red-500">
          <h3 className="text-lg font-semibold text-red-500 mb-4">
            Rapporter une erreur
          </h3>
          {/* Sélection de l'étage */}
          <div className="mb-4">
            <label className="block text-base font-semibold text-gray-700">
              Sélectionner un étage :
            </label>
            <select
              value={errorFloor}
              onChange={(e) => setErrorFloor(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="All">Tous les étages</option>
              {getFloors().map((floor) => (
                <option key={floor} value={floor}>
                  Étage {floor}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-base font-semibold text-gray-700">
              Chambre faite par erreur :
            </label>
            <select
              value={selectedRoomError}
              onChange={(e) => setSelectedRoomError(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Sélectionner une chambre</option>
              {filteredErrorRooms.map((room) => (
                <option key={room.number} value={room.number}>
                  {room.number}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-base font-semibold text-gray-700">
              État de la chambre :
            </label>
            <select
              value={errorState}
              onChange={(e) => setErrorState(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Sélectionner un état</option>
              <option value="Libre">Libre</option>
              <option value="Départ">Départ</option>
              <option value="Recouche">Recouche</option>
            </select>
          </div>
          <button
            className="mt-4 w-full bg-red-500 text-white p-3 rounded"
            onClick={handleReportError}
          >
            Soumettre l'erreur
          </button>
        </div>
      )}
    </div>
  );
}

// Validation des props
RoomGrid.propTypes = {
  rooms: PropTypes.arrayOf(
    PropTypes.shape({
      number: PropTypes.string.isRequired,
      state: PropTypes.string.isRequired,
      type: PropTypes.string,
      notes: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
      assignedTo: PropTypes.string,
      checked: PropTypes.bool.isRequired,
      controlled: PropTypes.bool, // Ajout de la propriété controlled
      star: PropTypes.bool,
      customNotes: PropTypes.string, // Ajout des notes personnalisées
      lateDepartureTime: PropTypes.string, // Ajout pour l'heure de départ tardif
      cleaningQuality: PropTypes.string, // Ajout pour la qualité de nettoyage
    })
  ).isRequired,
  onRoomClick: PropTypes.func.isRequired,
  toggleStar: PropTypes.func.isRequired,
  toggleRoomChecked: PropTypes.func.isRequired,
  toggleRoomControlled: PropTypes.func.isRequired, // Ajout de la validation de la fonction
  handleNoteChange: PropTypes.func.isRequired,
  manualAssignmentActive: PropTypes.bool.isRequired,
  selectedEmployee: PropTypes.string.isRequired,
  handleLateDepartureTimeChange: PropTypes.func.isRequired,
  handleNotesChange: PropTypes.func.isRequired,
  userRole: PropTypes.string.isRequired, // Validation du rôle de l'utilisateur
  handleCleaningQuality: PropTypes.func.isRequired, // Validation pour la fonction de qualité de nettoyage
  reportError: PropTypes.func.isRequired, // Validation pour la fonction de rapport d'erreurs
};
