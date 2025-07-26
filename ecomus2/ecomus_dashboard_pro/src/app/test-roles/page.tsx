"use client";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import RoleSystemTester from "@/components/test/RoleSystemTester";

export default function RoleTestPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Test du Système de Rôles</h1>
          <p className="text-gray-600 mt-1">
            Testez les permissions et la navigation entre les différents dashboards selon votre rôle.
          </p>
        </div>
        
        <RoleSystemTester />
      </div>
    </DashboardLayout>
  );
}
