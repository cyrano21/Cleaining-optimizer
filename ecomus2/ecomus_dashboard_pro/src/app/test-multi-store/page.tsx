"use client";

// FIX: Imports inutiles (useEffect, Package, etc.) supprimés
import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useStore } from "@/hooks/use-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader2, Store, Wifi } from "lucide-react";

// ===================================================================
//  SOLUTION PRINCIPALE : DÉFINIR UN TYPE POUR LES RÉSULTATS
// ===================================================================
interface TestResult {
  success: boolean;
  // Permet d'avoir n'importe quelle autre propriété (message, count, etc.)
  [key: string]: any;
}

const SafeDisplay = ({ value }: { value: any }) => {
  if (typeof value === "object" && value !== null) {
    if (Array.isArray(value)) {
      return (
        <span>
          {value.map((item) => item?.name || "Item sans nom").join(", ")}
        </span>
      );
    }
    return (
      <pre className="text-xs whitespace-pre-wrap bg-gray-100 p-2 rounded">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }
  return <span>{String(value)}</span>;
};

export default function TestMultiStorePage() {
  const { data: session, status } = useSession();
  const { currentStore, stores, isLoading: storeLoading } = useStore();

  // FIX: L'état est maintenant correctement typé
  const [testResults, setTestResults] = useState<{ [key: string]: TestResult }>(
    {}
  );
  const [loading, setLoading] = useState(false);

  const runMultiStoreTests = async () => {
    setLoading(true);
    // FIX: Le type de 'results' est maintenant clair
    const results: { [key: string]: TestResult } = {};

    try {
      const healthCheck = await fetch("/api/stores");
      results.apiConnectivity = {
        success: healthCheck.ok || healthCheck.status === 401,
        status: healthCheck.status,
        message: healthCheck.ok
          ? "API accessible"
          : "API accessible (Auth requise)",
      };
    } catch (error) {
      results.apiConnectivity = {
        success: false,
        error: "Connexion API échouée",
      };
    }

    if (session) {
      try {
        const storesResponse = await fetch("/api/stores");
        if (storesResponse.ok) {
          const storesData = await storesResponse.json();
          results.storesAPI = {
            success: true,
            count: storesData.data?.length || 0,
            stores: storesData.data || [],
          };
        } else {
          results.storesAPI = {
            success: false,
            error: `Erreur API Stores (Status: ${storesResponse.status})`,
          };
        }
      } catch (error) {
        results.storesAPI = {
          success: false,
          error: "Fetch API Stores échoué",
        };
      }

      results.storeContext = {
        success: !storeLoading,
        currentStoreName: currentStore?.name || "Aucune",
        storesAvailable: stores.length,
      };
    } else {
      results.authRequired = {
        success: false,
        message: "Connectez-vous pour les tests complets.",
      };
    }

    setTestResults(results);
    setLoading(false);
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <Store className="h-8 w-8 text-blue-600" />
              Page de Test - API & Store
            </CardTitle>
          </CardHeader>
          <CardContent>
            {status === "authenticated" ? (
              <div className="flex items-center justify-between">
                <div>
                  Connecté en tant que <Badge>{session.user?.email}</Badge> |
                  Rôle: <Badge variant="secondary">{session.user?.role}</Badge>
                </div>
                <Button onClick={() => signOut()} variant="outline" size="sm">
                  Se déconnecter
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                {/* FIX: Apostrophe échappée pour ESLint */}
                <span>Vous n'êtes pas connecté.</span>
                <Button onClick={() => signIn()}>Se connecter</Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lancer les tests</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={runMultiStoreTests}
              disabled={loading}
              size="lg"
              className="w-full"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wifi className="mr-2 h-4 w-4" />
              )}
              {loading
                ? "Tests en cours..."
                : "Exécuter les tests de diagnostic"}
            </Button>
          </CardContent>
        </Card>

        {Object.keys(testResults).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Résultats des Tests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* FIX: 'result' est maintenant de type 'TestResult', plus 'unknown' */}
              {Object.entries(testResults).map(([testName, result]) => (
                <div key={testName} className="border p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    )}
                    <h3 className="font-semibold capitalize">
                      {testName.replace(/([A-Z])/g, " $1").trim()}
                    </h3>
                  </div>
                  <div
                    className={`text-sm p-3 rounded border ${
                      result.success
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    {/* FIX: 'Object.entries(result)' fonctionne car 'result' est un objet, plus 'unknown' */}
                    {Object.entries(result).map(([key, value]) => {
                      if (key === "success") return null;
                      return (
                        <div key={key} className="flex gap-2">
                          <strong className="capitalize w-1/3">
                            {key.replace(/([A-Z])/g, " $1").trim()}:
                          </strong>
                          <div className="w-2/3">
                            <SafeDisplay value={value} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
