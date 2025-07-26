// converted from original HTML
"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, X, Filter, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryOption {
  value: string;
  label: string;
  count?: number;
}

interface BrandOption {
  value: string;
  label: string;
  count?: number;
}

interface ColorOption {
  value: string;
  label: string;
  color: string; // La couleur réelle pour l'affichage (ex: 'bg-red-500' ou '#FF0000')
  count?: number;
}

interface SizeOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterOptions {
  categories: CategoryOption[];
  brands: BrandOption[];
  priceRange: { min: number; max: number };
  colors: ColorOption[];
  sizes: SizeOption[];
  ratings: number[];
}

export interface ActiveFilters {
  search?: string;
  categories: string[];
  brands: string[];
  priceRange: { min: number; max: number };
  colors: string[];
  sizes: string[];
  rating: number | null;
}

interface FilterSidebarProps {
  options: FilterOptions; // Renommage de filterOptions en options
  activeFilters: ActiveFilters;
  onFiltersChange: (filters: ActiveFilters) => void;
  onClearFilters: () => void;
  className?: string;
  collapsed?: boolean;
}

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 pb-4 mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-3"
      >
        {title}
        {isOpen ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>
      {isOpen && <div className="space-y-2">{children}</div>}
    </div>
  );
}

export default function FilterSidebar({
  options, // Renommage de filterOptions en options
  activeFilters,
  onFiltersChange,
  onClearFilters,
  className = "",
  collapsed = false,
}: FilterSidebarProps) {
  const handleCategoryChange = (categoryValue: string, checked: boolean) => {
    const currentCategories = activeFilters?.categories || [];
    const newCategories = checked
      ? [...currentCategories, categoryValue]
      : currentCategories.filter((c) => c !== categoryValue);

    onFiltersChange({
      ...activeFilters,
      categories: newCategories,
    });
  };

  const handleBrandChange = (brandValue: string, checked: boolean) => {
    const currentBrands = activeFilters?.brands || [];
    const newBrands = checked
      ? [...currentBrands, brandValue]
      : currentBrands.filter((b) => b !== brandValue);

    onFiltersChange({
      ...activeFilters,
      brands: newBrands,
    });
  };

  const handlePriceChange = (min: number, max: number) => {
    onFiltersChange({
      ...activeFilters,
      priceRange: { min, max },
    });
  };

  const handleColorChange = (colorValue: string, checked: boolean) => {
    const currentColors = activeFilters?.colors || [];
    const newColors = checked
      ? [...currentColors, colorValue]
      : currentColors.filter((c) => c !== colorValue);

    onFiltersChange({
      ...activeFilters,
      colors: newColors,
    });
  };

  const handleSizeChange = (sizeValue: string, checked: boolean) => {
    const currentSizes = activeFilters?.sizes || [];
    const newSizes = checked
      ? [...currentSizes, sizeValue]
      : currentSizes.filter((s) => s !== sizeValue);

    onFiltersChange({
      ...activeFilters,
      sizes: newSizes,
    });
  };

  const handleRatingChange = (rating: number) => {
    onFiltersChange({
      ...activeFilters,
      rating: activeFilters.rating === rating ? null : rating,
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
      (activeFilters.priceRange &&
      options.priceRange && // Utilisation de options.priceRange
      (activeFilters.priceRange.min > options.priceRange.min ||
        activeFilters.priceRange.max < options.priceRange.max)
        ? 1
        : 0)
    );
  };

  return (
    <aside
      className={cn(
        `bg-white rounded-lg border border-gray-200 p-6 ${className}`,
        "w-full max-w-xs",
        collapsed ? "w-16 lg:w-16" : "w-72 lg:w-72"
      )}
    >
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
        {(options?.categories || []).map(
          (
            category // Utilisation de options.categories
          ) => (
            <label
              key={category.value}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={
                  activeFilters?.categories?.includes(category.value) || false
                }
                onChange={(e) =>
                  handleCategoryChange(category.value, e.target.checked)
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                {category.label} {category.count && `(${category.count})`}
              </span>
            </label>
          )
        )}
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Prix">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="Min"
              value={activeFilters?.priceRange?.min || 0}
              onChange={(e) =>
                handlePriceChange(
                  Number(e.target.value),
                  activeFilters?.priceRange?.max || 0
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              placeholder="Max"
              value={activeFilters?.priceRange?.max || 0}
              onChange={(e) =>
                handlePriceChange(
                  activeFilters?.priceRange?.min || 0,
                  Number(e.target.value)
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="text-xs text-gray-500">
            {options?.priceRange?.min || 0}€ - {options?.priceRange?.max || 0}€{" "}
            {/* Utilisation de options.priceRange */}
          </div>
        </div>
      </FilterSection>

      {/* Brands */}
      <FilterSection title="Marques">
        {(options?.brands || []).map(
          (
            brand // Utilisation de options.brands
          ) => (
            <label
              key={brand.value}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={activeFilters?.brands?.includes(brand.value) || false}
                onChange={(e) =>
                  handleBrandChange(brand.value, e.target.checked)
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                {brand.label} {brand.count && `(${brand.count})`}
              </span>
            </label>
          )
        )}
      </FilterSection>

      {/* Colors */}
      <FilterSection title="Couleurs">
        <div className="grid grid-cols-4 gap-2">
          {(options?.colors || []).map(
            (
              colorOpt // Utilisation de options.colors
            ) => (
              <button
                key={colorOpt.value}
                onClick={() =>
                  handleColorChange(
                    colorOpt.value,
                    !(activeFilters?.colors?.includes(colorOpt.value) || false)
                  )
                }
                style={{
                  backgroundColor: colorOpt.color.startsWith("bg-")
                    ? undefined
                    : colorOpt.color,
                }}
                className={`w-8 h-8 rounded-full border-2 ${colorOpt.color.startsWith("bg-") ? colorOpt.color : ""} ${
                  activeFilters?.colors?.includes(colorOpt.value)
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-gray-300"
                }`}
                title={colorOpt.label}
              />
            )
          )}
        </div>
      </FilterSection>

      {/* Sizes */}
      <FilterSection title="Tailles">
        <div className="grid grid-cols-4 gap-2">
          {(options?.sizes || []).map(
            (
              size // Utilisation de options.sizes
            ) => (
              <button
                key={size.value}
                onClick={() =>
                  handleSizeChange(
                    size.value,
                    !(activeFilters?.sizes?.includes(size.value) || false)
                  )
                }
                className={`px-3 py-1 text-sm border rounded ${
                  activeFilters?.sizes?.includes(size.value) || false
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-700 border-gray-300 hover:border-blue-500"
                }`}
              >
                {size.label} {size.count && `(${size.count})`}
              </button>
            )
          )}
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Note client">
        {(options?.ratings || []).map(
          (
            rating // Utilisation de options.ratings
          ) => (
            <button
              key={rating}
              onClick={() => handleRatingChange(rating)}
              className={`flex items-center space-x-2 w-full p-2 text-left rounded hover:bg-gray-50 ${
                activeFilters?.rating === rating
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700"
              }`}
            >
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < rating
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span>& plus</span>
            </button>
          )
        )}
      </FilterSection>
    </aside>
  );
}
