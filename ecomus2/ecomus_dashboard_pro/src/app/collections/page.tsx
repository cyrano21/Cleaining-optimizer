"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Eye, MoreHorizontal } from "lucide-react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { Collection } from "@/types";

// Mock data for collections
const mockCollections: Collection[] = [
  {
    id: "1",
    title: "Summer Collection 2024",
    slug: "summer-collection-2024",
    description: "Fresh and vibrant pieces for the summer season",
    image: "/images/collections/summer-2024.jpg",
    images: ["/images/collections/summer-2024.jpg", "/images/collections/summer-2024-2.jpg"],
    price: 299.99,
    originalPrice: 399.99,
    discount: 25,
    isFeatured: true,
    isActive: true,
    itemCount: 45,
    itemsCount: 45,
    createdAt: new Date("2024-01-15T10:30:00Z"),
    updatedAt: new Date("2024-01-20T14:45:00Z"),
  },
  {
    id: "2",
    title: "Winter Essentials",
    slug: "winter-essentials",
    description: "Cozy and warm items for the cold season",
    image: "/images/collections/winter-essentials.jpg",
    images: ["/images/collections/winter-essentials.jpg"],
    price: 199.99,
    originalPrice: 249.99,
    discount: 20,
    isFeatured: false,
    isActive: true,
    itemCount: 32,
    itemsCount: 32,
    createdAt: new Date("2024-01-10T09:15:00Z"),
    updatedAt: new Date("2024-01-18T16:20:00Z"),
  },
  {
    id: "3",
    title: "Tech Gadgets Pro",
    slug: "tech-gadgets-pro",
    description: "Professional grade technology and gadgets",
    image: "/images/collections/tech-gadgets.jpg",
    images: ["/images/collections/tech-gadgets.jpg"],
    price: 599.99,
    originalPrice: 699.99,
    discount: 15,
    isFeatured: true,
    isActive: true,
    itemCount: 28,
    itemsCount: 28,
    createdAt: new Date("2024-01-12T11:45:00Z"),
    updatedAt: new Date("2024-01-19T13:30:00Z"),
  },
  {
    id: "4",
    title: "Home Decor Luxury",
    slug: "home-decor-luxury",
    description: "Premium home decoration items",
    image: "/images/collections/home-decor.jpg",
    images: ["/images/collections/home-decor.jpg"],
    price: 149.99,
    isFeatured: false,
    isActive: false,
    itemCount: 18,
    itemsCount: 18,
    createdAt: new Date("2024-01-08T08:20:00Z"),
    updatedAt: new Date("2024-01-17T12:10:00Z"),
  },
];

function CollectionCard({ collection }: { collection: Collection }) {
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
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
              <Image
                src={collection.image || "/images/placeholder-collection.jpg"}
                alt={collection.title}
                width={64}
                height={64}
                className="rounded-lg object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/placeholder-collection.jpg";
                }}
              />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{collection.title}</h3>
              <p className="text-gray-600 text-sm">{collection.description}</p>
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-gray-500 text-xs">
                  {collection.itemCount} items
                </p>
                {collection.price && (
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-medium text-green-600">
                      ${collection.price}
                    </span>
                    {collection.originalPrice && (
                      <span className="text-xs text-gray-400 line-through">
                        ${collection.originalPrice}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(collection.isActive)}>
              {collection.isActive ? "Active" : "Inactive"}
            </Badge>
            {collection.isFeatured && (
              <Badge className={getFeaturedColor(collection.isFeatured)}>
                Featured
              </Badge>
            )}
            <div className="relative">
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-xs text-gray-500">
            Created: {collection.createdAt.toLocaleDateString()}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>(mockCollections);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [featuredFilter, setFeaturedFilter] = useState("");
  const [filteredCollections, setFilteredCollections] =
    useState<Collection[]>(mockCollections);

  useEffect(() => {
    filterCollections();
  }, [searchTerm, statusFilter, featuredFilter, collections]);

  const filterCollections = () => {
    let filtered = [...collections];

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (collection) =>
          collection.title.toLowerCase().includes(searchLower) ||
          collection.description?.toLowerCase().includes(searchLower) ||
          collection.slug.toLowerCase().includes(searchLower)
      );
    }

    // Filter by status
    if (statusFilter) {
      if (statusFilter === "active") {
        filtered = filtered.filter((collection) => collection.isActive);
      } else if (statusFilter === "inactive") {
        filtered = filtered.filter((collection) => !collection.isActive);
      }
    }

    // Filter by featured
    if (featuredFilter) {
      if (featuredFilter === "featured") {
        filtered = filtered.filter((collection) => collection.isFeatured);
      } else if (featuredFilter === "not-featured") {
        filtered = filtered.filter((collection) => !collection.isFeatured);
      }
    }

    setFilteredCollections(filtered);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const handleFeaturedFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFeaturedFilter(e.target.value);
  };

  const totalCollections = collections.length;
  const activeCollections = collections.filter((c) => c.isActive).length;
  const featuredCollections = collections.filter((c) => c.isFeatured).length;
  const totalItems = collections.reduce((sum, c) => sum + (c.itemCount || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Collections</h1>
            <p className="text-muted-foreground">
              Manage your product collections and curated sets
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Collection
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Collections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCollections}</div>
              <p className="text-xs text-muted-foreground">
                All collections in system
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Collections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCollections}</div>
              <p className="text-xs text-muted-foreground">
                Currently visible to customers
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Featured Collections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{featuredCollections}</div>
              <p className="text-xs text-muted-foreground">
                Highlighted on homepage
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalItems}</div>
              <p className="text-xs text-muted-foreground">
                Items across all collections
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Collections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search collections..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <select
                  value={statusFilter}
                  onChange={handleStatusFilter}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="w-full md:w-48">
                <select
                  value={featuredFilter}
                  onChange={handleFeaturedFilter}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Featured</option>
                  <option value="featured">Featured</option>
                  <option value="not-featured">Not Featured</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Collections Grid */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading collections...</p>
              </div>
            </div>
          ) : filteredCollections.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <p className="text-gray-500">No collections found.</p>
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Create your first collection
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCollections.map((collection) => (
                <CollectionCard key={collection.id} collection={collection} />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}