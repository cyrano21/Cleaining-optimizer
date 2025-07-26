"use client";

import React from "react";
import { Store, ChevronDown } from "lucide-react";

// Test minimal pour identifier le composant problématique
export function TestStoreSelector() {
  return (
    <div className="border p-4 rounded">
      <div className="flex items-center gap-2">
        <Store className="h-4 w-4" />
        <span>Test Store Selector</span>
        <ChevronDown className="h-4 w-4" />
      </div>
    </div>
  );
}
