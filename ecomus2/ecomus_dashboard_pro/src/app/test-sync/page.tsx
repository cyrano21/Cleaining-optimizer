'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useStore } from '@/hooks/use-store'

export default function TestSyncPage() {
  const { data: session, status } = useSession()
  const { currentStore, stores, isLoading: storeLoading } = useStore()
  const [testResults, setTestResults] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Éviter les problèmes d'hydratation - toujours en premier
  useEffect(() => {
    setMounted(true)
  }, [])

  // Debug des informations de session - toujours en deuxième
  useEffect(() => {
    if (mounted && status !== 'loading') {
      console.log('🔍 Session Debug:', {
        status,
        hasSession: !!session,
        user: session?.user,
        accessToken: (session as any)?.accessToken ? 'Present' : 'Missing',
        tokenLength: (session as any)?.accessToken?.length || 0
      })
    }
  }, [session, status, mounted])

  const runSyncTests = async () => {
    console.log('🚀 Début des tests de synchronisation...')
    
    setLoading(true)
    const results: any = {}
    
    try {
      // Test 1: Dashboard2 Connectivity
      console.log('🔗 Test 1: Dashboard2 Connectivity')
      const dashboard2Response = await fetch('/api/stores', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      results.dashboard2Connectivity = {
        success: dashboard2Response.ok,
        status: dashboard2Response.status,
        message: dashboard2Response.ok ? 'API Dashboard2 accessible' : `Erreur ${dashboard2Response.status}`
      }

      // Test 2: Stores API
      if (session) {
        console.log('🏪 Test 2: Stores API')
        try {
          // Nouvelle requête pour éviter de réutiliser la réponse
          const storesResponse = await fetch('/api/stores', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          })
          
          if (storesResponse.ok) {
            const storesData = await storesResponse.json()
            const storesList = storesData?.data || [];
            results.storesAPI = {
              success: true,
              count: storesList.length,
              data: storesList,
              message: `Éléments: ${storesList.length}`
            }
          } else {
            results.storesAPI = {
              success: false,
              error: `HTTP ${storesResponse.status}`
            }
          }
        } catch (error) {
          results.storesAPI = {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }

        // Test 3: Products API
        console.log('📦 Test 3: Products API')
        try {
          const storeParam = currentStore ? `&storeId=${currentStore.id}` : '';
          const productsResponse = await fetch(`/api/products?limit=5${storeParam}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(currentStore && { 'x-selected-store': currentStore.id })
            },
          })
          
          if (productsResponse.ok) {
            const productsData = await productsResponse.json()
            const totalProducts = productsData?.data?.pagination?.totalProducts || 0
            const filteredProducts = productsData?.data?.products?.length || 0
            
            results.productsAPI = {
              success: true,
              total: totalProducts,
              filtered: filteredProducts,
              currentStore: currentStore?.name || 'Aucune',
              message: `Boutique actuelle: ${currentStore?.name || 'Aucune'}\n\nProduits (total/filtrés): ${totalProducts}/${filteredProducts}`
            }
          } else {
            results.productsAPI = {
              success: false,
              error: `HTTP ${productsResponse.status}`
            }
          }
        } catch (error) {
          results.productsAPI = {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }

        // Test 4: EcomusNext Sync
        console.log('🔄 Test 4: EcomusNext Sync')
        
        // Utiliser le proxy local pour éviter les problèmes CORS
        try {
          const ecomusSyncResponse = await fetch('/api/test-ecomus', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          })
          
          if (ecomusSyncResponse.ok) {
            const data = await ecomusSyncResponse.json()
            results.ecomusSync = {
              success: data.success,
              status: data.status,
              url: data.url,
              message: data.success ? 
                `Communication EcomusNext OK (Status: ${data.status})` : 
                'Communication échouée'
            }
          } else {
            results.ecomusSync = {
              success: false,
              status: ecomusSyncResponse.status,
              url: 'Proxy local',
              message: `Erreur proxy: HTTP ${ecomusSyncResponse.status}`
            }
          }
        } catch (error) {
          results.ecomusSync = {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch'
          }
        }

        // Test 5: Store Context
        console.log('🏬 Test 5: Store Context')
        results.storeContext = {
          success: true,
          currentStore: currentStore?.name || 'Aucune boutique sélectionnée',
          storesCount: stores.length,
          userRole: session?.user?.role || 'unknown',
          message: `Boutique actuelle: ${currentStore?.name || 'Aucune boutique sélectionnée'}\n\nRôle: ${session?.user?.role || 'unknown'}`
        }

      } else {
        results.authRequired = {
          success: false,
          message: 'Tests complets nécessitent une authentification'
        }
      }

    } catch (error) {
      console.error('❌ Test global failed:', error)
      results.globalError = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    setTestResults(results)
    setLoading(false)
  }

  const handleSignIn = () => {
    signIn('credentials', {
      callbackUrl: '/test-sync'
    })
  }

  const handleSignOut = () => {
    signOut({
      callbackUrl: '/test-sync'
    })
  }

  // Rendu conditionnel basé sur mounted state
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Initialisation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Test de Synchronisation Dashboard2 ↔ EcomusNext</h1>
          
          {/* Section Authentification */}
          <div className="mb-6 p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">🔐 Authentification</h2>
            {status === 'loading' && (
              <p className="text-gray-600">Vérification de la session...</p>
            )}
            {status === 'authenticated' && session && (
              <div className="space-y-2">
                <p className="text-green-600">✅ Connecté en tant que: {session.user?.email}</p>
                <p className="text-sm text-gray-600">Token: {(session as any)?.accessToken ? 'Présent' : 'Manquant'}</p>
                <button
                  onClick={handleSignOut}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Se déconnecter
                </button>
              </div>
            )}
            {status === 'unauthenticated' && (
              <div className="space-y-2">
                <p className="text-red-600">❌ Non connecté</p>
                <button
                  onClick={handleSignIn}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Se connecter
                </button>
              </div>
            )}
          </div>

          {/* Section Tests */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">🧪 Tests de Communication API</h2>
            <button
              onClick={runSyncTests}
              disabled={loading}
              className={`px-6 py-3 rounded-lg font-medium ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {loading ? '⏳ Tests en cours...' : '🚀 Lancer les tests'}
            </button>
          </div>

          {/* Résultats des Tests */}
          {Object.keys(testResults).length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">📊 Résultats des Tests</h2>
              
              {Object.entries(testResults).map(([testName, result]: [string, any]) => (
                <div key={testName} className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2 capitalize">{testName.replace(/([A-Z])/g, ' $1')}</h3>
                  <div className={`p-3 rounded ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    {result.success ? (
                      <div>
                        <p className="text-green-700 font-medium">✅ Succès</p>
                        {result.message && <p className="text-sm text-green-600">{result.message}</p>}
                        {result.count !== undefined && <p className="text-sm text-green-600">Éléments trouvés: {result.count}</p>}
                        {result.data && typeof result.data === 'object' && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-sm text-green-600 hover:text-green-800">
                              Voir les données
                            </summary>
                            <pre className="mt-2 text-xs bg-green-100 p-2 rounded overflow-auto max-h-32">
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p className="text-red-700 font-medium">❌ Échec</p>
                        {result.error && <p className="text-sm text-red-600">{result.error}</p>}
                        {result.message && <p className="text-sm text-red-600">{result.message}</p>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Informations de Configuration */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">⚙️ Configuration Actuelle</h3>
            <div className="text-sm space-y-1">
              <p><strong>Dashboard2 URL:</strong> {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</p>
              <p><strong>EcomusNext API:</strong> {
                typeof window !== 'undefined' && window.location.hostname.includes('github.dev') 
                  ? (process.env.NEXT_PUBLIC_ECOMUS_PRODUCTION_URL || 'https://ecomusnext-3zqygi142-louis-oliviers-projects.vercel.app/api')
                  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api')
              }</p>
              <p><strong>Environnement:</strong> {
                typeof window !== 'undefined' && window.location.hostname.includes('github.dev') 
                  ? 'GitHub Codespaces' 
                  : 'Local'
              }</p>
              <p><strong>Status Auth:</strong> {status}</p>
              <p><strong>Boutiques chargées:</strong> {stores.length}</p>
              {currentStore && (
                <p><strong>Boutique actuelle:</strong> {currentStore.name}</p>
              )}
              {session?.user && (
                <p><strong>Utilisateur:</strong> {session.user.email} ({session.user.role})</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
