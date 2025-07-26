'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Store, Eye, Settings, Globe, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

interface Store {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  owner: {
    name: string;
    email: string;
  };
  design?: {
    selectedTemplate?: {
      name: string;
      id: string;
    };
  };
  subscription?: {
    plan: string;
    isActive: boolean;
  };
  createdAt: string;
}

export default function StoresListPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stores');
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des stores');
      }
      
      const data = await response.json();
      setStores(data.data?.stores || []);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.owner.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <Store className="mr-3 h-8 w-8" />
                Stores Preview
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Prévisualisez et gérez tous les stores de la marketplace
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-sm">
                {filteredStores.length} store{filteredStores.length > 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Rechercher par nom, slug ou propriétaire..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-300">{error}</p>
            <Button 
              onClick={fetchStores}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Réessayer
            </Button>
          </div>
        )}

        {/* Stores Grid */}
        {filteredStores.length === 0 ? (
          <div className="text-center py-12">
            <Store className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchTerm ? 'Aucun store trouvé' : 'Aucun store disponible'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm 
                ? 'Essayez de modifier votre recherche' 
                : 'Il n\'y a actuellement aucun store dans la marketplace'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStores.map((store) => (
              <Card key={store._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold flex items-center">
                        <ShoppingBag className="mr-2 h-5 w-5" />
                        {store.name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        /{store.slug}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={store.isActive ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {store.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    {/* Description */}
                    {store.description && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                        {store.description}
                      </p>
                    )}
                    
                    {/* Owner */}
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Propriétaire:</span>
                      <span className="ml-2">{store.owner.name}</span>
                    </div>
                    
                    {/* Template */}
                    {store.design?.selectedTemplate && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Template:</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {store.design.selectedTemplate.name}
                        </Badge>
                      </div>
                    )}
                    
                    {/* Subscription */}
                    {store.subscription && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Plan:</span>
                        <Badge 
                          variant={store.subscription.isActive ? "default" : "secondary"}
                          className="ml-2 text-xs"
                        >
                          {store.subscription.plan}
                        </Badge>
                      </div>
                    )}
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-2 pt-3">
                      <Link 
                        href={`/preview/store/${store.slug}`}
                        className="flex-1"
                      >
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="mr-2 h-4 w-4" />
                          Prévisualiser
                        </Button>
                      </Link>
                      
                      <Link 
                        href={`http://localhost:3000/${store.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="default" size="sm">
                          <Globe className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}