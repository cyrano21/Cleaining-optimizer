import Features from "@/components/common/Features2";
import Footer5 from "@/components/footers/Footer5";
import Header2 from "@/components/headers/Header2";
import Banner from "@/components/homes/home-6/Banner";
import Categories from "@/components/homes/home-1/Categories";
import Hero from "@/components/homes/home-1/Hero";
import Products from "@/components/homes/home-1/Products";
import Products2 from "@/components/homes/home-3/Products2";
import ShopGram from "@/components/common/ShopGram";
import Testimonials from "@/components/common/Testimonials";
import React from "react";

export const metadata = {
  title: "Home Tee || Ecomus - Ultimate Nextjs Ecommerce Template",
  description: "Ecomus - Ultimate Nextjs Ecommerce Template",
};
export default function page() {
  return (
    <>
      <Header2 uppercase isArrow={false} Linkfs="fs-14" />
      <Hero />
      <Features titleFont="font-caprasimo" bgColor="" />
      <Categories />
      <Banner />
      <Products />
      <Products2 />
      <Testimonials />
      <ShopGram />
      <Footer5 />
    </>
  );
}
