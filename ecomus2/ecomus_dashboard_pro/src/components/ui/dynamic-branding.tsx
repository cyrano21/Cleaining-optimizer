"use client";

import React from 'react';
import Link from 'next/link';
import { useLogos, useBranding } from '@/hooks/useSystemSettings';

interface DynamicLogoProps {
  type: 'main' | 'auth' | 'ecommerce' | 'store' | 'admin' | 'email';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  alt?: string;
}

export function DynamicLogo({ 
  type, 
  size = 'md', 
  className = '', 
  alt 
}: DynamicLogoProps) {
  const { getLogo, loading } = useLogos();
  const { branding } = useBranding();

  const sizeClasses = {
    sm: 'h-6 w-auto',
    md: 'h-8 w-auto',
    lg: 'h-12 w-auto',
    xl: 'h-16 w-auto'
  };

  if (loading) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-200 animate-pulse rounded ${className}`} />
    );
  }

  const logoSrc = getLogo(`${type}Logo`);
  const logoAlt = alt || `${branding.companyName} - ${type} logo`;

  return (
    <img
      src={logoSrc}
      alt={logoAlt}
      className={`${sizeClasses[size]} object-contain ${className}`}
      onError={(e) => {
        e.currentTarget.src = '/images/placeholder.svg';
      }}
    />
  );
}

interface DynamicNavigationProps {
  className?: string;
}

export function DynamicNavigation({ className = '' }: DynamicNavigationProps) {
  const { branding } = useBranding();

  return (
    <nav className={`flex items-center justify-between p-4 bg-white shadow-sm ${className}`}>
      <Link href="/" className="flex items-center gap-3">
        <DynamicLogo type="main" size="lg" />
        <div>
          <h1 className="text-xl font-bold text-purple-600">
            {branding.companyName}
          </h1>
          <p className="text-sm text-gray-600">{branding.tagline}</p>
        </div>
      </Link>

      <div className="flex items-center gap-4">
        <Link 
          href="/e-commerce" 
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <DynamicLogo type="ecommerce" size="sm" />
          <span>E-commerce</span>
        </Link>
        
        <Link 
          href="/admin" 
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <DynamicLogo type="admin" size="sm" />
          <span>Admin</span>
        </Link>
      </div>
    </nav>
  );
}

interface BrandedButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function BrandedButton({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '',
  onClick,
  disabled = false
}: BrandedButtonProps) {
  const { branding } = useBranding();

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-purple-600 border-purple-600 hover:bg-purple-700';
      case 'secondary':
        return 'bg-cyan-600 border-cyan-600 hover:bg-cyan-700';
      case 'accent':
        return 'bg-emerald-600 border-emerald-600 hover:bg-emerald-700';
      default:
        return 'bg-purple-600 border-purple-600 hover:bg-purple-700';
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={`${sizeClasses[size]} rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-white border ${getVariantClasses()} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

// Composant pour la page d'authentification avec logo dynamique
export function AuthHeader() {
  const { branding } = useBranding();

  return (
    <div className="text-center mb-8">
      <div className="flex justify-center mb-4">
        <DynamicLogo type="auth" size="xl" />
      </div>
      <h1 className="text-2xl font-bold mb-2 text-purple-600">
        {branding.companyName}
      </h1>
      <p className="text-gray-600">{branding.tagline}</p>
    </div>
  );
}

// Composant pour le footer avec logo et branding
export function BrandedFooter() {
  const { branding } = useBranding();

  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <DynamicLogo type="main" size="md" className="filter brightness-0 invert" />
            <div>
              <h3 className="font-bold">{branding.companyName}</h3>
              <p className="text-sm text-gray-400">{branding.tagline}</p>
            </div>
          </div>
          
          <div className="text-sm text-gray-400">
            © 2024 {branding.companyName}. Tous droits réservés.
          </div>
        </div>
      </div>
    </footer>
  );
}
