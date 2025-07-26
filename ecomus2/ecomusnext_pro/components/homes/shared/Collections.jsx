'use client';

import React from 'react';
import Link from 'next/link';

const Collections = ({ config, store }) => {
  const { variant = 'electronic', showTitle = true, layout = 'grid' } = config;

  const getVariantStyles = () => {
    switch (variant) {
      case 'fashion':
        return {
          bgClass: 'bg-gray-50',
          titleClass: 'text-gray-800',
          cardClass: 'bg-white hover:bg-pink-50',
          buttonClass: 'bg-pink-600 hover:bg-pink-700'
        };
      case 'cosmetic':
        return {
          bgClass: 'bg-rose-50',
          titleClass: 'text-gray-800',
          cardClass: 'bg-white hover:bg-rose-50',
          buttonClass: 'bg-rose-600 hover:bg-rose-700'
        };
      default:
        return {
          bgClass: 'bg-gray-50',
          titleClass: 'text-gray-800',
          cardClass: 'bg-white hover:bg-blue-50',
          buttonClass: 'bg-blue-600 hover:bg-blue-700'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <section className={`py-16 ${styles.bgClass}`}>
      <div className="container mx-auto px-4">
        {showTitle && (
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold ${styles.titleClass} mb-4`}>
              Featured Collections
            </h2>
            <p className="text-lg text-gray-600">
              Curated collections for every style
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className={`${styles.cardClass} rounded-xl p-8 text-center shadow-sm hover:shadow-md transition-all duration-300`}>
            <div className="text-4xl mb-4">
              {variant === 'fashion' ? '👔' : variant === 'cosmetic' ? '💅' : '💻'}
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {variant === 'fashion' ? 'Premium Fashion' : variant === 'cosmetic' ? 'Luxury Beauty' : 'Tech Essentials'}
            </h3>
            <p className="text-gray-600 mb-4">
              {variant === 'fashion' ? 'High-quality fashion items' : variant === 'cosmetic' ? 'Premium beauty products' : 'Latest tech gadgets'}
            </p>
            <Link href="/collections/featured" className={`px-6 py-2 ${styles.buttonClass} text-white rounded-lg transition-colors`}>
              Explore
            </Link>
          </div>
          
          <div className={`${styles.cardClass} rounded-xl p-8 text-center shadow-sm hover:shadow-md transition-all duration-300`}>
            <div className="text-4xl mb-4">
              {variant === 'fashion' ? '👗' : variant === 'cosmetic' ? '💄' : '📱'}
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {variant === 'fashion' ? 'Casual Wear' : variant === 'cosmetic' ? 'Daily Essentials' : 'Mobile Devices'}
            </h3>
            <p className="text-gray-600 mb-4">
              {variant === 'fashion' ? 'Comfortable everyday wear' : variant === 'cosmetic' ? 'Daily beauty routine' : 'Smartphones and tablets'}
            </p>
            <Link href="/collections/casual" className={`px-6 py-2 ${styles.buttonClass} text-white rounded-lg transition-colors`}>
              Explore
            </Link>
          </div>
          
          <div className={`${styles.cardClass} rounded-xl p-8 text-center shadow-sm hover:shadow-md transition-all duration-300`}>
            <div className="text-4xl mb-4">
              {variant === 'fashion' ? '👠' : variant === 'cosmetic' ? '🌸' : '🎧'}
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {variant === 'fashion' ? 'Accessories' : variant === 'cosmetic' ? 'Organic Collection' : 'Audio Gear'}
            </h3>
            <p className="text-gray-600 mb-4">
              {variant === 'fashion' ? 'Complete your look' : variant === 'cosmetic' ? 'Natural beauty products' : 'High-quality audio equipment'}
            </p>
            <Link href="/collections/accessories" className={`px-6 py-2 ${styles.buttonClass} text-white rounded-lg transition-colors`}>
              Explore
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Collections;
