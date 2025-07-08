import Brands from "@/components/common/Brands";
import Features from "@/components/common/Features2";
import Footer2 from "@/components/footers/Footer2";
import Header22 from "@/components/headers/Header22";
import Topbar4 from "@/components/headers/Topbar4";
import Collections from "@/components/homes/home-accessories/Collections";
import Hero from "@/components/homes/home-1/Hero";
import Lookbook from "@/components/homes/home-1/Lookbook";
import Marquee from "@/components/common/Marquee";
import Products from "@/components/homes/home-1/Products";
import Products2 from "@/components/homes/home-3/Products2";
import Products3 from "@/components/homes/home-cosmetic/Products3";
import Store from "@/components/homes/home-2/Store";
import Testimonials from "@/components/common/Testimonials";
import React from "react";
export const metadata = {
  title:
    "Home Gamming Accessories || Ecomus - Ultimate Nextjs Ecommerce Template",
  description: "Ecomus - Ultimate Nextjs Ecommerce Template",
};
export default function page() {
  return (
    <>
      <div className="home-gaming-accessories color-primary-14">
        <Topbar4 />
        <Header22 />
        <Hero />
        <Marquee />
        <Features bgColor="flat-spacing-3 flat-iconbox line" />
        <Collections />
        <Products />
        <Products2 />
        <Lookbook />
        <Products3 />
        <Testimonials />
        <Brands parentClass="flat-spacing-1 pt_0" />
        <Store />
        <Footer2 />
      </div>
    </>
  );
}
