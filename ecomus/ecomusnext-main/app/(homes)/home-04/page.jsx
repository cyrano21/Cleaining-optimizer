import Features from "@/components/common/Features";
import Footer2 from "@/components/footers/Footer2";
import Header2 from "@/components/headers/Header2";
import Topbar2 from "@/components/headers/Topbar2";
import Categories from "@/components/homes/home-1/Categories";
import Categories2 from "@/components/homes/home-4/Categories2";
import Hero from "@/components/homes/home-1/Hero";
import Marquee from "@/components/common/Marquee";
import ProductsAPI from "@/components/homes/home-1/ProductsAPI";
import ShopGram from "@/components/common/ShopGram";
import Testimonials from "@/components/common/Testimonials";
import React from "react";

export const metadata = {
  title: "Home 4 || Ecomus - Ultimate Nextjs Ecommerce Template",
  description: "Ecomus - Ultimate Nextjs Ecommerce Template",
};
export default function page() {
  return (
    <>
      <Topbar2 />
      <Header2 />
      <Hero />
      <Marquee />
      <Categories />
      <ProductsAPI />
      <Testimonials />
      <Categories2 />
      <Features />
      <ShopGram />
      <div className="mb-lg-0 mb-sm-4"></div>
      <Footer2 />
    </>
  );
}
