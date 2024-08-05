import React, { useState } from "react";
import PropTypes from "prop-types";

export default function ErrorManagement({
  rooms,
  staffList,
  reportedErrors,
  resolvedErrors,
  setRooms,
  setReportedErrors,
  setResolvedErrors,
}) {
  const [manualReassignment, setManualReassignment] = useState({});

  const handleResolveError = (errorIndex) => {
    const error = reportedErrors[errorIndex];

    // Tentative de résolution automatique
    const roomToReassign = rooms.find(
      (room) =>
        room.assignedTo === error.maid &&
        room.number !== error.roomNumber &&
        !room.checked
    );

    if (roomToReassign) {
      // Résolution automatique possible
      setRooms((prevRooms) => {
        return prevRooms.map((room) => {
          if (room.number === error.roomNumber) {
            return { ...room, assignedTo: error.maid, checked: true };
          } else if (room.number === roomToReassign.number) {
            return { ...room, assignedTo: null };
          }
          return room;
        });
      });

      // Ajouter l'erreur résolue
      const resolvedError = {
        ...error,
        reassignedRoom: roomToReassign.number,
      };
      setResolvedErrors((prev) => [...prev, resolvedError]);

      // Supprimer l'erreur résolue des erreurs signalées
      setReportedErrors((prev) => prev.filter((_, i) => i !== errorIndex));
    } else {
      // Résolution automatique impossible, demander à la gouvernante de choisir
      alert(
        "Résolution automatique impossible. Veuillez choisir manuellement une chambre à réassigner."
      );
      setManualReassignment({ ...manualReassignment, [errorIndex]: "" });
    }
  };

  const handleManualReassignment = (errorIndex, newRoomNumber) => {
    const error = reportedErrors[errorIndex];

    setRooms((prevRooms) => {
      return prevRooms.map((room) => {
        if (room.number === error.roomNumber) {
          return { ...room, assignedTo: error.maid, checked: true };
        } else if (room.number === newRoomNumber) {
          return { ...room, assignedTo: null };
        }
        return room;
      });
    });

    // Ajouter l'erreur résolue
    const resolvedError = {
      ...error,
      reassignedRoom: newRoomNumber,
    };
    setResolvedErrors((prev) => [...prev, resolvedError]);

    // Supprimer l'erreur résolue des erreurs signalées
    setReportedErrors((prev) => prev.filter((_, i) => i !== errorIndex));

    // Réinitialiser l'état de réassignation manuelle
    setManualReassignment((prev) => {
      const newState = { ...prev };
      delete newState[errorIndex];
      return newState;
    });
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 border-t-4 border-red-500">
      <h2 className="text-2xl font-bold text-red-600 mb-4">
        Erreurs de Nettoyage
      </h2>

      {reportedErrors.length === 0 ? (
        <p className="text-gray-700">Aucune erreur signalée.</p>
      ) : (
        reportedErrors.map((error, index) => (
          <div
            key={index}
            className="p-4 mb-4 border rounded bg-red-100 border-red-500"
          >
            <p className="text-sm font-semibold text-red-800">
              Chambre en Erreur : {error.roomNumber} (État: {error.errorState})
            </p>
            <p className="text-sm text-red-800">
              Nettoyée par erreur par : {error.maid}
            </p>

            {manualReassignment[index] !== undefined ? (
              <div className="mt-2">
                <select
                  value={manualReassignment[index]}
                  onChange={(e) =>
                    setManualReassignment({
                      ...manualReassignment,
                      [index]: e.target.value,
                    })
                  }
                  className="w-full p-1 border rounded mb-2"
                >
                  <option value="">
                    Sélectionner une chambre à réassigner
                  </option>
                  {rooms
                    .filter((room) => !room.checked && room.assignedTo === null)
                    .map((room) => (
                      <option key={room.number} value={room.number}>
                        {room.number}
                      </option>
                    ))}
                </select>
                <button
                  className="bg-green-500 text-white p-2 rounded w-full"
                  onClick={() =>
                    handleManualReassignment(index, manualReassignment[index])
                  }
                  disabled={!manualReassignment[index]}
                >
                  Confirmer la réassignation
                </button>
              </div>
            ) : (
              <button
                className="mt-2 bg-green-500 text-white p-2 rounded w-full"
                onClick={() => handleResolveError(index)}
              >
                Résoudre l'erreur
              </button>
            )}
          </div>
        ))
      )}

      {/* ... Affichage des erreurs résolues ... */}
    </div>
  );
}

ErrorManagement.propTypes = {
  rooms: PropTypes.array.isRequired,
  staffList: PropTypes.array.isRequired,
  reportedErrors: PropTypes.array.isRequired,
  resolvedErrors: PropTypes.array.isRequired,
  setRooms: PropTypes.func.isRequired,
  setReportedErrors: PropTypes.func.isRequired,
  setResolvedErrors: PropTypes.func.isRequired,
};
