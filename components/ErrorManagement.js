import React from "react";
import PropTypes from "prop-types";

export default function ErrorManagement({
  rooms,
  reportedErrors,
  resolvedErrors,
  setRooms,
  setReportedErrors,
  setResolvedErrors,
  userRole,
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
        resolvedAt: new Date().toISOString(),
      };

      setResolvedErrors((prev) => [...prev, resolvedError]);
    }

    // 5. Retirer l'erreur de la liste des erreurs rapportées
    setReportedErrors((prev) =>
      prev.filter((_, index) => index !== errorIndex)
    );
  };

  // Filtrer les erreurs pertinentes pour l'utilisateur actuel
  const relevantReportedErrors = userRole === "gouvernante" 
    ? reportedErrors // La gouvernante voit toutes les erreurs
    : reportedErrors.filter(
        (error) =>
          error.maid === userRole || // Erreurs commises par l'utilisateur
          rooms.some(
            (room) =>
              room.assignedTo === userRole && room.number === error.roomNumber
          ) // Erreurs sur les chambres assignées à l'utilisateur
      );

  const relevantResolvedErrors = userRole === "gouvernante"
    ? resolvedErrors // La gouvernante voit tout l'historique
    : resolvedErrors.filter(
        (error) =>
          error.maid === userRole || // Erreurs résolues de l'utilisateur
          error.originalMaid === userRole || // Erreurs où l'utilisateur était la femme de chambre originale
          rooms.some(
            (room) =>
              room.assignedTo === userRole &&
              (room.number === error.roomNumber || room.number === error.reassignedRoom)
          ) // Erreurs impliquant les chambres de l'utilisateur
      );

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 border-t-4 border-red-500">
      <h2 className="text-2xl font-bold text-red-600 mb-4">
        Erreurs de Nettoyage
      </h2>

      {/* Section des erreurs en cours */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-red-600 mb-4">
          {userRole === "gouvernante"
            ? "Erreurs à Résoudre"
            : "Vos Erreurs en Cours"}
        </h3>
        {relevantReportedErrors.length === 0 ? (
          <p className="text-gray-700">Aucune erreur en cours.</p>
        ) : (
          relevantReportedErrors.map((error, index) => (
            <div
              key={index}
              className="p-4 mb-4 border rounded bg-red-50 border-red-500"
            >
              <p className="text-sm font-semibold text-red-800">
                Chambre {error.roomNumber} (État: {error.errorState})
              </p>
              {userRole === "gouvernante" && (
                <>
                  <p className="text-sm text-red-800">
                    Nettoyée par erreur par: {error.maid}
                  </p>
                  <button
                    className="mt-2 bg-red-600 text-white px-4 py-1 rounded text-sm hover:bg-red-700"
                    onClick={() => handleResolveError(index)}
                  >
                    Résoudre l'erreur
                  </button>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Section des erreurs résolues */}
      <div>
        <h3 className="text-xl font-semibold text-green-600 mb-4">
          {userRole === "gouvernante"
            ? "Historique des Erreurs Résolues"
            : "Historique des Erreurs"}
        </h3>
        {relevantResolvedErrors.length === 0 ? (
          <p className="text-gray-700">Aucune erreur résolue.</p>
        ) : (
          relevantResolvedErrors.map((error, index) => (
            <div
              key={index}
              className="p-4 mb-4 border rounded bg-green-50 border-green-500"
            >
              <p className="text-sm font-semibold text-green-800">
                Erreur résolue - Chambre : {error.roomNumber}
              </p>
              {userRole === "gouvernante" && (
                <>
                  <p className="text-sm text-green-800">
                    Erreur commise par : {error.maid}
                  </p>
                  <p className="text-sm text-green-800">
                    Femme de chambre originale : {error.originalMaid}
                  </p>
                </>
              )}
              <p className="text-sm text-green-800">
                Chambre réassignée : {error.reassignedRoom}
              </p>
              <p className="text-sm text-gray-600">
                Résolu le : {new Date(error.resolvedAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

ErrorManagement.propTypes = {
  rooms: PropTypes.array.isRequired,
  reportedErrors: PropTypes.array.isRequired,
  resolvedErrors: PropTypes.array.isRequired,
  setRooms: PropTypes.func.isRequired,
  setReportedErrors: PropTypes.func.isRequired,
  setResolvedErrors: PropTypes.func.isRequired,
  userRole: PropTypes.string.isRequired,
};
