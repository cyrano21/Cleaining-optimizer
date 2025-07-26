'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
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

interface Order {
  _id: string
  orderNumber?: string
  items: OrderItem[]
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  createdAt: string
}

export default function OrdersPage() {
  const { data: session } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/orders')
      const data = await response.json()
      
      if (data.success) {
        setOrders(data.data.orders || [])
      } else {
        setError(data.message || 'Erreur lors du chargement des commandes')
      }
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error)
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
      day: 'numeric'
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
          <h2 className="h3 mb-0 fw-bold text-dark">Mes Commandes</h2>
          <p className="text-muted mb-0">Consultez l'historique de vos commandes</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-5">
          <div className="mb-4">
            <i className="fas fa-shopping-cart fa-3x text-muted"></i>
          </div>
          <h4 className="text-muted">Aucune commande</h4>
          <p className="text-muted">Vous n'avez pas encore passé de commande.</p>
          <Link href="/" className="btn btn-primary">
            Commencer vos achats
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
                        <th className="border-0 px-4 py-3 fw-semibold text-dark">Commande</th>
                        <th className="border-0 px-4 py-3 fw-semibold text-dark">Date</th>
                        <th className="border-0 px-4 py-3 fw-semibold text-dark">Statut</th>
                        <th className="border-0 px-4 py-3 fw-semibold text-dark">Total</th>
                        <th className="border-0 px-4 py-3 fw-semibold text-dark">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order._id}>
                          <td className="px-4 py-3">
                            <div>
                              <div className="fw-semibold text-dark">#{order.orderNumber || order._id?.substring(0, 8)}</div>
                              <div className="small text-muted">{order.items?.length || 0} article(s)</div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-dark">{formatDate(order.createdAt)}</span>
                          </td>
                          <td className="px-4 py-3">
                            {getStatusBadge(order.status)}
                          </td>
                          <td className="px-4 py-3">
                            <span className="fw-semibold text-dark">{formatPrice(order.total)}</span>
                          </td>
                          <td className="px-4 py-3">
                            <Link 
                              href={`/dashboard/orders/${order._id}`}
                              className="btn btn-sm btn-outline-primary"
                            >
                              Voir détails
                            </Link>
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
