"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ShoppingBag, 
  Heart, 
  User, 
  CreditCard, 
  MapPin, 
  Bell,
  Star,
  Package,
  Clock,
  TrendingUp
} from "lucide-react";

export default function CustomerDashboard() {
  const { data: session } = useSession();

  const quickActions = [
    {
      title: "Mes Commandes",
      description: "Consulter l'historique de vos commandes",
      icon: Package,
      href: "/customer-dashboard/orders",
      color: "bg-blue-500"
    },
    {
      title: "Liste de Souhaits",
      description: "Vos produits favoris",
      icon: Heart,
      href: "/customer-dashboard/wishlist",
      color: "bg-red-500"
    },
    {
      title: "Mon Profil",
      description: "Gérer vos informations personnelles",
      icon: User,
      href: "/customer-dashboard/profile",
      color: "bg-green-500"
    },
    {
      title: "Méthodes de Paiement",
      description: "Gérer vos cartes et paiements",
      icon: CreditCard,
      href: "/customer-dashboard/payment-methods",
      color: "bg-purple-500"
    },
    {
      title: "Adresses",
      description: "Gérer vos adresses de livraison",
      icon: MapPin,
      href: "/customer-dashboard/addresses",
      color: "bg-orange-500"
    },
    {
      title: "Notifications",
      description: "Paramètres de notification",
      icon: Bell,
      href: "/customer-dashboard/notifications",
      color: "bg-indigo-500"
    }
  ];

  const recentOrders = [
    {
      id: "CMD-001",
      date: "2025-06-15",
      status: "Livré",
      total: "89.99€",
      items: 3
    },
    {
      id: "CMD-002", 
      date: "2025-06-10",
      status: "En cours",
      total: "156.50€",
      items: 2
    },
    {
      id: "CMD-003",
      date: "2025-06-05",
      status: "Expédié",
      total: "45.00€",
      items: 1
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Bienvenue, {session?.user?.name || 'Client'} ! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez vos commandes, vos préférences et votre profil depuis votre espace personnel.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commandes</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                +2 ce mois-ci
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Favoris</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                Dans votre liste
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Points Fidélité</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,250</div>
              <p className="text-xs text-muted-foreground">
                Utilisables en boutique
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Économies</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€245</div>
              <p className="text-xs text-muted-foreground">
                Total économisé
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Actions Rapides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action) => (
                    <div
                      key={action.title}
                      className="flex items-center p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className={`p-3 rounded-full ${action.color} text-white mr-4`}>
                        <action.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{action.title}</h3>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Commandes Récentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <p className="font-medium">{order.id}</p>
                        <p className="text-sm text-gray-600">{order.date}</p>
                        <p className="text-xs text-gray-500">{order.items} article(s)</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{order.total}</p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                          order.status === 'Livré' ? 'bg-green-100 text-green-800' :
                          order.status === 'En cours' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Voir toutes les commandes
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recommendations */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recommandations pour vous</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border rounded-lg p-4">
                <div className="h-32 bg-gray-200 rounded mb-4"></div>
                <h3 className="font-semibold mb-2">Produit Recommandé 1</h3>
                <p className="text-gray-600 text-sm mb-2">Basé sur vos achats précédents</p>
                <p className="font-bold text-lg">€49.99</p>
                <Button size="sm" className="mt-2">Ajouter au panier</Button>
              </div>
              <div className="border rounded-lg p-4">
                <div className="h-32 bg-gray-200 rounded mb-4"></div>
                <h3 className="font-semibold mb-2">Produit Recommandé 2</h3>
                <p className="text-gray-600 text-sm mb-2">Populaire dans votre catégorie</p>
                <p className="font-bold text-lg">€29.99</p>
                <Button size="sm" className="mt-2">Ajouter au panier</Button>
              </div>
              <div className="border rounded-lg p-4">
                <div className="h-32 bg-gray-200 rounded mb-4"></div>
                <h3 className="font-semibold mb-2">Produit Recommandé 3</h3>
                <p className="text-gray-600 text-sm mb-2">Offre spéciale limitée</p>
                <p className="font-bold text-lg">€19.99</p>
                <Button size="sm" className="mt-2">Ajouter au panier</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
