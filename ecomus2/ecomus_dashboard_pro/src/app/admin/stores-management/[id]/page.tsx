import React from "react";
import { notFound } from "next/navigation";
import StoreAdminPanel from "./StoreAdminPanel";
import TabsStoreAdmin from "./TabsStoreAdmin";

// Cette page affiche la gestion d'une boutique spécifique par son id
// TODO: Remplacer le mock par un vrai fetch des données boutique
export default async function StoreManagementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // TODO: Remplacer ce mock par un vrai fetch (API ou DB)
  const store = {
    id,
    name: "Boutique démo",
    slug: "demo-store",
    description: "Ceci est une boutique de démonstration.",
    logoUrl: "/default-store-logo.png",
    isActive: true,
    createdAt: new Date().toISOString(),
    subscription: { plan: "premium" },
    stats: { totalProducts: 42, totalOrders: 17, totalRevenue: 12345, averageRating: 4.7 },
  };

  // if (!store) return notFound();

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Gestion de la boutique</h1>
      <TabsStoreAdmin storeId={id} />
    </div>
  );
}
