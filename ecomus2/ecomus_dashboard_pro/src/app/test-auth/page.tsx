"use client";

import { useSession } from 'next-auth/react'

export default function TestAuthPage() {
  const { data: session, status } = useSession()
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test d&apos;Authentification</h1>
      <div className="bg-white p-4 rounded shadow">
        <p><strong>Status:</strong> {status}</p>
        <p><strong>Session:</strong> {session ? 'Connecté' : 'Non connecté'}</p>
        {session && (
          <div className="mt-2">
            <p><strong>Email:</strong> {session.user?.email}</p>
            <p><strong>Nom:</strong> {session.user?.name}</p>
          </div>
        )}
      </div>
      
      <div className="mt-6 bg-gray-100 p-4 rounded">
        <h2 className="font-bold mb-2">Session complète:</h2>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>
      
      <div className="mt-6">
        <button 
          onClick={() => window.location.href = '/api/auth/signin'}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        >
          Se connecter
        </button>
        <button 
          onClick={() => window.location.href = '/api/auth/signout'}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Se déconnecter
        </button>
      </div>
    </div>
  )
}
