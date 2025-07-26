"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Plus,
  ChevronLeft,
  ChevronRight,
  Users,
  UserCheck,
  UserX,
  Crown,
  Loader2,
  AlertCircle,
  Grid,
  List,
} from "lucide-react";

// Interfaces TypeScript
interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  avatar?: string;
  role: 'admin' | 'vendor' | 'customer' | 'super_admin';
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  emailVerified: boolean;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    country?: string;
    zipCode?: string;
  };
  lastLogin?: string;
  ordersCount?: number;
  totalSpent?: number;
  createdAt: string;
  updatedAt: string;
}

interface UsersResponse {
  success: boolean;
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  stats: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    pendingUsers: number;
    adminUsers: number;
    vendorUsers: number;
    customerUsers: number;
  };
}

// Composant Skeleton simple
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

// Composant UserCard pour la vue grille
const UserCard: React.FC<{ 
  user: User; 
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onView: (user: User) => void;
}> = ({ user, onEdit, onDelete, onView }) => {
  const getDisplayName = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.name || user.email;
  };

  const getInitials = () => {
    const name = getDisplayName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRoleLabel = () => {
    switch (user.role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Admin';
      case 'vendor': return 'Vendeur';
      case 'customer': return 'Client';
      default: return user.role;
    }
  };

  const getRoleBadgeClass = () => {
    switch (user.role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      case 'vendor': return 'bg-blue-100 text-blue-800';
      case 'customer': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={getDisplayName()}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <span className="font-semibold text-gray-600">
                  {getInitials()}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-1">{getDisplayName()}</h3>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
          
          <Badge 
            className={`text-xs ${
              user.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : user.status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : user.status === 'suspended'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {user.status}
          </Badge>
        </div>
        
        <div className="mb-3">
          <Badge className={`text-xs ${getRoleBadgeClass()}`}>
            {getRoleLabel()}
          </Badge>
          {!user.emailVerified && (
            <Badge className="ml-2 text-xs bg-orange-100 text-orange-800">
              Email non vérifié
            </Badge>
          )}
        </div>
        
        {user.role === 'customer' && (
          <div className="text-xs text-gray-500 mb-3">
            <div>Commandes: {user.ordersCount || 0}</div>
            <div>Dépensé: {user.totalSpent?.toFixed(2) || '0.00'} €</div>
          </div>
        )}
        
        <div className="text-xs text-gray-500 mb-3">
          Créé le: {new Date(user.createdAt).toLocaleDateString('fr-FR')}
          {user.lastLogin && (
            <div>Dernière connexion: {new Date(user.lastLogin).toLocaleDateString('fr-FR')}</div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button 
            className="flex-1 border border-gray-300 hover:bg-gray-50 text-xs"
            onClick={() => onView(user)}
          >
            <Eye className="h-3 w-3 mr-1" />
            Voir
          </Button>
          <Button 
            className="border border-blue-300 hover:bg-blue-50 text-blue-600 text-xs"
            onClick={() => onEdit(user)}
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button 
            className="border border-red-300 hover:bg-red-50 text-red-600 text-xs"
            onClick={() => onDelete(user)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Composant UserDetail
const UserDetail: React.FC<{ 
  user: User; 
  onClose: () => void;
}> = ({ user, onClose }) => {
  const getDisplayName = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.name || user.email;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Détails utilisateur</h2>
          <Button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ×
          </Button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Informations de base */}
          <div>
            <h3 className="font-semibold mb-3">Informations personnelles</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Nom complet:</span>
                <div className="font-medium">{getDisplayName()}</div>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <div className="font-medium">{user.email}</div>
              </div>
              <div>
                <span className="text-gray-600">Téléphone:</span>
                <div className="font-medium">{user.phone || 'Non renseigné'}</div>
              </div>
              <div>
                <span className="text-gray-600">Rôle:</span>
                <div className="font-medium">{user.role}</div>
              </div>
              <div>
                <span className="text-gray-600">Statut:</span>
                <div className="font-medium">{user.status}</div>
              </div>
              <div>
                <span className="text-gray-600">Email vérifié:</span>
                <div className="font-medium">{user.emailVerified ? 'Oui' : 'Non'}</div>
              </div>
            </div>
          </div>
          
          {/* Adresse */}
          {user.address && (
            <div>
              <h3 className="font-semibold mb-3">Adresse</h3>
              <div className="text-sm space-y-1">
                {user.address.street && <div>{user.address.street}</div>}
                {user.address.city && <div>{user.address.city}</div>}
                {user.address.zipCode && <div>{user.address.zipCode}</div>}
                {user.address.country && <div>{user.address.country}</div>}
              </div>
            </div>
          )}
          
          {/* Statistiques client */}
          {user.role === 'customer' && (
            <div>
              <h3 className="font-semibold mb-3">Statistiques</h3>
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">{user.ordersCount || 0}</div>
                    <div className="text-xs text-gray-600">Commandes</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <div className="text-2xl font-bold text-green-600">{user.totalSpent?.toFixed(2) || '0.00'} €</div>
                    <div className="text-xs text-gray-600">Total dépensé</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          
          {/* Dates */}
          <div>
            <h3 className="font-semibold mb-3">Historique</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Créé le:</span>
                <div className="font-medium">{new Date(user.createdAt).toLocaleString('fr-FR')}</div>
              </div>
              <div>
                <span className="text-gray-600">Modifié le:</span>
                <div className="font-medium">{new Date(user.updatedAt).toLocaleString('fr-FR')}</div>
              </div>
              {user.lastLogin && (
                <div className="col-span-2">
                  <span className="text-gray-600">Dernière connexion:</span>
                  <div className="font-medium">{new Date(user.lastLogin).toLocaleString('fr-FR')}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant principal
export default function DynamicUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<UsersResponse['pagination'] | null>(null);
  const [stats, setStats] = useState<UsersResponse['stats'] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter, statusFilter]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchUsers();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(roleFilter && { role: roleFilter }),
        ...(statusFilter && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm }),
      });      const response = await fetch(`/api/users?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: any = await response.json();
      
      if (data.success) {
        // L'API retourne directement un tableau d'utilisateurs
        const usersArray = Array.isArray(data.users) ? data.users : [];
        setUsers(usersArray);
        
        // Créer une pagination basique si elle n'existe pas
        const paginationData = data.pagination || {
          page: currentPage,
          limit: 12,
          total: usersArray.length,
          totalPages: Math.ceil(usersArray.length / 12),
          hasNextPage: false,
          hasPrevPage: currentPage > 1
        };
        setPagination(paginationData);
        
        // Calculer les stats
        if (usersArray.length > 0) {
          const calculatedStats = {
            totalUsers: usersArray.length,
            activeUsers: usersArray.filter((u: any) => u.status === 'active').length,
            inactiveUsers: usersArray.filter((u: any) => u.status === 'inactive').length,
            pendingUsers: usersArray.filter((u: any) => u.status === 'pending').length,
            adminUsers: usersArray.filter((u: any) => ['admin', 'super_admin'].includes(u.role)).length,
            vendorUsers: usersArray.filter((u: any) => u.role === 'vendor').length,
            customerUsers: usersArray.filter((u: any) => u.role === 'customer').length,
          };
          setStats(calculatedStats);
        }
      } else {
        setError('Erreur lors de la récupération des utilisateurs');
        setUsers([]); // S'assurer que users reste un tableau
      }} catch (err) {
      console.error('Erreur lors du chargement des utilisateurs:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des utilisateurs');
      setUsers([]); // S'assurer que users reste un tableau même en cas d'erreur
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.email}" ?`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      await fetchUsers();
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  const handleEditUser = (user: User) => {
    // TODO: Implémenter la modification d'utilisateur
    console.log('Éditer utilisateur:', user);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
  };

  if (loading && (!users || users.length === 0)) {
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
              <Button onClick={fetchUsers} className="bg-blue-600 hover:bg-blue-700 text-white">
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
            <h1 className="text-3xl font-bold">Utilisateurs</h1>
            <p className="text-gray-600 mt-1">
              Gérez votre base d'utilisateurs
            </p>
          </div>
          <div className="flex gap-2">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Nouvel utilisateur
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
                    <p className="text-sm text-gray-600">Total utilisateurs</p>
                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Utilisateurs actifs</p>
                    <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Administrateurs</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.adminUsers}</p>
                  </div>
                  <Crown className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Clients</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.customerUsers}</p>
                  </div>
                  <Users className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtres et recherche */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
                <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                aria-label="Filtrer par rôle utilisateur"
              >
                <option value="">Tous les rôles</option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="vendor">Vendeur</option>
                <option value="customer">Client</option>
              </select>
                <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                aria-label="Filtrer par statut utilisateur"
              >
                <option value="">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
                <option value="pending">En attente</option>
                <option value="suspended">Suspendu</option>
              </select>
              
              <div className="flex gap-2">
                <Button
                  className={`border ${viewMode === 'table' ? 'bg-blue-50 border-blue-300' : 'border-gray-300 hover:bg-gray-50'}`}
                  onClick={() => setViewMode('table')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  className={`border ${viewMode === 'grid' ? 'bg-blue-50 border-blue-300' : 'border-gray-300 hover:bg-gray-50'}`}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contenu principal */}
        {users && users.length > 0 ? (
          <>
            {viewMode === 'table' ? (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Utilisateur</TableHead>
                        <TableHead>Rôle</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Email vérifié</TableHead>
                        <TableHead>Dernière connexion</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => {
                        const displayName = user.firstName && user.lastName 
                          ? `${user.firstName} ${user.lastName}` 
                          : user.name || user.email;
                        
                        return (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                                  {user.avatar ? (
                                    <img
                                      src={user.avatar}
                                      alt={displayName}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span className="font-semibold text-gray-600 text-sm">
                                      {displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium">{displayName}</div>
                                  <div className="text-sm text-gray-500">{user.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={
                                user.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                                user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                user.role === 'vendor' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }>
                                {user.role === 'super_admin' ? 'Super Admin' :
                                 user.role === 'admin' ? 'Admin' :
                                 user.role === 'vendor' ? 'Vendeur' : 'Client'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={
                                user.status === 'active' ? 'bg-green-100 text-green-800' :
                                user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                user.status === 'suspended' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }>
                                {user.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {user.emailVerified ? (
                                <Badge className="bg-green-100 text-green-800">Vérifié</Badge>
                              ) : (
                                <Badge className="bg-orange-100 text-orange-800">Non vérifié</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {user.lastLogin 
                                ? new Date(user.lastLogin).toLocaleDateString('fr-FR')
                                : 'Jamais'}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  className="border border-gray-300 hover:bg-gray-50"
                                  onClick={() => handleViewUser(user)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  className="border border-blue-300 hover:bg-blue-50 text-blue-600"
                                  onClick={() => handleEditUser(user)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  className="border border-red-300 hover:bg-red-50 text-red-600"
                                  onClick={() => handleDeleteUser(user)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {users.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    onEdit={handleEditUser}
                    onDelete={handleDeleteUser}
                    onView={handleViewUser}
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
                  {pagination.total} utilisateurs
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
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun utilisateur trouvé</h3>
              <p className="text-gray-600">
                {searchTerm || roleFilter || statusFilter
                  ? 'Aucun utilisateur ne correspond à vos critères de recherche.'
                  : 'Vous n\'avez pas encore d\'utilisateurs dans votre système.'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Modal de détail utilisateur */}
        {selectedUser && (
          <UserDetail
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
