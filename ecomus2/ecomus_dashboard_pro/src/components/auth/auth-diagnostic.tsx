"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Database, 
  Shield, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Eye,
  EyeOff,
  AlertTriangle,
  Cog
} from "lucide-react";
import { getSession } from "next-auth/react";

interface AuthDiagnosticProps {
  className?: string;
}

// Composant Badge de statut
function StatusBadge({ status, text }: {status: "success" | "error" | "warning" | "pending", text: string}) {
  const colors = {
    success: "bg-green-100 text-green-800 border-green-200",
    error: "bg-red-100 text-red-800 border-red-200",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
    pending: "bg-blue-100 text-blue-800 border-blue-200"
  };
  
  const icons = {
    success: <CheckCircle className="h-4 w-4 mr-1" />,
    error: <XCircle className="h-4 w-4 mr-1" />,
    warning: <AlertTriangle className="h-4 w-4 mr-1" />,
    pending: <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
  };
  
  return (
    <div className={`flex items-center px-2.5 py-1 rounded-md text-xs border ${colors[status]}`}>
      {icons[status]}
      {text}
    </div>
  );
}

export function AuthDiagnostic({ className }: AuthDiagnosticProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [diagnosticData, setDiagnosticData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  // Charger les données de session au montage du composant
  useEffect(() => {
    async function loadSession() {
      try {
        // Vérifier d'abord si NextAuth est configuré
        const configCheck = await fetch('/api/auth/config-check');
        if (!configCheck.ok) {
          console.warn("⚠️ Configuration NextAuth non accessible");
          setSessionData(null);
          setSessionLoading(false);
          return;
        }
        
        // Utiliser un try-catch spécifique pour getSession
        let session = null;
        try {
          session = await getSession();
        } catch (sessionError) {
          console.warn("⚠️ Erreur lors de la récupération de la session:", sessionError);
          session = null;
        }
        
        setSessionData(session);
        console.log("📊 Session Data:", session ? "Session trouvée" : "Pas de session");
      } catch (error) {
        console.error("❌ Erreur de session:", error);
        // En cas d'erreur, définir une session nulle plutôt que de planter
        setSessionData(null);
      } finally {
        setSessionLoading(false);
      }
    }
    
    loadSession();
  }, []);

  const runDiagnostic = async () => {
    setLoading(true);
    console.log("🔍 Lancement du diagnostic d'authentification");
    try {
      // Test de connexion à l'API
      console.log("🔍 Diagnostic - Test API");
      const authTest = await fetch('/api/auth/test', {
        method: 'GET',
      });
      const authResult = authTest.ok ? await authTest.json() : { error: 'API non accessible' };

      // Test des utilisateurs
      const usersTest = await fetch('/api/users', {
        method: 'GET',
      });
      const usersResult = usersTest.ok ? await usersTest.json() : { error: 'API utilisateurs non accessible' };

      setDiagnosticData({
        auth: authResult,
        users: usersResult,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      setDiagnosticData({
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const result = await response.json();
      alert(`Test de connexion:\n${result.success ? '✅ Succès' : '❌ Échec'}\n${result.message}`);
    } catch (error) {
      alert(`❌ Erreur de test: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        variant="outline"
        size="sm"
        className={`fixed bottom-4 right-4 z-50 ${className}`}
      >
        <Shield className="w-4 h-4 mr-2" />
        Debug Auth
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Diagnostic d'Authentification
          </CardTitle>
          <Button
            onClick={() => setIsVisible(false)}
            variant="ghost"
            size="sm"
          >
            <EyeOff className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Boutons de contrôle */}
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={runDiagnostic}
              disabled={loading}
              variant="default"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Database className="w-4 h-4 mr-2" />
              )}
              Diagnostic Complet
            </Button>
            
            <Button
              onClick={() => testLogin('admin@ecomus.com', 'admin123')}
              variant="outline"
            >
              Test Admin
            </Button>
            
            <Button
              onClick={() => testLogin('vendor@ecomus.com', 'vendor123')}
              variant="outline"
            >
              Test Vendeur
            </Button>
            
            <Button
              onClick={() => testLogin('user@ecomus.com', 'user123')}
              variant="outline"
            >
              Test Client
            </Button>
          </div>

          {/* Comptes de test */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                Comptes de Test Disponibles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div>
                    <Badge variant="default">Admin</Badge>
                    <p className="font-mono text-sm mt-1">admin@ecomus.com / admin123</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => testLogin('admin@ecomus.com', 'admin123')}
                  >
                    Tester
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <Badge variant="secondary">Vendeur</Badge>
                    <p className="font-mono text-sm mt-1">vendor@ecomus.com / vendor123</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => testLogin('vendor@ecomus.com', 'vendor123')}
                  >
                    Tester
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <Badge variant="outline">Client</Badge>
                    <p className="font-mono text-sm mt-1">user@ecomus.com / user123</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => testLogin('user@ecomus.com', 'user123')}
                  >
                    Tester
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Résultats du diagnostic */}
          {diagnosticData && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {diagnosticData.error ? (
                    <XCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  Résultats du Diagnostic
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
                  {JSON.stringify(diagnosticData, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Instructions de Dépannage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>1. <strong>Première connexion :</strong> Utilisez les comptes de test ci-dessus</p>
                <p>2. <strong>Problème de redirection :</strong> Vérifiez que vous êtes connecté avec le bon rôle</p>
                <p>3. <strong>Erreur de base de données :</strong> Assurez-vous que MongoDB est démarré</p>
                <p>4. <strong>Réinitialiser les utilisateurs :</strong> Exécutez <code>node scripts/init-test-users-secure.js</code></p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}

export default AuthDiagnostic;
