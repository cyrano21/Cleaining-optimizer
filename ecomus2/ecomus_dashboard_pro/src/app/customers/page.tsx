"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Search,
  Filter,
  UserPlus,
  Mail,
  Phone,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types";
import { formatDate, getInitials } from "@/lib/utils";
import Link from "next/link";

// Hook pour charger les données clients via API
const useCustomersData = () => {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/customers");
        const data = await response.json();
        
        if (data.success) {
          setCustomers(data.customers || []);
        } else {
          setError(data.message || "Erreur lors du chargement des clients");
        }
      } catch (err) {
        setError("Erreur de connexion");
        console.error("Error fetching customers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);
  return { customers, loading, error, setCustomers };
};

export default function CustomersPage() {
  const { customers, loading, error, setCustomers } = useCustomersData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState<User[]>([]);

  useEffect(() => {
    let filtered = [...customers];

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (customer) =>
          customer.firstName?.toLowerCase().includes(searchLower) ||
          customer.lastName?.toLowerCase().includes(searchLower) ||
          customer.email.toLowerCase().includes(searchLower) ||
          customer.phone?.toLowerCase().includes(searchLower),
      );
    }

    // Filter by status
    if (statusFilter) {
      filtered = filtered.filter(
        (customer) => customer.status === statusFilter,
      );
    }

    setFilteredCustomers(filtered);
  }, [customers, searchTerm, statusFilter]);

  const getStatusVariant = (status: string | undefined) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "secondary";
      case "suspended":
        return "destructive";
      default:
        return "outline";
    }
  };

  const CustomerCard = ({ customer }: { customer: User }) => {
    const fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
    const initials = getInitials(fullName);

    return (
      <Card
        className="hover:shadow-md transition-shadow duration-200"

      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"

              >
                {customer.avatar ? (
                  <Image
                    src={customer.avatar}
                    alt={fullName}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"

                  />
                ) : (
                  <span
                    className="text-sm font-medium text-primary"

                  >
                    {initials}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  {fullName}
                </h3>
                <div
                  className="flex items-center gap-2 text-sm text-muted-foreground mt-1"

                >
                  <Mail className="h-4 w-4" />
                  <span>{customer.email}</span>
                </div>
                {customer.phone && (
                  <div
                    className="flex items-center gap-2 text-sm text-muted-foreground mt-1"

                  >
                    <Phone className="h-4 w-4" />
                    <span>{customer.phone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant={getStatusVariant(customer.status)}

              >
                {customer.status || 'unknown'}
              </Badge>
              <Button size="sm" variant="outline">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">
                  Joined:
                </span>
                <div className="font-medium">
                  {formatDate(customer.createdAt)}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">
                  Last Login:
                </span>
                <div className="font-medium">
                  {customer.lastLoginAt
                    ? formatDate(customer.lastLoginAt)
                    : "Never"}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">
                  Email Status:
                </span>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={customer.emailVerified ? "success" : "warning"}

                  >
                    {customer.emailVerified ? "Verified" : "Unverified"}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">
                  Role:
                </span>
                <div className="font-medium capitalize">
                  {customer.role}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button asChild size="sm" className="flex-1">
              <Link href={`/customers/${customer.id}`}>
                View Profile
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="flex-1"

            >
              <Link
                href={`/customers/${customer.id}/orders`}

              >
                View Orders
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };
  return (
    <div className="space-y-6">
      {/* États de chargement et d'erreur */}
      {loading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      )}
      
      {error && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-500 mb-2">❌ Erreur</div>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Customers
              </h1>
              <p className="text-muted-foreground">
                Manage your customer base and relationships ({customers.length} clients)
              </p>
            </div>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>

        {/* Stats Cards */}
        <div
          className="grid grid-cols-1 md:grid-cols-4 gap-4"

        >
          <Card>
            <CardHeader
              className="flex flex-row items-center justify-between space-y-0 pb-2"

            >
              <CardTitle className="text-sm font-medium">
                Total Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {customers.length}
              </div>
              <p className="text-xs text-muted-foreground">
                +8% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              className="flex flex-row items-center justify-between space-y-0 pb-2"

            >
              <CardTitle className="text-sm font-medium">
                Active Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {customers.filter((c) => c.status === "active").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              className="flex flex-row items-center justify-between space-y-0 pb-2"

            >
              <CardTitle className="text-sm font-medium">
                Verified Emails
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {customers.filter((c) => c.emailVerified).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Email verified
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              className="flex flex-row items-center justify-between space-y-0 pb-2"

            >
              <CardTitle className="text-sm font-medium">
                New This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  customers.filter((c) => {
                    const now = new Date();
                    const customerDate = new Date(c.createdAt);
                    return (
                      customerDate.getMonth() === now.getMonth() &&
                      customerDate.getFullYear() === now.getFullYear()
                    );
                  }).length
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Joined this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"

                />

                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"

                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                aria-label="Filtrer par statut"

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
                <option value="suspended">
                  Suspended
                </option>
              </select>

              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Customers Grid */}
        {loading ? (
          <div
            className="flex items-center justify-center h-64"

          >
            <div
              className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"

            ></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"

            >
              {filteredCustomers.map((customer) => (
                <CustomerCard
                  key={customer.id}
                  customer={customer}

                />
              ))}
            </div>

            {filteredCustomers.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">
                    No customers found.
                  </p>                  <Button className="mt-4">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Your First Customer
                  </Button>
                </CardContent>
              </Card>            )}
          </div>
        )}
        </>
      )}
    </div>
  );
}
