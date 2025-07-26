import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Banner = ({ 
  variant = "default",
  title,
  subtitle,
  className = "",
  ...props 
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'electronic':
        return 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white';
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

  // TODO: Intégrer la logique spécifique du composant original
  // Source: "use client";
  
  return (
    <section className={`py-16 md:py-24 ${getVariantClasses()} ${className}`}>
      <div className="container mx-auto px-4">
        {title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {title}
            </h2>
            {subtitle && (
              <p className="text-lg opacity-90 max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}
        
        {/* Contenu principal du composant */}
        <div className="text-center">
          <p className="text-lg opacity-75">
            🔄 Composant Banner unifié - En cours de migration
          </p>
          <p className="text-sm mt-2 opacity-60">
            Variant actuel: {variant}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Banner;