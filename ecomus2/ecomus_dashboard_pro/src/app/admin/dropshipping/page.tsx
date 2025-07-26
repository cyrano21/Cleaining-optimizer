"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useDropshippingSuppliers,
  useDropshippingProducts,
  useDropshippingOrders,
  useDropshippingStats,
} from "@/hooks/useDropshipping";
import {
  Package,
  DollarSign,
  Plus,
  Settings,
  Eye,
  AlertCircle,
  CheckCircle,
  Globe,
  Star,
  Users,
  ShoppingCart,
  FileText,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from "lucide-react";

export default function AdminDropshippingPage() {
  // États pour les filtres et la pagination
  const [supplierFilters] = useState({
    status: "",
    country: "",
    search: "",
    page: 1,
    limit: 20,
  });

  const [productFilters] = useState({
    supplier: "",
    status: "",
    search: "",
    store: "",
    page: 1,
    limit: 20,
  });

  const [orderFilters] = useState({
    supplier: "",
    status: "",
    store: "",
    startDate: "",
    endDate: "",
    page: 1,
    limit: 20,
  });

  // Hooks pour récupérer les données
  const {
    suppliers,
    loading: suppliersLoading,
    error: suppliersError,
  } = useDropshippingSuppliers(supplierFilters);

  const { products, loading: productsLoading } =
    useDropshippingProducts(productFilters);

  const {
    orders,
    loading: ordersLoading,
    error: ordersError,
  } = useDropshippingOrders(orderFilters);

  const {
    stats,
    loading: statsLoading,
    error: statsError,
  } = useDropshippingStats();

  // Fonctions utilitaires
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("fr-FR").format(num);
  };

  // Fonctions de gestion des fournisseurs
  const updateSupplierStatus = async (supplierId: string, status: string) => {
    try {
      const response = await fetch(
        `/api/admin/dropshipping/suppliers/${supplierId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du statut");
      }

      // Rafraîchir les données
      // Vous pouvez appeler une fonction de refetch ici
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
    }
  };

  const handleApproveSupplier = async (supplierId: string) => {
    await updateSupplierStatus(supplierId, "verified");
  };

  const handleRejectSupplier = async (supplierId: string) => {
    await updateSupplierStatus(supplierId, "rejected");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Vérifié
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            En attente
          </Badge>
        );
      case "suspended":
      case "inactive":
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Suspendu
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Rejeté
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Administration Dropshipping
          </h1>
          <p className="text-muted-foreground">
            Gérez les fournisseurs globaux et supervisez l&apos;activité
            dropshipping
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Rapport Global
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Fournisseur
          </Button>
        </div>
      </div>

      {/* Global Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Fournisseurs Globaux
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {suppliersLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                suppliers?.length || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {suppliers?.filter((s) => s.status === "verified").length || 0}{" "}
              vérifiés
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Produits Totaux
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {productsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                formatNumber(products?.length || 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {products?.filter((p) => p.status === "active").length || 0}{" "}
              actifs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Revenus Dropshipping
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                formatCurrency(stats?.totalRevenue || 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">+0% ce mois</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Commandes Totales
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ordersLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                formatNumber(orders?.length || 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">+0% cette semaine</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="suppliers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="suppliers">Fournisseurs Globaux</TabsTrigger>
          <TabsTrigger value="stores">Stores Dropshipping</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="compliance">Conformité</TabsTrigger>
        </TabsList>

        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fournisseurs Globaux</CardTitle>
              <CardDescription>
                Gérez et supervisez tous les fournisseurs de la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent>
              {suppliersLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Chargement des fournisseurs...</span>
                </div>
              ) : suppliersError ? (
                <div className="flex justify-center items-center py-8 text-red-600">
                  <AlertCircle className="h-6 w-6 mr-2" />
                  Erreur lors du chargement des fournisseurs
                </div>
              ) : !suppliers || suppliers.length === 0 ? (
                <div className="flex justify-center items-center py-8 text-muted-foreground">
                  Aucun fournisseur trouvé
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fournisseur</TableHead>
                      <TableHead>Pays</TableHead>
                      <TableHead>Note</TableHead>
                      <TableHead>Produits</TableHead>
                      <TableHead>Commandes</TableHead>
                      <TableHead>Revenus</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliers.map((supplier) => (
                      <TableRow key={supplier._id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="font-medium">{supplier.name}</div>
                              {supplier.website && (
                                <a
                                  href={supplier.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                                >
                                  <Globe className="w-3 h-3" />
                                  Site web
                                </a>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{supplier.country || "N/A"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            {supplier.rating?.toFixed(1) || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatNumber(supplier.totalProducts || 0)}
                        </TableCell>
                        <TableCell>
                          {formatNumber(supplier.totalOrders || 0)}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(supplier.totalRevenue || 0)}
                        </TableCell>
                        <TableCell>{getStatusBadge(supplier.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {supplier.status === "pending" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-green-600 hover:text-green-700"
                                  onClick={() =>
                                    handleApproveSupplier(supplier._id)
                                  }
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() =>
                                    handleRejectSupplier(supplier._id)
                                  }
                                >
                                  <AlertTriangle className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Settings className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stores" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stores avec Dropshipping</CardTitle>
              <CardDescription>
                Supervisez l&apos;activité dropshipping de tous les stores
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Chargement des données...</span>
                </div>
              ) : ordersError ? (
                <div className="flex justify-center items-center py-8 text-red-600">
                  <AlertCircle className="h-6 w-6 mr-2" />
                  Erreur lors du chargement des données
                </div>
              ) : !orders || orders.length === 0 ? (
                <div className="flex justify-center items-center py-8 text-muted-foreground">
                  Aucune donnée de store trouvée
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Affichage basé sur les commandes dropshipping actives
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Commande</TableHead>
                        <TableHead>Fournisseur</TableHead>
                        <TableHead>Produit</TableHead>
                        <TableHead>Quantité</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.slice(0, 10).map((order) => (
                        <TableRow key={order._id}>
                          <TableCell>
                            <div className="font-medium">#{order.orderId}</div>
                          </TableCell>
                          <TableCell>{order.supplier}</TableCell>
                          <TableCell>
                            {order.productInfo?.name || order.product}
                          </TableCell>
                          <TableCell>{order.quantity}</TableCell>
                          <TableCell>
                            {formatCurrency(order.totalAmount)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(order.dropshippingStatus)}
                          </TableCell>
                          <TableCell>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <RefreshCw className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {statsLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Chargement des analytics...</span>
            </div>
          ) : statsError ? (
            <div className="flex justify-center items-center py-8 text-red-600">
              <AlertCircle className="h-6 w-6 mr-2" />
              Erreur lors du chargement des analytics
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Globale</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Taux de conversion
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {stats?.conversionRate
                          ? `${stats.conversionRate}%`
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Panier moyen</span>
                      <span className="text-sm text-muted-foreground">
                        {stats?.avgOrderValue
                          ? formatCurrency(stats.avgOrderValue)
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Marge moyenne</span>
                      <span className="text-sm text-muted-foreground">N/A</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Délai livraison moyen
                      </span>
                      <span className="text-sm text-muted-foreground">N/A</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Statistiques Générales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Total Fournisseurs
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {suppliers?.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Total Produits
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatNumber(products?.length || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Total Commandes
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatNumber(orders?.length || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Revenus Totaux
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(stats?.totalRevenue || 0)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conformité et Audits</CardTitle>
              <CardDescription>
                Surveillez la conformité réglementaire des fournisseurs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {suppliersLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">
                    Chargement des données de conformité...
                  </span>
                </div>
              ) : suppliersError ? (
                <div className="flex justify-center items-center py-8 text-red-600">
                  <AlertCircle className="h-6 w-6 mr-2" />
                  Erreur lors du chargement des données de conformité
                </div>
              ) : !suppliers || suppliers.length === 0 ? (
                <div className="flex justify-center items-center py-8 text-muted-foreground">
                  Aucun fournisseur trouvé pour l&apos;audit de conformité
                </div>
              ) : (
                <div className="space-y-4">
                  {suppliers.map((supplier) => (
                    <div key={supplier._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{supplier.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {supplier.country || "Pays non spécifié"}
                          </p>
                        </div>
                        {getStatusBadge(supplier.status)}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Statut:</span>
                          <span className="ml-2">
                            {supplier.status === "verified"
                              ? "Vérifié"
                              : supplier.status === "pending"
                                ? "En attente"
                                : supplier.status === "rejected"
                                  ? "Rejeté"
                                  : "Inconnu"}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">
                            Date de connexion:
                          </span>
                          <span className="ml-2 text-muted-foreground">
                            {supplier.joinedDate
                              ? new Date(
                                  supplier.joinedDate
                                ).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="font-medium">Informations:</span>
                          <div className="mt-1 text-muted-foreground">
                            {supplier.description ||
                              "Aucune description disponible"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
