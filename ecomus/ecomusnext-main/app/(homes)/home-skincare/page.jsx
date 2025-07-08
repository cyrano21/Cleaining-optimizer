import Header8 from "@/components/headers/Header8";

import Announcement from "@/components/common/Announcement";
import Banner from "@/components/homes/home-6/Banner";
import Feature from "@/components/homes/home-skincare/Feature";
import Hero from "@/components/homes/home-1/Hero";
import Marquee from "@/components/common/Marquee";
import Products from "@/components/homes/home-1/Products";
import Products2 from "@/components/homes/home-3/Products2";
import SkinChange from "@/components/homes/home-cosmetic/SkinChange";
import Testimonials from "@/components/common/Testimonials";
import Videobox from "@/components/homes/home-skincare/Videobox";
import React from "react";
import ShopGram from "@/components/common/ShopGram";
import Features from "@/components/common/Features";
import Footer1 from "@/components/footers/Footer1";

export const metadata = {
  title: "Home Skincare || Ecomus - Ultimate Nextjs Ecommerce Template",
  description: "Ecomus - Ultimate Nextjs Ecommerce Template",
};
export default function page() {
  return (
    <>
      <Announcement />
      <Header8 />
      <Hero />
      <Products />
      <Banner />
      <Marquee />
      <Videobox />
      <Features />
      <Products2 />
      <Testimonials />
      <SkinChange />
      <Features />
      <ShopGram />
      <Footer1 />
    </>
  );
}
