// src/app/stores/page.tsx (or the correct path for your stores page)

"use client";

import { useState, useEffect, createContext, useContext } from "react"; // Added context import as it might be useful later
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-toastify"; // Import correctly
import "react-toastify/dist/ReactToastify.css";
import {
  Package,
  Users,
  Store as StoreIcon,
  Plus,
  Search,
  Star,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import Image from "next/image";
import Link from "next/link";

// Déclaration locale du type Address pour éviter l'erreur TS
export interface Address {
  firstName?: string | null;
  lastName?: string | null;
  state?: string;
  address1?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
}

// Helper function to get plan badge
const getPlanBadge = (plan: string) => {
  const variants: Record<string, { label: string; className: string }> = {
    free: {
      label: "Gratuit",
      className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
    },
    basic: {
      label: "Basique",
      className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    },
    premium: {
      label: "Premium",
      className: "bg-purple-100 text-purple-800 hover:bg-purple-100",
    },
    enterprise: {
      label: "Entreprise",
      className: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100",
    },
  };

  const { label, className } =
    variants[plan as keyof typeof variants] || variants.free; // Default to free if plan is unknown

  return <Badge className={`text-xs font-medium ${className}`}>{label}</Badge>;
};

// Helper function to get status badge
const getStatusBadge = (store: Store) => {
  const statusKey = store.isActive ? "active" : "inactive"; // Assumes Store type has isActive boolean
  const variants = {
    active: {
      label: "Actif",
      className: "bg-green-100 text-green-800 hover:bg-green-100",
    },
    inactive: {
      label: "Inactif",
      className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    },
  };
  const { label, className } = variants[statusKey];

  return <Badge className={`text-xs font-medium ${className}`}>{label}</Badge>;
};

function StoresPage() {
  const { data: session } = useSession();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true); // For initial load
  const [isLoadingPagination, setIsLoadingPagination] = useState(false); // For pagination/filter loads
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // 'all', 'active', 'inactive', 'Free', 'Basic', 'Premium'
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Pagination states
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(12); // Default items per page
  const [pagination, setPagination] = useState<{
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  }>({ total: 0, totalPages: 1, page: 1, limit: 12 });

  // State for vendors (for admin when creating a store)
  const [vendors, setVendors] = useState<Vendor[]>([]);

  // Initial state for a new store creation
  const initialNewStoreState: Partial<Store> = {
    name: "",
    description: "",
    // 'category' removed as it was causing TS error and not used in backend POST logic
    owner: session?.user?.role === "admin" ? "" : session?.user?.id || "", // Owner can be selected by admin, or defaults to logged-in vendor
    contact: {
      email: session?.user?.email || "", // Pre-fill with session email if available
      phone: "",
      address: {
        firstName: ('firstName' in (session?.user ?? {}) ? (session?.user as any).firstName : ""),
        lastName: ('lastName' in (session?.user ?? {}) ? (session?.user as any).lastName : ""),
        state: "",
        address1: "",
        city: "",
        postalCode: "",
        country: "",
        isDefault: true,
      },
    },
    subscription: {
      plan: "free", // Default plan
      limits: { maxProducts: 10, maxStorage: 1000, maxOrders: 50 }, // Default limits
    },
  };
  const [newStore, setNewStore] = useState<Partial<Store>>(initialNewStoreState);

  // Fetch vendors if the user is an admin
  useEffect(() => {
    const fetchVendors = async () => {
      if (session?.user?.role === "admin") {
        try {
          const response = await fetch('/api/vendors'); // Assuming an endpoint /api/vendors exists
          const data = await response.json();
          // Assuming the response structure is { success: true, data: Vendor[] }
          if (data.success && Array.isArray(data.data)) {
            setVendors(data.data);
          } else {
            console.error("Erreur lors du chargement des vendeurs:", data.error);
            toast.error("Erreur lors du chargement des vendeurs");
            setVendors([]); // Ensure vendors remains an array
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des vendeurs:", error);
          toast.error("Impossible de récupérer les vendeurs.");
          setVendors([]); // Ensure vendors remains an array
        }
      }
    };
    fetchVendors();
  }, [session]);

  // Fetch stores based on filters, pagination, and search query
  useEffect(() => {
    const fetchStores = async () => {
      // Determine which loading state to use
      if (page === 1 && !searchQuery && activeFilter === "all") {
          setLoading(true); // Initial load
      } else {
          setIsLoadingPagination(true); // Pagination, filter, or search change
      }

      try {
        const params = new URLSearchParams();

        // Always add pagination parameters
        params.set('page', String(page));
        params.set('limit', String(limit));

        // Add search query if present
        if (searchQuery) {
          params.set('search', searchQuery);
        }

        // Add filtering parameters only if the filter is not 'all'
        if (activeFilter !== "all") {
          if (activeFilter === "active") {
            params.set('isActive', 'true');
          } else if (activeFilter === "inactive") {
            params.set('isActive', 'false');
          } else if (["Free", "Basic", "Premium"].includes(activeFilter)) {
            // Assuming your backend uses a 'plan' query parameter for these
            params.set('plan', activeFilter.toLowerCase());
          }
          // If you have other category filters that map to query params, add them here.
        }

        // Construct the URL to the base /api/stores endpoint
        const url = `/api/stores?${params.toString()}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
          setStores(Array.isArray(data.data) ? data.data : []);
          // Update pagination state from the response meta data
          setPagination({
            total: data.meta.total,
            totalPages: data.meta.totalPages,
            page: data.meta.page,
            limit: data.meta.limit,
          });
        } else {
          toast.error(data.error || "Erreur lors du chargement des boutiques");
          setStores([]); // Clear stores on error
        }
      } catch (error) {
        console.error("Erreur lors de la fetch des boutiques:", error);
        toast.error("Erreur de connexion");
        setStores([]); // Clear stores on error
      } finally {
        setLoading(false); // Always turn off initial loading
        setIsLoadingPagination(false); // Turn off pagination loading
      }
    };

    fetchStores();
  }, [page, limit, searchQuery, activeFilter]); // Re-fetch when these change

  // Handler for changing filters - resets to page 1
  const handleFilterClick = (filterValue: string) => {
    setActiveFilter(filterValue);
    setPage(1); // Reset to the first page whenever the filter changes
  };

  // Handler for creating a new store
  const handleCreateStore = async () => {
    // Basic validation
    if (!newStore.name || !newStore.description) {
      toast.error("Le nom et la description sont obligatoires.");
      return;
    }
    // Ensure owner is set if not already (e.g., admin created for someone else)
    if (!newStore.owner && session?.user?.role === 'vendor') {
      // If user is a vendor and no owner is set (shouldn't happen with initial state, but for safety)
      setNewStore(prev => ({ ...prev, owner: session.user?.id || "" }));
    } else if (!newStore.owner && session?.user?.role === 'admin') {
        toast.error("Veuillez sélectionner un propriétaire pour la boutique.");
        return;
    }
    // Basic check for owner ID existence after potential updates
    if (!newStore.owner) {
        toast.error("Le propriétaire de la boutique est requis.");
        return;
    }

    try {
      const response = await fetch("/api/stores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newStore),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Boutique créée avec succès");
        // Re-fetch stores to get the new one, or add to state if backend returns the created object
        // For simplicity, we'll rely on the fetch in useEffect, but could also update state directly:
        // setStores((prevStores) => [...prevStores, data.data]);
        // If using re-fetch, ensure page/filters are maintained or reset appropriately
        setPage(1); // Go to first page after creating to see the new item
        setNewStore(initialNewStoreState); // Reset form
        setIsCreateModalOpen(false); // Close modal
      } else {
        toast.error(data.error || "Erreur lors de la création de la boutique");
        if (data.details) {
            console.error("Creation details:", data.details);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la création de la boutique:", error);
      toast.error("Erreur de connexion ou serveur.");
    }
  };

  // Skeleton Loader Component
  const SkeletonCard = ({ index }: { index: number }) => (
    <Card className="h-full flex flex-col animate-pulse">
      <div className="h-40 bg-gray-200 w-full relative rounded-t-lg"></div> {/* Skeleton for banner */}
      <CardContent className="p-4 pt-16 flex-grow flex flex-col justify-between relative"> {/* Adjusted pt for logo, relative for logo positioning */}
        <div className="absolute -top-8 left-4 z-10"> {/* Position for logo */}
            <div className="h-16 w-16 bg-gray-300 rounded-lg border-4 border-background"></div>
        </div>
        <div className="space-y-2 pt-4"> {/* Padding for logo */}
          <div className="h-6 bg-gray-200 rounded w-3/4"></div> {/* Skeleton for name */}
          <div className="h-4 bg-gray-200 rounded w-1/2"></div> {/* Skeleton for description */}
        </div>
        <div className="flex justify-end mt-4">
          <div className="h-8 w-32 bg-gray-200 rounded"></div> {/* Skeleton for button */}
        </div>
      </CardContent>
    </Card>
  );

  // Store Card Component with animation
  const StoreCard = ({ store, index }: { store: Store; index: number }) => (
    <Card
      key={store.id}
      className={`overflow-hidden group hover:shadow-lg transition-all duration-300 ease-in-out
                 ${isLoadingPagination ? '' : 'opacity-0 translate-y-4 animate-fadeInUp'}`}
      style={{
        animationFillMode: 'forwards',
        animationDelay: isLoadingPagination ? '0s' : `${index * 0.05}s` // Apply delay based on index
      }}
    >
      <div className="relative h-40 bg-muted/50">
        <Image
          src={store.bannerUrl || "/images/store-cover.jpg"}
          alt={`Couverture de ${store.name}`}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute -bottom-6 left-4 z-10"> {/* Ensure logo is above gradient */}
          <div className="h-16 w-16 rounded-lg border-4 border-background bg-background overflow-hidden">
            <Image
              src={store.logoUrl || "/images/store-logo.png"}
              alt={`Logo de ${store.name}`}
              width={64}
              height={64}
              className="object-cover h-full w-full"
            />
          </div>
        </div>
        <div className="absolute top-2 right-2 flex gap-1 z-10"> {/* Ensure badges are above */}
          {getStatusBadge(store)}
          {store.isVerified && (
            <Badge
              className="bg-blue-100 text-blue-800 border-blue-200"
            >
              Vérifiée
            </Badge>
          )}
        </div>
      </div>
      <CardContent className="pt-16 flex-grow flex flex-col justify-between"> {/* Adjusted padding to account for logo */}
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-lg font-semibold truncate max-w-[70%]">{store.name}</h3> {/* Truncate long names */}
          {getPlanBadge(store.subscription?.plan || "free")}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 h-10"> {/* Fixed height for description */}
          {store.description || "Aucune description fournie."}
        </p>
        <div className="mt-4 pt-4 border-t flex justify-end">
          <Link href={`/store/${store.slug}`} passHref legacyBehavior>
            {/* Remplacer <Button as="a" ...> par asChild */}
            <Button asChild className="px-3 py-1 text-sm border border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100">
              <a href="#">Lien</a>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );

  // Compute filteredStores here, after we know loading state is handled
  const computedFilteredStores = stores.filter((store) => {
    const searchMatch =
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (store.description || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    // The API is handling `activeFilter` and `searchQuery`
    // So this client-side filter is primarily for the `searchQuery` on the current page's results.
    return searchMatch;
  });

  // --- Main Component Render ---

  if (loading) { // Initial loading state
    return (
      <div className="p-6 space-y-6">
        <div className="h-24 bg-gray-200 rounded-lg animate-pulse"></div> {/* Skeleton for header */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <SkeletonCard key={i} index={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                {session?.user?.role === "admin"
                  ? "Gestion des Boutiques"
                  : "Vos Boutiques"}
              </h1>
              <p className="text-primary-foreground/80 max-w-2xl">
                {session?.user?.role === "admin"
                  ? "Gérez et surveillez toutes les boutiques de la plateforme."
                  : "Créez et gérez votre boutique pour vendre vos produits en ligne."}
              </p>
            </div>
            {/* Create New Store Dialog */}
            <Dialog
              open={isCreateModalOpen}
              onOpenChange={setIsCreateModalOpen}
            >
              <DialogTrigger asChild>
                <Button
                  className="gap-2 bg-background text-foreground hover:bg-background/90 px-6 py-3 text-lg"
                >
                  <Plus className="h-5 w-5" />
                  Nouvelle Boutique
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Créer une nouvelle boutique</DialogTitle>
                  <DialogDescription>
                    Remplissez les informations de base pour commencer.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {/* Store Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom de la boutique</Label>
                    <Input
                      id="name"
                      placeholder="Ma Belle Boutique"
                      value={newStore.name}
                      onChange={(e) =>
                        setNewStore({ ...newStore, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  {/* Store Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Décrivez votre boutique..."
                      rows={3}
                      value={newStore.description}
                      onChange={(e) =>
                        setNewStore({
                          ...newStore,
                          description: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  {/* Owner Selection (Admin only) */}
                  {session?.user?.role === "admin" && (
                    <div className="space-y-2">
                      <Label htmlFor="owner">Propriétaire (Vendeur)</Label>
                      <Select
                        value={newStore.owner}
                        onValueChange={(value: string) =>
                          setNewStore({ ...newStore, owner: value })
                        }
                      >
                        <SelectTrigger id="owner">
                          <SelectValue placeholder="Sélectionner un vendeur" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.isArray(vendors) && vendors.length > 0 ? (
                            vendors.map((vendor) => (
                              <SelectItem key={vendor.id} value={vendor.id}>
                                {vendor.firstName && vendor.lastName
                                  ? `${vendor.firstName} ${vendor.lastName}`
                                  : vendor.name || 'Vendeur sans nom'} ({vendor.email})
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-muted-foreground">Aucun vendeur trouvé.</div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {/* Default Plan Selection (Optional, if you want to set it at creation) */}
                  <div className="space-y-2">
                      <Label htmlFor="plan">Plan par défaut</Label>
                      <Select
                        value={newStore.subscription?.plan}
                        onValueChange={(value: string) =>
                          setNewStore({
                              ...newStore,
                              subscription: { ...newStore.subscription!, plan: value as "free" | "basic" | "premium" | "enterprise" }
                          })
                        }
                      >
                        <SelectTrigger id="plan">
                          <SelectValue placeholder="Sélectionner un plan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Gratuit</SelectItem>
                          <SelectItem value="basic">Basique</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                          <SelectItem value="enterprise">Entreprise</SelectItem>
                        </SelectContent>
                      </Select>
                  </div>
                </div>
                {/* Modal Actions */}
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline" // Use outline for cancel
                    onClick={() => setIsCreateModalOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button onClick={handleCreateStore} disabled={!newStore.name || !newStore.description || !newStore.owner}>
                    Créer la boutique
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6">
        {/* Filter/Search Bar */}
        <div className="bg-background p-4 rounded-lg shadow-sm border mb-8 -mt-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une boutique par nom ou description..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1); // Reset to first page on search input change
                }}
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {/* Filter Buttons */}
              {["all", "active", "inactive", "Free", "Basic", "Premium"].map(
                (filter) => (
                  <Button
                    key={filter}
                    className={`capitalize px-3 py-1 text-sm ${
                      activeFilter === filter
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "border border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => handleFilterClick(filter)} // Use the handler
                  >
                    {filter === "all"
                      ? "Toutes"
                      : filter === "active"
                      ? "Actives"
                      : filter === "inactive"
                      ? "Inactives"
                      : filter}
                  </Button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Admin Stats Cards */}
        {session?.user?.role === "admin" && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
                <StoreIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stores.length}</div> {/* Shows count of currently loaded stores */}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Actives</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stores.filter((s) => s.isActive).length} {/* Count based on currently loaded stores */}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  En attente
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stores.filter((s) => !s.isActive).length} {/* Count based on currently loaded stores */}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Premium</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stores.filter((s) => s.subscription?.plan === "premium").length} {/* Count based on currently loaded stores */}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Produits</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stores.reduce(
                    (acc, store) => acc + (store.stats?.totalProducts || 0),
                    0
                  )} {/* Sum from currently loaded stores */}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Commandes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stores.reduce(
                    (acc, store) => acc + (store.stats?.totalOrders || 0),
                    0
                  )} {/* Sum from currently loaded stores */}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 px-2 py-4 border-t border-b">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Éléments par page :</span>
            <Select value={String(limit)} onValueChange={v => {
                setLimit(Number(v));
                setPage(1); // Reset to first page when limit changes
            }}>
              <SelectTrigger className="w-20 h-9"> {/* Added h-9 for better alignment */}
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[6, 12, 24, 48].map(val => ( // Common options
                  <SelectItem key={val} value={String(val)}>{val}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="h-9 px-3"
              disabled={pagination.page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              <span className="sr-only">Précédent</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m15 18-6-6 6-6"/></svg>
            </Button>
            <span className="text-sm text-muted-foreground">Page {pagination.page} sur {pagination.totalPages}</span>
            <Button
              variant="outline"
              className="h-9 px-3"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
            >
              <span className="sr-only">Suivant</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m9 18 6-6-6-6"/></svg>
            </Button>
          </div>
        </div>

        {/* Stores Grid */}
        {isLoadingPagination ? (
          // Show skeletons while pagination/filters are loading
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <SkeletonCard key={i} index={i} />)}
          </div>
        ) : (
          // Show actual store cards or "no results" message
          computedFilteredStores.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {computedFilteredStores.map((store, index) => ( // Map the computed variable
                <StoreCard key={store.id} store={store} index={index} />
              ))}
            </div>
          ) : (
            // No Stores Found Message
            <div className="col-span-full text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">
                {searchQuery ? "Aucun résultat trouvé" : "Aucune boutique trouvée"}
              </h3>
              <p className="text-muted-foreground mt-1">
                {searchQuery
                  ? "Essayez de modifier vos filtres ou votre recherche."
                  : (session?.user?.role === "admin"
                      ? "Créez votre première boutique pour commencer."
                      : "Contactez l'administrateur pour créer une boutique.")
                }
              </p>
              {/* Action Button */}
              {!searchQuery && session?.user?.role !== "vendor" && (
                <Button
                  className="mt-4"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Créer une boutique
                </Button>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}

// Wrap the page component with the DashboardLayout
export default function StoresPageWithLayout() {
  return (
    <DashboardLayout>
      <StoresPage />
    </DashboardLayout>
  );
}


// Assumed Store type definition in "@/types/index.ts" for reference:
export interface Store {
  id: string;
  name: string;
  slug: string;
  description?: string;
  owner: string; // Vendor ID
  ownerDetails?: User; // Populated User object from backend
  logoUrl?: string;
  bannerUrl?: string;
  contact: {
    email?: string;
    phone?: string;
    address?: Address; // Assuming Address is defined in "@/types/index.ts"
  };
  social: {
    website?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  settings: {
    theme: { primaryColor: string; secondaryColor: string; fontFamily: string };
    business: { currency: string; taxRate: number; shippingCost: number; freeShippingThreshold: number };
    features: { enableReviews: boolean; enableWishlist: boolean; enableComparison: boolean; enableMultiCurrency: boolean };
  };
  stats: {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    averageRating: number;
  };
  subscription: {
    plan: "free" | "basic" | "premium" | "enterprise";
    limits: { maxProducts: number; maxStorage: number; maxOrders: number };
    expiresAt?: Date;
  };
  isActive: boolean; // Mapped from backend's status field
  isVerified: boolean; // Mapped from backend's featured field
  status?: string; // Backend's actual status field ('active', 'inactive', etc.)
  featured?: boolean; // Backend's actual featured field
  createdAt: Date;
  updatedAt: Date;
}

// Assumed User type definition in "@/types/index.ts" for reference:
export interface User {
  id: string;
  name?: string | null;
  firstName?: string | null; // Important for newStore.contact.address
  lastName?: string | null; // Important for newStore.contact.address
  email?: string | null;
  image?: string | null;
  role?: string;
  // ... other user properties
}

// Assumed Vendor type definition (could be an alias for User with specific role)
export type Vendor = User; // If vendor is just a user with a 'vendor' role.
