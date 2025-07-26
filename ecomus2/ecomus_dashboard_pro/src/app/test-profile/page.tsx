'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

export default function TestProfilePage() {
  const { data: session } = useSession()
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/settings/profile')
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        setProfileData(data)
        console.log('🔍 Données de profil récupérées:', data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue')
        console.error('❌ Erreur récupération profil:', err)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchProfile()
    }
  }, [session])

  if (!session) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Test Profile API</h1>
        <p className="text-red-600">❌ Non connecté - Veuillez vous connecter d&apos;abord</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🧪 Test Profile API</h1>
      
      {/* Informations de session */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="font-semibold mb-2">📋 Session Info</h2>
        <div className="text-sm">
          <p><strong>Email:</strong> {session.user?.email}</p>
          <p><strong>Role:</strong> {session.user?.role}</p>
          <p><strong>Name:</strong> {session.user?.name || 'undefined'}</p>
        </div>
      </div>

      {/* État du chargement */}
      {loading && (
        <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
          <p>⏳ Chargement du profil...</p>
        </div>
      )}

      {/* Erreurs */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 rounded-lg">
          <h3 className="font-semibold text-red-800">❌ Erreur</h3>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Données de profil */}
      {profileData && (
        <div className="mb-6 p-4 bg-green-50 rounded-lg">
          <h2 className="font-semibold mb-2 text-green-800">✅ Données de profil récupérées</h2>
          <pre className="text-sm bg-white p-3 rounded border overflow-auto">
            {JSON.stringify(profileData, null, 2)}
          </pre>
        </div>
      )}

      {/* Bouton de test */}
      <div className="flex gap-4">
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          🔄 Recharger
        </button>
        
        <button 
          onClick={() => {
            setProfileData(null)
            setError(null)
            setLoading(true)
            window.location.reload()
          }}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          🧹 Reset
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">📝 Instructions</h3>
        <ul className="text-sm space-y-1">
          <li>• Cette page teste l&apos;API <code>/api/settings/profile</code></li>
          <li>• Elle vérifie si le champ <code>name</code> est correctement récupéré</li>
          <li>• Ouvrez la console pour voir les logs détaillés</li>
        </ul>
      </div>
    </div>
  )
}
