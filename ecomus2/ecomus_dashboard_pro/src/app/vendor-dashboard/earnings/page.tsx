"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Package,
  ShoppingBag,
  BarChart3,
  Download,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface EarningsData {
  totalEarnings: number;
  commission: number;
  monthlyEarnings: number;
  quarterlyEarnings: number;
  yearlyEarnings: number;
  earningsByMonth: Array<{ month: string; earnings: number }>;
  topProducts: Array<{ name: string; earnings: number }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    total: number;
    commission: number;
    status: string;
    createdAt: string;
  }>;
  stats: {
    totalOrders: number;
    completedOrders: number;
    averageOrderValue: number;
  };
}

export default function VendorEarningsPage() {
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(false);
  const [creatingSeller, setCreatingSeller] = useState(false);
  const [cleaningData, setCleaningData] = useState(false);
  const [showTestData, setShowTestData] = useState(true);

  useEffect(() => {
    fetchEarningsData();
  }, [timeRange, showTestData]);

  const fetchEarningsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `/api/vendor/earnings?period=${timeRange}&includeTest=${showTestData}`
      );

      if (response.ok) {
        const data = await response.json();
        setEarningsData(data);
      } else if (response.status === 404) {
        setError(
          "Aucune donnée de gains disponible. Initialisez les données de test pour commencer."
        );
      } else {
        throw new Error("Erreur lors du chargement des données");
      }
    } catch (error) {
      console.error("Error fetching earnings data:", error);
      setError("Impossible de charger les données de gains");
    } finally {
      setLoading(false);
    }
  };

  const createTestSeller = async () => {
    try {
      setCreatingSeller(true);
      setError(null);

      console.log("Creating test seller...");
      const response = await fetch("/api/vendor/earnings/create-test-seller", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("Create seller response:", data);

      if (response.ok) {
        console.log("Test seller created successfully");
        // Maintenant on peut initialiser les données
        await initializeTestData();
      } else {
        console.error("Create seller failed:", data);
        setError(data.error || "Erreur lors de la création du vendeur de test");
      }
    } catch (error) {
      console.error("Error creating test seller:", error);
      setError("Erreur de connexion lors de la création du vendeur.");
    } finally {
      setCreatingSeller(false);
    }
  };

  const initializeTestData = async () => {
    try {
      setInitializing(true);
      setError(null);

      console.log("Initializing test data...");
      const response = await fetch("/api/vendor/earnings/init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("Init response:", data);

      if (response.ok) {
        console.log("Test data initialized successfully");
        await fetchEarningsData();
      } else {
        console.error("Init failed:", data);
        let errorMessage = "Erreur lors de l'initialisation";

        if (data.error) {
          if (data.error.includes("Seller not found")) {
            errorMessage =
              "Vous devez être enregistré comme vendeur pour accéder à cette fonctionnalité.";
          } else if (data.error.includes("Unauthorized")) {
            errorMessage =
              "Vous devez être connecté pour initialiser les données.";
          } else if (data.error.includes("Database error")) {
            errorMessage = "Erreur de base de données. Vérifiez la connexion.";
          } else {
            errorMessage = data.error;
          }
        }

        if (data.details) {
          errorMessage += ` (${data.details})`;
        }

        setError(errorMessage);
      }
    } catch (error) {
      console.error("Error initializing test data:", error);
      setError("Erreur de connexion. Vérifiez votre connexion internet.");
    } finally {
      setInitializing(false);
    }
  };

  const cleanTestData = async () => {
    try {
      setCleaningData(true);
      setError(null);

      console.log("Cleaning test data...");
      const response = await fetch("/api/vendor/earnings/clean-test-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("Clean data response:", data);

      if (response.ok) {
        console.log("Test data cleaned successfully");
        await fetchEarningsData();
      } else {
        console.error("Clean data failed:", data);
        setError(data.error || "Erreur lors du nettoyage des données de test");
      }
    } catch (error) {
      console.error("Error cleaning test data:", error);
      setError("Erreur de connexion lors du nettoyage des données.");
    } finally {
      setCleaningData(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Terminé</Badge>;
      case "delivered":
        return <Badge className="bg-blue-100 text-blue-800">Livré</Badge>;
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800">En cours</Badge>
        );
    }
  };

  const toggleTestData = () => {
    setShowTestData(!showTestData);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error && error.includes("Aucune donnée")) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucune donnée de gains
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <div className="space-y-3">
            <Button
              onClick={createTestSeller}
              disabled={creatingSeller}
              className="w-full"
            >
              {creatingSeller ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Création du vendeur...
                </>
              ) : (
                "Créer un vendeur de test"
              )}
            </Button>
            <Button
              onClick={initializeTestData}
              disabled={initializing}
              variant="outline"
              className="w-full"
            >
              {initializing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                  Initialisation...
                </>
              ) : (
                "Initialiser les données de test"
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (error && !error.includes("Aucune donnée")) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">{error}</p>
        <Button onClick={fetchEarningsData} className="mt-4">
          Réessayer
        </Button>
      </div>
    );
  }

  if (!earningsData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Aucune donnée de gains disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Mes Gains
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Suivez vos revenus et commissions
            {showTestData && (
              <Badge className="ml-2 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                Mode démonstration
              </Badge>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            aria-label="Sélectionner la période pour les gains"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          >
            <option value="7">7 derniers jours</option>
            <option value="30">30 derniers jours</option>
            <option value="90">3 derniers mois</option>
            <option value="365">Cette année</option>
          </select>

          {/* Toggle pour les données de test */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Données test
            </span>
            <button
              onClick={toggleTestData}
              aria-label={`${showTestData ? "Masquer" : "Afficher"} les données de test`}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                showTestData ? "bg-green-600" : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showTestData ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={cleanTestData}
            disabled={cleaningData}
          >
            {cleaningData ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                Nettoyage...
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 mr-2" />
                Nettoyer données test
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
              Gains Totaux
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800 dark:text-green-200">
              {formatCurrency(earningsData.totalEarnings)}
            </div>
            <div className="flex items-center mt-1">
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              <span className="text-xs text-green-600 dark:text-green-400">
                Commission: {earningsData.commission}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Gains du Mois
            </CardTitle>
            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
              {formatCurrency(earningsData.monthlyEarnings)}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Ce mois-ci
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
              Commandes
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800 dark:text-orange-200">
              {earningsData.stats.totalOrders}
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              {earningsData.stats.completedOrders} terminées
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Panier Moyen
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
              {formatCurrency(earningsData.stats.averageOrderValue)}
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              Par commande
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Graphique des gains */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Évolution des Gains (12 mois)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-start space-x-2 overflow-x-auto pr-4">
              {earningsData.earningsByMonth.map((month, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center"
                  style={{ width: 32 }}
                >
                  <div
                    className="w-6 bg-gradient-to-t from-green-500 to-green-300 rounded-t"
                    style={{
                      height: `${(month.earnings / Math.max(...(earningsData.earningsByMonth.map((m) => m.earnings) || [1]))) * 200}px`,
                      minHeight: 2,
                    }}
                  />
                  <span className="text-xs text-gray-600 mt-2">
                    {month.month}
                  </span>
                  <span className="text-xs font-medium text-green-600">
                    {formatCurrency(month.earnings)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top produits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Top Produits par Gains
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {earningsData.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-green-600">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(product.earnings)}
                      </p>
                    </div>
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${(product.earnings / Math.max(...earningsData.topProducts.map((p) => p.earnings))) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commandes récentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <ShoppingBag className="h-5 w-5 mr-2" />
              Commandes Récentes
            </span>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Voir tout
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Commande
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Total
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Commission
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody>
                {earningsData.recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {order.orderNumber}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="py-3 px-4 text-green-600 font-medium">
                      {formatCurrency(order.commission)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        {getStatusBadge(order.status)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
