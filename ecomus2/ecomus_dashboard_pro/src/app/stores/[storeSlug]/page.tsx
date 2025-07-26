"use client";

// cSpell:disable
// Mots français intentionnels dans ce fichier : boutique, trouvée, retour, aux, boutiques, etc.

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Store as StoreIcon,
  MapPin,
  Phone,
  Mail,
  Globe,
  Facebook,
  Instagram,
  Twitter,
  Star,
  Package,
  ShoppingCart,
  Clock,
  Users,
  TrendingUp,
  Award,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Store, Product } from "@/types";
import { GlassmorphismCard } from "@/components/ui/glass-morphism-card";
import { StatCard } from "@/components/ui/stat-card";
import { AnimatedNumber } from "@/components/ui/animated-number";
import Image from "next/image";

const StorePublicPage = () => {
  const params = useParams();
  const router = useRouter();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const slug = params.slug as string;

  useEffect(() => {
    if (slug) {
      fetchStore();
      fetchProducts();
    }
  }, [slug]);

  const fetchStore = async () => {
    try {
      const response = await fetch(`/api/public/stores/${slug}`);
      const data = await response.json();
      
      if (data.success) {
        setStore(data.data);
      } else {
        setError("Boutique non trouvée");
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la boutique:", error);
      setError("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };
  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/products?storeSlug=${slug}&limit=8`);
      const data = await response.json();
      
      if (data.success && data.data.products) {
        setProducts(data.data.products);
      } else {
        setProducts([]); // Fallback en cas d'erreur
      }
    } catch (error) {
      console.error("Erreur lors du chargement des produits:", error);
      setProducts([]); // Fallback en cas d'erreur
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || "Boutique non trouvée"}
          </h1>
          <Button onClick={() => router.push("/stores")}>
            Retour aux boutiques
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        {store.bannerUrl ? (
          <Image
            src={store.bannerUrl}
            alt={store.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700" />
        )}
        <div className="absolute inset-0 bg-black/30" />
        
        <div className="relative container mx-auto px-4 h-full flex items-end pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-end space-x-6"
          >
            <div className="relative h-24 w-24 rounded-2xl overflow-hidden bg-white p-2 shadow-lg">
              {store.logoUrl ? (
                <Image
                  src={store.logoUrl}
                  alt={store.name}
                  fill
                  className="object-contain p-2"
                />
              ) : (
                <StoreIcon className="h-full w-full text-gray-400" />
              )}
            </div>
            <div className="text-white">
              <h1 className="text-4xl font-bold mb-2">{store.name}</h1>
              <p className="text-xl opacity-90 mb-2">{store.description}</p>
              <div className="flex items-center space-x-4">
                <Badge className="bg-white/20 text-white border-white/30">
                  {store.isVerified ? "Boutique Vérifiée" : "Nouvelle Boutique"}
                </Badge>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span>{store.stats?.averageRating?.toFixed(1) || "N/A"}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenu Principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Statistiques */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  title="Produits"
                  value={store.stats?.totalProducts || 0}
                  icon={<Package />}
                  color="blue"
                />
                <StatCard
                  title="Commandes"
                  value={store.stats?.totalOrders || 0}
                  icon={<ShoppingCart />}
                  color="green"
                />
                <StatCard
                  title="Note"
                  value={store.stats?.averageRating || 0}
                  subtitle="/5"
                  icon={<Star />}
                  color="yellow"
                />
                <StatCard
                  title="Clients"
                  value={42} // TODO: Ajouter les stats clients
                  icon={<Users />}
                  color="purple"
                />
              </div>
            </motion.div>

            {/* Produits Populaires */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <GlassmorphismCard>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Produits Populaires
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {products.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      Aucun produit disponible pour le moment
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {products.slice(0, 4).map((product) => (
                        <div key={product.id} className="flex items-center space-x-4 p-4 bg-white/50 rounded-lg">
                          <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-gray-100">
                            {product.images?.[0] ? (
                              <Image
                                src={product.images[0]}
                                alt={product.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <Package className="h-8 w-8 text-gray-400 m-4" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{product.title}</h4>
                            <p className="text-sm text-gray-500 line-clamp-2">
                              {product.description}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="font-bold text-primary">
                                {product.price}€
                              </span>
                              <div className="flex items-center space-x-1">
                                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                <span className="text-xs">{product.rating}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {products.length > 4 && (
                    <div className="text-center mt-6">
                      <Button variant="outline">
                        Voir tous les produits ({products.length})
                      </Button>
                    </div>
                  )}
                </CardContent>
              </GlassmorphismCard>
            </motion.div>
          </div>

          {/* Sidebar - Informations */}
          <div className="space-y-6">
            {/* Informations de Contact */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <GlassmorphismCard>
                <CardHeader>
                  <CardTitle>Contact & Localisation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {store.contact?.email && (
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{store.contact.email}</span>
                    </div>
                  )}
                  {store.contact?.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{store.contact.phone}</span>
                    </div>
                  )}
                  {store.social?.website && (
                    <div className="flex items-center space-x-3">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <a
                        href={store.social.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Site Web
                      </a>
                    </div>
                  )}
                  
                  {/* Réseaux Sociaux */}
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-3">Réseaux Sociaux</h4>
                    <div className="flex items-center space-x-3">                      {store.social?.facebook && (
                        <a
                          href={store.social.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          aria-label={`Suivre ${store.name} sur Facebook`}
                        >
                          <Facebook className="h-4 w-4" />
                        </a>
                      )}                      {store.social?.instagram && (
                        <a
                          href={store.social.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                          aria-label={`Suivre ${store.name} sur Instagram`}
                        >
                          <Instagram className="h-4 w-4" />
                        </a>
                      )}                      {store.social?.twitter && (
                        <a
                          href={store.social.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                          aria-label={`Suivre ${store.name} sur Twitter`}
                        >
                          <Twitter className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </GlassmorphismCard>
            </motion.div>

            {/* Informations sur l'abonnement */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <GlassmorphismCard>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Plan & Limites
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Plan actuel</span>
                    <Badge variant="outline">
                      {store.subscription?.plan?.toUpperCase() || "FREE"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Produits max</span>
                    <span className="text-sm font-medium">
                      {store.stats?.totalProducts || 0} / {store.subscription?.limits?.maxProducts || "∞"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Membre depuis</span>
                    <span className="text-sm font-medium">
                      {new Date(store.createdAt).toLocaleDateString('fr-FR', {
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </CardContent>
              </GlassmorphismCard>
            </motion.div>

            {/* Action Button */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Parcourir la Boutique
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorePublicPage;
