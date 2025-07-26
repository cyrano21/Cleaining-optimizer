// TypeScript React component for optimized image handling
'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackSrc?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  fallbackSrc = '/images/placeholder.svg',
  priority = false,
  fill = false,
  sizes,
  ...props
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    console.warn(`Image failed to load: ${imgSrc}`);
    setHasError(true);
    setIsLoading(false);
    
    // Essayer le fallback si ce n'est pas déjà le fallback
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
      setHasError(false);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  // Si l'image a échoué et qu'il n'y a pas de fallback, afficher un placeholder
  if (hasError && imgSrc === fallbackSrc) {
    return (
      <div 
        className={cn(
          "bg-gray-200 dark:bg-gray-700 flex items-center justify-center",
          className,
          width && height ? `w-[${width}px] h-[${height}px]` : ""
        )}
      >
        <svg 
          className="w-8 h-8 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {isLoading && (
        <div 
          className={cn(
            "absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse rounded",
            width && height ? `w-[${width}px] h-[${height}px]` : ""
          )}
        />
      )}
      <Image
        src={imgSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        sizes={sizes}
        priority={priority}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  );
}

// Hook pour précharger les images critiques
export function useImagePreload(src: string) {
  useState(() => {
    if (typeof window !== 'undefined') {
      const img = new window.Image();
      img.src = src;
    }
  });
}

// Utilitaire pour optimiser les URLs Unsplash
export function optimizeUnsplashUrl(url: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'auto' | 'webp' | 'jpg';
} = {}) {
  const { width = 400, height = 400, quality = 80, format = 'auto' } = options;
  
  if (!url.includes('images.unsplash.com')) {
    return url;
  }

  // Extraire l'ID de l'image Unsplash
  const match = url.match(/photo-([a-zA-Z0-9_-]+)/);
  if (!match) return url;

  const imageId = match[1];
  return `https://images.unsplash.com/photo-${imageId}?w=${width}&h=${height}&q=${quality}&fm=${format}&fit=crop&crop=center`;
}