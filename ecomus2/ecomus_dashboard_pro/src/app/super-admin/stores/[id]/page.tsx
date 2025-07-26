"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Store, 
  Users, 
  ShoppingCart, 
  DollarSign,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  ExternalLink,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface StoreDetails {
  _id: string;
  name: string;
  description: string;
  domain: string;
  status: 'active' | 'inactive' | 'suspended';
  plan: 'free' | 'pro' | 'enterprise';
  owner: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  stats: {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    totalCustomers: number;
  };
  recentOrders: Array<{
    _id: string;
    orderNumber: string;
    customer: {
      name: string;
      email: string;
    };
    total: number;
    status: string;
    createdAt: string;
  }>;
  topProducts: Array<{
    product: {
      _id: string;
      title: string;
      images: string[];
      price: number;
    };
    totalSold: number;
    revenue: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function StoreDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [store, setStore] = useState<StoreDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStoreDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/super-admin/stores/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setStore(data.store);
      } else {
        toast.error("Erreur lors du chargement des détails");
        router.push('/super-admin/stores');
      }
    } catch (error) {
      console.error("Error fetching store details:", error);
      toast.error("Erreur lors du chargement des détails");
      router.push('/super-admin/stores');
    } finally {
      setLoading(false);
    }
  };

  const handleStoreAction = async (action: string) => {
    if (!store) return;

    try {
      const response = await fetch(`/api/super-admin/stores/${store._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Action ${action} effectuée avec succès`);
        fetchStoreDetails();
      } else {
        toast.error(data.message || "Erreur lors de l'action");
      }
    } catch (error) {
      console.error("Error performing store action:", error);
      toast.error("Erreur lors de l'action");
    }
  };

  const handleDeleteStore = async () => {
    if (!store) return;

    if (!confirm("Êtes-vous sûr de vouloir supprimer cette boutique ? Cette action est irréversible.")) {
      return;
    }

    try {
      const response = await fetch(`/api/super-admin/stores/${store._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Boutique supprimée avec succès");
        router.push('/super-admin/stores');
      } else {
        toast.error(data.message || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Error deleting store:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchStoreDetails();
    }
  }, [params.id]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="success">Actif</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactif</Badge>;
      case "suspended":
        return <Badge variant="destructive">Suspendu</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case "free":
        return <Badge variant="outline">Gratuit</Badge>;
      case "pro":
        return <Badge variant="default">Pro</Badge>;
      case "enterprise":
        return <Badge variant="secondary">Enterprise</Badge>;
      default:
        return <Badge variant="outline">{plan}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("fr-FR").format(num);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">
          Boutique non trouvée
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/super-admin/stores')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {store.name}
              </h1>
              {getStatusBadge(store.status)}
              {getPlanBadge(store.plan)}
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {store.description || "Aucune description"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`https://${store.domain}`, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Visiter
          </Button>
          <Button
            onClick={fetchStoreDetails}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button
            variant="outline"
            size="sm"
          >
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produits</CardTitle>
            <Store className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(store.stats.totalProducts)}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Total actifs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(store.stats.totalOrders)}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Toutes périodes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'Affaires</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(store.stats.totalRevenue)}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Revenue total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(store.stats.totalCustomers)}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Clients actifs
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Store Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations de la Boutique</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                {store.owner ? (
                  <>
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                      {store.owner.avatar ? (
                        <img
                          src={store.owner.avatar}
                          alt={store.owner.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                          {store.owner.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{store.owner.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Propriétaire</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-gray-600 dark:text-gray-400">
                        M
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">Store Multi-vendor</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Plusieurs vendeurs</p>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{store.domain}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{store.contact.email}</span>
                </div>
                {store.contact.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{store.contact.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">
                    Créée le {new Date(store.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {store.status === "active" ? (
                <Button
                  onClick={() => handleStoreAction("suspend")}
                  variant="outline"
                  className="w-full text-orange-600 hover:text-orange-700"
                >
                  Suspendre la boutique
                </Button>
              ) : (
                <Button
                  onClick={() => handleStoreAction("activate")}
                  variant="outline"
                  className="w-full text-green-600 hover:text-green-700"
                >
                  Activer la boutique
                </Button>
              )}
              <Button
                onClick={handleDeleteStore}
                variant="outline"
                className="w-full text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer la boutique
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders & Top Products */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Commandes Récentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N° Commande</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {store.recentOrders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell className="font-medium">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{order.customer.name}</div>
                            <div className="text-sm text-gray-600">{order.customer.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(order.total)}</TableCell>
                        <TableCell>
                          <Badge variant={order.status === 'completed' ? 'success' : 'secondary'}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Produits les Plus Vendus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {store.topProducts.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center">
                      {item.product.images && item.product.images[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.title}
                          className="w-12 h-12 rounded-md object-cover"
                        />
                      ) : (
                        <Store className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.product.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatCurrency(item.product.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatNumber(item.totalSold)} vendus</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatCurrency(item.revenue)} CA
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
