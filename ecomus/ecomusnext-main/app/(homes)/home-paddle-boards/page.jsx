import Header12 from "@/components/headers/Header12";

import Topbar2 from "@/components/headers/Topbar2";
import Banner from "@/components/homes/home-6/Banner";
import Banner2 from "@/components/homes/home-book-store/Banner2";
import Categories from "@/components/homes/home-1/Categories";
import Collections from "@/components/homes/home-accessories/Collections";
import Features2 from "@/components/common/Features2";
import Features from "@/components/common/Features";
import Hero from "@/components/homes/home-1/Hero";
import Products from "@/components/homes/home-1/Products";
import Products2 from "@/components/homes/home-3/Products2";
import Testimonials from "@/components/common/Testimonials";
import React from "react";
import Footer2 from "@/components/footers/Footer2";

export const metadata = {
  title: "Home Paddle Boards || Ecomus - Ultimate Nextjs Ecommerce Template",
  description: "Ecomus - Ultimate Nextjs Ecommerce Template",
};
export default function page() {
  return (
    <>
      <Topbar2 bgColor="bg_blue-6" />
      <Header12 />
      <Hero /> <Features />
      <Products />
      <Collections />
      <Products2 />
      <Banner />
      <Categories />
      <Banner2 />
      <Testimonials />
      <Features2 bgColor="" />
      <Footer2 bgColor={"background-black bg_green-4"} />
    </>
  );
}
