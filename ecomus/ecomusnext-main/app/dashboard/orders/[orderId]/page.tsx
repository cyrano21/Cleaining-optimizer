'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface OrderItem {
  product: {
    _id: string
    name: string
    images?: string[]
  }
  variant?: string
  quantity: number
  price: number
}

interface ShippingAddress {
  name?: string
  street: string
  city: string
  postalCode: string
  country: string
}

interface OrderDetails {
  _id: string
  orderNumber?: string
  items: OrderItem[]
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  subtotal?: number
  shipping?: number
  tax?: number
  paymentMethod?: string
  paymentStatus?: 'paid' | 'pending'
  shippingAddress?: ShippingAddress
  createdAt: string
}

export default function OrderDetailsPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.orderId) {
      fetchOrderDetails()
    }
  }, [params.orderId])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/orders/${params.orderId}`)
      const data = await response.json()
      
      if (data.success) {
        setOrder(data.data)
      } else {
        setError(data.message || 'Commande non trouvée')
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la commande:', error)
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'bg-warning text-dark', text: 'En attente' },
      processing: { class: 'bg-info text-white', text: 'En traitement' },
      shipped: { class: 'bg-primary text-white', text: 'Expédiée' },
      delivered: { class: 'bg-success text-white', text: 'Livrée' },
      cancelled: { class: 'bg-danger text-white', text: 'Annulée' }
    }
    
    const config = statusConfig[status] || { class: 'bg-secondary text-white', text: status }
    
    return (
      <span className={`badge ${config.class} px-2 py-1 rounded-pill`}>
        {config.text}
      </span>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
      <div className="container-fluid py-4">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Erreur</h4>
          <p>{error}</p>
          <Link href="/dashboard/orders" className="btn btn-outline-primary">
            Retour aux commandes
          </Link>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-warning" role="alert">
          <h4 className="alert-heading">Commande non trouvée</h4>
          <Link href="/dashboard/orders" className="btn btn-outline-primary">
            Retour aux commandes
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link href="/dashboard" className="text-decoration-none">Dashboard</Link>
              </li>
              <li className="breadcrumb-item">
                <Link href="/dashboard/orders" className="text-decoration-none">Commandes</Link>
              </li>
              <li className="breadcrumb-item active">#{order.orderNumber || order._id?.substring(0, 8)}</li>
            </ol>
          </nav>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="h3 mb-1 fw-bold text-dark">
                Commande #{order.orderNumber || order._id?.substring(0, 8)}
              </h2>
              <p className="text-muted mb-0">
                Passée le {formatDate(order.createdAt)}
              </p>
            </div>
            <div>
              {getStatusBadge(order.status)}
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Détails de la commande */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="card-title mb-0 fw-semibold">Articles commandés</h5>
            </div>
            <div className="card-body p-0">
              {order.items?.map((item, index) => (
                <div key={index} className="border-bottom p-4">
                  <div className="row align-items-center">
                    <div className="col-md-2">
                      {item.product?.images?.[0] && (
                        <img 
                          src={item.product.images[0]} 
                          alt={item.product.name}
                          className="img-fluid rounded"
                        />
                      )}
                    </div>
                    <div className="col-md-6">
                      <h6 className="mb-1 fw-semibold">{item.product?.name || 'Produit'}</h6>
                      <p className="text-muted small mb-1">
                        {item.variant && `Variante: ${item.variant}`}
                      </p>
                      <p className="text-muted small mb-0">
                        Quantité: {item.quantity}
                      </p>
                    </div>
                    <div className="col-md-2 text-center">
                      <span className="fw-semibold">{formatPrice(item.price)}</span>
                    </div>
                    <div className="col-md-2 text-end">
                      <span className="fw-bold">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          {/* Résumé */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="card-title mb-0 fw-semibold">Résumé</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span>Sous-total:</span>
                <span>{formatPrice(order.subtotal || 0)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Livraison:</span>
                <span>{formatPrice(order.shipping || 0)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>TVA:</span>
                <span>{formatPrice(order.tax || 0)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold">
                <span>Total:</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Informations de livraison */}
          {order.shippingAddress && (
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="card-title mb-0 fw-semibold">Adresse de livraison</h5>
              </div>
              <div className="card-body">
                <address className="mb-0">
                  {order.shippingAddress.name && <strong>{order.shippingAddress.name}</strong>}<br />
                  {order.shippingAddress.street}<br />
                  {order.shippingAddress.city} {order.shippingAddress.postalCode}<br />
                  {order.shippingAddress.country}
                </address>
              </div>
            </div>
          )}

          {/* Informations de paiement */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="card-title mb-0 fw-semibold">Paiement</h5>
            </div>
            <div className="card-body">
              <p className="mb-1">
                <strong>Méthode:</strong> {order.paymentMethod || 'Non spécifiée'}
              </p>
              <p className="mb-0">
                <strong>Statut:</strong> 
                <span className={`ms-1 badge ${order.paymentStatus === 'paid' ? 'bg-success' : 'bg-warning'}`}>
                  {order.paymentStatus === 'paid' ? 'Payé' : 'En attente'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
