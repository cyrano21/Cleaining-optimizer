// converted from original HTML
'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisiblePages?: number;
  className?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  maxVisiblePages = 7,
  className = '',
  disabled = false,
  size = 'md'
}: PaginationProps) {
  // Calculer les pages visibles
  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const halfVisible = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - halfVisible);
    const end = Math.min(totalPages, start + maxVisiblePages - 1);

    // Ajuster si on est près de la fin
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();
  const showStartEllipsis = visiblePages[0] > 2;
  const showEndEllipsis = visiblePages[visiblePages.length - 1] < totalPages - 1;

  // Classes de taille
  const sizeClasses = {
    sm: {
      button: 'px-2 py-1 text-xs',
      icon: 'w-3 h-3'
    },
    md: {
      button: 'px-3 py-2 text-sm',
      icon: 'w-4 h-4'
    },
    lg: {
      button: 'px-4 py-3 text-base',
      icon: 'w-5 h-5'
    }
  };

  const currentSizeClasses = sizeClasses[size];

  const handlePageClick = (page: number) => {
    if (!disabled && page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const buttonBaseClasses = `
    ${currentSizeClasses.button}
    border border-gray-300 bg-white text-gray-700
    hover:bg-gray-50 hover:border-gray-400
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    transition-colors duration-200
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white
  `;

  const activeButtonClasses = `
    ${currentSizeClasses.button}
    border border-blue-500 bg-blue-500 text-white
    hover:bg-blue-600 hover:border-blue-600
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
  `;

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className={`flex items-center justify-center space-x-1 ${className}`} aria-label="Pagination">
      {/* Bouton Première page */}
      {showFirstLast && currentPage > 1 && (
        <button
          onClick={() => handlePageClick(1)}
          disabled={disabled}
          className={`${buttonBaseClasses} rounded-l-md`}
          aria-label="Première page"
        >
          1
        </button>
      )}

      {/* Bouton Précédent */}
      {showPrevNext && (
        <button
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={disabled || currentPage === 1}
          className={`${buttonBaseClasses} ${!showFirstLast || currentPage === 1 ? 'rounded-l-md' : ''}`}
          aria-label="Page précédente"
        >
          <ChevronLeft className={currentSizeClasses.icon} />
        </button>
      )}

      {/* Ellipsis de début */}
      {showStartEllipsis && (
        <span className={`${currentSizeClasses.button} border border-gray-300 bg-white text-gray-400`}>
          <MoreHorizontal className={currentSizeClasses.icon} />
        </span>
      )}

      {/* Pages visibles */}
      {visiblePages.map((page) => {
        const isActive = page === currentPage;
        return (
          <button
            key={page}
            onClick={() => handlePageClick(page)}
            disabled={disabled}
            className={isActive ? activeButtonClasses : buttonBaseClasses}
            aria-label={`Page ${page}`}
            aria-current={isActive ? 'page' : undefined}
          >
            {page}
          </button>
        );
      })}

      {/* Ellipsis de fin */}
      {showEndEllipsis && (
        <span className={`${currentSizeClasses.button} border border-gray-300 bg-white text-gray-400`}>
          <MoreHorizontal className={currentSizeClasses.icon} />
        </span>
      )}

      {/* Bouton Suivant */}
      {showPrevNext && (
        <button
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={disabled || currentPage === totalPages}
          className={`${buttonBaseClasses} ${!showFirstLast || currentPage === totalPages ? 'rounded-r-md' : ''}`}
          aria-label="Page suivante"
        >
          <ChevronRight className={currentSizeClasses.icon} />
        </button>
      )}

      {/* Bouton Dernière page */}
      {showFirstLast && currentPage < totalPages && (
        <button
          onClick={() => handlePageClick(totalPages)}
          disabled={disabled}
          className={`${buttonBaseClasses} rounded-r-md`}
          aria-label="Dernière page"
        >
          {totalPages}
        </button>
      )}
    </nav>
  );
}

// Composant d'information de pagination
export function PaginationInfo({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  className = ''
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  className?: string;
}) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={`text-sm text-gray-700 ${className}`}>
      Affichage de <span className="font-medium">{startItem}</span> à{' '}
      <span className="font-medium">{endItem}</span> sur{' '}
      <span className="font-medium">{totalItems}</span> résultats
    </div>
  );
}

// Hook personnalisé pour la pagination
export function usePagination({
  totalItems,
  itemsPerPage = 10,
  initialPage = 1
}: {
  totalItems: number;
  itemsPerPage?: number;
  initialPage?: number;
}) {
  const [currentPage, setCurrentPage] = React.useState(initialPage);
  
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);
  const firstPage = () => goToPage(1);
  const lastPage = () => goToPage(totalPages);
  
  // Calculer les indices pour slice
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  return {
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    startIndex,
    endIndex,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  };
}