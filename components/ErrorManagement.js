import React from "react";
import PropTypes from "prop-types";

export default function ErrorManagement({
  rooms,
  reportedErrors,
  setRooms,
  setReportedErrors,
  setResolvedErrors,
}) {
  const handleResolveError = (errorIndex) => {
    const error = reportedErrors[errorIndex];

    // 1. Attribuer la chambre nettoyée par erreur à la femme de chambre qui l'a nettoyée
    setRooms((prevRooms) => {
      return prevRooms.map((room) => {
        if (room.number === error.roomNumber) {
          return { ...room, assignedTo: error.maid, checked: true };
        }
        return room;
      });
    });

    // 2. Trouver une chambre à retirer à la femme de chambre qui a fait l'erreur
    const roomToReassign = rooms.find(
      (room) =>
        room.assignedTo === error.maid && room.number !== error.roomNumber
    );

    if (roomToReassign) {
      // 3. Attribuer cette chambre à la femme de chambre originale
      const originalMaid = rooms.find(
        (room) => room.number === error.roomNumber
      )?.assignedTo;

      setRooms((prevRooms) => {
        return prevRooms.map((room) => {
          if (room.number === roomToReassign.number) {
            return { ...room, assignedTo: originalMaid };
          }
          return room;
        });
      });

      // 4. Ajouter l'erreur résolue
      const resolvedError = {
        ...error,
        reassignedRoom: roomToReassign.number,
        originalMaid: originalMaid,
      };
      setResolvedErrors((prev) => [...prev, resolvedError]);

      // 5. Supprimer l'erreur résolue des erreurs signalées
      setReportedErrors((prev) => prev.filter((_, i) => i !== errorIndex));
    } else {
      alert(
        "Impossible de résoudre l&apos;erreur : pas de chambre à réassigner."
      );
    }
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
            <button
              className="mt-2 bg-green-500 text-white p-2 rounded"
              onClick={() => handleResolveError(index)}
            >
              Résoudre l&apos;erreur
            </button>
          </div>
        ))
      )}
    </div>
  );
}

ErrorManagement.propTypes = {
  rooms: PropTypes.array.isRequired,
  reportedErrors: PropTypes.array.isRequired,
  setRooms: PropTypes.func.isRequired,
  setReportedErrors: PropTypes.func.isRequired,
  setResolvedErrors: PropTypes.func.isRequired,
};
