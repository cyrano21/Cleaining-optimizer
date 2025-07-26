"use client";

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Upload, 
  X, 
  Eye, 
  RotateCw, 
  Settings,
  ImageIcon,
  Plus,
  Trash2,
  Move,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Product360Viewer } from './Product360Viewer';
import { mediaUploadService } from '@/services/mediaUploadService';
import Image from 'next/image';

interface Product360Data {
  id: string;
  name: string;
  images: string[];
  autoRotate: boolean;
  rotationSpeed: number;
  zoomEnabled: boolean;
  description?: string;
}

interface Product360ManagerProps {
  data360: Product360Data[];
  onChange: (data360: Product360Data[]) => void;
  className?: string;
}

export const Product360Manager: React.FC<Product360ManagerProps> = ({
  data360 = [],
  onChange,
  className
}) => {
  const [previewMode, setPreviewMode] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [expandedSettings, setExpandedSettings] = useState<string | null>(null);

  // Add new 360° view
  const handleAdd360View = () => {
    const newView: Product360Data = {
      id: `360_${Date.now()}`,
      name: `360° View ${data360.length + 1}`,
      images: [],
      autoRotate: false,
      rotationSpeed: 100,
      zoomEnabled: true,
      description: ''
    };
    onChange([...data360, newView]);
  };

  // Remove 360° view
  const handleRemove360View = (id: string) => {
    onChange(data360.filter(item => item.id !== id));
    if (previewMode === id) {
      setPreviewMode(null);
    }
    toast.success('360° view removed');
  };

  // Update 360° view
  const handleUpdate360View = (id: string, updates: Partial<Product360Data>) => {
    onChange(data360.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };
  // Handle image upload for 360° view
  const handleImageUpload = useCallback(async (id: string, files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not a valid image file`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error(`${file.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const currentView = data360.find(item => item.id === id);
    if (!currentView) return;

    try {
      // Show upload progress
      toast.loading(`Uploading ${validFiles.length} images...`);

      // Upload images to server
      const uploadResult = await mediaUploadService.upload360Images(validFiles);
      
      toast.dismiss();
      
      if (!uploadResult.success || !uploadResult.urls) {
        toast.error('Failed to upload some images');
        if (uploadResult.errors) {
          uploadResult.errors.forEach(error => toast.error(error));
        }
        return;
      }

      // Update the view with uploaded URLs
      handleUpdate360View(id, {
        images: [...currentView.images, ...uploadResult.urls]
      });
      
      toast.success(`Successfully uploaded ${uploadResult.urls.length} images`);
      
      // Clean up any temporary URLs
      if (uploadResult.errors && uploadResult.errors.length > 0) {
        toast.warning(`${uploadResult.errors.length} images failed to upload`);
      }

    } catch (error) {
      toast.dismiss();
      console.error('Upload error:', error);
      toast.error('Failed to upload images');
    }
  }, [data360]);

  // Remove image from 360° view
  const handleRemoveImage = (viewId: string, imageIndex: number) => {
    const currentView = data360.find(item => item.id === viewId);
    if (currentView) {
      const newImages = currentView.images.filter((_, index) => index !== imageIndex);
      handleUpdate360View(viewId, { images: newImages });
      
      // Revoke object URL to prevent memory leaks
      URL.revokeObjectURL(currentView.images[imageIndex]);
    }
  };

  // Reorder images within a 360° view
  const handleReorderImages = (viewId: string, oldIndex: number, newIndex: number) => {
    const currentView = data360.find(item => item.id === viewId);
    if (currentView) {
      const newImages = [...currentView.images];
      const [removed] = newImages.splice(oldIndex, 1);
      newImages.splice(newIndex, 0, removed);
      handleUpdate360View(viewId, { images: newImages });
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number, viewId: string) => {
    e.preventDefault();
    if (draggedItem !== null && draggedItem !== dropIndex) {
      handleReorderImages(viewId, draggedItem, dropIndex);
    }
    setDraggedItem(null);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">360° Product Views</h3>
          <p className="text-sm text-gray-600">
            Create interactive 360° views by uploading a sequence of images
          </p>
        </div>
        <Button onClick={handleAdd360View} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add 360° View
        </Button>
      </div>

      {/* 360° Views List */}
      {data360.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <RotateCw className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h4 className="text-lg font-medium mb-2">No 360° Views</h4>
            <p className="text-gray-600 mb-4">
              Add your first 360° view to showcase your product from all angles
            </p>
            <Button onClick={handleAdd360View}>
              <Plus className="h-4 w-4 mr-2" />
              Create 360° View
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data360.map((view) => (
            <Card key={view.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <RotateCw className="h-5 w-5 text-blue-600" />
                    <div>
                      <Input
                        value={view.name}
                        onChange={(e) => handleUpdate360View(view.id, { name: e.target.value })}
                        className="font-medium border-none p-0 h-auto bg-transparent"
                        placeholder="360° View Name"
                      />
                      <p className="text-sm text-gray-600">
                        {view.images.length} images
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {view.images.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPreviewMode(previewMode === view.id ? null : view.id)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {previewMode === view.id ? 'Hide' : 'Preview'}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setExpandedSettings(expandedSettings === view.id ? null : view.id)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemove360View(view.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Image Upload */}
                <div>
                  <Label htmlFor={`images-${view.id}`} className="text-sm font-medium">
                    Upload Images (Sequence)
                  </Label>
                  <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                    <input
                      id={`images-${view.id}`}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageUpload(view.id, e.target.files)}
                      className="hidden"
                    />
                    <label htmlFor={`images-${view.id}`} className="cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">
                        Click to upload or drag and drop multiple images
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB each. Upload images in sequence for smooth rotation.
                      </p>
                    </label>
                  </div>
                </div>

                {/* Images Grid */}
                {view.images.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        Images ({view.images.length})
                      </Label>
                      {view.images.length < 12 && (
                        <div className="flex items-center gap-1 text-amber-600">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-xs">
                            12+ images recommended for smooth rotation
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto">
                      {view.images.map((image, index) => (
                        <div
                          key={index}
                          draggable
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, index, view.id)}
                          className={cn(
                            "relative aspect-square rounded border-2 cursor-move hover:border-blue-500 transition-colors",
                            draggedItem === index ? "opacity-50 border-blue-500" : "border-gray-200"
                          )}
                        >
                          <Image
                            src={image}
                            alt={`Frame ${index + 1}`}
                            fill
                            className="object-cover rounded"
                            sizes="80px"
                          />
                          <div className="absolute -top-2 -left-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {index + 1}
                          </div>
                          <button
                            onClick={() => handleRemoveImage(view.id, index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            title="Remove image"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <div className="absolute bottom-1 right-1">
                            <Move className="h-3 w-3 text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Settings Panel */}
                {expandedSettings === view.id && (
                  <div className="border-t pt-4 space-y-4">
                    <h4 className="font-medium text-sm">360° View Settings</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm">Auto Rotation</Label>
                        <div className="flex items-center space-x-2">
                          <input
                            id={`auto-rotate-${view.id}`}
                            type="checkbox"
                            checked={view.autoRotate}
                            onChange={(e) => handleUpdate360View(view.id, { autoRotate: e.target.checked })}
                            className="rounded"
                            aria-label="Enable auto rotation"
                          />
                          <label htmlFor={`auto-rotate-${view.id}`} className="text-sm cursor-pointer">Enable auto rotation</label>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm">Rotation Speed (ms)</Label>
                        <Input
                          type="number"
                          min="10"
                          max="1000"
                          value={view.rotationSpeed}
                          onChange={(e) => handleUpdate360View(view.id, { rotationSpeed: parseInt(e.target.value) || 100 })}
                          className="text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm">Zoom</Label>
                        <div className="flex items-center space-x-2">
                          <input
                            id={`zoom-enabled-${view.id}`}
                            type="checkbox"
                            checked={view.zoomEnabled}
                            onChange={(e) => handleUpdate360View(view.id, { zoomEnabled: e.target.checked })}
                            className="rounded"
                            aria-label="Enable zoom"
                          />
                          <label htmlFor={`zoom-enabled-${view.id}`} className="text-sm cursor-pointer">Enable zoom</label>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm">Description (optional)</Label>
                        <Input
                          value={view.description || ''}
                          onChange={(e) => handleUpdate360View(view.id, { description: e.target.value })}
                          placeholder="Brief description"
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Preview */}
                {previewMode === view.id && view.images.length > 0 && (
                  <div className="border-t pt-4">
                    <Label className="text-sm font-medium mb-2 block">Preview</Label>
                    <Product360Viewer
                      images={view.images}
                      autoRotate={view.autoRotate}
                      rotationSpeed={view.rotationSpeed}
                      zoomEnabled={view.zoomEnabled}
                      className="max-w-md mx-auto"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Product360Manager;
