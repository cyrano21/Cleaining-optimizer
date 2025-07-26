"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Layout,
  Palette,
  Eye,
  Settings,
} from "lucide-react";

// Import de notre nouvelle galerie de templates
import TemplateGallery from "@/components/stores/TemplateGallery";

// --- Types pour les données ---
interface Store {
  _id: string;
  name: string;
  slug: string;
  homeTemplate?: string;
  design?: {
    selectedTemplate?: { id: string };
    additionalPages?: Array<{ id: string }>;
  };
}

export default function VendorDesignPage() {
  const { data: session, status } = useSession();
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("templates");

  useEffect(() => {
    if (status === "authenticated") {
      fetchCurrentStore();
    }
  }, [session, status]);

  const fetchCurrentStore = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/vendor/store/current");
      if (!response.ok) throw new Error("Store non trouvé");

      const data = await response.json();
      const storeData = data.store;
      setCurrentStore(storeData);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const previewStore = (): void => {
    if (currentStore?.slug) {
      const previewUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3001'}/${currentStore.slug}`;
      window.open(previewUrl, "_blank");
    }
  };

  const handleTemplateSelect = async (templateId: string) => {
    if (!currentStore?._id) return;

    try {
      const response = await fetch(`/api/stores/${currentStore._id}/template`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ homeTemplate: templateId }),
      });

      if (response.ok) {
        // Mettre à jour le store local
        setCurrentStore(prev => ({
          ...prev!,
          homeTemplate: templateId
        }));
        
        alert('Template mis à jour avec succès !');
      } else {
        throw new Error('Erreur lors de la mise à jour du template');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour du template');
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Chargement de votre boutique...</p>
        </div>
      </div>
    );
  }

  if (!currentStore) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="max-w-md mx-auto text-center p-6">
          <CardHeader>
            <CardTitle>Aucune boutique trouvée</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Vous devez d'abord créer une boutique pour accéder au design.</p>
            <Button
              onClick={() => (window.location.href = "/dashboard/store/create")}
            >
              Créer ma boutique
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Design de ma boutique</h1>
          <div className="mt-1 text-gray-600 dark:text-gray-400">
            {currentStore?.name || "Boutique"} • Template actuel: 
            <Badge className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {currentStore?.homeTemplate || "home-01"}
            </Badge>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={previewStore}
            className="flex items-center space-x-2"
          >
            <Eye className="h-4 w-4" /> <span>Prévisualiser</span>
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">
            <Layout className="h-4 w-4 mr-2" />
            Galerie de Templates
          </TabsTrigger>
          <TabsTrigger value="customize">
            <Palette className="h-4 w-4 mr-2" />
            Personnaliser
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                Galerie Complète des Templates
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choisissez parmi notre collection de 49+ templates professionnels. 
                En tant qu'admin/vendeur, vous avez accès à tous les templates.
              </p>
            </CardHeader>
            <CardContent>
              <TemplateGallery
                currentTemplate={currentStore?.homeTemplate || "home-01"}
                onSelectTemplate={handleTemplateSelect}
                showAdminAccess={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customize" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuration Avancée
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Personnalisez les paramètres avancés de votre boutique
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      URL de votre boutique
                    </label>
                    <Input
                      value={currentStore?.slug || ""}
                      disabled
                      className="bg-gray-100 dark:bg-gray-800"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Votre boutique est accessible sur: {process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3001'}/{currentStore?.slug}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Template actuel
                    </label>
                    <Input
                      value={currentStore?.homeTemplate || "home-01"}
                      disabled
                      className="bg-gray-100 dark:bg-gray-800"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Modifiez le template dans l'onglet "Galerie de Templates"
                    </p>
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">Actions rapides</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      onClick={previewStore}
                      className="flex items-center space-x-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Prévisualiser ma boutique</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.open(`${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3001'}`, '_blank')}
                      className="flex items-center space-x-2"
                    >
                      <Layout className="h-4 w-4" />
                      <span>Voir tous les templates</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
