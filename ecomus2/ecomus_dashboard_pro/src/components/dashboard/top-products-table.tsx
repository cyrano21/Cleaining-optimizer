"use client";

import { useState, useMemo } from "react";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TopSeller {
  id: string;
  rank: string;
  name: string;
  username: string;
  revenue: number;
  sales: number;
}

const mockTopSellers: TopSeller[] = [
  {
    id: "1",
    rank: "#148",
    name: "Elon Musk",
    username: "@musk",
    revenue: 14437,
    sales: 1548,
  },
  {
    id: "2",
    rank: "#179",
    name: "Marie Clark",
    username: "@mclark",
    revenue: 8015,
    sales: 752,
  },
  {
    id: "3",
    rank: "#118",
    name: "James Mason",
    username: "@jamesM",
    revenue: 13989,
    sales: 875,
  },
  {
    id: "4",
    rank: "#101",
    name: "Jacob Jones",
    username: "@jones",
    revenue: 25916,
    sales: 4863,
  },
  {
    id: "5",
    rank: "#205",
    name: "Sarah Wilson",
    username: "@swilson",
    revenue: 12500,
    sales: 1200,
  },
  {
    id: "6",
    rank: "#156",
    name: "Michael Brown",
    username: "@mbrown",
    revenue: 9800,
    sales: 890,
  },
  {
    id: "7",
    rank: "#134",
    name: "Emma Davis",
    username: "@edavis",
    revenue: 15600,
    sales: 1650,
  },
  {
    id: "8",
    rank: "#167",
    name: "David Miller",
    username: "@dmiller",
    revenue: 11200,
    sales: 1100,
  },
  {
    id: "9",
    rank: "#189",
    name: "Lisa Anderson",
    username: "@landerson",
    revenue: 8900,
    sales: 780,
  },
  {
    id: "10",
    rank: "#143",
    name: "Robert Taylor",
    username: "@rtaylor",
    revenue: 14200,
    sales: 1450,
  },
];

interface TopProductsTableProps {
  className?: string;
}

export function TopProductsTable({ className }: TopProductsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "revenue" | "sales">("revenue");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [filterBy, setFilterBy] = useState<"all" | "high" | "medium" | "low">(
    "all",
  );

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = [...mockTopSellers];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (seller) =>
          seller.name.toLowerCase().includes(searchLower) ||
          seller.username.toLowerCase().includes(searchLower) ||
          seller.rank.toLowerCase().includes(searchLower),
      );
    }

    // Apply revenue filter
    if (filterBy !== "all") {
      filtered = filtered.filter((seller) => {
        if (filterBy === "high") return seller.revenue >= 15000;
        if (filterBy === "medium")
          return seller.revenue >= 10000 && seller.revenue < 15000;
        if (filterBy === "low") return seller.revenue < 10000;
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortBy) {
        case "name":
          aValue = a.name;
          bValue = b.name;
          break;
        case "revenue":
          aValue = a.revenue;
          bValue = b.revenue;
          break;
        case "sales":
          aValue = a.sales;
          bValue = b.sales;
          break;
        default:
          aValue = a.revenue;
          bValue = b.revenue;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortOrder === "asc"
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    return filtered;
  }, [searchTerm, sortBy, sortOrder, filterBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredAndSortedData.slice(
    startIndex,
    startIndex + pageSize,
  );

  const handleSort = (column: "name" | "revenue" | "sales") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  return (
    <Card className={className}>
      <CardHeader
        className="flex flex-row items-center justify-between space-y-0 pb-4"

      >
        <CardTitle className="text-xl font-semibold">
          Top Sellers
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="text-gray-600"

            >
              Profiles
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Profiles</DropdownMenuItem>
            <DropdownMenuItem>Country</DropdownMenuItem>
            <DropdownMenuItem>Product</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="px-0">
        {/* Filters */}
        <div className="px-6 pb-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"

              />

              <Input
                placeholder="Search sellers..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"

              />
            </div>

            {/* Revenue Filter */}
            <Select
              value={filterBy}
              onValueChange={(value: any) => {
                setFilterBy(value);
                setCurrentPage(1);
              }}

            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue
                  placeholder="Filter by revenue"

                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  All Revenue
                </SelectItem>
                <SelectItem value="high">
                  High ($15K+)
                </SelectItem>
                <SelectItem value="medium">
                  Medium ($10K-$15K)
                </SelectItem>
                <SelectItem value="low">
                  Low (&lt;$10K)
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Page Size */}
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(parseInt(value));
                setCurrentPage(1);
              }}

            >
              <SelectTrigger className="w-full sm:w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">
                  5
                </SelectItem>
                <SelectItem value="10">
                  10
                </SelectItem>
                <SelectItem value="25">
                  25
                </SelectItem>
                <SelectItem value="50">
                  50
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-gray-200">
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]"

                >
                  Rank
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"

                >
                  <button
                    onClick={() => handleSort("name")}
                    className="flex items-center hover:text-gray-700 transition-colors"

                  >
                    Profile
                    {sortBy === "name" && (
                      <span className="ml-1">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </button>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"

                >
                  <button
                    onClick={() => handleSort("revenue")}
                    className="flex items-center hover:text-gray-700 transition-colors"

                  >
                    Revenue
                    {sortBy === "revenue" && (
                      <span className="ml-1">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </button>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"

                >
                  <button
                    onClick={() => handleSort("sales")}
                    className="flex items-center hover:text-gray-700 transition-colors"

                  >
                    Sales
                    {sortBy === "sales" && (
                      <span className="ml-1">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody
              className="bg-white divide-y divide-gray-200"

            >
              {paginatedData.map((seller) => (
                <tr
                  key={seller.id}
                  className="hover:bg-gray-50 transition-colors"

                >
                  <td
                    className="px-6 py-4 whitespace-nowrap"

                  >
                    <strong
                      className="text-sm font-medium text-gray-900"

                    >
                      {seller.rank}
                    </strong>
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap"

                  >
                    <div className="flex items-center">
                      <div
                        className="flex-shrink-0 h-10 w-10"

                      >
                        <div
                          className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm"

                        >
                          {seller.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                      </div>
                      <div className="ml-4">
                        <h6
                          className="text-sm font-medium text-gray-900"

                        >
                          {seller.name}
                        </h6>
                        <p
                          className="text-sm text-gray-500 mb-0"

                        >
                          {seller.username}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap"

                  >
                    <strong
                      className="text-sm font-medium text-gray-900"

                    >
                      {formatCurrency(seller.revenue)}
                    </strong>
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"

                  >
                    {formatNumber(seller.sales)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            className="px-6 py-4 flex items-center justify-between border-t border-gray-200"

          >
            <div
              className="flex items-center text-sm text-gray-700"

            >
              Showing {startIndex + 1} to{" "}
              {Math.min(startIndex + pageSize, filteredAndSortedData.length)} of{" "}
              {filteredAndSortedData.length} results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}

              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-8 h-8 p-0"

                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}

              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* No results */}
        {paginatedData.length === 0 && (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-500">
              No sellers found matching your criteria.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
