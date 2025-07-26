"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  X,
  Box,
  RotateCcw,
  Image as ImageIcon,
  Video,
  Save,
  Wand2,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useStore } from "@/hooks/use-store";
import { useSession } from "next-auth/react";
import {
  ProductFormData,
  Category,
  Attribute,
  UserRole,
  ROLE_CONFIGS,
  validateProductForm,
  getDefaultProductForm,
  ValidationError,
} from "@/types/product";

interface UnifiedProductFormProps {
  mode: "modal" | "page";
  onProductCreated?: (product: ProductFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<ProductFormData>;
  storeId?: string;
  vendorId?: string;
  userRole?: UserRole;
}

interface FileUploadZoneProps {
  onFilesSelected: (files: FileList) => void;
  accept: string;
  multiple?: boolean;
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
  maxFiles?: number;
  currentCount?: number;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFilesSelected,
  accept,
  multiple = false,
  title,
  description,
  icon,
  className,
  maxFiles,
  currentCount = 0,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        if (maxFiles && currentCount + e.dataTransfer.files.length > maxFiles) {
          toast.error(`Maximum ${maxFiles} files allowed`);
          return;
        }
        onFilesSelected(e.dataTransfer.files);
      }
    },
    [onFilesSelected, maxFiles, currentCount]
  );

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (maxFiles && currentCount + e.target.files.length > maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed`);
        return;
      }
      onFilesSelected(e.target.files);
    }
  };

  return (
    <div
      className={cn(
        "relative border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer",
        dragActive
          ? "border-primary bg-primary/10"
          : "border-muted-foreground/25",
        className
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
        aria-label={title}
      />
      <div className="mx-auto mb-4 w-12 h-12 text-muted-foreground">{icon}</div>
      <h3 className="mb-2 text-sm font-medium">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
      {maxFiles && (
        <p className="text-xs text-muted-foreground mt-2">
          {currentCount}/{maxFiles} files
        </p>
      )}
    </div>
  );
};

export const UnifiedProductForm: React.FC<UnifiedProductFormProps> = ({
  mode,
  onProductCreated,
  onCancel,
  initialData,
  storeId,
  vendorId,
  userRole = "vendor",
}) => {
  const { data: session } = useSession();
  const { currentStore } = useStore();

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [errors, setErrors] = useState<ValidationError[]>([]);

  // Product data states
  const [productData, setProductData] = useState<ProductFormData>(() => {
    const defaultData = getDefaultProductForm(userRole);
    return { ...defaultData, ...initialData };
  });

  // External data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Interface states
  const [newTag, setNewTag] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newVideoType, setNewVideoType] = useState<"youtube" | "vimeo">(
    "youtube"
  );

  const config = ROLE_CONFIGS[userRole];
  const effectiveStoreId = storeId || currentStore?.id;
  const effectiveVendorId = vendorId || session?.user?.id;

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      if (!effectiveStoreId) {
        toast.error("Please select a store");
        return;
      }

      try {
        setLoadingData(true);

        // Load categories based on role
        const categoriesEndpoint =
          userRole === "admin"
            ? "/api/admin/categories"
            : `/api/vendor/categories?storeId=${effectiveStoreId}`;

        const categoriesResponse = await fetch(categoriesEndpoint);
        const categoriesData = await categoriesResponse.json();
        if (categoriesData.success || categoriesData.categories) {
          setCategories(categoriesData.categories || []);
        }

        // Load attributes
        const attributesEndpoint =
          userRole === "admin"
            ? "/api/admin/attributes"
            : `/api/vendor/attributes?storeId=${effectiveStoreId}`;

        const attributesResponse = await fetch(attributesEndpoint);
        const attributesData = await attributesResponse.json();
        if (attributesData.attributes) {
          setAttributes(attributesData.attributes || []);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Error loading data");
      } finally {
        setLoadingData(false);
      }
    };

    loadInitialData();
  }, [effectiveStoreId, userRole]);

  // Form change handlers
  const handleInputChange = (field: keyof ProductFormData, value: unknown) => {
    setProductData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    setErrors((prev) => prev.filter((error) => error.field !== field));
  };

  // Tag handlers
  const handleAddTag = () => {
    if (newTag.trim() && !productData.tags.includes(newTag.trim())) {
      setProductData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setProductData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // Attribute handlers
  const handleAttributeChange = (attributeName: string, value: string) => {
    setProductData((prev) => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [attributeName]: value,
      },
    }));
  };

  // Image handlers
  const handleImageUpload = (files: FileList) => {
    const fileArray = Array.from(files);
    const newImages = [...productData.images, ...fileArray];
    setProductData((prev) => ({ ...prev, images: newImages }));
  };

  const handleRemoveImage = (index: number) => {
    setProductData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Video handlers
  const handleVideoUpload = (files: FileList) => {
    const fileArray = Array.from(files);
    const newVideos = fileArray.map((file) => ({
      url: URL.createObjectURL(file),
      type: "upload" as const,
      title: file.name,
      file,
    }));

    setProductData((prev) => ({
      ...prev,
      videos: [...(prev.videos || []), ...newVideos],
    }));
  };

  const handleAddVideoUrl = () => {
    if (newVideoUrl.trim()) {
      const newVideo = {
        url: newVideoUrl.trim(),
        type: newVideoType,
        title: `Video ${(productData.videos?.length || 0) + 1}`,
      };

      setProductData((prev) => ({
        ...prev,
        videos: [...(prev.videos || []), newVideo],
      }));

      setNewVideoUrl("");
    }
  };

  const handleRemoveVideo = (index: number) => {
    setProductData((prev) => ({
      ...prev,
      videos: prev.videos?.filter((_, i) => i !== index) || [],
    }));
  };

  // 3D model handlers
  const handle3DUpload = (files: FileList) => {
    const fileArray = Array.from(files);
    const new3DModels = fileArray.map((file) => ({
      modelUrl: URL.createObjectURL(file),
      type: (file.name.endsWith(".glb")
        ? "glb"
        : file.name.endsWith(".gltf")
          ? "gltf"
          : "obj") as "gltf" | "glb" | "obj",
      previewImage: "",
    }));

    setProductData((prev) => ({
      ...prev,
      media3D: [...(prev.media3D || []), ...new3DModels],
    }));
  };

  const handleRemove3D = (index: number) => {
    setProductData((prev) => ({
      ...prev,
      media3D: prev.media3D?.filter((_, i) => i !== index) || [],
    }));
  };

  // 360 view handlers
  const handle360Upload = (files: FileList) => {
    const fileArray = Array.from(files);
    const new360View = {
      id: `360_${Date.now()}`,
      name: `360 View ${(productData.views360?.length || 0) + 1}`,
      images: fileArray.map((file) => URL.createObjectURL(file)),
      autoRotate: true,
      rotationSpeed: 1,
      zoomEnabled: true,
    };

    setProductData((prev) => ({
      ...prev,
      views360: [...(prev.views360 || []), new360View],
    }));
  };

  const handleRemove360View = (index: number) => {
    setProductData((prev) => ({
      ...prev,
      views360: prev.views360?.filter((_, i) => i !== index) || [],
    }));
  };

  // Auto-generate SKU
  const generateSKU = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    const sku = `SKU-${timestamp}-${random}`;
    setProductData((prev) => ({ ...prev, sku }));
  };

  // Validation and submission
  const validateAndSubmit = async (status: "draft" | "active") => {
    if (!effectiveStoreId) {
      toast.error("Please select a store");
      return;
    }

    if (!effectiveVendorId) {
      toast.error("User not authenticated");
      return;
    }

    // Validation
    const validationErrors = validateProductForm(productData, userRole);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      validationErrors.forEach((error) => {
        toast.error(error.message);
      });
      return;
    }

    try {
      setLoading(true);

      // Prepare data for API
      const submitData = {
        ...productData,
        status,
        store: effectiveStoreId,
        vendor: effectiveVendorId,
        // Convert files to URLs if necessary
        images: productData.images.map((img) =>
          typeof img === "string" ? img : URL.createObjectURL(img)
        ),
      };

      // Endpoint based on role
      const endpoint =
        userRole === "admin" ? "/api/admin/products" : "/api/vendor/products";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          `Product ${status === "draft" ? "saved" : "published"} successfully`
        );
        onProductCreated?.(productData);

        // Reset form
        setProductData(getDefaultProductForm(userRole));
        setErrors([]);
      } else {
        toast.error(result.message || "Error creating product");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Error creating product");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with role information */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">
            {mode === "modal" ? "New Product" : "Create Product"}
          </h1>
          <p className="text-muted-foreground">
            Role: {userRole} • Store: {currentStore?.name || "Not selected"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline">{config.maxImages} images max</Badge>
          <Badge variant="outline">{config.maxVideos} videos max</Badge>
          {config.max3DModels && (
            <Badge variant="outline">{config.max3DModels} 3D models max</Badge>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Information</TabsTrigger>
          <TabsTrigger value="pricing">Pricing & Stock</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Product Title *</Label>
                  <Input
                    id="title"
                    value={productData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Product name"
                    className={
                      errors.find((e) => e.field === "title")
                        ? "border-red-500"
                        : ""
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={productData.category}
                    onValueChange={(value) =>
                      handleInputChange("category", value)
                    }
                  >
                    <SelectTrigger
                      id="category"
                      aria-label="Select a category"
                      className={
                        errors.find((e) => e.field === "category")
                          ? "border-red-500"
                          : ""
                      }
                    >
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <div className="flex gap-2">
                    <Input
                      id="sku"
                      value={productData.sku}
                      onChange={(e) => handleInputChange("sku", e.target.value)}
                      placeholder="Stock Keeping Unit"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={generateSKU}
                      aria-label="Generate SKU"
                    >
                      <Wand2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={productData.brand || ""}
                    onChange={(e) => handleInputChange("brand", e.target.value)}
                    placeholder="Brand name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description *</Label>
                <Textarea
                  id="description"
                  value={productData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Describe your product in detail"
                  rows={4}
                  className={
                    errors.find((e) => e.field === "description")
                      ? "border-red-500"
                      : ""
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription">Short Description</Label>
                <Textarea
                  id="shortDescription"
                  value={productData.shortDescription || ""}
                  onChange={(e) =>
                    handleInputChange("shortDescription", e.target.value)
                  }
                  placeholder="Brief product description"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      id="tags"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddTag}
                      disabled={!newTag.trim()}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {productData.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {tag}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 ml-1"
                          onClick={() => handleRemoveTag(tag)}
                          aria-label={`Remove tag ${tag}`}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing & Stock Tab */}
        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Stock Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={productData.price}
                    onChange={(e) =>
                      handleInputChange(
                        "price",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder="0.00"
                    className={
                      errors.find((e) => e.field === "price")
                        ? "border-red-500"
                        : ""
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comparePrice">Compare Price</Label>
                  <Input
                    id="comparePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={productData.comparePrice || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "comparePrice",
                        parseFloat(e.target.value) || undefined
                      )
                    }
                    placeholder="Original price"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="costPerItem">Unit Cost</Label>
                  <Input
                    id="costPerItem"
                    type="number"
                    step="0.01"
                    min="0"
                    value={productData.costPerItem || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "costPerItem",
                        parseFloat(e.target.value) || undefined
                      )
                    }
                    placeholder="Cost per item"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    value={productData.quantity}
                    onChange={(e) =>
                      handleInputChange(
                        "quantity",
                        parseInt(e.target.value) || 0
                      )
                    }
                    placeholder="0"
                    className={
                      errors.find((e) => e.field === "quantity")
                        ? "border-red-500"
                        : ""
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lowStockAlert">Low Stock Alert</Label>
                  <Input
                    id="lowStockAlert"
                    type="number"
                    min="0"
                    value={productData.lowStockAlert || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "lowStockAlert",
                        parseInt(e.target.value) || undefined
                      )
                    }
                    placeholder="Alert threshold"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="trackQuantity"
                    checked={productData.trackQuantity}
                    onCheckedChange={(checked) =>
                      handleInputChange("trackQuantity", checked)
                    }
                  />
                  <Label htmlFor="trackQuantity">Track quantity</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="continueSellingOutOfStock"
                    checked={productData.continueSellingOutOfStock}
                    onCheckedChange={(checked) =>
                      handleInputChange("continueSellingOutOfStock", checked)
                    }
                  />
                  <Label htmlFor="continueSellingOutOfStock">
                    Continue selling when out of stock
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media" className="space-y-4">
          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUploadZone
                onFilesSelected={handleImageUpload}
                accept="image/*"
                multiple
                title="Upload Images"
                description="Drag and drop images or click to browse"
                icon={<ImageIcon className="w-6 h-6" />}
                maxFiles={config.maxImages}
                currentCount={productData.images.length}
              />

              {productData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {productData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={
                          typeof image === "string"
                            ? image
                            : URL.createObjectURL(image)
                        }
                        alt={`Product image ${index + 1}`}
                        width={200}
                        height={200}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveImage(index)}
                        aria-label={`Remove image ${index + 1}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Videos */}
          <Card>
            <CardHeader>
              <CardTitle>Videos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUploadZone
                onFilesSelected={handleVideoUpload}
                accept="video/*"
                multiple
                title="Upload Videos"
                description="Drag and drop video files or click to browse"
                icon={<Video className="w-6 h-6" />}
                maxFiles={config.maxVideos}
                currentCount={productData.videos?.length || 0}
              />

              <div className="space-y-2">
                <Label htmlFor="videoUrl">Add Video URL</Label>
                <div className="flex gap-2">
                  <Select
                    value={newVideoType}
                    onValueChange={(value: "youtube" | "vimeo") =>
                      setNewVideoType(value)
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="vimeo">Vimeo</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    id="videoUrl"
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    placeholder="Video URL"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddVideoUrl}
                    disabled={!newVideoUrl.trim()}
                  >
                    Add
                  </Button>
                </div>
              </div>

              {productData.videos && productData.videos.length > 0 && (
                <div className="space-y-2">
                  {productData.videos.map((video, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <span className="text-sm">{video.title}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveVideo(index)}
                        aria-label={`Remove video ${index + 1}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 3D Models */}
          {config.max3DModels && (
            <Card>
              <CardHeader>
                <CardTitle>3D Models</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FileUploadZone
                  onFilesSelected={handle3DUpload}
                  accept=".glb,.gltf,.obj"
                  multiple
                  title="Upload 3D Models"
                  description="Drag and drop 3D model files (GLB, GLTF, OBJ)"
                  icon={<Box className="w-6 h-6" />}
                  maxFiles={config.max3DModels}
                  currentCount={productData.media3D?.length || 0}
                />

                {productData.media3D && productData.media3D.length > 0 && (
                  <div className="space-y-2">
                    {productData.media3D.map((model, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <span className="text-sm">
                          {model.type.toUpperCase()} Model {index + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove3D(index)}
                          aria-label={`Remove 3D model ${index + 1}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 360 Views */}
          {config.max360Views && (
            <Card>
              <CardHeader>
                <CardTitle>360° Views</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FileUploadZone
                  onFilesSelected={handle360Upload}
                  accept="image/*"
                  multiple
                  title="Upload 360° Images"
                  description="Drag and drop images for 360° view"
                  icon={<RotateCcw className="w-6 h-6" />}
                  maxFiles={config.max360Views}
                  currentCount={productData.views360?.length || 0}
                />

                {productData.views360 && productData.views360.length > 0 && (
                  <div className="space-y-2">
                    {productData.views360.map((view, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <span className="text-sm">{view.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove360View(index)}
                          aria-label={`Remove 360° view ${index + 1}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-4">
          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seoTitle">SEO Title</Label>
                <Input
                  id="seoTitle"
                  value={productData.seoTitle || ""}
                  onChange={(e) =>
                    handleInputChange("seoTitle", e.target.value)
                  }
                  placeholder="SEO optimized title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seoDescription">SEO Description</Label>
                <Textarea
                  id="seoDescription"
                  value={productData.seoDescription || ""}
                  onChange={(e) =>
                    handleInputChange("seoDescription", e.target.value)
                  }
                  placeholder="SEO optimized description"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Dimensions & Weight */}
          <Card>
            <CardHeader>
              <CardTitle>Dimensions & Weight</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
                    min="0"
                    value={productData.weight || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "weight",
                        parseFloat(e.target.value) || undefined
                      )
                    }
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="length">Length (cm)</Label>
                  <Input
                    id="length"
                    type="number"
                    step="0.01"
                    min="0"
                    value={productData.dimensions?.length || ""}
                    onChange={(e) =>
                      handleInputChange("dimensions", {
                        ...productData.dimensions,
                        length: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="width">Width (cm)</Label>
                  <Input
                    id="width"
                    type="number"
                    step="0.01"
                    min="0"
                    value={productData.dimensions?.width || ""}
                    onChange={(e) =>
                      handleInputChange("dimensions", {
                        ...productData.dimensions,
                        width: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.01"
                    min="0"
                    value={productData.dimensions?.height || ""}
                    onChange={(e) =>
                      handleInputChange("dimensions", {
                        ...productData.dimensions,
                        height: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0.00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Custom Attributes */}
          {attributes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Custom Attributes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {attributes.map((attribute) => (
                  <div key={attribute._id} className="space-y-2">
                    <Label htmlFor={`attr-${attribute._id}`}>
                      {attribute.value}
                    </Label>
                    <Input
                      id={`attr-${attribute._id}`}
                      value={productData.attributes?.[attribute.value] || ""}
                      onChange={(e) =>
                        handleAttributeChange(attribute.value, e.target.value)
                      }
                      placeholder={`Enter ${attribute.value.toLowerCase()}`}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Product Options */}
          <Card>
            <CardHeader>
              <CardTitle>Product Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={productData.featured}
                  onCheckedChange={(checked) =>
                    handleInputChange("featured", checked)
                  }
                />
                <Label htmlFor="featured">Featured Product</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => validateAndSubmit("draft")}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save as Draft
            </>
          )}
        </Button>
        <Button onClick={() => validateAndSubmit("active")} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Publish Product
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
