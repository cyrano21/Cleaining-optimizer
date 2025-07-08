import Footer8 from "@/components/footers/Footer8";
import Header19 from "@/components/headers/Header19";
import Announcmentbar from "@/components/common/Announcmentbar";
import Banner from "@/components/homes/home-6/Banner";
import Brands from "@/components/common/Brands";
import CollectionBanner from "@/components/homes/home-dog-accessories/CollectionBanner";
import Collections from "@/components/homes/home-accessories/Collections";
import Features from "@/components/common/Features";
import Hero from "@/components/homes/home-1/Hero";
import Products from "@/components/homes/home-1/Products";
import ShopGram from "@/components/common/ShopGram";
import Testimonials from "@/components/common/Testimonials";
import React from "react";
export const metadata = {
  title: "Home Plant || Ecomus - Ultimate Nextjs Ecommerce Template",
  description: "Ecomus - Ultimate Nextjs Ecommerce Template",
};
export default function page() {
  return (
    <>
      <div className="bg_f5f5ec">
        <Announcmentbar />
        <Header19 />
        <Hero />
        <Brands />
        <Testimonials />
        <Products />
        <Banner />
        <Features /> <Collections />
        <CollectionBanner />
        <ShopGram />
        <Footer8 bgColor="bg_green-9" />
      </div>
    </>
  );
}
