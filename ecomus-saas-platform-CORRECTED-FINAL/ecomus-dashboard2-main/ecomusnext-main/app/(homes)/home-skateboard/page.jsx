import Footer4 from "@/components/footers/Footer4";
import Header1 from "@/components/headers/Header1";
import Brands from "@/components/common/Brands";
import Features from "@/components/common/Features";
import Banner from "@/components/homes/home-6/Banner";
import Categories from "@/components/homes/home-1/Categories";
import Collections from "@/components/homes/home-accessories/Collections";
import Hero from "@/components/homes/home-1/Hero";
import Marquee from "@/components/common/Marquee";
import Products from "@/components/homes/home-1/Products";
import Products2 from "@/components/homes/home-3/Products2";
import Testimonials from "@/components/common/Testimonials";
import React from "react";

export const metadata = {
  title: "Home Skateboard || Ecomus - Ultimate Nextjs Ecommerce Template",
  description: "Ecomus - Ultimate Nextjs Ecommerce Template",
};
export default function page() {
  return (
    <>
      <Header1 />

      <Hero />
      <Marquee />
      <Collections />
      <div className="mt-5"></div>
      <Brands />
      <Categories />
      <Products />
      <Banner />
      <Products2 />
      <Testimonials />
      <Features />
      <Footer4 />
    </>
  );
}
