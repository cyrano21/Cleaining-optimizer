'use client'

import { useState, useEffect } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import AuthDiagnostic from '@/components/auth/auth-diagnostic'
import QuickAuthTest from '@/components/auth/quick-auth-test'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const checkSession = async () => {
      const session = await getSession()
      if (session) {
        router.push('/dashboard')
      }
    }
    checkSession()
  }, [router])

  const quickLogin = (role: string) => {
    const credentials = {
      admin: { email: 'admin@ecomus.com', password: 'admin123' },
      vendor: { email: 'vendor1@ecomus.com', password: 'vendor123' },
      client: { email: 'client@ecomus.com', password: 'client123' }
    }
    
    const cred = credentials[role as keyof typeof credentials]
    setEmail(cred.email)
    setPassword(cred.password)
    
    // Auto-submit après un court délai
    setTimeout(() => {
      handleSubmit({ preventDefault: () => {} } as any)
    }, 500)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    console.log('🔐 Tentative de connexion pour:', email)

    try {
      // Utilisation de signIn avec credentials (méthode recommandée)
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/'
      })
      
      console.log('🔐 Résultat signIn:', result ? 'Réponse reçue' : 'Pas de réponse')

      if (result?.error) {
        console.error('❌ Erreur de connexion:', result.error)
        
        // Gestion spécifique des différents types d'erreurs
        if (result.error === "CredentialsSignin") {
          console.log('🔍 Détail: Problème avec les identifiants de connexion')
          setError('Identifiants invalides. Vérifiez votre email et mot de passe.')
          
          // Tentative de diagnostic supplémentaire
          try {
            fetch('/api/auth/test') // Utilisation d'un chemin relatif
              .then(res => res.json())
              .then(data => {
                console.log('🔍 Diagnostic d\'authentification:', data.success ? 'API fonctionnelle' : 'Problème API')
                
                if (!data.success) {
                  setError('Problème de connexion au serveur d\'authentification. Veuillez réessayer.')
                }
                
                if (data.database?.connected === false) {
                  setError('Problème de connexion à la base de données. Veuillez contacter l\'administrateur.')
                }
              })
              .catch(err => {
                console.error('🔍 Erreur de diagnostic:', err)
              })
          } catch (diagError) {
            console.error('🔍 Erreur lors du diagnostic:', diagError)
          }
        } else if (result.error && result.error.includes('ECONNREFUSED')) {
          setError('Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet.')
        } else {
          setError('Échec de la connexion: ' + result.error)
        }
      } else if (result?.ok) {
        console.log('✅ Connexion réussie, redirection...')
        // Force la redirection vers la page d'accueil
        window.location.href = '/'
      }
    } catch (error) {
      console.error('❌ Erreur inattendue:', error)
      setError('Une erreur est survenue lors de la connexion')
    } finally {
      setLoading(false)
    }
    
    // Ajout d'un diagnostic à la console pour aider au débogage
    console.log('📊 État final après tentative de connexion:', { 
      email, loading, error: !!error 
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard2 Login</h1>
          <p className="text-gray-600">Accédez au tableau de bord avancé</p>
        </div>

        {/* Connexions rapides */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-3">🚀 Connexion rapide :</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => quickLogin('admin')}
              className="px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
              disabled={loading}
            >
              👑 Admin
            </button>
            <button
              type="button"
              onClick={() => quickLogin('vendor')}
              className="px-3 py-2 text-xs font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
              disabled={loading}
            >
              🏪 Vendeur
            </button>
            <button
              type="button"
              onClick={() => quickLogin('client')}
              className="px-3 py-2 text-xs font-medium text-purple-600 bg-purple-50 rounded-md hover:bg-purple-100 transition-colors"
              disabled={loading}
            >
              👤 Client
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium py-2 px-4 rounded-md hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connexion...
              </span>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        {/* Lien vers Ecomus */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Accéder à{' '}
            <a
              href={`${process.env.NEXT_PUBLIC_ECOMMERCE_URL || 'http://localhost:3000'}/auth/signin`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Ecomus Principal
            </a>
          </p>
        </div>
      </div>
      
      {/* Test rapide d'authentification */}
      <QuickAuthTest />
      
      {/* Diagnostic d'authentification pour le debug */}
      <AuthDiagnostic />
    </div>
  )
}
