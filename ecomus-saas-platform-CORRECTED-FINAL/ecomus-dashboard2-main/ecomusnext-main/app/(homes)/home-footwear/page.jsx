import Marquee from "@/components/common/Marquee";

import Footer6 from "@/components/footers/Footer6";

import Header20 from "@/components/headers/Header20";
import Topbar2 from "@/components/headers/Topbar2";
import Banner from "@/components/homes/home-6/Banner";
import Banner2 from "@/components/homes/home-book-store/Banner2";
import Collections from "@/components/homes/home-accessories/Collections";
import Lookbook from "@/components/homes/home-1/Lookbook";
import NewsLetter from "@/components/homes/home-footwear/NewsLetter";
import Products from "@/components/homes/home-1/Products";
import Testimonials from "@/components/common/Testimonials";
import React from "react";
export const metadata = {
  title: "Home Footwear || Ecomus - Ultimate Nextjs Ecommerce Template",
  description: "Ecomus - Ultimate Nextjs Ecommerce Template",
};
export default function page() {
  return (
    <>
      <Topbar2 />
      <Header20 />
      <Collections />
      <Products />
      <Banner />
      <Marquee parentClass="flat-spacing-1 tf-marquee marquee-lg" />
      <Lookbook />
      <Testimonials />
      <Banner2 />
      <NewsLetter />
      <Footer6 />
    </>
  );
}
