import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Hero = ({ 
  variant = 'default',
  title = 'Welcome to Our Store',
  subtitle = 'Discover amazing products and great deals',
  ctaText = 'Shop Now',
  ctaLink = '/products',
  backgroundImage = '/images/hero/hero-bg.jpg',
  showStore = true,
  store = null,
  className = '',
  ...props 
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'electronic':
        return 'bg-gradient-to-r from-blue-900 to-purple-900 text-white';
      case 'fashion':
        return 'bg-gradient-to-r from-pink-500 to-purple-600 text-white';
      case 'cosmetic':
        return 'bg-gradient-to-r from-purple-500 to-pink-600 text-white';
      case 'dark':
        return 'bg-gray-900 text-white';
      default:
        return 'bg-white text-gray-900';
    }
  };

  const styles = getVariantStyles();

  return (
    <section className={`relative py-20 ${styles.bgClass}`}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            {showStore && store && (
              <div className="space-y-2">
                <h1 className={`text-5xl font-bold ${styles.textClass}`}>
                  {store.name}
                </h1>
                <p className={`text-xl ${styles.textClass} opacity-90`}>
                  {store.description}
                </p>
              </div>
            )}
            
            <div className="space-y-4">
              <h2 className={`text-3xl font-semibold ${styles.textClass}`}>
                {variant === 'fashion' ? 'Latest Fashion Trends' : 
                 variant === 'cosmetic' ? 'Beauty Essentials' : 
                 'Latest Technology'}
              </h2>
              <p className={`text-lg ${styles.textClass} opacity-80`}>
                {variant === 'fashion' ? 'Discover the newest styles and trends' :
                 variant === 'cosmetic' ? 'Premium beauty products for everyone' :
                 'Cutting-edge electronics and gadgets'}
              </p>
            </div>
            
            <div className="flex space-x-4">
              <Link 
                href="/products" 
                className={`px-8 py-3 ${styles.buttonClass} text-white rounded-lg font-semibold transition-colors`}
              >
                Shop Now
              </Link>
              <Link 
                href="/about" 
                className={`px-8 py-3 border-2 border-current ${styles.textClass} rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors`}
              >
                Learn More
              </Link>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative w-full h-96 bg-white bg-opacity-10 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`text-6xl ${styles.textClass} opacity-50`}>
                  {variant === 'fashion' ? '👗' : 
                   variant === 'cosmetic' ? '💄' : 
                   '📱'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
