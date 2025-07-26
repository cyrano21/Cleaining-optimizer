"use client";

import React, { useState } from "react";
import ProductsAdmin from "./products/ProductsAdmin";
import CategoriesAdmin from "./categories/CategoriesAdmin";
import BannersAdmin from "./banners/BannersAdmin";
import AttributesAdmin from "./attributes/AttributesAdmin";

const TABS = [
  { key: "products", label: "Produits" },
  { key: "categories", label: "Catégories" },
  { key: "banners", label: "Bannières" },
  { key: "attributes", label: "Attributs" },
];

export default function TabsStoreAdmin({ storeId }: { storeId: string }) {
  const [tab, setTab] = useState("products");

  return (
    <div>
      <div className="flex gap-2 border-b mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`px-4 py-2 -mb-px border-b-2 font-medium transition-colors duration-200 ${tab === t.key ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-blue-600"}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div>
        {tab === "products" && <ProductsAdmin storeId={storeId} />}
        {tab === "categories" && <CategoriesAdmin storeId={storeId} />}
        {tab === "banners" && <BannersAdmin storeId={storeId} />}
        {tab === "attributes" && <AttributesAdmin storeId={storeId} />}
      </div>
    </div>
  );
}
