"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function TestAdminAccessPage() {
  const [sessionData, setSessionData] = useState<any>(null);
  const [storeData, setStoreData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function testAccess() {
      try {
        // Test session
        const sessionRes = await fetch('/api/auth/session');
        const session = await sessionRes.json();
        setSessionData(session);
        
        // Test store access
        const storeRes = await fetch('/api/public/stores/tshirts-casual');
        const store = await storeRes.json();
        setStoreData(store);
        
      } catch (error) {
        console.error('Erreur de test:', error);
      } finally {
        setLoading(false);
      }
    }
    
    testAccess();
  }, []);

  if (loading) {
    return <div className="p-8">Chargement des tests...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold mb-8">🧪 Test d'accès administrateur</h1>
        
        {/* Test Session */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">👤 Session utilisateur</h2>
          
          {sessionData?.user ? (
            <div className="space-y-2">
              <p><strong>Email:</strong> {sessionData.user.email}</p>
              <p><strong>Rôle:</strong> {sessionData.user.role}</p>
              <div className="flex gap-2">
                <Badge variant={sessionData.user.role === 'admin' ? 'default' : 'secondary'}>
                  Admin: {sessionData.user.role === 'admin' ? 'Oui' : 'Non'}
                </Badge>
                <Badge variant={sessionData.user.role === 'super_admin' ? 'default' : 'secondary'}>
                  Super Admin: {sessionData.user.role === 'super_admin' ? 'Oui' : 'Non'}
                </Badge>
                <Badge variant={['admin', 'super_admin'].includes(sessionData.user.role) ? 'default' : 'destructive'}>
                  Accès Admin: {['admin', 'super_admin'].includes(sessionData.user.role) ? 'Autorisé' : 'Refusé'}
                </Badge>
              </div>
            </div>
          ) : (
            <p className="text-red-600">❌ Non connecté</p>
          )}
        </div>

        {/* Test Store Access */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">🏪 Accès à la store inactive (T-Shirts & Casual)</h2>
          
          {storeData ? (
            <div className="space-y-4">
              {storeData.success ? (
                <div>
                  <p className="text-green-600 font-semibold">✅ Store accessible</p>
                  <div className="mt-4 space-y-2">
                    <p><strong>Nom:</strong> {storeData.data.name}</p>
                    <p><strong>Slug:</strong> {storeData.data.slug}</p>
                    <div className="flex gap-2">
                      <Badge variant={storeData.data.isActive ? 'default' : 'secondary'}>
                        Active: {storeData.data.isActive ? 'Oui' : 'Non'}
                      </Badge>
                      <Badge variant={storeData.meta?.isAdmin ? 'default' : 'destructive'}>
                        Vue Admin: {storeData.meta?.isAdmin ? 'Oui' : 'Non'}
                      </Badge>
                    </div>
                    
                    {storeData.meta?.storeStatus && (
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                        <p className="text-sm font-medium">Statut détaillé:</p>
                        <pre className="text-xs mt-1">{JSON.stringify(storeData.meta.storeStatus, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-red-600 font-semibold">❌ Store non accessible</p>
                  <p className="text-red-500 mt-2">Erreur: {storeData.error}</p>
                </div>
              )}
            </div>
          ) : (
            <p>Aucune donnée reçue</p>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">🔗 Actions de test</h2>
          <div className="space-y-2">
            <Button 
              onClick={() => window.location.href = '/preview/store/tshirts-casual/'}
              className="w-full"
            >
              🔍 Tester la prévisualisation de la store inactive
            </Button>
            <Button 
              onClick={() => window.location.href = '/preview/store/cosmetiques-beaute/'}
              variant="outline"
              className="w-full"
            >
              ✅ Tester la prévisualisation d'une store active
            </Button>
            <Button 
              onClick={() => window.location.reload()}
              variant="secondary"
              className="w-full"
            >
              🔄 Recharger les tests
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
