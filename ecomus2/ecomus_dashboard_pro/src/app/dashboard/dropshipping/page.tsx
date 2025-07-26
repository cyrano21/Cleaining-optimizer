"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useDropshippingSuppliers,
  useDropshippingProducts,
  useDropshippingOrders,
  useDropshippingStats,
} from "@/hooks/useDropshipping";
import {
  Package,
  Truck,
  TrendingUp,
  Plus,
  Settings,
  Eye,
  Edit,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Clock,
  Globe,
  Star,
  Users,
  ShoppingCart,
  Loader2,
  RefreshCw,
} from "lucide-react";

export default function DropshippingPage() {
  // States for filters and pagination
  const [supplierFilters] = useState({
    status: "",
    country: "",
    search: "",
    page: 1,
    limit: 10,
  });

  const [productFilters] = useState({
    supplier: "",
    status: "",
    search: "",
    page: 1,
    limit: 10,
  });

  const [orderFilters] = useState({
    status: "",
    supplier: "",
    page: 1,
    limit: 10,
  });

  // Hooks for API data
  const {
    suppliers,
    loading: suppliersLoading,
    error: suppliersError,
    connectSupplier,
  } = useDropshippingSuppliers(supplierFilters);

  const {
    products,
    loading: productsLoading,
    error: productsError,
    importProducts,
  } = useDropshippingProducts(productFilters);

  const {
    orders,
    loading: ordersLoading,
    error: ordersError,
    syncOrder,
  } = useDropshippingOrders(orderFilters);

  const {
    stats,
    loading: statsLoading,
    error: statsError,
  } = useDropshippingStats();

  // States for modals and forms
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<string>("");
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    country: "",
    website: "",
    description: "",
    commission: 0,
    shippingTime: "",
    minOrder: 1,
    categories: [],
    apiCredentials: {
      apiKey: "",
      apiSecret: "",
      endpoint: "",
    },
  });

  // Event handlers
  const handleAddSupplier = async () => {
    try {
      await connectSupplier(newSupplier);
      setIsSupplierModalOpen(false);
      setNewSupplier({
        name: "",
        country: "",
        website: "",
        description: "",
        commission: 0,
        shippingTime: "",
        minOrder: 1,
        categories: [],
        apiCredentials: {
          apiKey: "",
          apiSecret: "",
          endpoint: "",
        },
      });
    } catch (error) {
      console.error("Error when adding supplier:", error);
    }
  };

  const handleSyncOrder = async (orderId: string) => {
    try {
      await syncOrder(orderId);
    } catch (error) {
      console.error("Error when syncing order:", error);
    }
  };

  // Error handling
  if (suppliersError || productsError || ordersError || statsError) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span>Error loading dropshipping data</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Function to format currencies
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Function to format numbers
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "inactive":
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Inactive
          </Badge>
        );
      case "out_of_stock":
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Out of Stock
          </Badge>
        );
      case "draft":
        return (
          <Badge className="bg-gray-100 text-gray-800">
            <Clock className="w-3 h-3 mr-1" />
            Draft
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dropshipping</h1>
          <p className="text-muted-foreground">
            Manage your dropshipping suppliers and products
          </p>
        </div>
        <Dialog
          open={isSupplierModalOpen}
          onOpenChange={setIsSupplierModalOpen}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Supplier Configuration</DialogTitle>
              <DialogDescription>
                Add a new dropshipping supplier to your network.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Supplier Name</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Electronics World"
                    value={newSupplier.name || ""}
                    onChange={(e) =>
                      setNewSupplier({ ...newSupplier, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    placeholder="Ex: United States"
                    value={newSupplier.country || ""}
                    onChange={(e) =>
                      setNewSupplier({
                        ...newSupplier,
                        country: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="commission">Commission (%)</Label>
                  <Input
                    id="commission"
                    type="number"
                    placeholder="10"
                    value={newSupplier.commission || ""}
                    onChange={(e) =>
                      setNewSupplier({
                        ...newSupplier,
                        commission: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shipping">Delivery Time</Label>
                  <Input
                    id="shipping"
                    placeholder="7-14 days"
                    value={newSupplier.shippingTime || ""}
                    onChange={(e) =>
                      setNewSupplier({
                        ...newSupplier,
                        shippingTime: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  placeholder="https://..."
                  value={newSupplier.website || ""}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, website: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Supplier description..."
                  value={newSupplier.description || ""}
                  onChange={(e) =>
                    setNewSupplier({
                      ...newSupplier,
                      description: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsSupplierModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddSupplier}>Add Supplier</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Suppliers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Loading...
                </span>
              </div>
            ) : (
              <React.Fragment>
                <div className="text-2xl font-bold">
                  {formatNumber(stats.totalSuppliers)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Connected suppliers
                </p>
              </React.Fragment>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Dropshipping Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Loading...
                </span>
              </div>
            ) : (
              <React.Fragment>
                <div className="text-2xl font-bold">
                  {formatNumber(stats.totalProducts)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Imported products
                </p>
              </React.Fragment>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Dropshipping Orders
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Loading...
                </span>
              </div>
            ) : (
              <React.Fragment>
                <div className="text-2xl font-bold">
                  {formatNumber(stats.totalOrders)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Processed orders
                </p>
              </React.Fragment>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Loading...
                </span>
              </div>
            ) : (
              <React.Fragment>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.totalRevenue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Dropshipping revenue
                </p>
              </React.Fragment>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="suppliers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Suppliers</CardTitle>
              <CardDescription>
                Manage your dropshipping supplier network
              </CardDescription>
            </CardHeader>
            <CardContent>
              {suppliersLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading suppliers...</span>
                </div>
              ) : suppliers.length === 0 ? (
                <div className="text-center p-8">
                  <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No suppliers
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Connect your first supplier to get started
                  </p>
                  <Button onClick={() => setIsSupplierModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Connect a supplier
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Products</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Delivery Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliers.map((supplier) => (
                      <TableRow key={supplier._id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="font-medium">{supplier.name}</div>
                              {supplier.website && (
                                <a
                                  href={supplier.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                                >
                                  <Globe className="w-3 h-3" />
                                  Website
                                </a>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{supplier.country}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            {supplier.rating.toFixed(1)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatNumber(
                            supplier.products || supplier.totalProducts || 0
                          )}
                        </TableCell>
                        <TableCell>{supplier.commission}%</TableCell>
                        <TableCell>{supplier.shippingTime}</TableCell>
                        <TableCell>{getStatusBadge(supplier.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedSupplier(supplier._id)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedSupplier(supplier._id);
                              }}
                            >
                              <Settings className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dropshipping Products</CardTitle>
              <CardDescription>
                Manage your products imported from suppliers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading products...</span>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center p-8">
                  <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No products
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Import your first products from your suppliers
                  </p>
                  <Button onClick={() => {}} disabled={suppliers.length === 0}>
                    <Plus className="w-4 h-4 mr-2" />
                    Import products
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Margin</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Image
                              src={
                                product.image ||
                                product.productInfo?.images?.[0] ||
                                "/placeholder-product.jpg"
                              }
                              alt={
                                product.title ||
                                product.productInfo?.name ||
                                "Product"
                              }
                              width={40}
                              height={40}
                              className="rounded object-cover"
                            />
                            <div>
                              <div className="font-medium">
                                {product.title ||
                                  product.productInfo?.name ||
                                  "Product"}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {product.category}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{product.supplier || "N/A"}</TableCell>
                        <TableCell>
                          {formatCurrency(product.price || 0)}
                        </TableCell>
                        <TableCell>{product.margin || 0}%</TableCell>
                        <TableCell>
                          {formatNumber(product.stock || 0)}
                        </TableCell>
                        <TableCell>
                          {formatNumber(product.orders || 0)}
                        </TableCell>
                        <TableCell>{getStatusBadge(product.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open("#", "_blank")}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open("#", "_blank")}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dropshipping Orders</CardTitle>
              <CardDescription>
                Track orders for your dropshipping products
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading orders...</span>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <Truck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No dropshipping orders
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Orders for your dropshipping products will appear here.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {}}
                    disabled={suppliers.length === 0}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Import products
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell>
                          <div className="font-medium">
                            #{order.orderId || order._id.slice(-6)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Customer
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Image
                              src={
                                order.productInfo?.image ||
                                "/placeholder-product.jpg"
                              }
                              alt={order.productInfo?.name || "Product"}
                              width={32}
                              height={32}
                              className="rounded object-cover"
                            />
                            <div>
                              <div className="font-medium text-sm">
                                {order.productInfo?.name || "Product"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{order.supplier || "N/A"}</TableCell>
                        <TableCell>{order.quantity}</TableCell>
                        <TableCell>
                          {formatCurrency(order.totalAmount || 0)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(order.dropshippingStatus)}
                        </TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-US"
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSyncOrder(order._id)}
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
