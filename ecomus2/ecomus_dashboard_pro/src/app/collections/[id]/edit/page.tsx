"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, X, Plus, Trash2 } from "lucide-react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import Link from "next/link";
import { Category, Product, Collection } from "@/types";

// Mock data for categories
const mockCategories: Category[] = [
  {
    id: "1",
    name: "Electronics",
    slug: "electronics",
    productCount: 245,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "Clothing",
    slug: "clothing",
    productCount: 189,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    name: "Home & Garden",
    slug: "home-garden",
    productCount: 156,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Mock data for products
const mockProducts: Product[] = [
  {
    id: "1",
    title: "iPhone 15 Pro",
    description: "Latest iPhone with advanced features",
    price: 999,
    originalPrice: 1099,
    images: ["/images/products/iphone-15-pro.jpg"],
    category: mockCategories[0],
    brand: "Apple",
    stock: 50,
    sku: "IPH15PRO",
    rating: 4.8,
    reviewCount: 124,
    tags: ["smartphone", "apple", "premium"],
    isActive: true,
    isFeatured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    title: "Samsung Galaxy S24",
    description: "Powerful Android smartphone",
    price: 899,
    originalPrice: 999,
    images: ["/images/products/galaxy-s24.jpg"],
    category: mockCategories[0],
    brand: "Samsung",
    stock: 30,
    sku: "GALS24",
    rating: 4.6,
    reviewCount: 89,
    tags: ["smartphone", "samsung", "android"],
    isActive: true,
    isFeatured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Mock collection data
const mockCollection: Collection = {
  id: "1",
  title: "Summer Collection 2024",
  slug: "summer-collection-2024",
  description: "Fresh and vibrant pieces for the summer season",
  image: "/images/collections/summer-2024.jpg",
  images: ["/images/collections/summer-2024.jpg", "/images/collections/summer-2024-2.jpg"],
  category: mockCategories[1],
  products: [mockProducts[0]],
  price: 299.99,
  originalPrice: 399.99,
  discount: 25,
  isFeatured: true,
  isActive: true,
  itemCount: 45,
  itemsCount: 45,
  createdAt: new Date("2024-01-15T10:30:00Z"),
  updatedAt: new Date("2024-01-20T14:45:00Z"),
};

interface FormData {
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  productIds: string[];
  price: string;
  originalPrice: string;
  discount: string;
  isFeatured: boolean;
  isActive: boolean;
  images: string[];
}

export default function EditCollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    slug: "",
    description: "",
    categoryId: "",
    productIds: [],
    price: "",
    originalPrice: "",
    discount: "",
    isFeatured: false,
    isActive: true,
    images: [],
  });

  // Load collection data
  useEffect(() => {
    const loadCollection = async () => {
      const { id } = await params;
      // In a real app, you would fetch the collection from your API
      // For now, we'll use mock data
      const collectionData = mockCollection;
      setCollection(collectionData);
      
      // Populate form with existing data
      setFormData({
        title: collectionData.title,
        slug: collectionData.slug,
        description: collectionData.description || "",
        categoryId: collectionData.category?.id || "",
        productIds: collectionData.products?.map(p => p.id) || [],
        price: collectionData.price?.toString() || "",
        originalPrice: collectionData.originalPrice?.toString() || "",
        discount: collectionData.discount?.toString() || "",
        isFeatured: collectionData.isFeatured,
        isActive: collectionData.isActive,
        images: collectionData.images || [],
      });
      
      // Set selected products
      setSelectedProducts(collectionData.products || []);
    };

    loadCollection();
  }, [params]);

  // Generate slug from title
  useEffect(() => {
    if (formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.title]);

  // Calculate discount when price changes
  useEffect(() => {
    if (formData.price && formData.originalPrice) {
      const price = parseFloat(formData.price);
      const originalPrice = parseFloat(formData.originalPrice);
      if (originalPrice > price) {
        const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
        setFormData((prev) => ({ ...prev, discount: discount.toString() }));
      }
    }
  }, [formData.price, formData.originalPrice]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleProductSelect = (product: Product) => {
    const isSelected = selectedProducts.some((p) => p.id === product.id);
    if (isSelected) {
      setSelectedProducts((prev) => prev.filter((p) => p.id !== product.id));
      setFormData((prev) => ({
        ...prev,
        productIds: prev.productIds.filter((id) => id !== product.id),
      }));
    } else {
      setSelectedProducts((prev) => [...prev, product]);
      setFormData((prev) => ({
        ...prev,
        productIds: [...prev.productIds, product.id],
      }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // In a real app, you would upload these files to a server
      // For now, we'll just create mock URLs
      const newImages = Array.from(files).map((file, index) => 
        `/images/collections/uploaded-${Date.now()}-${index}.jpg`
      );
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages],
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // In a real app, you would send this data to your API
      const collectionData = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : undefined,
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        discount: formData.discount ? parseInt(formData.discount) : undefined,
      };

      console.log("Updating collection:", collectionData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirect to collections list
      router.push("/collections");
    } catch (error) {
      console.error("Error updating collection:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this collection? This action cannot be undone.")) {
      return;
    }

    setDeleteLoading(true);

    try {
      // In a real app, you would send a DELETE request to your API
      console.log("Deleting collection:", collection?.id);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirect to collections list
      router.push("/collections");
    } catch (error) {
      console.error("Error deleting collection:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!collection) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading collection...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/collections">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Collections
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Edit Collection</h1>
              <p className="text-muted-foreground">
                Update your collection details and settings
              </p>
            </div>
          </div>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteLoading}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {deleteLoading ? "Deleting..." : "Delete Collection"}
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Collection Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter collection title"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      placeholder="collection-slug"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe your collection"
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="originalPrice">Original Price</Label>
                      <Input
                        id="originalPrice"
                        name="originalPrice"
                        type="number"
                        step="0.01"
                        value={formData.originalPrice}
                        onChange={handleInputChange}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="discount">Discount (%)</Label>
                      <Input
                        id="discount"
                        name="discount"
                        type="number"
                        value={formData.discount}
                        onChange={handleInputChange}
                        placeholder="0"
                        readOnly
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Images */}
              <Card>
                <CardHeader>
                  <CardTitle>Images</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="images">Upload Images</Label>
                    <div className="mt-2">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-4 text-gray-500" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG or WEBP (MAX. 800x400px)</p>
                        </div>
                        <input
                          id="images"
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>
                  </div>
                  {formData.images.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-3">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative">
                          <Image
                            src={image}
                            alt={`Collection image ${index + 1}`}
                            width={200}
                            height={150}
                            className="rounded-lg object-cover w-full h-32"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Products */}
              <Card>
                <CardHeader>
                  <CardTitle>Products ({selectedProducts.length} selected)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      {products.map((product) => {
                        const isSelected = selectedProducts.some((p) => p.id === product.id);
                        return (
                          <div
                            key={product.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                              isSelected
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => handleProductSelect(product)}
                          >
                            <div className="flex items-center space-x-3">
                              <Image
                                src={product.images[0] || "/images/placeholder-product.jpg"}
                                alt={product.title}
                                width={48}
                                height={48}
                                className="rounded object-cover"
                              />
                              <div className="flex-1">
                                <h4 className="font-medium">{product.title}</h4>
                                <p className="text-sm text-gray-500">${product.price}</p>
                              </div>
                              {isSelected && (
                                <div className="text-blue-500">
                                  <Plus className="h-5 w-5 rotate-45" />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Category */}
              <Card>
                <CardHeader>
                  <CardTitle>Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="categoryId">Select Category</Label>
                    <select
                      id="categoryId"
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </CardContent>
              </Card>

              {/* Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="isActive">Active</Label>
                      <p className="text-sm text-gray-500">Make this collection visible to customers</p>
                    </div>
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => handleSwitchChange("isActive", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="isFeatured">Featured</Label>
                      <p className="text-sm text-gray-500">Show this collection on homepage</p>
                    </div>
                    <Switch
                      id="isFeatured"
                      checked={formData.isFeatured}
                      onCheckedChange={(checked) => handleSwitchChange("isFeatured", checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Updating..." : "Update Collection"}
                    </Button>
                    <Button type="button" variant="outline" className="w-full" asChild>
                      <Link href="/collections">Cancel</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}