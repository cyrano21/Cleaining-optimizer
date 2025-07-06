import Footer6 from "@/components/footers/Footer6";
import Header6 from "@/components/headers/Header6";
import BannerCollections from "@/components/homes/home-baby/BannerCollections";
import Collections from "@/components/homes/home-accessories/Collections";
import Hero from "@/components/homes/home-1/Hero";
import Lookbook from "@/components/homes/home-1/Lookbook";
import Marquee from "@/components/common/Marquee";
import Newsletter from "@/components/homes/home-camp-and-hike/Newsletter";
import Products from "@/components/homes/home-1/Products";
import ShopGram from "@/components/common/ShopGram";
import Testimonials from "@/components/common/Testimonials";
import React from "react";

export const metadata = {
  title: "Home Handbag || Ecomus - Ultimate Nextjs Ecommerce Template",
  description: "Ecomus - Ultimate Nextjs Ecommerce Template",
};
export default function page() {
  return (
    <>
      <Header6 isArrow={false} uppercase />
      <Hero />
      <Marquee />
      <Testimonials />
      <Collections />
      <Products />
      <BannerCollections />
      <Lookbook />
      <ShopGram />
      <Newsletter />
      <Footer6 />
    </>
  );
}
