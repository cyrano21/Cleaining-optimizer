import Features from "@/components/common/Features2";
import Footer4 from "@/components/footers/Footer4";
import Header5 from "@/components/headers/Header5";
import Banner from "@/components/homes/home-6/Banner";
import Categories from "@/components/homes/home-1/Categories";
import Collections from "@/components/homes/home-accessories/Collections";
import Hero from "@/components/homes/home-1/Hero";
import Marquee from "@/components/common/Marquee";
import Products from "@/components/homes/home-1/Products";
import Products2 from "@/components/homes/home-3/Products2";
import Testimonials from "@/components/common/Testimonials";
import React from "react";

export const metadata = {
  title: "Home Jewelry || Ecomus - Ultimate Nextjs Ecommerce Template",
  description: "Ecomus - Ultimate Nextjs Ecommerce Template",
};
export default function page() {
  return (
    <>
      <div className="color-primary-4">
        <Header5 isArrow={false} uppercase Linkfs="fs-14" />
        <Hero /> <Categories />
        <Products />
        <Collections />
        <Marquee />
        <Banner />
        <Products2 />
        <Testimonials />
        <Features titleFont="fw-8 text-uppercase fs-14" bgColor="" />
        <Footer4 />
      </div>
    </>
  );
}
