import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import Topbar1 from "@/components/headers/Topbar1";
import Collections from "@/components/homes/home-accessories/Collections";
import Collections2 from "@/components/homes/home-camp-and-hike/Collections2";
import Features from "@/components/common/Features";
import Hero from "@/components/homes/home-1/Hero";
import Products from "@/components/homes/home-1/Products";
import Testimonials from "@/components/common/Testimonials";
import React from "react";

export const metadata = {
  title: "Home Furniture 2 || Ecomus - Ultimate Nextjs Ecommerce Template",
  description: "Ecomus - Ultimate Nextjs Ecommerce Template",
};
export default function page() {
  return (
    <>
      <Topbar1 />
      <Header2 />
      <Hero />
      <Collections />
      <Features />
      <Products />
      <Collections2 />
      <Testimonials />
      <Footer1 />
    </>
  );
}
