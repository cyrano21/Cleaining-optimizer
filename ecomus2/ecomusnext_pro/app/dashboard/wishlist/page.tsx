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
}

interface WishlistItem {
  _id: string
  product: Product
}

export default function WishlistPage() {
  const { data: session } = useSession()
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/wishlist')
      const data = await response.json()
      
      if (data.success) {
        setWishlistItems(data.data || [])
      } else {
        setError(data.message || 'Erreur lors du chargement de la liste de souhaits')
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la liste de souhaits:', error)
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const removeFromWishlist = async (productId) => {
    try {
      const response = await fetch(`/api/wishlist/${productId}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      
      if (data.success) {
        setWishlistItems(items => items.filter(item => item.product._id !== productId))
      } else {
        alert('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur de connexion')
    }
  }

  const addToCart = async (productId) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId,
          quantity: 1
        })
      })
      const data = await response.json()
      
      if (data.success) {
        alert('Produit ajouté au panier !')
      } else {
        alert('Erreur lors de l\'ajout au panier')
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error)
      alert('Erreur de connexion')
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
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
      <div className="row mb-4">
        <div className="col">
          <h2 className="h3 mb-0 fw-bold text-dark">Ma Liste de Souhaits</h2>
          <p className="text-muted mb-0">
            {wishlistItems.length} produit(s) dans votre liste de souhaits
          </p>
        </div>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-5">
          <div className="mb-4">
            <i className="fas fa-heart fa-3x text-muted"></i>
          </div>
          <h4 className="text-muted">Votre liste de souhaits est vide</h4>
          <p className="text-muted">Ajoutez des produits à votre liste pour les retrouver facilement.</p>
          <Link href="/" className="btn btn-primary">
            Découvrir nos produits
          </Link>
        </div>
      ) : (
        <div className="row">
          {wishlistItems.map((item) => (
            <div key={item._id} className="col-lg-4 col-md-6 mb-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="position-relative">
                  {item.product?.images?.[0] ? (
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      width={300}
                      height={200}
                      className="card-img-top object-fit-cover"
                    />
                  ) : (
                    <div className="card-img-top bg-light d-flex align-items-center justify-content-center text-muted">
                      <i className="fas fa-image fa-2x"></i>
                    </div>
                  )}
                  
                  {/* Bouton suppression */}
                  <button
                    className="btn btn-sm btn-outline-danger position-absolute top-0 end-0 m-2 rounded-circle"
                    onClick={() => removeFromWishlist(item.product._id)}
                    title="Supprimer de la liste"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>

                <div className="card-body d-flex flex-column">
                  <h5 className="card-title fw-semibold">
                    <Link 
                      href={`/products/${item.product.slug || item.product._id}`}
                      className="text-decoration-none text-dark"
                    >
                      {item.product.name}
                    </Link>
                  </h5>
                  
                  <p className="card-text text-muted small flex-grow-1">
                    {item.product.description?.substring(0, 100)}
                    {(item.product.description?.length ?? 0) > 100 && '...'}
                  </p>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      {item.product.salePrice && item.product.salePrice < item.product.price ? (
                        <>
                          <span className="fw-bold text-danger me-2">
                            {formatPrice(item.product.salePrice)}
                          </span>
                          <span className="text-muted text-decoration-line-through small">
                            {formatPrice(item.product.price)}
                          </span>
                        </>
                      ) : (
                        <span className="fw-bold text-dark">
                          {formatPrice(item.product.price)}
                        </span>
                      )}
                    </div>
                    
                    {item.product.stock > 0 ? (
                      <span className="badge bg-success">En stock</span>
                    ) : (
                      <span className="badge bg-danger">Rupture</span>
                    )}
                  </div>

                  <div className="mt-auto">
                    <div className="d-grid gap-2">
                      <button
                        className="btn btn-primary"
                        onClick={() => addToCart(item.product._id)}
                        disabled={item.product.stock <= 0}
                      >
                        <i className="fas fa-shopping-cart me-2"></i>
                        {item.product.stock > 0 ? 'Ajouter au panier' : 'Indisponible'}
                      </button>
                      
                      <Link
                        href={`/products/${item.product.slug || item.product._id}`}
                        className="btn btn-outline-secondary"
                      >
                        Voir le produit
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Badge promotion si applicable */}
                {item.product.salePrice && item.product.salePrice < item.product.price && (
                  <div className="position-absolute top-0 start-0 m-2">
                    <span className="badge bg-danger">
                      -{Math.round(((item.product.price - item.product.salePrice) / item.product.price) * 100)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions rapides */}
      {wishlistItems.length > 0 && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <h5 className="card-title">Actions rapides</h5>
                <div className="d-flex justify-content-center gap-3 flex-wrap">
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      wishlistItems.forEach(item => {
                        if (item.product.stock > 0) {
                          addToCart(item.product._id)
                        }
                      })
                    }}
                  >
                    <i className="fas fa-shopping-cart me-2"></i>
                    Tout ajouter au panier
                  </button>
                  
                  <button 
                    className="btn btn-outline-danger"
                    onClick={() => {
                      if (confirm('Êtes-vous sûr de vouloir vider votre liste de souhaits ?')) {
                        wishlistItems.forEach(item => removeFromWishlist(item.product._id))
                      }
                    }}
                  >
                    <i className="fas fa-trash me-2"></i>
                    Vider la liste
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
