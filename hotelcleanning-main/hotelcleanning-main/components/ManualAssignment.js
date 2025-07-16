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

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6 border-t-4 border-indigo-500">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-indigo-600">
        Assignation manuelle
      </h2>
      <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
        <select
          className="w-full sm:w-1/2 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
          className={`w-full sm:w-auto ${
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
        <p className="mb-4 text-sm sm:text-base text-gray-600 italic">
          📋 Mode assignation actif : Cliquez sur les chambres pour les assigner à{" "}
          {selectedEmployee || "l'employé sélectionné"}.
        </p>
      )}
      <div className="space-y-3">
        {staff.map((staffMember) => {
          const assignedRooms = rooms.filter((room) => room.assignedTo === staffMember.name);
          return (
            <div key={staffMember.name} className="border rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-sm">{staffMember.name}</span>
                <span className="text-xs text-gray-500">
                  {assignedRooms.length} chambre(s) assignée(s)
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {assignedRooms.map((room) => (
                  <div
                    key={room.number}
                    className={`px-2 py-1 text-xs rounded ${
                      room.state === "Départ"
                        ? "bg-pink-100 text-pink-800"
                        : room.state === "Recouche"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {room.number}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
