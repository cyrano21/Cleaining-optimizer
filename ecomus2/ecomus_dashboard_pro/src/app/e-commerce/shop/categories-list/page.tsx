// converted from original HTML
// converted from original HTML
"use client";

import React, { useState } from "react";
import Image from "next/image";
import ProductCard from "@/components/ui/ProductCard";
import FilterSidebar, {
  FilterOptions as SidebarFilterOptions,
} from "@/components/ui/FilterSidebar";
import SearchBar from "@/components/ui/SearchBar";
import SortDropdown from "@/components/ui/SortDropdown";
import Pagination, {
  PaginationInfo,
  usePagination,
} from "@/components/ui/Pagination";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Grid, Filter, X, Tag, ChevronRight, Package } from "lucide-react";

// Types
interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  rating: number;
  reviewCount: number;
  category: string;
  brand: string;
  colors?: string[];
  sizes?: string[];
  isNew?: boolean;
  isOnSale?: boolean;
  isFavorite?: boolean;
  isFeatured?: boolean;
  inStock: boolean;
  description?: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
  isPopular?: boolean;
  subcategories?: Array<{ id: string; name: string; count: number }>;
}

interface AppliedFilters {
  search?: string;
  categories: string[];
  brands: string[];
  colors: string[];
  sizes: string[];
  priceRange: { min: number; max: number };
  rating: number | null;
}

// Interface locale pour les options de filtre brutes (avant transformation)
interface RawFilterOptions {
  categories: { id: string; name: string; count: number }[];
  brands: { id: string; name: string; count: number }[];
  colors: { id: string; name: string; color: string; count: number }[];
  sizes: { id: string; name: string; count: number }[];
  priceRange: { min: number; max: number };
  ratings: number[];
}

// real data
const realProducts: Product[] = [
  {
    id: "1",
    name: "Smartphone Premium XR",
    price: 899,
    originalPrice: 1099,
    image: "/images/products/phone1.jpg",
    rating: 4.5,
    reviewCount: 128,
    category: "electronics",
    brand: "TechBrand",
    colors: ["black", "white", "blue"],
    sizes: ["64GB", "128GB", "256GB"],
    isNew: true,
    isOnSale: true,
    isFavorite: false,
    inStock: true,
    description:
      'Un smartphone haut de gamme avec écran OLED 6.7", processeur A16 Bionic et triple caméra 48MP.',
  },
  {
    id: "2",
    name: "Casque Audio Wireless Pro",
    price: 299,
    image: "/images/products/headphones1.jpg",
    rating: 4.8,
    reviewCount: 89,
    category: "electronics",
    brand: "AudioTech",
    colors: ["black", "silver"],
    isNew: false,
    isOnSale: false,
    isFavorite: true,
    inStock: true,
    description:
      "Casque sans fil avec réduction de bruit active, autonomie 30h et son Hi-Res.",
  },
  {
    id: "3",
    name: "T-shirt Premium Cotton",
    price: 45,
    image: "/images/products/tshirt1.jpg",
    rating: 4.6,
    reviewCount: 203,
    category: "clothing",
    brand: "FashionCo",
    colors: ["black", "white", "blue", "red"],
    sizes: ["XS", "S", "M", "L", "XL"],
    isNew: true,
    isOnSale: false,
    isFavorite: false,
    inStock: true,
    description: "T-shirt en coton bio premium, coupe moderne et confortable.",
  },
  {
    id: "4",
    name: "Chaussures Running Pro",
    price: 129,
    originalPrice: 159,
    image: "/images/products/shoes1.jpg",
    rating: 4.7,
    reviewCount: 89,
    category: "sports",
    brand: "SportBrand",
    colors: ["black", "white", "blue"],
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    isNew: false,
    isOnSale: true,
    isFavorite: true,
    inStock: true,
    description: "Chaussures de running avec technologie d'amorti avancée.",
  },
  {
    id: "5",
    name: "Sac à Dos Urbain",
    price: 79,
    image: "/images/products/backpack1.jpg",
    rating: 4.4,
    reviewCount: 67,
    category: "accessories",
    brand: "UrbanStyle",
    colors: ["black", "gray", "navy"],
    isNew: false,
    isOnSale: false,
    isFavorite: false,
    inStock: true,
    description:
      'Sac à dos urbain avec compartiment laptop 15" et matière résistante.',
  },
  {
    id: "6",
    name: "Parfum Luxe Homme",
    price: 89,
    image: "/images/products/perfume1.jpg",
    rating: 4.4,
    reviewCount: 92,
    category: "beauty",
    brand: "LuxeScent",
    colors: ["gold"],
    sizes: ["50ml", "100ml"],
    isNew: false,
    isOnSale: false,
    isFavorite: false,
    inStock: true,
    description:
      "Parfum masculin aux notes boisées et épicées, tenue longue durée.",
  },
];

// Génère les catégories basées sur les produits
const generateCategoriesFromProducts = (products: Product[]): Category[] => {
  const categoryMap = new Map<string, Category>();

  products.forEach((product) => {
    if (!categoryMap.has(product.category)) {
      categoryMap.set(product.category, {
        id: product.category,
        name: product.category.charAt(0).toUpperCase() + product.category.slice(1),
        description: `Découvrez notre collection de ${product.category}`,
        image: product.image,
        productCount: 0,
        isPopular: false,
      });
    }

    const category = categoryMap.get(product.category)!;
    category.productCount++;

    // Marque comme populaire si plus de 1 produit
    if (category.productCount > 1) {
      category.isPopular = true;
    }
  });

  return Array.from(categoryMap.values());
};

// Génère les catégories réelles
const realCategories = generateCategoriesFromProducts(realProducts);

// Données real pour les options de filtre brutes
const realFilterOptions: RawFilterOptions = {
  categories: [
    { id: "electronics", name: "Electronics", count: 120 },
    { id: "clothing", name: "Clothing", count: 85 },
    { id: "home-garden", name: "Home & Garden", count: 200 },
    { id: "books", name: "Books", count: 50 },
  ],
  brands: [
    { id: "apple", name: "Apple", count: 30 },
    { id: "samsung", name: "Samsung", count: 25 },
    { id: "nike", name: "Nike", count: 40 },
    { id: "sony", name: "Sony", count: 15 },
  ],
  colors: [
    { id: "red", name: "Red", color: "bg-red-500", count: 50 },
    { id: "blue", name: "Blue", color: "bg-blue-500", count: 60 },
    { id: "black", name: "Black", color: "bg-black", count: 100 },
    { id: "white", name: "White", color: "bg-white", count: 80 },
  ],
  sizes: [
    { id: "s", name: "Small", count: 70 },
    { id: "m", name: "Medium", count: 100 },
    { id: "l", name: "Large", count: 80 },
    { id: "xl", name: "XL", count: 50 },
  ],
  priceRange: { min: 0, max: 1000 },
  ratings: [1, 2, 3, 4, 5],
};

// Transforme les options de filtre brutes au format attendu par FilterSidebar
const transformFilterOptions = (
  options: RawFilterOptions
): SidebarFilterOptions => {
  return {
    categories: options.categories.map((c) => ({
      value: c.id,
      label: c.name,
      count: c.count,
    })),
    brands: options.brands.map((b) => ({
      value: b.id,
      label: b.name,
      count: b.count,
    })),
    colors: options.colors.map((c) => ({
      value: c.id,
      label: c.name,
      color: c.color,
      count: c.count,
    })),
    sizes: options.sizes.map((s) => ({
      value: s.id,
      label: s.name,
      count: s.count,
    })),
    priceRange: options.priceRange,
    ratings: options.ratings,
  };
};

export default function CategoriesListPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>(realProducts);
  const [filteredProducts, setFilteredProducts] =
    useState<Product[]>(realProducts);
  const [sortBy, setSortBy] = useState("relevance");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<AppliedFilters>({
    search: undefined,
    categories: [],
    brands: [],
    colors: [],
    sizes: [],
    priceRange: { min: 0, max: 1000 },
    rating: null,
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"categories" | "products">(
    "categories"
  );

  const itemsPerPage = 12;
  const { currentPage, totalPages, goToPage, startIndex, endIndex } =
    usePagination({
      totalItems: filteredProducts.length,
      itemsPerPage,
      initialPage: 1,
    });

  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Gestion de la sélection de catégorie
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setViewMode("products");
    const categoryProducts = realProducts.filter(
      (product) => product.category === categoryId
    );
    setFilteredProducts(categoryProducts);
    setActiveFilters({
      search: undefined,
      categories: [categoryId],
      brands: [],
      colors: [],
      sizes: [],
      priceRange: { min: 0, max: 1000 },
      rating: null,
    });
    goToPage(1);
  };

  // Retour à la vue catégories
  const handleBackToCategories = () => {
    setViewMode("categories");
    setSelectedCategory(null);
    setFilteredProducts(realProducts);
    setActiveFilters({
      search: undefined,
      categories: [],
      brands: [],
      colors: [],
      sizes: [],
      priceRange: { min: 0, max: 1000 },
      rating: null,
    });
    setSearchQuery("");
  };

  // Gestion de la recherche
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setViewMode("products");
      // Utiliser searchQuery après mise à jour pour uniformité avec l'interface utilisateur
      applyFilters({
        ...activeFilters,
        search: query,
      });
    } else {
      setViewMode("categories");
      setFilteredProducts(realProducts);
    }
  };

  // Gestion du tri
  const handleSort = (sortValue: string) => {
    setSortBy(sortValue);
    const sorted = [...filteredProducts];

    switch (sortValue) {
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "rating-desc":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // relevance - pas de tri spécifique
        break;
    }

    setFilteredProducts(sorted);
  };

  // Application des filtres
  const applyFilters = (filters: AppliedFilters) => {
    setIsLoading(true);
    setActiveFilters(filters);

    let filtered = [...products];

    // Filtre de recherche
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.category.toLowerCase().includes(searchTerm) ||
          product.brand.toLowerCase().includes(searchTerm) ||
          (product.description &&
            product.description.toLowerCase().includes(searchTerm))
      );
    }

    // Filtre par catégories
    if (filters.categories.length > 0) {
      filtered = filtered.filter((product) =>
        filters.categories.includes(product.category)
      );
    }

    // Filtre par marques
    if (filters.brands.length > 0) {
      filtered = filtered.filter((product) =>
        filters.brands.includes(product.brand.toLowerCase())
      );
    }

    // Filtre par couleurs
    if (filters.colors.length > 0) {
      filtered = filtered.filter(
        (product) =>
          product.colors &&
          product.colors.some((color) => filters.colors.includes(color))
      );
    }

    // Filtre par tailles
    if (filters.sizes.length > 0) {
      filtered = filtered.filter(
        (product) =>
          product.sizes &&
          product.sizes.some((size) =>
            filters.sizes.includes(size.toLowerCase())
          )
      );
    }

    // Filtre par prix
    filtered = filtered.filter(
      (product) =>
        product.price >= filters.priceRange.min &&
        product.price <= filters.priceRange.max
    );

    // Filtre par note
    if (filters.rating !== null) {
      const ratingValue = filters.rating;
      filtered = filtered.filter((product) => product.rating >= ratingValue);
    }

    setFilteredProducts(filtered);
    setIsLoading(false);
    goToPage(1);
  };

  const handleProductAction = (
    productId: string,
    action: "favorite" | "cart"
  ) => {
    if (action === "favorite") {
      setProducts((prev) =>
        prev.map((product) =>
          product.id === productId
            ? { ...product, isFavorite: !product.isFavorite }
            : product
        )
      );
      setFilteredProducts((prev) =>
        prev.map((product) =>
          product.id === productId
            ? { ...product, isFavorite: !product.isFavorite }
            : product
        )
      );
    } else if (action === "cart") {
      console.log(`Produit ${productId} ajouté au panier`);
    }
  };

  // Composant CategoryCard - Hope UI Pro Style
  const CategoryCard = ({ category }: { category: Category }) => (
    <div
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer group border border-gray-100 hover:border-blue-200"
      onClick={() => handleCategorySelect(category.id)}
    >
      <div className="relative h-56 overflow-hidden">
        <Image
          src={category.image}
          alt={category.name}
          width={400}
          height={224}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Badges avec style Hope UI */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {category.isPopular && (
            <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1.5 text-xs rounded-full font-semibold shadow-lg backdrop-blur-sm">
              ⭐ Populaire
            </span>
          )}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1.5 text-xs rounded-full font-semibold shadow-lg backdrop-blur-sm">
            📦 {category.productCount} produits
          </span>
        </div>

        {/* Action button */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
            title="Voir la catégorie"
            aria-label="Voir la catégorie"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Titre sur l'image avec meilleur contraste */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
          <h3 className="text-white text-2xl font-bold mb-2 group-hover:text-blue-200 transition-colors">
            {category.name}
          </h3>
          <p className="text-white/90 text-sm leading-relaxed">
            {category.description}
          </p>
        </div>
      </div>

      {/* Sous-catégories avec style Hope UI Pro */}
      <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Tag className="w-4 h-4 text-blue-600" />
            Sous-catégories
          </h4>
          <div className="flex items-center text-blue-600 group-hover:text-blue-700 transition-colors">
            <span className="text-xs font-medium mr-1">Explorer</span>
            <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {category.subcategories?.slice(0, 4).map((sub) => (
            <div
              key={sub.id}
              className="bg-white rounded-lg p-3 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 cursor-pointer group/sub"
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-700 text-sm font-medium group-hover/sub:text-blue-600 transition-colors">
                  {sub.name}
                </span>
                <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full font-semibold">
                  {sub.count}
                </span>
              </div>
            </div>
          ))}
        </div>
        {category.subcategories && category.subcategories.length > 4 && (
          <div className="mt-3 text-center">
            <span className="inline-flex items-center text-xs text-blue-600 font-semibold bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors cursor-pointer">
              <Package className="w-3 h-3 mr-1" />+
              {category.subcategories.length - 4} autres catégories
            </span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header de la page */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col space-y-4">
              {/* Breadcrumb et titre */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {viewMode === "products" && selectedCategory && (
                    <>
                      <button
                        onClick={handleBackToCategories}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center space-x-1"
                      >
                        <span>Catégories</span>
                      </button>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900 font-medium text-sm">
                        {
                          realProducts.find((c) => c.id === selectedCategory)
                            ?.name
                        }
                      </span>
                    </>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {viewMode === "categories" ? (
                    <>
                      <Tag className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-gray-600">
                        Vue catégories
                      </span>
                    </>
                  ) : (
                    <>
                      <Grid className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-gray-600">
                        Vue produits
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {viewMode === "categories"
                    ? "Toutes les Catégories"
                    : selectedCategory
                    ? realProducts.find((c) => c.id === selectedCategory)
                        ?.name
                    : "Produits"}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {viewMode === "categories"
                    ? "Explorez nos différentes catégories de produits"
                    : "Découvrez notre sélection de produits"}
                </p>
              </div>

              {/* Barre de recherche et tri */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <SearchBar
                    onSearch={handleSearch}
                    placeholder="Rechercher des produits ou catégories..."
                  />
                  {searchQuery.trim() !== "" && (
                    <div className="mt-2 text-sm text-blue-600">
                      Résultats pour :{" "}
                      <span className="font-medium">
                        &quot;{searchQuery}&quot;
                      </span>
                    </div>
                  )}
                </div>
                {viewMode === "products" && (
                  <div className="flex items-center space-x-4">
                    <SortDropdown
                      options={[
                        { value: "relevance", label: "Pertinence" },
                        { value: "name-asc", label: "Nom (A-Z)" },
                        { value: "name-desc", label: "Nom (Z-A)" },
                        { value: "price-asc", label: "Prix croissant" },
                        { value: "price-desc", label: "Prix décroissant" },
                        { value: "rating-desc", label: "Mieux notés" },
                      ]}
                      value={sortBy}
                      onChange={handleSort}
                      className="w-48"
                    />
                    <button
                      onClick={() => setShowMobileFilters(true)}
                      className="lg:hidden flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Filter className="w-4 h-4" />
                      <span>Filtres</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {viewMode === "categories" ? (
            /* Vue Catégories */
            <div>
              {/* Statistiques avec style Hope UI Pro */}
              <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-lg border border-blue-200 hover:shadow-xl transition-all duration-300 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-semibold text-blue-700">
                          Total Catégories
                        </p>
                        <p className="text-3xl font-bold text-blue-900 group-hover:text-blue-800 transition-colors">
                          {realProducts.length}
                        </p>
                      </div>
                    </div>
                    <div className="text-blue-400 opacity-20 group-hover:opacity-30 transition-opacity">
                      <Package className="w-12 h-12" />
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-lg border border-green-200 hover:shadow-xl transition-all duration-300 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Grid className="w-6 h-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-semibold text-green-700">
                          Total Produits
                        </p>{" "}
                        <p className="text-3xl font-bold text-green-900 group-hover:text-green-800 transition-colors">
                          {realProducts.length}
                        </p>
                      </div>
                    </div>
                    <div className="text-green-400 opacity-20 group-hover:opacity-30 transition-opacity">
                      <Grid className="w-12 h-12" />
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl shadow-lg border border-orange-200 hover:shadow-xl transition-all duration-300 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Tag className="w-6 h-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-semibold text-orange-700">
                          Catégories Populaires
                        </p>                        <p className="text-3xl font-bold text-orange-900 group-hover:text-orange-800 transition-colors">
                          {realProducts.filter((product) => product.isFeatured).length}
                        </p>
                      </div>
                    </div>
                    <div className="text-orange-400 opacity-20 group-hover:opacity-30 transition-opacity">
                      <Tag className="w-12 h-12" />
                    </div>
                  </div>
                </div>
              </div>              {/* Grille de catégories avec style Hope UI Pro */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {realCategories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>

              {/* Section d'appel à l'action */}
              <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white">
                <h3 className="text-2xl font-bold mb-4">
                  Vous ne trouvez pas ce que vous cherchez ?
                </h3>
                <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                  Explorez notre catalogue complet ou contactez notre équipe
                  pour des recommandations personnalisées.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                    Voir tous les produits
                  </button>
                  <button className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                    Nous contacter
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Vue Produits */
            <div className="flex gap-8">
              {/* Sidebar de filtres */}
              <div className="hidden lg:block w-80 flex-shrink-0">
                <div className="sticky top-8">
                  <FilterSidebar
                    options={transformFilterOptions(realFilterOptions)} // Renommage de filterOptions en options
                    activeFilters={activeFilters}
                    onFiltersChange={applyFilters}
                    onClearFilters={() => {
                      setActiveFilters({
                        search: undefined,
                        categories: [],
                        brands: [],
                        colors: [],
                        sizes: [],
                        priceRange: { min: 0, max: 1000 },
                        rating: null,
                      });
                      setFilteredProducts(realProducts);
                    }}
                  />
                </div>
              </div>

              {/* Contenu principal - Grille de produits */}
              <div className="flex-1 min-w-0">
                {/* Informations de pagination et résultats */}
                <div className="flex items-center justify-between mb-6">
                  <PaginationInfo
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredProducts.length}
                    itemsPerPage={itemsPerPage}
                  />
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-500">
                      {filteredProducts.length} produit
                      {filteredProducts.length > 1 ? "s" : ""} trouvé
                      {filteredProducts.length > 1 ? "s" : ""}
                    </div>
                    <button
                      onClick={handleBackToCategories}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Retour aux catégories
                    </button>
                  </div>
                </div>

                {/* Filtres actifs */}
                {Object.keys(activeFilters).length > 0 && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-blue-900">
                        Filtres actifs
                      </h3>                      <button
                        onClick={() => {
                          setActiveFilters({
                            search: undefined,
                            categories: [],
                            brands: [],
                            colors: [],
                            sizes: [],
                            priceRange: { min: 0, max: 1000 },
                            rating: null,
                          });
                          setFilteredProducts(
                            selectedCategory
                              ? realProducts.filter(
                                  (p) => p.category === selectedCategory
                                )
                              : realProducts
                          );
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Effacer tous
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {activeFilters.search && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Recherche: {activeFilters.search}
                        </span>
                      )}
                      {activeFilters.categories?.map((category: string) => (
                        <span
                          key={category}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {realFilterOptions.categories.find(
                            (c) => c.id === category
                          )?.name || category}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Grille de produits */}
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {paginatedProducts.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onAddToWishlist={() =>
                            handleProductAction(product.id, "favorite")
                          }
                          onAddToCart={() =>
                            handleProductAction(product.id, "cart")
                          }
                        />
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="mt-12 flex justify-center">
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={goToPage}
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Message si aucun produit */}
                {!isLoading && filteredProducts.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <Package className="w-16 h-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Aucun produit trouvé
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Essayez de modifier vos critères de recherche ou vos
                      filtres.
                    </p>
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={() => {
                          setActiveFilters({
                            search: undefined,
                            categories: selectedCategory
                              ? [selectedCategory]
                              : [],
                            brands: [],
                            colors: [],
                            sizes: [],
                            priceRange: { min: 0, max: 1000 },
                            rating: null,
                          });                          setFilteredProducts(
                            selectedCategory
                              ? realProducts.filter(
                                  (p) => p.category === selectedCategory
                                )
                              : realProducts
                          );
                          setSearchQuery("");
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Réinitialiser les filtres
                      </button>
                      <button
                        onClick={handleBackToCategories}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Retour aux catégories
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal de filtres mobile */}
        {showMobileFilters && viewMode === "products" && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setShowMobileFilters(false)}
            />
            <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Filtres</h2>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-md"
                  title="Fermer les filtres"
                  aria-label="Fermer les filtres"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto h-full pb-20">
                <FilterSidebar
                  options={transformFilterOptions(realFilterOptions)} // Renommage de filterOptions en options
                  activeFilters={activeFilters}
                  onFiltersChange={(filters) => {
                    applyFilters(filters);
                    setShowMobileFilters(false);
                  }}
                  onClearFilters={() => {
                    setActiveFilters({
                      search: undefined,
                      categories: [],
                      brands: [],
                      colors: [],
                      sizes: [],
                      priceRange: { min: 0, max: 1000 },
                      rating: null,
                    });
                    setFilteredProducts(realProducts);
                    setShowMobileFilters(false);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

