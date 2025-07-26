// converted from original HTML
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Eye, Star } from 'lucide-react';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  category: string;
  isNew?: boolean;
  isSale?: boolean;
  discount?: number;
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
  onFavoriteClick?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  variant?: 'vertical' | 'horizontal';
}

export default function ProductCard({ 
  product, 
  onAddToCart, 
  onAddToWishlist, 
  onFavoriteClick,
  onQuickView,
  variant = 'vertical'
}: ProductCardProps) {
  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className={`group relative bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden ${
      variant === 'horizontal' ? 'flex' : ''
    }`}>
      {/* Product Image */}
      <div className={`relative overflow-hidden bg-gray-100 ${
        variant === 'horizontal' ? 'w-48 h-48 flex-shrink-0' : 'aspect-square'
      }`}>
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isNew && (
            <span className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded">
              Nouveau
            </span>
          )}
          {product.isSale && discountPercentage > 0 && (
            <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded">
              -{discountPercentage}%
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => (onFavoriteClick || onAddToWishlist)?.(product)}
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
            title="Ajouter aux favoris"
          >
            <Heart className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => onQuickView?.(product)}
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
            title="Aperçu rapide"
          >
            <Eye className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Quick Add to Cart */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => onAddToCart?.(product)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Ajouter au panier
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className={`p-4 ${variant === 'horizontal' ? 'flex-1' : ''}`}>
        {/* Category */}
        <p className="text-sm text-gray-500 mb-1">{product.category}</p>
        
        {/* Product Name */}
        <Link href={`/e-commerce/product/${product.id}`}>
          <h3 className="font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 mb-2">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
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
          <span className="text-sm text-gray-500">({product.reviewCount})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-gray-900">
            {product.price.toFixed(2)} €
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-gray-500 line-through">
              {product.originalPrice.toFixed(2)} €
            </span>
          )}
        </div>
      </div>
    </div>
  );
}