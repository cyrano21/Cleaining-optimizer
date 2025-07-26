"use client";

import { useState, useEffect } from "react";
import { Store, ChevronDown, Check } from "lucide-react";

// Test des imports un par un
console.log('Testing imports...');

// Test Button
import { Button } from "@/components/ui/button";
console.log('Button imported successfully');

// Test Badge
import { Badge } from "@/components/ui/badge";
console.log('Badge imported successfully');

// Test DropdownMenu
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
console.log('DropdownMenu components imported successfully');

export function DebugStoreSelector() {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="h-10 w-64 bg-gray-200 animate-pulse rounded" />;
  }

  return (
    <div className="p-4 border rounded bg-white">
      <h3 className="text-sm font-medium mb-2">Debug StoreSelector</h3>
      
      {/* Test Button */}
      <div className="mb-2">
        <Button variant="outline" size="sm">
          <Store className="h-4 w-4 mr-2" />
          Test Button
        </Button>
      </div>

      {/* Test Badge */}
      <div className="mb-2">
        <Badge variant="default">Test Badge</Badge>
      </div>

      {/* Test DropdownMenu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            Test Dropdown <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            <Check className="h-4 w-4 mr-2" />
            Test Item
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
