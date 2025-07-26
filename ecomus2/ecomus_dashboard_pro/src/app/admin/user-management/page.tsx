"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Plus,
  Edit3,
  Trash2,
  Shield,
  ShieldCheck,
  Eye,
  EyeOff,
  Search,
  Crown,
  UserCheck,
  UserX,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Filter,
  Download,
  Upload,
  Settings,
  Mail,
  Phone,
  Building,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage, getGravatarUrl } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import NotificationSystem from "@/components/ui/notification-system";
import { GlassmorphismCard } from "@/components/ui/glass-morphism-card";
import AdminGuard from "@/components/admin/admin-guard";

interface AdminUser {
  _id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "ADMIN" | "MODERATOR";
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  createdBy: string;
  Profil?: {
    firstName: string;
    lastName: string;
    avatar?: string;
    phone?: string;
    department?: string;
    position?: string;
  };
}

interface CreateAdminForm {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
  role: "SUPER_ADMIN" | "ADMIN" | "MODERATOR";
  firstName: string;
  lastName: string;
  phone: string;
  department: string;
  position: string;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "success" | "error" | "info";
}

const ROLE_COLORS = {
  SUPER_ADMIN: "bg-gradient-to-r from-purple-500 to-pink-500",
  ADMIN: "bg-gradient-to-r from-blue-500 to-indigo-500",
  MODERATOR: "bg-gradient-to-r from-green-500 to-emerald-500",
};

const ROLE_ICONS = {
  SUPER_ADMIN: Crown,
  ADMIN: ShieldCheck,
  MODERATOR: Shield,
};

const ROLE_DESCRIPTIONS = {
  SUPER_ADMIN: "Accès complet à toutes les fonctionnalités du système",
  ADMIN: "Gestion des utilisateurs et des paramètres principaux",
  MODERATOR: "Modération du contenu et assistance utilisateurs",
};

export default function AdminManagementPage() {
  // États principaux
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // États de filtrage
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // États des modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Formulaire de création
  const [createForm, setCreateForm] = useState<CreateAdminForm>({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
    role: "MODERATOR",
    firstName: "",
    lastName: "",    phone: "",
    department: "",
    position: ""
  });

  // Utilitaires pour les notifications
  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addNotification = useCallback((
    message: string,
    type: "success" | "error" | "info" = "info",
    title?: string
  ) => {
    const id = Date.now().toString();
    const defaultTitle = type === "success" ? "Succès" : type === "error" ? "Erreur" : "Information";
    const notification = { 
      id, 
      message, 
      type, 
      title: title || defaultTitle 
    };
    setNotifications((prev) => [...prev, notification]);
    setTimeout(() => removeNotification(id), 5000);
  }, [removeNotification]);

  // Fonction utilitaire pour valider le format JWT
  const isValidJWTFormat = (token: string): boolean => {
    if (!token) return false;
    const parts = token.split('.');
    return parts.length === 3;
  };

  // Fonction pour nettoyer les tokens corrompus
  const cleanupCorruptedToken = () => {
    localStorage.removeItem("adminToken");
    addNotification("Token corrompu détecté, veuillez vous reconnecter", "error");
    setTimeout(() => {
      window.location.href = '/admin/login';
    }, 2000);
  };

  // Charger les administrateurs
  const loadAdmins = useCallback(async () => {
    try {
      const token = localStorage.getItem("adminToken");
      
      // Vérifier le format du token avant de l'envoyer
      if (!token || !isValidJWTFormat(token)) {
        cleanupCorruptedToken();
        return;
      }

      const response = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAdmins(data.admins);
      } else if (response.status === 401) {
        const errorData = await response.json();
        if (errorData.error?.includes('Session expirée') || errorData.error?.includes('Token') || errorData.error?.includes('invalide')) {
          // Nettoyer le token corrompu/expiré
          localStorage.removeItem("adminToken");
          addNotification("Session expirée, redirection vers la page de connexion", "error");
          setTimeout(() => {
            window.location.href = '/admin/login';
          }, 2000);
        } else {
          addNotification("Erreur d'authentification", "error");
        }
      } else {
        addNotification(
          "Erreur lors du chargement des administrateurs",
          "error"
        );
      }
    } catch (error) {
      console.error('Erreur lors du chargement des admins:', error);
      addNotification("Erreur de connexion", "error");
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  // Créer un administrateur
  const handleCreateAdmin = async () => {
    if (createForm.password !== createForm.confirmPassword) {
      addNotification("Les mots de passe ne correspondent pas", "error");
      return;
    }

    if (createForm.password.length < 8) {
      addNotification(
        "Le mot de passe doit contenir au moins 8 caractères",
        "error"
      );
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      
      // Vérifier le format du token avant de l'envoyer
      if (!token || !isValidJWTFormat(token)) {
        cleanupCorruptedToken();
        return;
      }

      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: createForm.email,
          name: createForm.name,
          password: createForm.password,
          role: createForm.role,
          Profil: {
            firstName: createForm.firstName,
            lastName: createForm.lastName,
            phone: createForm.phone,
            department: createForm.department,
            position: createForm.position,
          },
        }),
      });

      if (response.ok) {
        addNotification("Administrateur créé avec succès", "success");
        setIsCreateModalOpen(false);
        setCreateForm({
          email: "",
          name: "",
          password: "",
          confirmPassword: "",
          role: "MODERATOR",
          firstName: "",
          lastName: "",
          phone: "",
          department: "",
          position: "",
        });        loadAdmins();
      } else {
        const errorData = await response.json();
        addNotification(errorData.error || "Erreur lors de la création", "error");
      }
    } catch {
      addNotification("Erreur de connexion", "error");
    }
  };

  // Modifier le statut d'un administrateur
  const toggleAdminStatus = async (email: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem("adminToken");
      
      // Vérifier le format du token avant de l'envoyer
      if (!token || !isValidJWTFormat(token)) {
        cleanupCorruptedToken();
        return;
      }

      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetEmail: email,
          updates: { isActive: !currentStatus },
        }),
      });

      if (response.ok) {
        addNotification(
          `Administrateur ${
            !currentStatus ? "activé" : "désactivé"
          } avec succès`,
          "success"
        );        loadAdmins();
      } else {
        const errorData = await response.json();
        addNotification(
          errorData.error || "Erreur lors de la modification",
          "error"
        );
      }
    } catch {
      addNotification("Erreur de connexion", "error");
    }
  };

  // Supprimer un administrateur
  const handleDeleteAdmin = async (email: string) => {
    try {
      const token = localStorage.getItem("adminToken");
      
      // Vérifier le format du token avant de l'envoyer
      if (!token || !isValidJWTFormat(token)) {
        cleanupCorruptedToken();
        return;
      }

      const response = await fetch(
        `/api/admin/users?email=${encodeURIComponent(email)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        addNotification("Administrateur supprimé avec succès", "success");
        setShowDeleteConfirm(null);        loadAdmins();
      } else {
        const errorData = await response.json();
        addNotification(
          errorData.error || "Erreur lors de la suppression",
          "error"
        );
      }
    } catch {
      addNotification("Erreur de connexion", "error");
    }
  };  // Charger les données au montage
  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  // Filtrer les administrateurs
  useEffect(() => {
    let filtered = admins;

    if (searchTerm) {
      filtered = filtered.filter(
        (admin) =>
          admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          admin.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((admin) => admin.role === roleFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((admin) =>
        statusFilter === "active" ? admin.isActive : !admin.isActive
      );
    }

    setFilteredAdmins(filtered);
  }, [admins, searchTerm, roleFilter, statusFilter]);

  // Calculs des statistiques
  const activeAdmins = admins.filter((admin) => admin.isActive).length;
  const inactiveAdmins = admins.filter((admin) => !admin.isActive).length;
  const superAdmins = admins.filter(
    (admin) => admin.role === "SUPER_ADMIN"
  ).length;

  if (loading) {
    return (
      <AdminGuard requiredRole="admin">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard requiredRole="admin">
      <div className="relative">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 dark:from-blue-400/10 dark:to-purple-600/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-600/20 dark:from-indigo-400/10 dark:to-pink-600/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <NotificationSystem
            notifications={notifications}
            onRemoveNotification={removeNotification}
          />

          <div className="max-w-7xl mx-auto space-y-8">
            {/* Enhanced Header */}
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center space-y-6 py-8"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-4"
              >
                <Users className="w-10 h-10 text-white" />
              </motion.div>
              
              <div className="space-y-4">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent leading-tight">
                  Gestion des Administrateurs
                </h1>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-600 dark:text-gray-300 text-xl max-w-2xl mx-auto leading-relaxed"
                >
                  Gérez les accès et permissions de votre équipe administrative avec des outils modernes et intuitifs
                </motion.p>
              </div>
              
              {/* Quick actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-center gap-4 pt-4"
              >
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Exporter
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Upload className="w-4 h-4" />
                  Importer
                </Button>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsSettingsModalOpen(true)}>
                  <Settings className="w-4 h-4" />
                  Paramètres
                </Button>
              </motion.div>
            </motion.div>

            {/* Enhanced Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {[
                {
                  title: "Total Admins",
                  value: admins.length,
                  icon: <Users className="w-6 h-6" />,
                  color: "from-blue-500 to-blue-600",
                  bgColor: "bg-blue-50",
                  change: "+12%",
                  changeType: "positive"
                },
                {
                  title: "Actifs",
                  value: activeAdmins,
                  icon: <UserCheck className="w-6 h-6" />,
                  color: "from-green-500 to-green-600",
                  bgColor: "bg-green-50",
                  change: "+8%",
                  changeType: "positive"
                },
                {
                  title: "Inactifs",
                  value: inactiveAdmins,
                  icon: <UserX className="w-6 h-6" />,
                  color: "from-red-500 to-red-600",
                  bgColor: "bg-red-50",
                  change: "-3%",
                  changeType: "negative"
                },
                {
                  title: "Super Admins",
                  value: superAdmins,
                  icon: <Crown className="w-6 h-6" />,
                  color: "from-purple-500 to-purple-600",
                  bgColor: "bg-purple-50",
                  change: "0%",
                  changeType: "neutral"
                }
              ].map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.9 + index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="group"
                >
                  <GlassmorphismCard className="p-6 hover:shadow-xl transition-all duration-300 border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl ${stat.bgColor} dark:bg-gray-700/50 group-hover:scale-110 transition-transform duration-300`}>
                        <div className="text-white">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color}`}>
                            {stat.icon}
                          </div>
                        </div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        stat.changeType === 'positive' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        stat.changeType === 'negative' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {stat.change}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1.2 + index * 0.1, duration: 0.5, type: "spring" }}
                        className="text-3xl font-bold text-gray-900 dark:text-white"
                      >
                        {stat.value}
                      </motion.div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">{stat.title}</p>
                    </div>
                  </GlassmorphismCard>
                </motion.div>
              ))}
            </motion.div>

            {/* Enhanced Controls */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.6 }}
            >
              <GlassmorphismCard className="p-8 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-xl">
                <div className="space-y-6">
                  {/* Header with filters toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                        <Filter className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filtres et Recherche</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Trouvez rapidement les administrateurs</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {filteredAdmins.length} résultat{filteredAdmins.length > 1 ? 's' : ''}
                    </div>
                  </div>

                  {/* Search and filters */}
                  <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
                      {/* Enhanced search */}
                      <motion.div 
                        className="relative flex-1 max-w-md"
                        whileFocus={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          placeholder="Rechercher par nom, email, département..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-12 pr-4 py-3 w-full border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/70 dark:hover:bg-gray-700/70 text-gray-900 dark:text-white"
                        />
                        {searchTerm && (
                          <motion.button
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                          </motion.button>
                        )}
                      </motion.div>

                      {/* Enhanced filters */}
                      <div className="flex gap-3">
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                          <SelectTrigger className="w-full sm:w-48 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm hover:bg-white/70 dark:hover:bg-gray-700/70 transition-all duration-300">
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                              <SelectValue placeholder="Filtrer par rôle" />
                            </div>
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-0 shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-md">
                            <SelectItem value="all" className="rounded-lg">Tous les rôles</SelectItem>
                            <SelectItem value="SUPER_ADMIN" className="rounded-lg">
                              <div className="flex items-center gap-2">
                                <Crown className="w-4 h-4 text-purple-500" />
                                Super Admin
                              </div>
                            </SelectItem>
                            <SelectItem value="ADMIN" className="rounded-lg">
                              <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-blue-500" />
                                Admin
                              </div>
                            </SelectItem>
                            <SelectItem value="MODERATOR" className="rounded-lg">
                              <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-green-500" />
                                Modérateur
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>

                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-full sm:w-48 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm hover:bg-white/70 dark:hover:bg-gray-700/70 transition-all duration-300">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                              <SelectValue placeholder="Filtrer par statut" />
                            </div>
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-0 shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-md">
                            <SelectItem value="all" className="rounded-lg">Tous les statuts</SelectItem>
                            <SelectItem value="active" className="rounded-lg">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                Actifs
                              </div>
                            </SelectItem>
                            <SelectItem value="inactive" className="rounded-lg">
                              <div className="flex items-center gap-2">
                                <XCircle className="w-4 h-4 text-red-500" />
                                Inactifs
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                    {/* Enhanced Create Button */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Dialog
                        open={isCreateModalOpen}
                        onOpenChange={setIsCreateModalOpen}
                      >
                        <DialogTrigger asChild>
                          <Button className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 font-semibold">
                            <motion.div
                              className="flex items-center gap-2"
                              initial={{ x: 0 }}
                              whileHover={{ x: 2 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Plus className="w-5 h-5" />
                              Nouvel Administrateur
                            </motion.div>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-2xl rounded-2xl">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <DialogHeader className="pb-6 border-b border-gray-100 dark:border-gray-700">
                              <div className="flex items-center gap-4">
                                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                                  <Plus className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">Créer un Nouvel Administrateur</DialogTitle>
                                  <p className="text-gray-500 dark:text-gray-400 mt-1">Ajoutez un nouveau membre à votre équipe administrative</p>
                                </div>
                              </div>
                            </DialogHeader>
                            
                            <div className="py-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Email Field */}
                                <motion.div 
                                  className="space-y-3"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.1 }}
                                >
                                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-blue-500" />
                                    Email *
                                  </Label>
                                  <div className="relative">
                                    <Input
                                      id="email"
                                      type="email"
                                      value={createForm.email}
                                      onChange={(e) =>
                                        setCreateForm({
                                          ...createForm,
                                          email: e.target.value,
                                        })
                                      }
                                      placeholder="admin@exemple.com"
                                      className="pl-4 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/70 dark:hover:bg-gray-700/70 text-gray-900 dark:text-white"
                                    />
                                  </div>
                                </motion.div>

                                {/* Full Name Field */}
                                <motion.div 
                                  className="space-y-3"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.15 }}
                                >
                                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-green-500" />
                                    Nom complet *
                                  </Label>
                                  <Input
                                    id="name"
                                    value={createForm.name}
                                    onChange={(e) =>
                                      setCreateForm({ ...createForm, name: e.target.value })
                                    }
                                    placeholder="Jean Dupont"
                                    className="pl-4 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/70 dark:hover:bg-gray-700/70 text-gray-900 dark:text-white"
                                  />
                                </motion.div>

                                {/* First Name Field */}
                                <motion.div 
                                  className="space-y-3"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.2 }}
                                >
                                  <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Prénom</Label>
                                  <Input
                                    id="firstName"
                                    value={createForm.firstName}
                                    onChange={(e) =>
                                      setCreateForm({
                                        ...createForm,
                                        firstName: e.target.value,
                                      })
                                    }
                                    placeholder="Jean"
                                    className="pl-4 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/70 dark:hover:bg-gray-700/70 text-gray-900 dark:text-white"
                                  />
                                </motion.div>

                                {/* Last Name Field */}
                                <motion.div 
                                  className="space-y-3"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.25 }}
                                >
                                  <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700">Nom de famille</Label>
                                  <Input
                                    id="lastName"
                                    value={createForm.lastName}
                                    onChange={(e) =>
                                      setCreateForm({
                                        ...createForm,
                                        lastName: e.target.value,
                                      })
                                    }
                                    placeholder="Dupont"
                                    className="pl-4 pr-4 py-3 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/70"
                                  />
                                </motion.div>

                                {/* Password Field */}
                                <motion.div 
                                  className="space-y-3"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.3 }}
                                >
                                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-red-500" />
                                    Mot de passe *
                                  </Label>
                                  <Input
                                    id="password"
                                    type="password"
                                    value={createForm.password}
                                    onChange={(e) =>
                                      setCreateForm({
                                        ...createForm,
                                        password: e.target.value,
                                      })
                                    }
                                    placeholder="Min. 8 caractères"
                                    className="pl-4 pr-4 py-3 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/70"
                                  />
                                </motion.div>

                                {/* Confirm Password Field */}
                                <motion.div 
                                  className="space-y-3"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.35 }}
                                >
                                  <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-orange-500" />
                                    Confirmer le mot de passe *
                                  </Label>
                                  <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={createForm.confirmPassword}
                                    onChange={(e) =>
                                      setCreateForm({
                                        ...createForm,
                                        confirmPassword: e.target.value,
                                      })
                                    }
                                    placeholder="Répéter le mot de passe"
                                    className="pl-4 pr-4 py-3 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/70"
                                  />
                                </motion.div>

                                {/* Role Field */}
                                <motion.div 
                                  className="space-y-3"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.4 }}
                                >
                                  <Label htmlFor="role" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Crown className="w-4 h-4 text-purple-500" />
                                    Rôle *
                                  </Label>
                                  <Select
                                    value={createForm.role}
                                    onValueChange={(value: "SUPER_ADMIN" | "ADMIN" | "MODERATOR") =>
                                      setCreateForm({ ...createForm, role: value })
                                    }
                                  >
                                    <SelectTrigger className="border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm hover:bg-white/70 dark:hover:bg-gray-700/70 transition-all duration-300">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-0 shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-md">
                                      <SelectItem value="MODERATOR" className="rounded-lg">
                                        <div className="flex items-center gap-2">
                                          <Shield className="w-4 h-4 text-green-500" />
                                          Modérateur
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="ADMIN" className="rounded-lg">
                                        <div className="flex items-center gap-2">
                                          <ShieldCheck className="w-4 h-4 text-blue-500" />
                                          Administrateur
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="SUPER_ADMIN" className="rounded-lg">
                                        <div className="flex items-center gap-2">
                                          <Crown className="w-4 h-4 text-purple-500" />
                                          Super Administrateur
                                        </div>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <motion.p 
                                    className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border-l-4 border-blue-500"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                  >
                                    {ROLE_DESCRIPTIONS[createForm.role]}
                                  </motion.p>
                                </motion.div>

                                {/* Phone Field */}
                                <motion.div 
                                  className="space-y-3"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.45 }}
                                >
                                  <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-indigo-500" />
                                    Téléphone
                                  </Label>
                                  <Input
                                    id="phone"
                                    value={createForm.phone}
                                    onChange={(e) =>
                                      setCreateForm({
                                        ...createForm,
                                        phone: e.target.value,
                                      })
                                    }
                                    placeholder="+33 1 23 45 67 89"
                                    className="pl-4 pr-4 py-3 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/70"
                                  />
                                </motion.div>

                                {/* Department Field */}
                                <motion.div 
                                  className="space-y-3"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.5 }}
                                >
                                  <Label htmlFor="department" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Building className="w-4 h-4 text-teal-500" />
                                    Département
                                  </Label>
                                  <Input
                                    id="department"
                                    value={createForm.department}
                                    onChange={(e) =>
                                      setCreateForm({
                                        ...createForm,
                                        department: e.target.value,
                                      })
                                    }
                                    placeholder="IT, Marketing, etc."
                                    className="pl-4 pr-4 py-3 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/70"
                                  />
                                </motion.div>

                                {/* Position Field */}
                                <motion.div 
                                  className="space-y-3"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.55 }}
                                >
                                  <Label htmlFor="position" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-amber-500" />
                                    Poste
                                  </Label>
                                  <Input
                                    id="position"
                                    type="text"
                                    value={createForm.position}
                                    onChange={(e) =>
                                      setCreateForm({
                                        ...createForm,
                                        position: e.target.value,
                                      })
                                    }
                                    placeholder="Responsable, Manager, etc."
                                    className="pl-4 pr-4 py-3 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/70"
                                  />
                                </motion.div>
                              </div>

                              {/* Dialog Footer */}
                              <motion.div 
                                className="flex justify-end space-x-4 pt-6 border-t border-gray-100 dark:border-gray-700"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                              >
                                <Button
                                  variant="outline"
                                  onClick={() => setIsCreateModalOpen(false)}
                                  className="px-6 py-3 border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 rounded-xl transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                >
                                  Annuler
                                </Button>
                                <Button
                                  onClick={handleCreateAdmin}
                                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Créer l&apos;Administrateur
                                </Button>
                              </motion.div>
                            </div>
                          </motion.div>
                          </DialogContent>
                        </Dialog>
                      </motion.div>
                </div>
              </GlassmorphismCard>
            </motion.div>

          {/* Liste des administrateurs */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <AnimatePresence>
              {filteredAdmins.map((admin, index) => {
                const RoleIcon = ROLE_ICONS[admin.role] || Shield;

                return (
                  <motion.div
                    key={admin._id}
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -50, scale: 0.9 }}
                    transition={{ 
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 100,
                      damping: 15
                    }}
                    whileHover={{ 
                      y: -8,
                      transition: { type: "spring", stiffness: 300, damping: 20 }
                    }}
                    className="group"
                  >
                    <GlassmorphismCard className="relative p-4 sm:p-6 hover:shadow-2xl transition-all duration-500 overflow-hidden border border-white/20 dark:border-gray-700/50 bg-white/90 dark:bg-gray-800/90 h-full flex flex-col">
                      {/* Background gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent dark:from-gray-700/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      {/* Status indicator */}
                      <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${
                        admin.isActive ? 'bg-green-400 shadow-green-400/50' : 'bg-red-400 shadow-red-400/50'
                      } shadow-lg animate-pulse`} />
                      
                      <div className="relative space-y-4 sm:space-y-6 flex flex-col h-full">
                        {/* Header de la carte */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                            {/* Avatar avec Gravatar */}
                            <div className="relative flex-shrink-0">
                              <Avatar className="w-12 h-12 sm:w-16 sm:h-16 ring-2 ring-white/50 dark:ring-gray-600/50 shadow-lg">
                                <AvatarImage 
                                  src={admin.Profil?.avatar || getGravatarUrl(admin.email, 128)} 
                                  alt={admin.name}
                                />
                                <AvatarFallback className="bg-gradient-to-br from-gray-500 to-gray-600 text-white text-sm sm:text-lg font-semibold">
                                  {admin.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              {/* Icône de rôle en overlay */}
                              <motion.div
                                className={`absolute -bottom-1 -right-1 p-1.5 sm:p-2 rounded-xl ${
                                  ROLE_COLORS[admin.role]
                                } text-white shadow-lg`}
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ type: "spring", stiffness: 300 }}
                              >
                                <RoleIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              </motion.div>
                            </div>
                            <div className="space-y-1 flex-1 min-w-0">
                              <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 truncate">
                                {admin.name}
                              </h3>
                              <div className="flex items-center gap-2 min-w-0">
                                <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium truncate">
                                  {admin.email}
                                </p>
                              </div>
                              {/* Affichage du nom complet si disponible */}
                              {admin.Profil?.firstName && admin.Profil?.lastName && (
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                                  {admin.Profil.firstName} {admin.Profil.lastName}
                                </p>
                              )}
                            </div>
                          </div>

                          <motion.div 
                            className="flex items-center space-x-2 flex-shrink-0"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.1 + 0.3 }}
                          >
                            {admin.isActive ? (
                              <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
                                <span className="text-xs font-semibold text-green-700 dark:text-green-400 hidden sm:inline">Actif</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 rounded-full">
                                <XCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 dark:text-red-400" />
                                <span className="text-xs font-semibold text-red-700 dark:text-red-400 hidden sm:inline">Inactif</span>
                              </div>
                            )}
                          </motion.div>
                        </div>

                        {/* Informations */}
                        <div className="space-y-2 flex-grow">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Rôle:</span>
                            <Badge
                              variant="secondary"
                              className={`${
                                ROLE_COLORS[admin.role]
                              } text-white`}
                            >
                              {admin.role}
                            </Badge>
                          </div>

                          {admin.Profil?.department && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                Département:
                              </span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {admin.Profil.department}
                              </span>
                            </div>
                          )}

                          {admin.Profil?.position && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                Poste:
                              </span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {admin.Profil.position}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Créé le:
                            </span>
                            <span className="text-sm text-gray-900 dark:text-white">
                              {new Date(admin.createdAt).toLocaleDateString(
                                "fr-FR"
                              )}
                            </span>
                          </div>

                          {admin.lastLogin && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                Dernière connexion:
                              </span>
                              <span className="text-sm text-gray-900 dark:text-white">
                                {new Date(admin.lastLogin).toLocaleDateString(
                                  "fr-FR"
                                )}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                          {/* Bouton d'activation/désactivation - pleine largeur sur mobile */}
                          <div className="w-full">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                toggleAdminStatus(admin.email, admin.isActive)
                              }
                              className="w-full sm:w-auto border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 justify-center"
                            >
                              {admin.isActive ? (
                                <>
                                  <EyeOff className="w-4 h-4 mr-2" />
                                  <span className="hidden sm:inline">Désactiver</span>
                                  <span className="sm:hidden">Désactiver</span>
                                </>
                              ) : (
                                <>
                                  <Eye className="w-4 h-4 mr-2" />
                                  <span className="hidden sm:inline">Activer</span>
                                  <span className="sm:hidden">Activer</span>
                                </>
                              )}
                            </Button>
                          </div>

                          {/* Boutons d'édition et suppression */}
                          <div className="flex space-x-2 w-full">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 justify-center"
                            >
                              <Edit3 className="w-4 h-4 mr-2" />
                              <span className="hidden sm:inline">Modifier</span>
                              <span className="sm:hidden">Éditer</span>
                            </Button>

                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setShowDeleteConfirm(admin.email)}
                              className="flex-1 justify-center"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              <span className="hidden sm:inline">Supprimer</span>
                              <span className="sm:hidden">Suppr.</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </GlassmorphismCard>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

          {filteredAdmins.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                Aucun administrateur trouvé
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Aucun administrateur ne correspond à vos critères de recherche.
              </p>
            </div>
          )}

          {/* Modal de confirmation de suppression */}
          <Dialog
            open={!!showDeleteConfirm}
            onOpenChange={() => setShowDeleteConfirm(null)}
          >
            <DialogContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-200 dark:border-gray-700">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span className="text-gray-900 dark:text-white">Confirmer la suppression</span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  Êtes-vous sûr de vouloir supprimer l&apos;administrateur{" "}
                  <strong>{showDeleteConfirm}</strong> ?
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Cette action marquera le compte comme inactif. Cette action
                  peut être annulée.
                </p>
                <div className="flex justify-end space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(null)}
                    className="border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() =>
                      showDeleteConfirm && handleDeleteAdmin(showDeleteConfirm)
                    }
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Modal des Paramètres */}
          <Dialog open={isSettingsModalOpen} onOpenChange={setIsSettingsModalOpen}>
            <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-white">
                  Paramètres de gestion des utilisateurs
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Paramètres de sécurité */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Sécurité
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Authentification à deux facteurs
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Activer 2FA pour tous les nouveaux administrateurs
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        defaultChecked
                        aria-label="Activer l'authentification à deux facteurs"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Expiration des sessions
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Déconnexion automatique après 24h d'inactivité
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        defaultChecked
                        aria-label="Activer l'expiration automatique des sessions"
                      />
                    </div>
                  </div>
                </div>

                {/* Paramètres de notification */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Notifications
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Notifications email
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Recevoir des notifications par email
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        defaultChecked
                        aria-label="Activer les notifications par email"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Notifications push
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Recevoir des notifications push dans le navigateur
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        aria-label="Activer les notifications push"
                      />
                    </div>
                  </div>
                </div>

                {/* Paramètres d'export */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Export de données
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Format d'export par défaut
                        </p>
                      </div>
                      <select 
                        className="w-full p-2 border rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        aria-label="Format d'export par défaut"
                      >
                        <option value="csv">CSV</option>
                        <option value="excel">Excel</option>
                        <option value="json">JSON</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsSettingsModalOpen(false)}
                    className="border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={() => {
                      // Ici on pourrait ajouter la logique de sauvegarde
                      console.log("Paramètres sauvegardés");
                      setIsSettingsModalOpen(false);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Sauvegarder
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
          </div>
        </div>
    </AdminGuard>
  );
}

