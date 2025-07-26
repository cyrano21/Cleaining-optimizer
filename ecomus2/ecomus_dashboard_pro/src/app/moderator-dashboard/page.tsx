"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  MessageSquare, 
  Flag, 
  Eye, 
  CheckCircle, 
  XCircle,
  Clock,
  BarChart3,
  Users,
  AlertTriangle,
  Star,
  FileText,
  Search,
  Filter
} from "lucide-react";

export default function ModeratorDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    pendingReviews: 15,
    flaggedContent: 8,
    resolvedToday: 12,
    totalReports: 45
  });

  const pendingReviews = [
    {
      id: 1,
      product: "Smartphone Galaxy S24",
      author: "Marie Dubois",
      rating: 4,
      comment: "Très bon produit, livraison rapide. Quelques problèmes de batterie mais globalement satisfaite.",
      date: "2025-06-18",
      status: "pending"
    },
    {
      id: 2,
      product: "Casque Audio Bluetooth",
      author: "Jean Martin",
      rating: 5,
      comment: "Excellent son, très confortable. Je recommande vivement !",
      date: "2025-06-18",
      status: "pending"
    },
    {
      id: 3,
      product: "Ordinateur Portable",
      author: "Sophie Laurent",
      rating: 2,
      comment: "Produit décevant, très lent et chauffe beaucoup. Service client non réactif.",
      date: "2025-06-17",
      status: "pending"
    }
  ];

  const flaggedContent = [
    {
      id: 1,
      type: "review",
      content: "Ce produit est complètement nul ! N'achetez jamais chez eux !",
      reporter: "Système automatique",
      reason: "Langage inapproprié",
      date: "2025-06-18"
    },
    {
      id: 2,
      type: "comment",
      content: "Vendeur malhonnête, ils m'ont arnaqué !",
      reporter: "User12345",
      reason: "Accusations non fondées",
      date: "2025-06-17"
    }
  ];

  const quickActions = [
    {
      title: "Modérer les Avis",
      description: "Approuver ou rejeter les avis produits",
      icon: Star,
      count: stats.pendingReviews,
      color: "bg-yellow-500"
    },
    {
      title: "Contenu Signalé",
      description: "Examiner le contenu signalé par les utilisateurs",
      icon: Flag,
      count: stats.flaggedContent,
      color: "bg-red-500"
    },
    {
      title: "Rapports Utilisateurs",
      description: "Gérer les rapports sur les utilisateurs",
      icon: Users,
      count: stats.totalReports,
      color: "bg-blue-500"
    },
    {
      title: "Commentaires",
      description: "Modérer les commentaires produits",
      icon: MessageSquare,
      count: 23,
      color: "bg-green-500"
    }
  ];

  const handleApproveReview = (reviewId: number) => {
    console.log(`Approving review ${reviewId}`);
    // Logique d'approbation
  };

  const handleRejectReview = (reviewId: number) => {
    console.log(`Rejecting review ${reviewId}`);
    // Logique de rejet
  };

  const handleResolveFlag = (flagId: number, action: string) => {
    console.log(`Resolving flag ${flagId} with action ${action}`);
    // Logique de résolution
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Shield className="h-8 w-8 mr-3 text-blue-600" />
            Tableau de Bord Modérateur
          </h1>
          <p className="text-gray-600 mt-2">
            Bienvenue {session?.user?.name}, gérez le contenu et maintenez la qualité de la plateforme.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avis en Attente</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingReviews}</div>
              <p className="text-xs text-muted-foreground">
                À modérer aujourd'hui
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contenu Signalé</CardTitle>
              <Flag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.flaggedContent}</div>
              <p className="text-xs text-muted-foreground">
                Nécessite attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Résolu Aujourd'hui</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.resolvedToday}</div>
              <p className="text-xs text-muted-foreground">
                Bonne progression
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rapports</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReports}</div>
              <p className="text-xs text-muted-foreground">
                Ce mois-ci
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <div
                  key={action.title}
                  className="flex items-center p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className={`p-3 rounded-full ${action.color} text-white mr-4 relative`}>
                    <action.icon className="h-6 w-6" />
                    {action.count > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                      >
                        {action.count}
                      </Badge>
                    )}
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

        {/* Main Content Tabs */}
        <Tabs defaultValue="reviews" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reviews">Avis en Attente ({stats.pendingReviews})</TabsTrigger>
            <TabsTrigger value="flagged">Contenu Signalé ({stats.flaggedContent})</TabsTrigger>
            <TabsTrigger value="reports">Rapports</TabsTrigger>
          </TabsList>

          <TabsContent value="reviews" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  Avis Produits à Modérer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingReviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold">{review.product}</h4>
                          <p className="text-sm text-gray-600">Par {review.author} • {review.date}</p>
                        </div>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 mb-4">{review.comment}</p>
                      <div className="flex space-x-3">
                        <Button 
                          size="sm" 
                          onClick={() => handleApproveReview(review.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approuver
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleRejectReview(review.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Rejeter
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          Détails
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="flagged" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Flag className="h-5 w-5 mr-2" />
                  Contenu Signalé
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {flaggedContent.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <Badge variant="outline" className="mb-2">
                            {item.type === 'review' ? 'Avis' : 'Commentaire'}
                          </Badge>
                          <p className="text-sm text-gray-600">
                            Signalé par {item.reporter} • {item.date}
                          </p>
                        </div>
                        <Badge variant="destructive">{item.reason}</Badge>
                      </div>
                      <div className="bg-gray-50 p-3 rounded mb-4">
                        <p className="text-gray-700">{item.content}</p>
                      </div>
                      <div className="flex space-x-3">
                        <Button 
                          size="sm" 
                          onClick={() => handleResolveFlag(item.id, 'approve')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Approuver
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleResolveFlag(item.id, 'remove')}
                        >
                          Supprimer
                        </Button>
                        <Button size="sm" variant="outline">
                          Demander Modification
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Rapports et Statistiques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Activité de Modération</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Avis approuvés</span>
                        <span className="font-medium text-green-600">85%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Contenu supprimé</span>
                        <span className="font-medium text-red-600">12%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>En attente</span>
                        <span className="font-medium text-yellow-600">3%</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold">Tendances</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Signalements cette semaine</span>
                        <span className="font-medium">+15%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Temps de traitement moyen</span>
                        <span className="font-medium">2.3h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Satisfaction des utilisateurs</span>
                        <span className="font-medium text-green-600">94%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
