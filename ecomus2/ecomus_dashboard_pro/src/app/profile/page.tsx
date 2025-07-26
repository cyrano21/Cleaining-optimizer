"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit3,
  Camera,
  Save,
  X,
  Shield,
  Award,
  Heart,
  ShoppingBag,
  Star,
  Settings,
  Bell,
  Lock,
  CreditCard,
  Package,
  Truck,
  MessageCircle,
  Share2,
  Download,
  Upload,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/toast";
import { useSession } from "next-auth/react";

export default function ProfilPage() {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const { data: session, status } = useSession();

  const [ProfilData, setProfilData] = useState({
    firstName: "Loading...",
    lastName: "",
    email: "Loading...",
    phone: "Loading...",
    website: "Loading...",
    company: "Loading...",
    bio: "Loading...",
    avatar: "",
    avatarPublicId: "", // Ajouter le public_id pour Cloudinary
    location: "Loading...",
    position: "Loading...",
    joinDate: "Loading...",
    coverImage: "/api/placeholder/800/200",
    stats: {
      ordersCount: 0,
      reviewsCount: 0,
      wishlistCount: 0,
      loyaltyPoints: 0,
    },
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      marketingEmails: true,    },
  });

  // Fonction pour charger les statistiques utilisateur
  const loadUserStats = async () => {
    try {
      // Charger le nombre de commandes
      const ordersResponse = await fetch('/api/orders?count=true');
      if (ordersResponse.ok) {
        const ordersResult = await ordersResponse.json();
        if (ordersResult.success) {
          setProfilData(prev => ({
            ...prev,
            stats: {
              ...prev.stats,
              ordersCount: ordersResult.count || 0
            }
          }));
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  // Fetch Profil data from API
  useEffect(() => {
    const fetchProfilData = async () => {
      if (status === 'loading') return; // Attendre que la session soit chargée
      if (status === 'unauthenticated') return; // Ne pas charger si non connecté

      try {
        setLoading(true);
        const response = await fetch('/api/settings/profile');
        if (response.ok) {
          const result = await response.json();
          console.log('Profil data fetched:', result);
          
          // Map API data to component state - access data from result.data
          const data = result.data;
          setProfilData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            phone: data.phone || '',
            website: data.website || '',
            company: data.company || '',
            bio: data.bio || '',
            avatar: data.avatar || '',
            avatarPublicId: data.avatarPublicId || '',
            location: data.location || '',
            position: data.position || '',
            joinDate: data.joinDate || '',
            coverImage: "",            stats: {
              ordersCount: 0,
              wishlistCount: 0,
              reviewsCount: 0,
              loyaltyPoints: 0
            },
            preferences: {
              emailNotifications: true,
              smsNotifications: false,
              marketingEmails: true
            }
          });          // Charger les statistiques séparément
          await loadUserStats();
        } else {
          console.error('Failed to fetch Profil data');
          toast({
            type: 'error',
            title: 'Erreur',
            description: 'Impossible de charger les données du profil'
          });        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfilData();
  }, [status]);

  // État pour les commandes réelles
  const [commandes, setCommandes] = useState<Array<{
    id: string;
    date: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    total: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
  }>>([]);

  // État pour les activités réelles
  const [activities, setActivities] = useState<Array<{
    type: string;
    action: string;
    id: string;
    date: string;
  }>>([]);

  // Charger les vraies commandes
  useEffect(() => {
    const loadCommandes = async () => {
      if (status === 'loading' || status === 'unauthenticated') return;

      try {
        const response = await fetch('/api/orders?limit=5');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const orders = result.data.map((order: any) => ({
              id: order.orderNumber || order._id,
              date: new Date(order.createdAt).toLocaleDateString('fr-FR'),
              status: order.status || 'pending',
              total: `${order.total || 0}€`,
              items: order.items || []
            }));
            setCommandes(orders);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des commandes:', error);
      }
    };    loadCommandes();
  }, [status]);
  const saveProfil = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: ProfilData.firstName,
          lastName: ProfilData.lastName,
          email: ProfilData.email,
          phone: ProfilData.phone,
          company: ProfilData.company,
          website: ProfilData.website,
          bio: ProfilData.bio,
          avatar: ProfilData.avatar,
          location: ProfilData.location,
          position: ProfilData.position,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save Profil');
      }

      const result = await response.json();
      console.log("Profil saved successfully:", result);
      
      // Optionnel: Afficher un message de succès
      alert('Profil sauvegardé avec succès !');
      
    } catch (error) {
      console.error("Error saving Profil:", error);
      alert('Erreur lors de la sauvegarde du profil.');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (avatarUrl: string | null, publicId?: string | null) => {
    setProfilData(prev => ({
      ...prev,
      avatar: avatarUrl || '/images/placeholder.svg',
      avatarPublicId: publicId || ''
    }));
  };

  interface StatusColorMap {
    completed: string;
    processing: string;
    pending: string;
    cancelled: string;
    [key: string]: string;
  }

  type Commandestatus = "completed" | "processing" | "pending" | "cancelled";

  const getStatusColor = (status: Commandestatus): string => {
    const statusColors: StatusColorMap = {
      completed: "bg-green-100 text-green-800",
      processing: "bg-blue-100 text-blue-800",
      pending: "bg-yellow-100 text-yellow-800",
      cancelled: "bg-red-100 text-red-800",
    };

    return statusColors[status] || "bg-gray-100 text-gray-800";
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Cover Image with Profile Header */}
      <div className="relative">        <div 
          className="h-48 md:h-64 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden bg-cover bg-center"
        >
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute top-4 right-4">            <Button className="bg-white/10 border border-white/20 text-white hover:bg-white/20 text-sm px-3 py-1">
              <Camera className="h-4 w-4 mr-2" />
              Changer la couverture
            </Button>
          </div>
        </div>
        
        {/* Profile Info Overlay */}
        <div className="container mx-auto px-4 -mt-16 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >              <AvatarUpload
                currentAvatar={ProfilData.avatar}
                currentAvatarPublicId={ProfilData.avatarPublicId}
                fallbackText={`${ProfilData.firstName.charAt(0)}${ProfilData.lastName.charAt(0)}`}
                userEmail={ProfilData.email}
                onAvatarChange={handleAvatarChange}
                size="lg"
                className="ring-4 ring-white shadow-xl"
              />
              <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                <div className="h-3 w-3 bg-white rounded-full animate-pulse" />
              </div>
            </motion.div>
            
            <div className="flex-1 text-center md:text-left">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h1 className="text-3xl font-bold text-white mb-2">
                  {ProfilData.firstName} {ProfilData.lastName}
                </h1>
                <p className="text-blue-100 text-lg mb-4">
                  {ProfilData.position} • {ProfilData.company}
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">                  <Badge className="bg-white/20 text-white border-transparent">
                    <MapPin className="h-3 w-3 mr-1" />
                    {ProfilData.location}
                  </Badge>
                  <Badge className="bg-white/20 text-white border-transparent">
                    <Calendar className="h-3 w-3 mr-1" />
                    Membre depuis {ProfilData.joinDate}
                  </Badge>
                </div>
              </motion.div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => setIsEditing(!isEditing)}
                className="bg-white text-gray-900 hover:bg-gray-100"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                {isEditing ? 'Annuler' : 'Modifier'}
              </Button>              <Button className="border border-white/20 text-white hover:bg-white/10 bg-transparent">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Stats & Quick Info */}
          <div className="space-y-6">
            {/* Stats Cards */}
            <Card className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Statistiques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <ShoppingBag className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-blue-600">{ProfilData.stats.ordersCount}</p>
                    <p className="text-xs text-gray-600">Commandes</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <Star className="h-6 w-6 text-green-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-green-600">{ProfilData.stats.reviewsCount}</p>
                    <p className="text-xs text-gray-600">Avis</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <Heart className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-purple-600">{ProfilData.stats.wishlistCount}</p>
                    <p className="text-xs text-gray-600">Favoris</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <Award className="h-6 w-6 text-orange-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-orange-600">{ProfilData.stats.loyaltyPoints}</p>
                    <p className="text-xs text-gray-600">Points</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Actions rapides
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">                <Button className="w-full justify-start border border-gray-200 bg-transparent hover:bg-gray-50">
                  <Package className="h-4 w-4 mr-2" />
                  Mes commandes
                </Button>
                <Button className="w-full justify-start border border-gray-200 bg-transparent hover:bg-gray-50">
                  <Heart className="h-4 w-4 mr-2" />
                  Liste de souhaits
                </Button>
                <Button className="w-full justify-start border border-gray-200 bg-transparent hover:bg-gray-50">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Modes de paiement
                </Button>
                <Button className="w-full justify-start border border-gray-200 bg-transparent hover:bg-gray-50">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="profil" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profil" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profil
                </TabsTrigger>
                <TabsTrigger value="commandes" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Commandes
                </TabsTrigger>
                <TabsTrigger value="activite" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Activité
                </TabsTrigger>
                <TabsTrigger value="parametres" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Paramètres
                </TabsTrigger>
              </TabsList>

              {/* Profil Tab */}
              <TabsContent value="profil" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Informations personnelles
                      </span>
                      {!isEditing && (                        <Button className="text-sm px-3 py-1 border border-gray-200 bg-transparent hover:bg-gray-50" onClick={() => setIsEditing(true)}>
                          <Edit3 className="h-4 w-4 mr-2" />
                          Modifier
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <AnimatePresence mode="wait">
                      {isEditing ? (
                        <motion.div
                          key="editing"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-4"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium mb-2 block">Prénom</label>
                              <Input
                                value={ProfilData.firstName}
                                onChange={(e) => setProfilData(prev => ({ ...prev, firstName: e.target.value }))}
                                placeholder="Votre prénom"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-2 block">Nom</label>
                              <Input
                                value={ProfilData.lastName}
                                onChange={(e) => setProfilData(prev => ({ ...prev, lastName: e.target.value }))}
                                placeholder="Votre nom"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium mb-2 block">Email</label>
                            <Input
                              type="email"
                              value={ProfilData.email}
                              onChange={(e) => setProfilData(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="votre@email.com"
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium mb-2 block">Téléphone</label>
                            <PhoneInput
                              value={ProfilData.phone}
                              onChange={(value) => setProfilData(prev => ({ ...prev, phone: value }))}
                              placeholder="Votre numéro"
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium mb-2 block">Entreprise</label>
                              <Input
                                value={ProfilData.company}
                                onChange={(e) => setProfilData(prev => ({ ...prev, company: e.target.value }))}
                                placeholder="Nom de votre entreprise"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-2 block">Poste</label>
                              <Input
                                value={ProfilData.position}
                                onChange={(e) => setProfilData(prev => ({ ...prev, position: e.target.value }))}
                                placeholder="Votre fonction"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium mb-2 block">Localisation</label>
                            <Input
                              value={ProfilData.location}
                              onChange={(e) => setProfilData(prev => ({ ...prev, location: e.target.value }))}
                              placeholder="Ville, Pays"
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium mb-2 block">Site web</label>
                            <Input
                              value={ProfilData.website}
                              onChange={(e) => setProfilData(prev => ({ ...prev, website: e.target.value }))}
                              placeholder="https://votre-site.com"
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium mb-2 block">Bio</label>
                            <Textarea
                              value={ProfilData.bio}
                              onChange={(e) => setProfilData(prev => ({ ...prev, bio: e.target.value }))}
                              placeholder="Parlez-nous de vous..."
                              rows={4}
                            />
                          </div>
                            <div className="flex gap-2 pt-4">
                            <Button onClick={saveProfil} disabled={loading}>
                              {loading ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                  Sauvegarde...
                                </>
                              ) : (
                                <>
                                  <Save className="h-4 w-4 mr-2" />
                                  Sauvegarder
                                </>
                              )}
                            </Button>                            <Button className="border border-gray-200 bg-transparent hover:bg-gray-50" onClick={() => setIsEditing(false)}>
                              <X className="h-4 w-4 mr-2" />
                              Annuler
                            </Button>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="viewing"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-6"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Mail className="h-5 w-5 text-blue-600" />
                                <div>
                                  <p className="text-sm text-gray-600">Email</p>
                                  <p className="font-medium">{ProfilData.email}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Phone className="h-5 w-5 text-green-600" />
                                <div>
                                  <p className="text-sm text-gray-600">Téléphone</p>
                                  <p className="font-medium">{ProfilData.phone}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <MapPin className="h-5 w-5 text-red-600" />
                                <div>
                                  <p className="text-sm text-gray-600">Localisation</p>
                                  <p className="font-medium">{ProfilData.location}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Calendar className="h-5 w-5 text-purple-600" />
                                <div>
                                  <p className="text-sm text-gray-600">Membre depuis</p>
                                  <p className="font-medium">{ProfilData.joinDate}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {ProfilData.bio && (
                            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                              <h4 className="font-medium text-blue-900 mb-2">Bio</h4>
                              <p className="text-blue-800">{ProfilData.bio}</p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Orders Tab - Keep existing logic */}
              <TabsContent value="commandes" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Mes commandes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>                    <div className="space-y-4">
                      {commandes.map((order: any, index: number) => (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Package className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">{order.id}</p>
                              <p className="text-sm text-gray-600">{order.items.length} article{order.items.length > 1 ? 's' : ''}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                            <p className="text-sm text-gray-600 mt-1">{order.date}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activite" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      Activité récente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activities.map((activity, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-4 p-3 border-l-2 border-blue-200 bg-blue-50/50"
                        >
                          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            {activity.type === 'order' && <Package className="h-4 w-4 text-blue-600" />}
                            {activity.type === 'product' && <ShoppingBag className="h-4 w-4 text-green-600" />}
                            {activity.type === 'customer' && <User className="h-4 w-4 text-purple-600" />}
                            {activity.type === 'Paramètres' && <Settings className="h-4 w-4 text-orange-600" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">
                              <span className="font-medium">Vous avez</span> {activity.action}
                              {activity.id && <span className="font-medium text-blue-600"> {activity.id}</span>}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="parametres" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Préférences de notification
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Notifications par email</p>
                          <p className="text-sm text-gray-600">Recevoir des notifications importantes par email</p>
                        </div>
                        <Switch 
                          checked={ProfilData.preferences.emailNotifications}                          onCheckedChange={(checked: boolean) => 
                            setProfilData(prev => ({
                              ...prev,
                              preferences: { ...prev.preferences, emailNotifications: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Notifications SMS</p>
                          <p className="text-sm text-gray-600">Recevoir des alertes importantes par SMS</p>
                        </div>
                        <Switch 
                          checked={ProfilData.preferences.smsNotifications}                          onCheckedChange={(checked: boolean) => 
                            setProfilData(prev => ({
                              ...prev,
                              preferences: { ...prev.preferences, smsNotifications: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Emails marketing</p>
                          <p className="text-sm text-gray-600">Recevoir des offres spéciales et nouveautés</p>
                        </div>
                        <Switch 
                          checked={ProfilData.preferences.marketingEmails}                          onCheckedChange={(checked: boolean) => 
                            setProfilData(prev => ({
                              ...prev,
                              preferences: { ...prev.preferences, marketingEmails: checked }
                            }))
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <Shield className="h-5 w-5" />
                      Zone de danger
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-medium text-red-900 mb-2">Supprimer le compte</h4>
                      <p className="text-sm text-red-700 mb-4">
                        Cette action est irréversible. Toutes vos données seront supprimées définitivement.
                      </p>                      <Button className="bg-red-600 text-white hover:bg-red-700 text-sm px-3 py-1">
                        Supprimer mon compte
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

