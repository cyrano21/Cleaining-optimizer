import Features from "@/components/common/Features2";
import Footer2 from "@/components/footers/Footer2";
import Header2 from "@/components/headers/Header2";
import Blogs from "@/components/homes/home-8/Blogs";
import Categories from "@/components/homes/home-1/Categories";
import CollectionBanner from "@/components/homes/home-dog-accessories/CollectionBanner";
import Collections from "@/components/homes/home-accessories/Collections";
import Countdown from "@/components/common/Countdown";

import Hero from "@/components/homes/home-1/Hero";
import Marquee from "@/components/common/Marquee";
import Products from "@/components/homes/home-1/Products";
import Testimonials from "@/components/common/Testimonials";
import Topbar from "@/components/homes/home-headphone/Topbar";
import React from "react";

export const metadata = {
  title: "Home Electronics  || Ecomus - Ultimate Nextjs Ecommerce Template",
  description: "Ecomus - Ultimate Nextjs Ecommerce Template",
};
export default function page() {
  return (
    <>
      <div className="color-primary-3">
        <Topbar />
        <Header2 textClass={"text-black"} />
        <Hero />
        <Marquee />
        <Categories />
        <CollectionBanner />
        <Collections />
        <Countdown />
        <Products />
        <Testimonials />
        <Blogs />
        <Features />
        <Footer2 />
      </div>
    </>
  );
}
