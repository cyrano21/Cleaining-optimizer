'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function TailwindTestPage() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {/* Test de cohabitation Bootstrap + CSS personnalisé */}
            <div className="card shadow-lg border-0 tw-glass-card">
              <div className="card-body p-5">
                
                {/* Header avec Bootstrap */}
                <div className="text-center mb-5">
                  <h1 className="h2 fw-bold tw-text-gradient mb-3">
                    Test Bootstrap + CSS Personnalisé
                  </h1>
                  <p className="text-muted">
                    Vérification du CSS personnalisé avec Bootstrap
                  </p>
                </div>

                <div className="row g-4">
                  {/* Bootstrap Colonne */}
                  <div className="col-md-6">
                    <div className="card border-primary">
                      <div className="card-header bg-primary text-white">
                        <h5 className="card-title mb-0">
                          <i className="bi bi-bootstrap me-2"></i>
                          Bootstrap Components
                        </h5>
                      </div>
                      <div className="card-body">
                        <button 
                          className="btn btn-primary w-100 mb-3"
                          onClick={() => setCount(count + 1)}
                        >
                          <i className="bi bi-plus-circle me-2"></i>
                          Bootstrap Button ({count})
                        </button>
                        
                        <div className="form-floating mb-3">
                          <input 
                            type="email" 
                            className="form-control" 
                            placeholder="name@example.com"
                          />
                          <label>Bootstrap Input</label>
                        </div>
                        
                        <div className="alert alert-success d-flex align-items-center">
                          <i className="bi bi-check-circle-fill me-2"></i>
                          Bootstrap Alert
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tailwind Colonne */}
                  <div className="col-md-6">
                    <div className="card border-secondary">
                      <div className="card-header tw-gradient-bg text-white">
                        <h5 className="card-title mb-0">
                          <i className="bi bi-palette me-2"></i>
                          Tailwind Utilities
                        </h5>
                      </div>
                      <div className="card-body">
                        <button 
                          className="tw-btn-modern tw-gradient-bg text-white w-100 mb-3 tw-hover-scale"
                          onClick={() => setCount(count - 1)}
                        >
                          <i className="bi bi-dash-circle me-2"></i>
                          Tailwind Button ({count})
                        </button>
                        
                        <input 
                          type="text" 
                          className="tw-input-modern mb-3" 
                          placeholder="Tailwind Input"
                        />
                        
                        <div className="tw-glass-card p-3 text-center">
                          <i className="bi bi-star-fill text-warning me-2"></i>
                          <span className="tw-text-gradient fw-semibold">
                            Tailwind Glass Card
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Animations Test */}
                <div className="mt-5">
                  <h4 className="text-center mb-4">Tests d'animations</h4>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <div className="card border-info tw-fade-in">
                        <div className="card-body text-center">
                          <i className="bi bi-magic display-6 text-info mb-2"></i>
                          <h6>Fade In</h6>
                          <small className="text-muted">Animation Tailwind</small>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-4">
                      <div className="card border-warning tw-slide-up">
                        <div className="card-body text-center">
                          <i className="bi bi-arrow-up display-6 text-warning mb-2"></i>
                          <h6>Slide Up</h6>
                          <small className="text-muted">Animation Tailwind</small>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-4">
                      <div className="card border-success tw-hover-scale">
                        <div className="card-body text-center">
                          <i className="bi bi-zoom-in display-6 text-success mb-2"></i>
                          <h6>Hover Scale</h6>
                          <small className="text-muted">Survolez-moi !</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div className="text-center mt-5">
                  <div className="d-flex gap-3 justify-content-center">
                    <Link 
                      href="/auth/signin" 
                      className="btn btn-outline-primary"
                    >
                      <i className="bi bi-box-arrow-in-right me-2"></i>
                      Page de Connexion
                    </Link>
                    
                    <Link 
                      href="/dashboard" 
                      className="tw-btn-modern tw-gradient-bg text-white text-decoration-none"
                    >
                      <i className="bi bi-speedometer2 me-2"></i>
                      Dashboard
                    </Link>
                    
                    <Link 
                      href="/" 
                      className="btn btn-outline-secondary"
                    >
                      <i className="bi bi-house me-2"></i>
                      Accueil
                    </Link>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
