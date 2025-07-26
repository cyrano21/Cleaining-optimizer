'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'

interface Collection {
  _id: string
  title: string
  slug: string
  description: string
  subtitle?: string
  image: string
  backgroundImage?: string
  category?: {
    _id: string
    name: string
  }
  shop?: {
    _id: string
    name: string
  }
  featured: boolean
  isActive: boolean
  sortOrder: number
  tags: string[]
  createdAt: string
  updatedAt: string
}

export default function CollectionsPage() {
  const { data: session } = useSession()
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'featured'>('all')

  useEffect(() => {
    fetchCollections()
  }, [filter])

  const fetchCollections = async () => {
    try {
      setLoading(true)
      let url = '/api/collections?admin=true'
      
      if (filter === 'active') url += '&active=true'
      if (filter === 'featured') url += '&featured=true'
      if (filter === 'inactive') url += '&active=false'
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.success) {
        setCollections(data.data || [])
      } else {
        setError(data.error || 'Erreur lors du chargement des collections')
      }
    } catch (error) {
      console.error('Erreur lors du chargement des collections:', error)
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const toggleCollectionStatus = async (collectionId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/collections/${collectionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        fetchCollections() // Recharger la liste
      } else {
        setError(data.error || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      setError('Erreur de connexion')
    }
  }

  const toggleFeaturedStatus = async (collectionId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/collections/${collectionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ featured: !currentStatus }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        fetchCollections() // Recharger la liste
      } else {
        setError(data.error || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      setError('Erreur de connexion')
    }
  }

  const deleteCollection = async (collectionId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette collection ?')) {
      return
    }

    try {
      const response = await fetch(`/api/collections/${collectionId}`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (data.success) {
        fetchCollections() // Recharger la liste
      } else {
        setError(data.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      setError('Erreur de connexion')
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span className={`badge ${isActive ? 'bg-success' : 'bg-secondary'} px-2 py-1 rounded-pill`}>
        {isActive ? 'Actif' : 'Inactif'}
      </span>
    )
  }

  const getFeaturedBadge = (featured: boolean) => {
    if (!featured) return null
    return (
      <span className="badge bg-warning text-dark px-2 py-1 rounded-pill ms-2">
        <i className="fas fa-star me-1"></i>Mis en avant
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const filteredCollections = collections.filter(collection => {
    switch (filter) {
      case 'active':
        return collection.isActive
      case 'inactive':
        return !collection.isActive
      case 'featured':
        return collection.featured
      default:
        return true
    }
  })

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-50">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="h3 mb-0 fw-bold text-dark">Gestion des Collections</h2>
              <p className="text-muted mb-0">Gérez vos collections de produits</p>
            </div>
            <div className="d-flex gap-2">
              <Link href="/dashboard/collections/new" className="btn btn-primary">
                <i className="fas fa-plus me-2"></i>Nouvelle Collection
              </Link>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError(null)}
            aria-label="Close"
          ></button>
        </div>
      )}

      {/* Filtres */}
      <div className="row mb-4">
        <div className="col">
          <div className="card border-0 shadow-sm">
            <div className="card-body py-3">
              <div className="d-flex gap-2">
                <button
                  className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('all')}
                >
                  Toutes ({collections.length})
                </button>
                <button
                  className={`btn btn-sm ${filter === 'active' ? 'btn-success' : 'btn-outline-success'}`}
                  onClick={() => setFilter('active')}
                >
                  Actives ({collections.filter(c => c.isActive).length})
                </button>
                <button
                  className={`btn btn-sm ${filter === 'inactive' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                  onClick={() => setFilter('inactive')}
                >
                  Inactives ({collections.filter(c => !c.isActive).length})
                </button>
                <button
                  className={`btn btn-sm ${filter === 'featured' ? 'btn-warning' : 'btn-outline-warning'}`}
                  onClick={() => setFilter('featured')}
                >
                  Mises en avant ({collections.filter(c => c.featured).length})
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {filteredCollections.length === 0 ? (
        <div className="text-center py-5">
          <div className="mb-4">
            <i className="fas fa-layer-group fa-3x text-muted"></i>
          </div>
          <h4 className="text-muted">Aucune collection</h4>
          <p className="text-muted">
            {filter === 'all' 
              ? 'Vous n\'avez pas encore créé de collection.' 
              : `Aucune collection ${filter === 'active' ? 'active' : filter === 'inactive' ? 'inactive' : 'mise en avant'} trouvée.`
            }
          </p>
          <Link href="/dashboard/collections/new" className="btn btn-primary">
            Créer une collection
          </Link>
        </div>
      ) : (
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="border-0 px-4 py-3 fw-semibold text-dark">Collection</th>
                        <th className="border-0 px-4 py-3 fw-semibold text-dark">Statut</th>
                        <th className="border-0 px-4 py-3 fw-semibold text-dark">Ordre</th>
                        <th className="border-0 px-4 py-3 fw-semibold text-dark">Créée le</th>
                        <th className="border-0 px-4 py-3 fw-semibold text-dark">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCollections.map((collection) => (
                        <tr key={collection._id}>
                          <td className="px-4 py-3">
                            <div className="d-flex align-items-center">
                              <div className="me-3">
                                <Image
                                  src={collection.image || '/images/placeholder.jpg'}
                                  alt={collection.title}
                                  width={60}
                                  height={60}
                                  className="rounded object-cover"
                                  style={{ objectFit: 'cover' }}
                                />
                              </div>
                              <div>
                                <div className="fw-semibold text-dark">{collection.title}</div>
                                <div className="small text-muted">{collection.subtitle}</div>
                                <div className="small text-muted mt-1">
                                  <span className="badge bg-light text-dark me-1">/{collection.slug}</span>
                                  {collection.tags.slice(0, 2).map(tag => (
                                    <span key={tag} className="badge bg-light text-dark me-1">#{tag}</span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              {getStatusBadge(collection.isActive)}
                              {getFeaturedBadge(collection.featured)}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-dark">{collection.sortOrder}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-dark">{formatDate(collection.createdAt)}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="d-flex gap-1">
                              <Link 
                                href={`/dashboard/collections/${collection._id}/edit`}
                                className="btn btn-sm btn-outline-primary"
                                title="Modifier"
                              >
                                <i className="fas fa-edit"></i>
                              </Link>
                              <button
                                className={`btn btn-sm ${collection.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                onClick={() => toggleCollectionStatus(collection._id, collection.isActive)}
                                title={collection.isActive ? 'Désactiver' : 'Activer'}
                              >
                                <i className={`fas ${collection.isActive ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                              </button>
                              <button
                                className={`btn btn-sm ${collection.featured ? 'btn-warning' : 'btn-outline-warning'}`}
                                onClick={() => toggleFeaturedStatus(collection._id, collection.featured)}
                                title={collection.featured ? 'Retirer de la mise en avant' : 'Mettre en avant'}
                              >
                                <i className="fas fa-star"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => deleteCollection(collection._id)}
                                title="Supprimer"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}