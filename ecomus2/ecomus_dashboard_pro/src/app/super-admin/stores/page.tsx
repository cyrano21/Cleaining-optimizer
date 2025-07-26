"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Store, 
  Users, 
  ShoppingCart, 
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
  RefreshCw,
  MoreHorizontal,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Store {
  _id: string;
  name: string;
  owner: {
    name: string;
    email: string;
    avatar?: string;
  };
  domain: string;
  status: 'active' | 'inactive' | 'suspended';
  plan: 'free' | 'pro' | 'enterprise';
  stats: {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    totalCustomers: number;
    growthRate: number;
  };
  createdAt: string;
}

interface StoreStats {
  totalStores: number;
  activeStores: number;
  suspendedStores: number;
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  growthRate: number;
}

export default function SuperAdminStoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [stats, setStats] = useState<StoreStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        search: searchTerm,
        status: statusFilter !== "all" ? statusFilter : "",
        plan: planFilter !== "all" ? planFilter : "",
      });

      const response = await fetch(`/api/super-admin/stores?${params}`);
      const data = await response.json();

      if (data.success) {
        setStores(data.stores);
        setStats(data.stats);
        setTotalPages(data.totalPages);
      } else {
        toast.error("Erreur lors du chargement des boutiques");
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
      toast.error("Erreur lors du chargement des boutiques");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [currentPage, searchTerm, statusFilter, planFilter]);

  const handleStoreAction = async (storeId: string, action: string) => {
    try {
      const response = await fetch(`/api/super-admin/stores/${storeId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Action ${action} effectuée avec succès`);
        fetchStores();
      } else {
        toast.error(data.message || "Erreur lors de l'action");
      }
    } catch (error) {
      console.error("Error performing store action:", error);
      toast.error("Erreur lors de l'action");
    }
  };

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

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestion des Boutiques
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Vue d'ensemble et gestion de toutes les boutiques
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={fetchStores}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Boutique
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Boutiques
              </CardTitle>
              <Store className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.totalStores)}</div>
              <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                <span className="text-green-600 mr-1">
                  {stats.activeStores} actives
                </span>
                • {stats.suspendedStores} suspendues
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Chiffre d'Affaires
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
              <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                {stats.growthRate >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                )}
                {Math.abs(stats.growthRate)}% ce mois
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Commandes
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.totalOrders)}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Toutes boutiques confondues
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Produits
              </CardTitle>
              <Users className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.totalProducts)}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Tous produits actifs
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher une boutique..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                title="Filtrer par statut"
                aria-label="Filtrer par statut"
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
                <option value="suspended">Suspendu</option>
              </select>
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                title="Filtrer par plan"
                aria-label="Filtrer par plan"
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Tous les plans</option>
                <option value="free">Gratuit</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stores Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Boutiques</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Boutique</TableHead>
                  <TableHead>Propriétaire</TableHead>
                  <TableHead>Domaine</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Produits</TableHead>
                  <TableHead>Commandes</TableHead>
                  <TableHead>CA</TableHead>
                  <TableHead>Créée le</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.map((store) => (
                  <TableRow key={store._id}>                    <TableCell>
                      <button
                        onClick={() => window.location.href = `/super-admin/stores/${store._id}`}
                        className="font-medium text-purple-600 hover:text-purple-700 hover:underline"
                      >
                        {store.name}
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {store.owner ? (
                          <>
                            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                              {store.owner.avatar ? (
                                <img
                                  src={store.owner.avatar}
                                  alt={store.owner.name}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                  {store.owner.name.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-sm">{store.owner.name}</div>
                              <div className="text-xs text-gray-500">{store.owner.email}</div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                M
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-sm">Multi-vendor</div>
                              <div className="text-xs text-gray-500">Plusieurs vendeurs</div>
                            </div>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-blue-600 hover:underline cursor-pointer">
                        {store.domain}
                      </span>
                    </TableCell>
                    <TableCell>{getPlanBadge(store.plan)}</TableCell>
                    <TableCell>{getStatusBadge(store.status)}</TableCell>
                    <TableCell>{formatNumber(store.stats.totalProducts)}</TableCell>
                    <TableCell>{formatNumber(store.stats.totalOrders)}</TableCell>
                    <TableCell>{formatCurrency(store.stats.totalRevenue)}</TableCell>
                    <TableCell>
                      {new Date(store.createdAt).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => window.location.href = `/super-admin/stores/${store._id}`}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Voir détails
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          {store.status === "active" ? (
                            <DropdownMenuItem
                              onClick={() => handleStoreAction(store._id, "suspend")}
                              className="text-orange-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Suspendre
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleStoreAction(store._id, "activate")}
                              className="text-green-600"
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Activer
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} sur {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
