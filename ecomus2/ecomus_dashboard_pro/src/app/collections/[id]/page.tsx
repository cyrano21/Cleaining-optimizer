"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit, Trash2, Eye, ExternalLink, Package, Tag, Calendar, DollarSign } from "lucide-react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  {
    id: "3",
    title: "MacBook Pro 16",
    description: "Professional laptop for creators",
    price: 2499,
    originalPrice: 2699,
    images: ["/images/products/macbook-pro-16.jpg"],
    category: mockCategories[0],
    brand: "Apple",
    stock: 15,
    sku: "MBP16",
    rating: 4.9,
    reviewCount: 67,
    tags: ["laptop", "apple", "professional"],
    isActive: true,
    isFeatured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Mock collection data
const mockCollection: Collection = {
  id: "1",
  title: "Summer Collection 2024",
  slug: "summer-collection-2024",
  description: "Fresh and vibrant pieces for the summer season. This collection features the latest trends in technology and fashion, carefully curated to bring you the best products for the warm weather. From lightweight electronics to breathable fabrics, everything you need for a perfect summer.",
  image: "/images/collections/summer-2024.jpg",
  images: [
    "/images/collections/summer-2024.jpg", 
    "/images/collections/summer-2024-2.jpg",
    "/images/collections/summer-2024-3.jpg"
  ],
  category: mockCategories[1],
  products: mockProducts,
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

function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
            <Image
              src={product.images[0] || "/images/placeholder-product.jpg"}
              alt={product.title}
              width={64}
              height={64}
              className="rounded-lg object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/images/placeholder-product.jpg";
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">{product.title}</h4>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.description}</p>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-green-600">${product.price}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xs text-gray-400 line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>
              <Badge variant={product.isActive ? "default" : "secondary"} className="text-xs">
                {product.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CollectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [collection, setCollection] = useState<Collection | null>(null);

  // Load collection data
  useEffect(() => {
    const loadCollection = async () => {
      const { id } = await params;
      setLoading(true);
      
      try {
        // In a real app, you would fetch the collection from your API
        // For now, we'll use mock data
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call
        setCollection(mockCollection);
      } catch (error) {
        console.error("Error loading collection:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCollection();
  }, [params]);

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

  if (loading) {
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

  if (!collection) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-gray-900">Collection not found</h2>
          <p className="text-gray-600 mt-2">The collection you're looking for doesn't exist.</p>
          <Link href="/collections">
            <Button className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Collections
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  const getFeaturedColor = (isFeatured: boolean) => {
    return isFeatured
      ? "bg-blue-100 text-blue-800"
      : "bg-gray-100 text-gray-800";
  };

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
              <h1 className="text-3xl font-bold tracking-tight">{collection.title}</h1>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className={getStatusColor(collection.isActive)}>
                  {collection.isActive ? "Active" : "Inactive"}
                </Badge>
                {collection.isFeatured && (
                  <Badge className={getFeaturedColor(collection.isFeatured)}>
                    Featured
                  </Badge>
                )}
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-500">
                  Created {collection.createdAt.toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Link href={`/collections/${collection.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Collection Images */}
            {collection.images && collection.images.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {collection.images.map((image, index) => (
                      <div key={index} className="relative">
                        <Image
                          src={image}
                          alt={`${collection.title} image ${index + 1}`}
                          width={200}
                          height={150}
                          className="rounded-lg object-cover w-full h-32"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/images/placeholder-collection.jpg";
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {collection.description || "No description available."}
                </p>
              </CardContent>
            </Card>

            {/* Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Products ({collection.products?.length || 0})</span>
                  <Button variant="outline" size="sm">
                    <Package className="h-4 w-4 mr-2" />
                    Manage Products
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {collection.products && collection.products.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {collection.products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No products in this collection yet.</p>
                    <Button className="mt-4" size="sm">
                      Add Products
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Total Items</span>
                  </div>
                  <span className="font-medium">{collection.itemCount || 0}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Collection Price</span>
                  </div>
                  <span className="font-medium">
                    {collection.price ? `$${collection.price}` : "N/A"}
                  </span>
                </div>
                {collection.originalPrice && collection.originalPrice > (collection.price || 0) && (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Tag className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Original Price</span>
                      </div>
                      <span className="text-sm text-gray-400 line-through">
                        ${collection.originalPrice}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Tag className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Discount</span>
                      </div>
                      <span className="font-medium text-green-600">
                        {collection.discount}% OFF
                      </span>
                    </div>
                  </>
                )}
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Last Updated</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {collection.updatedAt.toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Category */}
            {collection.category && (
              <Card>
                <CardHeader>
                  <CardTitle>Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Tag className="h-5 w-5 text-gray-500" />
                    </div>
                    <div>
                      <h4 className="font-medium">{collection.category.name}</h4>
                      <p className="text-sm text-gray-500">
                        {collection.category.productCount} products
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Collection Details */}
            <Card>
              <CardHeader>
                <CardTitle>Collection Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Slug</Label>
                  <p className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">
                    {collection.slug}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">ID</Label>
                  <p className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">
                    {collection.id}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Created</Label>
                  <p className="text-sm text-gray-900">
                    {collection.createdAt.toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Updated</Label>
                  <p className="text-sm text-gray-900">
                    {collection.updatedAt.toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button className="w-full" variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on Store
                  </Button>
                  <Link href={`/collections/${collection.id}/edit`}>
                    <Button className="w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Collection
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}