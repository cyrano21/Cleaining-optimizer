"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function DebugRolesPage() {
  const { data: session, status } = useSession();
  const [rolesData, setRolesData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/roles');
      const data = await response.json();
      setRolesData(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchRoles();
    }
  }, [session]);

  if (status === 'loading') {
    return <div className="p-6">Chargement de la session...</div>;
  }

  if (!session?.user) {
    return <div className="p-6">Vous devez être connecté pour voir cette page.</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🔒 Debug - Rôles Système</h1>
      
      {loading && (
        <div className="text-center text-gray-600">Chargement des rôles...</div>
      )}

      {rolesData && (
        <div className="space-y-6">
          {/* Résumé */}
          <div className="bg-blue-100 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">📊 Résumé</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{rolesData.data?.totalRoles || 0}</div>
                <div className="text-sm text-gray-600">Total Rôles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{rolesData.data?.summary?.activeRoles || 0}</div>
                <div className="text-sm text-gray-600">Actifs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{rolesData.data?.summary?.inactiveRoles || 0}</div>
                <div className="text-sm text-gray-600">Inactifs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{rolesData.data?.summary?.totalUsers || 0}</div>
                <div className="text-sm text-gray-600">Total Utilisateurs</div>
              </div>
            </div>
          </div>

          {/* Liste des rôles */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">🎭 Rôles Disponibles</h2>
            
            {rolesData.data?.roles?.map((role: any, index: number) => (
              <div key={role._id} className="bg-white border rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {role.name === 'admin' || role.name === 'super_admin' ? '👑' : 
                       role.name === 'vendor' ? '🏪' : '👤'}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold">{role.name}</h3>
                      <p className="text-sm text-gray-600">{role.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-block px-2 py-1 rounded text-xs ${
                      role.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {role.isActive ? 'Actif' : 'Inactif'}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {role.userCount} utilisateur(s)
                    </div>
                  </div>
                </div>

                {/* Permissions */}
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Permissions ({role.permissions?.length || 0}) :
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions?.map((permission: string, idx: number) => (
                      <span 
                        key={idx}
                        className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                      >
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Utilisateurs */}
                {role.users && role.users.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Utilisateurs avec ce rôle :
                    </h4>
                    <div className="space-y-1">
                      {role.users.map((user: any, idx: number) => (
                        <div key={user._id} className="flex items-center justify-between text-sm">
                          <span className="font-medium">{user.name || 'Sans nom'}</span>
                          <span className="text-gray-600">{user.email}</span>
                        </div>
                      ))}
                      {role.userCount > role.users.length && (
                        <div className="text-xs text-gray-500 italic">
                          ... et {role.userCount - role.users.length} autre(s)
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="bg-yellow-100 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-3">⚡ Actions</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={fetchRoles}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                🔄 Actualiser
              </button>
              
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/debug/session');
                    const data = await response.json();
                    console.log('Session debug:', data);
                    alert('Données session dans la console');
                  } catch (error) {
                    console.error('Erreur:', error);
                  }
                }}
                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
              >
                🔍 Debug Session
              </button>

              <button
                onClick={() => window.location.href = '/debug-user'}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
              >
                👤 Debug Utilisateur
              </button>
            </div>
          </div>

          {/* Raw Data */}
          <details className="bg-gray-100 p-4 rounded">
            <summary className="cursor-pointer font-semibold">📋 Données Brutes</summary>
            <pre className="mt-2 text-xs overflow-auto">
              {JSON.stringify(rolesData, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
