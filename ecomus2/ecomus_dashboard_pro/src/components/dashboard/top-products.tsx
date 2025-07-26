import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Star } from "lucide-react";
import Link from "next/link";
import { OptimizedImage } from "@/components/ui/optimized-image";

interface Product {
  id: string;
  name: string;
  image: string;
  price: string;
  sales: number;
  rating: number;
  category: string;
}

const topProducts: Product[] = [
  {
    id: "1",
    name: "Wireless Headphones",
    image: "/images/placeholder.svg",
    price: "$199.99",
    sales: 1250,
    rating: 4.8,
    category: "Electronics",
  },
  {
    id: "2",
    name: "Smart Watch",
    image: "/images/placeholder.svg",
    price: "$299.99",
    sales: 980,
    rating: 4.6,
    category: "Electronics",
  },
  {
    id: "3",
    name: "Running Shoes",
    image: "/images/placeholder.svg",
    price: "$129.99",
    sales: 850,
    rating: 4.7,
    category: "Fashion",
  },
  {
    id: "4",
    name: "Coffee Maker",
    image: "/images/placeholder.svg",
    price: "$89.99",
    sales: 720,
    rating: 4.5,
    category: "Home",
  },
  {
    id: "5",
    name: "Laptop Stand",
    image: "/images/placeholder.svg",
    price: "$49.99",
    sales: 650,
    rating: 4.4,
    category: "Office",
  },
];

function getCategoryBadge(category: string) {
  const categoryConfig: Record<string, { variant: any; color: string }> = {
    Electronics: { variant: "default", color: "bg-blue-100 text-blue-800" },
    Fashion: { variant: "secondary", color: "bg-purple-100 text-purple-800" },
    Home: { variant: "success", color: "bg-green-100 text-green-800" },
    Office: { variant: "warning", color: "bg-yellow-100 text-yellow-800" },
  };

  const config = categoryConfig[category] || {
    variant: "default",
    color: "bg-gray-100 text-gray-800",
  };
  return (
    <Badge variant={config.variant as any}>
      {category}
    </Badge>
  );
}

export function TopProducts() {
  return (
    <div className="space-y-4">
      {topProducts.map((product) => (
        <div
          key={product.id}
          className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors"

        >
          <div className="relative h-12 w-12 flex-shrink-0">
            <OptimizedImage
              src={product.image}
              alt={product.name}
              fill
              className="rounded-md object-cover"

            />
          </div>
          <div className="flex-1 min-w-0">
            <div
              className="flex items-center justify-between mb-1"

            >
              <p className="font-medium text-sm truncate">
                {product.name}
              </p>
              <p className="font-semibold text-sm">
                {product.price}
              </p>
            </div>
            <div
              className="flex items-center justify-between"

            >
              <div className="flex items-center space-x-2">
                {getCategoryBadge(product.category)}
                <div className="flex items-center space-x-1">
                  <Star
                    className="h-3 w-3 fill-yellow-400 text-yellow-400"

                  />

                  <span
                    className="text-xs text-muted-foreground"

                  >
                    {product.rating}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className="text-xs text-muted-foreground"

                >
                  {product.sales} sold
                </span>
                <Link href={`/products/${product.id}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"

                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
