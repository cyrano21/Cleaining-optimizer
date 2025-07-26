'use client'

import { useState, useEffect } from 'react'
import { signIn, getSession } from 'next-auth/react'

export default function AuthTestPage() {
  const [testResults, setTestResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    // Vérifier la session au chargement
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const currentSession = await getSession()
      setSession(currentSession)
      addResult('Session Check', currentSession ? 'Session trouvée' : 'Pas de session', 'info')
    } catch (error) {
      addResult('Session Check', `Erreur: ${error}`, 'error')
    }
  }

  const addResult = (test: string, result: string, type: 'success' | 'error' | 'info') => {
    setTestResults(prev => [...prev, {
      test,
      result,
      type,
      timestamp: new Date().toLocaleTimeString()
    }])
  }

  const testApiRoute = async (endpoint: string, data?: any) => {
    try {
      const response = await fetch(endpoint, {
        method: data ? 'POST' : 'GET',
        headers: data ? { 'Content-Type': 'application/json' } : {},
        body: data ? JSON.stringify(data) : undefined
      })

      const result = await response.json()
      addResult(
        `API ${endpoint}`,
        `Status: ${response.status} - ${JSON.stringify(result).substring(0, 100)}...`,
        response.ok ? 'success' : 'error'
      )
      return result
    } catch (error) {
      addResult(`API ${endpoint}`, `Erreur: ${error}`, 'error')
      return null
    }
  }

  const testAuthentication = async (email: string, password: string) => {
    setLoading(true)
    addResult('Test Auth', `Tentative avec ${email}`, 'info')

    try {
      // Test direct de l'API
      await testApiRoute('/api/auth/signin', { email, password })

      // Test avec NextAuth signIn
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        addResult('NextAuth signIn', `Erreur: ${result.error}`, 'error')
      } else if (result?.ok) {
        addResult('NextAuth signIn', 'Succès!', 'success')
        await checkSession() // Recharger la session
      } else {
        addResult('NextAuth signIn', 'Résultat inattendu', 'error')
      }
    } catch (error) {
      addResult('Test Auth', `Erreur: ${error}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const runDiagnostic = async () => {
    setTestResults([])
    setLoading(true)

    // Test de base de l'API
    await testApiRoute('/api/auth/test')
    
    // Test des utilisateurs
    await testApiRoute('/api/users')

    // Test avec les comptes de test
    const testAccounts = [
      { email: 'admin@ecomus.com', password: 'admin123' },
      { email: 'vendor1@ecomus.com', password: 'vendor123' },
      { email: 'client@ecomus.com', password: 'client123' }
    ]

    for (const account of testAccounts) {
      await testAuthentication(account.email, account.password)
      await new Promise(resolve => setTimeout(resolve, 1000)) // Délai entre les tests
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            🔍 Diagnostic d'Authentification
          </h1>

          {/* Session actuelle */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Session Actuelle</h2>
            <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>

          {/* Boutons de test */}
          <div className="mb-6 flex gap-4">
            <button
              onClick={runDiagnostic}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '🔄 Test en cours...' : '🚀 Lancer le diagnostic complet'}
            </button>
            
            <button
              onClick={checkSession}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              🔍 Vérifier la session
            </button>
            
            <button
              onClick={() => testApiRoute('/api/auth/test')}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              🧪 Test API Auth
            </button>
          </div>

          {/* Tests manuels */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Tests Manuels</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: '👑 Admin', email: 'admin@ecomus.com', password: 'admin123' },
                { label: '🏪 Vendeur', email: 'vendor1@ecomus.com', password: 'vendor123' },
                { label: '👤 Client', email: 'client@ecomus.com', password: 'client123' }
              ].map((account, index) => (
                <button
                  key={index}
                  onClick={() => testAuthentication(account.email, account.password)}
                  disabled={loading}
                  className="p-3 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 text-left"
                >
                  <div className="font-medium">{account.label}</div>
                  <div className="text-sm text-gray-600">{account.email}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Résultats */}
          <div>
            <h2 className="text-lg font-semibold mb-4">
              Résultats des Tests ({testResults.length})
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    result.type === 'success' ? 'bg-green-50 border-green-200' :
                    result.type === 'error' ? 'bg-red-50 border-red-200' :
                    'bg-blue-50 border-blue-200'
                  } border`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-900">{result.test}</div>
                      <div className="text-sm text-gray-600 mt-1">{result.result}</div>
                    </div>
                    <div className="text-xs text-gray-500">{result.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

