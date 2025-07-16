// components/ImportData.js
import React, { useState, useRef } from "react";
import PropTypes from 'prop-types';

export default function ImportData({ onImport }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [importHistory, setImportHistory] = useState([]);
  const [selectedFormat, setSelectedFormat] = useState("auto");
  const fileInputRef = useRef(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFiles = async (files) => {
    setIsProcessing(true);
    const results = [];

    for (const file of files) {
      try {
        const result = await processFile(file);
        if (result.success) {
          results.push(...result.rooms);
          
          // Ajouter à l'historique
          const historyEntry = {
            id: Date.now() + Math.random(),
            fileName: file.name,
            fileSize: (file.size / 1024).toFixed(1) + " KB",
            roomsCount: result.rooms.length,
            timestamp: new Date().toLocaleString("fr-FR"),
            format: getFileFormat(file.name),
            status: "success"
          };
          setImportHistory(prev => [historyEntry, ...prev.slice(0, 4)]);
        }
      } catch (error) {
        console.error("Erreur lors du traitement du fichier:", error);
        const historyEntry = {
          id: Date.now() + Math.random(),
          fileName: file.name,
          fileSize: (file.size / 1024).toFixed(1) + " KB",
          roomsCount: 0,
          timestamp: new Date().toLocaleString("fr-FR"),
          format: getFileFormat(file.name),
          status: "error",
          error: error.message
        };
        setImportHistory(prev => [historyEntry, ...prev.slice(0, 4)]);
      }
    }

    if (results.length > 0) {
      onImport(results);
    }
    
    setIsProcessing(false);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processFile = async (file) => {
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    switch (fileExtension) {
      case 'csv':
        return await processCSV(file);
      case 'xlsx':
      case 'xls':
        return await processExcel(file);
      case 'json':
        return await processJSON(file);
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'bmp':
        return await processImage(file);
      case 'pdf':
        return await processPDF(file);
      default:
        throw new Error(`Format de fichier non supporté: ${fileExtension}`);
    }
  };

  const processCSV = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csv = e.target.result;
          const lines = csv.split('\n').filter(line => line.trim());
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          
          const rooms = [];
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            const room = {
              number: values[headers.indexOf('number') || headers.indexOf('numero') || 0] || `ROOM_${i}`,
              state: values[headers.indexOf('state') || headers.indexOf('etat') || 1] || "Libre",
              type: values[headers.indexOf('type') || 2] || "TWTW",
              notes: values[headers.indexOf('notes') || 3] || "",
              assignedTo: values[headers.indexOf('assigned') || headers.indexOf('assigne') || 4] || null,
              checked: values[headers.indexOf('checked') || 5] === 'true',
              cleaned: values[headers.indexOf('cleaned') || headers.indexOf('nettoye') || 6] === 'true',
              controlled: values[headers.indexOf('controlled') || headers.indexOf('controle') || 7] === 'true',
            };
            rooms.push(room);
          }
          
          resolve({ success: true, rooms, format: 'CSV' });
        } catch (error) {
          reject(new Error(`Erreur CSV: ${error.message}`));
        }
      };
      reader.readAsText(file);
    });
  };

  const processJSON = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target.result);
          let rooms = [];
          
          if (Array.isArray(json)) {
            rooms = json;
          } else if (json.rooms) {
            rooms = json.rooms;
          } else {
            throw new Error("Structure JSON invalide");
          }
          
          // Valider et normaliser les données
          rooms = rooms.map((room, index) => ({
            number: room.number || `ROOM_${index + 1}`,
            state: room.state || "Libre",
            type: room.type || "TWTW",
            notes: room.notes || "",
            assignedTo: room.assignedTo || null,
            checked: Boolean(room.checked),
            cleaned: Boolean(room.cleaned),
            controlled: Boolean(room.controlled),
          }));
          
          resolve({ success: true, rooms, format: 'JSON' });
        } catch (error) {
          reject(new Error(`Erreur JSON: ${error.message}`));
        }
      };
      reader.readAsText(file);
    });
  };

  const processExcel = async (file) => {
    // Pour l'instant, convertir en CSV virtuel
    return new Promise((resolve, reject) => {
      reject(new Error("Import Excel nécessite une bibliothèque spécialisée. Utilisez CSV ou JSON pour l'instant."));
    });
  };

  const processImage = async (file) => {
    try {
      // Pour l'instant, simulation d'analyse d'image
      // L'OCR sera implémenté plus tard
      const rooms = [
        {
          number: "101",
          state: "Départ",
          type: "TWTW",
          notes: "Analysé depuis image",
          assignedTo: null,
          checked: false,
          cleaned: false,
          controlled: false,
        }
      ];
      return { success: true, rooms, format: 'Image OCR' };
    } catch (error) {
      throw new Error(`Erreur d'analyse d'image: ${error.message}`);
    }
  };

  const processPDF = async (file) => {
    return new Promise((resolve, reject) => {
      reject(new Error("Import PDF sera disponible prochainement. Utilisez CSV, JSON ou images pour l'instant."));
    });
  };

  const getFileFormat = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const formats = {
      'csv': 'CSV',
      'xlsx': 'Excel',
      'xls': 'Excel',
      'json': 'JSON',
      'jpg': 'Image',
      'jpeg': 'Image',
      'png': 'Image',
      'pdf': 'PDF'
    };
    return formats[ext] || ext.toUpperCase();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4 text-indigo-600">
        Importation et analyse des données
      </h2>

      {/* Sélecteur de format */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Format d'importation
        </label>
        <select
          value={selectedFormat}
          onChange={(e) => setSelectedFormat(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="auto">🤖 Détection automatique</option>
          <option value="csv">📊 CSV (Fichier texte)</option>
          <option value="json">📋 JSON (Données structurées)</option>
          <option value="image">🖼️ Image (OCR + Analyse couleur)</option>
          <option value="excel">📈 Excel (Prochainement)</option>
          <option value="pdf">📄 PDF (Prochainement)</option>
        </select>
      </div>

      {/* Zone de drop */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          dragActive
            ? "border-indigo-500 bg-indigo-50"
            : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"
        } ${isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!isProcessing ? handleFileSelect : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".csv,.json,.xlsx,.xls,.jpg,.jpeg,.png,.pdf"
          onChange={handleFileChange}
          className="hidden"
          disabled={isProcessing}
        />

        {isProcessing ? (
          <div className="space-y-4">
            <div className="animate-spin mx-auto w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
            <p className="text-lg font-semibold text-indigo-600">
              Traitement en cours...
            </p>
            <p className="text-sm text-gray-500">
              Analyse et importation des données
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 text-indigo-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-700">
                Glissez vos fichiers ici ou cliquez pour sélectionner
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Formats supportés : CSV, JSON, Excel, Images (JPG, PNG), PDF
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Plusieurs fichiers acceptés • Max 10MB par fichier
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Boutons d'action */}
      <div className="flex space-x-3 mt-4">
        <button
          onClick={handleFileSelect}
          disabled={isProcessing}
          className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span>Choisir un fichier</span>
        </button>
        
        <button
          onClick={() => {/* Scanner implementation */}}
          disabled={isProcessing}
          className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Scanner</span>
        </button>
      </div>

      {/* Historique des imports */}
      {importHistory.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-700 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Historique des imports récents
          </h3>
          <div className="space-y-2">
            {importHistory.map((entry) => (
              <div
                key={entry.id}
                className={`p-3 rounded-lg border ${
                  entry.status === 'success' 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${
                        entry.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                      }`}></span>
                      <span className="font-medium text-sm">{entry.fileName}</span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">{entry.format}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {entry.timestamp} • {entry.fileSize} • {entry.roomsCount} chambres
                    </div>
                    {entry.error && (
                      <div className="text-xs text-red-600 mt-1">
                        ❌ {entry.error}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    {entry.status === 'success' ? (
                      <span className="text-green-600 text-xs">✅ Succès</span>
                    ) : (
                      <span className="text-red-600 text-xs">❌ Erreur</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guide d'utilisation */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">💡 Guide d'importation</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p><strong>CSV :</strong> number,state,type,notes,assigned,cleaned,controlled</p>
          <p><strong>JSON :</strong> Tableau d'objets avec les propriétés des chambres</p>
          <p><strong>Images :</strong> Photos de planning avec codes couleur (OCR automatique)</p>
          <p><strong>Excel :</strong> Bientôt disponible avec support complet</p>
        </div>
      </div>
    </div>
  );
}

ImportData.propTypes = {
  onImport: PropTypes.func.isRequired,
};