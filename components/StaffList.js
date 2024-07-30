import React, { useState } from "react";

const StaffList = ({ staff, onAddStaff, onRemoveStaff, onUpdateStaff }) => {
  const [newStaff, setNewStaff] = useState({
    name: "",
    contract: "6h",
    preferredFloor: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddStaff(newStaff);
    setNewStaff({ name: "", contract: "6h", preferredFloor: "" });
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Liste du Personnel
      </h2>
      <p className="mb-4">Nombre total d'employés: {staff.length}</p>
      <form onSubmit={handleSubmit} className="mb-4 space-y-2">
        <input
          type="text"
          value={newStaff.name}
          onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
          placeholder="Nom de l'employé"
          className="w-full p-2 border rounded"
        />
        <select
          value={newStaff.contract}
          onChange={(e) =>
            setNewStaff({ ...newStaff, contract: e.target.value })
          }
          className="w-full p-2 border rounded"
        >
          <option value="5h">Contrat 5h</option>
          <option value="6h">Contrat 6h</option>
        </select>
        <input
          type="text"
          value={newStaff.preferredFloor}
          onChange={(e) =>
            setNewStaff({ ...newStaff, preferredFloor: e.target.value })
          }
          placeholder="Étage préféré"
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          Ajouter Employé
        </button>
      </form>
      <ul className="space-y-2">
        {staff.map((employee) => (
          <li
            key={employee.name}
            className="border p-2 rounded flex justify-between items-center"
          >
            <div>
              <strong>{employee.name}</strong> - {employee.contract}
              {employee.preferredFloor &&
                ` (Étage préféré: ${employee.preferredFloor})`}
            </div>
            <button
              onClick={() => onRemoveStaff(employee.name)}
              className="bg-red-500 text-white px-2 py-1 rounded"
            >
              Supprimer
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StaffList;
