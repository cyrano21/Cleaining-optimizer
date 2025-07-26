"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Package,
  Truck,
  DollarSign,
  TrendingUp,
  Plus,
  Settings,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Clock,
  Globe,
  Star,
  Users,
  ShoppingCart,
  Shield,
  BarChart3,
  FileText,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Upload,
  Database,
  RefreshCw,
  Loader2,
} from "lucide-react";

interface Supplier {
  id: string;
  name: string;
  country: string;
  rating: number;
  products: number;
  status: "connected" | "pending" | "disconnected";
  commission: number;
  shippingTime: string;
  minOrder: number;
  website?: string;
  description: string;
  categories: string[];
  connectedDate: string;
  totalOrders: number;
  revenue: number;
}

interface DropshippingProduct {
  id: string;
  title: string;
  supplier: string;
  supplierPrice: number;
  sellingPrice: number;
  margin: number;
  stock: number;
  orders: number;
  status: "active" | "inactive" | "out_of_stock";
  image: string;
  category: string;
  lastUpdated: string;
}

interface DropshippingOrder {
  id: string;
  productTitle: string;
  supplier: string;
  customer: string;
  quantity: number;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  orderDate: string;
  shippingDate?: string;
  trackingNumber?: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    suppliers?: Supplier[];
    products?: DropshippingProduct[];
    orders?: DropshippingOrder[];
    stats?: {
      totalRevenue: number;
      totalOrders: number;
      activeSuppliers: number;
      activeProducts: number;
    };
    mockData?: {
      suppliers: Supplier[];
      products: DropshippingProduct[];
      orders: DropshippingOrder[];
    };
    message?: string;
  };
  mockEnabled: boolean;
  message?: string;
}

interface IntegrationData {
  connected: boolean;
  apiKey?: string;
  webhookUrl?: string;
  lastSync?: string;
  status: string;
  integration: {
    integrationRate: number;
    dropshippingProducts: number;
    totalProducts: number;
  };
  suppliers: {
    connectionRate: number;
    connected: number;
    total: number;
  };
  orders: {
    growthRate: number;
    recent: number;
  };
  performance: {
    avgProfitMargin: number;
    totalOrders: number;
  };
  products: {
    withDropshipping: Array<{
      _id: string;
      title: string;
      price: number;
      dropshippingInfo?: {
        supplierName?: string;
        supplierPrice?: number;
        profitMargin?: number;
        shippingTime?: string;
      };
    }>;
    detailed: Array<{
      id: string;
      productTitle: string;
      supplierName: string;
      supplierCountry: string;
      supplierPrice: number;
      profitMargin: number;
      status: string;
      orders: number;
      revenue: number;
    }>;
  };
  topSuppliers: Array<{
    _id: string;
    name: string;
    country: string;
    rating?: number;
    totalProducts: number;
  }>;
}

export default function VendorDropshippingPage() {
  const [activeTab, setActiveTab] = useState("suppliers");
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({});
  const [includeMockData, setIncludeMockData] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(false);

  // États pour les données
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [dropshippingProducts, setDropshippingProducts] = useState<
    DropshippingProduct[]
  >([]);
  const [dropshippingOrders, setDropshippingOrders] = useState<
    DropshippingOrder[]
  >([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeSuppliers: 0,
    activeProducts: 0,
  });
  const [integrationData, setIntegrationData] =
    useState<IntegrationData | null>(null);

  // Charger les données
  const fetchData = useCallback(
    async (tab: string = activeTab) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/vendor/dropshipping?tab=${tab}&includeMock=${includeMockData}`
        );
        const data: ApiResponse = await response.json();

        if (!data.success) {
          throw new Error(
            data.data?.message || "Erreur lors du chargement des données"
          );
        }

        // Utiliser les données réelles ou mockées selon le toggle
        const dataToUse =
          includeMockData && data.data.mockData
            ? data.data.mockData
            : data.data;

        if (dataToUse.suppliers) {
          setSuppliers(dataToUse.suppliers);
        }
        if (dataToUse.products) {
          setDropshippingProducts(dataToUse.products);
        }
        if (dataToUse.orders) {
          setDropshippingOrders(dataToUse.orders);
        }
        if ("stats" in dataToUse && dataToUse.stats) {
          setStats(dataToUse.stats);
        }
      } catch (err) {
        console.error("Erreur chargement données dropshipping:", err);
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    },
    [activeTab, includeMockData]
  );

  // Charger les données d'intégration
  const fetchIntegrationData = useCallback(async () => {
    try {
      const response = await fetch("/api/vendor/dropshipping/integration");
      const data = await response.json();

      if (data.success) {
        setIntegrationData(data.data);
      }
    } catch (err) {
      console.error("Erreur chargement données intégration:", err);
    }
  }, []);

  // Initialiser les données de test
  const initializeTestData = async () => {
    try {
      setInitializing(true);
      const response = await fetch("/api/vendor/dropshipping/init", {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        await fetchData();
        alert("Données de test créées avec succès !");
      } else {
        alert(data.message || "Erreur lors de la création des données de test");
      }
    } catch (err) {
      console.error("Erreur initialisation données test:", err);
      alert("Erreur lors de l'initialisation des données de test");
    } finally {
      setInitializing(false);
    }
  };

  // Supprimer les données de test
  const cleanupTestData = async () => {
    try {
      setInitializing(true);
      const response = await fetch("/api/vendor/dropshipping/init", {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        await fetchData();
        alert("Données de test supprimées avec succès !");
      } else {
        alert(
          data.message || "Erreur lors de la suppression des données de test"
        );
      }
    } catch (err) {
      console.error("Erreur suppression données test:", err);
      alert("Erreur lors de la suppression des données de test");
    } finally {
      setInitializing(false);
    }
  };

  // Effet pour charger les données au montage et quand le toggle change
  useEffect(() => {
    fetchData();
    fetchIntegrationData();
  }, [includeMockData, fetchData, fetchIntegrationData]);

  // Effet pour recharger quand l'onglet change
  useEffect(() => {
    fetchData(activeTab);
    if (activeTab === "integration") {
      fetchIntegrationData();
    }
  }, [activeTab, fetchData, fetchIntegrationData]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
      case "active":
      case "shipped":
      case "delivered":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Connecté
          </Badge>
        );
      case "pending":
      case "processing":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            En attente
          </Badge>
        );
      case "disconnected":
      case "inactive":
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Déconnecté
          </Badge>
        );
      case "out_of_stock":
        return (
          <Badge className="bg-orange-100 text-orange-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Rupture
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleConnectSupplier = async (supplierId: string) => {
    try {
      const response = await fetch("/api/vendor/dropshipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "connect_supplier",
          data: { supplierId },
        }),
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error("Erreur connexion fournisseur:", error);
    }
  };

  const handleDisconnectSupplier = async (supplierId: string) => {
    try {
      const response = await fetch("/api/vendor/dropshipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "disconnect_supplier",
          data: { supplierId },
        }),
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error("Erreur déconnexion fournisseur:", error);
    }
  };

  const handleAddSupplier = async () => {
    try {
      const response = await fetch("/api/vendor/dropshipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_supplier",
          data: newSupplier,
        }),
      });

      if (response.ok) {
        setIsSupplierModalOpen(false);
        setNewSupplier({});
        await fetchData();
      }
    } catch (error) {
      console.error("Erreur ajout fournisseur:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Chargement des données dropshipping...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dropshipping</h1>
          <p className="text-muted-foreground">
            Gérez vos fournisseurs et produits dropshipping
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Dialog
            open={isSupplierModalOpen}
            onOpenChange={setIsSupplierModalOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nouveau Fournisseur
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Ajouter un Fournisseur</DialogTitle>
                <DialogDescription>
                  Connectez-vous à un nouveau fournisseur dropshipping
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom du fournisseur</Label>
                    <Input
                      id="name"
                      placeholder="Ex: AliExpress"
                      value={newSupplier.name || ""}
                      onChange={(e) =>
                        setNewSupplier({ ...newSupplier, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Pays</Label>
                    <Input
                      id="country"
                      placeholder="Ex: Chine"
                      value={newSupplier.country || ""}
                      onChange={(e) =>
                        setNewSupplier({
                          ...newSupplier,
                          country: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">Site web</Label>
                    <Input
                      id="website"
                      placeholder="https://..."
                      value={newSupplier.website || ""}
                      onChange={(e) =>
                        setNewSupplier({
                          ...newSupplier,
                          website: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="commission">Commission (%)</Label>
                    <Input
                      id="commission"
                      type="number"
                      placeholder="8.5"
                      value={newSupplier.commission || ""}
                      onChange={(e) =>
                        setNewSupplier({
                          ...newSupplier,
                          commission: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Décrivez ce fournisseur..."
                    value={newSupplier.description || ""}
                    onChange={(e) =>
                      setNewSupplier({
                        ...newSupplier,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsSupplierModalOpen(false)}
                >
                  Annuler
                </Button>
                <Button onClick={handleAddSupplier}>Ajouter</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Toggle et Alertes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="mock-data"
                checked={includeMockData}
                onCheckedChange={setIncludeMockData}
              />
              <Label htmlFor="mock-data">
                Afficher les données de démonstration
              </Label>
            </div>
            {includeMockData && (
              <Badge
                variant="secondary"
                className="bg-orange-100 text-orange-800"
              >
                <Database className="w-3 h-3 mr-1" />
                Mode Démo
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={initializeTestData}
              disabled={initializing}
            >
              {initializing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Database className="w-4 h-4 mr-2" />
              )}
              Initialiser Données Test
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={cleanupTestData}
              disabled={initializing}
            >
              {initializing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Nettoyer Données Test
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {suppliers.length === 0 && !includeMockData && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Aucune donnée dropshipping trouvée. Activez le mode démo ou
              initialisez des données de test pour commencer.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Fournisseurs Connectés
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSuppliers}</div>
            <p className="text-xs text-muted-foreground">
              Sur {suppliers.length} fournisseurs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Produits Actifs
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProducts}</div>
            <p className="text-xs text-muted-foreground">
              Sur {dropshippingProducts.length} produits
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
              {stats.totalRevenue.toLocaleString()}€
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalOrders} commandes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Marge Moyenne</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dropshippingProducts.length > 0
                ? (
                    dropshippingProducts.reduce((sum, p) => sum + p.margin, 0) /
                    dropshippingProducts.length
                  ).toFixed(1)
                : "0"}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              Marge moyenne des produits
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="suppliers">Fournisseurs</TabsTrigger>
          <TabsTrigger value="products">Produits</TabsTrigger>
          <TabsTrigger value="orders">Commandes</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="integration">Intégration</TabsTrigger>
        </TabsList>

        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mes Fournisseurs</CardTitle>
              <CardDescription>
                Gérez vos connexions avec les fournisseurs dropshipping
              </CardDescription>
            </CardHeader>
            <CardContent>
              {suppliers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
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
                      <TableRow key={supplier.id}>
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
                        <TableCell>{supplier.country}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            {supplier.rating.toFixed(1)}
                          </div>
                        </TableCell>
                        <TableCell>{supplier.products}</TableCell>
                        <TableCell>{supplier.totalOrders}</TableCell>
                        <TableCell>
                          {supplier.revenue.toLocaleString()}€
                        </TableCell>
                        <TableCell>{getStatusBadge(supplier.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {supplier.status === "pending" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-700"
                                onClick={() =>
                                  handleConnectSupplier(supplier.id)
                                }
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            )}
                            {supplier.status === "connected" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() =>
                                  handleDisconnectSupplier(supplier.id)
                                }
                              >
                                <AlertCircle className="w-4 h-4" />
                              </Button>
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

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Produits Dropshipping</CardTitle>
                  <CardDescription>
                    Gérez vos produits importés des fournisseurs
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtrer
                  </Button>
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Importer
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {dropshippingProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun produit dropshipping trouvé
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead>Fournisseur</TableHead>
                      <TableHead>Prix Fournisseur</TableHead>
                      <TableHead>Prix Vente</TableHead>
                      <TableHead>Marge</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Commandes</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dropshippingProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image}
                              alt={product.title}
                              className="w-10 h-10 rounded object-cover"
                            />
                            <div>
                              <div className="font-medium">{product.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {product.category}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{product.supplier}</TableCell>
                        <TableCell>
                          {product.supplierPrice.toFixed(2)}€
                        </TableCell>
                        <TableCell>
                          {product.sellingPrice.toFixed(2)}€
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              product.margin > 50 ? "default" : "secondary"
                            }
                          >
                            {product.margin.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              product.stock === 0
                                ? "text-red-600"
                                : product.stock < 20
                                  ? "text-orange-600"
                                  : ""
                            }
                          >
                            {product.stock}
                          </span>
                        </TableCell>
                        <TableCell>{product.orders}</TableCell>
                        <TableCell>{getStatusBadge(product.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4" />
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

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commandes Dropshipping</CardTitle>
              <CardDescription>
                Suivez vos commandes dropshipping en temps réel
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dropshippingOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune commande dropshipping trouvée
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Commande</TableHead>
                      <TableHead>Produit</TableHead>
                      <TableHead>Fournisseur</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Quantité</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Suivi</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dropshippingOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div className="font-medium">{order.id}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(order.orderDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>{order.productTitle}</TableCell>
                        <TableCell>{order.supplier}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>{order.quantity}</TableCell>
                        <TableCell>{order.total.toFixed(2)}€</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>
                          {order.trackingNumber ? (
                            <div className="text-sm">
                              <div className="font-medium">
                                {order.trackingNumber}
                              </div>
                              <div className="text-muted-foreground">
                                Expédié le{" "}
                                {order.shippingDate &&
                                  new Date(
                                    order.shippingDate
                                  ).toLocaleDateString()}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            {order.trackingNumber && (
                              <Button variant="ghost" size="sm">
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            )}
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

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance par Fournisseur</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {suppliers
                    .filter((s) => s.status === "connected")
                    .map((supplier) => (
                      <div
                        key={supplier.id}
                        className="flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium">{supplier.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {supplier.totalOrders} commandes
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {supplier.revenue.toLocaleString()}€
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {supplier.commission}% commission
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top Produits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dropshippingProducts
                    .sort((a, b) => b.orders - a.orders)
                    .slice(0, 5)
                    .map((product) => (
                      <div
                        key={product.id}
                        className="flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium">{product.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {product.supplier}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {product.orders} commandes
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {product.margin.toFixed(1)}% marge
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="integration" className="space-y-4">
          {!integrationData ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <>
              {/* Statistiques d'intégration */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Taux d&apos;Intégration
                    </CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {integrationData.integration.integrationRate}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {integrationData.integration.dropshippingProducts} /{" "}
                      {integrationData.integration.totalProducts} produits
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Fournisseurs Connectés
                    </CardTitle>
                    <Truck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {integrationData.suppliers.connectionRate}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {integrationData.suppliers.connected} /{" "}
                      {integrationData.suppliers.total} fournisseurs
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Croissance Commandes
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {integrationData.orders.growthRate}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {integrationData.orders.recent} commandes récentes
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Marge Moyenne
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {integrationData.performance.avgProfitMargin}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {integrationData.performance.totalOrders} commandes
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Produits avec intégration dropshipping */}
              <Card>
                <CardHeader>
                  <CardTitle>Produits avec Intégration Dropshipping</CardTitle>
                  <CardDescription>
                    Produits marqués comme dropshipping dans votre catalogue
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {integrationData.products.withDropshipping.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Aucun produit avec intégration dropshipping trouvé
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produit</TableHead>
                          <TableHead>Prix</TableHead>
                          <TableHead>Fournisseur</TableHead>
                          <TableHead>Prix Fournisseur</TableHead>
                          <TableHead>Marge</TableHead>
                          <TableHead>Temps Livraison</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {integrationData.products.withDropshipping.map(
                          (product) => (
                            <TableRow key={product._id}>
                              <TableCell className="font-medium">
                                {product.title}
                              </TableCell>
                              <TableCell>{product.price.toFixed(2)}€</TableCell>
                              <TableCell>
                                {product.dropshippingInfo?.supplierName || "-"}
                              </TableCell>
                              <TableCell>
                                {product.dropshippingInfo?.supplierPrice?.toFixed(
                                  2
                                ) || "-"}
                                €
                              </TableCell>
                              <TableCell>
                                {product.dropshippingInfo?.profitMargin ? (
                                  <Badge
                                    variant={
                                      product.dropshippingInfo.profitMargin > 50
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {product.dropshippingInfo.profitMargin.toFixed(
                                      1
                                    )}
                                    %
                                  </Badge>
                                ) : (
                                  "-"
                                )}
                              </TableCell>
                              <TableCell>
                                {product.dropshippingInfo?.shippingTime || "-"}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="sm">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {/* Produits dropshipping détaillés */}
              <Card>
                <CardHeader>
                  <CardTitle>Produits Dropshipping Détaillés</CardTitle>
                  <CardDescription>
                    Produits avec informations détaillées de dropshipping
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {integrationData.products.detailed.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Aucun produit dropshipping détaillé trouvé
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produit</TableHead>
                          <TableHead>Fournisseur</TableHead>
                          <TableHead>Pays</TableHead>
                          <TableHead>Prix Fournisseur</TableHead>
                          <TableHead>Marge</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Commandes</TableHead>
                          <TableHead>Revenus</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {integrationData.products.detailed.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">
                              {product.productTitle}
                            </TableCell>
                            <TableCell>{product.supplierName}</TableCell>
                            <TableCell>{product.supplierCountry}</TableCell>
                            <TableCell>
                              {product.supplierPrice.toFixed(2)}€
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  product.profitMargin > 50
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {product.profitMargin.toFixed(1)}%
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(product.status)}
                            </TableCell>
                            <TableCell>{product.orders}</TableCell>
                            <TableCell>{product.revenue.toFixed(2)}€</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {/* Top fournisseurs */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Fournisseurs</CardTitle>
                  <CardDescription>
                    Fournisseurs avec le plus de produits disponibles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {integrationData.topSuppliers.map(
                      (supplier, index: number) => (
                        <div
                          key={supplier._id}
                          className="flex justify-between items-center"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium">{supplier.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {supplier.country}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              {supplier.totalProducts} produits
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <Star className="w-3 h-3 inline mr-1" />
                              {supplier.rating?.toFixed(1) || "N/A"}
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
