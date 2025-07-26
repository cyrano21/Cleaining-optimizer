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
import {
  Search,
  Heart,
  ShoppingCart,
  Trash2,
  Star,
  Filter,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Loader2,
  AlertCircle,
  Package,
  Heart as HeartFilled,
} from "lucide-react";

// Interface pour les articles de la wishlist
interface WishlistItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  availability: "in-stock" | "out-of-stock" | "limited";
  category: string;
  dateAdded: string;
  notes?: string;
  priority?: "low" | "medium" | "high";
  productId: string;
  sku: string;
  stock: number;
}

interface WishlistResponse {
  success: boolean;
  items: WishlistItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  stats: {
    totalItems: number;
    inStock: number;
    outOfStock: number;
    limited: number;
  };
}

// Composant pour affichage en grille
const GridView = ({ 
  items, 
  onRemove, 
  onAddToCart 
}: { 
  items: WishlistItem[], 
  onRemove: (id: string) => void,
  onAddToCart: (item: WishlistItem) => void 
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "in-stock":
        return "text-green-600 bg-green-50 border-green-200";
      case "out-of-stock":
        return "text-red-600 bg-red-50 border-red-200";
      case "limited":
        return "text-orange-600 bg-orange-50 border-orange-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <Card key={item.id} className="group hover:shadow-lg transition-all duration-200">
          <div className="relative">
            <div className="aspect-square relative overflow-hidden rounded-t-lg bg-gray-100">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/placeholder.svg";
                }}
              />
              {item.originalPrice && (
                <div className="absolute top-2 left-2">
                  <Badge className="bg-red-500 text-white">
                    -{Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%
                  </Badge>
                </div>
              )}
              <div className="absolute top-2 right-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
                  onClick={() => onRemove(item.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          </div>

          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm line-clamp-2">{item.name}</h3>
                  <p className="text-xs text-muted-foreground">{item.brand}</p>
                </div>
                {item.priority && (
                  <Badge className={`text-xs px-2 py-1 ${getPriorityColor(item.priority)}`}>
                    {item.priority}
                  </Badge>
                )}
              </div>

              <div className="flex items-center space-x-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < Math.floor(item.rating)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  ({item.reviews})
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold">{formatPrice(item.price)}</span>
                  {item.originalPrice && (
                    <span className="text-xs text-muted-foreground line-through ml-2">
                      {formatPrice(item.originalPrice)}
                    </span>
                  )}
                </div>
                <Badge className={`text-xs px-2 py-1 ${getAvailabilityColor(item.availability)}`}>
                  {item.availability === "in-stock" && "En stock"}
                  {item.availability === "out-of-stock" && "Rupture"}
                  {item.availability === "limited" && "Stock limité"}
                </Badge>
              </div>

              {item.notes && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {item.notes}
                </p>
              )}

              <div className="flex space-x-2 pt-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => onAddToCart(item)}
                  disabled={item.availability === "out-of-stock"}
                >
                  <ShoppingCart className="h-3 w-3 mr-1" />
                  Ajouter
                </Button>
              </div>

              <div className="text-xs text-muted-foreground">
                Ajouté le {new Date(item.dateAdded).toLocaleDateString("fr-FR")}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Composant pour affichage en liste
const ListView = ({ 
  items, 
  onRemove, 
  onAddToCart 
}: { 
  items: WishlistItem[], 
  onRemove: (id: string) => void,
  onAddToCart: (item: WishlistItem) => void 
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "in-stock":
        return "text-green-600 bg-green-50 border-green-200";
      case "out-of-stock":
        return "text-red-600 bg-red-50 border-red-200";
      case "limited":
        return "text-orange-600 bg-orange-50 border-orange-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produit</TableHead>
            <TableHead>Marque</TableHead>
            <TableHead>Prix</TableHead>
            <TableHead>Note</TableHead>
            <TableHead>Disponibilité</TableHead>
            <TableHead>Priorité</TableHead>
            <TableHead>Date ajoutée</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 relative rounded-md overflow-hidden bg-gray-100">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/images/placeholder.svg";
                      }}
                    />
                    {item.originalPrice && (
                      <div className="absolute top-0 left-0 bg-red-500 text-white text-xs px-1 rounded-br">
                        -{Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{item.name}</div>
                    <div className="text-xs text-muted-foreground">SKU: {item.sku}</div>
                    {item.notes && (
                      <div className="text-xs text-muted-foreground line-clamp-1 mt-1">
                        {item.notes}
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-sm">{item.brand}</TableCell>
              <TableCell>
                <div>
                  <span className="font-bold">{formatPrice(item.price)}</span>
                  {item.originalPrice && (
                    <div className="text-xs text-muted-foreground line-through">
                      {formatPrice(item.originalPrice)}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < Math.floor(item.rating)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ({item.reviews})
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={`text-xs px-2 py-1 ${getAvailabilityColor(item.availability)}`}>
                  {item.availability === "in-stock" && "En stock"}
                  {item.availability === "out-of-stock" && "Rupture"}
                  {item.availability === "limited" && "Stock limité"}
                </Badge>
                <div className="text-xs text-muted-foreground mt-1">
                  Stock: {item.stock}
                </div>
              </TableCell>
              <TableCell>
                {item.priority && (
                  <Badge className={`text-xs px-2 py-1 ${getPriorityColor(item.priority)}`}>
                    {item.priority}
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-sm">
                {new Date(item.dateAdded).toLocaleDateString("fr-FR")}
              </TableCell>
              <TableCell>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    onClick={() => onAddToCart(item)}
                    disabled={item.availability === "out-of-stock"}
                  >
                    <ShoppingCart className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRemove(item.id)}
                  >
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("dateAdded");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterAvailability, setFilterAvailability] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [stats, setStats] = useState({
    totalItems: 0,
    inStock: 0,
    outOfStock: 0,
    limited: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Fonction pour charger les données de la wishlist
  const fetchWishlistItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        sortOrder,
      });

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      if (filterCategory && filterCategory !== "all") {
        params.append("category", filterCategory);
      }

      if (filterAvailability && filterAvailability !== "all") {
        params.append("availability", filterAvailability);
      }

      const response = await fetch(`/api/wishlist?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: WishlistResponse = await response.json();

      if (data.success) {
        setWishlistItems(data.items);
        setPagination(data.pagination);
        setStats(data.stats);
      } else {
        throw new Error("Erreur lors du chargement de la wishlist");
      }
    } catch (err) {
      console.error("Erreur lors du chargement de la wishlist:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Effet pour charger les données
  useEffect(() => {
    fetchWishlistItems();
  }, [pagination.page, searchTerm, sortBy, sortOrder, filterCategory, filterAvailability]);

  // Fonction pour supprimer un item
  const handleRemoveItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/wishlist?itemId=${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      const data = await response.json();
      if (data.success) {
        setWishlistItems((prev) => prev.filter((item) => item.id !== itemId));
        setStats(prev => ({
          ...prev,
          totalItems: prev.totalItems - 1
        }));
      }
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      setError("Erreur lors de la suppression de l'article");
    }
  };

  // Fonction pour ajouter au panier
  const handleAddToCart = async (item: WishlistItem) => {
    try {
      // TODO: Implémenter l'ajout au panier
      console.log("Ajouter au panier:", item);
      // Optionnel: supprimer de la wishlist après ajout au panier
      // await handleRemoveItem(item.id);
    } catch (err) {
      console.error("Erreur lors de l'ajout au panier:", err);
    }
  };

  // Gestionnaires d'événements
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (type: "category" | "availability", value: string) => {
    if (type === "category") {
      setFilterCategory(value);
    } else {
      setFilterAvailability(value);
    }
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === "desc" ? "asc" : "desc");
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Obtenir les catégories uniques
  const uniqueCategories = [
    ...new Set(wishlistItems.map((item) => item.category)),
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Ma Wishlist</h1>
            <p className="text-muted-foreground">
              {stats.totalItems} produit{stats.totalItems > 1 ? "s" : ""} sauvegardé{stats.totalItems > 1 ? "s" : ""} pour plus tard
            </p>
          </div>
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <HeartFilled className="h-4 w-4 text-pink-500 mr-2" />
                <div>
                  <p className="text-sm font-medium">Total</p>
                  <p className="text-2xl font-bold">{stats.totalItems}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Package className="h-4 w-4 text-green-500 mr-2" />
                <div>
                  <p className="text-sm font-medium">En stock</p>
                  <p className="text-2xl font-bold">{stats.inStock}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-orange-500 mr-2" />
                <div>
                  <p className="text-sm font-medium">Stock limité</p>
                  <p className="text-2xl font-bold">{stats.limited}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                <div>
                  <p className="text-sm font-medium">Rupture</p>
                  <p className="text-2xl font-bold">{stats.outOfStock}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres et recherche */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Rechercher des produits..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex flex-wrap items-center space-x-2 space-y-2 lg:space-y-0">
                <Select value={filterCategory} onValueChange={(value) => handleFilterChange("category", value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    {uniqueCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterAvailability} onValueChange={(value) => handleFilterChange("availability", value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Disponibilité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    <SelectItem value="in-stock">En stock</SelectItem>
                    <SelectItem value="limited">Stock limité</SelectItem>
                    <SelectItem value="out-of-stock">Rupture</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dateAdded">Date ajoutée</SelectItem>
                    <SelectItem value="name">Nom</SelectItem>
                    <SelectItem value="price">Prix</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="sm" onClick={toggleSortOrder}>
                  {sortOrder === "desc" ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contenu principal */}
        {error && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center text-red-600">
                <AlertCircle className="h-4 w-4 mr-2" />
                {error}
              </div>
            </CardContent>
          </Card>
        )}

        {wishlistItems.length === 0 && !loading && (
          <Card>
            <CardContent className="p-8 text-center">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Votre wishlist est vide</h3>
              <p className="text-muted-foreground mb-4">
                Découvrez nos produits et ajoutez vos favoris à votre wishlist
              </p>
              <Button>Parcourir les produits</Button>
            </CardContent>
          </Card>
        )}

        {wishlistItems.length > 0 && (
          <>
            {viewMode === "grid" ? (
              <GridView 
                items={wishlistItems} 
                onRemove={handleRemoveItem} 
                onAddToCart={handleAddToCart} 
              />
            ) : (
              <ListView 
                items={wishlistItems} 
                onRemove={handleRemoveItem} 
                onAddToCart={handleAddToCart} 
              />
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Page {pagination.page} sur {pagination.totalPages} ({pagination.total} produits)
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={!pagination.hasPrevPage}
                      >
                        Précédent
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={!pagination.hasNextPage}
                      >
                        Suivant
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
