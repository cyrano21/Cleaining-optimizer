'use client'

import { useState, useEffect, Suspense } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const checkSession = async () => {
      const session = await getSession()
      if (session) {
        router.push(callbackUrl)
      }
    }
    checkSession()
  }, [router, callbackUrl])

  const quickLogin = (role) => {
    const credentials = {
      admin: { email: 'admin@ecomus.com', password: 'admin123' },
      vendor: { email: 'vendor1@ecomus.com', password: 'vendor123' },
      client: { email: 'client@ecomus.com', password: 'client123' }
    }
    
    const cred = credentials[role]
    setEmail(cred.email)
    setPassword(cred.password)
    
    // Auto-submit après un court délai
    setTimeout(() => {
      handleSubmit({ preventDefault: () => {} })
    }, 500)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Email ou mot de passe incorrect')
      } else {
        router.push(callbackUrl)
      }
    } catch (error) {
      setError('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5 col-lg-4">
            <div className="card shadow-lg border-0" style={{
              borderRadius: '20px',
              backdropFilter: 'blur(10px)',
              backgroundColor: 'rgba(255, 255, 255, 0.95)'
            }}>
              <div className="card-body p-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3" style={{
                    width: '60px',
                    height: '60px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}>
                    <i className="bi bi-person-circle text-white" style={{ fontSize: '24px' }}></i>
                  </div>
                  <h2 className="h3 fw-bold text-dark mb-2">Connexion Ecomus</h2>
                  <p className="text-muted">Accédez à votre espace personnel</p>
                </div>

                {/* Connexions rapides */}
                <div className="mb-4">
                  <p className="small text-muted mb-2">🚀 Connexion rapide :</p>
                  <div className="d-flex gap-2 mb-3">
                    <button 
                      type="button"
                      onClick={() => quickLogin('admin')}
                      className="btn btn-sm btn-outline-primary flex-fill"
                      disabled={loading}
                    >
                      👑 Admin
                    </button>
                    <button 
                      type="button"
                      onClick={() => quickLogin('vendor')}
                      className="btn btn-sm btn-outline-success flex-fill"
                      disabled={loading}
                    >
                      🏪 Vendeur
                    </button>
                    <button 
                      type="button"
                      onClick={() => quickLogin('client')}
                      className="btn btn-sm btn-outline-info flex-fill"
                      disabled={loading}
                    >
                      👤 Client
                    </button>
                  </div>
                  <div className="border-bottom mb-3"></div>
                </div>

                {/* Message d'erreur */}
                {error && (
                  <div className="alert alert-danger d-flex align-items-center mb-3" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <span>{error}</span>
                  </div>
                )}

                {/* Formulaire */}
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-semibold">
                      <i className="bi bi-envelope me-2"></i>Adresse email
                    </label>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      required
                      style={{ borderRadius: '12px' }}
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password" className="form-label fw-semibold">
                      <i className="bi bi-lock me-2"></i>Mot de passe
                    </label>
                    <div className="input-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control form-control-lg"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        style={{ borderRadius: '12px 0 0 12px' }}
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ borderRadius: '0 12px 12px 0' }}
                      >
                        <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-lg w-100 text-white fw-semibold"
                    disabled={loading}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '12px',
                      border: 'none'
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Connexion...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Se connecter
                      </>
                    )}
                  </button>
                </form>

                {/* Liens */}
                <div className="text-center mt-4">
                  <p className="mb-2">
                    <span className="text-muted">Pas encore de compte ? </span>
                    <Link href="/auth/signup" className="text-decoration-none fw-semibold">
                      S'inscrire
                    </Link>
                  </p>
                  <Link 
                    href="/" 
                    className="text-muted text-decoration-none small d-inline-flex align-items-center"
                  >
                    <i className="bi bi-arrow-left me-1"></i>
                    Retour à l'accueil
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-2 text-muted">Chargement...</p>
        </div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  )
}
