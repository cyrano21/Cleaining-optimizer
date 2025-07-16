// components/AuthenticationModal.js
import React, { useState } from "react";

export default function AuthenticationModal({ 
  isOpen, 
  onClose, 
  onLogin, 
  staffList 
}) {
  const [selectedRole, setSelectedRole] = useState("gouvernante");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleLogin = () => {
    if (selectedRole === "gouvernante") {
      onLogin({
        role: "gouvernante",
        name: "Gouvernante",
        employeeId: "GOV001",
        permissions: ["view_all", "manage_all", "quality_control", "reports"]
      });
    } else if (selectedRole === "femme_chambre") {
      if (!selectedEmployee) {
        setLoginError("Veuillez sélectionner votre nom");
        return;
      }
      
      const employee = staffList.find(staff => staff.name === selectedEmployee);
      if (!employee) {
        setLoginError("Employé non trouvé");
        return;
      }

      onLogin({
        role: "femme_chambre",
        name: selectedEmployee,
        employeeId: `EMP_${selectedEmployee.replace(/\s+/g, '_').toUpperCase()}`,
        permissions: ["view_assigned", "update_status", "add_notes"],
        employee: employee
      });
    }
  };

  const resetForm = () => {
    setSelectedRole("gouvernante");
    setSelectedEmployee("");
    setLoginError("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-96 max-w-90vw animate-scale-in">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Connexion
          </h2>
          <p className="text-gray-600">
            Identifiez-vous pour accéder au système
          </p>
        </div>

        {loginError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">❌ {loginError}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Sélection du rôle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de compte
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="role"
                  value="gouvernante"
                  checked={selectedRole === "gouvernante"}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-4 h-4 text-indigo-600"
                />
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">👩‍💼</span>
                  <div>
                    <div className="font-medium text-gray-800">Gouvernante</div>
                    <div className="text-xs text-gray-500">Accès complet à toutes les chambres</div>
                  </div>
                </div>
              </label>
              
              <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="role"
                  value="femme_chambre"
                  checked={selectedRole === "femme_chambre"}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-4 h-4 text-indigo-600"
                />
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🧹</span>
                  <div>
                    <div className="font-medium text-gray-800">Femme de chambre</div>
                    <div className="text-xs text-gray-500">Accès uniquement aux chambres assignées</div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Sélection de l'employé pour femme de chambre */}
          {selectedRole === "femme_chambre" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sélectionnez votre nom
              </label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Choisir un employé...</option>
                {staffList.map((staff) => (
                  <option key={staff.name} value={staff.name}>
                    {staff.name} ({staff.contractType} - Étage {staff.preferredFloor})
                  </option>
                ))}
              </select>
              
              {staffList.length === 0 && (
                <p className="text-sm text-yellow-600 mt-2">
                  ⚠️ Aucun employé enregistré. Connectez-vous en tant que Gouvernante pour ajouter du personnel.
                </p>
              )}
            </div>
          )}

          {/* Informations selon le rôle */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">
              {selectedRole === "gouvernante" ? "👩‍💼 Accès Gouvernante" : "🧹 Accès Femme de chambre"}
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              {selectedRole === "gouvernante" ? (
                <>
                  <li>✅ Voir toutes les chambres de l'hôtel</li>
                  <li>✅ Gérer le personnel et les assignations</li>
                  <li>✅ Contrôle qualité et rapports</li>
                  <li>✅ Statistiques complètes</li>
                </>
              ) : (
                <>
                  <li>✅ Voir uniquement vos chambres assignées</li>
                  <li>✅ Marquer les chambres comme nettoyées</li>
                  <li>✅ Ajouter des notes sur les chambres</li>
                  <li>✅ Vue simplifiée et optimisée</li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={resetForm}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleLogin}
            disabled={selectedRole === "femme_chambre" && !selectedEmployee}
            className="flex-1 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Se connecter
          </button>
        </div>

        {/* Aide */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            💡 En cas de problème, contactez votre responsable
          </p>
        </div>
      </div>
    </div>
  );
}