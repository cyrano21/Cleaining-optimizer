import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Package,
  ShoppingCart,
  Edit,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { ProductStats as ProductStatsType } from '@/hooks/useProducts';
import StatsSkeleton from '@/components/skeletons/StatsSkeleton';

interface ProductStatsProps {
  stats: ProductStatsType;
  loading?: boolean;
}

const ProductStats: React.FC<ProductStatsProps> = ({ stats, loading = false }) => {
  if (loading) {
    return <StatsSkeleton />;
  }

  const statsConfig = [
    {
      icon: Package,
      label: 'Total',
      value: stats.total,
      color: 'text-blue-600'
    },
    {
      icon: ShoppingCart,
      label: 'Actifs',
      value: stats.active,
      color: 'text-green-600'
    },
    {
      icon: Edit,
      label: 'Brouillons',
      value: stats.draft,
      color: 'text-yellow-600'
    },
    {
      icon: AlertTriangle,
      label: 'Stock Bas',
      value: stats.lowStock,
      color: 'text-red-600'
    },
    {
      icon: TrendingUp,
      label: 'En Vedette',
      value: stats.featured,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {statsConfig.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <IconComponent className={`h-8 w-8 ${stat.color}`} />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ProductStats;