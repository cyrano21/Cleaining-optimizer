"use client";

import { useState, useEffect, useMemo } from 'react';
import { Search, Grid, List, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

const TemplateGallery = ({ onSelectTemplate, currentTemplate, showAdminAccess = false }) => {
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  
  // États pour la pagination et les filtres
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'
  const [templatesPerPage, setTemplatesPerPage] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTemplates, setTotalTemplates] = useState(0);

  // Fonction pour récupérer les templates depuis l'API
  const fetchTemplates = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: templatesPerPage.toString(),
        search: searchTerm,
        category: selectedCategory === 'All' ? '' : selectedCategory,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      
      const response = await fetch(`/api/templates?${params}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des templates');
      }
      
      const data = await response.json();
      
      setTemplates(data.templates || []);
      setCategories(data.categories || []);
      setTotalPages(data.pagination?.total || 1);
      setTotalTemplates(data.pagination?.totalDocuments || 0);
      
    } catch (err) {
      console.error('Erreur lors du chargement des templates:', err);
      setError(err.message);
      // Fallback vers les templates statiques en cas d'erreur
      setTemplates(getFallbackTemplates());
      setCategories(getFallbackCategories());
    } finally {
      setLoading(false);
    }
  };

  // Templates de fallback (anciens templates statiques)
  const getFallbackTemplates = () => [
    { _id: 'modern-template', name: 'Modern Template', category: 'Business', previewImage: '/images/templates/modern-template.svg' },
    { _id: 'home-02', name: 'Fashion Basic', category: 'Fashion', previewImage: '/images/templates/home-02.svg' },
    { _id: 'home-03', name: 'Electronics', category: 'Tech', previewImage: '/images/templates/home-03.svg' },
    { _id: 'home-04', name: 'Jewelry', category: 'Luxury', previewImage: '/images/templates/home-04.svg' },
    { _id: 'home-05', name: 'Cosmetic', category: 'Beauty', previewImage: '/images/templates/home-05.svg' },
    { _id: 'home-06', name: 'Food & Grocery', category: 'Food', previewImage: '/images/templates/home-06.svg' },
    { _id: 'home-07', name: 'Furniture', category: 'Home', previewImage: '/images/templates/home-07.svg' },
    { _id: 'home-08', name: 'Kids Store', category: 'Kids', previewImage: '/images/templates/home-08.svg' },
    { _id: 'home-01', name: 'Default Template', category: 'Business', previewImage: '/images/templates/home-01.svg' }
  ];

  const getFallbackCategories = () => ['Business', 'Fashion', 'Tech', 'Luxury', 'Beauty', 'Food', 'Home', 'Kids'];

  // Effet pour charger les templates quand les filtres changent
  useEffect(() => {
    fetchTemplates();
  }, [currentPage, templatesPerPage, searchTerm, selectedCategory]);

  // Reset de la page quand les filtres changent (sauf currentPage)
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm, selectedCategory, templatesPerPage]);

  const handleTemplateSelect = (template) => {
    if (onSelectTemplate) {
      onSelectTemplate(template.slug || template._id);
    }
  };

  // Fonction pour changer de page
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll vers le haut de la galerie
    document.querySelector('.template-gallery')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fonction pour réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="template-gallery flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement des templates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="template-gallery">
        <div className="py-12 text-center">
          <div className="mb-4 text-red-400">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">Erreur de chargement</h3>
          <p className="mb-4 text-gray-600 dark:text-gray-400">{error}</p>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">Affichage des templates de secours...</p>
          <button
            onClick={fetchTemplates}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="template-gallery space-y-6">
      {/* Message d'accès admin */}
      {showAdminAccess && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700 dark:text-green-300">
                <strong>Accès Admin/Vendeur</strong> - Vous avez accès à tous les {totalTemplates} templates de notre galerie complète.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Barre de recherche et contrôles */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        {/* Barre de recherche */}
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Rechercher des templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* Contrôles de vue et pagination */}
        <div className="flex items-center gap-4">
          {/* Sélecteur de nombre par page */}
          <select
            value={templatesPerPage}
            onChange={(e) => setTemplatesPerPage(Number(e.target.value))}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value={6}>6 par page</option>
            <option value={12}>12 par page</option>
            <option value={24}>24 par page</option>
            <option value={48}>48 par page</option>
          </select>

          {/* Toggle vue grille/liste */}
          <div className="flex overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              title="Vue grille"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              title="Vue liste"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filtres par catégorie */}
      <div className="flex items-center gap-4">
        <Filter className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === 'All'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Tous ({totalTemplates})
          </button>
          {categories.map(category => {
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
        {(searchTerm || selectedCategory !== 'All') && (
          <button
            onClick={resetFilters}
            className="px-3 py-1 text-sm text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* Résultats et pagination info */}
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>
          Affichage {((currentPage - 1) * templatesPerPage) + 1}-{Math.min(currentPage * templatesPerPage, totalTemplates)} sur {totalTemplates} templates
        </span>
        {totalPages > 1 && (
          <span>Page {currentPage} sur {totalPages}</span>
        )}
      </div>

      {/* Grille/Liste des templates */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {templates.map(template => (
            <TemplateCard
              key={template._id}
              template={template}
              isSelected={currentTemplate === (template.slug || template._id)}
              onSelect={handleTemplateSelect}
              viewMode="grid"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {templates.map(template => (
            <TemplateCard
              key={template._id}
              template={template}
              isSelected={currentTemplate === (template.slug || template._id)}
              onSelect={handleTemplateSelect}
              viewMode="list"
            />
          ))}
        </div>
      )}

      {/* Message si aucun résultat */}
      {templates.length === 0 && !loading && (
        <div className="py-12 text-center">
          <div className="mb-4 text-gray-400">
            <Search className="mx-auto h-12 w-12" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">Aucun template trouvé</h3>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            {searchTerm
              ? `Aucun résultat pour "${searchTerm}" dans la catégorie "${selectedCategory}"`
              : `Aucun template dans la catégorie "${selectedCategory}"`
            }
          </p>
          <button
            onClick={resetFilters}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Voir tous les templates
          </button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded-lg border border-gray-300 p-2 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          {/* Pages */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
            // Afficher seulement quelques pages autour de la page actuelle
            if (
              page === 1 ||
              page === totalPages ||
              (page >= currentPage - 2 && page <= currentPage + 2)
            ) {
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    page === currentPage
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              );
            } else if (
              page === currentPage - 3 ||
              page === currentPage + 3
            ) {
              return <span key={page} className="px-2 text-gray-500 dark:text-gray-400">...</span>;
            }
            return null;
          })}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded-lg border border-gray-300 p-2 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

// Composant pour afficher un template individuel
const TemplateCard = ({ template, isSelected, onSelect, viewMode }) => {
  const templateId = template.slug || template._id;
  const previewImage = template.previewImage || template.preview || '/images/templates/placeholder.svg';
  
  if (viewMode === 'list') {
    return (
      <div
        className={`flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 transition-all duration-200 hover:shadow-md cursor-pointer ${
          isSelected
            ? 'border-blue-600 ring-2 ring-blue-200 dark:ring-blue-800'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }`}
        onClick={() => onSelect(template)}
      >
        {/* Preview miniature */}
        <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded bg-gray-100 dark:bg-gray-700">
          <img
            src={previewImage}
            alt={template.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.target.src = '/images/templates/placeholder.svg';
            }}
          />
        </div>

        {/* Informations */}
        <div className="ml-4 flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{template.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">ID: {templateId}</p>
              {template.description && (
                <p className="mt-1 text-xs text-gray-400 line-clamp-2 dark:text-gray-500">{template.description}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                {template.category}
              </span>
              {template.isPremium && (
                <span className="rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300">
                  Premium
                </span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(template);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {isSelected ? 'Sélectionné' : 'Sélectionner'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vue grille (défaut)
  return (
    <div
      className={`template-card bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 transition-all duration-200 hover:shadow-md cursor-pointer ${
        isSelected
          ? 'border-blue-600 ring-2 ring-blue-200 dark:ring-blue-800'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
      onClick={() => onSelect(template)}
    >
      {/* Preview de l'image */}
      <div className="relative aspect-video overflow-hidden rounded-t-lg bg-gray-100 dark:bg-gray-700">
        <img
          src={previewImage}
          alt={template.name}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.target.src = '/images/templates/placeholder.svg';
          }}
        />
        {isSelected && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-600 bg-opacity-20">
            <div className="rounded-full bg-blue-600 px-3 py-1 text-sm font-medium text-white">
              ✓ Sélectionné
            </div>
          </div>
        )}
        {template.isPremium && (
          <div className="absolute right-2 top-2">
            <span className="rounded-full bg-yellow-500 px-2 py-1 text-xs font-medium text-white">
              Premium
            </span>
          </div>
        )}
      </div>

      {/* Informations du template */}
      <div className="p-4">
        <div className="mb-2 flex items-start justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{template.name}</h3>
          <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            {template.category}
          </span>
        </div>
        {template.description && (
          <p className="mb-2 text-xs text-gray-500 line-clamp-2 dark:text-gray-400">{template.description}</p>
        )}
        <p className="mb-3 text-xs text-gray-400 dark:text-gray-500">ID: {templateId}</p>
        
        {/* Tags et rating */}
        {(template.tags && template.tags.length > 0) && (
          <div className="mb-3 flex flex-wrap gap-1">
            {template.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(template);
          }}
          className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            isSelected
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {isSelected ? 'Sélectionné' : 'Sélectionner'}
        </button>
      </div>
    </div>
  );
};

export default TemplateGallery;
