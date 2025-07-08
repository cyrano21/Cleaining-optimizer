import Features from "@/components/common/Features2";
import Footer1 from "@/components/footers/Footer1";
import Header16 from "@/components/headers/Header16";
import Banner from "@/components/homes/home-6/Banner";
import Blogs from "@/components/homes/home-8/Blogs";
import CollectionBanner from "@/components/homes/home-dog-accessories/CollectionBanner";
import Collections from "@/components/homes/home-accessories/Collections";
import Countdown from "@/components/common/Countdown";
import Hero from "@/components/homes/home-1/Hero";
import Marquee from "@/components/common/Marquee";
import Products from "@/components/homes/home-1/Products";
import Announcment from "@/components/homes/home-furniture/Announcment";

import React from "react";

export const metadata = {
  title: "Home Men || Ecomus - Ultimate Nextjs Ecommerce Template",
  description: "Ecomus - Ultimate Nextjs Ecommerce Template",
};
export default function page() {
  return (
    <>
      <Announcment />
      <Header16 />
      <Hero />
      <Countdown />
      <Collections />
      <Banner />
      <Products />
      <CollectionBanner />
      <Features bgColor="" />
      <Blogs />
      <Marquee />
      <Footer1 bgColor="background-gray" />
    </>
  );
}
