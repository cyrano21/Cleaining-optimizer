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
// cspell:disable-next-line
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
        // Error is handled in parent component
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add new
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tags className="h-5 w-5" />
            Add Attribute
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              Category
            </label>
            <Input
              id="category"
              placeholder="e.g., Color, Size, Material"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="value" className="text-sm font-medium">
              Values
            </label>
            <Input
              id="value"
              placeholder="e.g., Red, Blue, Green"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description (optional)
            </label>
            <Input
              id="description"
              placeholder="Additional description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Attribute
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
  loading,
  open,
  onOpenChange,
}: {
  attribute: Attribute | null;
  onEdit: (id: string, data: { category: string; value: string; description?: string }) => Promise<void>;
  loading: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [category, setCategory] = useState("");
  const [value, setValue] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (attribute) {
      setCategory(attribute.category);
      setValue(attribute.value);
      setDescription(attribute.description || "");
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
        });
        onOpenChange(false);
      } catch (error) {
        // Error is handled in parent component
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Attribute
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="edit-category" className="text-sm font-medium">
              Category
            </label>
            <Input
              id="edit-category"
              placeholder="e.g., Color, Size, Material"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="edit-value" className="text-sm font-medium">
              Values
            </label>
            <Input
              id="edit-value"
              placeholder="e.g., Red, Blue, Green"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="edit-description" className="text-sm font-medium">
              Description (optional)
            </label>
            <Input
              id="edit-description"
              placeholder="Additional description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Attribute
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default function AttributesPage() {
  const { currentStore } = useStore();
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filters and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Edit dialog state
  const [editingAttribute, setEditingAttribute] = useState<Attribute | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Fetch attributes
  const fetchAttributes = async () => {
    try {
      setError(null);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: entriesPerPage.toString(),
        sortBy,
        sortOrder,
      });

      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (currentStore?.id) params.append('storeId', currentStore.id);

      const response = await fetch(`/api/attributes?${params}`);
      const data: AttributesResponse = await response.json();
      
      if (!data.success || !data.data) {
        // cspell:disable-next-line
        throw new Error(data.error || 'Erreur lors du chargement');
      }

      setAttributes(data.data.attributes);
      setCategories(data.data.categories);
      setTotalPages(data.data.pagination.pages);
      setTotalItems(data.data.pagination.total);    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
      // cspell:disable-next-line
      toast.error('Erreur lors du chargement des attributs');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    setLoading(true);
    fetchAttributes();
  }, [currentPage, entriesPerPage, searchTerm, selectedCategory, sortBy, sortOrder]);

  // Add attribute
  const handleAddAttribute = async (attributeData: { category: string; value: string; description?: string }) => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/attributes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...attributeData,
          ...(currentStore?.id && { storeId: currentStore.id }),
        }),
      });

      const data = await response.json();
      
      if (!data.success) {
        // cspell:disable-next-line
        throw new Error(data.error || 'Erreur lors de la création');
      }

      // cspell:disable-next-line
      toast.success('Attribut créé avec succès');
      fetchAttributes(); // Refresh the list
    } catch (err) {
      // cspell:disable-next-line
      const message = err instanceof Error ? err.message : 'Erreur de création';
      toast.error(message);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  // Edit attribute
  const handleEditAttribute = async (id: string, attributeData: { category: string; value: string; description?: string }) => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/attributes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          ...attributeData,
          ...(currentStore?.id && { storeId: currentStore.id }),
        }),
      });

      const data = await response.json();
      
      if (!data.success) {
        // cspell:disable-next-line
        throw new Error(data.error || 'Erreur lors de la mise à jour');
      }

      // cspell:disable-next-line
      toast.success('Attribut mis à jour avec succès');
      fetchAttributes(); // Refresh the list
    } catch (err) {
      // cspell:disable-next-line
      const message = err instanceof Error ? err.message : 'Erreur de mise à jour';
      toast.error(message);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };
  // Delete attribute
  const handleDeleteAttribute = async (id: string) => {
    // cspell:disable-next-line
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet attribut ?')) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/attributes?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (!data.success) {
        // cspell:disable-next-line
        throw new Error(data.error || 'Erreur lors de la suppression');
      }

      // cspell:disable-next-line
      toast.success('Attribut supprimé avec succès');
      fetchAttributes(); // Refresh the list
    } catch (err) {
      // cspell:disable-next-line
      const message = err instanceof Error ? err.message : 'Erreur de suppression';
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    fetchAttributes();
  };

  if (loading) {
    return (
      <DashboardLayout>        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            {/* cspell:disable-next-line */}
            <span>Chargement des attributs...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            {/* cspell:disable-next-line */}
            <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              {/* cspell:disable-next-line */}
              Réessayer
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">All attributes</h1>
            <p className="text-muted-foreground">
              Manage product attributes and their values
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={actionLoading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <AddAttributeDialog onAdd={handleAddAttribute} loading={actionLoading} />
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search attributes..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select
                value={selectedCategory}
                onValueChange={(value) => {
                  setSelectedCategory(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={`${sortBy}-${sortOrder}`}
                onValueChange={(value) => {
                  const [field, order] = value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt-desc">Newest first</SelectItem>
                  <SelectItem value="createdAt-asc">Oldest first</SelectItem>
                  <SelectItem value="category-asc">Category A-Z</SelectItem>
                  <SelectItem value="category-desc">Category Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Attributes Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Values</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attributes.length > 0 ? (
                  attributes.map((attribute) => (
                    <TableRow key={attribute._id}>
                      <TableCell className="font-medium">
                        <Badge variant="secondary">{attribute.category}</Badge>
                      </TableCell>
                      <TableCell>{attribute.value}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {attribute.description || '-'}
                      </TableCell>
                      <TableCell>{attribute.createdBy?.name || 'Unknown'}</TableCell>
                      <TableCell>
                        {attribute.createdAt ? new Date(attribute.createdAt).toLocaleDateString() : 'Non disponible'}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingAttribute(attribute);
                                setEditDialogOpen(true);
                              }}
                              disabled={actionLoading}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteAttribute(attribute._id)}
                              disabled={actionLoading}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No attributes found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Showing {((currentPage - 1) * entriesPerPage) + 1} to {Math.min(currentPage * entriesPerPage, totalItems)} of {totalItems} entries
              </span>
              <Select
                value={entriesPerPage.toString()}
                onValueChange={(value) => {
                  setEntriesPerPage(parseInt(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Edit Dialog */}
        <EditAttributeDialog
          attribute={editingAttribute}
          onEdit={handleEditAttribute}
          loading={actionLoading}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      </div>
    </DashboardLayout>
  );
}
