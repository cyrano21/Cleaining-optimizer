import React, { useState } from "react";
import StoreAdminPanel from "./StoreAdminPanel";
import ProductsAdmin from "./products/ProductsAdmin";
import CategoriesAdmin from "./categories/CategoriesAdmin";
import BannersAdmin from "./banners/BannersAdmin";
import AttributesAdmin from "./attributes/AttributesAdmin";

const TABS = [
  { key: "infos", label: "Infos générales" },
  { key: "products", label: "Produits" },
  { key: "categories", label: "Catégories" },
  { key: "banners", label: "Bannières" },
  { key: "attributes", label: "Attributs" },
];

export default function StoreAdminTabs({ store }: { store: any }) {
  const [tab, setTab] = useState("infos");
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Handler à passer aux modules enfants pour remonter une erreur critique
  const handleModuleError = (err: string) => {
    setGlobalError(err);
    setTimeout(() => setGlobalError(null), 8000); // auto-hide après 8s
  };

  return (
    <div>
      {globalError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-200 font-medium">
          {globalError}
        </div>
      )}
      <div className="flex gap-2 border-b mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`px-4 py-2 -mb-px border-b-2 font-medium transition-colors ${tab === t.key ? "border-blue-600 text-blue-700" : "border-transparent text-gray-500 hover:text-blue-600"}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div>
        {tab === "infos" && <StoreAdminPanel store={store} onError={handleModuleError} />}
        {tab === "products" && <ProductsAdmin storeId={store.id} onError={handleModuleError} />}
        {tab === "categories" && <CategoriesAdmin storeId={store.id} onError={handleModuleError} />}
        {tab === "banners" && <BannersAdmin storeId={store.id} onError={handleModuleError} />}
        {tab === "attributes" && <AttributesAdmin storeId={store.id} onError={handleModuleError} />}
      </div>
    </div>
  );
}
