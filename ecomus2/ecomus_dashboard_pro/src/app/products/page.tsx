"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Filter, Grid, List, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState("");

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (selectedCategory) params.append("category", selectedCategory);      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();
        console.log("🔍 [FRONTEND] Complete API response:", data); // Debug complete
      
      if (data.success) {
        // The API now returns { success: true, data: [products], products: [products] }
        // We prefer 'data' with fallback to 'products'
        const products = data.data || data.products || [];
        console.log("📦 [FRONTEND] Extracted products:", products.length, "products"); // Debug
        console.log("🔍 [FRONTEND] First product:", products[0]); // Debug
        setProducts(Array.isArray(products) ? products : []);
      } else {
        console.error("❌ [FRONTEND] API Error:", data.error);
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      searchTerm === "" ||
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      // Category handling: can be an object with name or directly a string
    const categoryName = product.category && typeof product.category === 'object' && product.category.name 
      ? product.category.name 
      : product.category || 'Uncategorized';
    
    const matchesCategory =
      selectedCategory === "" || 
      categoryName === selectedCategory;
      
    return matchesSearch && matchesCategory;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "destructive";
      case "draft":
        return "secondary";
      default:
        return "outline";
    }
  };

  const ProductCard = ({ product }: { product: Product }) => {
    const currentPrice = product.originalPrice || product.price;
    const hasDiscount = product.discount && product.discount > 0;

    return (
      <Card
        className="group hover:shadow-lg transition-shadow duration-200"
      >
        <CardHeader className="p-4">
          <div
            className="relative aspect-square mb-4 overflow-hidden rounded-lg bg-gray-100"
          >            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images[0]}
                alt={product.title || 'Image produit'}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-gray-400"
              >
                No Image
              </div>
            )}
            {hasDiscount && (
              <Badge
                className="absolute top-2 left-2"
                variant="destructive"
              >
                -
                {Math.round(
                  ((product.price - currentPrice) / product.price) * 100,
                )}
                %
              </Badge>
            )}
            <Badge
              className="absolute top-2 right-2"
              variant={getStatusBadgeVariant(product.isActive ? 'active' : 'inactive')}
            >
              {product.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>          <CardTitle className="text-lg line-clamp-2">
            {product.title}
          </CardTitle>
          <p
            className="text-sm text-muted-foreground line-clamp-2"
          >
            {product.description}
          </p>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div
            className="flex items-center justify-between mb-3"
          >            <div className="flex items-center gap-2">
              <span
                className="text-lg font-bold text-primary"
              >
                {formatPrice(currentPrice)}
              </span>
              {hasDiscount && (
                <span
                  className="text-sm text-muted-foreground line-through"
                >
                  {formatPrice(product.price)}
                </span>
              )}            </div>            <Badge variant="outline">
              {product.category && typeof product.category === 'object' && product.category.name 
                ? product.category.name 
                : String(product.category || 'Uncategorized')}
            </Badge>
          </div>
          <div
            className="flex items-center justify-between text-sm text-muted-foreground mb-4"
          >
            <span>Stock: {product.stock}</span>
            <span>SKU: {product.sku}</span>
          </div>
          <div className="flex gap-2">
            <Button asChild size="sm" className="flex-1">
              <Link href={`/products/${product.id}`}>
                Voir les détails
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Link href={`/products/${product.id}/edit`}>
                Edit
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ProductListItem = ({ product }: { product: Product }) => {
    const currentPrice = product.originalPrice || product.price;
    const hasDiscount = product.discount && product.discount > 0;

    return (
      <Card
        className="hover:shadow-md transition-shadow duration-200"
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div
              className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100"
            >
              {product.images && product.images.length > 0 ? (                <Image
                  src={product.images[0]}
                  alt={product.title || 'Image produit'}
                  fill
                  className="object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-gray-400 text-xs"
                >
                  No Image
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">              <h3 className="font-semibold text-lg truncate">
                {product.title}
              </h3>
              <p
                className="text-sm text-muted-foreground truncate"
              >
                {product.description}
              </p>              <div className="flex items-center gap-4 mt-2">                <Badge variant="outline">
                  {product.category && typeof product.category === 'object' && product.category.name 
                    ? product.category.name 
                    : String(product.category || 'Uncategorized')}
                </Badge>
                <Badge
                  variant={getStatusBadgeVariant(product.isActive ? 'active' : 'inactive')}
                >
                  {product.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <span
                  className="text-sm text-muted-foreground"
                >
                  Stock: {product.stock}
                </span>
                <span
                  className="text-sm text-muted-foreground"
                >
                  SKU: {product.sku}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div
                  className="text-lg font-bold text-primary"
                >
                  {formatPrice(currentPrice)}
                </div>
                {hasDiscount && (
                  <div
                    className="text-sm text-muted-foreground line-through"
                  >
                    {formatPrice(product.price)}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button asChild size="sm">
                  <Link href={`/products/${product.id}`}>
                    View
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link
                    href={`/products/${product.id}/edit`}
                  >
                    Edit
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produits</h1>
          <p className="text-muted-foreground">Gérez vos Produits et leur inventaire</p>
        </div>
        <Button asChild>
          <Link href="/products/add">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un produit
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <Input
                placeholder="Rechercher des Produits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                aria-label="Filter by category"
                title="Filter by category"
              >
                <option value="">Toutes les catégories</option>
                <option value="electronics">Électronique</option>
                <option value="clothing">Vêtements</option>
                <option value="books">Livres</option>
                <option value="home">Maison</option>
              </select>
              <div className="flex rounded-md border border-input">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-48 w-full animate-pulse rounded-lg bg-muted"></div>
                  <div className="mt-4 space-y-2">
                    <div className="h-4 animate-pulse rounded bg-muted"></div>
                    <div className="h-4 w-2/3 animate-pulse rounded bg-muted"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Aucun produit trouvé</h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? "Aucun produit ne correspond à votre recherche."
                  : "Commencez par ajouter votre premier produit."}
              </p>
              <Button className="mt-4" asChild>
                <Link href="/products/add">
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un produit
                </Link>
              </Button>
            </CardContent>
          </Card>        ) : viewMode === "grid" ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <ProductListItem key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


