"use client";

import { signOut } from "next-auth/react";

export default function ForceLogout() {
  const handleForceLogout = async () => {
    console.log("Force logout...");
    await signOut({ 
      callbackUrl: "/auth/signin",
      redirect: true 
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold mb-6 text-red-600">🔄 Reset Session</h1>
          
          <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 rounded">
            <p className="text-yellow-800">
              <strong>Problème détecté :</strong> Votre session contient le rôle "admin" 
              mais votre profil en base de données a le rôle "super_admin".
            </p>
          </div>

          <div className="mb-6 p-4 bg-blue-100 border border-blue-400 rounded">
            <p className="text-blue-800">
              <strong>Solution :</strong> Vous devez vous déconnecter et vous reconnecter 
              pour que NextAuth récupère votre nouveau rôle depuis la base de données.
            </p>
          </div>

          <button
            onClick={handleForceLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            🚪 Se déconnecter et recharger la session
          </button>

          <div className="mt-6 text-sm text-gray-600">
            <p>Après déconnexion, reconnectez-vous et votre rôle sera mis à jour automatiquement.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
