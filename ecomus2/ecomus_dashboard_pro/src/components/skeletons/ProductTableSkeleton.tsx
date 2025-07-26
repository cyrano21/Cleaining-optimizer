import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const ProductTableSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
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
              {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="border-b">
                  <td className="py-3">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="w-10 h-10 rounded" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="py-3">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </td>
                  <td className="py-3">
                    <Skeleton className="h-6 w-12 rounded-full" />
                  </td>
                  <td className="py-3">
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </td>
                  <td className="py-3">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="py-3">
                    <div className="flex space-x-2">
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductTableSkeleton;