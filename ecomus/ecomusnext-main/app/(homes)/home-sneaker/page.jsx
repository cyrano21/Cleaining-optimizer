import Footer1 from "@/components/footers/Footer1";
import Header15 from "@/components/headers/Header15";
import Header9 from "@/components/headers/Header9";
import Topbar1 from "@/components/headers/Topbar1";
import Brands from "@/components/common/Brands";
import BannerCollection from "@/components/homes/home-2/BannerCollection";
import Categories from "@/components/homes/home-1/Categories";
import Collections from "@/components/homes/home-accessories/Collections";
import Features from "@/components/common/Features";
import Hero from "@/components/homes/home-1/Hero";
import Lookbook from "@/components/homes/home-1/Lookbook";
import NewsLetter from "@/components/homes/home-footwear/NewsLetter";
import Products from "@/components/homes/home-1/Products";
import React from "react";

export const metadata = {
  title: "Home Sneaker || Ecomus - Ultimate Nextjs Ecommerce Template",
  description: "Ecomus - Ultimate Nextjs Ecommerce Template",
};
export default function page() {
  return (
    <>
      <Topbar1 />
      <Header15 />
      <Hero />
      <Categories />
      <Brands />
      <Collections />
      <Products />
      <Lookbook />
      <BannerCollection />
      <NewsLetter />
      <Features />
      <Footer1 bgColor="background-gray" />
    </>
  );
}
