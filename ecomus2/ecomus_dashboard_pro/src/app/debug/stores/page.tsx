"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugStorePage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleActivateEcomus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug/fix-stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'activate_ecomus' })
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Erreur lors de l\'activation' });
    }
    setLoading(false);
  };

  const handleListStores = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug/fix-stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'list_all' })
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Erreur lors de la récupération' });
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Debug - Gestion des Boutiques</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={handleActivateEcomus}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Activation...' : 'Activer Ecomus Store'}
            </Button>
            
            <Button 
              onClick={handleListStores}
              disabled={loading}
              variant="outline"
              className="flex-1"
            >
              {loading ? 'Chargement...' : 'Lister les Boutiques'}
            </Button>
          </div>

          {result && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Résultat :</h3>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
