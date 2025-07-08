import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import Categories from "@/components/homes/home-1/Categories";
import Hero from "@/components/homes/home-1/Hero";
import ProductsAPI from "@/components/homes/home-1/ProductsAPI";
import Brands from "@/components/common/Brands";
import React from "react";

export const metadata = {
  title: "Home 1 || Ecomus - Ultimate Nextjs Ecommerce Template",
  description: "Ecomus - Ultimate Nextjs Ecommerce Template",
};

export default function Home01() {
  return (
    <>
      <Header2 />
      <Hero />
      <Categories />
      <ProductsAPI />
      <Brands />
      <Footer1 />
    </>
  );
}
