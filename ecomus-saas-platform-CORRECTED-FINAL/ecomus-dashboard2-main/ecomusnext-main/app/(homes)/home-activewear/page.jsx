import Announcement from "@/components/common/Announcement";
import Footer5 from "@/components/footers/Footer5";
import Header13 from "@/components/headers/Header13";
import Banner from "@/components/homes/home-6/Banner";
import Collections from "@/components/homes/home-accessories/Collections";
import Countdown from "@/components/common/Countdown";
import Features from "@/components/common/Features";
import Features2 from "@/components/common/Features2";
import Hero from "@/components/homes/home-1/Hero";
import Lookbook from "@/components/homes/home-1/Lookbook";
import Products from "@/components/homes/home-1/Products";
import Products2 from "@/components/homes/home-3/Products2";
import ShopGram from "@/components/common/ShopGram";
import Testimonials from "@/components/common/Testimonials";
import React from "react";

export const metadata = {
  title: "Home Activewear || Ecomus - Ultimate Nextjs Ecommerce Template",
  description: "Ecomus - Ultimate Nextjs Ecommerce Template",
};
export default function page() {
  return (
    <>
      <Announcement bgColor="bg_violet-1" />
      <Header13 />
      <Hero />
      <Features />
      <Collections />
      <Products />
      <Countdown />
      <Products2 />
      <Lookbook />
      <Banner />
      <Features2 />
      <Testimonials />
      <ShopGram />
      <Footer5 bgColor="background-gray" />
    </>
  );
}
