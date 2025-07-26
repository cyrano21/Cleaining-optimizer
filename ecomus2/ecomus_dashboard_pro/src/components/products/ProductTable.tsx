import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/hooks/useProducts';
import ProductTableSkeleton from '@/components/skeletons/ProductTableSkeleton';

interface ProductTableProps {
  products: Product[];
  loading?: boolean;
  onView?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  itemsPerPage?: number;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  loading = false,
  onView,
  onEdit,
  onDelete,
  itemsPerPage = 10
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return products.slice(startIndex, endIndex);
  }, [products, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(products.length / itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteClick = (productId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      onDelete?.(productId);
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (loading) {
    return <ProductTableSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>
            Produits ({products.length})
          </CardTitle>
          {totalPages > 1 && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} sur {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Produit</th>
                <th className="text-left py-2">SKU</th>
                <th className="text-left py-2">Prix</th>
                <th className="text-left py-2">Stock</th>
                <th className="text-left py-2">Statut</th>
                <th className="text-left py-2">Boutique</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((product, index) => (
                <tr key={product._id || product.sku || index} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="py-3">
                    <div className="flex items-center space-x-3">
                      {(() => {
                        const [hasImageError, setHasImageError] = React.useState(false);
                        const imageSrc = !hasImageError && product.images && product.images[0] ? product.images[0] : undefined;
                        if (imageSrc) {
                          return (
                            <img
                              src={imageSrc}
                              alt={product.title}
                              className="w-10 h-10 rounded object-cover"
                              loading="lazy"
                              onError={() => setHasImageError(true)}
                            />
                          );
                        }
                        return (
                          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        );
                      })()}
                      <div>
                        <p className="font-medium line-clamp-1" title={product.title}>
                          {product.title}
                        </p>
                        {product.featured && (
                          <Badge variant="secondary" className="mt-1">
                            En vedette
                          </Badge>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {product.sku}
                    </code>
                  </td>
                  <td className="py-3">
                    <div>
                      <p className="font-medium">{product.price}€</p>
                      {product.comparePrice && product.comparePrice > product.price && (
                        <p className="text-sm text-muted-foreground line-through">
                          {product.comparePrice}€
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-3">
                    <Badge 
                      variant={product.quantity < 10 ? "destructive" : "secondary"}
                      className={product.quantity === 0 ? "bg-red-500 text-white" : ""}
                    >
                      {product.quantity}
                    </Badge>
                  </td>
                  <td className="py-3">
                    <Badge className={getStatusColor(product.status)}>
                      {product.status}
                    </Badge>
                  </td>
                  <td className="py-3">
                    <span className="text-sm" title={product.store?.name || product.store?.slug}>
                      {product.store?.name || product.store?.slug || 'Store non défini'}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex space-x-2">
                      {onView && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onView(product)}
                          title="Voir le produit"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      {onEdit && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onEdit(product)}
                          title="Modifier le produit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(product._id)}
                          title="Supprimer le produit"
                          className="hover:bg-red-50 hover:border-red-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {products.length === 0 && (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">
                Aucun produit trouvé
              </p>
            </div>
          )}
        </div>
        
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, products.length)} sur {products.length} produits
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
              >
                Premier
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                Dernier
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductTable;