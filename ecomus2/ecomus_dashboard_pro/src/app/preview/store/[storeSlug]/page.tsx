// ecommerce-dashboard-core/src/app/preview/store/[slug]/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Settings, Eye, ShoppingBag, Grid, List, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
// Composant de grille de produits
import ProductGrid from "@/components/shop/ProductGrid";
import ShopDefault from "@/components/shop/ShopDefault";
import ShopFilter from "@/components/shop/ShopFilter";
import Sorting from "@/components/shop/Sorting";

import FilterSidebar from "@/components/shop/FilterSidebar";


// Types adaptés pour MongoDB
// Compatible avec ProductFormData utilisé dans les composants shop
export interface Product {
  id: string;
  _id?: string;
  title: string;
  name?: string;
  description: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  costPerItem?: number;
  quantity: number;
  trackQuantity?: boolean;
  continueSellingOutOfStock?: boolean;
  lowStockAlert?: number;
  sku: string;
  barcode?: string;
  category: string;
  brand?: string;
  tags: string[];
  images: (File | string)[];
  videos?: Array<{
    url: string;
    type: 'upload' | 'youtube' | 'vimeo';
    title?: string;
    description?: string;
    thumbnail?: string;
    duration?: number;
    file?: File;
  }>;
  media3D?: Array<{
    modelUrl: string;
    textureUrls?: string[];
    type: 'gltf' | 'glb' | 'obj';
    previewImage?: string;
    modelSize?: number;
    animations?: string[];
  }>;
  views360?: Array<{
    id: string;
    name: string;
    images: string[];
    autoRotate: boolean;
    rotationSpeed?: number;
    zoomEnabled?: boolean;
    description?: string;
  }>;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  seoTitle?: string;
  seoDescription?: string;
  variant?: {
    color?: string;
    size?: string;
    material?: string;
  };
  attributes?: Record<string, string>;
  store?: string;
  vendor?: string;
  status: 'active' | 'inactive' | 'draft' | 'archived';
  featured?: boolean;
  soldOut?: boolean;
  sale?: boolean;
  storeId?: string;
  rating?: number;
  reviewsCount?: number;
  sizes?: string[];
  colors?: string[];
  slug?: string;
  imgSrc: string;
  imgHoverSrc?: string;
}


export interface StoreData {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  status?: "active" | "inactive" | "pending" | "suspended";
  owner?: {
    _id?: string;
    name?: string;
    email?: string;
  };
  // Données de navigation et liens
  navLinks?: Array<{
    _id?: string;
    title?: string;
    label?: string;
    url?: string;
    href?: string;
    order?: number;
    isActive?: boolean;
    children?: any[];
  }>;
  socialLinks?: Array<{
    _id?: string;
    platform?: string;
    network?: string;
    url?: string;
    icon?: string;
    isActive?: boolean;
  }>;
  footerLinks?: Array<{
    _id?: string;
    section?: string;
    links?: Array<{
      label?: string;
      url?: string;
    }>;
  }>;
  categories?: Array<{
    _id?: string;
    name?: string;
    slug?: string;
    description?: string;
    image?: string;
    isActive?: boolean;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export default function StorePreviewPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]); // Liste complète
  const [products, setProducts] = useState<Product[]>([]); // Liste filtrée
  
  // États pour l'affichage simple
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Filtrage simple des produits
  const displayedProducts = useMemo(() => {
    let result = [...products];
    
    if (searchQuery) {
      result = result.filter(product => 
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return result;
  }, [products, searchQuery]);

  useEffect(() => {
    const fetchStoreAndProducts = async () => {
      try {
        setLoading(true);

        // Récupérer les données de la boutique
        const storeRes = await fetch(`/api/public/stores/${slug}`);
        let storeData;
        try {
          storeData = await storeRes.json();
        } catch (jsonErr) {
          throw new Error("Réponse boutique non valide (JSON)");
        }
        console.log("storeData", storeData);

        if (!storeRes.ok || !storeData || (!storeData.success && !storeData.data)) {
          throw new Error("Boutique non trouvée");
        }

        const store = storeData.data || storeData;
        setStore(store);

        // Récupérer les produits de la boutique via l'API publique
        const productsRes = await fetch(`/api/public/products?storeId=${store._id}&limit=100`);
        let productsData;
        try {
          productsData = await productsRes.json();
        } catch (jsonErr) {
          throw new Error("Réponse produits non valide (JSON)");
        }
        console.log("productsData", productsData);

        if (productsRes.ok && productsData.success && productsData.products) {
          setAllProducts(productsData.products); // stocke la liste complète
          setProducts(productsData.products); // initialise la liste filtrée
        } else {
          setAllProducts([]);
          setProducts([]);
        }
      } catch (e) {
        console.error(e);
        setError((e as Error).message || "Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchStoreAndProducts();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p>Chargement...</p>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <p className="text-lg font-semibold mb-4">{error || "Boutique non trouvée."}</p>
        <Button onClick={() => window.history.back()} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header E-commerce */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
        {/* Top bar avec preview info */}
        <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-500" />
              <span className="text-gray-600 dark:text-gray-400">Mode prévisualisation</span>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={() => window.history.back()} variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" /> Retour au dashboard
              </Button>
              <Link href="/admin/stores-management">
                <Button size="sm" variant="outline">
                  <Settings className="w-4 h-4 mr-2" /> Gérer
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Main header */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo et nom de la boutique */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{store.name}</h1>
                {store.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{store.description}</p>
                )}
              </div>
            </div>

            {/* Status badge */}
            <Badge variant={store.isActive ? "default" : "secondary"} className="text-sm">
              {store.isActive ? "Boutique en ligne" : "Boutique fermée"}
            </Badge>
          </div>
        </div>

        {/* Navigation principale */}
        {store.navLinks && store.navLinks.length > 0 && (
          <nav className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center space-x-8 py-4">
                {store.navLinks.filter(link => link.isActive !== false).map((link, index) => (
                  <a
                    key={link._id || index}
                    href={link.url || link.href || '#'}
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200 py-2 border-b-2 border-transparent hover:border-blue-600"
                  >
                    {link.title || link.label}
                  </a>
                ))}
              </div>
            </div>
          </nav>
        )}
      </header>

      {/* Hero section avec catégories */}
      {store.categories && store.categories.length > 0 && (
        <section className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Nos Catégories</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">Découvrez notre sélection de produits</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {store.categories.filter(cat => cat.isActive !== false).map((category, index) => (
                <div key={category._id || index} className="group cursor-pointer">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 border border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingBag className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contenu principal - Produits */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Sidebar filtre produits avancé (structure ecomusnext-main) */}
        <FilterSidebar />

        {/* Section produits avec composants shop intégrés */}
        <ShopDefault 
          products={displayedProducts} 
          searchTerm={searchQuery}
          setSearchTerm={setSearchQuery}
        />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Footer Links */}
          {store.footerLinks && store.footerLinks.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
              {store.footerLinks.map((section, index) => (
                <div key={section._id || index}>
                  <h4 className="font-semibold text-lg mb-4">{section.section}</h4>
                  {section.links && section.links.length > 0 && (
                    <ul className="space-y-2">
                      {section.links.map((link, linkIndex) => (
                        <li key={linkIndex}>
                          <a 
                            href={link.url} 
                            className="text-gray-300 hover:text-white transition-colors duration-200"
                          >
                            {link.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Social Links */}
          {store.socialLinks && store.socialLinks.length > 0 && (
            <div className="border-t border-gray-700 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                  <p className="text-gray-300">© 2024 {store.name}. Tous droits réservés.</p>
                </div>
                <div className="flex space-x-4">
                  {store.socialLinks.filter(link => link.isActive !== false).map((link, index) => (
                    <a
                      key={link._id || index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-white transition-colors duration-200"
                      title={link.platform || ''}
                    >
                      <span className="sr-only">{link.platform || ''}</span>
                      {/* Icône générique pour les réseaux sociaux */}
                      <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-xs font-bold">
                        {link.platform ? link.platform.charAt(0).toUpperCase() : ''}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
