"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Filter, Eye, Download, MoreHorizontal, Edit, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { formatPrice, formatDateTime, getStatusColor } from "@/lib/utils";
import { Order, OrderItem, OrderPopulated } from "@/types";
import Link from "next/link";

// Interface for order data returned by API
interface ApiOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  products: {
    name: string;
    sku: string;
    quantity: number;
    price: number;
    image: string;
  }[];
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  shippingAddress: string;
  notes: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderPopulated[]>([]);
  const [loading, setLoading] = useState(true);  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  // États pour le modal d'édition
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderPopulated | null>(null);
  const [editFormData, setEditFormData] = useState({
    status: "",
    paymentStatus: "",
    notes: ""
  });
  
  // États pour le modal de visualisation
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<OrderPopulated | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter) params.append("status", statusFilter);
      if (paymentStatusFilter)
        params.append("paymentStatus", paymentStatusFilter);      const response = await fetch(`/api/orders?${params}`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, paymentStatusFilter]);

  // useEffect with corrected dependencies
  useEffect(() => {    fetchOrders();
  }, [fetchOrders]);

  const getOrderStatusVariant = (status: string) => {
    switch (status) {
      case "delivered":
        return "success";
      case "shipped":
        return "info";
      case "processing":
        return "warning";
      case "pending":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getPaymentStatusVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "destructive";
      case "refunded":
        return "secondary";
      default:
        return "outline";
    }
  };

  const OrderRow = ({ order }: { order: OrderPopulated }) => {
    return (
      <Card
        className="hover:shadow-md transition-shadow duration-200"

      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h3 className="font-semibold text-lg">
                  {order.id}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(order.createdAt)}
                </p>
              </div>
              <div>                <p className="font-medium">
                  {order.user.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {order.user.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Items
                </p>
                <p className="font-medium">
                  {order.items.length}
                </p>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Total
                </p>
                <p className="font-bold text-lg">
                  {formatPrice(order.total)}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Badge
                  variant={getOrderStatusVariant(order.status)}

                >
                  {order.status}
                </Badge>
                <Badge
                  variant={getPaymentStatusVariant(order.paymentStatus)}

                >
                  {order.paymentStatus}
                </Badge>
              </div>

              <div className="flex items-center gap-2">                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleViewOrder(order)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDownloadOrder(order.id)}>
                  <Download className="h-4 w-4" />
                </Button>                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleMarkAsShipped(order.id)}>
                      <Package className="mr-2 h-4 w-4" />
                      Marquer comme expédié
                    </DropdownMenuItem>                    <DropdownMenuItem onClick={() => handleEditOrder(order)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDeleteOrder(order.id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Order Items Preview */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">
                Items:
              </span>              <div className="flex flex-wrap gap-2">
                {order.items.slice(0, 3).map((item, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                  >
                    {typeof item.productId === 'object' && item.productId && 'images' in item.productId && item.productId.images?.[0] && (
                      <img 
                        src={item.productId.images[0]} 
                        alt={typeof item.productId === 'object' && 'title' in item.productId ? item.productId.title : 'Product'}
                        className="w-8 h-8 object-cover rounded"
                      />
                    )}
                    <div className="text-sm">
                      <div className="font-medium">
                        {(typeof item.productId === 'object' && item.productId && 'title' in item.productId) 
                          ? item.productId.title 
                          : 'Product'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {typeof item.productId === 'object' && item.productId && 'category' in item.productId 
                          ? (item.productId as any).category 
                          : 'Uncategorized'} • Qty: {item.quantity}
                      </div>
                    </div>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <span className="text-muted-foreground text-sm">
                    +{order.items.length - 3} more items
                  </span>
                )}
              </div>
            </div>

            {order.trackingNumber && (
              <div
                className="flex items-center gap-4 text-sm mt-2"

              >
                <span className="text-muted-foreground">
                  Tracking:
                </span>
                <span className="font-mono">
                  {order.trackingNumber}
                </span>
              </div>
            )}

            <div
              className="flex items-center gap-4 text-sm mt-2"

            >
              <span className="text-muted-foreground">
                Payment:
              </span>              <span className="capitalize">
                {order.paymentMethod ? order.paymentMethod.replace("_", " ") : "Unknown"}
              </span>
              {order.estimatedDelivery && (
                <>
                  <span
                    className="text-muted-foreground ml-4"

                  >
                    Est. Delivery:
                  </span>
                  <span>
                    {formatDateTime(order.estimatedDelivery)}
                  </span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Fonction pour télécharger une commande individuelle
  const handleDownloadOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `order-${orderId}.json`; // Extension JSON
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Facture téléchargée avec succès');
      } else {
        throw new Error('Erreur lors du téléchargement');
      }
    } catch (error) {
      toast.error('Erreur lors du téléchargement de la facture');
    }
  };

  // Fonction pour exporter toutes les commandes
  const handleExportAllOrders = async () => {
    try {
      const response = await fetch('/api/orders/export');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `orders-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Export réalisé avec succès');
      } else {
        throw new Error('Erreur lors de l\'export');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'export des commandes');
    }
  };

  // Fonction pour marquer une commande comme expédiée
  const handleMarkAsShipped = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'shipped' }),
      });
      
      if (response.ok) {
        await fetchOrders(); // Recharger les commandes
        toast.success('Commande marquée comme expédiée');
      } else {
        throw new Error('Erreur lors de la mise à jour');
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  // Fonction pour supprimer une commande
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await fetchOrders(); // Recharger les commandes
        toast.success('Commande supprimée avec succès');
      } else {
        throw new Error('Erreur lors de la suppression');
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression de la commande');
    }
  };

  // Fonction pour ouvrir le modal d'édition
  const handleEditOrder = (order: OrderPopulated) => {
    setEditingOrder(order);
    setEditFormData({
      status: order.status,
      paymentStatus: order.paymentStatus,
      notes: order.notes || ""
    });
    setEditModalOpen(true);
  };

  // Fonction pour sauvegarder les modifications
  const handleSaveEdit = async () => {
    if (!editingOrder) return;
    
    try {
      const response = await fetch(`/api/orders/${editingOrder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });
      
      if (response.ok) {
        await fetchOrders(); // Recharger les commandes
        setEditModalOpen(false);
        setEditingOrder(null);
        toast.success('Commande mise à jour avec succès');
      } else {
        throw new Error('Erreur lors de la mise à jour');
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de la commande');
    }
  };

  // Fonction pour fermer le modal
  const handleCloseEdit = () => {
    setEditModalOpen(false);
    setEditingOrder(null);
    setEditFormData({
      status: "",
      paymentStatus: "",
      notes: ""
    });
  };

  // Fonction pour ouvrir le modal de visualisation
  const handleViewOrder = (order: OrderPopulated) => {
    setViewingOrder(order);
    setViewModalOpen(true);
  };

  // Fonction pour fermer le modal de visualisation
  const handleCloseView = () => {
    setViewModalOpen(false);
    setViewingOrder(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-3xl font-bold tracking-tight"

          >
            Orders
          </h1>
          <p className="text-muted-foreground">
            Manage customer orders and fulfillment
          </p>
        </div>
        <Button onClick={handleExportAllOrders}>
          <Download className="mr-2 h-4 w-4" />
          Export Orders
        </Button>
      </div>

        {/* Stats Cards */}
        <div
          className="grid grid-cols-1 md:grid-cols-4 gap-4"

        >
          <Card>
            <CardHeader
              className="flex flex-row items-center justify-between space-y-0 pb-2"

            >
              <CardTitle className="text-sm font-medium">
                Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {orders.length}
              </div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              className="flex flex-row items-center justify-between space-y-0 pb-2"

            >
              <CardTitle className="text-sm font-medium">
                Pending Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {orders.filter((o: OrderPopulated) => o.status === "pending").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Requires attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              className="flex flex-row items-center justify-between space-y-0 pb-2"

            >
              <CardTitle className="text-sm font-medium">
                Processing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {orders.filter((o: OrderPopulated) => o.status === "processing").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Being prepared
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              className="flex flex-row items-center justify-between space-y-0 pb-2"

            >
              <CardTitle className="text-sm font-medium">
                Delivered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {orders.filter((o: OrderPopulated) => o.status === "delivered").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Successfully completed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"

                />

                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"

                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                aria-label="Filter by order status"
                title="Filter by order status"

              >
                <option value="">
                  All Status
                </option>
                <option value="pending">
                  Pending
                </option>
                <option value="processing">
                  Processing
                </option>
                <option value="shipped">
                  Shipped
                </option>
                <option value="delivered">
                  Delivered
                </option>
                <option value="cancelled">
                  Cancelled
                </option>
              </select>

              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                aria-label="Filter by payment status"
                title="Filter by payment status"

              >
                <option value="">
                  All Payments
                </option>
                <option value="paid">
                  Paid
                </option>
                <option value="pending">
                  Pending
                </option>
                <option value="failed">
                  Failed
                </option>
                <option value="refunded">
                  Refunded
                </option>
              </select>

              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        {loading ? (
          <div
            className="flex items-center justify-center h-64"

          >
            <div
              className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"

            ></div>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: OrderPopulated) => (
              <OrderRow key={order.id} order={order} />
            ))}

            {orders.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">
                    No orders found.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* View Order Details Dialog */}
        <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Détails de la commande {viewingOrder?.id}
              </DialogTitle>
              <DialogDescription>
                Informations complètes de la commande
              </DialogDescription>
            </DialogHeader>

            {viewingOrder && (
              <div className="space-y-6 py-4">
                {/* Informations générales */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Numéro de commande</Label>
                    <p className="text-sm">{viewingOrder.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Date de création</Label>
                    <p className="text-sm">{formatDateTime(viewingOrder.createdAt)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Statut</Label>
                    <Badge variant={getOrderStatusVariant(viewingOrder.status)}>
                      {viewingOrder.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Statut du paiement</Label>
                    <Badge variant={getPaymentStatusVariant(viewingOrder.paymentStatus)}>
                      {viewingOrder.paymentStatus}
                    </Badge>
                  </div>
                </div>

                {/* Informations client */}
                <div>
                  <Label className="text-lg font-semibold">Informations client</Label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 gap-2">
                      <div>
                        <span className="font-medium">Nom :</span> {viewingOrder.user?.name || 'Client anonyme'}
                      </div>
                      {viewingOrder.user?.email && (
                        <div>
                          <span className="font-medium">Email :</span> {viewingOrder.user.email}
                        </div>
                      )}
                      {viewingOrder.user?.phone && (
                        <div>
                          <span className="font-medium">Téléphone :</span> {viewingOrder.user.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Articles de la commande */}
                <div>
                  <Label className="text-lg font-semibold">Articles commandés</Label>
                  <div className="mt-2 space-y-3">
                    {viewingOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        {typeof item.productId === 'object' && item.productId && 'images' in item.productId && item.productId.images?.[0] && (
                          <img 
                            src={item.productId.images[0]} 
                            alt={typeof item.productId === 'object' && 'title' in item.productId ? item.productId.title : 'Product'}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium">
                            {(typeof item.productId === 'object' && item.productId && 'title' in item.productId) 
                              ? item.productId.title 
                              : 'Produit supprimé'}
                          </h4>                          <p className="text-sm text-gray-600">
                            {(typeof item.productId === 'object' && item.productId && 'category' in item.productId && typeof item.productId.category === 'string') 
                              ? item.productId.category 
                              : 'Non catégorisé'}
                          </p>
                          <p className="text-sm text-gray-600">
                            SKU: {(typeof item.productId === 'object' && item.productId && 'sku' in item.productId) 
                              ? item.productId.sku 
                              : 'N/A'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">Quantité: {item.quantity}</p>
                          <p className="text-sm text-gray-600">
                            Prix unitaire: {formatPrice(item.price)}
                          </p>
                          <p className="font-medium">
                            Total: {formatPrice(item.quantity * item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totaux */}
                <div>
                  <Label className="text-lg font-semibold">Résumé financier</Label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span>Sous-total:</span>
                      <span>{formatPrice(viewingOrder.total * 0.8)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxes:</span>
                      <span>{formatPrice(viewingOrder.total * 0.15)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Frais de port:</span>
                      <span>{formatPrice(viewingOrder.total * 0.05)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>{formatPrice(viewingOrder.total)}</span>
                    </div>
                  </div>
                </div>                {/* Adresse de livraison */}
                <div>
                  <Label className="text-lg font-semibold">Adresse de livraison</Label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    <p>{typeof viewingOrder.shippingAddress === 'string' 
                      ? viewingOrder.shippingAddress 
                      : 'Adresse non fournie'}</p>
                  </div>
                </div>

                {/* Notes */}
                {viewingOrder.notes && (
                  <div>
                    <Label className="text-lg font-semibold">Notes</Label>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm">{viewingOrder.notes}</p>
                    </div>
                  </div>
                )}

                {/* Méthode de paiement */}
                <div>
                  <Label className="text-lg font-semibold">Paiement</Label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    <p>Méthode: {viewingOrder.paymentMethod || 'Non spécifiée'}</p>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={handleCloseView}>
                Fermer
              </Button>
              {viewingOrder && (
                <Button onClick={() => {
                  setViewModalOpen(false);
                  handleEditOrder(viewingOrder);
                }}>
                  Modifier cette commande
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Order Dialog */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingOrder ? `Modifier la commande ${editingOrder.id}` : "Nouvelle commande"}
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Statut</Label>                  <Select
                    value={editFormData.status}
                    onValueChange={(value) => setEditFormData({ ...editFormData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="processing">En cours</SelectItem>
                      <SelectItem value="shipped">Expédié</SelectItem>
                      <SelectItem value="delivered">Livré</SelectItem>
                      <SelectItem value="cancelled">Annulé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="paymentStatus">Statut du paiement</Label>                  <Select
                    value={editFormData.paymentStatus}
                    onValueChange={(value) => setEditFormData({ ...editFormData, paymentStatus: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un statut de paiement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Payé</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="failed">Échoué</SelectItem>
                      <SelectItem value="refunded">Remboursé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Ajouter des notes pour cette commande"
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter className="flex justify-end">
              <Button variant="outline" onClick={handleCloseEdit}>
                Annuler
              </Button>
              <Button onClick={handleSaveEdit}>
                Enregistrer les modifications
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
}

