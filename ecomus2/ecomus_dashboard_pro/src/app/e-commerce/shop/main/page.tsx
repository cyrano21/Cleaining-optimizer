'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import SearchBar from '@/components/ui/SearchBar';
import FilterSidebar, { FilterOptions as SidebarFilterOptions } from '@/components/ui/FilterSidebar';
import SortDropdown, { defaultSortOptions } from '@/components/ui/SortDropdown';
import ProductCard from '@/components/ui/ProductCard';
import Pagination, { usePagination } from '@/components/ui/Pagination';
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Grid, List, Filter, X } from 'lucide-react';

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
  categories: { id: string; name: string; count: number }[];
  brands: { id: string; name: string; count: number }[];
  colors: { id: string; name: string; color: string; count: number }[];
  priceRange: { min: number; max: number };
  ratings: number[];
}

const realProducts: Product[] = [
  {
    id: '1',
    name: 'Smartphone Premium XR',
    price: 899,
    originalPrice: 1099,
    image: '/images/products/phone1.jpg',
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
    image: '/images/products/headphones1.jpg',
    rating: 4.8,
    reviewCount: 89,
    category: 'electronics',
    brand: 'AudioTech',
    colors: ['black', 'silver'],
    isNew: false,
    isOnSale: false,
    isFavorite: true,
    inStock: true
  }
];

const realFilterOptions: FilterOptions = {
  categories: [
    { id: 'electronics', name: 'Électronique', count: 45 },
    { id: 'clothing', name: 'Vêtements', count: 67 }
  ],
  brands: [
    { id: 'techbrand', name: 'TechBrand', count: 12 },
    { id: 'audiotech', name: 'AudioTech', count: 8 }
  ],
  colors: [
    { id: 'black', name: 'Noir', color: '#000000', count: 34 },
    { id: 'white', name: 'Blanc', color: '#FFFFFF', count: 28 }
  ],
  priceRange: { min: 0, max: 2000 },
  ratings: [5, 4, 3, 2, 1]
};

const transformFilterOptions = (options: FilterOptions): SidebarFilterOptions => {
  return {
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
      count: color.count,
      color: color.color
    })),
    sizes: [], // Ajout de la propriété sizes manquante
    priceRange: options.priceRange,
    ratings: options.ratings
  };
};

export default function ShopMainPage() {
  const [products, setProducts] = useState<Product[]>(realProducts);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(realProducts);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<any>({});
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase()) ||
      product.brand.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

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
        break;
    }
    
    setFilteredProducts(sorted);
  };

  const applyFilters = (filters: any) => {
    setActiveFilters(filters);
    let filtered = [...products];
    
    if (searchQuery) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(product => 
        filters.categories.includes(product.category)
      );
    }
    
    setFilteredProducts(filtered);
  };

  const clearFilters = () => {
    setActiveFilters({});
    setSearchQuery('');
    setFilteredProducts(products);
  };

  const handleFavoriteToggle = (productId: string) => {
    setProducts(prev => 
      prev.map(product => 
        product.id === productId 
          ? { ...product, isFavorite: !product.isFavorite }
          : product
      )
    );
    
    setFilteredProducts(prev => 
      prev.map(product => 
        product.id === productId 
          ? { ...product, isFavorite: !product.isFavorite }
          : product
      )
    );
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Boutique
                </h1>
                <p className="text-gray-600">
                  {filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''} trouvé{filteredProducts.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                <SearchBar
                  onSearch={handleSearch}
                  placeholder="Rechercher des produits..."
                  className="w-full sm:w-80"
                />
                <SortDropdown
                  options={defaultSortOptions}
                  value={sortBy}
                  onChange={handleSort}
                  className="w-48"
                />
                <Button variant="outline" className="lg:hidden" onClick={() => setShowMobileFilters(true)}>
                  <Filter className="w-4 h-4" />
                  Filtres
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Vue:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="px-3"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="px-3"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="hidden lg:block">
              <FilterSidebar
                options={transformFilterOptions(realFilterOptions)}
                activeFilters={activeFilters}
                onFiltersChange={applyFilters}
                onClearFilters={clearFilters}
              />
            </div>

            <div className="lg:col-span-3">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Filter className="w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Aucun produit trouvé
                    </h3>
                    <p className="text-gray-600">
                      Essayez de modifier vos filtres ou votre recherche
                    </p>
                  </div>
                  <Button onClick={clearFilters} variant="outline">
                    Réinitialiser les filtres
                  </Button>
                </div>
              ) : (
                <>
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                      {paginatedProducts.map((product: Product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onFavoriteClick={() => handleFavoriteToggle(product.id)}
                          variant="vertical"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {paginatedProducts.map((product: Product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onFavoriteClick={() => handleFavoriteToggle(product.id)}
                          variant="horizontal"
                        />
                      ))}
                    </div>
                  )}

                  {totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={goToPage}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setShowMobileFilters(false)} />
            <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-medium">Filtres</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMobileFilters(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-4">
                <FilterSidebar
                  options={transformFilterOptions(realFilterOptions)}
                  activeFilters={activeFilters}
                  onFiltersChange={(filters) => {
                    applyFilters(filters);
                    setShowMobileFilters(false);
                  }}
                  onClearFilters={clearFilters}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

