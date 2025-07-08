'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface ExtendedUser {
  name?: string | null
  email?: string | null
  image?: string | null
  phone?: string
  dateOfBirth?: string
  gender?: string
  newsletter?: boolean
  notifications?: {
    orders: boolean
    promotions: boolean
    newProducts: boolean
  }
}

interface ExtendedSession {
  user: ExtendedUser
}

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    newsletter: false,
    notifications: {
      orders: true,
      promotions: false,
      newProducts: false
    }
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (session?.user) {
      const user = session.user as ExtendedUser
      setProfileData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || '',
        newsletter: user.newsletter || false,
        notifications: user.notifications || {
          orders: true,
          promotions: false,
          newProducts: false
        }
      }))
    }
  }, [session])

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Profil mis à jour avec succès')
        // Mettre à jour la session
        if (session) {
          await update({
            ...session.user,
            ...profileData
          })
        }
      } else {
        setError(data.message || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error)
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setLoading(false)
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Mot de passe mis à jour avec succès')
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        setError(data.message || 'Erreur lors de la mise à jour du mot de passe')
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error)
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.'
    )

    if (!confirmed) return

    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        alert('Votre compte a été supprimé avec succès')
        window.location.href = '/'
      } else {
        setError(data.message || 'Erreur lors de la suppression du compte')
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du compte:', error)
      setError('Erreur de connexion')
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setProfileData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleNotificationChange = (key) => {
    setProfileData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const tabs = [
    { id: 'profile', label: 'Profil', icon: 'fa-user' },
    { id: 'password', label: 'Mot de passe', icon: 'fa-lock' },
    { id: 'notifications', label: 'Notifications', icon: 'fa-bell' },
    { id: 'privacy', label: 'Confidentialité', icon: 'fa-shield-alt' }
  ]

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col">
          <h2 className="h3 mb-0 fw-bold text-dark">Paramètres du compte</h2>
          <p className="text-muted mb-0">Gérez vos informations personnelles et préférences</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError('')}
            aria-label="Fermer l'alerte d'erreur"
          ></button>
        </div>
      )}

      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {success}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setSuccess('')}
            aria-label="Fermer l'alerte de succès"
          ></button>
        </div>
      )}

      <div className="row">
        {/* Navigation des onglets */}
        <div className="col-lg-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`list-group-item list-group-item-action border-0 d-flex align-items-center ${
                      activeTab === tab.id ? 'active' : ''
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <i className={`fas ${tab.icon} me-3`}></i>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contenu des onglets */}
        <div className="col-lg-9">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              {/* Onglet Profil */}
              {activeTab === 'profile' && (
                <form onSubmit={handleProfileSubmit}>
                  <h5 className="fw-semibold mb-4">Informations personnelles</h5>
                  
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="name" className="form-label">Nom complet</label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={profileData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="email" className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="phone" className="form-label">Téléphone</label>
                      <input
                        type="tel"
                        className="form-control"
                        id="phone"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="dateOfBirth" className="form-label">Date de naissance</label>
                      <input
                        type="date"
                        className="form-control"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        value={profileData.dateOfBirth}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="gender" className="form-label">Genre</label>
                    <select
                      className="form-select"
                      id="gender"
                      name="gender"
                      value={profileData.gender}
                      onChange={handleInputChange}
                    >
                      <option value="">Non spécifié</option>
                      <option value="male">Homme</option>
                      <option value="female">Femme</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="newsletter"
                        name="newsletter"
                        checked={profileData.newsletter}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label" htmlFor="newsletter">
                        S'abonner à la newsletter
                      </label>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Mise à jour...' : 'Mettre à jour le profil'}
                  </button>
                </form>
              )}

              {/* Onglet Mot de passe */}
              {activeTab === 'password' && (
                <form onSubmit={handlePasswordSubmit}>
                  <h5 className="fw-semibold mb-4">Changer le mot de passe</h5>
                  
                  <div className="mb-3">
                    <label htmlFor="currentPassword" className="form-label">Mot de passe actuel</label>
                    <input
                      type="password"
                      className="form-control"
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label">Nouveau mot de passe</label>
                    <input
                      type="password"
                      className="form-control"
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                    <div className="form-text">Le mot de passe doit contenir au moins 6 caractères.</div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="form-label">Confirmer le nouveau mot de passe</label>
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Mise à jour...' : 'Changer le mot de passe'}
                  </button>
                </form>
              )}

              {/* Onglet Notifications */}
              {activeTab === 'notifications' && (
                <div>
                  <h5 className="fw-semibold mb-4">Préférences de notification</h5>
                  
                  <div className="mb-3">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="ordersNotif"
                        checked={profileData.notifications.orders}
                        onChange={() => handleNotificationChange('orders')}
                      />
                      <label className="form-check-label" htmlFor="ordersNotif">
                        <strong>Notifications de commandes</strong>
                        <div className="text-muted small">Recevoir des notifications sur l'état de vos commandes</div>
                      </label>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="promotionsNotif"
                        checked={profileData.notifications.promotions}
                        onChange={() => handleNotificationChange('promotions')}
                      />
                      <label className="form-check-label" htmlFor="promotionsNotif">
                        <strong>Promotions et offres</strong>
                        <div className="text-muted small">Recevoir des notifications sur les promotions exclusives</div>
                      </label>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="newProductsNotif"
                        checked={profileData.notifications.newProducts}
                        onChange={() => handleNotificationChange('newProducts')}
                      />
                      <label className="form-check-label" htmlFor="newProductsNotif">
                        <strong>Nouveaux produits</strong>
                        <div className="text-muted small">Être informé des nouveaux produits et collections</div>
                      </label>
                    </div>
                  </div>

                  <button 
                    className="btn btn-primary" 
                    onClick={handleProfileSubmit}
                    disabled={loading}
                  >
                    {loading ? 'Mise à jour...' : 'Sauvegarder les préférences'}
                  </button>
                </div>
              )}

              {/* Onglet Confidentialité */}
              {activeTab === 'privacy' && (
                <div>
                  <h5 className="fw-semibold mb-4">Confidentialité et sécurité</h5>
                  
                  <div className="alert alert-info">
                    <i className="fas fa-info-circle me-2"></i>
                    Vos données personnelles sont protégées conformément à notre politique de confidentialité.
                  </div>

                  <div className="mb-4">
                    <h6 className="fw-semibold">Données personnelles</h6>
                    <p className="text-muted">
                      Vous pouvez demander une copie de toutes vos données personnelles ou leur suppression.
                    </p>
                    <div className="d-flex gap-2">
                      <button className="btn btn-outline-primary btn-sm">
                        <i className="fas fa-download me-2"></i>
                        Télécharger mes données
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h6 className="fw-semibold">Sessions actives</h6>
                    <p className="text-muted">
                      Gérez vos sessions actives sur différents appareils.
                    </p>
                    <button className="btn btn-outline-warning btn-sm">
                      <i className="fas fa-sign-out-alt me-2"></i>
                      Déconnecter tous les appareils
                    </button>
                  </div>

                  <hr />

                  <div className="mt-4">
                    <h6 className="fw-semibold text-danger">Zone de danger</h6>
                    <p className="text-muted">
                      Une fois votre compte supprimé, toutes vos données seront définitivement effacées.
                    </p>
                    <button 
                      className="btn btn-outline-danger btn-sm"
                      onClick={handleDeleteAccount}
                    >
                      <i className="fas fa-trash me-2"></i>
                      Supprimer mon compte
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
