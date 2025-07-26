"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassmorphismCard } from "@/components/ui/glass-morphism-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Store, 
  Star, 
  Users, 
  Package, 
  Search, 
  Filter, 
  MapPin,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  MoreHorizontal
} from "lucide-react";
import { toast } from "sonner";
import AdminGuard from "@/components/admin/admin-guard";

interface Vendor {
  id: string;
  businessName: string;
  ownerName: string;
  avatar?: string;
  description?: string;
  location?: string;
  category?: string;
  isVerified: boolean;
  isActive: boolean;
  rating?: number;
  reviewCount?: number;
  totalProducts?: number;
  joinDate: string;
  email?: string;
  phone?: string;
}

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("rating");

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          search: searchTerm,
          category: selectedCategory !== "all" ? selectedCategory : "",
          status: selectedStatus !== "all" ? selectedStatus : "",
          sortBy,
        });

        const response = await fetch(`/api/admin/vendors?${params}`);
        if (response.ok) {
          const data = await response.json();
          setVendors(data.vendors || []);
        } else {
          toast.error("Erreur lors du chargement des vendeurs");
        }
      } catch (error) {
        console.error("Error fetching vendors:", error);
        toast.error("Erreur lors du chargement des vendeurs");
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, [searchTerm, selectedCategory, selectedStatus, sortBy]);

  const handleVerifyVendor = async (vendorId: string, verify: boolean) => {
    try {
      const response = await fetch(`/api/admin/vendors/${vendorId}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified: verify }),
      });

      if (response.ok) {
        setVendors(vendors.map(vendor => 
          vendor.id === vendorId 
            ? { ...vendor, isVerified: verify }
            : vendor
        ));
        toast.success(`Vendeur ${verify ? 'vérifié' : 'non vérifié'} avec succès`);
      } else {
        toast.error("Erreur lors de la mise à jour");
      }
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleToggleStatus = async (vendorId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/vendors/${vendorId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });

      if (response.ok) {
        setVendors(vendors.map(vendor => 
          vendor.id === vendorId 
            ? { ...vendor, isActive }
            : vendor
        ));
        toast.success(`Vendeur ${isActive ? 'activé' : 'désactivé'} avec succès`);
      } else {
        toast.error("Erreur lors de la mise à jour");
      }
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || vendor.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || 
                         (selectedStatus === "verified" && vendor.isVerified) ||
                         (selectedStatus === "unverified" && !vendor.isVerified) ||
                         (selectedStatus === "active" && vendor.isActive) ||
                         (selectedStatus === "inactive" && !vendor.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <AdminGuard>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Gestion des Vendeurs
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gérez et supervisez tous les vendeurs de la plateforme
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="px-3 py-1">
                {filteredVendors.length} vendeur{filteredVendors.length > 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Filtres et recherche */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassmorphismCard className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher par nom de boutique ou propriétaire..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  <SelectItem value="fashion">Mode</SelectItem>
                  <SelectItem value="electronics">Électronique</SelectItem>
                  <SelectItem value="food">Alimentation</SelectItem>
                  <SelectItem value="books">Livres</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="verified">Vérifiés</SelectItem>
                  <SelectItem value="unverified">Non vérifiés</SelectItem>
                  <SelectItem value="active">Actifs</SelectItem>
                  <SelectItem value="inactive">Inactifs</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Note</SelectItem>
                  <SelectItem value="name">Nom</SelectItem>
                  <SelectItem value="joinDate">Date d'inscription</SelectItem>
                  <SelectItem value="products">Nombre de produits</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </GlassmorphismCard>
        </motion.div>

        {/* Liste des vendeurs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <GlassmorphismCard key={index} className="p-6 animate-pulse">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-300 rounded"></div>
                    <div className="h-3 bg-gray-300 rounded w-5/6"></div>
                  </div>
                </div>
              </GlassmorphismCard>
            ))
          ) : filteredVendors.length > 0 ? (
            filteredVendors.map((vendor, index) => (
              <motion.div
                key={vendor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <GlassmorphismCard className="p-6 hover:shadow-xl transition-all duration-300 group">
                  <div className="space-y-4">
                    {/* Header avec avatar et info */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={vendor.avatar} alt={vendor.businessName} />
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                            {vendor.businessName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors">
                            {vendor.businessName}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {vendor.ownerName}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {vendor.isVerified && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                        <Badge variant={vendor.isActive ? "default" : "secondary"}>
                          {vendor.isActive ? "Actif" : "Inactif"}
                        </Badge>
                      </div>
                    </div>

                    {/* Informations */}
                    <div className="space-y-2">
                      {vendor.location && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="w-4 h-4 mr-2" />
                          {vendor.location}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <Star className="w-4 h-4 mr-1 text-yellow-500" />
                          {vendor.rating?.toFixed(1) || "N/A"} ({vendor.reviewCount || 0})
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <Package className="w-4 h-4 mr-1" />
                          {vendor.totalProducts || 0} produits
                        </div>
                      </div>

                      {vendor.category && (
                        <Badge variant="outline" className="w-fit">
                          {vendor.category}
                        </Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVerifyVendor(vendor.id, !vendor.isVerified)}
                          className={vendor.isVerified ? "text-orange-600 border-orange-300" : "text-green-600 border-green-300"}
                        >
                          {vendor.isVerified ? "Retirer vérification" : "Vérifier"}
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleStatus(vendor.id, !vendor.isActive)}
                          className={vendor.isActive ? "text-red-600 border-red-300" : "text-green-600 border-green-300"}
                        >
                          {vendor.isActive ? "Désactiver" : "Activer"}
                        </Button>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </GlassmorphismCard>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full">
              <GlassmorphismCard className="p-12 text-center">
                <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Aucun vendeur trouvé
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Aucun vendeur ne correspond à vos critères de recherche.
                </p>
              </GlassmorphismCard>
            </div>
          )}
        </motion.div>
      </div>
    </AdminGuard>
  );
}
