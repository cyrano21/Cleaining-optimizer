'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import ProductCreationModal from '@/components/modals/ProductCreationModal';
import { toast } from '@/hooks/use-toast';
import { useProducts, ProductFilters as ProductFiltersType } from '@/hooks/useProducts';
import { useStores } from '@/hooks/useStores';
import ProductStats from '@/components/products/ProductStats';
import ProductFilters from '@/components/products/ProductFilters';
import ProductTable from '@/components/products/ProductTable';
import { exportToCSV } from '@/lib/export';

const ProductsManagementPage = () => {
  const { products, loading, stats, deleteProduct, addProduct, filterProducts } = useProducts();
  const { stores } = useStores();
  
  const [filters, setFilters] = useState<ProductFiltersType>({
    searchTerm: '',
    filterStatus: 'all',
    selectedStore: 'all'
  });

  const handleProductCreated = (newProduct: any) => {
    addProduct(newProduct);
    toast({
      title: "Produit créé",
      description: `Le produit "${newProduct.title}" a été créé avec succès.`,
    });
  };

  const handleExport = () => {
    const filteredProducts = filterProducts(products, filters);
    exportToCSV(filteredProducts, 'products_export');
    toast({
      title: "Export réussi",
      description: `${filteredProducts.length} produits exportés avec succès.`,
    });
  };

  const filteredProducts = filterProducts(products, filters);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-full">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Produits</h1>
          <p className="text-muted-foreground">
            Gérez l'ensemble des produits de votre marketplace
          </p>
        </div>
        
        <ProductCreationModal onProductCreated={handleProductCreated}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Produit
          </Button>
        </ProductCreationModal>
      </div>

      {/* Statistiques */}
      <ProductStats stats={stats} loading={loading} />

      {/* Filtres et recherche */}
      <ProductFilters
        filters={filters}
        stores={stores}
        onFiltersChange={setFilters}
        onExport={handleExport}
        loading={loading}
      />

      {/* Liste des produits */}
      <ProductTable
        products={filteredProducts}
        loading={loading}
        onDelete={deleteProduct}
        itemsPerPage={15}
      />
    </div>
  );
};

export default ProductsManagementPage;
