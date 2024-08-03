/* eslint-disable react/prop-types */
import React from "react";

export default function ManualAssignment({
  staff,
  rooms,
  assignRoom,
  manualAssignmentActive,
  setManualAssignmentActive,
  selectedEmployee,
  setSelectedEmployee,
}) {
  const toggleManualAssignment = () => {
    setManualAssignmentActive((prev) => !prev);
    if (!manualAssignmentActive) {
      setSelectedEmployee(""); // Réinitialiser l'employé sélectionné lors de l'activation
    }
  };

  // Exemple d'utilisation de assignRoom (à adapter selon vos besoins)
  const handleRoomClick = (roomNumber) => {
    if (manualAssignmentActive && selectedEmployee) {
      assignRoom(roomNumber, selectedEmployee);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 border-t-4 border-indigo-500">
      <h2 className="text-2xl font-bold mb-4 text-indigo-600">
        Assignation manuelle
      </h2>
      <div className="flex items-center space-x-4 mb-4">
        <select
          className="w-1/2 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          disabled={!manualAssignmentActive}
        >
          <option value="">Sélectionner un employé</option>
          {staff.map((person) => (
            <option key={person.name} value={person.name}>
              {person.name}
            </option>
          ))}
        </select>
        <button
          className={`${
            manualAssignmentActive ? "bg-red-500" : "bg-blue-500"
          } hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded transition duration-300`}
          onClick={toggleManualAssignment}
        >
          {manualAssignmentActive
            ? "Arrêter l'assignation"
            : "Commencer l'assignation"}
        </button>
      </div>
      {manualAssignmentActive && (
        <p className="mb-4 text-gray-600 italic">
          Cliquez sur les chambres pour les assigner à{" "}
          {selectedEmployee || "l'employé sélectionné"}.
        </p>
      )}
      <div className="space-y-2">
        {staff.map((staffMember) => (
          <div key={staffMember.name}>
            <span className="font-bold">{staffMember.name}</span>
            <div className="flex flex-wrap space-x-2">
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
                    } cursor-pointer`}
                    onClick={() => handleRoomClick(room.number)}
                  >
                    {room.number}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
