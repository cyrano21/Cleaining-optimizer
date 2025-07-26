'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Categories = ({ config, store }) => {
  const [categories, setCategories] = useState([]);
  const { variant = 'electronic', limit = 8, showTitle = true } = config;

  useEffect(() => {
    // Pour l'instant, utilisons des catégories par défaut
    const defaultCategories = [
      { _id: '1', name: 'Smartphones', slug: 'smartphones', image: null },
      { _id: '2', name: 'Laptops', slug: 'laptops', image: null },
      { _id: '3', name: 'Headphones', slug: 'headphones', image: null },
      { _id: '4', name: 'Accessories', slug: 'accessories', image: null },
      { _id: '5', name: 'Gaming', slug: 'gaming', image: null },
      { _id: '6', name: 'Smart Home', slug: 'smart-home', image: null },
    ];
    
    setCategories(defaultCategories.slice(0, limit));
  }, [store, limit]);

  // Styles selon le variant
  const getVariantStyles = () => {
    switch (variant) {
      case 'fashion':
        return {
          bgClass: 'bg-gray-50',
          titleClass: 'text-gray-800',
          cardClass: 'bg-white hover:bg-pink-50',
          textClass: 'text-gray-700'
        };
      case 'cosmetic':
        return {
          bgClass: 'bg-rose-50',
          titleClass: 'text-gray-800',
          cardClass: 'bg-white hover:bg-rose-50',
          textClass: 'text-gray-700'
        };
      default: // electronic
        return {
          bgClass: 'bg-gray-100',
          titleClass: 'text-gray-800',
          cardClass: 'bg-white hover:bg-blue-50',
          textClass: 'text-gray-700'
        };
    }
  };

  const styles = getVariantStyles();

  if (categories.length === 0) return null;

  return (
    <section className={`py-16 ${styles.bgClass}`}>
      <div className="container mx-auto px-4">
        {showTitle && (
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold ${styles.titleClass} mb-4`}>
              Shop by Category
            </h2>
            <p className={`text-lg ${styles.textClass} opacity-80`}>
              Discover our wide range of products
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link 
              key={category._id} 
              href={`/categories/${category.slug}`}
              className={`group ${styles.cardClass} rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300`}
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      width={64}
                      height={64}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">
                      {variant === 'fashion' ? '👕' : 
                       variant === 'cosmetic' ? '💄' : 
                       '📱'}
                    </span>
                  )}
                </div>
                <h3 className={`font-semibold ${styles.textClass} group-hover:opacity-80 transition-opacity`}>
                  {category.name}
                </h3>
                {category.description && (
                  <p className={`text-sm ${styles.textClass} opacity-60`}>
                    {category.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
