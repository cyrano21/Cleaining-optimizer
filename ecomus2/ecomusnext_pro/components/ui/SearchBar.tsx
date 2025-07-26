// converted from original HTML
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'product' | 'category' | 'brand';
  image?: string;
}

export interface RecentSearch {
  id: string;
  text: string;
  timestamp: Date;
}

interface SearchBarProps {
  placeholder?: string;
  suggestions?: SearchSuggestion[];
  recentSearches?: RecentSearch[];
  popularSearches?: string[];
  onSearch: (query: string) => void;
  onSuggestionClick?: (suggestion: SearchSuggestion) => void;
  className?: string;
  showSuggestions?: boolean;
}

export default function SearchBar({
  placeholder = "Rechercher des produits...",
  suggestions = [],
  recentSearches = [],
  popularSearches = [],
  onSearch,
  onSuggestionClick,
  className = '',
  showSuggestions = true
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<SearchSuggestion[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.length > 0) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.text.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSuggestions(filtered.slice(0, 8));
    } else {
      setFilteredSuggestions([]);
    }
  }, [query, suggestions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setIsOpen(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.length > 0 || showSuggestions);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    setIsOpen(false);
    onSuggestionClick?.(suggestion);
    onSearch(suggestion.text);
  };

  const handleRecentSearchClick = (searchText: string) => {
    setQuery(searchText);
    setIsOpen(false);
    onSearch(searchText);
  };

  const handlePopularSearchClick = (searchText: string) => {
    setQuery(searchText);
    setIsOpen(false);
    onSearch(searchText);
  };

  const clearQuery = () => {
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'product':
        return '🛍️';
      case 'category':
        return '📂';
      case 'brand':
        return '🏷️';
      default:
        return '🔍';
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(showSuggestions)}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          />
          {query && (
            <button
              type="button"
              onClick={clearQuery}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {isOpen && showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Search Suggestions */}
          {filteredSuggestions.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 px-3 py-2 uppercase tracking-wide">
                Suggestions
              </div>
              {filteredSuggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
                >
                  {suggestion.image ? (
                    <img
                      src={suggestion.image}
                      alt={suggestion.text}
                      className="w-8 h-8 object-cover rounded"
                    />
                  ) : (
                    <span className="text-lg">{getSuggestionIcon(suggestion.type)}</span>
                  )}
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {suggestion.text}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {suggestion.type === 'product' ? 'Produit' : 
                       suggestion.type === 'category' ? 'Catégorie' : 'Marque'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {query.length === 0 && recentSearches.length > 0 && (
            <div className="p-2 border-t border-gray-100">
              <div className="text-xs font-medium text-gray-500 px-3 py-2 uppercase tracking-wide flex items-center gap-2">
                <Clock className="w-3 h-3" />
                Recherches récentes
              </div>
              {recentSearches.slice(0, 5).map((search) => (
                <button
                  key={search.id}
                  onClick={() => handleRecentSearchClick(search.text)}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
                >
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{search.text}</span>
                </button>
              ))}
            </div>
          )}

          {/* Popular Searches */}
          {query.length === 0 && popularSearches.length > 0 && (
            <div className="p-2 border-t border-gray-100">
              <div className="text-xs font-medium text-gray-500 px-3 py-2 uppercase tracking-wide flex items-center gap-2">
                <TrendingUp className="w-3 h-3" />
                Recherches populaires
              </div>
              {popularSearches.slice(0, 5).map((search, index) => (
                <button
                  key={index}
                  onClick={() => handlePopularSearchClick(search)}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
                >
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{search}</span>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {query.length > 0 && filteredSuggestions.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Aucun résultat pour "{query}"</p>
              <p className="text-xs text-gray-400 mt-1">
                Appuyez sur Entrée pour rechercher quand même
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}