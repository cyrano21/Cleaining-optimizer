import Announcement from "@/components/common/Announcement";
import Features3 from "@/components/common/Features3";
import Footer1 from "@/components/footers/Footer1";
import Header6 from "@/components/headers/Header6";
import Banner from "@/components/homes/home-6/Banner";
import Banner2 from "@/components/homes/home-book-store/Banner2";
import Categories from "@/components/homes/home-1/Categories";
import Collections from "@/components/homes/home-accessories/Collections";
import Hero from "@/components/homes/home-1/Hero";
import Marquee from "@/components/common/Marquee";
import Newsletter from "@/components/homes/home-camp-and-hike/Newsletter";
import Products from "@/components/homes/home-1/Products";
import Testimonials from "@/components/common/Testimonials";
import React from "react";
export const metadata = {
  title: "Home Ceramic || Ecomus - Ultimate Nextjs Ecommerce Template",
  description: "Ecomus - Ultimate Nextjs Ecommerce Template",
};
export default function page() {
  return (
    <>
      <Announcement />
      <Header6 />
      <Hero />
      <Features3 />
      <Collections />
      <Banner />
      <Products />
      <Categories />
      <Banner2 />
      <Marquee />
      <Testimonials />
      <Newsletter />
      <Footer1 />
    </>
  );
}
