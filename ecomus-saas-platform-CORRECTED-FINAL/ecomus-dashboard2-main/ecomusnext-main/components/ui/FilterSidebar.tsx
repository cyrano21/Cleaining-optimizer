// converted from original HTML
'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X, Filter } from 'lucide-react';

export interface FilterOptions {
  categories: string[];
  brands: string[];
  priceRange: { min: number; max: number };
  colors: string[];
  sizes: string[];
  ratings: number[];
}

export interface ActiveFilters {
  categories: string[];
  brands: string[];
  priceRange: { min: number; max: number };
  colors: string[];
  sizes: string[];
  rating: number | null;
}

interface FilterSidebarProps {
  filterOptions: FilterOptions;
  activeFilters: ActiveFilters;
  onFiltersChange: (filters: ActiveFilters) => void;
  onClearFilters: () => void;
  className?: string;
}

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function FilterSection({ title, children, defaultOpen = true }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 pb-4 mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-3"
      >
        {title}
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {isOpen && <div className="space-y-2">{children}</div>}
    </div>
  );
}

export default function FilterSidebar({
  filterOptions,
  activeFilters,
  onFiltersChange,
  onClearFilters,
  className = ''
}: FilterSidebarProps) {
  const handleCategoryChange = (category: string, checked: boolean) => {
    const currentCategories = activeFilters?.categories || [];
    const newCategories = checked
      ? [...currentCategories, category]
      : currentCategories.filter(c => c !== category);
    
    onFiltersChange({
      ...activeFilters,
      categories: newCategories
    });
  };

  const handleBrandChange = (brand: string, checked: boolean) => {
    const currentBrands = activeFilters?.brands || [];
    const newBrands = checked
      ? [...currentBrands, brand]
      : currentBrands.filter(b => b !== brand);
    
    onFiltersChange({
      ...activeFilters,
      brands: newBrands
    });
  };

  const handlePriceChange = (min: number, max: number) => {
    onFiltersChange({
      ...activeFilters,
      priceRange: { min, max }
    });
  };

  const handleColorChange = (color: string, checked: boolean) => {
    const currentColors = activeFilters?.colors || [];
    const newColors = checked
      ? [...currentColors, color]
      : currentColors.filter(c => c !== color);
    
    onFiltersChange({
      ...activeFilters,
      colors: newColors
    });
  };

  const handleSizeChange = (size: string, checked: boolean) => {
    const currentSizes = activeFilters?.sizes || [];
    const newSizes = checked
      ? [...currentSizes, size]
      : currentSizes.filter(s => s !== size);
    
    onFiltersChange({
      ...activeFilters,
      sizes: newSizes
    });
  };

  const handleRatingChange = (rating: number) => {
    onFiltersChange({
      ...activeFilters,
      rating: activeFilters.rating === rating ? null : rating
    });
  };

  const getActiveFiltersCount = () => {
    if (!activeFilters) return 0;
    
    return (
      (activeFilters.categories?.length || 0) +
      (activeFilters.brands?.length || 0) +
      (activeFilters.colors?.length || 0) +
      (activeFilters.sizes?.length || 0) +
      (activeFilters.rating ? 1 : 0) +
      (activeFilters.priceRange && filterOptions.priceRange && 
       (activeFilters.priceRange.min > filterOptions.priceRange.min || 
        activeFilters.priceRange.max < filterOptions.priceRange.max) ? 1 : 0)
    );
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filtres</h3>
          {getActiveFiltersCount() > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              {getActiveFiltersCount()}
            </span>
          )}
        </div>
        {getActiveFiltersCount() > 0 && (
          <button
            onClick={onClearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Effacer tout
          </button>
        )}
      </div>

      {/* Categories */}
      <FilterSection title="Catégories">
        {(filterOptions?.categories || []).map((category) => (
          <label key={category} className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={activeFilters?.categories?.includes(category) || false}
              onChange={(e) => handleCategoryChange(category, e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{category}</span>
          </label>
        ))}
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Prix">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="Min"
              value={activeFilters?.priceRange?.min || 0}
              onChange={(e) => handlePriceChange(Number(e.target.value), activeFilters?.priceRange?.max || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              placeholder="Max"
              value={activeFilters?.priceRange?.max || 0}
              onChange={(e) => handlePriceChange(activeFilters?.priceRange?.min || 0, Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="text-xs text-gray-500">
            {filterOptions?.priceRange?.min || 0}€ - {filterOptions?.priceRange?.max || 0}€
          </div>
        </div>
      </FilterSection>

      {/* Brands */}
      <FilterSection title="Marques">
        {(filterOptions?.brands || []).map((brand) => (
          <label key={brand} className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={activeFilters?.brands?.includes(brand) || false}
              onChange={(e) => handleBrandChange(brand, e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{brand}</span>
          </label>
        ))}
      </FilterSection>

      {/* Colors */}
      <FilterSection title="Couleurs">
        <div className="grid grid-cols-4 gap-2">
          {(filterOptions?.colors || []).map((color) => (
            <button
              key={color}
              onClick={() => handleColorChange(color, !(activeFilters?.colors?.includes(color) || false))}
              className={`w-8 h-8 rounded-full border-2 ${
                activeFilters?.colors?.includes(color)
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-300'
              }`}
              style={{ backgroundColor: color.toLowerCase() }}
              title={color}
            />
          ))}
        </div>
      </FilterSection>

      {/* Sizes */}
      <FilterSection title="Tailles">
        <div className="grid grid-cols-4 gap-2">
          {(filterOptions?.sizes || []).map((size) => (
            <button
              key={size}
              onClick={() => handleSizeChange(size, !(activeFilters?.sizes?.includes(size) || false))}
              className={`px-3 py-1 text-sm border rounded ${
                activeFilters?.sizes?.includes(size) || false
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Note client">
        {(filterOptions?.ratings || []).map((rating) => (
          <button
            key={rating}
            onClick={() => handleRatingChange(rating)}
            className={`flex items-center space-x-2 w-full p-2 text-left rounded hover:bg-gray-50 ${
              activeFilters?.rating === rating
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700'
            }`}
          >
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < rating
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span>& plus</span>
          </button>
        ))}
      </FilterSection>
    </div>
  );
}