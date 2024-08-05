// components/ErrorManagement.js

import React from "react";

export default function ErrorManagement({
  rooms,
  staffList,
  reportedErrors,
  handleNewAssignment,
  resolvedErrors,
}) {
  // Séparer les chambres en catégories selon leur état
  const recoucheRooms = rooms.filter((room) => room.state === "Recouche");
  const departRooms = rooms.filter((room) => room.state === "Départ");

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
              Femme de Chambre: {error.maid}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-4">
              {/* Colonne Recouche */}
              <div>
                <h3 className="text-lg font-semibold text-indigo-600 mb-2">
                  Recouche
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {/* Chambres déjà attribuées */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">
                      Attribuées
                    </h4>
                    {recoucheRooms
                      .filter((room) => room.assignedTo && !room.checked)
                      .map((room) => (
                        <div
                          key={room.number}
                          className="p-2 border rounded bg-white shadow"
                        >
                          <p className="text-sm text-gray-700">
                            {room.number} - {room.assignedTo} - {room.state}
                          </p>
                          <button
                            className="text-xs text-blue-600 mt-1"
                            onClick={() =>
                              handleNewAssignment(index, room.number)
                            }
                          >
                            Réattribuer
                          </button>
                        </div>
                      ))}
                  </div>
                  {/* Chambres non attribuées */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">
                      Non Attribuées
                    </h4>
                    {recoucheRooms
                      .filter((room) => !room.assignedTo && !room.checked)
                      .map((room) => (
                        <div
                          key={room.number}
                          className="p-2 border rounded bg-white shadow"
                        >
                          <p className="text-sm text-gray-700">
                            {room.number} - {room.state}
                          </p>
                          <button
                            className="text-xs text-blue-600 mt-1"
                            onClick={() =>
                              handleNewAssignment(index, room.number)
                            }
                          >
                            Attribuer
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Colonne Départ */}
              <div>
                <h3 className="text-lg font-semibold text-indigo-600 mb-2">
                  Départ
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {/* Chambres déjà attribuées */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">
                      Attribuées
                    </h4>
                    {departRooms
                      .filter((room) => room.assignedTo && !room.checked)
                      .map((room) => (
                        <div
                          key={room.number}
                          className="p-2 border rounded bg-white shadow"
                        >
                          <p className="text-sm text-gray-700">
                            {room.number} - {room.assignedTo} - {room.state}
                          </p>
                          <button
                            className="text-xs text-blue-600 mt-1"
                            onClick={() =>
                              handleNewAssignment(index, room.number)
                            }
                          >
                            Réattribuer
                          </button>
                        </div>
                      ))}
                  </div>
                  {/* Chambres non attribuées */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">
                      Non Attribuées
                    </h4>
                    {departRooms
                      .filter((room) => !room.assignedTo && !room.checked)
                      .map((room) => (
                        <div
                          key={room.number}
                          className="p-2 border rounded bg-white shadow"
                        >
                          <p className="text-sm text-gray-700">
                            {room.number} - {room.state}
                          </p>
                          <button
                            className="text-xs text-blue-600 mt-1"
                            onClick={() =>
                              handleNewAssignment(index, room.number)
                            }
                          >
                            Attribuer
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))
      )}

      {/* Résumé des erreurs résolues */}
      <div className="mt-8">
        <h3 className="text-lg font-bold text-green-600 mb-4">
          Résumé des Erreurs Résolues
        </h3>
        {resolvedErrors.length === 0 ? (
          <p className="text-gray-700">Aucune erreur résolue.</p>
        ) : (
          resolvedErrors.map((resolvedError, index) => (
            <div
              key={index}
              className="p-4 mb-4 border rounded bg-green-100 border-green-500"
            >
              <p className="text-sm font-semibold text-green-800">
                Chambre: {resolvedError.roomNumber} corrigée.
              </p>
              <p className="text-sm text-green-800">
                Nouvelle chambre assignée: {resolvedError.newRoomNumber}
              </p>
              <p className="text-sm text-green-800">
                Femme de Chambre: {resolvedError.maid}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
