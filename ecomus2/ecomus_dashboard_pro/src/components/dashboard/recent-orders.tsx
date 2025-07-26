import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";

export interface Order {
  id: string;
  customer: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: string;
  createdAt?: string;
}

const recentOrders: Order[] = [
  {
    id: "#ORD-001",
    customer: "John Doe",
    date: "2024-01-15",
    status: "delivered",
    total: "$299.99",
  },
  {
    id: "#ORD-002",
    customer: "Jane Smith",
    date: "2024-01-14",
    status: "shipped",
    total: "$149.50",
  },
  {
    id: "#ORD-003",
    customer: "Mike Johnson",
    date: "2024-01-14",
    status: "processing",
    total: "$89.99",
  },
  {
    id: "#ORD-004",
    customer: "Sarah Wilson",
    date: "2024-01-13",
    status: "pending",
    total: "$199.99",
  },
  {
    id: "#ORD-005",
    customer: "David Brown",
    date: "2024-01-13",
    status: "cancelled",
    total: "$79.99",
  },
];

function getStatusBadge(status: Order["status"]) {
  const statusConfig = {
    pending: { variant: "secondary" as const, label: "Pending" },
    processing: { variant: "default" as const, label: "Processing" },
    shipped: { variant: "info" as const, label: "Shipped" },
    delivered: { variant: "success" as const, label: "Delivered" },
    cancelled: { variant: "destructive" as const, label: "Cancelled" },
  };

  const config = statusConfig[status];
  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
}

interface RecentOrdersProps {
  orders?: Order[];
}

export function RecentOrders({ orders = recentOrders }: RecentOrdersProps) {
  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="flex items-center justify-between p-4 border rounded-lg"

        >
          <div className="flex flex-col space-y-1">
            <div className="flex items-center space-x-2">
              <p className="font-medium">
                {order.id}
              </p>
              {getStatusBadge(order.status)}
            </div>
            <p className="text-sm text-muted-foreground">
              {order.customer}
            </p>
            <p className="text-xs text-muted-foreground">
              {order.date}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <p className="font-semibold">
              {order.total}
            </p>
            <Link
              href={`/orders/${order.id.replace("#", "")}`}

            >
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
