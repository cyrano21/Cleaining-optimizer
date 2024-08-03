// components/StaffManagement.js
import React, { useState } from "react";

export default function StaffManagement({ staffList, addStaff }) {
  const [staffName, setStaffName] = useState("");
  const [staffContract, setStaffContract] = useState("5");
  const [staffPreferredFloor, setStaffPreferredFloor] = useState("");

  const handleAddStaff = () => {
    if (staffName) {
      addStaff(staffName, staffContract, staffPreferredFloor);
      setStaffName("");
      setStaffContract("5");
      setStaffPreferredFloor("");
    } else {
      alert("Veuillez entrer un nom pour l'employé.");
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 border-t-4 border-indigo-500">
      <h2 className="text-2xl font-bold mb-4 text-indigo-600">
        Gestion du personnel
      </h2>
      <div className="grid grid-cols-1 gap-4 mb-4">
        <input
          type="text"
          value={staffName}
          onChange={(e) => setStaffName(e.target.value)}
          placeholder="Nom de l'employé"
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={staffContract}
          onChange={(e) => setStaffContract(e.target.value)}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="5">Contrat 5h</option>
          <option value="6">Contrat 6h</option>
        </select>
        <select
          value={staffPreferredFloor}
          onChange={(e) => setStaffPreferredFloor(e.target.value)}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Étage préféré</option>
          <option value="1">1er étage</option>
          <option value="2">2ème étage</option>
          <option value="3">3ème étage</option>
          <option value="4">4ème étage</option>
          <option value="5">5ème étage</option>
          <option value="6">6ème étage</option>
        </select>
        <button
          onClick={handleAddStaff}
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          Ajouter un employé
        </button>
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {staffList.map((staff) => (
          <div
            key={staff.name}
            className="flex justify-between items-center p-2 border-b"
          >
            <span className="font-medium">{staff.name}</span>
            <span className="text-sm text-gray-500">
              Contrat {staff.contractType}h, Étage préféré:{" "}
              {staff.preferredFloor || "Non spécifié"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
