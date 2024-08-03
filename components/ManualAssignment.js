import React, { useState } from "react";
import PropTypes from "prop-types";

export default function ManualAssignment({
  staff,
  rooms,
  assignRoom,
  unassignRoom,
  manualAssignmentActive,
  setManualAssignmentActive,
  selectedEmployee,
  setSelectedEmployee,
}) {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [reassignMode, setReassignMode] = useState(false);
  const [reassignEmployee, setReassignEmployee] = useState("Marie");

  const toggleManualAssignment = () => {
    setManualAssignmentActive((prev) => !prev);
    if (!manualAssignmentActive) {
      setSelectedEmployee(""); // Réinitialiser l'employé sélectionné lors de l'activation
    }
  };

  const handleRoomClick = (roomNumber) => {
    if (manualAssignmentActive && selectedEmployee) {
      if (selectedRoom && selectedRoom === roomNumber) {
        unassignRoom(roomNumber); // Désassigner si la chambre est déjà sélectionnée
        setSelectedRoom(null);
      } else {
        assignRoom(roomNumber, selectedEmployee); // Assigner la chambre
        setSelectedRoom(roomNumber);
      }
    }
  };

  const handleUnassign = (roomNumber) => {
    unassignRoom(roomNumber); // Désassigner la chambre actuelle
    setSelectedRoom(roomNumber); // Garder la chambre sélectionnée pour réassignation
    setReassignMode(true); // Activer le mode de réassignation
  };

  const handleReassign = (roomNumber) => {
    if (reassignEmployee) {
      assignRoom(roomNumber, reassignEmployee);
      setSelectedRoom(null); // Réinitialiser la chambre sélectionnée
      setReassignMode(false); // Désactiver le mode de réassignation
    }
  };

  const getNotes = (room) => {
    const notes = [];
    if (room.state === "Départ" && room.notes?.includes("Départ tardif")) {
      notes.push("Départ tardif");
    } else if (room.state === "Recouche") {
      if (room.notes?.includes("DND")) notes.push("DND");
      if (room.notes?.includes("Refus")) notes.push("Refus");
    }
    return notes;
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 border-t-4 border-indigo-500">
      <h2 className="text-2xl font-bold mb-4 text-indigo-600">
        Assignation manuelle
      </h2>

      {/* Bouton pour activer l'assignation manuelle */}
      <button
        className={`mb-4 p-2 rounded ${
          manualAssignmentActive
            ? "bg-red-500 text-white"
            : "bg-blue-500 text-white"
        }`}
        onClick={toggleManualAssignment}
      >
        {manualAssignmentActive
          ? "Désactiver l'assignation manuelle"
          : "Activer l'assignation manuelle"}
      </button>

      {/* Sélection de l'employé */}
      {manualAssignmentActive && (
        <div className="mb-4">
          <label className="block mb-2 font-semibold text-gray-700">
            Sélectionnez un employé :
          </label>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Choisissez un employé</option>
            {staff.map((staffMember) => (
              <option key={staffMember.name} value={staffMember.name}>
                {staffMember.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Liste des chambres assignées */}
      <div className="space-y-4">
        {staff.map((staffMember) => (
          <div key={staffMember.name}>
            <span className="font-bold text-lg">{staffMember.name}</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
              {rooms
                .filter((room) => room.assignedTo === staffMember.name)
                .map((room) => (
                  <div
                    key={room.number}
                    className={`p-2 border rounded ${
                      room.state === "Départ"
                        ? "bg-pink-100"
                        : room.state === "Recouche"
                        ? "bg-green-100"
                        : "bg-white"
                    } ${room.checked ? "border-2 border-blue-500" : ""}`}
                    onClick={() => handleRoomClick(room.number)}
                  >
                    <div className="font-semibold">{room.number}</div>
                    {room.state === "Recouche" && room.star && (
                      <span className="text-yellow-500">★</span>
                    )}
                    <div className="text-xs mt-1">
                      {getNotes(room).map((note) => (
                        <span
                          key={note}
                          className="mr-1 bg-gray-200 px-1 rounded"
                        >
                          {note}
                        </span>
                      ))}
                    </div>
                    {room.checked && (
                      <div className="text-xs text-blue-500 mt-1">
                        Contrôlée
                      </div>
                    )}
                    {/* Bouton pour désassigner la chambre */}
                    <button
                      className="mt-2 p-1 bg-red-400 text-white text-xs rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnassign(room.number);
                      }}
                    >
                      Désassigner
                    </button>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Option pour réassigner si une chambre est désassignée */}
      {reassignMode && selectedRoom && (
        <div className="mt-4 p-4 bg-yellow-100 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-600">
            Réassigner la chambre {selectedRoom}
          </h3>
          <label className="block mb-2 font-semibold text-gray-700">
            Choisissez un employé pour réassigner :
          </label>
          <select
            value={reassignEmployee}
            onChange={(e) => setReassignEmployee(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="Marie">Marie</option>
            {staff
              .filter((staffMember) => staffMember.name !== "Marie")
              .map((staffMember) => (
                <option key={staffMember.name} value={staffMember.name}>
                  {staffMember.name}
                </option>
              ))}
          </select>
          <button
            className="mt-2 p-2 bg-green-500 text-white rounded"
            onClick={() => handleReassign(selectedRoom)}
          >
            Réassigner à {reassignEmployee}
          </button>
          <button
            className="mt-2 ml-2 p-2 bg-gray-500 text-white rounded"
            onClick={() => {
              setReassignMode(false);
              setSelectedRoom(null);
              setReassignEmployee("Marie"); // Réinitialiser à Marie par défaut
            }}
          >
            Annuler
          </button>
        </div>
      )}
    </div>
  );
}

// Ajouter la validation des props
ManualAssignment.propTypes = {
  staff: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      contractType: PropTypes.string,
      preferredFloor: PropTypes.string,
    })
  ).isRequired,
  rooms: PropTypes.arrayOf(
    PropTypes.shape({
      number: PropTypes.string.isRequired,
      state: PropTypes.string.isRequired,
      type: PropTypes.string,
      notes: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
      assignedTo: PropTypes.string,
      checked: PropTypes.bool.isRequired,
      star: PropTypes.bool,
    })
  ).isRequired,
  assignRoom: PropTypes.func.isRequired,
  unassignRoom: PropTypes.func.isRequired,
  manualAssignmentActive: PropTypes.bool.isRequired,
  setManualAssignmentActive: PropTypes.func.isRequired,
  selectedEmployee: PropTypes.string.isRequired,
  setSelectedEmployee: PropTypes.func.isRequired,
};
