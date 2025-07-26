"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShoppingCart,
  Heart,
  Star,
  Eye,
  RotateCcw,
  Box,
  Zap,
  Share2,
  Plus,
  Minus,
  Loader2,
  AlertCircle,
  Filter,
  Search,
  Grid,
  List,
  SortAsc,
  SortDesc,
} from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Interfaces TypeScript
interface Product {
  id: string;
  name: string;
  title: string;
  description: string;
  price: number;
  comparePrice?: number;
  discountPercentage?: number;
  images: string[];
  category: string;
  categoryId?: string;
  sku: string;
  stock: number;
  quantity: number;
  averageRating: number;
  totalReviews: number;
  tags: string[];
  status: string;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  vendorName?: string;
  storeName?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductsResponse {
  success: boolean;
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  stats: {
    totalProducts: number;
    activeProducts: number;
    inactiveProducts: number;
    draftProducts: number;
    totalValue: number;
    avgPrice: number;
    totalStock: number;
    lowStockCount: number;
  };
  filters: {
    categories: Array<{
      id: string;
      name: string;
      slug: string;
      count: number;
    }>;
    stores: Array<{
      id: string;
      name: string;
      slug: string;
    }> | null;
    statuses: string[];
  };
}

// Composant Skeleton simple
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

// Composant ProductCard
const ProductCard: React.FC<{ 
  product: Product; 
  onSelect: (product: Product) => void;
  viewMode: 'grid' | 'list';
}> = ({ product, onSelect, viewMode }) => {
  const discount = product.comparePrice 
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : product.discountPercentage || 0;

  const cardClass = viewMode === 'list' 
    ? 'flex flex-row gap-4 p-4'
    : 'flex flex-col p-4';

  const imageClass = viewMode === 'list'
    ? 'w-24 h-24 flex-shrink-0'
    : 'aspect-square mb-3';

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onSelect(product)}
    >
      <CardContent className={cardClass}>
        <div className={`${imageClass} bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center`}>
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/placeholder.svg';
              }}
            />
          ) : (
            <Box className="h-8 w-8 text-gray-400" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold truncate text-sm">
              {product.name || product.title}
            </h3>
            <Badge 
              className={`ml-2 flex-shrink-0 text-xs ${
                product.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : product.status === 'draft'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {product.status}
            </Badge>
          </div>
          
          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
            {product.description}
          </p>
          
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={`star-${product.id}-${i}`}
                className={`h-3 w-3 ${
                  i < Math.floor(product.averageRating || 0)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"
                }`}
              />
            ))}
            <span className="text-xs text-gray-500 ml-1">
              ({product.totalReviews || 0})
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-primary text-sm">
                {product.price.toFixed(2)} €
              </span>
              {product.comparePrice && (
                <>
                  <span className="text-xs text-gray-500 line-through">
                    {product.comparePrice.toFixed(2)} €
                  </span>
                  <Badge className="bg-red-100 text-red-800 text-xs">
                    -{discount}%
                  </Badge>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              <span className={`text-xs ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                Stock: {product.stock}
              </span>
            </div>
          </div>
          
          {viewMode === 'list' && (
            <div className="mt-2 flex flex-wrap gap-1">
              {product.tags.slice(0, 3).map((tag, index) => (
                <Badge key={`tag-${product.id}-${index}`} className="bg-gray-100 text-gray-700 text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Composant de filtres
const ProductFilters: React.FC<{
  filters: ProductsResponse['filters'];
  activeFilters: {
    category: string;
    status: string;
    search: string;
  };
  onFilterChange: (filters: any) => void;
}> = ({ filters, activeFilters, onFilterChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Filtres</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recherche */}
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">
            Recherche
          </label>
          <div className="relative">
            <Search className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={activeFilters.search}
              onChange={(e) => onFilterChange({ ...activeFilters, search: e.target.value })}
              className="w-full pl-8 pr-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Catégories */}
        {filters.categories && filters.categories.length > 0 && (
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">
              Catégorie
            </label>            <select
              value={activeFilters.category}
              onChange={(e) => onFilterChange({ ...activeFilters, category: e.target.value })}
              className="w-full text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              aria-label="Filtrer par catégorie"
            >
              <option value="">Toutes les catégories</option>
              {filters.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.count})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Statut */}
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">
            Statut
          </label>          <select
            value={activeFilters.status}
            onChange={(e) => onFilterChange({ ...activeFilters, status: e.target.value })}
            className="w-full text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            aria-label="Filtrer par statut"
          >
            <option value="">Tous les statuts</option>
            {filters.statuses.map((status) => (
              <option key={status} value={status}>
                {status === 'active' ? 'Actif' : status === 'draft' ? 'Brouillon' : 'Inactif'}
              </option>
            ))}
          </select>
        </div>
      </CardContent>
    </Card>
  );
};

// Composant ProductDetail
const ProductDetail: React.FC<{ 
  product: Product; 
  onClose: () => void;
}> = ({ product, onClose }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const discount = product.comparePrice 
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : product.discountPercentage || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Détails du produit</h2>
          <Button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ×
          </Button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Images */}
            <div>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[selectedImageIndex] || '/images/placeholder.svg'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/placeholder.svg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Box className="h-24 w-24 text-gray-400" />
                  </div>
                )}
              </div>
              
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {product.images.map((image, index) => (
                    <button
                      key={`detail-thumb-${index}`}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg border-2 overflow-hidden ${
                        selectedImageIndex === index ? "border-blue-500" : "border-transparent"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/placeholder.svg';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Informations */}
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold mb-2">{product.name || product.title}</h1>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={`detail-star-${i}`}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.averageRating || 0)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-1">
                      {product.averageRating || 0} ({product.totalReviews || 0} avis)
                    </span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    {product.category}
                  </Badge>
                </div>
              </div>

              {/* Prix */}
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-blue-600">
                  {product.price.toFixed(2)} €
                </span>
                {product.comparePrice && (
                  <>
                    <span className="text-lg text-gray-500 line-through">
                      {product.comparePrice.toFixed(2)} €
                    </span>
                    <Badge className="bg-red-100 text-red-800">
                      -{discount}%
                    </Badge>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600">{product.description}</p>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Étiquettes</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <Badge key={`detail-tag-${index}`} className="bg-gray-100 text-gray-700">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantité */}
              <div>
                <h3 className="font-medium mb-2">Quantité</h3>
                <div className="flex items-center gap-3">
                  <Button
                    className="border border-gray-300 hover:bg-gray-50"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center">{quantity}</span>
                  <Button
                    className="border border-gray-300 hover:bg-gray-50"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Stock */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    product.stock > 10
                      ? "bg-green-500"
                      : product.stock > 0
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                />
                <span className="text-sm text-gray-600">
                  {product.stock > 10
                    ? "En stock"
                    : product.stock > 0
                      ? `Plus que ${product.stock} en stock`
                      : "Rupture de stock"}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Ajouter au panier
                </Button>
                <Button className="border border-gray-300 hover:bg-gray-50">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button className="border border-gray-300 hover:bg-gray-50">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Détails techniques */}
              <div className="border-t pt-4 space-y-2">
                <h3 className="font-medium">Informations produit</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">SKU:</span>
                    <span className="ml-2">{product.sku}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Statut:</span>
                    <span className="ml-2">{product.status}</span>
                  </div>
                  {product.vendorName && (
                    <div className="col-span-2">
                      <span className="text-gray-600">Vendeur:</span>
                      <span className="ml-2">{product.vendorName}</span>
                    </div>
                  )}
                  {product.storeName && (
                    <div className="col-span-2">
                      <span className="text-gray-600">Boutique:</span>
                      <span className="ml-2">{product.storeName}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant principal
export default function DynamicProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<ProductsResponse['pagination'] | null>(null);
  const [stats, setStats] = useState<ProductsResponse['stats'] | null>(null);
  const [filters, setFilters] = useState<ProductsResponse['filters'] | null>(null);
  const [activeFilters, setActiveFilters] = useState({
    category: '',
    status: '',
    search: '',
  });

  useEffect(() => {
    fetchProducts();
  }, [currentPage, sortBy, sortOrder, activeFilters]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchProducts();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [activeFilters.search]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        sortBy,
        sortOrder,
        ...(activeFilters.category && { category: activeFilters.category }),
        ...(activeFilters.status && { status: activeFilters.status }),
        ...(activeFilters.search && { search: activeFilters.search }),
      });

      const response = await fetch(`/api/products?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ProductsResponse = await response.json();
      
      if (data.success) {
        setProducts(data.products);
        setPagination(data.pagination);
        setStats(data.stats);
        setFilters(data.filters);
      } else {
        setError('Erreur lors de la récupération des produits');
      }
    } catch (err) {
      console.error('Erreur lors du chargement des produits:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: typeof activeFilters) => {
    setActiveFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSortChange = (newSortBy: string) => {
    if (newSortBy === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  if (loading && products.length === 0) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-10 w-48" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={`skeleton-${i}`}>
                    <CardContent className="p-4">
                      <Skeleton className="aspect-square mb-3" />
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2 mb-2" />
                      <Skeleton className="h-6 w-1/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Card>
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Erreur de chargement</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchProducts} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Loader2 className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Produits</h1>
            <p className="text-gray-600 mt-1">
              Gérez votre catalogue de produits
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="border border-gray-300 hover:bg-gray-50">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau produit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Créer un nouveau produit</DialogTitle>
                </DialogHeader>
                <div className="p-6">
                  <p className="text-center text-muted-foreground">
                    Fonctionnalité de création de produit en cours de développement.
                    <br />
                    Utilisez temporairement la page{" "}
                    <Link href="/e-commerce/add-product" className="text-blue-600 hover:underline">
                      Ajouter un produit
                    </Link>
                    .
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total produits</p>
                    <p className="text-2xl font-bold">{stats.totalProducts}</p>
                  </div>
                  <Box className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Produits actifs</p>
                    <p className="text-2xl font-bold text-green-600">{stats.activeProducts}</p>
                  </div>
                  <Eye className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Stock faible</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.lowStockCount}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Valeur totale</p>
                    <p className="text-2xl font-bold">{stats.totalValue.toFixed(0)} €</p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filtres */}
          <div className="lg:col-span-1">
            {filters && (
              <ProductFilters
                filters={filters}
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
              />
            )}
          </div>

          {/* Liste des produits */}
          <div className="lg:col-span-3">
            {/* Barre d'outils */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Button
                  className={`border ${viewMode === 'grid' ? 'bg-blue-50 border-blue-300' : 'border-gray-300 hover:bg-gray-50'}`}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  className={`border ${viewMode === 'list' ? 'bg-blue-50 border-blue-300' : 'border-gray-300 hover:bg-gray-50'}`}
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  aria-label="Trier les produits par"
                >
                  <option value="createdAt">Date de création</option>
                  <option value="name">Nom</option>
                  <option value="price">Prix</option>
                  <option value="stock">Stock</option>
                  <option value="averageRating">Note</option>
                </select>
                
                <Button
                  className="border border-gray-300 hover:bg-gray-50"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Grille/Liste des produits */}
            {products.length > 0 ? (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                  : 'space-y-4'
              }>
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={setSelectedProduct}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Box className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucun produit trouvé</h3>
                  <p className="text-gray-600">
                    {activeFilters.search || activeFilters.category || activeFilters.status
                      ? 'Aucun produit ne correspond à vos critères de recherche.'
                      : 'Vous n\'avez pas encore de produits dans votre catalogue.'}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Affichage de {((pagination.page - 1) * pagination.limit) + 1} à{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} sur{' '}
                  {pagination.total} produits
                </p>
                
                <div className="flex items-center gap-2">
                  <Button
                    className="border border-gray-300 hover:bg-gray-50"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={!pagination.hasPrevPage || loading}
                  >
                    Précédent
                  </Button>
                  
                  <span className="text-sm">
                    Page {pagination.page} sur {pagination.totalPages}
                  </span>
                  
                  <Button
                    className="border border-gray-300 hover:bg-gray-50"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!pagination.hasNextPage || loading}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal de détail produit */}
        {selectedProduct && (
          <ProductDetail
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
