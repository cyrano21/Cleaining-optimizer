"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useStore } from "@/hooks/use-store";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Upload,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Tag,
  Folder,
  Package,
} from "lucide-react";

// Interfaces TypeScript
interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  parentId?: string;
  parent?: {
    id: string;
    name: string;
  };
  level: number;
  status: 'active' | 'inactive' | 'draft';
  productsCount: number;
  childrenCount: number;
  seoTitle?: string;
  seoDescription?: string;
  featured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface CategoriesResponse {
  success: boolean;
  categories: Category[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  stats: {
    totalCategories: number;
    activeCategories: number;
    inactiveCategories: number;
    draftCategories: number;
    rootCategories: number;
    totalProducts: number;
  };
}

// Composant Skeleton simple
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

// Composant CategoryCard pour la vue grille
const CategoryCard: React.FC<{ 
  category: Category; 
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}> = ({ category, onEdit, onDelete }) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/placeholder.svg';
                  }}
                />
              ) : (
                <Folder className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-1">{category.name}</h3>
              <p className="text-xs text-gray-500">{category.slug}</p>
            </div>
          </div>
          
          <Badge 
            className={`text-xs ${
              category.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : category.status === 'draft'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {category.status}
          </Badge>
        </div>
        
        {category.description && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
            {category.description}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span>{category.productsCount} produits</span>
          {category.childrenCount > 0 && (
            <span>{category.childrenCount} sous-catégories</span>
          )}
        </div>
        
        {category.parent && (
          <div className="mb-3">
            <Badge className="bg-blue-100 text-blue-800 text-xs">
              Parent: {category.parent.name}
            </Badge>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button 
            className="flex-1 border border-gray-300 hover:bg-gray-50 text-xs"
            onClick={() => onEdit(category)}
          >
            <Edit className="h-3 w-3 mr-1" />
            Modifier
          </Button>
          <Button 
            className="border border-red-300 hover:bg-red-50 text-red-600 text-xs"
            onClick={() => onDelete(category)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Composant CategoryForm pour créer/modifier
const CategoryForm: React.FC<{
  category?: Category;
  categories: Category[];
  onSave: (data: any) => void;
  onCancel: () => void;
}> = ({ category, categories, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    parentId: category?.parentId || '',
    status: category?.status || 'active',
    featured: category?.featured || false,
    seoTitle: category?.seoTitle || '',
    seoDescription: category?.seoDescription || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: category ? prev.slug : generateSlug(name)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nom *</label>
          <Input
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Nom de la catégorie"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Slug *</label>
          <Input
            value={formData.slug}
            onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
            placeholder="url-de-la-categorie"
            required
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Description de la catégorie"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Catégorie parente</label>          <select
            value={formData.parentId}
            onChange={(e) => setFormData(prev => ({ ...prev, parentId: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            aria-label="Sélectionner la catégorie parente"
          >
            <option value="">Aucune (Catégorie racine)</option>
            {categories
              .filter(cat => cat.id !== category?.id && cat.level < 3)
              .map(cat => (
                <option key={cat.id} value={cat.id}>
                  {'  '.repeat(cat.level)}{cat.name}
                </option>
              ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Statut</label>          <select
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            aria-label="Sélectionner le statut de la catégorie"
          >
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
            <option value="draft">Brouillon</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.featured}
            onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
          />
          <span className="text-sm">Catégorie mise en avant</span>
        </label>
      </div>
      
      <div className="border-t pt-4">
        <h4 className="font-medium mb-3">SEO</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Titre SEO</label>
            <Input
              value={formData.seoTitle}
              onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
              placeholder="Titre pour les moteurs de recherche"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description SEO</label>
            <textarea
              value={formData.seoDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
              placeholder="Description pour les moteurs de recherche"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={2}
            />
          </div>
        </div>
      </div>
      
      <div className="flex gap-3 pt-4 border-t">
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
          {category ? 'Modifier' : 'Créer'} la catégorie
        </Button>
        <Button type="button" onClick={onCancel} className="border border-gray-300 hover:bg-gray-50">
          Annuler
        </Button>
      </div>
    </form>
  );
};

// Composant principal
export default function DynamicCategoriesPage() {
  const { currentStore } = useStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<CategoriesResponse['pagination'] | null>(null);
  const [stats, setStats] = useState<CategoriesResponse['stats'] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [parentFilter, setParentFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // États pour les modales
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  useEffect(() => {
    fetchCategories();
  }, [currentPage, sortBy, sortOrder, statusFilter, parentFilter]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchCategories();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        sortBy,
        sortOrder,
        ...(statusFilter && { status: statusFilter }),
        ...(parentFilter && { parentId: parentFilter }),
        ...(searchTerm && { search: searchTerm }),
        ...(currentStore?.id && { storeId: currentStore.id }),
      });

      const response = await fetch(`/api/categories?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: CategoriesResponse = await response.json();
      
      if (data.success) {
        setCategories(data.categories);
        setPagination(data.pagination);
        setStats(data.stats);
      } else {
        setError('Erreur lors de la récupération des catégories');
      }
    } catch (err) {
      console.error('Erreur lors du chargement des catégories:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des catégories');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategory = async (formData: any) => {
    try {
      const url = editingCategory 
        ? `/api/categories/${editingCategory.id}` 
        : '/api/categories';
      
      const method = editingCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          ...(currentStore?.id && { storeId: currentStore.id }),
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      await fetchCategories();
      setShowForm(false);
      setEditingCategory(null);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${category.name}" ?`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      await fetchCategories();
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  if (loading && categories.length === 0) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-10 w-48" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={`stat-skeleton-${i}`}>
                <CardContent className="p-4">
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Card>
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Erreur de chargement</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchCategories} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Loader2 className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Catégories</h1>
            <p className="text-gray-600 mt-1">
              Organisez votre catalogue de produits
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreateCategory} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle catégorie
            </Button>
          </div>
        </div>

        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total catégories</p>
                    <p className="text-2xl font-bold">{stats.totalCategories}</p>
                  </div>
                  <Tag className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Catégories actives</p>
                    <p className="text-2xl font-bold text-green-600">{stats.activeCategories}</p>
                  </div>
                  <Folder className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Catégories racines</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.rootCategories}</p>
                  </div>
                  <Folder className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total produits</p>
                    <p className="text-2xl font-bold">{stats.totalProducts}</p>
                  </div>
                  <Package className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtres et recherche */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher une catégorie..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
                <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                aria-label="Filtrer par statut"
              >
                <option value="">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
                <option value="draft">Brouillon</option>
              </select>
                <select
                value={parentFilter}
                onChange={(e) => setParentFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                aria-label="Filtrer par niveau de catégorie"
              >
                <option value="">Tous les niveaux</option>
                <option value="root">Catégories racines</option>
                {categories.filter(cat => cat.level === 0).map(cat => (
                  <option key={cat.id} value={cat.id}>
                    Enfants de: {cat.name}
                  </option>
                ))}
              </select>
              
              <div className="flex gap-2">
                <Button
                  className={`border ${viewMode === 'table' ? 'bg-blue-50 border-blue-300' : 'border-gray-300 hover:bg-gray-50'}`}
                  onClick={() => setViewMode('table')}
                >
                  Table
                </Button>
                <Button
                  className={`border ${viewMode === 'grid' ? 'bg-blue-50 border-blue-300' : 'border-gray-300 hover:bg-gray-50'}`}
                  onClick={() => setViewMode('grid')}
                >
                  Grille
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contenu principal */}
        {categories.length > 0 ? (
          <>
            {viewMode === 'table' ? (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Catégorie</TableHead>
                        <TableHead>Parent</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Produits</TableHead>
                        <TableHead>Sous-catégories</TableHead>
                        <TableHead>Créée le</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                {category.image ? (
                                  <img
                                    src={category.image}
                                    alt={category.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = '/images/placeholder.svg';
                                    }}
                                  />
                                ) : (
                                  <Folder className="h-5 w-5 text-gray-400" />
                                )}
                              </div>
                              <div>
                                <div className="font-medium">
                                  {'  '.repeat(category.level)}{category.name}
                                </div>
                                <div className="text-sm text-gray-500">{category.slug}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {category.parent ? (
                              <Badge className="bg-blue-100 text-blue-800">
                                {category.parent.name}
                              </Badge>
                            ) : (
                              <span className="text-gray-500">Racine</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={
                                category.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : category.status === 'draft'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }
                            >
                              {category.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{category.productsCount}</TableCell>
                          <TableCell>{category.childrenCount}</TableCell>
                          <TableCell>
                            {new Date(category.createdAt).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                className="border border-gray-300 hover:bg-gray-50"
                                onClick={() => handleEditCategory(category)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                className="border border-red-300 hover:bg-red-50 text-red-600"
                                onClick={() => handleDeleteCategory(category)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {categories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onEdit={handleEditCategory}
                    onDelete={handleDeleteCategory}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Affichage de {((pagination.page - 1) * pagination.limit) + 1} à{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} sur{' '}
                  {pagination.total} catégories
                </p>
                
                <div className="flex items-center gap-2">
                  <Button
                    className="border border-gray-300 hover:bg-gray-50"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={!pagination.hasPrevPage || loading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Précédent
                  </Button>
                  
                  <span className="text-sm">
                    Page {pagination.page} sur {pagination.totalPages}
                  </span>
                  
                  <Button
                    className="border border-gray-300 hover:bg-gray-50"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!pagination.hasNextPage || loading}
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucune catégorie trouvée</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter || parentFilter
                  ? 'Aucune catégorie ne correspond à vos critères de recherche.'
                  : 'Vous n\'avez pas encore de catégories dans votre catalogue.'}
              </p>
              <Button onClick={handleCreateCategory} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Créer votre première catégorie
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Dialog pour créer/modifier une catégorie */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Modifier la catégorie' : 'Créer une nouvelle catégorie'}
              </DialogTitle>
            </DialogHeader>
            <CategoryForm
              category={editingCategory || undefined}
              categories={categories}
              onSave={handleSaveCategory}
              onCancel={() => {
                setShowForm(false);
                setEditingCategory(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
