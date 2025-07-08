import DynamicHomeTemplate from "@/components/DynamicHomeTemplate";
import React from "react";

export const metadata = {
  title: "Home Electronics || Ecomus - Ultimate Nextjs Ecommerce Template",
  description: "Ecomus - Ultimate Nextjs Ecommerce Template",
};

export default function HomeElectronicPage() {
  return (
    <DynamicHomeTemplate 
      templateId="home-electronic"
      vitrineConfig={{
        productFilters: {
          category: '686c54c34d17399c9ee6c6f0', // ObjectId de la catégorie Electronics (corrigé)
          limit: 12,
          featured: false // Enlever le filtre featured pour avoir plus de produits
        }
      }}
    />
  );
}
