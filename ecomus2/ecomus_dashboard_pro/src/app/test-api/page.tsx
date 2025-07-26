"use client";

import { useState } from "react";
import { ecomusApi } from "@/lib/ecomus-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TestResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

interface TestResults {
  [key: string]: TestResult;
}

export default function TestApiPage() {
  const [results, setResults] = useState<TestResults>({});
  const [loading, setLoading] = useState<string>("");

  const testEndpoint = async (name: string, apiCall: () => Promise<unknown>) => {
    setLoading(name);
    try {
      const result = await apiCall();
      setResults((prev: TestResults) => ({ ...prev, [name]: { success: true, data: result } }));
    } catch (error) {
      setResults((prev: TestResults) => ({ 
        ...prev, 
        [name]: { 
          success: false, 
          error: error instanceof Error ? error.message : "Erreur inconnue" 
        } 
      }));
    } finally {
      setLoading("");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Test de connectivité API Ecomus</h1>
      
      <div className="grid gap-4 mb-6">
        <Button 
          onClick={() => testEndpoint("products", () => ecomusApi.getProducts({ limit: 5 }))}
          disabled={loading === "products"}
        >
          {loading === "products" ? "Test en cours..." : "Test Products API"}
        </Button>
        
        <Button 
          onClick={() => testEndpoint("orders", () => ecomusApi.getOrders({ limit: 5 }))}
          disabled={loading === "orders"}
        >
          {loading === "orders" ? "Test en cours..." : "Test Orders API"}
        </Button>
        
        <Button 
          onClick={() => testEndpoint("users", () => ecomusApi.getUsers({ limit: 5 }))}
          disabled={loading === "users"}
        >
          {loading === "users" ? "Test en cours..." : "Test Users API"}
        </Button>
        
        <Button 
          onClick={() => testEndpoint("categories", () => ecomusApi.getCategories())}
          disabled={loading === "categories"}
        >
          {loading === "categories" ? "Test en cours..." : "Test Categories API"}
        </Button>
        
        <Button 
          onClick={() => testEndpoint("stats", () => ecomusApi.getDashboardStats())}
          disabled={loading === "stats"}
        >
          {loading === "stats" ? "Test en cours..." : "Test Dashboard Stats API"}
        </Button>
      </div>

      <div className="space-y-4">
        {Object.entries(results).map(([name, result]: [string, any]) => (
          <Card key={name} className={result.success ? "border-green-500" : "border-red-500"}>
            <CardHeader>
              <CardTitle className={result.success ? "text-green-700" : "text-red-700"}>
                {name} - {result.success ? "✅ SUCCÈS" : "❌ ÉCHEC"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

