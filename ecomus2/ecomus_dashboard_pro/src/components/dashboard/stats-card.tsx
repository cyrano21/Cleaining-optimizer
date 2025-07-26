import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  trend: "up" | "down";
  icon: React.ReactNode;
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  trend,
  icon,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col space-y-2">
            <p
              className="text-sm font-medium text-muted-foreground"

            >
              {title}
            </p>
            <p className="text-2xl font-bold">
              {value}
            </p>
            <div className="flex items-center space-x-1">
              {trend === "up" ? (
                <TrendingUp
                  className="h-4 w-4 text-green-500"

                />
              ) : (
                <TrendingDown
                  className="h-4 w-4 text-red-500"

                />
              )}
              <p
                className={cn(
                  "text-xs",
                  trend === "up" ? "text-green-500" : "text-red-500",
                )}

              >
                {description}
              </p>
            </div>
          </div>
          <div className="text-muted-foreground">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
