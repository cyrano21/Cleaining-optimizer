"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Types pour les configurations de shop
interface ShopConfig {
  layout: 'default' | 'fullwidth' | 'sidebar-left' | 'sidebar-right' | 'collections' | 'list';
  productStyle: string;
  gridSize: number;
  showFilters: boolean;
  showSorting: boolean;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

interface ShopPreviewProps {
  config: ShopConfig;
  storeData?: any;
  products?: any[];
}

// Simulation des données de produits pour la prévisualisation
const MOCK_PRODUCTS = [
  {
    id: 1,
    title: "T-shirt Premium",
    price: 29.99,
    originalPrice: 39.99,
    image: "/images/products/product-1.jpg",
    category: "Vêtements",
    rating: 4.5,
    reviews: 24,
    colors: ["#000", "#fff", "#999"],
    sizes: ["S", "M", "L", "XL"],
    isNew: true,
    onSale: true
  },
  {
    id: 2,
    title: "Jean Slim Fit",
    price: 79.99,
    image: "/images/products/product-2.jpg",
    category: "Vêtements",
    rating: 4.8,
    reviews: 156,
    colors: ["#1a1a1a", "#4a5568"],
    sizes: ["28", "30", "32", "34", "36"],
    isNew: false,
    onSale: false
  },
  {
    id: 3,
    title: "Sneakers Urban",
    price: 120.00,
    originalPrice: 150.00,
    image: "/images/products/product-3.jpg",
    category: "Chaussures",
    rating: 4.3,
    reviews: 89,
    colors: ["#fff", "#000", "#ff0000"],
    sizes: ["38", "39", "40", "41", "42", "43"],
    isNew: true,
    onSale: true
  },
  {
    id: 4,
    title: "Sac à dos Design",
    price: 65.99,
    image: "/images/products/product-4.jpg",
    category: "Accessoires",
    rating: 4.6,
    reviews: 203,
    colors: ["#000", "#8B4513", "#228B22"],
    isNew: false,
    onSale: false
  },
  {
    id: 5,
    title: "Montre Élégante",
    price: 199.99,
    originalPrice: 249.99,
    image: "/images/products/product-5.jpg",
    category: "Montres",
    rating: 4.9,
    reviews: 78,
    colors: ["#C0C0C0", "#FFD700", "#000"],
    isNew: true,
    onSale: true
  },
  {
    id: 6,
    title: "Casquette Baseball",
    price: 24.99,
    image: "/images/products/product-6.jpg",
    category: "Accessoires",
    rating: 4.2,
    reviews: 45,
    colors: ["#000", "#fff", "#ff0000", "#0000ff"],
    sizes: ["S/M", "L/XL"],
    isNew: false,
    onSale: false
  }
];

// Composant ProductCard personnalisé inspiré d'ecomusnext-main
const CustomProductCard = ({ product, style, colors }: { product: any, style: string, colors: any }) => {
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || colors.primary);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="bg-white rounded-lg border hover:shadow-lg transition-all duration-300 overflow-hidden"
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Image container */}
      <div className="relative overflow-hidden bg-gray-100">
        <div className="aspect-square flex items-center justify-center">
          <div 
            className="w-full h-full flex items-center justify-center text-gray-400"
            style={{ backgroundColor: selectedColor + '10' }}
          >
            📷 {product.title}
          </div>
        </div>
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isNew && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
              Nouveau
            </span>
          )}
          {product.onSale && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
              -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
            </span>
          )}
        </div>

        {/* Actions au hover */}
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center"
          >
            <div className="flex gap-2">
              <Button size="sm" style={{ backgroundColor: colors.primary }}>
                Aperçu
              </Button>
              <Button size="sm" variant="outline" className="bg-white">
                ❤️
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-4">
        <div className="mb-2">
          <span className="text-xs text-gray-500 uppercase tracking-wide">
            {product.category}
          </span>
        </div>
        
        <h3 className="font-semibold mb-2 line-clamp-2">{product.title}</h3>
        
        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex text-yellow-400 text-sm">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i}>
                {i < Math.floor(product.rating) ? '★' : '☆'}
              </span>
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1">
            ({product.reviews})
          </span>
        </div>

        {/* Couleurs */}
        {product.colors && (
          <div className="flex gap-1 mb-3">
            {product.colors.map((color: string, index: number) => (
              <button
                key={index}
                className={`w-6 h-6 rounded-full border-2 ${
                  selectedColor === color ? 'border-gray-800' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
              />
            ))}
          </div>
        )}

        {/* Prix */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span 
              className="font-bold text-lg"
              style={{ color: colors.primary }}
            >
              €{product.price}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                €{product.originalPrice}
              </span>
            )}
          </div>
        </div>

        {/* Bouton d'ajout */}
        <Button 
          className="w-full mt-3"
          style={{ backgroundColor: colors.accent }}
        >
          Ajouter au panier
        </Button>
      </div>
    </motion.div>
  );
};

// Composant principal ShopPreview
export default function ShopPreview({ config, storeData, products = MOCK_PRODUCTS }: ShopPreviewProps) {
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [sortOrder, setSortOrder] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');

  const productsPerPage = config.gridSize * 2;

  useEffect(() => {
    let sorted = [...products];
    
    switch (sortOrder) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }
    
    setFilteredProducts(sorted);
  }, [sortOrder, products]);

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  return (
    <div className="w-full">
      {/* En-tête du shop */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2" style={{ color: config.colors.primary }}>
          {storeData?.name || 'Ma Boutique'}
        </h1>
        <p className="text-gray-600">
          {storeData?.description || 'Découvrez notre collection exclusive de produits de qualité'}
        </p>
      </div>

      {/* Barre de contrôle */}
      <div 
        className={`flex items-center justify-between mb-6 p-4 rounded-lg border ${
          config.layout === 'sidebar-left' || config.layout === 'sidebar-right' 
            ? 'bg-gray-50' 
            : 'bg-white'
        }`}
      >
        {/* Filtres */}
        {config.showFilters && (
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <span className="mr-2">🔍</span>
              Filtres
            </Button>
            <Button variant="outline" size="sm">
              Catégories
            </Button>
          </div>
        )}

        {/* Contrôles de vue */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {filteredProducts.length} produit(s)
          </span>
          
          {/* Boutons de grille */}
          <div className="flex border rounded">
            {[2, 3, 4, 5].map((size) => (
              <button
                key={size}
                className={`px-3 py-1 text-sm ${
                  config.gridSize === size 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => {/* Cette fonctionnalité sera connectée plus tard */}}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Tri */}
        {config.showSorting && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Trier par:</span>
            <select
              className="border rounded px-3 py-1 text-sm"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="default">Par défaut</option>
              <option value="price-low">Prix croissant</option>
              <option value="price-high">Prix décroissant</option>
              <option value="name">Nom A-Z</option>
              <option value="rating">Mieux notés</option>
            </select>
          </div>
        )}
      </div>

      {/* Grille de produits */}
      <div className="grid gap-6" style={{
        gridTemplateColumns: `repeat(${config.gridSize}, 1fr)`
      }}>
        {paginatedProducts.map((product) => (
          <CustomProductCard
            key={product.id}
            product={product}
            style={config.productStyle}
            colors={config.colors}
          />
        ))}
      </div>

      {/* Pagination */}
      {Math.ceil(filteredProducts.length / productsPerPage) > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex gap-2">
            {Array.from({ length: Math.ceil(filteredProducts.length / productsPerPage) }).map((_, index) => (
              <button
                key={index}
                className={`px-4 py-2 rounded ${
                  currentPage === index + 1
                    ? 'text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
                style={currentPage === index + 1 ? { backgroundColor: config.colors.primary } : {}}
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Styles CSS personnalisés */}
      <style jsx global>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
