'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Products = ({ config, store, products }) => {
  const { 
    variant = 'electronic', 
    title = 'Featured Products', 
    limit = 12, 
    showFilters = false 
  } = config;

  // Mapper les produits pour s'assurer que imgSrc et imgHoverSrc sont disponibles
  const mappedProducts = products?.products?.map(product => ({
    ...product,
    imgSrc: product.images?.[0] || '/images/placeholder.jpg',
    imgHoverSrc: product.images?.[1] || product.images?.[0] || '/images/placeholder.jpg'
  })).slice(0, limit) || [];

  // Styles selon le variant
  const getVariantStyles = () => {
    switch (variant) {
      case 'fashion':
        return {
          bgClass: 'bg-white',
          titleClass: 'text-gray-800',
          cardClass: 'bg-white hover:bg-gray-50',
          priceClass: 'text-pink-600',
          buttonClass: 'bg-pink-600 hover:bg-pink-700'
        };
      case 'cosmetic':
        return {
          bgClass: 'bg-white',
          titleClass: 'text-gray-800',
          cardClass: 'bg-white hover:bg-gray-50',
          priceClass: 'text-rose-600',
          buttonClass: 'bg-rose-600 hover:bg-rose-700'
        };
      default: // electronic
        return {
          bgClass: 'bg-white',
          titleClass: 'text-gray-800',
          cardClass: 'bg-white hover:bg-gray-50',
          priceClass: 'text-blue-600',
          buttonClass: 'bg-blue-600 hover:bg-blue-700'
        };
    }
  };

  const styles = getVariantStyles();

  if (mappedProducts.length === 0) return null;

  return (
    <section className={`py-16 ${styles.bgClass}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className={`text-3xl font-bold ${styles.titleClass} mb-4`}>
            {title}
          </h2>
          <p className={`text-lg text-gray-600`}>
            Discover our amazing collection
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mappedProducts.map((product) => (
            <div 
              key={product._id} 
              className={`group ${styles.cardClass} rounded-xl shadow-sm hover:shadow-lg transition-all duration-300`}
            >
              <div className="relative overflow-hidden rounded-t-xl">
                <Image
                  src={product.imgSrc}
                  alt={product.name}
                  width={300}
                  height={300}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.imgHoverSrc && product.imgHoverSrc !== product.imgSrc && (
                  <Image
                    src={product.imgHoverSrc}
                    alt={product.name}
                    width={300}
                    height={300}
                    className="absolute inset-0 w-full h-64 object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                )}
                
                {/* Badges */}
                <div className="absolute top-4 left-4 space-y-2">
                  {product.isNew && (
                    <span className="bg-green-500 text-white px-2 py-1 text-xs rounded">
                      NEW
                    </span>
                  )}
                  {product.salePrice && (
                    <span className="bg-red-500 text-white px-2 py-1 text-xs rounded">
                      SALE
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="font-semibold text-gray-800 mb-2 group-hover:opacity-80 transition-opacity">
                  {product.name}
                </h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-x-2">
                    {product.salePrice ? (
                      <>
                        <span className={`font-bold ${styles.priceClass}`}>
                          ${product.salePrice}
                        </span>
                        <span className="text-gray-400 line-through">
                          ${product.price}
                        </span>
                      </>
                    ) : (
                      <span className={`font-bold ${styles.priceClass}`}>
                        ${product.price}
                      </span>
                    )}
                  </div>
                  
                  <Link
                    href={`/products/${product.slug || product._id}`}
                    className={`px-4 py-2 ${styles.buttonClass} text-white rounded text-sm font-medium transition-colors`}
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link
            href="/products"
            className={`inline-block px-8 py-3 ${styles.buttonClass} text-white rounded-lg font-semibold transition-colors`}
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Products;
