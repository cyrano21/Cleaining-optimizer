"use client";

import React, { useState, useEffect, MouseEvent } from "react";
import Image from "next/image";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  Upload,
  Download,
  FolderPlus,
  Grid3X3,
  List,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Image as ImageIcon,
  Link as LinkIcon,
  SortAsc,
  SortDesc,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface GalleryItem {
  id: string;
  name: string;
  type: "image" | "folder";
  url?: string;
  size?: string;
  uploadedAt: string;
  modifiedAt: string;
  category: string;
  tags: string[];
  dimensions?: string;
  public_id?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextCursor?: string;
}

export default function GalleryPage() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("uploadedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("gallery");
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Charger les éléments de la galerie
  const fetchGalleryItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        sortOrder,
      });

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      if (filterCategory && filterCategory !== "all") {
        params.append("category", filterCategory);
      }

      const response = await fetch(`/api/gallery?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setGalleryItems(data.items || []);
        setPagination(data.pagination || pagination);
      } else {
        throw new Error(data.error || "Erreur lors du chargement de la galerie");
      }
    } catch (err) {
      console.error("Erreur lors du chargement de la galerie:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setGalleryItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au démarrage et lors des changements de filtres
  useEffect(() => {
    fetchGalleryItems();
  }, [pagination.page, searchTerm, filterCategory, sortBy, sortOrder]);

  // Gestionnaires d'événements
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleCategoryFilter = (value: string) => {
    setFilterCategory(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === galleryItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(galleryItems.map(item => item.id));
    }
  };

  const handleDeleteItem = async (publicId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette image ?")) {
      return;
    }

    try {
      const response = await fetch(`/api/gallery?public_id=${encodeURIComponent(publicId)}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Image supprimée avec succès");
        fetchGalleryItems(); // Recharger la liste
      } else {
        throw new Error(data.error || "Erreur lors de la suppression");
      }
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      toast.error(err instanceof Error ? err.message : "Erreur lors de la suppression");
    }
  };

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Lien copié dans le presse-papiers");
    } catch (err) {
      toast.error("Erreur lors de la copie du lien");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "products":
        return "text-blue-700 bg-blue-100";
      case "avatars":
        return "text-green-700 bg-green-100";
      case "banners":
        return "text-purple-700 bg-purple-100";
      case "categories":
        return "text-orange-700 bg-orange-100";
      default:
        return "text-gray-700 bg-gray-100";
    }
  };

  const categories = [
    { value: "all", label: "Toutes les catégories" },
    { value: "general", label: "Général" },
    { value: "products", label: "Produits" },
    { value: "avatars", label: "Avatars" },
    { value: "banners", label: "Bannières" },
    { value: "categories", label: "Catégories" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Galerie multimédia</h1>
            <p className="text-muted-foreground">
              Gérez vos images et fichiers multimédias
            </p>
          </div>
          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            <Button
              onClick={() => window.location.href = '/e-commerce/gallery/upload'}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Uploader
            </Button>
            <Button onClick={fetchGalleryItems} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <ImageIcon className="h-4 w-4 text-blue-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total images
                  </p>
                  <p className="text-2xl font-bold">{pagination.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FolderPlus className="h-4 w-4 text-green-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Sélectionnées
                  </p>
                  <p className="text-2xl font-bold">{selectedItems.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Filter className="h-4 w-4 text-orange-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Affichées
                  </p>
                  <p className="text-2xl font-bold">{galleryItems.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Upload className="h-4 w-4 text-purple-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Mode vue
                  </p>
                  <p className="text-lg font-bold capitalize">{viewMode}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres et contrôles */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Recherche */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher des images..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8"
                />
              </div>

              {/* Filtres et contrôles */}
              <div className="flex items-center gap-2">
                {/* Filtre par catégorie */}
                <Select value={filterCategory} onValueChange={handleCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Tri */}
                <Select value={sortBy} onValueChange={(value: string) => handleSortChange(value)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Nom</SelectItem>
                    <SelectItem value="uploadedAt">Date</SelectItem>
                    <SelectItem value="size">Taille</SelectItem>
                  </SelectContent>
                </Select>

                {/* Ordre de tri */}
                <Button
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="px-3"
                >
                  {sortOrder === "asc" ? (
                    <SortAsc className="h-4 w-4" />
                  ) : (
                    <SortDesc className="h-4 w-4" />
                  )}
                </Button>

                {/* Mode d'affichage */}
                <div className="flex border rounded-md">
                  <Button
                    onClick={() => setViewMode("grid")}
                    className={`px-3 py-1 rounded-r-none ${
                      viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground"
                    }`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => setViewMode("list")}
                    className={`px-3 py-1 rounded-l-none ${
                      viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground"
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Actions sur les éléments sélectionnés */}
            {selectedItems.length > 0 && (
              <div className="flex items-center justify-between mt-4 p-3 bg-blue-50 rounded-md">
                <span className="text-sm font-medium text-blue-900">
                  {selectedItems.length} élément(s) sélectionné(s)
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setSelectedItems([])}
                    className="text-sm"
                  >
                    Désélectionner tout
                  </Button>
                  <Button
                    onClick={() => console.log("Download selected:", selectedItems)}
                    className="text-sm flex items-center gap-1"
                  >
                    <Download className="h-3 w-3" />
                    Télécharger
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contenu principal */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Galerie</CardTitle>
              {!loading && (
                <Button
                  onClick={handleSelectAll}
                  className="text-sm"
                >
                  {selectedItems.length === galleryItems.length ? "Désélectionner tout" : "Sélectionner tout"}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Chargement...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 text-red-600">
                <AlertCircle className="h-8 w-8 mb-2" />
                <span className="text-lg font-medium">Erreur</span>
                <span className="text-sm">{error}</span>
                <Button onClick={fetchGalleryItems} className="mt-4">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réessayer
                </Button>
              </div>
            ) : galleryItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">Aucune image trouvée</p>
                <p className="text-sm">Commencez par uploader des images</p>
              </div>
            ) : (
              <>
                {/* Vue grille */}
                {viewMode === "grid" && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {galleryItems.map((item) => (
                      <div
                        key={`gallery-item-${item.id}`}
                        className={`relative group border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                          selectedItems.includes(item.id) ? "ring-2 ring-blue-500" : ""
                        }`}
                        onClick={() => handleSelectItem(item.id)}
                      >
                        <div className="aspect-square relative bg-gray-100">
                          <Image
                            src={item.url || "/images/placeholder.svg"}
                            alt={item.name}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/images/placeholder.svg";
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all" />
                            {/* Checkbox de sélection */}
                          <div className="absolute top-2 left-2">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(item.id)}
                              onChange={() => handleSelectItem(item.id)}
                              className="w-4 h-4 rounded border-gray-300"
                              onClick={(e: MouseEvent) => e.stopPropagation()}
                              aria-label={`Sélectionner ${item.name}`}
                            />
                          </div>

                          {/* Menu d'actions */}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button className="h-8 w-8 p-0 bg-white/80 hover:bg-white" onClick={(e: MouseEvent) => e.stopPropagation()}>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={(e: MouseEvent) => {
                                  e.stopPropagation();
                                  window.open(item.url, '_blank');
                                }}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Voir
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e: MouseEvent) => {
                                  e.stopPropagation();
                                  handleCopyLink(item.url || '');
                                }}>
                                  <LinkIcon className="mr-2 h-4 w-4" />
                                  Copier le lien
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e: MouseEvent) => {
                                    e.stopPropagation();
                                    if (item.public_id) {
                                      handleDeleteItem(item.public_id);
                                    }
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {/* Informations de l'image */}
                        <div className="p-3">
                          <h3 className="font-medium text-sm truncate">{item.name}</h3>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-muted-foreground">{item.size}</span>
                            <Badge className={`text-xs px-2 py-1 ${getCategoryBadgeClass(item.category)}`}>
                              {item.category}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(item.uploadedAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Vue liste */}
                {viewMode === "list" && (
                  <div className="space-y-2">
                    {galleryItems.map((item) => (
                      <div
                        key={`gallery-list-${item.id}`}
                        className={`flex items-center gap-4 p-3 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                          selectedItems.includes(item.id) ? "ring-2 ring-blue-500 bg-blue-50" : ""
                        }`}
                        onClick={() => handleSelectItem(item.id)}
                      >                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => handleSelectItem(item.id)}
                          className="w-4 h-4 rounded border-gray-300"
                          onClick={(e: MouseEvent) => e.stopPropagation()}
                          aria-label={`Sélectionner ${item.name}`}
                        />
                        
                        <div className="w-12 h-12 relative rounded bg-gray-100 overflow-hidden">
                          <Image
                            src={item.url || "/images/placeholder.svg"}
                            alt={item.name}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/images/placeholder.svg";
                            }}
                          />
                        </div>

                        <div className="flex-1">
                          <h3 className="font-medium text-sm">{item.name}</h3>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span>{item.dimensions}</span>
                            <span>{item.size}</span>
                            <span>{formatDate(item.uploadedAt)}</span>
                          </div>
                        </div>

                        <Badge className={`text-xs px-2 py-1 ${getCategoryBadgeClass(item.category)}`}>
                          {item.category}
                        </Badge>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button className="h-8 w-8 p-0" onClick={(e: MouseEvent) => e.stopPropagation()}>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e: MouseEvent) => {
                              e.stopPropagation();
                              window.open(item.url, '_blank');
                            }}>
                              <Eye className="mr-2 h-4 w-4" />
                              Voir
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e: MouseEvent) => {
                              e.stopPropagation();
                              handleCopyLink(item.url || '');
                            }}>
                              <LinkIcon className="mr-2 h-4 w-4" />
                              Copier le lien
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e: MouseEvent) => {
                                e.stopPropagation();
                                if (item.public_id) {
                                  handleDeleteItem(item.public_id);
                                }
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <Button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPrevPage}
                      className="text-sm"
                    >
                      Précédent
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {pagination.page} sur {pagination.totalPages} - {pagination.total} éléments
                    </span>
                    <Button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNextPage}
                      className="text-sm"
                    >
                      Suivant
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
