"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag,
  Heart,
  MapPin,
  CreditCard,
  Star,
  Package,
  Truck,
  CheckCircle,
  Gift,
  Settings,
  Bell,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";

// Import des nouveaux composants UI modernes
import { StatCard } from "@/components/ui/stat-card";
import { GlassmorphismCard } from "@/components/ui/glass-morphism-card";
import { ModernChart } from "@/components/ui/charts";
import { NotificationSystem, useNotification } from "@/components/ui/notification-system";
import { ModernLoader } from "@/components/ui/loader";
import { motion } from "framer-motion";

// Types pour les données utilisateur
interface UserOrder {
  id: string;
  date: string;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items: number;
  tracking?: string;
}

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  inStock: boolean;
  discount?: number;
}

interface UserStats {
  totalOrders: number;
  totalSpent: number;
  wishlistItems: number;
  loyaltyPoints: number;
  savedAmount: number;
  completedOrders: number;
}

// real data pour la démonstration
const real: UserStats = {
  totalOrders: 24,
  totalSpent: 2847,
  wishlistItems: 12,
  loyaltyPoints: 850,
  savedAmount: 340,
  completedOrders: 21,
};

const realUserOrders: UserOrder[] = [
  {
    id: "ORD-2024-001",
    date: "2024-06-10",
    total: 129.99,
    status: "delivered",
    items: 3,
    tracking: "TRK123456789",
  },
  {
    id: "ORD-2024-002", 
    date: "2024-06-08",
    total: 79.50,
    status: "shipped",
    items: 2,
    tracking: "TRK987654321",
  },
  {
    id: "ORD-2024-003",
    date: "2024-06-05",
    total: 249.00,
    status: "processing",
    items: 5,
  },
  {
    id: "ORD-2024-004",
    date: "2024-06-01",
    total: 89.99,
    status: "delivered",
    items: 1,
  },
];

const realWishlist: WishlistItem[] = [
  {
    id: "1",
    name: "MacBook Pro 14' M3",
    price: 2199,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&h=200&fit=crop",
    inStock: true,
    discount: 10,
  },
  {
    id: "2", 
    name: "iPhone 15 Pro",
    price: 999,
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&h=200&fit=crop",
    inStock: true,
  },
  {
    id: "3",
    name: "AirPods Pro 2",
    price: 279,
    image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=200&h=200&fit=crop",
    inStock: false,
  },
];

// Calculs des statistiques basés sur les vraies données
const calculateUserStats = (orders: UserOrder[]) => {
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const completedOrders = orders.filter(order => order.status === 'delivered').length;
  const processingOrders = orders.filter(order => order.status === 'processing').length;
  
  return {
    totalSpent,
    totalOrders,
    completedOrders,
    processingOrders,
    wishlistItems: 12, // Valeur fictive - à remplacer par vraies données
    loyaltyPoints: Math.floor(totalSpent * 10), // 10 points par euro dépensé
    savedAmount: totalSpent * 0.15, // 15% d'économies estimées
  };
};

const userStats = calculateUserStats(realUserOrders);

export default function UserDashboard() {
  const { data: session } = useSession();
  const { addNotification, notifications } = useNotification();
  const [loading, setLoading] = useState(true);
  // Données des statistiques modernes pour l'utilisateur
  const userStatsData = [
    {
      title: "Total Dépensé",
      value: userStats.totalSpent,
      subtitle: "Toutes commandes",
      trend: {
        value: 15.3,
        isPositive: true
      },
      icon: <CreditCard className="h-4 w-4" />,
      color: "blue",
      prefix: "€",
      suffix: "",
    },
    {
      title: "Commandes",
      value: userStats.totalOrders,
      subtitle: "Total des achats",
      trend: {
        value: 8.7,
        isPositive: true
      },
      icon: <ShoppingBag className="h-4 w-4" />,
      color: "green",
      prefix: "",
      suffix: "",
    },
    {
      title: "Liste de Souhaits",
      value: userStats.wishlistItems,
      subtitle: "Produits favoris",
      trend: {
        value: 12.1,
        isPositive: true
      },
      icon: <Heart className="h-4 w-4" />,
      color: "pink",
      prefix: "",
      suffix: "",
    },
    {
      title: "Points Fidélité",
      value: userStats.loyaltyPoints,
      subtitle: "Points acquis",
      trend: {
        value: 23.4,
        isPositive: true
      },
      icon: <Gift className="h-4 w-4" />,
      color: "purple",
      prefix: "",
      suffix: " pts",
    },
    {
      title: "Économies",
      value: userStats.savedAmount,
      subtitle: "Grâce aux promos",
      trend: {
        value: 18.9,
        isPositive: true
      },
      icon: <Star className="h-4 w-4" />,
      color: "orange",
      prefix: "€",
      suffix: "",
    },
    {
      title: "Commandes Livrées",
      value: userStats.completedOrders,
      subtitle: "Succès de livraison",
      trend: {
        value: 5.2,
        isPositive: true
      },
      icon: <CheckCircle className="h-4 w-4" />,
      color: "teal",
      prefix: "",
      suffix: "",
    },
  ];

  // Données pour le graphique des dépenses mensuelles
  const spendingChartData = {
    data: [
      { name: 'Jan', depenses: 245 },
      { name: 'Fév', depenses: 189 },
      { name: 'Mar', depenses: 420 },
      { name: 'Avr', depenses: 301 },
      { name: 'Mai', depenses: 278 },
      { name: 'Jun', depenses: 356 },
    ],
    bars: [
      { dataKey: 'depenses', fill: '#8b5cf6', name: 'Dépenses (€)' }
    ]
  };

  useEffect(() => {
    // Simuler le chargement des données
    const loadUserData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);        // Notification de bienvenue
      addNotification({
        type: "success",
        title: `Bienvenue ${session?.user?.name || 'cher client'} !`,
        message: "Voici un aperçu de votre activité récente",
        duration: 4000,
      });
    };

    loadUserData();
  }, [session, addNotification]);

  const getStatusBadge = (status: UserOrder['status']) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, text: "En attente", color: "text-orange-600" },
      processing: { variant: "secondary" as const, text: "En cours", color: "text-blue-600" },
      shipped: { variant: "default" as const, text: "Expédié", color: "text-cyan-600" },
      delivered: { variant: "default" as const, text: "Livré", color: "text-green-600" },
      cancelled: { variant: "destructive" as const, text: "Annulé", color: "text-red-600" },
    };

    return statusConfig[status];
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <ModernLoader type="pulse" size="large" />
          <span className="ml-4 text-lg font-medium">Chargement de votre dashboard...</span>
        </div>
      </DashboardLayout>    );
  }

  return (
    <>
      <NotificationSystem notifications={notifications} />
      <DashboardLayout>
        <motion.div 
          className="p-6 space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header avec informations utilisateur */}
          <motion.div 
            className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {session?.user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Bonjour {session?.user?.name || 'Cher client'} !
                </h1>
                <p className="text-gray-600 mt-2">
                  Gérez vos commandes et découvrez nos offres personnalisées
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Paramètres
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </Button>
            </div>
          </motion.div>

          {/* Stats Cards Modernes */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {userStatsData.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
              >
                <StatCard {...stat} />
              </motion.div>
            ))}
          </motion.div>

          {/* Contenu Principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Commandes récentes et graphique (2 colonnes) */}
            <div className="lg:col-span-2 space-y-8">
              {/* Graphique des dépenses */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <GlassmorphismCard className="p-6">
                  <h3 className="text-xl font-semibold mb-6">Historique des Dépenses</h3>
                  <ModernChart type="bar" {...spendingChartData} height={250} />
                </GlassmorphismCard>
              </motion.div>

              {/* Commandes récentes */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <GlassmorphismCard className="overflow-hidden">
                  <div className="p-6 border-b border-white/10">
                    <h3 className="text-xl font-semibold">Mes Commandes Récentes</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {realUserOrders.map((order, index) => {
                        const status = getStatusBadge(order.status);
                        return (
                          <motion.div
                            key={order.id}
                            className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white">
                                <Package className="h-6 w-6" />
                              </div>
                              <div>
                                <h6 className="font-medium">{order.id}</h6>
                                <p className="text-sm text-gray-500">
                                  {new Date(order.date).toLocaleDateString('fr-FR')} • {order.items} article(s)
                                </p>
                                {order.tracking && (
                                  <p className="text-xs text-cyan-600">Suivi: {order.tracking}</p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">€{order.total}</p>
                              <Badge variant={status.variant} className={status.color}>
                                {status.text}
                              </Badge>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                    <Button variant="outline" className="w-full mt-6">
                      Voir toutes mes commandes
                    </Button>
                  </div>
                </GlassmorphismCard>
              </motion.div>
            </div>

            {/* Sidebar avec wishlist et actions rapides */}
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              {/* Liste de souhaits */}
              <GlassmorphismCard className="p-6">
                <h3 className="text-xl font-semibold mb-4">Ma Liste de Souhaits</h3>
                <div className="space-y-4">
                  {realWishlist.slice(0, 3).map((item, index) => (
                    <motion.div
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >                      <Image
                        src={item.image}
                        alt={item.name}
                        width={48}
                        height={48}
                        className="rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h6 className="font-medium text-sm">{item.name}</h6>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-green-600">€{item.price}</span>
                          {item.discount && (
                            <Badge variant="secondary" className="text-xs">
                              -{item.discount}%
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Badge variant={item.inStock ? "default" : "secondary"} className="text-xs">
                          {item.inStock ? "En stock" : "Rupture"}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Voir toute ma liste
                </Button>
              </GlassmorphismCard>

              {/* Actions rapides */}
              <GlassmorphismCard className="p-6">
                <h3 className="text-xl font-semibold mb-4">Actions Rapides</h3>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <MapPin className="h-4 w-4 mr-2" />
                    Suivre une commande
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Truck className="h-4 w-4 mr-2" />
                    Historique des livraisons
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Mes moyens de paiement
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Star className="h-4 w-4 mr-2" />
                    Mes avis et notes
                  </Button>
                </div>
              </GlassmorphismCard>

              {/* Programme de fidélité */}
              <GlassmorphismCard className="p-6">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 text-white text-center">
                  <Gift className="h-8 w-8 mx-auto mb-2" />
                  <h4 className="font-bold text-lg">{userStats.loyaltyPoints} Points</h4>
                  <p className="text-sm opacity-90">Programme VIP</p>                    <div className="mt-3 bg-white/20 rounded-full h-2">
                    <div 
                      className={`bg-white rounded-full h-2 transition-all duration-500 progress-bar-${Math.floor((userStats.loyaltyPoints % 1000) / 100)}`}
                    ></div>
                  </div>
                  <p className="text-xs mt-2 opacity-80">
                    {1000 - (userStats.loyaltyPoints % 1000)} pts pour le niveau suivant
                  </p>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Échanger mes points
                </Button>
              </GlassmorphismCard>
            </motion.div>
          </div>
        </motion.div>
      </DashboardLayout>
    </>
  );
}

