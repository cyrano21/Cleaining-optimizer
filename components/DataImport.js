import React, { useState } from 'react';
import { smartImport } from '../utils/smartImport';

export default function DataImport({ onImportComplete }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [importStats, setImportStats] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setImportStats(null);

    try {
      const importedData = await smartImport(file);
      
      // Calculer les statistiques d'importation
      const stats = {
        totalRooms: importedData.length,
        byState: {},
        byType: {},
        assignedRooms: 0
      };

      importedData.forEach(room => {
        // Compter par état
        stats.byState[room.state] = (stats.byState[room.state] || 0) + 1;
        
        // Compter par type
        if (room.type) {
          stats.byType[room.type] = (stats.byType[room.type] || 0) + 1;
        }
        
        // Compter les chambres assignées
        if (room.assignedTo) {
          stats.assignedRooms++;
        }
      });

      setImportStats(stats);
      onImportComplete(importedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex flex-col items-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Importation des Données</h2>
        
        <div className="w-full max-w-md">
          <label
            htmlFor="file-upload"
            className={`relative cursor-pointer rounded-lg border-2 border-dashed p-6 flex flex-col items-center space-y-2 ${
              isLoading ? 'bg-gray-50 border-gray-300' : 'border-blue-300 hover:border-blue-400'
            }`}
          >
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept=".csv,.xls,.xlsx,.xlsb,.xlsm"
              onChange={handleFileUpload}
              disabled={isLoading}
            />
            
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <svg className="animate-spin h-5 w-5 text-blue-500" viewBox="0 0 24 24">
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
                <span className="text-gray-500">Analyse en cours...</span>
              </div>
            ) : (
              <>
                <svg
                  className="h-12 w-12 text-blue-500"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m0 0v4a4 4 0 004 4h20a4 4 0 004-4V16a4 4 0 00-4-4h-4m-12 8v-8m0 0l-4 4m4-4l4 4"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-gray-600">
                  Glissez un fichier ici ou cliquez pour sélectionner
                </span>
                <span className="text-sm text-gray-500">
                  Formats supportés : CSV, Excel
                </span>
              </>
            )}
          </label>
        </div>

        {error && (
          <div className="w-full max-w-md bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {importStats && (
          <div className="w-full max-w-md bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800 mb-2">
              Importation réussie !
            </h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>Total des chambres : {importStats.totalRooms}</li>
              <li>Chambres assignées : {importStats.assignedRooms}</li>
              <li>
                États :{' '}
                {Object.entries(importStats.byState)
                  .map(([state, count]) => `${state} (${count})`)
                  .join(', ')}
              </li>
              {Object.keys(importStats.byType).length > 0 && (
                <li>
                  Types :{' '}
                  {Object.entries(importStats.byType)
                    .map(([type, count]) => `${type} (${count})`)
                    .join(', ')}
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
