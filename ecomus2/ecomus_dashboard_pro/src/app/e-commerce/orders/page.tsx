"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Package,
  Truck,
  CheckCircle,
  Clock,
  Eye,
  Store,
  ArrowRight,
  Trash2,
  Plus,
  Minus,
  Heart,
  Loader2,
  AlertCircle,
} from "lucide-react";

// Interface pour les produits dans une commande
interface OrderProduct {
  name: string;
  sku: string;
  quantity: number;
  price: number;
  image: string;
}

// Interface pour les commandes depuis l'API
interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  products: OrderProduct[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  shippingAddress: string;
  notes: string;
}

// Interface pour le suivi de commande
interface TrackingEvent {
  date: string;
  time: string;
  description: string;
  location: string;
  status: "completed" | "current" | "pending";
}

// État de pagination pour l'API
interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Composant pour les détails de commande
const OrderDetails = ({ order }: { order: Order | null }) => {
  if (!order) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Sélectionnez une commande pour voir les détails
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "text-green-600 bg-green-50 border-green-200";
      case "shipped":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "processing":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "pending":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "cancelled":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "text-green-600 bg-green-50 border-green-200";
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "failed":
        return "text-red-600 bg-red-50 border-red-200";
      case "refunded":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête de la commande */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg">
                Commande #{order.orderNumber}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Créée le {new Date(order.createdAt).toLocaleDateString("fr-FR")}
              </p>
            </div>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <Badge className={`px-2 py-1 text-xs font-medium rounded-md border ${getStatusColor(order.status)}`}>
                {order.status}
              </Badge>
              <Badge className={`px-2 py-1 text-xs font-medium rounded-md border ${getPaymentStatusColor(order.paymentStatus)}`}>
                {order.paymentStatus}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-gray-900 mb-2">
                Informations client
              </h4>
              <div className="space-y-1 text-sm">
                <p className="font-medium">{order.customerName}</p>
                <p className="text-muted-foreground">{order.customerEmail}</p>
                <p className="text-muted-foreground">{order.customerPhone}</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-900 mb-2">
                Adresse de livraison
              </h4>
              <p className="text-sm text-muted-foreground">
                {order.shippingAddress}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Produits de la commande */}
      <Card>
        <CardHeader>
          <CardTitle>Produits commandés</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-center">Quantité</TableHead>
                <TableHead className="text-right">Prix unitaire</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.products.map((product, index) => (
                <TableRow key={`${order.id}-product-${index}-${product.sku}`}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 relative rounded-md overflow-hidden bg-gray-100">
                        <Image
                          src={product.image || "/images/placeholder-product.jpg"}
                          alt={product.name}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            if (target.parentElement) {
                              target.parentElement.innerHTML = `<div class="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">${product.name.substring(0, 2).toUpperCase()}</div>`;
                            }
                          }}
                        />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{product.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {product.sku}
                  </TableCell>                  <TableCell className="text-center">
                    <span className="font-medium">{product.quantity}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    €{(product.price || 0).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    €{((product.price || 0) * (product.quantity || 0)).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total de la commande</span>
              <span className="text-lg font-bold">€{(order.total || 0).toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations supplémentaires */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Détails de paiement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Méthode de paiement</span>
                <span className="font-medium">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Statut du paiement</span>
                <Badge className={`px-2 py-1 text-xs font-medium rounded-md border ${getPaymentStatusColor(order.paymentStatus)}`}>
                  {order.paymentStatus}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {order.notes || "Aucune note pour cette commande."}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Composant principal
export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });  // Chargement des commandes depuis l'API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
        });

        if (searchTerm) {
          params.append("search", searchTerm);
        }        if (statusFilter && statusFilter !== "all") {
          params.append("status", statusFilter);
        }

        const response = await fetch(`/api/orders?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
          setOrders(data.orders || []);
          setPagination(data.pagination || pagination);
        } else {
          throw new Error(data.error || "Erreur lors du chargement des commandes");
        }      } catch (err) {
        console.error("Erreur lors du chargement des commandes:", err);
        setError(err instanceof Error ? err.message : "Erreur inconnue");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

  }, [pagination.page, searchTerm, statusFilter]);

  // Gestionnaires d'événement
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "delivered":
        return "text-green-700 bg-green-100";
      case "shipped":
        return "text-blue-700 bg-blue-100";
      case "processing":
        return "text-yellow-700 bg-yellow-100";
      case "pending":
        return "text-orange-700 bg-orange-100";
      case "cancelled":
        return "text-red-700 bg-red-100";
      default:
        return "text-gray-700 bg-gray-100";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestion des commandes</h1>
          <p className="text-muted-foreground">
            Gérez toutes les commandes de votre boutique en ligne
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-4 w-4 text-blue-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total commandes
                  </p>
                  <p className="text-2xl font-bold">{pagination.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-orange-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    En attente
                  </p>
                  <p className="text-2xl font-bold">
                    {orders.filter(o => o.status === "pending").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Truck className="h-4 w-4 text-blue-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Expédiées
                  </p>
                  <p className="text-2xl font-bold">
                    {orders.filter(o => o.status === "shipped").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Livrées
                  </p>
                  <p className="text-2xl font-bold">
                    {orders.filter(o => o.status === "delivered").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres et recherche */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par numéro de commande ou nom du client..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="processing">En traitement</SelectItem>
                  <SelectItem value="shipped">Expédiée</SelectItem>
                  <SelectItem value="delivered">Livrée</SelectItem>
                  <SelectItem value="cancelled">Annulée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Liste des commandes */}
          <Card>
            <CardHeader>
              <CardTitle>Liste des commandes</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Chargement...</span>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-8 text-red-600">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span>{error}</span>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune commande trouvée
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div
                      key={`order-${order.id}`}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedOrder?.id === order.id
                          ? "border-blue-200 bg-blue-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">
                            #{order.orderNumber}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {order.customerName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(order.createdAt)}
                          </div>
                        </div>
                        <div className="text-right">                          <div className="font-bold text-sm">
                            €{(order.total || 0).toFixed(2)}
                          </div>
                          <Badge className={`text-xs px-2 py-1 ${getStatusBadgeClass(order.status)}`}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <Button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="text-sm"
                  >
                    Précédent
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {pagination.page} sur {pagination.totalPages}
                  </span>
                  <Button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNextPage}
                    className="text-sm"
                  >
                    Suivant
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Détails de la commande */}
          <div>
            <OrderDetails order={selectedOrder} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
