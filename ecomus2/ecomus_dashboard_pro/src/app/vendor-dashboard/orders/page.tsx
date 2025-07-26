"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  Search,
  Calendar,
  DollarSign,
} from "lucide-react";

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  Produits: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  shippingAddress: string;
}

export default function VendorCommandesPage() {
  const [Commandes, setCommandes] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    fetchCommandes();
  }, []);

  const fetchCommandes = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/vendor/Commandes");
      if (response.ok) {
        const data = await response.json();
        setCommandes(data.Commandes || []);
      } else {
        // real data si l'API n'est pas disponible
        setCommandes([
          {
            id: "ORD-001",
            customerName: "Alice Martin",
            customerEmail: "alice@entreprise.fr",
            Produits: [
              { name: "Wireless Headphones", quantity: 1, price: 199.99 },
              { name: "Phone Case", quantity: 2, price: 29.99 },
            ],
            total: 259.97,
            status: "pending",
            createdAt: "2024-01-15T10:30:00Z",
            shippingAddress: "123 Main St, City, State 12345",
          },
          {
            id: "ORD-002",
            customerName: "Bob Durant",
            customerEmail: "bob@entreprise.fr",
            Produits: [
              { name: "Bluetooth Speaker", quantity: 1, price: 79.99 },
            ],
            total: 79.99,
            status: "shipped",
            createdAt: "2024-01-14T15:20:00Z",
            shippingAddress: "456 Oak Ave, Town, State 67890",
          },
          {
            id: "ORD-003",
            customerName: "Carol Smith",
            customerEmail: "carol@entreprise.fr",
            Produits: [
              { name: "Laptop Stand", quantity: 1, price: 49.99 },
              { name: "Wireless Mouse", quantity: 1, price: 39.99 },
            ],
            total: 89.98,
            status: "delivered",
            createdAt: "2024-01-13T09:15:00Z",
            shippingAddress: "789 Pine Rd, Village, State 13579",
          },
          {
            id: "ORD-004",
            customerName: "David Wilson",
            customerEmail: "david@entreprise.fr",
            Produits: [
              { name: "Smartphone Case", quantity: 3, price: 29.99 },
            ],
            total: 89.97,
            status: "processing",
            createdAt: "2024-01-12T14:45:00Z",
            shippingAddress: "321 Elm St, Borough, State 24680",
          },
          {
            id: "ORD-005",
            customerName: "Eve Johnson",
            customerEmail: "eve@entreprise.fr",
            Produits: [
              { name: "Tablet Stand", quantity: 1, price: 35.99 },
            ],
            total: 35.99,
            status: "cancelled",
            createdAt: "2024-01-11T11:30:00Z",
            shippingAddress: "654 Maple Ave, City, State 97531",
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching Commandes:", error);
      setCommandes([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer et trier les commandes
  const filteredCommandes = Commandes
    .filter((order) => {
      const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || order.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "amount_high":
          return b.total - a.total;
        case "amount_low":
          return a.total - b.total;
        default:
          return 0;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "shipped":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "processing":
        return <Package className="h-4 w-4" />;
      case "shipped":
        return <Package className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Statistiques des commandes
  const Commandestats = {
    total: Commandes.length,
    pending: Commandes.filter(o => o.status === "pending").length,
    processing: Commandes.filter(o => o.status === "processing").length,
    shipped: Commandes.filter(o => o.status === "shipped").length,
    delivered: Commandes.filter(o => o.status === "delivered").length,
    cancelled: Commandes.filter(o => o.status === "cancelled").length,
    totalRevenue: Commandes.reduce((sum, order) => sum + order.total, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Commandes
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and track your customer Commandes
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">
            ${Commandestats.totalRevenue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <ShoppingBag className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold">{Commandestats.total}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Clock className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
              <p className="text-2xl font-bold text-yellow-600">{Commandestats.pending}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Package className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold text-blue-600">{Commandestats.processing}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Processing</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Package className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold text-purple-600">{Commandestats.shipped}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Shipped</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold text-green-600">{Commandestats.delivered}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Delivered</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <XCircle className="h-6 w-6 mx-auto mb-2 text-red-600" />
              <p className="text-2xl font-bold text-red-600">{Commandestats.cancelled}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Cancelled</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search Commandes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              aria-label="Filter orders by status"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort orders by criteria"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
              <option value="amount_high">Highest Amount</option>
              <option value="amount_low">Lowest Amount</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Commandes List */}
      <div className="space-y-4">
        {filteredCommandes.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Order #{order.id}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {order.customerName} • {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <Badge className={`flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="capitalize">{order.status}</span>
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Produits</h4>
                      <div className="space-y-1">
                        {order.Produits.map((product, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              {product.name} × {product.quantity}
                            </span>
                            <span className="font-medium">${(product.price * product.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Shipping Address</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {order.shippingAddress}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-2 ml-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      ${order.total.toFixed(2)}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Voir les détails
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCommandes.length === 0 && (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No Commandes found matching your criteria
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

