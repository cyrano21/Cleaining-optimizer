'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Box, 
  FileVideo, 
  RotateCw,
  ImageIcon,
  Eye,
  Settings,
  Upload,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Product, Product3DData, ProductVideoData, Product360Data } from '@/types';
import Product3DManager from './Product3DManager';
import ProductVideoManager from './ProductVideoManager';
import Product360Manager from './Product360Manager';

interface ProductMediaManagerV2Props {
  product: Product;
  onProductChange: (product: Product) => void;
  className?: string;
}

export const ProductMediaManagerV2: React.FC<ProductMediaManagerV2Props> = ({
  product,
  onProductChange,
  className
}) => {
  const [activeTab, setActiveTab] = useState('360');

  // Count items for badges
  const counts = {
    '360': product.views360?.length || 0,
    '3d': product.media3D?.length || 0,
    'videos': product.videos?.length || 0
  };

  // Helper functions for updating specific media types
  const onViews360Change = (views360: Product360Data[]) => {
    onProductChange({ ...product, views360 });
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Médias Avancés
        </CardTitle>
        <p className="text-sm text-gray-600">
          Enrichissez votre produit avec des médias interactifs : vues 360°, modèles 3D et vidéos
        </p>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="360" className="flex items-center gap-2">
              <RotateCw className="h-4 w-4" />
              Vues 360°
              {counts['360'] > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                  {counts['360']}
                </Badge>
              )}
            </TabsTrigger>
            
            <TabsTrigger value="3d" className="flex items-center gap-2">
              <Box className="h-4 w-4" />
              Modèles 3D
              {counts['3d'] > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                  {counts['3d']}
                </Badge>
              )}
            </TabsTrigger>
            
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <FileVideo className="h-4 w-4" />
              Vidéos
              {counts['videos'] > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                  {counts['videos']}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">            <TabsContent value="360" className="space-y-4">
              <Product360Manager
                data360={product.views360 || []}
                onChange={onViews360Change}
              />
            </TabsContent><TabsContent value="3d" className="space-y-4">
              <Product3DManager 
                media3D={product.media3D || []} 
                onChange={(media3D) => onProductChange({ ...product, media3D })}
              />
            </TabsContent>

            <TabsContent value="videos" className="space-y-4">
              <ProductVideoManager 
                videos={product.videos || []} 
                onChange={(videos) => onProductChange({ ...product, videos })}
              />
            </TabsContent>
          </div>
        </Tabs>

        {/* Summary */}
        {(counts['360'] > 0 || counts['3d'] > 0 || counts['videos'] > 0) && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Résumé des médias
              </span>
            </div>
            <div className="text-sm text-blue-700 space-y-1">
              {counts['360'] > 0 && (
                <div>• {counts['360']} vue(s) 360° ajoutée(s)</div>
              )}
              {counts['3d'] > 0 && (
                <div>• {counts['3d']} modèle(s) 3D ajouté(s)</div>
              )}
              {counts['videos'] > 0 && (
                <div>• {counts['videos']} vidéo(s) ajoutée(s)</div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductMediaManagerV2;
