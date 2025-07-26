'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DebugUserRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirection automatique vers le centre de debug avec l'onglet user
    router.replace('/debug-center?tab=user')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold mb-4">🔄 Redirection en cours...</h1>
          <p className="text-gray-600 mb-4">
            Cette page de debug utilisateur a été déplacée vers le nouveau <strong>Centre de Debug</strong>.
          </p>
          <p className="text-sm text-gray-500">
            Si la redirection ne fonctionne pas, <a href="/debug-center?tab=user" className="text-blue-500 underline">cliquez ici</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
