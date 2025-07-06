import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import Banner from "@/components/homes/home-6/Banner";
import Collections from "@/components/homes/home-accessories/Collections";
import CollectionsBanner2 from "@/components/homes/home-sock/CollectionsBanner2";
import Features from "@/components/common/Features";
import Hero from "@/components/homes/home-1/Hero";
import Marquee from "@/components/common/Marquee";
import Products from "@/components/homes/home-1/Products";
import Products2 from "@/components/homes/home-3/Products2";
import ShopGram from "@/components/common/ShopGram";
import Testimonials from "@/components/common/Testimonials";
import React from "react";

export const metadata = {
  title: "Home Sock || Ecomus - Ultimate Nextjs Ecommerce Template",
  description: "Ecomus - Ultimate Nextjs Ecommerce Template",
};
export default function page() {
  return (
    <>
      <div className="color-primary-7">
        <Header2 isArrow={false} uppercase />
        <Hero /> <Marquee />
        <Features />
        <Collections />
        <Products />
        <Banner />
        <CollectionsBanner2 />
        <Products2 />
        <Testimonials />
        <ShopGram />
        <Footer1 />
      </div>
    </>
  );
}
