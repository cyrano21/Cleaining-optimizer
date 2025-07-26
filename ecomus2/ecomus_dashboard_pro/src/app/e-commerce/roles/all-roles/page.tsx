"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Loader2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

interface Role {
  _id?: string;
  id?: string;
  name: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
  isSystem?: boolean;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

export default function AllRolesPage() {
  const { data: session } = useSession();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Charger les rôles et permissions
  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetchRolesAndPermissions();
    }
  }, [session]);

  const fetchRolesAndPermissions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/roles');
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des rôles');
      }

      const data = await response.json();
      if (data.success) {
        setRoles(data.data.roles || []);
        setPermissions(data.data.permissions || []);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des rôles');
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les rôles selon le terme de recherche
  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRoles = filteredRoles.slice(startIndex, endIndex);

  const handleAddRole = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!newRoleName.trim() || selectedPermissions.length === 0) {
      toast.error('Nom du rôle et permissions requis');
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch('/api/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newRoleName.trim(),
          permissions: selectedPermissions,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Rôle créé avec succès');
        setNewRoleName("");
        setSelectedPermissions([]);
        setIsAddModalOpen(false);
        fetchRolesAndPermissions(); // Recharger la liste
      } else {
        toast.error(data.error || 'Erreur lors de la création du rôle');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la création du rôle');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditRole = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!editingRole || !newRoleName.trim()) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(`/api/roles/${editingRole?._id || editingRole?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newRoleName.trim(),
          permissions: selectedPermissions,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Rôle mis à jour avec succès');
        setIsEditModalOpen(false);
        setEditingRole(null);
        setNewRoleName("");
        setSelectedPermissions([]);
        fetchRolesAndPermissions();
      } else {
        toast.error(data.error || 'Erreur lors de la mise à jour du rôle');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la mise à jour du rôle');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce rôle ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Rôle supprimé avec succès');
        fetchRolesAndPermissions();
      } else {
        toast.error(data.error || 'Erreur lors de la suppression du rôle');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression du rôle');
    }
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions([...selectedPermissions, permissionId]);
    } else {
      setSelectedPermissions(
        selectedPermissions.filter((id) => id !== permissionId)
      );
    }
  };

  const openEditModal = (role: Role) => {
    setEditingRole(role);
    setNewRoleName(role.name);
    setSelectedPermissions([...role.permissions]);
    setIsEditModalOpen(true);
  };

  const resetModal = () => {
    setNewRoleName("");
    setSelectedPermissions([]);
    setEditingRole(null);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (session?.user?.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Accès non autorisé
            </h2>
            <p className="text-gray-600">
              Seuls les administrateurs peuvent gérer les rôles.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestion des Rôles
          </h1>
          <p className="text-gray-600">
            Gérez les rôles utilisateur et leurs permissions
          </p>
        </div>

        {/* Search and Add Role */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher un rôle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Dialog
            open={isAddModalOpen}
            onOpenChange={(open) => {
              setIsAddModalOpen(open);
              if (!open) resetModal();
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un rôle
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Ajouter un nouveau rôle</DialogTitle>
                <DialogDescription>
                  Créez un nouveau rôle et assignez-lui des permissions.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddRole}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="role-name" className="text-sm font-medium">
                      Nom du rôle
                    </label>
                    <Input
                      id="role-name"
                      placeholder="Entrez le nom du rôle"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Permissions</label>
                    <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto border rounded p-3">
                      {permissions.map((permission) => (
                        <div
                          key={permission.id}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            id={permission.id}
                            checked={selectedPermissions.includes(permission.id)}
                            onChange={(e) =>
                              handlePermissionChange(permission.id, e.target.checked)
                            }
                            className="rounded border-gray-300"
                          />
                          <label
                            htmlFor={permission.id}
                            className="text-sm font-normal"
                          >
                            {permission.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddModalOpen(false)}
                    disabled={actionLoading}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={actionLoading}>
                    {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Créer le rôle
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Modal */}
        <Dialog
          open={isEditModalOpen}
          onOpenChange={(open) => {
            setIsEditModalOpen(open);
            if (!open) resetModal();
          }}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Modifier le rôle</DialogTitle>
              <DialogDescription>
                Modifiez le nom et les permissions du rôle.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditRole}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="edit-role-name" className="text-sm font-medium">
                    Nom du rôle
                  </label>
                  <Input
                    id="edit-role-name"
                    placeholder="Entrez le nom du rôle"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Permissions</label>
                  <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto border rounded p-3">
                    {permissions.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          id={`edit-${permission.id}`}
                          checked={selectedPermissions.includes(permission.id)}
                          onChange={(e) =>
                            handlePermissionChange(permission.id, e.target.checked)
                          }
                          className="rounded border-gray-300"
                        />
                        <label
                          htmlFor={`edit-${permission.id}`}
                          className="text-sm font-normal"
                        >
                          {permission.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={actionLoading}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={actionLoading}>
                  {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Mettre à jour
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Roles Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">No</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Créé le</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentRoles.map((role, index) => (
                <TableRow key={role?._id || role?.id || index}>
                  <TableCell className="font-medium">
                    {String(startIndex + index + 1).padStart(2, "0")}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {role.name}
                      {role.isSystem && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Système
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {new Date(role.createdAt).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 3).map((permission) => {
                        const permissionInfo = permissions.find(p => p.id === permission);
                        return (
                          <span
                            key={permission}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {permissionInfo?.name || permission}
                          </span>
                        );
                      })}
                      {role.permissions.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          +{role.permissions.length - 3} autres
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Voir
                        </DropdownMenuItem>
                        {!role.isSystem && (
                          <>
                            <DropdownMenuItem onClick={() => openEditModal(role)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteRole(role?._id || role?.id || '')}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Afficher</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value));
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
            <span className="text-sm text-gray-600">entrées</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={`page-${page}`}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-8 h-8"
                >
                  {page}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-sm text-gray-600">
            Affichage de {startIndex + 1} à {Math.min(endIndex, filteredRoles.length)} sur {filteredRoles.length} entrées
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
