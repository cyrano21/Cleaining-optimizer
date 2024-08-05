import React, { useState } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";

export default function ManualAssignment({
  staff,
  rooms,
  setRooms, // Ajout de la fonction setRooms
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

  // Fonction pour gérer le changement de notes des objets oubliés ou autres
  const handleNotesChange = (roomNumber, newNote) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.number === roomNumber ? { ...room, customNotes: newNote } : room
      )
    );
  };

  // Fonction pour gérer l'heure de départ tardif
  const handleLateDepartureTimeChange = (roomNumber, time) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.number === roomNumber ? { ...room, lateDepartureTime: time } : room
      )
    );
  };

  // Calculer le nombre total de chambres assignées à chaque employé
  const getTotalRoomsAssigned = (employeeName) => {
    return rooms.filter((room) => room.assignedTo === employeeName).length;
  };

  // Calculer le nombre de chambres "Recouche" pour chaque employé (y compris DND/Refus)
  const getRecoucheCount = (employeeName) => {
    return rooms.filter(
      (room) => room.assignedTo === employeeName && room.state === "Recouche"
    ).length;
  };

  // Calculer le nombre de chambres "DND" et "Refus" pour chaque employé (sous-catégorie de Recouche)
  const getDNDCount = (employeeName) => {
    return rooms.filter(
      (room) =>
        room.assignedTo === employeeName &&
        room.state === "Recouche" &&
        (room.notes?.includes("DND") || room.notes?.includes("Refus"))
    ).length;
  };

  // Calculer le nombre total de chambres "Recouche" faites (non DND/Refus) pour chaque employé
  const getEffectiveRecoucheCount = (employeeName) => {
    return getRecoucheCount(employeeName) - getDNDCount(employeeName);
  };

  // Calculer le nombre total de chambres dans chaque état pour chaque employé
  const getRoomCountByState = (employeeName, state) => {
    return rooms.filter(
      (room) => room.assignedTo === employeeName && room.state === state
    ).length;
  };

  return (
    <motion.div
      className="segment bg-white shadow-lg rounded-lg p-4 border-t-4 border-indigo-500"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-xl font-bold mb-2 text-indigo-600 text-shadow">
        Assignation manuelle
      </h2>

      {/* Bouton pour activer l'assignation manuelle */}
      <button
        className={`mb-2 p-1 rounded ${
          manualAssignmentActive
            ? "bg-red-500 text-white"
            : "bg-blue-500 text-white"
        } hover:bg-opacity-80 transition-all duration-200`}
        onClick={toggleManualAssignment}
      >
        {manualAssignmentActive
          ? "Désactiver l'assignation"
          : "Activer l'assignation"}
      </button>

      {/* Sélection de l'employé */}
      {manualAssignmentActive && (
        <motion.div
          className="mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <label className="block mb-1 font-semibold text-gray-700 text-shadow">
            Sélectionnez un employé :
          </label>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="w-full p-1 border rounded focus:outline-none focus:ring focus:border-indigo-500 transition-all duration-200"
          >
            <option value="">Choisissez un employé</option>
            {staff.map((staffMember) => (
              <option key={staffMember.name} value={staffMember.name}>
                {staffMember.name}
              </option>
            ))}
          </select>
        </motion.div>
      )}

      {/* Liste des chambres assignées */}
      <div className="space-y-2">
        {staff.map((staffMember) => (
          <motion.div
            key={staffMember.name}
            className="flex flex-col"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="font-bold text-sm mb-1 text-indigo-700 text-shadow">
              {staffMember.name} -{" "}
              <span className="text-indigo-900">
                Chambres: {getTotalRoomsAssigned(staffMember.name)}
              </span>{" "}
              <span className="text-gray-600">
                (Libre: {getRoomCountByState(staffMember.name, "Libre")},{" "}
                <span className="text-pink-500">
                  Départ: {getRoomCountByState(staffMember.name, "Départ")}
                </span>
                ,{" "}
                <span className="text-green-500">
                  Recouche: {getEffectiveRecoucheCount(staffMember.name)}{" "}
                  <span className="text-red-500">
                    (DND/Refus: {getDNDCount(staffMember.name)})
                  </span>
                </span>
                )
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
              {rooms
                .filter((room) => room.assignedTo === staffMember.name)
                .map((room) => (
                  <motion.div
                    key={room.number}
                    className={`p-1 border rounded ${
                      room.state === "Départ"
                        ? "bg-pink-100"
                        : room.state === "Recouche"
                        ? "bg-green-100"
                        : "bg-white"
                    } ${
                      room.checked ? "border-2 border-blue-500" : ""
                    } hover:shadow-md transition-shadow duration-200`}
                    onClick={() => handleRoomClick(room.number)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="font-semibold text-xs text-shadow">
                      {room.number}
                    </div>
                    {room.state === "Recouche" && room.star && (
                      <span className="text-yellow-500 text-shadow">★</span>
                    )}
                    <div className="text-xs mt-1 text-shadow">
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
                      <div className="text-xs text-blue-500 mt-1 text-shadow">
                        Contrôlée
                      </div>
                    )}
                    {/* Ajouter un champ pour les notes des objets oubliés ou autres */}
                    <textarea
                      className="w-full p-1 mt-1 text-xs border rounded resize-none focus:outline-none focus:ring focus:border-indigo-500"
                      placeholder="Notes (objets oubliés, problèmes, etc.)"
                      value={room.customNotes || ""}
                      onChange={(e) =>
                        handleNotesChange(room.number, e.target.value)
                      }
                      rows={2}
                    ></textarea>
                    {/* Afficher un champ pour l'heure de départ tardif si applicable */}
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
                          />
                        </div>
                      )}
                    {/* Bouton pour désassigner la chambre */}
                    <button
                      className="mt-1 p-1 bg-red-400 text-white text-xs rounded hover:bg-red-500 transition-colors duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnassign(room.number);
                      }}
                    >
                      Désassigner
                    </button>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Option pour réassigner si une chambre est désassignée */}
      {reassignMode && selectedRoom && (
        <motion.div
          className="mt-2 p-2 bg-yellow-100 rounded-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-sm font-semibold text-yellow-600">
            Réassigner la chambre {selectedRoom}
          </h3>
          <label className="block mb-1 font-semibold text-gray-700">
            Choisissez un employé pour réassigner :
          </label>
          <select
            value={reassignEmployee}
            onChange={(e) => setReassignEmployee(e.target.value)}
            className="w-full p-1 border rounded focus:outline-none focus:ring focus:border-indigo-500 transition-all duration-200"
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
            className="mt-1 p-1 bg-green-500 text-white rounded hover:bg-green-600 transition-all duration-200"
            onClick={() => handleReassign(selectedRoom)}
          >
            Réassigner à {reassignEmployee}
          </button>
          <button
            className="mt-1 ml-1 p-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-all duration-200"
            onClick={() => {
              setReassignMode(false);
              setSelectedRoom(null);
              setReassignEmployee("Marie"); // Réinitialiser à Marie par défaut
            }}
          >
            Annuler
          </button>
        </motion.div>
      )}
    </motion.div>
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
      customNotes: PropTypes.string, // Ajout des notes personnalisées
      lateDepartureTime: PropTypes.string, // Ajout pour l'heure de départ tardif
    })
  ).isRequired,
  assignRoom: PropTypes.func.isRequired,
  unassignRoom: PropTypes.func.isRequired,
  manualAssignmentActive: PropTypes.bool.isRequired,
  setManualAssignmentActive: PropTypes.func.isRequired,
  selectedEmployee: PropTypes.string.isRequired,
  setSelectedEmployee: PropTypes.func.isRequired,
  setRooms: PropTypes.func.isRequired, // Assurez-vous que setRooms est passé comme prop
};
