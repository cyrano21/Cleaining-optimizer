import Announcement from "@/components/common/Announcement";
import Footer2 from "@/components/footers/Footer2";
import Header10 from "@/components/headers/Header10";
import Banner from "@/components/homes/home-6/Banner";
import Categories from "@/components/homes/home-1/Categories";
import Collections from "@/components/homes/home-accessories/Collections";
import Collections2 from "@/components/homes/home-camp-and-hike/Collections2";
import Features from "@/components/common/Features";
import Hero from "@/components/homes/home-1/Hero";
import Process from "@/components/homes/home-food/Process";
import Products from "@/components/homes/home-1/Products";
import Products2 from "@/components/homes/home-3/Products2";
import ShopGram from "@/components/common/ShopGram";
import Testimonials from "@/components/common/Testimonials";
import React from "react";
export const metadata = {
  title: "Home Personalized Pod || Ecomus - Ultimate Nextjs Ecommerce Template",
  description: "Ecomus - Ultimate Nextjs Ecommerce Template",
};
export default function page() {
  return (
    <>
      <Announcement bgColor={"bg_red-1"} />
      <Header10 />
      <Hero />
      <Collections />
      <Products />
      <Process />
      <Collections2 />
      <Categories />
      <Products2 />
      <Banner />
      <Testimonials />
      <Features />
      <ShopGram />
      <Footer2 />
    </>
  );
}
