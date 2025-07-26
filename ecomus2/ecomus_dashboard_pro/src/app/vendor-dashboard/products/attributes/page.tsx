"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Tags,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

interface Attribute {
  _id: string;
  category: string;
  value: string;
  description?: string;
  isActive: boolean;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface AttributesResponse {
  success: boolean;
  data?: {
    attributes: Attribute[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    categories: string[];
  };
  error?: string;
}

const AddAttributeDialog = ({
  onAdd,
  loading,
}: {
  onAdd: (attribute: { category: string; value: string; description?: string }) => Promise<void>;
  loading: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [value, setValue] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (category.trim() && value.trim()) {
      try {
        await onAdd({
          category: category.trim(),
          value: value.trim(),
          description: description.trim() || undefined,
        });
        setCategory("");
        setValue("");
        setDescription("");
        setOpen(false);
      } catch (error) {
        console.error("Erreur lors de l'ajout:", error);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nouvel attribut
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un nouvel attribut</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Catégorie</label>
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ex: Couleur, Taille, Matériau..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Valeur</label>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Ex: Rouge, XL, Coton..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description (optionnel)</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description de l'attribut..."
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading || !category.trim() || !value.trim()}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Ajout...
                </>
              ) : (
                "Ajouter"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const EditAttributeDialog = ({
  attribute,
  onEdit,
  onClose,
  loading,
}: {
  attribute: Attribute | null;
  onEdit: (id: string, data: { category: string; value: string; description?: string; isActive: boolean }) => Promise<void>;
  onClose: () => void;
  loading: boolean;
}) => {
  const [category, setCategory] = useState("");
  const [value, setValue] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (attribute) {
      setCategory(attribute.category);
      setValue(attribute.value);
      setDescription(attribute.description || "");
      setIsActive(attribute.isActive);
    }
  }, [attribute]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (attribute && category.trim() && value.trim()) {
      try {
        await onEdit(attribute._id, {
          category: category.trim(),
          value: value.trim(),
          description: description.trim() || undefined,
          isActive,
        });
        onClose();
      } catch (error) {
        console.error("Erreur lors de la modification:", error);
      }
    }
  };

  return (
    <Dialog open={!!attribute} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier l'attribut</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Catégorie</label>
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ex: Couleur, Taille, Matériau..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Valeur</label>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Ex: Rouge, XL, Coton..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description (optionnel)</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description de l'attribut..."
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="isActive" className="text-sm font-medium">
              Attribut actif
            </label>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading || !category.trim() || !value.trim()}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Modification...
                </>
              ) : (
                "Modifier"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default function VendorAttributesPage() {
  const { currentStore } = useStore();
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingAttribute, setEditingAttribute] = useState<Attribute | null>(null);

  // Chargement des attributs
  const loadAttributes = async (page = 1, search = "", category = "all") => {
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
        ...(category !== "all" && { category }),
      });

      const response = await fetch(`/api/vendor/attributes?${params}`);
      const data: AttributesResponse = await response.json();

      if (data.success && data.data) {
        setAttributes(data.data.attributes);
        setCategories(data.data.categories || []);
        setCurrentPage(data.data.pagination.page);
        setTotalPages(data.data.pagination.pages);
      } else {
        toast.error(data.error || "Erreur lors du chargement des attributs");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors du chargement des attributs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttributes(1, searchTerm, selectedCategory);
  }, [currentStore?.id, searchTerm, selectedCategory]);

  // Ajout d'un attribut
  const handleAddAttribute = async (attributeData: { category: string; value: string; description?: string }) => {
    if (!currentStore?.id) {
      toast.error("Veuillez sélectionner un magasin");
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch("/api/vendor/attributes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...attributeData,
          storeId: currentStore.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Attribut ajouté avec succès");
        loadAttributes(currentPage, searchTerm, selectedCategory);
      } else {
        toast.error(data.error || "Erreur lors de l'ajout de l'attribut");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de l'ajout de l'attribut");
    } finally {
      setActionLoading(false);
    }
  };

  // Modification d'un attribut
  const handleEditAttribute = async (id: string, attributeData: { category: string; value: string; description?: string; isActive: boolean }) => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/vendor/attributes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(attributeData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Attribut modifié avec succès");
        loadAttributes(currentPage, searchTerm, selectedCategory);
      } else {
        toast.error(data.error || "Erreur lors de la modification de l'attribut");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la modification de l'attribut");
    } finally {
      setActionLoading(false);
    }
  };

  // Suppression d'un attribut
  const handleDeleteAttribute = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet attribut ?")) {
      return;
    }

    try {
      const response = await fetch(`/api/vendor/attributes/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success("Attribut supprimé avec succès");
        loadAttributes(currentPage, searchTerm, selectedCategory);
      } else {
        toast.error(data.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const filteredAttributes = attributes.filter(attribute => {
    const matchesSearch = attribute.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attribute.value.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || attribute.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Attributs</h1>
            <p className="text-gray-600">Gérez les attributs de vos produits</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={() => loadAttributes(currentPage, searchTerm, selectedCategory)}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
            <AddAttributeDialog onAdd={handleAddAttribute} loading={actionLoading} />
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total attributs</p>
                  <p className="text-2xl font-bold">{attributes.length}</p>
                </div>
                <Tags className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Catégories</p>
                  <p className="text-2xl font-bold">{categories.length}</p>
                </div>
                <Tags className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Actifs</p>
                  <p className="text-2xl font-bold text-green-600">
                    {attributes.filter(attr => attr.isActive).length}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher des attributs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrer par catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tableau des attributs */}
        <Card>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="ml-2">Chargement des attributs...</span>
              </div>
            ) : filteredAttributes.length === 0 ? (
              <div className="text-center py-12">
                <Tags className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun attribut trouvé</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || selectedCategory !== "all" 
                    ? "Aucun attribut ne correspond à vos critères de recherche." 
                    : "Commencez par créer votre premier attribut."}
                </p>
                <AddAttributeDialog onAdd={handleAddAttribute} loading={actionLoading} />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Valeur</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Créé par</TableHead>
                    <TableHead>Date de création</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttributes.map((attribute) => (
                    <TableRow key={attribute._id}>
                      <TableCell>
                        <Badge variant="outline">{attribute.category}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{attribute.value}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {attribute.description || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={attribute.isActive ? "default" : "secondary"}
                        >
                          {attribute.isActive ? "Actif" : "Inactif"}
                        </Badge>
                      </TableCell>
                      <TableCell>{attribute.createdBy.name}</TableCell>
                      <TableCell>
                        {new Date(attribute.createdAt).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingAttribute(attribute)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteAttribute(attribute._id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                onClick={() => loadAttributes(currentPage - 1, searchTerm, selectedCategory)}
                disabled={currentPage === 1 || loading}
              >
                <ChevronLeft className="w-4 h-4" />
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadAttributes(currentPage + 1, searchTerm, selectedCategory)}
                disabled={currentPage === totalPages || loading}
              >
                Suivant
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Dialog de modification */}
        <EditAttributeDialog
          attribute={editingAttribute}
          onEdit={handleEditAttribute}
          onClose={() => setEditingAttribute(null)}
          loading={actionLoading}
        />
      </div>
    </DashboardLayout>
  );
}