import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import Topbar1 from "@/components/headers/Topbar1";
import BannerCollection from "@/components/homes/home-2/BannerCollection";
import Brands from "@/components/common/Brands";
import Categories from "@/components/homes/home-1/Categories";
import Collection from "@/components/homes/home-2/Collection";
import Hero from "@/components/homes/home-1/Hero";
import ProductsAPI from "@/components/homes/home-1/ProductsAPI";
import Store from "@/components/homes/home-2/Store";
import React from "react";

export const metadata = {
  title: "Home 2 || Ecomus - Ultimate Nextjs Ecommerce Template",
  description: "Ecomus - Ultimate Nextjs Ecommerce Template",
};
export default function page() {
  return (
    <>
      <Topbar1 />
      <Header2 />
      <Hero />
      <Categories />
      <Collection />
      <ProductsAPI />
      <BannerCollection />
      <Store />
      <Brands />
      <Footer1 />
    </>
  );
}
