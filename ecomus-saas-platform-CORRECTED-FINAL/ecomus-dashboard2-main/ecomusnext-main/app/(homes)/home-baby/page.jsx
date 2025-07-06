import Footer1 from "@/components/footers/Footer1";
import Header18 from "@/components/headers/Header18";
import Topbar4 from "@/components/headers/Topbar4";

import BannerCollections from "@/components/homes/home-baby/BannerCollections";
import Brands from "@/components/common/Brands";
import Categories from "@/components/homes/home-1/Categories";
import Collections from "@/components/homes/home-accessories/Collections";
import Hero from "@/components/homes/home-1/Hero";
import Products from "@/components/homes/home-1/Products";
import Products2 from "@/components/homes/home-3/Products2";

import React from "react";
export const metadata = {
  title: "Home Baby || Ecomus - Ultimate Nextjs Ecommerce Template",
  description: "Ecomus - Ultimate Nextjs Ecommerce Template",
};
export default function page() {
  return (
    <>
      <div className="color-primary-10">
        <Topbar4 />
        <Header18 /> <Hero />
        <BannerCollections />
        <Products />
        <Categories />
        <Collections />
        <Products2 />
        <Brands />
        <Footer1 />
      </div>
    </>
  );
}
