// components/QualityAssurance.js
import React, { useState, useEffect } from "react";

export default function QualityAssurance({ 
  rooms, 
  staffList, 
  onQualityUpdate 
}) {
  const [qualityChecks, setQualityChecks] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [checklistItems, setChecklistItems] = useState([
    { id: 1, name: "Lit fait correctement", checked: false, critical: true },
    { id: 2, name: "Salle de bain nettoyée", checked: false, critical: true },
    { id: 3, name: "Sols aspirés/lavés", checked: false, critical: true },
    { id: 4, name: "Poubelles vidées", checked: false, critical: false },
    { id: 5, name: "Produits d'accueil renouvelés", checked: false, critical: false },
    { id: 6, name: "Fenêtres ouvertes/aérées", checked: false, critical: false },
    { id: 7, name: "Éclairage fonctionnel", checked: false, critical: true },
    { id: 8, name: "Température réglée", checked: false, critical: false },
    { id: 9, name: "Objets oubliés récupérés", checked: false, critical: true },
    { id: 10, name: "État général satisfaisant", checked: false, critical: true }
  ]);
  const [qualityScore, setQualityScore] = useState(0);
  const [notes, setNotes] = useState("");
  const [inspector, setInspector] = useState("");
  const [qualityReports, setQualityReports] = useState([]);

  useEffect(() => {
    // Charger les rapports de qualité sauvegardés
    const savedReports = localStorage.getItem("qualityReports");
    if (savedReports) {
      setQualityReports(JSON.parse(savedReports));
    }
  }, []);

  useEffect(() => {
    // Calculer le score de qualité
    const totalItems = checklistItems.length;
    const checkedItems = checklistItems.filter(item => item.checked).length;
    const criticalItems = checklistItems.filter(item => item.critical).length;
    const checkedCriticalItems = checklistItems.filter(item => item.critical && item.checked).length;
    
    // Score basé sur : 70% items critiques + 30% items total
    const criticalScore = (checkedCriticalItems / criticalItems) * 70;
    const totalScore = (checkedItems / totalItems) * 30;
    const finalScore = Math.round(criticalScore + totalScore);
    
    setQualityScore(finalScore);
  }, [checklistItems]);

  const handleChecklistChange = (itemId, checked) => {
    setChecklistItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, checked } : item
      )
    );
  };

  const resetChecklist = () => {
    setChecklistItems(prev => 
      prev.map(item => ({ ...item, checked: false }))
    );
    setNotes("");
    setQualityScore(0);
  };

  const submitQualityCheck = () => {
    if (!selectedRoom || !inspector) {
      alert("Veuillez sélectionner une chambre et indiquer l'inspecteur");
      return;
    }

    const qualityReport = {
      id: Date.now(),
      roomNumber: selectedRoom,
      inspector: inspector,
      timestamp: new Date().toLocaleString("fr-FR"),
      score: qualityScore,
      checklist: [...checklistItems],
      notes: notes,
      status: qualityScore >= 85 ? "excellent" : qualityScore >= 70 ? "good" : qualityScore >= 50 ? "average" : "poor"
    };

    const updatedReports = [qualityReport, ...qualityReports.slice(0, 49)]; // Garder max 50 rapports
    setQualityReports(updatedReports);
    localStorage.setItem("qualityReports", JSON.stringify(updatedReports));

    // Mettre à jour la chambre avec le score de qualité
    if (onQualityUpdate) {
      onQualityUpdate(selectedRoom, {
        qualityScore: qualityScore,
        lastInspection: new Date().toISOString(),
        inspector: inspector
      });
    }

    // Reset du formulaire
    resetChecklist();
    setSelectedRoom("");
    setInspector("");
    
    alert(`Contrôle qualité enregistré ! Score: ${qualityScore}%`);
  };

  const getScoreColor = (score) => {
    if (score >= 85) return "text-green-600 bg-green-100";
    if (score >= 70) return "text-blue-600 bg-blue-100";
    if (score >= 50) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getScoreEmoji = (score) => {
    if (score >= 85) return "🏆";
    if (score >= 70) return "✅";
    if (score >= 50) return "⚠️";
    return "❌";
  };

  const getQualityStats = () => {
    const recentReports = qualityReports.slice(0, 20);
    const averageScore = recentReports.length > 0 
      ? Math.round(recentReports.reduce((sum, report) => sum + report.score, 0) / recentReports.length)
      : 0;
    
    const excellentCount = recentReports.filter(r => r.status === "excellent").length;
    const goodCount = recentReports.filter(r => r.status === "good").length;
    const averageCount = recentReports.filter(r => r.status === "average").length;
    const poorCount = recentReports.filter(r => r.status === "poor").length;

    return {
      averageScore,
      excellentCount,
      goodCount,
      averageCount,
      poorCount,
      totalReports: recentReports.length
    };
  };

  const stats = getQualityStats();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-indigo-600 flex items-center">
          🛡️ Garantie Qualité
        </h2>
        <div className={`px-4 py-2 rounded-lg font-bold text-lg ${getScoreColor(qualityScore)}`}>
          {getScoreEmoji(qualityScore)} {qualityScore}%
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-indigo-50 rounded-lg">
          <div className="text-xl font-bold text-indigo-600">{stats.averageScore}%</div>
          <div className="text-sm text-indigo-700">Score moyen</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-xl font-bold text-green-600">{stats.excellentCount}</div>
          <div className="text-sm text-green-700">Excellent (85%+)</div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-xl font-bold text-blue-600">{stats.goodCount}</div>
          <div className="text-sm text-blue-700">Bon (70-84%)</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-xl font-bold text-red-600">{stats.poorCount}</div>
          <div className="text-sm text-red-700">À améliorer (&lt;70%)</div>
        </div>
      </div>

      {/* Formulaire de contrôle */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section gauche - Informations */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chambre à contrôler
            </label>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Sélectionner une chambre</option>
              {rooms
                .filter(room => room.cleaned)
                .map((room) => (
                <option key={room.number} value={room.number}>
                  Chambre {room.number} - {room.state} {room.assignedTo ? `(${room.assignedTo})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inspecteur
            </label>
            <select
              value={inspector}
              onChange={(e) => setInspector(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Sélectionner un inspecteur</option>
              {staffList.map((staff) => (
                <option key={staff.name} value={staff.name}>
                  {staff.name}
                </option>
              ))}
              <option value="Gouvernante">Gouvernante</option>
              <option value="Manager">Manager</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes et observations
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Détails sur les points à améliorer, félicitations, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows="4"
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={submitQualityCheck}
              disabled={!selectedRoom || !inspector}
              className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              ✅ Valider le contrôle
            </button>
            <button
              onClick={resetChecklist}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              🔄 Reset
            </button>
          </div>
        </div>

        {/* Section droite - Checklist */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            📋 Check-list qualité
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {checklistItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-center space-x-3 p-3 rounded-lg border ${
                  item.checked ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                }`}
              >
                <input
                  type="checkbox"
                  id={`check-${item.id}`}
                  checked={item.checked}
                  onChange={(e) => handleChecklistChange(item.id, e.target.checked)}
                  className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                />
                <label
                  htmlFor={`check-${item.id}`}
                  className={`flex-1 text-sm ${item.checked ? "line-through text-gray-500" : "text-gray-700"}`}
                >
                  {item.name}
                  {item.critical && (
                    <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                      Critique
                    </span>
                  )}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Historique des contrôles récents */}
      {qualityReports.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            📊 Contrôles récents
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {qualityReports.slice(0, 10).map((report) => (
              <div
                key={report.id}
                className="flex justify-between items-center p-3 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Chambre {report.roomNumber}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(report.score)}`}>
                      {getScoreEmoji(report.score)} {report.score}%
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {report.inspector} • {report.timestamp}
                  </div>
                  {report.notes && (
                    <div className="text-sm text-gray-600 mt-1 italic">
                      "{report.notes}"
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guide de notation */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">🎯 Guide de notation</h4>
        <div className="text-sm text-blue-700 grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>🏆 <strong>85-100% :</strong> Excellent - Service exemplaire</div>
          <div>✅ <strong>70-84% :</strong> Bon - Standard atteint</div>
          <div>⚠️ <strong>50-69% :</strong> Moyen - Améliorations nécessaires</div>
          <div>❌ <strong>0-49% :</strong> Insuffisant - Revoir entièrement</div>
        </div>
      </div>
    </div>
  );
}