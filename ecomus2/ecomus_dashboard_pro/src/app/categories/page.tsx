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

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
  status: "active" | "inactive";
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

// real data for categories
const real: Category[] = [
  {
    id: "1",
    name: "Electronics",
    description: "Electronic devices and accessories",
    image: "/images/categories/electronics.jpg",
    productCount: 245,
    status: "active",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-20T14:45:00Z",
  },
  {
    id: "2",
    name: "Clothing",
    description: "Fashion and apparel for all ages",
    image: "/images/categories/clothing.jpg",
    productCount: 189,
    status: "active",
    createdAt: "2024-01-10T09:15:00Z",
    updatedAt: "2024-01-18T16:20:00Z",
  },
  {
    id: "3",
    name: "Home & Garden",
    description: "Home improvement and garden supplies",
    image: "/images/categories/home-garden.jpg",
    productCount: 156,
    status: "active",
    createdAt: "2024-01-12T11:45:00Z",
    updatedAt: "2024-01-19T13:30:00Z",
  },
  {
    id: "4",
    name: "Sports & Outdoors",
    description: "Sports equipment and outdoor gear",
    image: "/images/categories/sports.jpg",
    productCount: 98,
    status: "active",
    createdAt: "2024-01-08T08:20:00Z",
    updatedAt: "2024-01-17T12:10:00Z",
  },
  {
    id: "5",
    name: "Books",
    description: "Books and educational materials",
    image: "/images/categories/books.jpg",
    productCount: 67,
    status: "inactive",
    createdAt: "2024-01-05T15:30:00Z",
    updatedAt: "2024-01-16T10:45:00Z",
  },
  {
    id: "6",
    name: "Beauty & Health",
    description: "Beauty products and health supplements",
    image: "/images/categories/beauty.jpg",
    productCount: 134,
    status: "active",
    createdAt: "2024-01-14T12:15:00Z",
    updatedAt: "2024-01-21T09:30:00Z",
  },
];

function CategoryCard({ category }: { category: Category }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div
          className="flex items-start justify-between mb-4"

        >
          <div className="flex items-center space-x-4">
            <div
              className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center"

            >
              <Image
                src={category.image}
                alt={category.name}
                width={64}
                height={64}
                className="rounded-lg object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/placeholder-category.jpg";
                }}

              />
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {category.name}
              </h3>
              <p className="text-gray-600 text-sm">
                {category.description}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                {category.productCount} products
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge
              className={getStatusColor(category.status)}

            >
              {category.status}
            </Badge>
            <div className="relative">
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div
          className="flex items-center justify-between pt-4 border-t"

        >
          <div className="text-xs text-gray-500">
            Created: {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'Non disponible'}
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

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(real);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [filteredCategories, setFilteredCategories] =
    useState<Category[]>(real);

  useEffect(() => {
    filterCategories();
  }, [searchTerm, statusFilter, categories]);

  const filterCategories = () => {
    let filtered = [...categories];

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (category) =>
          category.name.toLowerCase().includes(searchLower) ||
          category.description.toLowerCase().includes(searchLower),
      );
    }

    // Filter by status
    if (statusFilter) {
      filtered = filtered.filter(
        (category) => category.status === statusFilter,
      );
    }

    setFilteredCategories(filtered);
  };

  const totalCategories = categories.length;
  const activeCategories = categories.filter(
    (c) => c.status === "active",
  ).length;
  const inactiveCategories = categories.filter(
    (c) => c.status === "inactive",
  ).length;
  const totalProducts = categories.reduce((sum, c) => sum + c.productCount, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-3xl font-bold tracking-tight"

            >
              Categories
            </h1>
            <p className="text-gray-600">
              Manage your product categories
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>

        {/* Stats Cards */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"

        >
          <Card>
            <CardContent className="p-6">
              <div
                className="flex items-center justify-between"

              >
                <div>
                  <p
                    className="text-sm font-medium text-gray-600"

                  >
                    Total Categories
                  </p>
                  <p className="text-2xl font-bold">
                    {totalCategories}
                  </p>
                </div>
                <div
                  className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center"

                >
                  <div
                    className="h-4 w-4 bg-blue-600 rounded"

                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div
                className="flex items-center justify-between"

              >
                <div>
                  <p
                    className="text-sm font-medium text-gray-600"

                  >
                    Active Categories
                  </p>
                  <p className="text-2xl font-bold">
                    {activeCategories}
                  </p>
                </div>
                <div
                  className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center"

                >
                  <div
                    className="h-4 w-4 bg-green-600 rounded"

                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div
                className="flex items-center justify-between"

              >
                <div>
                  <p
                    className="text-sm font-medium text-gray-600"

                  >
                    Inactive Categories
                  </p>
                  <p className="text-2xl font-bold">
                    {inactiveCategories}
                  </p>
                </div>
                <div
                  className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center"

                >
                  <div
                    className="h-4 w-4 bg-red-600 rounded"

                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div
                className="flex items-center justify-between"

              >
                <div>
                  <p
                    className="text-sm font-medium text-gray-600"

                  >
                    Total Products
                  </p>
                  <p className="text-2xl font-bold">
                    {totalProducts}
                  </p>
                </div>
                <div
                  className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center"

                >
                  <div
                    className="h-4 w-4 bg-purple-600 rounded"

                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"

                />

                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"

                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

              >
                <option value="">
                  All Status
                </option>
                <option value="active">
                  Active
                </option>
                <option value="inactive">
                  Inactive
                </option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Categories Grid */}
        {loading ? (
          <div
            className="flex items-center justify-center py-12"

          >
            <div
              className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"

            ></div>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"

          >
            {filteredCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}

              />
            ))}
          </div>
        )}

        {filteredCategories.length === 0 && !loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500">
                No categories found matching your criteria.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

