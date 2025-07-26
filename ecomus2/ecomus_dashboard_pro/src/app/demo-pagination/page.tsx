"use client";

import { TopProductsTable } from "@/components/dashboard/top-products-table";

export default function DemoPaginationPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Démonstration de Pagination et Filtrage
        </h1>
        <p className="text-muted-foreground mt-2">
          Cette page démontre l'implémentation de la pagination, du filtrage et
          du tri avec des composants React modernes.
        </p>
      </div>

      <TopProductsTable />
    </div>
  );
}
