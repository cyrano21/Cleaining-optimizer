'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import IntegratedDashboard from "@/components/dashboard/IntegratedDashboard";
import ModernDashboard from "@/components/dashboard/ModernDashboard";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (!session) {
      router.push("/auth/signin?callbackUrl=/dashboard");
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // Déterminer le rôle de l'utilisateur
  const userRole = (session.user as any)?.role || 'client';

  return (
    <div className="dashboard-content">
      {/* Utiliser le dashboard intégré pour les fonctionnalités avancées */}
      <IntegratedDashboard user={session.user} />
      
      {/* Ou utiliser le dashboard moderne pour une vue plus simple */}
      {/* <ModernDashboard role={userRole} user={session.user} /> */}
    </div>
  );
}
