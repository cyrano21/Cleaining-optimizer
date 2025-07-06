import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import Brands from "@/components/common/Brands";
import Features2 from "@/components/common/Features";
import Banner from "@/components/homes/home-6/Banner";
import Collections from "@/components/homes/home-accessories/Collections";
import Collections2 from "@/components/homes/home-camp-and-hike/Collections2";
import Hero from "@/components/homes/home-1/Hero";
import Marquee from "@/components/common/Marquee";
import Products from "@/components/homes/home-1/Products";
import Products2 from "@/components/homes/home-3/Products2";
import Testimonials from "@/components/common/Testimonials";
import Topbar from "@/components/homes/home-headphone/Topbar";
import React from "react";

export const metadata = {
  title: "Home Headphone || Ecomus - Ultimate Nextjs Ecommerce Template",
  description: "Ecomus - Ultimate Nextjs Ecommerce Template",
};
export default function page() {
  return (
    <>
      <Topbar />
      <Header2 />
      <Hero />
      <Collections />
      <Collections2 />
      <Banner />
      <Marquee />
      <Products />
      <Features2 />
      <Products2 />
      <Testimonials />
      <Brands />
      <Footer1 bgColor="background-gray" />
    </>
  );
}
