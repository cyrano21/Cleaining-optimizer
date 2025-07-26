'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Upload, 
  X, 
  Plus, 
  Eye, 
  RotateCcw, 
  Image as ImageIcon,
  Video,
  Save,
  Wand2,
  Box,
  Settings,
  DollarSign,
  Package,
  Zap
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import Product3DViewer from './Product3DViewer';
import { Product360Viewer } from './Product360Viewer';
import { toast } from '@/hooks/use-toast';

interface ProductData {
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  comparePrice?: number;
  cost?: number;
  sku: string;
  barcode?: string;
  category: string;
  subcategory?: string;
  brand: string;
  vendor: string;
  tags: string[];
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  inventory: {
    trackQuantity: boolean;
    quantity: number;
    lowStockThreshold: number;
    allowBackorder: boolean;
  };
  media: {
    images: string[];
    videos: string[];
    model3D?: string;
    images360: string[];
  };
  features: {
    enable3DViewer: boolean;
    enable360View: boolean;
    enableARPreview: boolean;
    enableZoom: boolean;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    focusKeyword: string;
    slug: string;
  };
}

interface FileUploadZoneProps {
  onFilesSelected: (files: FileList) => void;
  accept: string;
  multiple?: boolean;
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFilesSelected,
  accept,
  multiple = false,
  title,
  description,
  icon,
  className
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFilesSelected(files);
    }
  }, [onFilesSelected]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFilesSelected(files);
    }
  }, [onFilesSelected]);

  return (
    <div
      className={cn(
        "relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200",
        isDragOver 
          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/50" 
          : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500",
        className
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="sr-only"
        aria-label={`Upload files`}
      />
      
      <div className="flex flex-col items-center space-y-2">
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
          isDragOver ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
        )}>
          {icon}
        </div>
        <h3 className="font-medium text-gray-900 dark:text-gray-100">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        <Button variant="outline" size="sm" className="mt-2">
          <Upload className="w-4 h-4 mr-2" />
          Choose Files
        </Button>
      </div>
    </div>
  );
};

interface MediaPreviewProps {
  files: string[];
  type: 'image' | 'video' | '3d' | '360';
  onRemove: (index: number) => void;
  onPreview?: (index: number) => void;
}

const MediaPreview: React.FC<MediaPreviewProps> = ({ files, type, onRemove, onPreview }) => {
  if (files.length === 0) return null;

  const getIcon = () => {
    switch (type) {
      case 'image': return <ImageIcon className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case '3d': return <Box className="w-4 h-4" />;
      case '360': return <RotateCcw className="w-4 h-4" />;
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
      {files.map((file, index) => (
        <div key={index} className="relative group">
          <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            {type === 'image' ? (
              <Image src={file} alt={`Preview ${index}`} className="w-full h-full object-cover" fill style={{objectFit: 'cover'}} />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {getIcon()}
                <span className="ml-2 text-xs truncate">{file.split('/').pop()}</span>
              </div>
            )}
          </div>
          
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
            {onPreview && (
              <Button size="sm" variant="secondary" onClick={() => onPreview(index)}>
                <Eye className="w-4 h-4" />
              </Button>
            )}
            <Button size="sm" variant="destructive" onClick={() => onRemove(index)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export const AdvancedProductCreator: React.FC = () => {
  const [productData, setProductData] = useState<ProductData>({
    name: '',
    description: '',
    shortDescription: '',
    price: 0,
    sku: '',
    category: '',
    brand: '',
    vendor: '',
    tags: [],
    inventory: {
      trackQuantity: true,
      quantity: 0,
      lowStockThreshold: 5,
      allowBackorder: false
    },
    media: {
      images: [],
      videos: [],
      images360: []
    },
    features: {
      enable3DViewer: false,
      enable360View: false,
      enableARPreview: false,
      enableZoom: true
    },
    seo: {
      metaTitle: '',
      metaDescription: '',
      focusKeyword: '',
      slug: ''
    }
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newTag, setNewTag] = useState('');

  // Auto-generate SEO data from product name
  useEffect(() => {
    if (productData.name && !productData.seo.metaTitle) {
      const slug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setProductData(prev => ({
        ...prev,
        seo: {
          ...prev.seo,
          metaTitle: productData.name,
          slug: slug,
          focusKeyword: productData.name.toLowerCase()
        }
      }));
    }
  }, [productData.name, productData.seo.metaTitle]);

  const handleImageUpload = useCallback((files: FileList) => {
    const newImages = Array.from(files).map(file => URL.createObjectURL(file));
    setProductData(prev => ({
      ...prev,
      media: {
        ...prev.media,
        images: [...prev.media.images, ...newImages]
      }
    }));
    toast({
      title: "Images uploaded",
      description: `${files.length} image(s) added to product gallery.`
    });
  }, []);

  const handleVideoUpload = useCallback((files: FileList) => {
    const newVideos = Array.from(files).map(file => URL.createObjectURL(file));
    setProductData(prev => ({
      ...prev,
      media: {
        ...prev.media,
        videos: [...prev.media.videos, ...newVideos]
      }
    }));
    toast({
      title: "Videos uploaded",
      description: `${files.length} video(s) added to product media.`
    });
  }, []);

  const handle3DUpload = useCallback((files: FileList) => {
    const file = files[0];
    if (file) {
      const modelUrl = URL.createObjectURL(file);
      setProductData(prev => ({
        ...prev,
        media: {
          ...prev.media,
          model3D: modelUrl
        },
        features: {
          ...prev.features,
          enable3DViewer: true
        }
      }));
      toast({
        title: "3D Model uploaded",
        description: "3D viewer has been enabled for this product."
      });
    }
  }, []);

  const handle360Upload = useCallback((files: FileList) => {
    const new360Images = Array.from(files).map(file => URL.createObjectURL(file));
    setProductData(prev => ({
      ...prev,
      media: {
        ...prev.media,
        images360: [...prev.media.images360, ...new360Images]
      },
      features: {
        ...prev.features,
        enable360View: true
      }
    }));
    toast({
      title: "360° Images uploaded",
      description: `${files.length} image(s) added to 360° viewer.`
    });
  }, []);

  const addTag = useCallback(() => {
    if (newTag.trim() && !productData.tags.includes(newTag.trim())) {
      setProductData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  }, [newTag, productData.tags]);

  const removeTag = useCallback((tagToRemove: string) => {
    setProductData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Product created successfully!",
        description: "Your product has been added to the catalog with 3D capabilities."
      });
      
      // Reset form or redirect
    } catch {
      toast({
        title: "Error creating product",
        description: "Please try again later."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderPreview = () => {
    if (!isPreviewMode) return null;

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="w-5 h-5 mr-2" />
            Product Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 3D/360 Viewer */}
            <div className="space-y-4">
              {productData.features.enable3DViewer && productData.media.model3D && (
                <Product3DViewer 
                  modelUrl={productData.media.model3D}
                  className="h-96"
                />
              )}
              
              {productData.features.enable360View && productData.media.images360.length > 0 && (
                <Product360Viewer 
                  images={productData.media.images360}
                  autoRotate={true}
                  className="h-96"
                />
              )}
              
              {productData.media.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {productData.media.images.slice(0, 3).map((img, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                      <Image src={img} alt={`Product ${index}`} className="object-cover" fill style={{objectFit: 'cover'}} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{productData.name || 'Product Name'}</h2>
                <p className="text-gray-600 dark:text-gray-400">{productData.shortDescription}</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-green-600">${productData.price}</span>
                {productData.comparePrice && productData.comparePrice > productData.price && (
                  <span className="text-lg text-gray-500 line-through">${productData.comparePrice}</span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {productData.tags.map(tag => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">SKU:</span>
                  <span className="font-mono">{productData.sku || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Brand:</span>
                  <span>{productData.brand || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Stock:</span>
                  <span>{productData.inventory.quantity} available</span>
                </div>
              </div>

              <div className="flex space-x-2">
                {productData.features.enable3DViewer && (
                  <Badge variant="outline" className="flex items-center">
                    <Box className="w-3 h-3 mr-1" />
                    3D View
                  </Badge>
                )}
                {productData.features.enable360View && (
                  <Badge variant="outline" className="flex items-center">
                    <RotateCcw className="w-3 h-3 mr-1" />
                    360° View
                  </Badge>
                )}
                {productData.features.enableARPreview && (
                  <Badge variant="outline" className="flex items-center">
                    <Zap className="w-3 h-3 mr-1" />
                    AR Preview
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Create New Product</h1>
          <p className="text-gray-600 dark:text-gray-400">Add a new product with advanced 3D and 360° capabilities</p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {isPreviewMode ? 'Hide Preview' : 'Preview'}
          </Button>
          
          <Button 
            onClick={handleSave}
            disabled={isSaving || !productData.name || !productData.price}
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Product
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="basic" className="flex items-center">
            <Package className="w-4 h-4 mr-2" />
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center">
            <ImageIcon className="w-4 h-4 mr-2" />
            Media
          </TabsTrigger>
          <TabsTrigger value="3d" className="flex items-center">
            <Box className="w-4 h-4 mr-2" />
            3D & 360°
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center">
            <DollarSign className="w-4 h-4 mr-2" />
            Pricing
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center">
            <Box className="w-4 h-4 mr-2" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            SEO
          </TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={productData.name}
                    onChange={(e) => setProductData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter product name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    value={productData.sku}
                    onChange={(e) => setProductData(prev => ({ ...prev, sku: e.target.value }))}
                    placeholder="Product SKU"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription">Short Description</Label>
                <Input
                  id="shortDescription"
                  value={productData.shortDescription}
                  onChange={(e) => setProductData(prev => ({ ...prev, shortDescription: e.target.value }))}
                  placeholder="Brief product description"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Full Description</Label>
                <Textarea
                  id="description"
                  value={productData.description}
                  onChange={(e) => setProductData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed product description"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={productData.category} onValueChange={(value) => 
                    setProductData(prev => ({ ...prev, category: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="fashion">Fashion</SelectItem>
                      <SelectItem value="home">Home & Garden</SelectItem>
                      <SelectItem value="sports">Sports & Outdoors</SelectItem>
                      <SelectItem value="books">Books</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={productData.brand}
                    onChange={(e) => setProductData(prev => ({ ...prev, brand: e.target.value }))}
                    placeholder="Product brand"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vendor">Vendor</Label>
                  <Input
                    id="vendor"
                    value={productData.vendor}
                    onChange={(e) => setProductData(prev => ({ ...prev, vendor: e.target.value }))}
                    placeholder="Vendor name"
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Product Tags</Label>
                <div className="flex space-x-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button type="button" onClick={addTag}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                {productData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {productData.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="flex items-center">
                        {tag}
                        <button 
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-xs hover:text-red-500"
                          aria-label={`Remove tag ${tag}`}
                          title={`Remove tag ${tag}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUploadZone
                onFilesSelected={handleImageUpload}
                accept="image/*"
                multiple={true}
                title="Upload Product Images"
                description="Drag & drop images here or click to browse. Supports JPG, PNG, WebP."
                icon={<ImageIcon className="w-6 h-6" />}
              />
              
              <MediaPreview
                files={productData.media.images}
                type="image"
                onRemove={(index) => setProductData(prev => ({
                  ...prev,
                  media: {
                    ...prev.media,
                    images: prev.media.images.filter((_, i) => i !== index)
                  }
                }))}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Videos</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUploadZone
                onFilesSelected={handleVideoUpload}
                accept="video/*"
                multiple={true}
                title="Upload Product Videos"
                description="Add product demonstration videos. Supports MP4, WebM, MOV."
                icon={<Video className="w-6 h-6" />}
              />
              
              <MediaPreview
                files={productData.media.videos}
                type="video"
                onRemove={(index) => setProductData(prev => ({
                  ...prev,
                  media: {
                    ...prev.media,
                    videos: prev.media.videos.filter((_, i) => i !== index)
                  }
                }))}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3D & 360° Tab */}
        <TabsContent value="3d" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Box className="w-5 h-5 mr-2" />
                3D Model Upload
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FileUploadZone
                onFilesSelected={handle3DUpload}
                accept=".gltf,.glb,.obj"
                multiple={false}
                title="Upload 3D Model"
                description="Upload your product's 3D model. Supports GLTF, GLB, OBJ formats."
                icon={<Box className="w-6 h-6" />}
              />
              
              {productData.media.model3D && (
                <div className="mt-4">
                  <Label className="text-sm font-medium">3D Model Preview</Label>
                  <div className="mt-2 h-64 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <Product3DViewer 
                      modelUrl={productData.media.model3D}
                      className="w-full h-full"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <RotateCcw className="w-5 h-5 mr-2" />
                360° Product Images
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FileUploadZone
                onFilesSelected={handle360Upload}
                accept="image/*"
                multiple={true}
                title="Upload 360° Images"
                description="Upload a sequence of images for 360° product view. Minimum 8 images recommended."
                icon={<RotateCcw className="w-6 h-6" />}
              />
              
              <MediaPreview
                files={productData.media.images360}
                type="360"
                onRemove={(index) => setProductData(prev => ({
                  ...prev,
                  media: {
                    ...prev.media,
                    images360: prev.media.images360.filter((_, i) => i !== index)
                  }
                }))}
              />
              
              {productData.media.images360.length > 0 && (
                <div className="mt-4">
                  <Label className="text-sm font-medium">360° Preview</Label>
                  <div className="mt-2 h-64 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <Product360Viewer 
                      images={productData.media.images360}
                      autoRotate={true}
                      className="w-full h-full"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3D Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enable3d">Enable 3D Viewer</Label>
                  <p className="text-sm text-gray-500">Allow customers to view the product in 3D</p>
                </div>
                <Switch
                  id="enable3d"
                  checked={productData.features.enable3DViewer}
                  onCheckedChange={(checked) => setProductData(prev => ({
                    ...prev,
                    features: { ...prev.features, enable3DViewer: checked }
                  }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enable360">Enable 360° View</Label>
                  <p className="text-sm text-gray-500">Allow customers to rotate the product view</p>
                </div>
                <Switch
                  id="enable360"
                  checked={productData.features.enable360View}
                  onCheckedChange={(checked) => setProductData(prev => ({
                    ...prev,
                    features: { ...prev.features, enable360View: checked }
                  }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableAR">Enable AR Preview</Label>
                  <p className="text-sm text-gray-500">Allow customers to preview product in augmented reality</p>
                </div>
                <Switch
                  id="enableAR"
                  checked={productData.features.enableARPreview}
                  onCheckedChange={(checked) => setProductData(prev => ({
                    ...prev,
                    features: { ...prev.features, enableARPreview: checked }
                  }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableZoom">Enable Zoom</Label>
                  <p className="text-sm text-gray-500">Allow customers to zoom in on product details</p>
                </div>
                <Switch
                  id="enableZoom"
                  checked={productData.features.enableZoom}
                  onCheckedChange={(checked) => setProductData(prev => ({
                    ...prev,
                    features: { ...prev.features, enableZoom: checked }
                  }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={productData.price}
                    onChange={(e) => setProductData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comparePrice">Compare Price</Label>
                  <Input
                    id="comparePrice"
                    type="number"
                    step="0.01"
                    value={productData.comparePrice || ''}
                    onChange={(e) => setProductData(prev => ({ ...prev, comparePrice: parseFloat(e.target.value) || undefined }))}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cost">Cost per item</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={productData.cost || ''}
                    onChange={(e) => setProductData(prev => ({ ...prev, cost: parseFloat(e.target.value) || undefined }))}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="barcode">Barcode</Label>
                <Input
                  id="barcode"
                  value={productData.barcode || ''}
                  onChange={(e) => setProductData(prev => ({ ...prev, barcode: e.target.value }))}
                  placeholder="Product barcode"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="trackQuantity">Track Quantity</Label>
                  <p className="text-sm text-gray-500">Track the number of items in inventory</p>
                </div>
                <Switch
                  id="trackQuantity"
                  checked={productData.inventory.trackQuantity}
                  onCheckedChange={(checked) => setProductData(prev => ({
                    ...prev,
                    inventory: { ...prev.inventory, trackQuantity: checked }
                  }))}
                />
              </div>

              {productData.inventory.trackQuantity && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={productData.inventory.quantity}
                      onChange={(e) => setProductData(prev => ({
                        ...prev,
                        inventory: { ...prev.inventory, quantity: parseInt(e.target.value) || 0 }
                      }))}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lowStock">Low Stock Threshold</Label>
                    <Input
                      id="lowStock"
                      type="number"
                      value={productData.inventory.lowStockThreshold}
                      onChange={(e) => setProductData(prev => ({
                        ...prev,
                        inventory: { ...prev.inventory, lowStockThreshold: parseInt(e.target.value) || 0 }
                      }))}
                      placeholder="5"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allowBackorder">Allow Backorders</Label>
                  <p className="text-sm text-gray-500">Allow customers to order when out of stock</p>
                </div>
                <Switch
                  id="allowBackorder"
                  checked={productData.inventory.allowBackorder}
                  onCheckedChange={(checked) => setProductData(prev => ({
                    ...prev,
                    inventory: { ...prev.inventory, allowBackorder: checked }
                  }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.01"
                  value={productData.weight || ''}
                  onChange={(e) => setProductData(prev => ({ ...prev, weight: parseFloat(e.target.value) || undefined }))}
                  placeholder="0.00"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="length">Length (cm)</Label>
                  <Input
                    id="length"
                    type="number"
                    value={productData.dimensions?.length || ''}
                    onChange={(e) => setProductData(prev => ({
                      ...prev,
                      dimensions: {
                        ...prev.dimensions,
                        length: parseFloat(e.target.value) || 0,
                        width: prev.dimensions?.width || 0,
                        height: prev.dimensions?.height || 0
                      }
                    }))}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="width">Width (cm)</Label>
                  <Input
                    id="width"
                    type="number"
                    value={productData.dimensions?.width || ''}
                    onChange={(e) => setProductData(prev => ({
                      ...prev,
                      dimensions: {
                        ...prev.dimensions,
                        length: prev.dimensions?.length || 0,
                        width: parseFloat(e.target.value) || 0,
                        height: prev.dimensions?.height || 0
                      }
                    }))}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={productData.dimensions?.height || ''}
                    onChange={(e) => setProductData(prev => ({
                      ...prev,
                      dimensions: {
                        ...prev.dimensions,
                        length: prev.dimensions?.length || 0,
                        width: prev.dimensions?.width || 0,
                        height: parseFloat(e.target.value) || 0
                      }
                    }))}
                    placeholder="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wand2 className="w-5 h-5 mr-2" />
                SEO Optimization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={productData.seo.metaTitle}
                  onChange={(e) => setProductData(prev => ({
                    ...prev,
                    seo: { ...prev.seo, metaTitle: e.target.value }
                  }))}
                  placeholder="SEO optimized title"
                />
                <p className="text-xs text-gray-500">{productData.seo.metaTitle.length}/60 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={productData.seo.metaDescription}
                  onChange={(e) => setProductData(prev => ({
                    ...prev,
                    seo: { ...prev.seo, metaDescription: e.target.value }
                  }))}
                  placeholder="SEO description for search engines"
                  rows={3}
                />
                <p className="text-xs text-gray-500">{productData.seo.metaDescription.length}/160 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="focusKeyword">Focus Keyword</Label>
                <Input
                  id="focusKeyword"
                  value={productData.seo.focusKeyword}
                  onChange={(e) => setProductData(prev => ({
                    ...prev,
                    seo: { ...prev.seo, focusKeyword: e.target.value }
                  }))}
                  placeholder="Main keyword for SEO"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={productData.seo.slug}
                  onChange={(e) => setProductData(prev => ({
                    ...prev,
                    seo: { ...prev.seo, slug: e.target.value }
                  }))}
                  placeholder="product-url-slug"
                />
                <p className="text-xs text-gray-500">
                  URL: https://yourstore.com/products/{productData.seo.slug}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {renderPreview()}
    </div>
  );
};

export default AdvancedProductCreator;