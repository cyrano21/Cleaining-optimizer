"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Store as StoreIcon,
  Plus,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  TrendingUp,
  Settings,
  Grid,
  List,
  Table as TableIcon,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
} from "lucide-react";

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
  Dialog,
  DialogContent,
  DialogDescription,
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
import { toast } from "react-hot-toast";
import AdminGuard from "@/components/admin/admin-guard";
import { GlassMorphismCard } from "@/components/ui/glass-morphism-card";
import { StatCard } from "@/components/ui/stat-card";

// Interface pour les stores avec les nouveaux champs homes
interface StoreWithHomeFields {
  _id: string;
  id?: string;
  name: string;
  slug?: string;
  description?: string;
  homeTheme?: string;
  homeTemplate?: string;
  homeName?: string;
  homeDescription?: string;
  vendorStatus?: "none" | "pending" | "approved" | "rejected";
  vendorName?: string;
  logo?: string;
  logoUrl?: string;
  owner?: string;
  isActive: boolean;
  status?: string;
  createdAt?: string;
  categories?: { _id: string; name: string; slug?: string }[]; // Ajouté
}

interface StoreStats {
  totalStores: number;
  activeStores: number;
  pendingStores: number;
  suspendedStores: number;
  totalRevenue: number;
}

const AdminStoresManagement = () => {
  const [stores, setStores] = useState<StoreWithHomeFields[]>([]);
  const [allStores, setAllStores] = useState<StoreWithHomeFields[]>([]);
  const [stats, setStats] = useState<StoreStats>({
    totalStores: 0,
    activeStores: 0,
    pendingStores: 0,
    suspendedStores: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedStore, setSelectedStore] =
    useState<StoreWithHomeFields | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // États pour la pagination et la vue
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [viewType, setViewType] = useState<"table" | "cards" | "list">("table");
  const [sortBy, setSortBy] = useState<"name" | "createdAt" | "vendorName">(
    "createdAt"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  // États pour les fonctionnalités avancées
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState<
    "all" | "today" | "week" | "month" | "year"
  >("all");
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  // const [showBulkActions, setShowBulkActions] = useState(false); // Supprimé car non utilisé
  const [isExporting, setIsExporting] = useState(false);
  const [themeFilter, setThemeFilter] = useState("all");
  const [vendorFilter, setVendorFilter] = useState("all");
  const [searchField, setSearchField] = useState("all");

  // Fetch stores and stats
  useEffect(() => {
    fetchStores();
    fetchStats();
  }, []);
  const fetchStores = async () => {
    console.log("🔍 [DEBUG] fetchStores - Début de la récupération des stores");
    setLoading(true);
    try {
      console.log("🌐 [DEBUG] Appel API: /api/stores");
      // Utiliser l'API stores standard pour récupérer toutes les stores
      // Utiliser un limit élevé pour afficher tous les stores
      const response = await fetch("/api/stores?limit=100");
      console.log("📡 [DEBUG] Response status:", response.status);
      console.log("📡 [DEBUG] Response ok:", response.ok);
      const data = await response.json();
      console.log("📦 [DEBUG] Data reçue:", data);
      console.log("✅ [DEBUG] Data.success:", data.success);
      console.log(
        "🏪 [DEBUG] Nombre de stores dans data.data:",
        data.data?.stores?.length || 0
      );
      if (data.success && data.data) {
        console.log("🎯 [DEBUG] Mise à jour du state stores avec:", data.data);
        setAllStores(data.data || []);
        // Mettre à jour les stats si disponibles
        if (data.data.stats) {
          console.log("📊 [DEBUG] Mise à jour des stats:", data.data.stats);
          setStats(data.data.stats);
        }
      } else {
        console.error(
          "❌ [DEBUG] API retourne success=false ou pas de data:",
          data.message || data.error
        );
      }
    } catch (error) {
      console.error("💥 [DEBUG] Erreur dans fetchStores:", error);
      console.error("Erreur lors du chargement des boutiques:", error);
      toast.error("Erreur lors du chargement des boutiques");
    } finally {
      console.log("🏁 [DEBUG] fetchStores - Fin, loading=false");
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stores-stats");
      const data = await response.json();
      if (data.success) {
        setStats({
          totalStores: data.data.totalStores,
          activeStores: data.data.activeStores,
          pendingStores: data.data.pendingStores,
          suspendedStores: data.data.suspendedStores,
          totalRevenue: data.data.totalRevenue,
        });
      }
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error);
    }
  };

  // const handleStatusChange = async (storeId: string, newStatus: string) => {
  //   try {
  //     const response = await fetch(`/api/stores/${storeId}/status`, {
  //       method: "PATCH",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ status: newStatus }),
  //     });

  //     const data = await response.json();
  //     if (data.success) {
  //       toast.success(`Statut de la boutique mis à jour vers "${newStatus}"`);
  //       fetchStores();
  //       fetchStats();
  //     } else {
  //       toast.error(data.error || "Erreur lors de la mise à jour");
  //     }
  //   } catch (error) {
  //     console.error("Erreur:", error);
  //     toast.error("Erreur lors de la mise à jour du statut");
  //   }
  // };

  const handleActivationToggle = async (storeId: string, isActive: boolean) => {
    try {
      const response = await fetch("/api/admin/stores/activate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storeId,
          isActive,
          note: isActive
            ? "Activé via dashboard admin"
            : "Désactivé via dashboard admin",
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(
          `Store ${isActive ? "activée" : "désactivée"} avec succès`
        );
        fetchStores();
      } else {
        toast.error(data.error || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  // Fonction d'export des données
  const handleExport = async (format: "csv" | "json") => {
    setIsExporting(true);
    try {
      const dataToExport = getFilteredAndSortedStores();

      if (format === "csv") {
        const csvContent = [
          [
            "Nom",
            "Slug",
            "Thème",
            "Vendeur",
            "Statut",
            "Actif",
            "Date création",
          ].join(","),
          ...dataToExport.map((store) =>
            [
              `"${store.name || store.homeName || ""}"`,
              `"${store.slug || ""}"`,
              `"${store.homeTheme || ""}"`,
              `"${store.vendorName || ""}"`,
              `"${store.vendorStatus || ""}"`,
              store.isActive ? "Oui" : "Non",
              store.createdAt
                ? new Date(store.createdAt).toLocaleDateString("fr-FR")
                : "",
            ].join(",")
          ),
        ].join("\n");

        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `stores-${new Date().toISOString().split("T")[0]}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const jsonContent = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([jsonContent], { type: "application/json" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `stores-${new Date().toISOString().split("T")[0]}.json`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      toast.success(`Export ${format.toUpperCase()} réalisé avec succès`);
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
      toast.error("Erreur lors de l'export");
    } finally {
      setIsExporting(false);
    }
  };

  // Filtrage par date
  const isWithinDateFilter = (store: StoreWithHomeFields) => {
    if (dateFilter === "all" || !store.createdAt) return true;

    const storeDate = new Date(store.createdAt);
    const now = new Date();

    switch (dateFilter) {
      case "today":
        return storeDate.toDateString() === now.toDateString();
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return storeDate >= weekAgo;
      case "month":
        const monthAgo = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          now.getDate()
        );
        return storeDate >= monthAgo;
      case "year":
        const yearAgo = new Date(
          now.getFullYear() - 1,
          now.getMonth(),
          now.getDate()
        );
        return storeDate >= yearAgo;
      default:
        return true;
    }
  };

  // Fonctions de filtrage, tri et pagination
  const getFilteredAndSortedStores = useCallback(() => {
    let filteredStores = [...allStores];

    // Filtrage par recherche
    if (searchQuery) {
      filteredStores = filteredStores.filter(
        (store) =>
          store.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          store.vendorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          store.homeTheme?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtrage par statut
    if (statusFilter !== "all") {
      switch (statusFilter) {
        case "active":
          filteredStores = filteredStores.filter((store) => store.isActive);
          break;
        case "inactive":
          filteredStores = filteredStores.filter((store) => !store.isActive);
          break;
        case "pending":
          filteredStores = filteredStores.filter(
            (store) => store.vendorStatus === "pending"
          );
          break;
        case "approved":
          filteredStores = filteredStores.filter(
            (store) => store.vendorStatus === "approved"
          );
          break;
        case "rejected":
          filteredStores = filteredStores.filter(
            (store) => store.vendorStatus === "rejected"
          );
          break;
      }
    }

    // Filtrage par thème
    if (themeFilter !== "all") {
      filteredStores = filteredStores.filter(
        (store) => store.homeTheme === themeFilter
      );
    }

    // Filtrage par vendeur
    if (vendorFilter !== "all") {
      if (vendorFilter === "none") {
        filteredStores = filteredStores.filter((store) => !store.vendorName);
      } else {
        filteredStores = filteredStores.filter(
          (store) => store.vendorName === vendorFilter
        );
      }
    }

    // Filtrage par date
    filteredStores = filteredStores.filter(isWithinDateFilter);

    // Tri
    filteredStores.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "name":
          aValue = a.name?.toLowerCase() || "";
          bValue = b.name?.toLowerCase() || "";
          break;
        case "vendorName":
          aValue = a.vendorName?.toLowerCase() || "";
          bValue = b.vendorName?.toLowerCase() || "";
          break;
        case "createdAt":
        default:
          aValue = new Date(a.createdAt || 0).getTime();
          bValue = new Date(b.createdAt || 0).getTime();
          break;
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filteredStores;
  }, [allStores, searchQuery, statusFilter, themeFilter, vendorFilter, dateFilter, sortBy, sortOrder, isWithinDateFilter]);

  const getPaginatedStores = useCallback(() => {
    const filteredStores = getFilteredAndSortedStores();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredStores.slice(startIndex, endIndex);
  }, [currentPage, itemsPerPage, searchQuery, statusFilter, sortBy, sortOrder, dateFilter, themeFilter, vendorFilter, searchField, allStores]);

  const getTotalPages = () => {
    const filteredStores = getFilteredAndSortedStores();
    return Math.ceil(filteredStores.length / itemsPerPage);
  };

  const getTotalFilteredItems = () => {
    return getFilteredAndSortedStores().length;
  };
  // Mettre à jour stores quand les filtres changent
  useEffect(() => {
    setStores(getPaginatedStores());
    setCurrentPage(1); // Reset à la première page quand on change les filtres
  }, [
    searchQuery,
    statusFilter,
    sortBy,
    sortOrder,
    itemsPerPage,
    dateFilter,
    themeFilter,
    vendorFilter,
    searchField,
    getPaginatedStores,
  ]);

  // Mettre à jour stores quand la page change
  useEffect(() => {
    setStores(getPaginatedStores());
  }, [currentPage, allStores, getPaginatedStores]);

  const handleSort = (field: "name" | "createdAt" | "vendorName") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field: "name" | "createdAt" | "vendorName") => {
    if (sortBy !== field) {
      return <ArrowUpDown className="w-4 h-4 opacity-50" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="w-4 h-4 text-blue-600" />
    ) : (
      <ArrowDown className="w-4 h-4 text-blue-600" />
    );
  };

  // Logs de débogage pour le filtrage
  console.log("🔍 [DEBUG] Stores dans le state:", stores?.length || 0);
  console.log("🔍 [DEBUG] All stores:", allStores?.length || 0);
  console.log("🔍 [DEBUG] SearchQuery:", searchQuery);
  console.log("🔍 [DEBUG] StatusFilter:", statusFilter);
  console.log("🔍 [DEBUG] Loading state:", loading);
  if (stores?.length > 0) {
    console.log("🔍 [DEBUG] Premier store:", stores[0]);
  }
  // Composants de vue
  const StoreCard = ({ store }: { store: StoreWithHomeFields }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="aspect-video bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 relative">
        <Image
          src={store.logo || "/default-store-logo.png"}
          alt={store.name || "Store"}
          fill
          className="object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (
              target.src !==
              window.location.origin + "/default-store-logo.png"
            ) {
              target.src = "/default-store-logo.png";
            }
          }}
        />
        <div className="absolute top-3 right-3">
          <Badge variant={store.isActive ? "default" : "secondary"}>
            {store.isActive ? "Actif" : "Inactif"}
          </Badge>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 truncate">
            {store.name || store.homeName}
          </h3>
          <Badge variant="outline" className="text-xs">
            {store.homeTheme || "Aucun thème"}
          </Badge>
        </div>
        {/* Affichage des catégories */}
        {store.categories && store.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {store.categories.map((cat) => (
              <Badge key={cat._id} variant="secondary" className="text-xs">
                {cat.name}
              </Badge>
            ))}
          </div>
        )}

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
          {store.description || store.homeDescription || "Aucune description"}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
          <span className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            {store.vendorName || "Aucun vendeur"}
          </span>
          <span>
            {store.createdAt
              ? new Date(store.createdAt).toLocaleDateString("fr-FR")
              : "N/A"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col sm:flex-row items-stretch gap-2 w-full">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedStore(store);
                setIsEditModalOpen(true);
              }}
              className="w-full sm:w-auto"
            >
              <Eye className="w-4 h-4 mr-1" />
              Voir
            </Button>
            <Button
              size="sm"
              variant={store.isActive ? "destructive" : "default"}
              onClick={() => handleActivationToggle(store._id, !store.isActive)}
              className="w-full sm:w-auto"
            >
              {store.isActive ? (
                <>
                  <XCircle className="w-4 h-4 mr-1" />
                  Désactiver
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Activer
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
  const StoreListItem = ({ store }: { store: StoreWithHomeFields }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-sm transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg flex items-center justify-center">
            <Image
              src={store.logo || "/default-store-logo.png"}
              alt={store.name || "Store"}
              width={32}
              height={32}
              className="rounded"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (
                  target.src !==
                  window.location.origin + "/default-store-logo.png"
                ) {
                  target.src = "/default-store-logo.png";
                }
              }}
            />
          </div>

          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                {store.name || store.homeName}
              </h3>
              <Badge
                variant={store.isActive ? "default" : "secondary"}
                className="text-xs"
              >
                {store.isActive ? "Actif" : "Inactif"}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {store.homeTheme || "Aucun thème"}
              </Badge>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {store.vendorName || "Aucun vendeur"}
              </span>
              <span>
                {store.createdAt
                  ? new Date(store.createdAt).toLocaleDateString("fr-FR")
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex flex-col sm:flex-row items-stretch gap-2 w-full">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedStore(store);
                setIsEditModalOpen(true);
              }}
              className="w-full sm:w-auto"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={store.isActive ? "destructive" : "default"}
              onClick={() => handleActivationToggle(store._id, !store.isActive)}
              className="w-full sm:w-auto"
            >
              {store.isActive ? (
                <XCircle className="w-4 h-4" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Modal des détails de la store
  const StoreDetailsModal = () => (
    <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
              {selectedStore?.logo ? (
                <Image
                  src={selectedStore.logo || "/default-store-logo.png"}
                  alt={selectedStore.name}
                  width={32}
                  height={32}
                  className="rounded"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (
                      target.src !==
                      window.location.origin + "/default-store-logo.png"
                    ) {
                      target.src = "/default-store-logo.png";
                    }
                  }}
                />
              ) : (
                <Image
                  src="/default-store-logo.png"
                  alt="Logo par défaut"
                  width={32}
                  height={32}
                  className="rounded"
                />
              )}
            </div>
            <div>
              <div className="font-semibold text-lg">
                {selectedStore?.name || selectedStore?.homeName}
              </div>
              <div className="text-sm text-gray-500 font-normal">
                Détails de la boutique
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {selectedStore && (
          <div className="space-y-6">
            {/* Informations générales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Informations générales
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Nom de la boutique
                    </label>
                    <p className="text-gray-900">
                      {selectedStore.name ||
                        selectedStore.homeName ||
                        "Non défini"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Slug/URL
                    </label>
                    <p className="text-gray-900 font-mono text-sm">
                      {selectedStore.slug || "Non défini"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Description
                    </label>
                    <p className="text-gray-900">
                      {selectedStore.description ||
                        selectedStore.homeDescription ||
                        "Aucune description"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Thème
                    </label>
                    <Badge variant="outline" className="capitalize">
                      {selectedStore.homeTheme || "Aucun thème"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Statut et activité
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      État d&apos;activation
                    </label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge
                        variant={
                          selectedStore.isActive ? "default" : "secondary"
                        }
                      >
                        {selectedStore.isActive ? "🟢 Active" : "🔴 Inactive"}
                      </Badge>
                      <Button
                        size="sm"
                        variant={
                          selectedStore.isActive ? "destructive" : "default"
                        }
                        onClick={() => {
                          handleActivationToggle(
                            selectedStore._id,
                            !selectedStore.isActive
                          );
                          setIsEditModalOpen(false);
                        }}
                      >
                        {selectedStore.isActive ? "Désactiver" : "Activer"}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Statut vendeur
                    </label>
                    <Badge
                      variant={
                        selectedStore.vendorStatus === "approved"
                          ? "default"
                          : selectedStore.vendorStatus === "pending"
                            ? "secondary"
                            : selectedStore.vendorStatus === "rejected"
                              ? "destructive"
                              : "outline"
                      }
                    >
                      {selectedStore.vendorStatus === "approved"
                        ? "✅ Approuvé"
                        : selectedStore.vendorStatus === "pending"
                          ? "⏳ En attente"
                          : selectedStore.vendorStatus === "rejected"
                            ? "❌ Rejeté"
                            : "📝 Aucun"}
                    </Badge>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Vendeur assigné
                    </label>
                    <p className="text-gray-900">
                      {selectedStore.vendorName || "Aucun vendeur assigné"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Date de création
                    </label>
                    <p className="text-gray-900">
                      {selectedStore.createdAt
                        ? new Date(selectedStore.createdAt).toLocaleDateString(
                            "fr-FR",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : "Non disponible"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Actions rapides
              </h3>
              <div className="flex flex-wrap gap-2">
                <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full">
                  <Button
                    variant="outline"
                    onClick={() =>
                      window.open(
                        `/preview/store/${selectedStore.slug}`,
                        "_blank"
                      )
                    }
                    disabled={!selectedStore.slug}
                    className="w-full sm:w-auto"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Prévisualiser la boutique
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      // TODO: Implémenter l'édition des paramètres
                      toast.success("Fonctionnalité à venir");
                    }}
                    className="w-full sm:w-auto"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Paramètres avancés
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      // TODO: Implémenter la gestion des vendeurs
                      toast.success("Fonctionnalité à venir");
                    }}
                    className="w-full sm:w-auto"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Gérer les vendeurs
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  // Modal de création de boutique
  const CreateStoreModal = () => (
    <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
      <DialogContent className="w-full max-w-xs sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer une nouvelle boutique</DialogTitle>
          <DialogDescription>
            Remplissez les informations pour créer une nouvelle boutique.
          </DialogDescription>
        </DialogHeader>
        {/* Formulaire de création de boutique */}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            // TODO: Ajoutez ici la logique de création (API call)
            toast.success("Boutique créée (simulation)");
            setIsCreateModalOpen(false);
          }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="store-name">Nom de la boutique</Label>
            <Input
              id="store-name"
              name="name"
              required
              placeholder="Nom de la boutique"
              className="w-full text-base py-2"
            />
          </div>
          <div>
            <Label htmlFor="store-theme">Thème</Label>
            <Input
              id="store-theme"
              name="theme"
              placeholder="Thème (optionnel)"
              className="w-full text-base py-2"
            />
          </div>
          <div>
            <Label htmlFor="store-vendor">Vendeur</Label>
            <Input
              id="store-vendor"
              name="vendor"
              placeholder="Nom du vendeur (optionnel)"
              className="w-full text-base py-2"
            />
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              className="w-full sm:w-auto"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white w-full sm:w-auto"
            >
              Créer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );

  // Fonctions pour la sélection multiple
  const handleSelectStore = (storeId: string) => {
    setSelectedStores((prev) =>
      prev.includes(storeId)
        ? prev.filter((id) => id !== storeId)
        : [...prev, storeId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStores.length === stores.length) {
      setSelectedStores([]);
    } else {
      setSelectedStores(stores.map((store) => store._id));
    }
  };

  // const handleBulkAction = async (
  //   action: "activate" | "deactivate" | "delete"
  // ) => {
  //   if (selectedStores.length === 0) return;

  //   try {
  //     const confirmMessage =
  //       action === "activate"
  //         ? `Activer ${selectedStores.length} boutique(s) ?`
  //         : action === "deactivate"
  //           ? `Désactiver ${selectedStores.length} boutique(s) ?`
  //           : `Supprimer ${selectedStores.length} boutique(s) ? Cette action est irréversible.`;

  //     if (!confirm(confirmMessage)) return;

  //     // TODO: Implémenter les actions en lot via API
  //     for (const storeId of selectedStores) {
  //       if (action === "activate" || action === "deactivate") {
  //         await handleActivationToggle(storeId, action === "activate");
  //       }
  //       // Pour delete, il faudrait implémenter l'API correspondante
  //     }

  //     setSelectedStores([]);
  //     // setShowBulkActions(false);
  //     toast.success(
  //       `Action "${action}" appliquée à ${selectedStores.length} boutique(s)`
  //     );
  //   } catch (error) {
  //     console.error("Erreur lors de l'action en lot:", error);
  //     toast.error("Erreur lors de l'action en lot");
  //   }
  // };

  return (
    <AdminGuard>
      <div className="px-2 py-4 sm:px-4 sm:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Gestion des Boutiques
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Administration complète des boutiques de la plateforme
            <span className="block text-sm text-gray-500 mt-1">
              {loading
                ? "Chargement..."
                : `${stores.length} boutique${stores.length > 1 ? "s" : ""} affichée${stores.length > 1 ? "s" : ""}`}
            </span>
          </p>
        </motion.div>
        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatCard
            title="Total Boutiques"
            value={stats.totalStores}
            icon={<StoreIcon />}
            color="blue"
          />
          <StatCard
            title="Actives"
            value={stats.activeStores}
            icon={<CheckCircle />}
            color="green"
          />
          <StatCard
            title="En Attente"
            value={stats.pendingStores}
            icon={<Clock />}
            color="yellow"
          />
          <StatCard
            title="Suspendues"
            value={stats.suspendedStores}
            icon={<XCircle />}
            color="red"
          />
          <StatCard
            title="Chiffre d'Affaires"
            value={stats.totalRevenue}
            subtitle="€"
            icon={<TrendingUp />}
            color="purple"
          />
        </motion.div>{" "}
        {/* Actions, Filtres et Contrôles */}
        <motion.div
          className="space-y-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {/* Ligne 1: Recherche, Filtres, Actions */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher une boutique..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full sm:w-auto text-base py-2"
              />
            </div>

            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="active">Actives</SelectItem>
                  <SelectItem value="inactive">Inactives</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="approved">Approuvées</SelectItem>
                  <SelectItem value="rejected">Rejetées</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 whitespace-nowrap w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle Boutique
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="whitespace-nowrap w-full sm:w-auto"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtres avancés
              </Button>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("csv")}
                  disabled={isExporting || stores.length === 0}
                  className="whitespace-nowrap w-full sm:w-auto"
                >
                  <Download className="h-3 w-3 mr-1" />
                  {isExporting ? "Export..." : "CSV"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("json")}
                  disabled={isExporting || stores.length === 0}
                  className="whitespace-nowrap w-full sm:w-auto"
                >
                  <Download className="h-3 w-3 mr-1" />
                  {isExporting ? "Export..." : "JSON"}
                </Button>
              </div>
            </div>
          </div>
          {/* Filtres avancés (conditionnels) */}
          {showAdvancedFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Filtres avancés
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDateFilter("all");
                    setThemeFilter("all");
                    setVendorFilter("all");
                    setSearchField("all");
                    setSearchQuery("");
                    setStatusFilter("all");
                    toast.success("Filtres réinitialisés");
                  }}
                  className="text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Réinitialiser
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {" "}
                {/* Filtre par date */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Période de création
                  </Label>
                  <Select
                    value={dateFilter}
                    onValueChange={(value: string) => {
                      setDateFilter(
                        value as "all" | "today" | "week" | "month" | "year"
                      );
                    }}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Toutes les dates" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les dates</SelectItem>
                      <SelectItem value="today">Aujourd&apos;hui</SelectItem>
                      <SelectItem value="week">Cette semaine</SelectItem>
                      <SelectItem value="month">Ce mois</SelectItem>
                      <SelectItem value="year">Cette année</SelectItem>
                    </SelectContent>
                  </Select>
                </div>{" "}
                {/* Filtre par thème */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Thème
                  </Label>
                  <Select value={themeFilter} onValueChange={setThemeFilter}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Tous les thèmes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les thèmes</SelectItem>
                      {Array.from(
                        new Set(
                          allStores
                            .map((store) => store.homeTheme)
                            .filter(Boolean)
                        )
                      ).map((theme) => (
                        <SelectItem
                          key={theme}
                          value={theme!}
                          className="capitalize"
                        >
                          {typeof theme === "string" ? theme : "Thème inconnu"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Filtre par vendeur */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Vendeur
                  </Label>
                  <Select value={vendorFilter} onValueChange={setVendorFilter}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Tous les vendeurs" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les vendeurs</SelectItem>
                      <SelectItem value="none">Sans vendeur</SelectItem>
                      {Array.from(
                        new Set(
                          allStores
                            .map((store) => store.vendorName)
                            .filter(Boolean)
                        )
                      ).map((vendor) => (
                        <SelectItem key={vendor} value={vendor!}>
                          {typeof vendor === "string"
                            ? vendor
                            : "Vendeur inconnu"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>{" "}
                {/* Recherche avancée */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Recherche dans
                  </Label>
                  <Select value={searchField} onValueChange={setSearchField}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Tous les champs" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les champs</SelectItem>
                      <SelectItem value="name">Nom uniquement</SelectItem>
                      <SelectItem value="description">
                        Description uniquement
                      </SelectItem>
                      <SelectItem value="vendor">Vendeur uniquement</SelectItem>
                      <SelectItem value="theme">Thème uniquement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>{" "}
              {/* Résumé des filtres actifs */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                  Filtres actifs:
                </span>
                {dateFilter !== "all" && (
                  <Badge variant="secondary" className="text-xs">
                    Période:{" "}
                    {typeof dateFilter === "string" ? dateFilter : "Inconnue"}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-1 p-0 w-3 h-3"
                      onClick={() => setDateFilter("all")}
                    >
                      ×
                    </Button>
                  </Badge>
                )}
                {themeFilter !== "all" && (
                  <Badge variant="secondary" className="text-xs capitalize">
                    Thème:{" "}
                    {typeof themeFilter === "string" ? themeFilter : "Inconnu"}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-1 p-0 w-3 h-3"
                      onClick={() => setThemeFilter("all")}
                    >
                      ×
                    </Button>
                  </Badge>
                )}
                {vendorFilter !== "all" && (
                  <Badge variant="secondary" className="text-xs">
                    Vendeur:{" "}
                    {vendorFilter === "none" ? "Sans vendeur" : vendorFilter}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-1 p-0 w-3 h-3"
                      onClick={() => setVendorFilter("all")}
                    >
                      ×
                    </Button>
                  </Badge>
                )}
                {searchField !== "all" && (
                  <Badge variant="secondary" className="text-xs">
                    Recherche:{" "}
                    {typeof searchField === "string" ? searchField : "Inconnue"}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-1 p-0 w-3 h-3"
                      onClick={() => setSearchField("all")}
                    >
                      ×
                    </Button>
                  </Badge>
                )}
              </div>
            </motion.div>
          )}{" "}
          {/* Ligne 2: Vue, Tri, Pagination */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
              {/* Sélecteur de vue */}
              <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <Button
                  size="sm"
                  variant={viewType === "table" ? "default" : "ghost"}
                  onClick={() => setViewType("table")}
                  className="px-2 sm:px-3"
                >
                  <TableIcon className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Table</span>
                </Button>
                <Button
                  size="sm"
                  variant={viewType === "cards" ? "default" : "ghost"}
                  onClick={() => setViewType("cards")}
                  className="px-2 sm:px-3"
                >
                  <Grid className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Cartes</span>
                </Button>
                <Button
                  size="sm"
                  variant={viewType === "list" ? "default" : "ghost"}
                  onClick={() => setViewType("list")}
                  className="px-2 sm:px-3"
                >
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Liste</span>
                </Button>
              </div>

              {/* Tri */}
              <div className="flex items-center gap-2">
                <Select
                  value={sortBy}
                  onValueChange={(value) => setSortBy(value as "name" | "createdAt" | "vendorName")}
                >
                  <SelectTrigger className="w-32 sm:w-40">
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Date de création</SelectItem>
                    <SelectItem value="name">Nom</SelectItem>
                    <SelectItem value="vendorName">Vendeur</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  className="px-2"
                >
                  {sortOrder === "asc" ? (
                    <ArrowUp className="h-4 w-4" />
                  ) : (
                    <ArrowDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Informations et pagination */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 order-2 sm:order-1">
                <span className="hidden sm:inline">
                  Affichage de {(currentPage - 1) * itemsPerPage + 1} à{" "}
                  {Math.min(
                    currentPage * itemsPerPage,
                    getTotalFilteredItems()
                  )}{" "}
                  sur {getTotalFilteredItems()} résultat
                  {getTotalFilteredItems() > 1 ? "s" : ""}
                </span>
                <span className="sm:hidden">
                  {(currentPage - 1) * itemsPerPage + 1}-
                  {Math.min(
                    currentPage * itemsPerPage,
                    getTotalFilteredItems()
                  )}{" "}
                  / {getTotalFilteredItems()}
                </span>
                {getTotalFilteredItems() !== allStores.length && (
                  <span className="text-gray-400 dark:text-gray-500 hidden sm:inline">
                    {" "}
                    (filtré sur {allStores.length} total)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 order-1 sm:order-2">
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">
                  Par page:
                </span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-16 sm:w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Pagination */}
              <div className="flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2 order-3 w-full sm:w-auto">
                <div className="flex flex-col sm:flex-row items-stretch justify-center sm:justify-start space-y-2 sm:space-y-0 sm:space-x-2 order-3 w-full sm:w-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="hidden md:flex px-2 sm:px-3 w-full sm:w-auto"
                  >
                    Premier
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-2 sm:px-3 w-full sm:w-auto"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden lg:inline ml-1">Précédent</span>
                  </Button>
                  <div className="flex items-center space-x-1 w-full sm:w-auto">
                    {/* Pagination avec numéros de page */}
                    {Array.from(
                      { length: Math.min(5, getTotalPages()) },
                      (_, i) => {
                        const totalPages = getTotalPages();
                        let pageNumber;
                        if (totalPages <= 5) {
                          pageNumber = i + 1;
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + i;
                        } else {
                          pageNumber = currentPage - 2 + i;
                        }
                        // Masquer certains boutons sur mobile
                        const isHiddenOnMobile = i === 0 || i === 4;
                        return (
                          <Button
                            key={`page-${i}-${pageNumber}`}
                            size="sm"
                            variant={
                              currentPage === pageNumber ? "default" : "outline"
                            }
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`h-7 sm:h-8 p-0 text-xs sm:text-sm w-full sm:w-auto ${
                              isHiddenOnMobile ? "hidden sm:flex" : "flex"
                            }`}
                          >
                            {pageNumber}
                          </Button>
                        );
                      }
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setCurrentPage(Math.min(getTotalPages(), currentPage + 1))
                    }
                    disabled={currentPage === getTotalPages()}
                    className="px-2 sm:px-3 w-full sm:w-auto"
                  >
                    <span className="hidden lg:inline mr-1">Suivant</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(getTotalPages())}
                    disabled={currentPage === getTotalPages()}
                    className="hidden md:flex px-2 sm:px-3 w-full sm:w-auto"
                  >
                    Dernier
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>{" "}
        {/* Contenu des boutiques */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {" "}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <span className="ml-4 text-gray-600 dark:text-gray-300">
                Chargement des boutiques...
              </span>
            </div>
          ) : stores.length === 0 ? (
            <div className="text-center py-12">
              <StoreIcon className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Aucune boutique trouvée
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery || statusFilter !== "all"
                  ? "Aucune boutique ne correspond à vos critères de recherche."
                  : "Commencez par créer votre première boutique."}
              </p>
              {!searchQuery && statusFilter === "all" && (
                <Button
                  className="mt-4"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Créer une boutique
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Vue Tableau */}
              {viewType === "table" && (
                <GlassMorphismCard className="overflow-x-auto">
                  <div className="overflow-x-auto min-w-[600px]">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-200 dark:border-gray-700">
                          <TableHead className="w-12">
                            <input
                              type="checkbox"
                              checked={
                                selectedStores.length === stores.length &&
                                stores.length > 0
                              }
                              onChange={handleSelectAll}
                              className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                              title="Sélectionner/désélectionner toutes les boutiques"
                              aria-label="Sélectionner toutes les boutiques"
                            />
                          </TableHead>
                          <TableHead className="min-w-[200px] w-auto">
                            <Button
                              variant="ghost"
                              onClick={() => handleSort("name")}
                              className="h-auto p-0 font-semibold text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              Store (Home)
                              {getSortIcon("name")}
                            </Button>
                          </TableHead>
                          <TableHead className="text-gray-900 dark:text-gray-100 hidden md:table-cell">
                            Thème
                          </TableHead>
                          <TableHead className="hidden sm:table-cell">
                            <Button
                              variant="ghost"
                              onClick={() => handleSort("vendorName")}
                              className="h-auto p-0 font-semibold text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              Vendeur
                              {getSortIcon("vendorName")}
                            </Button>
                          </TableHead>
                          <TableHead className="text-gray-900 dark:text-gray-100">
                            Statut
                          </TableHead>
                          <TableHead className="text-gray-900 dark:text-gray-100 hidden lg:table-cell">
                            Activation
                          </TableHead>
                          <TableHead className="hidden xl:table-cell">
                            <Button
                              variant="ghost"
                              onClick={() => handleSort("createdAt")}
                              className="h-auto p-0 font-semibold text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              Date création
                              {getSortIcon("createdAt")}
                            </Button>
                          </TableHead>
                          <TableHead className="text-gray-900 dark:text-gray-100 w-24">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stores.map((store, index) => (
                          <TableRow
                            key={store._id || `store-${index}`}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700"
                          >
                            <TableCell>
                              <input
                                type="checkbox"
                                checked={selectedStores.includes(store._id)}
                                onChange={() => handleSelectStore(store._id)}
                                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                                title={`Sélectionner ${store.name || store.homeName}`}
                                aria-label={`Sélectionner la boutique ${store.name || store.homeName}`}
                              />
                            </TableCell>
                            <TableCell className="min-w-[200px]">
                              <div className="flex items-center gap-3">
                                <Image
                                  src={store.logo || "/default-store-logo.png"}
                                  alt={store.name || "Store"}
                                  width={32}
                                  height={32}
                                  className="rounded border border-gray-200 dark:border-gray-700 bg-white"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    if (
                                      target.src !==
                                      window.location.origin +
                                        "/default-store-logo.png"
                                    ) {
                                      target.src = "/default-store-logo.png";
                                    }
                                  }}
                                  unoptimized
                                />
                                <div>
                                  <div
                                    className="font-semibold text-gray-900 dark:text-gray-100 [text-shadow:0_1px_2px_rgba(255,255,255,0.7),0_1px_2px_rgba(0,0,0,0.2)] [color:var(--store-title-color,#1e293b)]"
                                  >
                                    {store.name || store.homeName}
                                  </div>
                                  {/* Catégories */}
                                  {store.categories &&
                                    store.categories.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {store.categories.map((cat) => (
                                          <Badge
                                            key={cat._id}
                                            variant="secondary"
                                            className="text-xs"
                                          >
                                            {cat.name}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Badge variant="outline" className="text-xs">
                                {store.homeTheme || "Aucun thème"}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <span className="flex items-center">
                                <Users className="w-4 h-4 mr-1" />
                                {store.vendorName || "Aucun vendeur"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  store.vendorStatus === "approved"
                                    ? "default"
                                    : store.vendorStatus === "pending"
                                      ? "secondary"
                                      : store.vendorStatus === "rejected"
                                        ? "destructive"
                                        : "outline"
                                }
                              >
                                {store.vendorStatus === "approved"
                                  ? "Approuvée"
                                  : store.vendorStatus === "pending"
                                    ? "En attente"
                                    : store.vendorStatus === "rejected"
                                      ? "Rejetée"
                                      : "Aucun"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  store.isActive ? "default" : "secondary"
                                }
                              >
                                {store.isActive ? "Actif" : "Inactif"}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden xl:table-cell">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {store.createdAt
                                  ? new Date(
                                      store.createdAt
                                    ).toLocaleDateString("fr-FR")
                                  : "N/A"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedStore(store);
                                    setIsEditModalOpen(true);
                                  }}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant={
                                    store.isActive ? "destructive" : "default"
                                  }
                                  onClick={() =>
                                    handleActivationToggle(
                                      store._id,
                                      !store.isActive
                                    )
                                  }
                                >
                                  {store.isActive ? (
                                    <XCircle className="w-4 h-4" />
                                  ) : (
                                    <CheckCircle className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </GlassMorphismCard>
              )}
              {/* Vue Cartes */}
              {viewType === "cards" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {" "}
                  {stores.map((store, index) => (
                    <StoreCard
                      key={store._id || `store-card-${index}`}
                      store={store}
                    />
                  ))}
                </div>
              )}
              {/* Vue Liste */}
              {viewType === "list" && (
                <div className="space-y-4">
                  {" "}
                  {stores.map((store, index) => (
                    <StoreListItem
                      key={store._id || `store-list-${index}`}
                      store={store}
                    />
                  ))}
                </div>
              )}{" "}
            </>
          )}
        </motion.div>
        {/* Modales */}
        <StoreDetailsModal />
        <CreateStoreModal />
      </div>
    </AdminGuard>
  );
};

export default AdminStoresManagement;
