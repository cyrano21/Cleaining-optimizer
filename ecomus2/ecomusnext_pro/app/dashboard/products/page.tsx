'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'

interface Product {
  _id: string
  name: string
  description?: string
  price: number
  salePrice?: number
  stock: number
  images?: string[]
  slug?: string
  category?: {
    _id: string
    name: string
  }
  collection?: {
    _id: string
    title: string
  }
  shop?: {
    _id: string
    name: string
  }
  seller?: {
    _id: string
    name: string
  }
  isActive: boolean
  featured: boolean
  createdAt: string
  updatedAt: string
}

export default function ProductsPage() {
  const { data: session } = useSession()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'featured' | 'low-stock'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [filter, searchTerm])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      let url = '/api/products?admin=true&populate=true'
      
      if (filter === 'active') url += '&active=true'
      if (filter === 'featured') url += '&featured=true'
      if (filter === 'inactive') url += '&active=false'
      if (filter === 'low-stock') url += '&lowStock=true'
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.success) {
        setProducts(data.data || [])
      } else {
        setError(data.error || 'Erreur lors du chargement des produits')
      }
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error)
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        fetchProducts() // Recharger la liste
      } else {
        setError(data.error || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      setError('Erreur de connexion')
    }
  }

  const toggleFeaturedStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ featured: !currentStatus }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        fetchProducts() // Recharger la liste
      } else {
        setError(data.error || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      setError('Erreur de connexion')
    }
  }

  const deleteProduct = async (productId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      return
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (data.success) {
        fetchProducts() // Recharger la liste
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

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <span className="badge bg-danger px-2 py-1 rounded-pill ms-2">Rupture</span>
    } else if (stock <= 10) {
      return <span className="badge bg-warning text-dark px-2 py-1 rounded-pill ms-2">Stock faible</span>
    }
    return <span className="badge bg-success px-2 py-1 rounded-pill ms-2">{stock} en stock</span>
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const filteredProducts = products.filter(product => {
    switch (filter) {
      case 'active':
        return product.isActive
      case 'inactive':
        return !product.isActive
      case 'featured':
        return product.featured
      case 'low-stock':
        return product.stock <= 10
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
              <h2 className="h3 mb-0 fw-bold text-dark">Gestion des Produits</h2>
              <p className="text-muted mb-0">Gérez votre catalogue de produits</p>
            </div>
            <div className="d-flex gap-2">
              <Link href="/dashboard/products/new" className="btn btn-primary">
                <i className="fas fa-plus me-2"></i>Nouveau Produit
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

      {/* Recherche et filtres */}
      <div className="row mb-4">
        <div className="col">
          <div className="card border-0 shadow-sm">
            <div className="card-body py-3">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="fas fa-search text-muted"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0"
                      placeholder="Rechercher un produit..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex gap-2 justify-content-md-end">
                    <button
                      className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setFilter('all')}
                    >
                      Tous ({products.length})
                    </button>
                    <button
                      className={`btn btn-sm ${filter === 'active' ? 'btn-success' : 'btn-outline-success'}`}
                      onClick={() => setFilter('active')}
                    >
                      Actifs ({products.filter(p => p.isActive).length})
                    </button>
                    <button
                      className={`btn btn-sm ${filter === 'featured' ? 'btn-warning' : 'btn-outline-warning'}`}
                      onClick={() => setFilter('featured')}
                    >
                      Mis en avant ({products.filter(p => p.featured).length})
                    </button>
                    <button
                      className={`btn btn-sm ${filter === 'low-stock' ? 'btn-danger' : 'btn-outline-danger'}`}
                      onClick={() => setFilter('low-stock')}
                    >
                      Stock faible ({products.filter(p => p.stock <= 10).length})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-5">
          <div className="mb-4">
            <i className="fas fa-box-open fa-3x text-muted"></i>
          </div>
          <h4 className="text-muted">Aucun produit</h4>
          <p className="text-muted">
            {filter === 'all' 
              ? 'Vous n\'avez pas encore créé de produit.' 
              : `Aucun produit ${filter === 'active' ? 'actif' : filter === 'featured' ? 'mis en avant' : filter === 'low-stock' ? 'en stock faible' : 'inactif'} trouvé.`
            }
          </p>
          <Link href="/dashboard/products/new" className="btn btn-primary">
            Créer un produit
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
                        <th className="border-0 px-4 py-3 fw-semibold text-dark">Produit</th>
                        <th className="border-0 px-4 py-3 fw-semibold text-dark">Prix</th>
                        <th className="border-0 px-4 py-3 fw-semibold text-dark">Stock</th>
                        <th className="border-0 px-4 py-3 fw-semibold text-dark">Statut</th>
                        <th className="border-0 px-4 py-3 fw-semibold text-dark">Créé le</th>
                        <th className="border-0 px-4 py-3 fw-semibold text-dark">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => (
                        <tr key={product._id}>
                          <td className="px-4 py-3">
                            <div className="d-flex align-items-center">
                              <div className="me-3">
                                <Image
                                  src={product.images?.[0] || '/images/placeholder.jpg'}
                                  alt={product.name}
                                  width={60}
                                  height={60}
                                  className="rounded object-cover"
                                  style={{ objectFit: 'cover' }}
                                />
                              </div>
                              <div>
                                <div className="fw-semibold text-dark">{product.name}</div>
                                <div className="small text-muted">
                                  {product.category?.name && (
                                    <span className="badge bg-light text-dark me-1">{product.category.name}</span>
                                  )}
                                  {product.collection?.title && (
                                    <span className="badge bg-info text-white me-1">{product.collection.title}</span>
                                  )}
                                </div>
                                <div className="small text-muted mt-1">
                                  <span className="badge bg-light text-dark">/{product.slug}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <div className="fw-semibold text-dark">{formatPrice(product.price)}</div>
                              {product.salePrice && product.salePrice < product.price && (
                                <div className="small text-success">
                                  Promo: {formatPrice(product.salePrice)}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {getStockBadge(product.stock)}
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              {getStatusBadge(product.isActive)}
                              {getFeaturedBadge(product.featured)}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-dark">{formatDate(product.createdAt)}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="d-flex gap-1">
                              <Link 
                                href={`/dashboard/products/${product._id}/edit`}
                                className="btn btn-sm btn-outline-primary"
                                title="Modifier"
                              >
                                <i className="fas fa-edit"></i>
                              </Link>
                              <button
                                className={`btn btn-sm ${product.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                onClick={() => toggleProductStatus(product._id, product.isActive)}
                                title={product.isActive ? 'Désactiver' : 'Activer'}
                              >
                                <i className={`fas ${product.isActive ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                              </button>
                              <button
                                className={`btn btn-sm ${product.featured ? 'btn-warning' : 'btn-outline-warning'}`}
                                onClick={() => toggleFeaturedStatus(product._id, product.featured)}
                                title={product.featured ? 'Retirer de la mise en avant' : 'Mettre en avant'}
                              >
                                <i className="fas fa-star"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => deleteProduct(product._id)}
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