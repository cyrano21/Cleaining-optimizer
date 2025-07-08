import Features from "@/components/common/Features";
import ShopGram from "@/components/common/ShopGram";
import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import Categories from "@/components/homes/home-1/Categories";
import Countdown from "@/components/common/Countdown";
import Hero from "@/components/homes/home-1/Hero";
import ProductsAPI from "@/components/homes/home-1/ProductsAPI";
import Products2API from "@/components/homes/home-3/Products2API";
import Testimonials from "@/components/common/Testimonials";
import VideoBanner from "@/components/homes/home-3/VideoBanner";
import React from "react";

export const metadata = {
  title: "Home 3 || Ecomus - Ultimate Nextjs Ecommerce Template",
  description: "Ecomus - Ultimate Nextjs Ecommerce Template",
};
export default function page() {
  return (
    <>
      <Header2 />
      <Hero />
      <Countdown />
      <ProductsAPI />
      <Categories />
      <Products2API />
      <VideoBanner />
      <Testimonials />
      <div className="mt-5"></div>
      <ShopGram />
      <Features />
      <Footer1 />
    </>
  );
}
