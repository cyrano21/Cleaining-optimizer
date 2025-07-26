"use client";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  DollarSign,
  TrendingUp,
  Users,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ReportPage() {
  // Données pour les graphiques
  const totalAmountData = [
    { name: "Jan", value: 24000 },
    { name: "Feb", value: 28000 },
    { name: "Mar", value: 32000 },
    { name: "Apr", value: 27000 },
    { name: "May", value: 35000 },
    { name: "Jun", value: 31000 },
    { name: "Jul", value: 38000 },
    { name: "Aug", value: 29000 },
    { name: "Sep", value: 34000 },
    { name: "Oct", value: 42000 },
    { name: "Nov", value: 36000 },
    { name: "Dec", value: 45000 },
  ];

  const revenueData = [
    { name: "Jan", value: 22000 },
    { name: "Feb", value: 26000 },
    { name: "Mar", value: 30000 },
    { name: "Apr", value: 25000 },
    { name: "May", value: 33000 },
    { name: "Jun", value: 29000 },
    { name: "Jul", value: 36000 },
    { name: "Aug", value: 27000 },
    { name: "Sep", value: 32000 },
    { name: "Oct", value: 40000 },
    { name: "Nov", value: 34000 },
    { name: "Dec", value: 43000 },
  ];

  const customerData = [
    { name: "Jan", value: 1200 },
    { name: "Feb", value: 1500 },
    { name: "Mar", value: 1800 },
    { name: "Apr", value: 1400 },
    { name: "May", value: 2000 },
    { name: "Jun", value: 1700 },
    { name: "Jul", value: 2200 },
    { name: "Aug", value: 1600 },
    { name: "Sep", value: 1900 },
    { name: "Oct", value: 2400 },
    { name: "Nov", value: 2100 },
    { name: "Dec", value: 2600 },
  ];

  const sellerStatsData = [
    { name: "Jan", value: 57 },
    { name: "Feb", value: 61 },
    { name: "Mar", value: 75 },
    { name: "Apr", value: 70 },
    { name: "May", value: 31 },
    { name: "Jun", value: 88 },
    { name: "Jul", value: 82 },
    { name: "Aug", value: 110 },
    { name: "Sep", value: 134 },
    { name: "Oct", value: 82 },
    { name: "Nov", value: 44 },
  ];

  const totalSaleData = [
    { name: "Jan", value: 45 },
    { name: "Feb", value: 85 },
    { name: "Mar", value: 125 },
    { name: "Apr", value: 65 },
    { name: "May", value: 45 },
    { name: "Jun", value: 95 },
    { name: "Jul", value: 155 },
    { name: "Aug", value: 125 },
    { name: "Sep", value: 75 },
    { name: "Oct", value: 105 },
    { name: "Nov", value: 85 },
  ];

  const saleReturnData = [
    { name: "12:00", jan01: 84, jan02: 82, jan03: 80 },
    { name: "13:00", jan01: 85, jan02: 83, jan03: 81 },
    { name: "14:00", jan01: 86, jan02: 84, jan03: 82 },
    { name: "15:00", jan01: 87, jan02: 85, jan03: 83 },
    { name: "16:00", jan01: 85, jan02: 83, jan03: 81 },
    { name: "17:00", jan01: 84, jan02: 82, jan03: 80 },
  ];

  const transferHistory = [
    {
      id: "11081197",
      name: "Kathryn Murphy",
      date: "Mar 20, 2023",
      total: "$2,700",
    },
    {
      id: "38766940",
      name: "Floyd Miles",
      date: "Mar 20, 2023",
      total: "$2,700",
    },
    {
      id: "43397744",
      name: "Brooklyn Simmons",
      date: "Mar 20, 2023",
      total: "$2,700",
    },
    {
      id: "66277431",
      name: "Wade Warren",
      date: "Mar 20, 2023",
      total: "$2,700",
    },
    {
      id: "58276066",
      name: "Devon Lane",
      date: "Mar 20, 2023",
      total: "$2,700",
    },
    {
      id: "93242854",
      name: "Jenny Wilson",
      date: "Mar 20, 2023",
      total: "$2,700",
    },
    {
      id: "11081197",
      name: "Jane Cooper",
      date: "Mar 20, 2023",
      total: "$2,700",
    },
    {
      id: "55700223",
      name: "Albert Flores",
      date: "Mar 20, 2023",
      total: "$2,700",
    },
    {
      id: "34034474",
      name: "Robert Fox",
      date: "Mar 20, 2023",
      total: "$2,700",
    },
    {
      id: "34034474",
      name: "Theresa Webb",
      date: "Mar 20, 2023",
      total: "$2,700",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-3xl font-bold tracking-tight"

            >
              Report
            </h1>
            <p className="text-gray-600 mt-1">
              Analyze your business performance and sales data
            </p>
          </div>
        </div>

        {/* Stats Cards avec graphiques */}
        <div
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"

        >
          <Card>
            <CardHeader
              className="flex flex-row items-center justify-between space-y-0 pb-2"

            >
              <CardTitle className="text-sm font-medium">
                Total Amount
              </CardTitle>
              <DollarSign
                className="h-4 w-4 text-muted-foreground"

              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                34,945
              </div>
              <div
                className="flex items-center text-xs text-green-600 mb-4"

              >
                <ArrowUpIcon className="mr-1 h-3 w-3" />
                1.56%
              </div>
              <div className="h-20">
                <ResponsiveContainer
                  width="100%"
                  height="100%"

                >
                  <AreaChart data={totalAmountData}>
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      fill="#93c5fd"
                      strokeWidth={1}

                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              className="flex flex-row items-center justify-between space-y-0 pb-2"

            >
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <TrendingUp
                className="h-4 w-4 text-muted-foreground"

              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                $37,802
              </div>
              <div
                className="flex items-center text-xs text-red-600 mb-4"

              >
                <ArrowDownIcon className="mr-1 h-3 w-3" />
                1.56%
              </div>
              <div className="h-20">
                <ResponsiveContainer
                  width="100%"
                  height="100%"

                >
                  <AreaChart data={revenueData}>
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#f97316"
                      fill="#fed7aa"
                      strokeWidth={1}

                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 lg:col-span-1">
            <CardHeader
              className="flex flex-row items-center justify-between space-y-0 pb-2"

            >
              <CardTitle className="text-sm font-medium">
                Total Customer
              </CardTitle>
              <Users
                className="h-4 w-4 text-muted-foreground"

              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                34,945
              </div>
              <div
                className="flex items-center text-xs text-muted-foreground mb-4"

              >
                0.00%
              </div>
              <div className="h-20">
                <ResponsiveContainer
                  width="100%"
                  height="100%"

                >
                  <AreaChart data={customerData}>
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#10b981"
                      fill="#a7f3d0"
                      strokeWidth={1}

                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seller Statistics avec graphique */}
        <Card>
          <CardHeader>
            <div
              className="flex items-center justify-between"

            >
              <CardTitle>Seller statistic</CardTitle>
              <Select defaultValue="30days">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30days">
                    Last 30 days
                  </SelectItem>
                  <SelectItem value="7days">
                    Last 7 days
                  </SelectItem>
                  <SelectItem value="90days">
                    Last 90 days
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Revenue
                  </p>
                  <p className="text-2xl font-bold">
                    $37,802
                  </p>
                  <div
                    className="flex items-center text-xs text-green-600"

                  >
                    <ArrowUpIcon className="mr-1 h-3 w-3" />
                    0.56%
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Profit
                  </p>
                  <p className="text-2xl font-bold">
                    $28,305
                  </p>
                  <div
                    className="flex items-center text-xs text-green-600"

                  >
                    <ArrowUpIcon className="mr-1 h-3 w-3" />
                    0.56%
                  </div>
                </div>
              </div>
              <div className="h-48">
                <ResponsiveContainer
                  width="100%"
                  height="100%"

                >
                  <BarChart data={sellerStatsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Sale avec graphique */}
        <Card>
          <CardHeader>
            <div
              className="flex items-center justify-between"

            >
              <CardTitle>Total sale</CardTitle>
              <Select defaultValue="30days">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30days">
                    Last 30 days
                  </SelectItem>
                  <SelectItem value="7days">
                    Last 7 days
                  </SelectItem>
                  <SelectItem value="90days">
                    Last 90 days
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Revenue
                  </p>
                  <p className="text-2xl font-bold">
                    $37,802
                  </p>
                  <div
                    className="flex items-center text-xs text-green-600"

                  >
                    <ArrowUpIcon className="mr-1 h-3 w-3" />
                    0.56%
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Profit
                  </p>
                  <p className="text-2xl font-bold">
                    $28,305
                  </p>
                  <div
                    className="flex items-center text-xs text-green-600"

                  >
                    <ArrowUpIcon className="mr-1 h-3 w-3" />
                    0.56%
                  </div>
                </div>
              </div>
              <div className="h-48">
                <ResponsiveContainer
                  width="100%"
                  height="100%"

                >
                  <BarChart data={totalSaleData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sale/Purchase Return avec graphique */}
        <Card>
          <CardHeader>
            <CardTitle>Sale / Purchase return</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-3xl font-bold">
                  $84.86B
                </p>
                <div
                  className="flex items-center text-xs text-green-600"

                >
                  <ArrowUpIcon className="mr-1 h-3 w-3" />
                  1.02%
                </div>
              </div>
              <div className="h-32">
                <ResponsiveContainer
                  width="100%"
                  height="100%"

                >
                  <LineChart data={saleReturnData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="jan01"
                      stroke="#f97316"
                      strokeWidth={2}
                      dot={false}

                    />

                    <Line
                      type="monotone"
                      dataKey="jan02"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      dot={false}

                    />

                    <Line
                      type="monotone"
                      dataKey="jan03"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}

                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div
                className="flex items-center gap-4 text-xs"

              >
                <div className="flex items-center gap-1">
                  <div
                    className="w-2 h-2 bg-orange-500 rounded"

                  ></div>
                  <span>Jan 01</span>
                </div>
                <div className="flex items-center gap-1">
                  <div
                    className="w-2 h-2 bg-cyan-500 rounded"

                  ></div>
                  <span>Jan 02</span>
                </div>
                <div className="flex items-center gap-1">
                  <div
                    className="w-2 h-2 bg-emerald-500 rounded"

                  ></div>
                  <span>Jan 03</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transfer History */}
        <Card>
          <CardHeader>
            <CardTitle>Transfer History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transfer Id</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transferHistory.map((transfer, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {transfer.id}
                      </TableCell>
                      <TableCell>{transfer.name}</TableCell>
                      <TableCell>{transfer.date}</TableCell>
                      <TableCell>{transfer.total}</TableCell>
                      <TableCell>
                        <div
                          className="flex items-center gap-2"

                        >
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"

                          >
                            <Eye
                              className="h-4 w-4 text-blue-600"

                            />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"

                          >
                            <Edit
                              className="h-4 w-4 text-green-600"

                            />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"

                          >
                            <Trash2
                              className="h-4 w-4 text-red-600"

                            />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div
              className="flex items-center justify-between space-x-2 py-4"

            >
              <div className="text-sm text-muted-foreground">
                Showing 10 to 16 in 30 records
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  1
                </Button>
                <Button variant="outline" size="sm">
                  2
                </Button>
                <Button variant="outline" size="sm">
                  3
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

