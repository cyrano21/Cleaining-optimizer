import React, { useState } from "react";
import { optimizeRoomDistribution, balanceWorkload } from '../utils/roomDistributionAI';

const RoomDistribution = ({ rooms, setRooms, staffList }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [distributionStats, setDistributionStats] = useState(null);

  const handleAutomaticDistribution = async () => {
    setIsLoading(true);
    try {
      // Récupérer les erreurs depuis le localStorage
      const reportedErrors = JSON.parse(localStorage.getItem('reportedErrors') || '[]');
      const resolvedErrors = JSON.parse(localStorage.getItem('resolvedErrors') || '[]');

      // Obtenir la distribution optimisée
      const distribution = await optimizeRoomDistribution(
        rooms.filter(room => !room.assignedTo), // Uniquement les chambres non assignées
        staffList,
        reportedErrors,
        resolvedErrors
      );

      // Équilibrer la charge de travail
      const balancedDistribution = balanceWorkload(distribution, rooms);

      // Appliquer la distribution
      const newRooms = [...rooms];
      for (const [maidId, assignedRooms] of balancedDistribution.entries()) {
        assignedRooms.forEach(assignedRoom => {
          const roomIndex = newRooms.findIndex(r => r.number === assignedRoom.number);
          if (roomIndex !== -1) {
            newRooms[roomIndex] = {
              ...newRooms[roomIndex],
              assignedTo: maidId
            };
          }
        });
      }

      // Calculer les statistiques de distribution
      const stats = {};
      staffList.forEach(staff => {
        const assignedCount = newRooms.filter(r => r.assignedTo === staff.id).length;
        stats[staff.id] = assignedCount;
      });

      setDistributionStats(stats);
      setRooms(newRooms);
    } catch (error) {
      console.error('Erreur lors de la distribution automatique:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Distribution des Chambres</h2>
        <button
          onClick={handleAutomaticDistribution}
          disabled={isLoading}
          className={`px-4 py-2 rounded-lg ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white flex items-center space-x-2`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Distribution en cours...</span>
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <span>Distribution Automatique</span>
            </>
          )}
        </button>
      </div>

      {distributionStats && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Résumé de la distribution :</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staffList.map((staff) => (
              <div
                key={staff.id}
                className="bg-gray-50 p-4 rounded-lg border border-gray-200"
              >
                <p className="font-medium">{staff.id}</p>
                <p className="text-sm text-gray-600">
                  Chambres assignées : {distributionStats[staff.id] || 0}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomDistribution;
