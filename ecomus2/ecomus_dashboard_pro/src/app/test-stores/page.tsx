'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

// Interface pour les données de store
interface Store {
  _id: string;
  name: string;
  slug: string;
  homeTheme?: string;
  createdAt: string;
  isActive: boolean;
}

// Interface pour la réponse API
interface StoresApiResponse {
  success: boolean;
  data?: {
    stores: Store[];
  };
  error?: string;
}

export default function StoresListPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetch('/api/debug/stores')
      .then(res => res.json())
      .then((data: StoresApiResponse) => {
        if (data.success && data.data) {
          setStores(data.data.stores);
        } else {
          setError(data.error || 'Erreur inconnue');
        }
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Chargement...</div>;
  if (error) return <div className="p-8 text-red-500">Erreur: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Liste des Stores Disponibles
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Statistiques
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stores.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
            </div>            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stores.filter((s: Store) => s.isActive).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Actives</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {stores.filter((s: Store) => !s.isActive).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Inactives</div>
            </div>
          </div>
        </div>        <div className="space-y-4">
          {stores.map((store: Store) => (
            <div
              key={store._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {store.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Slug: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{store.slug}</code>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Thème: {store.homeTheme || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Créé le: {new Date(store.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    store.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {store.isActive ? 'Active' : 'Inactive'}
                  </span>
                  
                  <Link
                    href={`/preview/store/${store.slug}`}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition-colors"
                  >
                    Prévisualiser
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {stores.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Aucune store trouvée dans la base de données.
            </p>
            <Link
              href="/admin/stores-management"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Créer une nouvelle store
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
