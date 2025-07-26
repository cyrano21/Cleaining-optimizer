// converted from original HTML
'use client';

import React, { useState } from 'react';
import ProductCard from '@/components/ui/ProductCard';
import FilterSidebar from '@/components/ui/FilterSidebar';
import SearchBar from '@/components/ui/SearchBar';
import SortDropdown from '@/components/ui/SortDropdown';
import Pagination, { PaginationInfo, usePagination } from '@/components/ui/Pagination';
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Grid, List, Filter, X } from 'lucide-react';

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
  inStock: boolean;
  description?: string;
}

interface FilterOptions {
  categories: Array<{ id: string; name: string; count: number }>;
  brands: Array<{ id: string; name: string; count: number }>;
  colors: Array<{ id: string; name: string; hex: string }>;
  sizes: Array<{ id: string; name: string }>;
  priceRange: { min: number; max: number };
  ratings: number[];
}

// real data
const realProducts: Product[] = [
  {
    id: '1',
    name: 'Smartphone Premium XR',
    price: 899,
    originalPrice: 1099,
    image: '/images/placeholder.svg',
    rating: 4.5,
    reviewCount: 128,
    category: 'electronics',
    brand: 'TechBrand',
    colors: ['black', 'white', 'blue'],
    sizes: ['64GB', '128GB', '256GB'],
    isNew: true,
    isOnSale: true,
    isFavorite: false,
    inStock: true
  },
  {
    id: '2',
    name: 'Casque Audio Wireless Pro',
    price: 299,
    image: '/images/placeholder.svg',
    rating: 4.8,
    reviewCount: 89,
    category: 'electronics',
    brand: 'AudioTech',
    colors: ['black', 'silver'],
    isNew: false,
    isOnSale: false,
    isFavorite: true,
    inStock: true
  },
  {
    id: '3',
    name: 'Montre Connectée Sport',
    price: 199,
    originalPrice: 249,
    image: '/images/placeholder.svg',
    rating: 4.3,
    reviewCount: 156,
    category: 'electronics',
    brand: 'SportTech',
    colors: ['black', 'white', 'red'],
    sizes: ['S', 'M', 'L'],
    isNew: false,
    isOnSale: true,
    isFavorite: false,
    inStock: true
  },
  {
    id: '4',
    name: 'T-shirt Premium Cotton',
    price: 45,
    image: '/images/placeholder.svg',
    rating: 4.6,
    reviewCount: 203,
    category: 'clothing',
    brand: 'FashionCo',
    colors: ['black', 'white', 'blue', 'red'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    isNew: true,
    isOnSale: false,
    isFavorite: false,
    inStock: true
  },
  {
    id: '5',
    name: 'Chaussures Running Pro',
    price: 129,
    originalPrice: 159,
    image: '/images/placeholder.svg',
    rating: 4.7,
    reviewCount: 89,
    category: 'sports',
    brand: 'SportBrand',
    colors: ['black', 'white', 'blue'],
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    isNew: false,
    isOnSale: true,
    isFavorite: true,
    inStock: true
  },
  {
    id: '6',
    name: 'Sac à Dos Urbain',
    price: 79,
    image: '/images/placeholder.svg',
    rating: 4.4,
    reviewCount: 67,
    category: 'accessories',
    brand: 'UrbanStyle',
    colors: ['black', 'gray', 'navy'],
    isNew: false,
    isOnSale: false,
    isFavorite: false,
    inStock: true
  }
];

const realFilterOptions: FilterOptions = {
  categories: [
    { id: 'electronics', name: 'Électronique', count: 45 },
    { id: 'clothing', name: 'Vêtements', count: 32 },
    { id: 'sports', name: 'Sport', count: 28 },
    { id: 'accessories', name: 'Accessoires', count: 19 }
  ],
  brands: [
    { id: 'techbrand', name: 'TechBrand', count: 15 },
    { id: 'audiotech', name: 'AudioTech', count: 12 },
    { id: 'fashionco', name: 'FashionCo', count: 8 },
    { id: 'sporttech', name: 'SportTech', count: 10 },
    { id: 'sportbrand', name: 'SportBrand', count: 7 },
    { id: 'urbanstyle', name: 'UrbanStyle', count: 5 }
  ],
  colors: [
    { id: 'black', name: 'Noir', hex: '#000000' },
    { id: 'white', name: 'Blanc', hex: '#FFFFFF' },
    { id: 'blue', name: 'Bleu', hex: '#3B82F6' },
    { id: 'red', name: 'Rouge', hex: '#EF4444' },
    { id: 'gray', name: 'Gris', hex: '#6B7280' },
    { id: 'navy', name: 'Marine', hex: '#1E3A8A' },
    { id: 'silver', name: 'Argent', hex: '#C0C0C0' }
  ],
  sizes: [
    { id: 'xs', name: 'XS' },
    { id: 's', name: 'S' },
    { id: 'm', name: 'M' },
    { id: 'l', name: 'L' },
    { id: 'xl', name: 'XL' },
    { id: '38', name: '38' },
    { id: '39', name: '39' },
    { id: '40', name: '40' },
    { id: '41', name: '41' },
    { id: '42', name: '42' },
    { id: '43', name: '43' },
    { id: '44', name: '44' },
    { id: '64gb', name: '64GB' },
    { id: '128gb', name: '128GB' },
    { id: '256gb', name: '256GB' }
  ],
  priceRange: { min: 0, max: 1500 },
  ratings: [1, 2, 3, 4, 5]
};

// Options de tri par défaut
const sortOptions = [
  { value: 'relevance', label: 'Pertinence' },
  { value: 'price-asc', label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix décroissant' },
  { value: 'name-asc', label: 'Nom A-Z' },
  { value: 'name-desc', label: 'Nom Z-A' },
  { value: 'rating-desc', label: 'Meilleures notes' },
  { value: 'newest', label: 'Plus récents' }
];

// Fonction pour transformer les données en format attendu par FilterSidebar
const transformFilterOptions = (options: FilterOptions) => ({
  categories: options.categories.map(cat => ({
    value: cat.id,
    label: cat.name,
    count: cat.count
  })),
  brands: options.brands.map(brand => ({
    value: brand.id,
    label: brand.name,
    count: brand.count
  })),
  colors: options.colors.map(color => ({
    value: color.id,
    label: color.name,
    color: color.hex || '#000000'
  })),
  sizes: options.sizes.map(size => ({
    value: size.id,
    label: size.name
  })),
  priceRange: options.priceRange,
  ratings: options.ratings
});

export default function ShopRightFilterPage() {
  const [products, setProducts] = useState<Product[]>(realProducts);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(realProducts);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [searchQuery, setSearchQuery] = useState('');  const [activeFilters, setActiveFilters] = useState<{
    search?: string;
    categories: string[];
    brands: string[];
    colors: string[];
    sizes: string[];
    priceRange: { min: number; max: number };
    rating: number | null;
  }>({
    categories: [],
    brands: [],
    colors: [],
    sizes: [],
    priceRange: { min: 0, max: 1000 },
    rating: null,
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const itemsPerPage = 9;
  const {
    currentPage,
    totalPages,
    goToPage,
    startIndex,
    endIndex
  } = usePagination({
    totalItems: filteredProducts.length,
    itemsPerPage,
    initialPage: 1
  });

  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Gestion de la recherche
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFilters({ ...activeFilters, search: query });
  };

  // Gestion du tri
  const handleSort = (sortValue: string) => {
    setSortBy(sortValue);
    const sorted = [...filteredProducts];
    
    switch (sortValue) {
      case 'name-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'rating-desc':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // relevance - pas de tri spécifique
        break;
    }
      setFilteredProducts(sorted);
  };

  // Application des filtres
  const applyFilters = (filters: {
    search?: string;
    categories: string[];
    brands: string[];
    colors: string[];
    sizes: string[];
    priceRange: { min: number; max: number };
    rating: number | null;
  }) => {
    setIsLoading(true);
    setActiveFilters(filters);
    
    let filtered = [...products];
      // Filtre de recherche
    if (filters.search) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
        product.category.toLowerCase().includes(filters.search!.toLowerCase()) ||
        product.brand.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }
      // Filtre par catégories
    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(product => 
        filters.categories.includes(product.category)
      );
    }
    
    // Filtre par marques
    if (filters.brands && filters.brands.length > 0) {
      filtered = filtered.filter(product => 
        filters.brands.includes(product.brand.toLowerCase())
      );
    }
    
    // Filtre par couleurs
    if (filters.colors && filters.colors.length > 0) {
      filtered = filtered.filter(product => 
        product.colors && product.colors.some(color => filters.colors.includes(color))
      );
    }
    
    // Filtre par tailles
    if (filters.sizes && filters.sizes.length > 0) {
      filtered = filtered.filter(product => 
        product.sizes && product.sizes.some(size => filters.sizes.includes(size.toLowerCase()))
      );
    }
    
    // Filtre par prix
    if (filters.priceRange) {
      filtered = filtered.filter(product => 
        product.price >= filters.priceRange.min && 
        product.price <= filters.priceRange.max
      );
    }    // Filtre par note
    if (filters.rating !== null) {
      filtered = filtered.filter(product => product.rating >= filters.rating!);
    }
    
    setFilteredProducts(filtered);
    setIsLoading(false);
    goToPage(1); // Retour à la première page
  };

  const handleProductAction = (productId: string, action: 'favorite' | 'cart') => {
    if (action === 'favorite') {
      setProducts(prev => prev.map(product => 
        product.id === productId 
          ? { ...product, isFavorite: !product.isFavorite }
          : product
      ));
      setFilteredProducts(prev => prev.map(product => 
        product.id === productId 
          ? { ...product, isFavorite: !product.isFavorite }
          : product
      ));
    } else if (action === 'cart') {
      // Logique d'ajout au panier
      console.log(`Produit ${productId} ajouté au panier`);
    }
  };

  return (
     <DashboardLayout>
    <div className="min-h-screen bg-gray-50">
      {/* Header de la page */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Boutique - Filtres à Droite</h1>
                <p className="text-sm text-gray-600 mt-1">Découvrez notre sélection avec filtres latéraux</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md ${
                    viewMode === 'grid' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  aria-label="Vue en grille"
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md ${
                    viewMode === 'list' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  aria-label="Vue en liste"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Barre de recherche et tri */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <SearchBar
                  onSearch={handleSearch}
                  placeholder="Rechercher des produits..."
                />
              </div>
              <div className="flex items-center space-x-4">
                <SortDropdown
                  value={sortBy}
                  onChange={handleSort}
                  className="w-48"
                  options={sortOptions}
                />
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filtres</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Contenu principal - À gauche */}
          <div className="flex-1 min-w-0">
            {/* Informations de pagination et résultats */}
            <div className="flex items-center justify-between mb-6">
              <PaginationInfo
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredProducts.length}
                itemsPerPage={itemsPerPage}
              />
              <div className="text-sm text-gray-500">
                {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
              </div>
            </div>

            {/* Filtres actifs */}
            {Object.keys(activeFilters).length > 0 && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-blue-900">Filtres actifs</h3>                  <button
                    onClick={() => {
                      setActiveFilters({
                        categories: [],
                        brands: [],
                        colors: [],
                        sizes: [],
                        priceRange: { min: 0, max: 1000 },
                        rating: null,
                      });
                      setFilteredProducts(products);
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
                    <span key={category} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {realFilterOptions.categories.find((c: { id: string; name: string; count: number }) => c.id === category)?.name || category}
                    </span>
                  ))}
                  {activeFilters.brands?.map((brand: string) => (
                    <span key={brand} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {realFilterOptions.brands.find((b: { id: string; name: string; count: number }) => b.id === brand)?.name || brand}
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
                <div className={`
                  ${viewMode === 'grid' 
                    ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6' 
                    : 'space-y-4'
                  }
                `}>
                  {paginatedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onFavoriteClick={() => handleProductAction(product.id, 'favorite')}
                      onAddToCart={() => handleProductAction(product.id, 'cart')}
                      variant={viewMode === 'list' ? 'horizontal' : 'vertical'}
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
                  <Grid className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun produit trouvé
                </h3>
                <p className="text-gray-500 mb-4">
                  Essayez de modifier vos critères de recherche ou vos filtres.
                </p>                <button
                  onClick={() => {
                    setActiveFilters({
                      categories: [],
                      brands: [],
                      colors: [],
                      sizes: [],
                      priceRange: { min: 0, max: 1000 },
                      rating: null,
                    });
                    setFilteredProducts(products);
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            )}
          </div>

          {/* Sidebar de filtres - Toujours à droite */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-8">
              <FilterSidebar
                options={transformFilterOptions(realFilterOptions)}
                activeFilters={activeFilters}
                onFiltersChange={applyFilters}                onClearFilters={() => {
                  setActiveFilters({
                    categories: [],
                    brands: [],
                    colors: [],
                    sizes: [],
                    priceRange: { min: 0, max: 1000 },
                    rating: null,
                  });
                  setFilteredProducts(products);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal de filtres mobile */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileFilters(false)} />
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Filtres</h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-md"
                aria-label="Fermer les filtres"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto h-full pb-20">
              <FilterSidebar
                options={transformFilterOptions(realFilterOptions)}
                activeFilters={activeFilters}
                onFiltersChange={(filters) => {
                  applyFilters(filters);
                  setShowMobileFilters(false);
                }}                onClearFilters={() => {
                  setActiveFilters({
                    categories: [],
                    brands: [],
                    colors: [],
                    sizes: [],
                    priceRange: { min: 0, max: 1000 },
                    rating: null,
                  });
                  setFilteredProducts(products);
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

