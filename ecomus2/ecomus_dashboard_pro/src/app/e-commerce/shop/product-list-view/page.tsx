// converted from original HTML
'use client';

import React, { useState } from 'react';
import ProductCard from '@/components/ui/ProductCard';
import FilterSidebar from '@/components/ui/FilterSidebar';
import SearchBar from '@/components/ui/SearchBar';
import SortDropdown from '@/components/ui/SortDropdown';
import Pagination, { PaginationInfo, usePagination } from '@/components/ui/Pagination';
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { List, Filter, X, LayoutList } from 'lucide-react';

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
    inStock: true,
    description: 'Un smartphone haut de gamme avec écran OLED 6.7", processeur A16 Bionic et triple caméra 48MP. Design premium en aluminium avec résistance à l\'eau IP68.'
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
    inStock: true,
    description: 'Casque sans fil avec réduction de bruit active, autonomie 30h, son Hi-Res et charge rapide. Confort optimal pour un usage prolongé.'
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
    inStock: true,
    description: 'Montre connectée étanche avec GPS, moniteur cardiaque, suivi du sommeil et plus de 100 modes sportifs. Écran AMOLED toujours allumé.'
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
    inStock: true,
    description: 'T-shirt en coton bio premium, coupe moderne et confortable. Matière douce et respirante, parfait pour le quotidien.'
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
    inStock: true,
    description: 'Chaussures de running avec technologie d\'amorti avancée, semelle en mousse réactive et tige respirante. Idéales pour les longues distances.'
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
    inStock: true,
    description: 'Sac à dos urbain avec compartiment laptop 15", poches organisées et matière résistante à l\'eau. Design minimaliste et fonctionnel.'
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
    inStock: true,
    description: 'PC portable gaming avec RTX 4070, processeur Intel i7, 16GB RAM et SSD 1TB. Écran 144Hz pour une expérience gaming optimale.'
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
    inStock: true,
    description: 'Lunettes de soleil design avec verres polarisés UV400, monture légère en titane et étui de protection inclus.'
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
    inStock: true,
    description: 'Veste en cuir véritable, finition artisanale, doublure en soie et coupe ajustée. Style intemporel et qualité exceptionnelle.'
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
    inStock: true,
    description: 'Tablette graphique professionnelle avec stylet sensible à la pression, écran tactile 4K et logiciels créatifs inclus.'
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
    inStock: true,
    description: 'Parfum masculin aux notes boisées et épicées, tenue longue durée et flacon design. Fragrance sophistiquée et élégante.'
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
    inStock: true,
    description: 'Enceinte portable étanche avec son 360°, autonomie 24h et connexion multi-appareils. Basses profondes et aigus cristallins.'
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

export default function ProductListViewPage() {  const [products, setProducts] = useState<Product[]>(realProducts);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(realProducts);
  const [sortBy, setSortBy] = useState('relevance');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<any>({});
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const itemsPerPage = 10;
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
        product.brand.toLowerCase().includes(filters.search.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(filters.search.toLowerCase()))
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

  return (
    <DashboardLayout>
    <div className="min-h-screen bg-gray-50">
      {/* Header de la page */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Vue Liste Produits</h1>
                <p className="text-sm text-gray-600 mt-1">Découvrez notre sélection en vue liste détaillée</p>
              </div>
              <div className="flex items-center space-x-2">
                <LayoutList className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-600">Affichage liste</span>
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
          {/* Sidebar de filtres - À gauche */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-8">
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

          {/* Contenu principal - Liste de produits */}
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
                  {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
                </div>
                <div className="text-sm text-gray-500">
                  Vue liste
                </div>
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
                      {realFilterOptions.categories.find(c => c.id === category)?.name || category}
                    </span>
                  ))}
                  {activeFilters.brands?.map((brand: string) => (
                    <span key={brand} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {realFilterOptions.brands.find(b => b.id === brand)?.name || brand}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Liste de produits */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  {paginatedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onFavoriteClick={() => handleProductAction(product.id, 'favorite')}
                      onAddToCart={() => handleProductAction(product.id, 'cart')}
                      variant="horizontal"
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
                  <LayoutList className="w-16 h-16 mx-auto" />
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
                title="Close filters"
                aria-label="Close filters"
                onClick={() => setShowMobileFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-md"
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

