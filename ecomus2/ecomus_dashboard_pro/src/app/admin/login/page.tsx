"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, CheckCircle, ArrowRight, XCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    // Si déjà connecté en tant qu'admin, générer le token JWT automatiquement
    if (
      session?.user?.role &&
      ["admin", "super_admin"].includes(session.user.role)
    ) {
      generateJWTFromSession();
    } else if (!session) {
      // Rediriger vers la vraie page de login si pas de session
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  const generateJWTFromSession = async () => {
    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "generate_token",
          email: session?.user?.email,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.token) {
          localStorage.setItem("adminToken", result.token);
          router.push("/admin/user-management");
        }
      }
    } catch (error) {
      console.error("Erreur génération token:", error);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Chargement...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Redirection...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-purple-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Synchronisation des tokens
          </CardTitle>
          <p className="text-gray-600">
            Génération automatique du token JWT...
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-800">
                Connecté en tant que {session.user?.role}
              </span>
            </div>
            <p className="text-sm text-green-700">
              Email: {session.user?.email}
            </p>
          </div>

          <Button
            onClick={generateJWTFromSession}
            className="w-full bg-purple-600 hover:bg-purple-700 h-12"
          >
            🔄 Synchroniser les tokens
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
