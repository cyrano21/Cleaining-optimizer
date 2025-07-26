import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Download } from 'lucide-react';
import { Store } from '@/hooks/useStores';
import { ProductFilters as ProductFiltersType } from '@/hooks/useProducts';

interface ProductFiltersProps {
  filters: ProductFiltersType;
  stores: Store[];
  onFiltersChange: (filters: ProductFiltersType) => void;
  onExport?: () => void;
  loading?: boolean;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  stores,
  onFiltersChange,
  onExport,
  loading = false
}) => {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, searchTerm: value });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({ ...filters, filterStatus: value });
  };

  const handleStoreChange = (value: string) => {
    onFiltersChange({ ...filters, selectedStore: value });
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou SKU..."
                value={filters.searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
                disabled={loading}
              />
            </div>
          </div>
          
          <Select 
            value={filters.filterStatus} 
            onValueChange={handleStatusChange}
            disabled={loading}
          >
            <SelectTrigger className="w-[180px]" aria-label="Filtrer par statut">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="active">Actif</SelectItem>
              <SelectItem value="inactive">Inactif</SelectItem>
              <SelectItem value="draft">Brouillon</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={filters.selectedStore} 
            onValueChange={handleStoreChange}
            disabled={loading}
          >
            <SelectTrigger className="w-[180px]" aria-label="Filtrer par boutique">
              <SelectValue placeholder="Toutes les boutiques" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les boutiques</SelectItem>
              {stores.map((store) => (
                <SelectItem key={store._id} value={store._id}>
                  {store.name || store.slug || 'Store sans nom'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {onExport && (
            <Button 
              variant="outline" 
              onClick={onExport}
              disabled={loading}
            >
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductFilters;