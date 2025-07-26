'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface Address {
  _id: string
  name: string
  company?: string
  street: string
  street2?: string
  city: string
  state?: string
  postalCode: string
  country: string
  phone?: string
  isDefault: boolean
}

export default function AddressesPage() {
  const { data: session } = useSession()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    street: '',
    street2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'France',
    phone: '',
    isDefault: false
  })

  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/addresses')
      const data = await response.json()
      
      if (data.success) {
        setAddresses(data.data || [])
      } else {
        setError(data.message || 'Erreur lors du chargement des adresses')
      }
    } catch (error) {
      console.error('Erreur lors du chargement des adresses:', error)
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const url = editingAddress ? `/api/addresses/${editingAddress._id}` : '/api/addresses'
      const method = editingAddress ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        await fetchAddresses()
        setShowForm(false)
        setEditingAddress(null)
        resetForm()
      } else {
        alert(data.message || 'Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Erreur de connexion')
    }
  }

  const handleEdit = (address) => {
    setEditingAddress(address)
    setFormData(address)
    setShowForm(true)
  }

  const handleDelete = async (addressId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette adresse ?')) {
      return
    }

    try {
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        await fetchAddresses()
      } else {
        alert(data.message || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur de connexion')
    }
  }

  const setAsDefault = async (addressId) => {
    try {
      const response = await fetch(`/api/addresses/${addressId}/default`, {
        method: 'PUT'
      })
      
      const data = await response.json()
      
      if (data.success) {
        await fetchAddresses()
      } else {
        alert(data.message || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      alert('Erreur de connexion')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      company: '',
      street: '',
      street2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'France',
      phone: '',
      isDefault: false
    })
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-50">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Erreur</h4>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="h3 mb-0 fw-bold text-dark">Mes Adresses</h2>
              <p className="text-muted mb-0">Gérez vos adresses de livraison et de facturation</p>
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => {
                resetForm()
                setEditingAddress(null)
                setShowForm(true)
              }}
            >
              <i className="fas fa-plus me-2"></i>
              Nouvelle adresse
            </button>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="card-title mb-0 fw-semibold">
                  {editingAddress ? 'Modifier l\'adresse' : 'Nouvelle adresse'}
                </h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="name" className="form-label">Nom complet *</label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="company" className="form-label">Entreprise</label>
                      <input
                        type="text"
                        className="form-control"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="street" className="form-label">Adresse *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="street"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="street2" className="form-label">Complément d'adresse</label>
                    <input
                      type="text"
                      className="form-control"
                      id="street2"
                      name="street2"
                      value={formData.street2}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label htmlFor="city" className="form-label">Ville *</label>
                      <input
                        type="text"
                        className="form-control"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label htmlFor="postalCode" className="form-label">Code postal *</label>
                      <input
                        type="text"
                        className="form-control"
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label htmlFor="state" className="form-label">Région</label>
                      <input
                        type="text"
                        className="form-control"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="country" className="form-label">Pays *</label>
                      <select
                        className="form-select"
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="France">France</option>
                        <option value="Belgique">Belgique</option>
                        <option value="Suisse">Suisse</option>
                        <option value="Canada">Canada</option>
                        <option value="Luxembourg">Luxembourg</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="phone" className="form-label">Téléphone</label>
                      <input
                        type="tel"
                        className="form-control"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="isDefault"
                        name="isDefault"
                        checked={formData.isDefault}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label" htmlFor="isDefault">
                        Définir comme adresse par défaut
                      </label>
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary">
                      {editingAddress ? 'Mettre à jour' : 'Ajouter l\'adresse'}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        setShowForm(false)
                        setEditingAddress(null)
                        resetForm()
                      }}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Liste des adresses */}
      {addresses.length === 0 ? (
        <div className="text-center py-5">
          <div className="mb-4">
            <i className="fas fa-map-marker-alt fa-3x text-muted"></i>
          </div>
          <h4 className="text-muted">Aucune adresse enregistrée</h4>
          <p className="text-muted">Ajoutez une adresse pour faciliter vos commandes.</p>
        </div>
      ) : (
        <div className="row">
          {addresses.map((address) => (
            <div key={address._id} className="col-lg-6 mb-4">
              <div className={`card border-0 shadow-sm h-100 ${address.isDefault ? 'border-primary' : ''}`}>
                {address.isDefault && (
                  <div className="card-header bg-primary text-white border-0 py-2">
                    <small className="fw-semibold">
                      <i className="fas fa-star me-1"></i>
                      Adresse par défaut
                    </small>
                  </div>
                )}
                
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h6 className="fw-semibold mb-0">{address.name}</h6>
                    <div className="dropdown">
                      <button 
                        className="btn btn-sm btn-outline-secondary dropdown-toggle" 
                        type="button" 
                        data-bs-toggle="dropdown"
                      >
                        Actions
                      </button>
                      <ul className="dropdown-menu">
                        <li>
                          <button 
                            className="dropdown-item"
                            onClick={() => handleEdit(address)}
                          >
                            <i className="fas fa-edit me-2"></i>Modifier
                          </button>
                        </li>
                        {!address.isDefault && (
                          <li>
                            <button 
                              className="dropdown-item"
                              onClick={() => setAsDefault(address._id)}
                            >
                              <i className="fas fa-star me-2"></i>Définir par défaut
                            </button>
                          </li>
                        )}
                        <li><hr className="dropdown-divider" /></li>
                        <li>
                          <button 
                            className="dropdown-item text-danger"
                            onClick={() => handleDelete(address._id)}
                          >
                            <i className="fas fa-trash me-2"></i>Supprimer
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <address className="mb-0">
                    {address.company && <div className="text-muted small">{address.company}</div>}
                    <div>{address.street}</div>
                    {address.street2 && <div>{address.street2}</div>}
                    <div>{address.city} {address.postalCode}</div>
                    {address.state && <div>{address.state}</div>}
                    <div>{address.country}</div>
                    {address.phone && <div className="mt-2 text-muted small">
                      <i className="fas fa-phone me-1"></i>{address.phone}
                    </div>}
                  </address>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
