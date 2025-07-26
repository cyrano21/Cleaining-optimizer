// converted from original HTML
'use client';

import React, { useState } from 'react';
import FilterSidebar from '@/components/ui/FilterSidebar';
import SearchBar from '@/components/ui/SearchBar';
import SortDropdown from '@/components/ui/SortDropdown';
import Pagination, { PaginationInfo, usePagination } from '@/components/ui/Pagination';
import { Grid, Filter, X, LayoutGrid, Star, Heart, ShoppingCart, Eye, Tag } from 'lucide-react';
import { DashboardLayout } from "@/components/layouts/dashboard-layout";

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
  },
  {
    id: '7',
    name: 'Ordinateur Portable Gaming',
    price: 1299,
    originalPrice: 1599,
    image: '/images/placeholder.svg',
    rating: 4.9,
    reviewCount: 234,
    category: 'electronics',
    brand: 'GamerTech',
    colors: ['black', 'red'],
    sizes: ['15"', '17"'],
    isNew: true,
    isOnSale: true,
    isFavorite: false,
    inStock: true
  },
  {
    id: '8',
    name: 'Lunettes de Soleil Designer',
    price: 189,
    image: '/images/placeholder.svg',
    rating: 4.2,
    reviewCount: 78,
    category: 'accessories',
    brand: 'StyleCo',
    colors: ['black', 'brown', 'gold'],
    isNew: false,
    isOnSale: false,
    isFavorite: false,
    inStock: true
  },
  {
    id: '9',
    name: 'Veste Cuir Premium',
    price: 299,
    originalPrice: 399,
    image: '/images/placeholder.svg',
    rating: 4.6,
    reviewCount: 145,
    category: 'clothing',
    brand: 'LeatherCraft',
    colors: ['black', 'brown'],
    sizes: ['S', 'M', 'L', 'XL'],
    isNew: false,
    isOnSale: true,
    isFavorite: true,
    inStock: true
  },
  {
    id: '10',
    name: 'Tablette Graphique Pro',
    price: 449,
    image: '/images/placeholder.svg',
    rating: 4.8,
    reviewCount: 167,
    category: 'electronics',
    brand: 'CreativeTech',
    colors: ['black', 'white'],
    sizes: ['10"', '12"'],
    isNew: true,
    isOnSale: false,
    isFavorite: false,
    inStock: true
  },
  {
    id: '11',
    name: 'Parfum Luxe Homme',
    price: 89,
    image: '/images/placeholder.svg',
    rating: 4.4,
    reviewCount: 92,
    category: 'beauty',
    brand: 'LuxeScent',
    colors: ['gold'],
    sizes: ['50ml', '100ml'],
    isNew: false,
    isOnSale: false,
    isFavorite: false,
    inStock: true
  },
  {
    id: '12',
    name: 'Enceinte Bluetooth Portable',
    price: 159,
    originalPrice: 199,
    image: '/images/placeholder.svg',
    rating: 4.5,
    reviewCount: 134,
    category: 'electronics',
    brand: 'SoundTech',
    colors: ['black', 'blue', 'red'],
    isNew: false,
    isOnSale: true,
    isFavorite: true,
    inStock: true
  }
];

const realFilterOptions: FilterOptions = {
  categories: [
    { id: 'electronics', name: 'Électronique', count: 45 },
    { id: 'clothing', name: 'Vêtements', count: 32 },
    { id: 'sports', name: 'Sport', count: 28 },
    { id: 'accessories', name: 'Accessoires', count: 19 },
    { id: 'beauty', name: 'Beauté', count: 15 }
  ],
  brands: [
    { id: 'techbrand', name: 'TechBrand', count: 15 },
    { id: 'audiotech', name: 'AudioTech', count: 12 },
    { id: 'fashionco', name: 'FashionCo', count: 8 },
    { id: 'sporttech', name: 'SportTech', count: 10 },
    { id: 'sportbrand', name: 'SportBrand', count: 7 },
    { id: 'urbanstyle', name: 'UrbanStyle', count: 5 },
    { id: 'gamertech', name: 'GamerTech', count: 9 },
    { id: 'styleco', name: 'StyleCo', count: 6 },
    { id: 'leathercraft', name: 'LeatherCraft', count: 4 },
    { id: 'creativetech', name: 'CreativeTech', count: 8 },
    { id: 'luxescent', name: 'LuxeScent', count: 3 },
    { id: 'soundtech', name: 'SoundTech', count: 7 }
  ],
  colors: [
    { id: 'black', name: 'Noir', hex: '#000000' },
    { id: 'white', name: 'Blanc', hex: '#FFFFFF' },
    { id: 'blue', name: 'Bleu', hex: '#3B82F6' },
    { id: 'red', name: 'Rouge', hex: '#EF4444' },
    { id: 'gray', name: 'Gris', hex: '#6B7280' },
    { id: 'navy', name: 'Marine', hex: '#1E3A8A' },
    { id: 'silver', name: 'Argent', hex: '#C0C0C0' },
    { id: 'brown', name: 'Marron', hex: '#8B4513' },
    { id: 'gold', name: 'Or', hex: '#FFD700' }
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
    { id: '256gb', name: '256GB' },
    { id: '10"', name: '10"' },
    { id: '12"', name: '12"' },
    { id: '15"', name: '15"' },
    { id: '17"', name: '17"' },
    { id: '50ml', name: '50ml' },
    { id: '100ml', name: '100ml' }
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

export default function ProductGridViewPage() {
  const [products, setProducts] = useState<Product[]>(realProducts);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(realProducts);
  const [gridColumns, setGridColumns] = useState<2 | 3 | 4>(3);
  const [sortBy, setSortBy] = useState('relevance');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<any>({});
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const itemsPerPage = 12;
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
  const applyFilters = (filters: any) => {
    setIsLoading(true);
    setActiveFilters(filters);
    
    let filtered = [...products];
    
    // Filtre de recherche
    if (filters.search) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.category.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.brand.toLowerCase().includes(filters.search.toLowerCase())
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
    }
    
    // Filtre par note
    if (filters.rating) {
      filtered = filtered.filter(product => product.rating >= filters.rating);
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

  const getGridClasses = () => {
    switch (gridColumns) {
      case 2:
        return 'grid-cols-1 sm:grid-cols-2';
      case 3:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 4:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    }
  };

  return (
      <DashboardLayout>
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header moderne avec style Hope UI Pro */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col space-y-6">
            {/* Titre et navigation */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <LayoutGrid className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Fashion</h1>
                  <p className="text-sm text-gray-600 mt-1">Découvrez notre collection tendance</p>
                </div>
              </div>
              
              {/* Contrôles de vue et filtres en haut */}
              <div className="flex items-center space-x-4">
                {/* Filtres rapides avec badges */}
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Star className="w-3 h-3 mr-1" />
                    5 Star
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <Tag className="w-3 h-3 mr-1" />
                    Watch
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    10% off
                  </span>
                </div>
                
                {/* Contrôles de grille améliorés */}
                <div className="flex items-center space-x-1 bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setGridColumns(2)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      gridColumns === 2 
                        ? 'bg-white text-blue-600 shadow-md' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                    }`}
                  >
                    2
                  </button>
                  <button
                    onClick={() => setGridColumns(3)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      gridColumns === 3 
                        ? 'bg-white text-blue-600 shadow-md' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                    }`}
                  >
                    3
                  </button>
                  <button
                    onClick={() => setGridColumns(4)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      gridColumns === 4 
                        ? 'bg-white text-blue-600 shadow-md' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                    }`}
                  >
                    4
                  </button>
                </div>
              </div>
            </div>
            
            {/* Barre de recherche et tri améliorée */}
            <div className="flex flex-col lg:flex-row gap-6">
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
                  className="lg:hidden flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
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
          {/* Sidebar de filtres - À gauche avec style moderne */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-8">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <Filter className="w-5 h-5 mr-2 text-blue-600" />
                    Filtres
                  </h3>
                  <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full font-semibold">
                    {Object.keys(activeFilters).length}
                  </span>
                </div>
                <FilterSidebar
                  options={transformFilterOptions(realFilterOptions)}
                  activeFilters={activeFilters}
                  onFiltersChange={applyFilters}
                  onClearFilters={() => {
                    setActiveFilters({});
                    setFilteredProducts(products);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Contenu principal - Grille de produits */}
          <div className="flex-1 min-w-0">
            {/* Informations de pagination et résultats avec style moderne */}
            <div className="flex items-center justify-between mb-8 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-6">
                <PaginationInfo
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredProducts.length}
                  itemsPerPage={itemsPerPage}
                />
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <Grid className="w-4 h-4 mr-1" />
                    {filteredProducts.length} produits
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    Grille {gridColumns} colonnes
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Vue:</span>
                <LayoutGrid className="w-4 h-4 text-blue-600" />
              </div>
            </div>

            {/* Filtres actifs */}
            {Object.keys(activeFilters).length > 0 && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-blue-900">Filtres actifs</h3>
                  <button
                    onClick={() => {
                      setActiveFilters({});
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
                      {realFilterOptions.categories.find((c: {id: string, name: string, count: number}) => c.id === category)?.name || category}
                    </span>
                  ))}
                  {activeFilters.brands?.map((brand: string) => (
                    <span key={brand} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {realFilterOptions.brands.find((b: {id: string, name: string, count: number}) => b.id === brand)?.name || brand}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Grille de produits avec style Hope UI Pro */}
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                  <p className="text-gray-500 text-sm">Chargement des produits...</p>
                </div>
              </div>
            ) : (
              <>
                <div className={`grid ${getGridClasses()} gap-8`}>
                  {paginatedProducts.map((product) => (
                    <div key={product.id} className="group">
                      {/* Carte produit moderne avec informations de statut */}
                      <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group-hover:border-blue-200">
                        {/* Image avec overlay et badges */}
                        <div className="relative overflow-hidden">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          
                          {/* Badges de statut */}
                          <div className="absolute top-4 left-4 flex flex-col space-y-2">
                            {product.isNew && (
                              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg">
                                NEW
                              </span>
                            )}
                            {product.isOnSale && (
                              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg">
                                SALE
                              </span>
                            )}
                            {!product.inStock && (
                              <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg">
                                OUT OF STOCK
                              </span>
                            )}
                          </div>
                          
                          {/* Actions rapides */}
                          <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button 
                              onClick={() => handleProductAction(product.id, 'favorite')}
                              className={`p-2 rounded-full shadow-lg transition-colors ${
                                product.isFavorite 
                                  ? 'bg-red-500 text-white' 
                                  : 'bg-white text-gray-600 hover:text-red-500'
                              }`}
                              aria-label="Ajouter aux favoris"
                            >
                              <Heart className="w-4 h-4" />
                            </button>
                            <button 
                              className="p-2 bg-white text-gray-600 hover:text-blue-500 rounded-full shadow-lg transition-colors"
                              aria-label="Aperçu rapide"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                          
                          {/* Overlay avec bouton d'ajout au panier */}
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                            <button 
                              onClick={() => handleProductAction(product.id, 'cart')}
                              className="bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg flex items-center space-x-2"
                            >
                              <ShoppingCart className="w-4 h-4" />
                              <span>Ajouter au panier</span>
                            </button>
                          </div>
                        </div>
                        
                        {/* Informations produit */}
                        <div className="p-6">
                          <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
                            {product.name}
                          </h3>
                          
                          {/* Prix et évaluation */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl font-bold text-gray-900">
                                ${product.price}
                              </span>
                              {product.originalPrice && (
                                <span className="text-sm text-gray-500 line-through">
                                  ${product.originalPrice}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-1">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-4 h-4 ${
                                      i < Math.floor(product.rating) 
                                        ? 'text-yellow-400 fill-current' 
                                        : 'text-gray-300'
                                    }`} 
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                {product.rating}
                              </span>
                            </div>
                          </div>
                          
                          {/* Informations de livraison */}
                          <div className="flex items-center justify-between text-sm">
                            <span className={`font-medium ${
                              product.inStock 
                                ? 'text-green-600' 
                                : 'text-red-600'
                            }`}>
                              {product.inStock ? 'In Stock' : 'Out of Stock'}
                            </span>
                            <span className="text-gray-500">
                              Delivery by, Thu Jan 25
                            </span>
                          </div>
                          
                          {/* Avis */}
                          <div className="mt-2 text-sm text-gray-500">
                            {product.reviewCount}k Review
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination améliorée */}
                {totalPages > 1 && (
                  <div className="mt-16 flex justify-center">
                    <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={goToPage}
                      />
                    </div>
                  </div>
                )}
                
                {/* Bouton Load More */}
                <div className="mt-8 flex justify-center">
                  <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg">
                    Load More
                  </button>
                </div>
              </>
            )}

            {/* Message si aucun produit */}
            {!isLoading && filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <LayoutGrid className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun produit trouvé
                </h3>
                <p className="text-gray-500 mb-4">
                  Essayez de modifier vos critères de recherche ou vos filtres.
                </p>
                <button
                  onClick={() => {
                    setActiveFilters({});
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
        </div>
      </div>

      {/* Modal de filtres mobile */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileFilters(false)} />
          <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl">
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
                }}
                onClearFilters={() => {
                  setActiveFilters({});
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

