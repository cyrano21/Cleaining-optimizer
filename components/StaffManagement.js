import React, { useState } from "react";
import PropTypes from "prop-types";

export default function StaffManagement({ rooms = [], staffList, addStaff }) {
  const [newEmployeeName, setNewEmployeeName] = useState("");
  const [contractType, setContractType] = useState("5h");
  const [preferredFloor, setPreferredFloor] = useState("");

  const getFloors = () => {
    if (rooms.length === 0) return [];
    const floorSet = new Set(rooms.map((room) => room.number.charAt(0)));
    return Array.from(floorSet);
  };

  const handleAddStaff = () => {
    if (newEmployeeName.trim() === "") {
      alert("Veuillez entrer un nom d'employé.");
      return;
    }
    addStaff(newEmployeeName, contractType, preferredFloor);
    setNewEmployeeName("");
    setContractType("5h");
    setPreferredFloor("");
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 border-t-4 border-indigo-500 w-full">
      <h2 className="text-xl font-bold mb-4 text-indigo-600">
        Gestion du Personnel
      </h2>
      <div className="space-y-4">
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <input
            type="text"
            placeholder="Nom de l'employé"
            value={newEmployeeName}
            onChange={(e) => setNewEmployeeName(e.target.value)}
            className="w-full sm:w-1/3 p-2 border rounded-md"
          />
          <select
            value={contractType}
            onChange={(e) => setContractType(e.target.value)}
            className="w-full sm:w-1/4 p-2 border rounded-md"
          >
            <option value="5h">5h</option>
            <option value="6h">6h</option>
          </select>
          <select
            value={preferredFloor}
            onChange={(e) => setPreferredFloor(e.target.value)}
            className="w-full sm:w-1/4 p-2 border rounded-md"
          >
            <option value="">Choisir un étage</option>
            {getFloors().map((floor) => (
              <option key={floor} value={floor}>
                Étage {floor}
              </option>
            ))}
          </select>
          <button
            onClick={handleAddStaff}
            className="w-full sm:w-auto bg-indigo-500 text-white p-2 rounded-md hover:bg-indigo-600 transition-colors"
          >
            Ajouter
          </button>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-2 text-indigo-600">
            Liste du Personnel
          </h3>
          <ul className="list-disc pl-4 space-y-1">
            {staffList.map((staff) => (
              <li key={staff.name} className="text-gray-700">
                {staff.name} - {staff.contractType} - Étage{" "}
                {staff.preferredFloor}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// PropTypes pour valider les props
StaffManagement.propTypes = {
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
  ),
  staffList: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      contractType: PropTypes.string.isRequired,
      preferredFloor: PropTypes.string,
    })
  ).isRequired,
  addStaff: PropTypes.func.isRequired,
};
