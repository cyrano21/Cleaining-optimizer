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
import { toast } from "sonner";

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
          <div className="flex items-center space-x-3">
            {category.image ? (
              <img 
                src={category.image} 
                alt={category.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Folder className="w-6 h-6 text-gray-400" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-sm">{category.name}</h3>
              <p className="text-xs text-gray-500">{category.slug}</p>
            </div>
          </div>
          <Badge 
            variant={category.status === 'active' ? 'default' : 'secondary'}
            className="text-xs"
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
          <span className="flex items-center">
            <Package className="w-3 h-3 mr-1" />
            {category.productsCount} produits
          </span>
          {category.childrenCount > 0 && (
            <span className="flex items-center">
              <Folder className="w-3 h-3 mr-1" />
              {category.childrenCount} sous-catégories
            </span>
          )}
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEdit(category)}
            className="flex-1"
          >
            <Edit className="w-3 h-3 mr-1" />
            Modifier
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onDelete(category)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function VendorCategoriesPage() {
  const { currentStore } = useStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [stats, setStats] = useState({
    totalCategories: 0,
    activeCategories: 0,
    inactiveCategories: 0,
    draftCategories: 0,
    rootCategories: 0,
    totalProducts: 0,
  });

  // Chargement des catégories
  const loadCategories = async (page = 1, search = "") => {
    if (!currentStore?.id) {
      toast.error("Veuillez sélectionner un magasin");
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        storeId: currentStore.id,
        ...(search && { search }),
      });

      const response = await fetch(`/api/vendor/categories?${params}`);
      const data: CategoriesResponse = await response.json();

      if (data.success) {
        setCategories(data.categories);
        setCurrentPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages);
        setStats(data.stats);
      } else {
        toast.error("Erreur lors du chargement des catégories");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors du chargement des catégories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories(1, searchTerm);
  }, [currentStore?.id, searchTerm]);

  const handleEdit = (category: Category) => {
    // TODO: Implémenter la modification
    toast.info("Fonctionnalité de modification à venir");
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${category.name}" ?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/vendor/categories/${category.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success("Catégorie supprimée avec succès");
        loadCategories(currentPage, searchTerm);
      } else {
        toast.error("Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Catégories</h1>
            <p className="text-gray-600">Gérez les catégories de vos produits</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}>
              {viewMode === 'table' ? 'Vue grille' : 'Vue tableau'}
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle catégorie
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer une nouvelle catégorie</DialogTitle>
                </DialogHeader>
                <div className="text-center py-8">
                  <p className="text-gray-500">Fonctionnalité de création à venir</p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{stats.totalCategories}</p>
                </div>
                <Tag className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Actives</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeCategories}</p>
                </div>
                <Package className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Inactives</p>
                  <p className="text-2xl font-bold text-red-600">{stats.inactiveCategories}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Produits</p>
                  <p className="text-2xl font-bold">{stats.totalProducts}</p>
                </div>
                <Folder className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Barre de recherche */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher des catégories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contenu principal */}
        <Card>
          <CardContent className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune catégorie trouvée</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm ? "Aucune catégorie ne correspond à votre recherche." : "Commencez par créer votre première catégorie."}
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Créer une catégorie
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Créer une nouvelle catégorie</DialogTitle>
                    </DialogHeader>
                    <div className="text-center py-8">
                      <p className="text-gray-500">Fonctionnalité de création à venir</p>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            ) : viewMode === 'table' ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Produits</TableHead>
                    <TableHead>Sous-catégories</TableHead>
                    <TableHead>Créée le</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {category.image ? (
                            <img 
                              src={category.image} 
                              alt={category.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Folder className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{category.name}</p>
                            <p className="text-sm text-gray-500">{category.slug}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={category.status === 'active' ? 'default' : 'secondary'}
                        >
                          {category.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{category.productsCount}</TableCell>
                      <TableCell>{category.childrenCount}</TableCell>
                      <TableCell>
                        {new Date(category.createdAt).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEdit(category)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDelete(category)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCategories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Page {currentPage} sur {totalPages}
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadCategories(currentPage - 1, searchTerm)}
                disabled={currentPage === 1 || loading}
              >
                <ChevronLeft className="w-4 h-4" />
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadCategories(currentPage + 1, searchTerm)}
                disabled={currentPage === totalPages || loading}
              >
                Suivant
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}