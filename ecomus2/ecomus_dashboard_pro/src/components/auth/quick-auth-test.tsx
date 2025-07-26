"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, User, Crown, Store } from "lucide-react";

export function QuickAuthTest() {
  const [testResults, setTestResults] = useState<{[key: string]: any}>({});
  const [isLoading, setIsLoading] = useState<{[key: string]: boolean}>({});

  const testCredentials = [
    {
      role: "admin",
      email: "admin@ecomus.com",
      password: "admin123",
      icon: Crown,
      color: "purple",
      label: "Administrateur"
    },
    {
      role: "vendor",
      email: "vendor@ecomus.com", 
      password: "vendor123",
      icon: Store,
      color: "blue",
      label: "Vendeur"
    },
    {
      role: "user",
      email: "user@ecomus.com",
      password: "user123", 
      icon: User,
      color: "green",
      label: "Client"
    }
  ];

  const testLogin = async (credentials: any) => {
    const { role, email, password } = credentials;
    setIsLoading(prev => ({ ...prev, [role]: true }));
    
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      
      setTestResults(prev => ({
        ...prev,
        [role]: {
          success: response.ok && result.success,
          message: result.message,
          status: response.status,
          user: result.user,
          timestamp: new Date().toLocaleTimeString()
        }
      }));

      if (response.ok && result.success) {
        // Redirection automatique après succès
        setTimeout(() => {
          if (result.user?.role === 'admin') {
            window.location.href = '/admin/control-center';
          } else if (result.user?.role === 'vendor') {
            window.location.href = '/vendor-dashboard';
          } else {
            window.location.href = '/dashboard';
          }
        }, 2000);
      }

    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [role]: {
          success: false,
          message: error instanceof Error ? error.message : 'Erreur réseau',
          status: 0,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    } finally {
      setIsLoading(prev => ({ ...prev, [role]: false }));
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-6">
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center gap-2">
          🚀 Test Rapide d'Authentification
        </CardTitle>
        <p className="text-sm text-gray-600 text-center">
          Cliquez sur un bouton pour tester la connexion directe
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {testCredentials.map((cred) => {
            const Icon = cred.icon;
            const isLoadingThis = isLoading[cred.role];
            const result = testResults[cred.role];
            
            return (
              <div key={cred.role} className="space-y-2">
                <Button
                  onClick={() => testLogin(cred)}
                  disabled={isLoadingThis}
                  className={`w-full h-16 bg-${cred.color}-500 hover:bg-${cred.color}-600`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <Icon className="h-5 w-5" />
                    <span className="text-sm">{cred.label}</span>
                  </div>
                </Button>
                
                <div className="text-xs text-center text-gray-500">
                  {cred.email}
                </div>
                
                {result && (
                  <div className="text-center">
                    <Badge 
                      variant={result.success ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {result.success ? (
                        <><CheckCircle className="h-3 w-3 mr-1" /> Succès</>
                      ) : (
                        <><XCircle className="h-3 w-3 mr-1" /> Échec</>
                      )}
                    </Badge>
                    <div className="text-xs text-gray-500 mt-1">
                      {result.timestamp}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Résultats détaillés */}
        {Object.keys(testResults).length > 0 && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Résultats des tests :</h4>
            <div className="space-y-2">
              {Object.entries(testResults).map(([role, result]: [string, any]) => (
                <div 
                  key={role} 
                  className={`p-3 rounded-lg text-sm ${
                    result.success 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <div className="font-medium">
                    {role.toUpperCase()}: {result.message}
                  </div>
                  {result.user && (
                    <div className="text-xs text-gray-600 mt-1">
                      Utilisateur: {result.user.name} ({result.user.email})
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    Status: {result.status} | {result.timestamp}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Astuce :</strong> Si la connexion réussit, vous serez automatiquement redirigé vers le dashboard approprié dans 2 secondes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default QuickAuthTest;
