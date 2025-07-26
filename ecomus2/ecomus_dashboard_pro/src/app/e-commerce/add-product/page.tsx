"use client";

import React from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { UnifiedProductForm } from "@/components/products/UnifiedProductForm";
import { useSession } from "next-auth/react";

export default function AddProductPage() {
  const { data: session } = useSession();

  const handleProductCreated = (product: any) => {
    // Redirection ou notification de succès
    console.log("Produit créé:", product);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <UnifiedProductForm
          mode="page"
          userRole="customer"
          onProductCreated={handleProductCreated}
        />
      </div>
    </DashboardLayout>
  );
}
