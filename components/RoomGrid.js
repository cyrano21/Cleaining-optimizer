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
  userRole,
  reportError,
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
    if (
      e.target.tagName === "INPUT" ||
      e.target.tagName === "BUTTON" ||
      e.target.tagName === "SELECT" ||
      e.target.tagName === "TEXTAREA"
    ) {
      return;
    }
    if (userRole === "gouvernante" && !room.checked) {
      onRoomClick(room.number);
    }
  };

  const getQualityColor = (quality) => {
    switch (quality) {
      case "bien":
        return "bg-green-500";
      case "moyennement":
        return "bg-orange-500";
      case "mal":
        return "bg-red-500";
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
    setErrorFloor("All");
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
    <div className="bg-white shadow-lg rounded-lg p-4 sm:p-4 md:p-6 lg:p-8 xl:p-10 border-t-4 border-indigo-500 w-full max-w-screen-xl mx-auto my-8 segment">
      <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4 text-indigo-600">
        État des chambres
      </h2>
      {manualAssignmentActive && selectedEmployee && (
        <p className="text-sm text-indigo-600 mb-2">
          Assignation en cours : {selectedEmployee}
        </p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1 sm:gap-2 overflow-y-auto max-h-[calc(100vh-400px)]">
        {rooms.map((room) => (
          <div
            key={room.number}
            className={`flex flex-col border border-gray-300 rounded-lg overflow-hidden ${
              room.state === "Départ"
                ? "bg-pink-200"
                : room.state === "Recouche"
                ? "bg-green-200"
                : "bg-white"
            } ${room.checked ? "border-2 border-blue-500" : ""} ${
              manualAssignmentActive && !room.assignedTo ? "cursor-pointer" : ""
            } ${
              room.assignedTo === selectedEmployee
                ? "ring-2 ring-indigo-500"
                : ""
            }`}
            onClick={(e) => handleRoomClickInternal(e, room)}
          >
            <div className="p-1 sm:p-2 text-center font-bold text-xs sm:text-sm text-shadow">
              {room.number}
            </div>
            <div className="flex-grow p-1 sm:p-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm font-semibold text-gray-800 truncate text-shadow">
                  {room.state}
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs sm:text-sm text-gray-600 truncate text-shadow">
                  {room.assignedTo ||
                    (manualAssignmentActive ? "Assigner" : "")}
                </span>
                {room.state === "Recouche" && (
                  <span
                    className={`cursor-pointer ${
                      room.star ? "text-yellow-500" : "text-gray-300"
                    } ${room.checked ? "pointer-events-none opacity-50" : ""}`}
                    onClick={(e) => {
                      if (!room.checked) {
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
                  <label key={note} className="flex items-center text-xs">
                    <input
                      type="checkbox"
                      checked={room.notes?.includes(note) || false}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleNoteChange(room.number, note, e.target.checked);
                      }}
                      className="mr-1 h-3 w-3"
                      disabled={userRole !== "gouvernante" || room.checked}
                    />
                    <span className="truncate">{note}</span>
                  </label>
                ))}
              </div>
              {room.state === "Départ" &&
                room.notes?.includes("Départ tardif") && (
                  <div className="mt-2">
                    <label className="block text-xs font-semibold text-gray-700">
                      Heure de départ :
                    </label>
                    <input
                      type="time"
                      className="w-full p-1 text-xs border rounded focus:outline-none focus:ring focus:border-indigo-500"
                      value={room.lateDepartureTime || ""}
                      onChange={(e) =>
                        handleLateDepartureTimeChange(
                          room.number,
                          e.target.value
                        )
                      }
                      disabled={userRole !== "gouvernante" || room.checked}
                    />
                  </div>
                )}
              <textarea
                className="w-full p-1 mt-1 text-xs border rounded resize-none focus:outline-none focus:ring focus:border-indigo-500"
                placeholder="Notes (objets oubliés, problèmes, etc.)"
                value={room.customNotes || ""}
                onChange={(e) => handleNotesChange(room.number, e.target.value)}
                rows={2}
                disabled={userRole === "femmeDeChambre" && room.controlled}
              ></textarea>
              {userRole === "gouvernante" ? (
                <p
                  className={`mt-1 text-xs p-1 rounded ${
                    room.checked
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {room.checked ? "Nettoyée" : "Non Nettoyée"}
                </p>
              ) : (
                <button
                  className={`mt-1 w-full text-xs py-1 px-1 rounded ${
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
                  disabled={room.checked || room.controlled}
                >
                  {room.checked ? "Nettoyée" : "Marquer Nettoyée"}
                </button>
              )}
              <div
                className={`mt-1 text-xs p-1 rounded ${
                  room.controlled ? "bg-green-500 text-white" : "bg-gray-200"
                }`}
              >
                {room.controlled ? "Contrôlée" : "Non Contrôlée"}
              </div>
              {userRole === "gouvernante" && room.checked && (
                <button
                  className={`mt-1 w-full text-xs py-1 px-1 rounded ${
                    room.controlled ? "bg-green-500 text-white" : "bg-gray-200"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleRoomControlled(room.number);
                  }}
                  disabled={room.controlled}
                >
                  {room.controlled ? "Déjà Contrôlée" : "Marquer Contrôlée"}
                </button>
              )}
              {userRole === "gouvernante" && room.controlled && (
                <div className="mt-2 flex justify-around">
                  {["bien", "moyennement", "mal"].map((quality) => (
                    <button
                      key={quality}
                      className={`w-6 h-6 rounded-full ${getQualityColor(
                        room.cleaningQuality === quality ? quality : ""
                      )}`}
                      title={`${
                        quality.charAt(0).toUpperCase() + quality.slice(1)
                      } Nettoyée`}
                      onClick={() =>
                        handleCleaningQuality(room.number, quality)
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {userRole === "femmeDeChambre" && (
        <div className="mt-4 p-4 border-t-2 border-red-500">
          <h3 className="text-lg font-semibold text-red-500 mb-2">
            Rapporter une erreur
          </h3>
          <div className="mb-2">
            <label className="block text-sm font-semibold text-gray-700">
              Sélectionner un étage :
            </label>
            <select
              value={errorFloor}
              onChange={(e) => setErrorFloor(e.target.value)}
              className="w-full p-1 border rounded"
            >
              <option value="All">Tous les étages</option>
              {getFloors().map((floor) => (
                <option key={floor} value={floor}>
                  Étage {floor}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-2">
            <label className="block text-sm font-semibold text-gray-700">
              Chambre faite par erreur :
            </label>
            <select
              value={selectedRoomError}
              onChange={(e) => setSelectedRoomError(e.target.value)}
              className="w-full p-1 border rounded"
            >
              <option value="">Sélectionner une chambre</option>
              {filteredErrorRooms.map((room) => (
                <option key={room.number} value={room.number}>
                  {room.number}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-2">
            <label className="block text-sm font-semibold text-gray-700">
              État de la chambre :
            </label>
            <select
              value={errorState}
              onChange={(e) => setErrorState(e.target.value)}
              className="w-full p-1 border rounded"
            >
              <option value="">Sélectionner un état</option>
              <option value="Libre">Libre</option>
              <option value="Départ">Départ</option>
              <option value="Recouche">Recouche</option>
            </select>
          </div>
          <button
            className="mt-2 w-full bg-red-500 text-white p-2 rounded"
            onClick={handleReportError}
          >
            Soumettre l&apos;erreur
          </button>
        </div>
      )}
    </div>
  );
}

RoomGrid.propTypes = {
  rooms: PropTypes.arrayOf(
    PropTypes.shape({
      number: PropTypes.string.isRequired,
      state: PropTypes.string.isRequired,
      type: PropTypes.string,
      notes: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
      assignedTo: PropTypes.string,
      checked: PropTypes.bool.isRequired,
      controlled: PropTypes.bool,
      star: PropTypes.bool,
      customNotes: PropTypes.string,
      lateDepartureTime: PropTypes.string,
      cleaningQuality: PropTypes.string,
    })
  ).isRequired,
  onRoomClick: PropTypes.func.isRequired,
  toggleStar: PropTypes.func.isRequired,
  toggleRoomChecked: PropTypes.func.isRequired,
  toggleRoomControlled: PropTypes.func.isRequired,
  handleNoteChange: PropTypes.func.isRequired,
  manualAssignmentActive: PropTypes.bool.isRequired,
  selectedEmployee: PropTypes.string.isRequired,
  handleLateDepartureTimeChange: PropTypes.func.isRequired,
  handleNotesChange: PropTypes.func.isRequired,
  userRole: PropTypes.string.isRequired,
  handleCleaningQuality: PropTypes.func.isRequired,
  reportError: PropTypes.func.isRequired,
};
