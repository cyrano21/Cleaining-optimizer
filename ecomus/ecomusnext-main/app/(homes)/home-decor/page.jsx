import Announcement from "@/components/common/Announcement";
import Footer1 from "@/components/footers/Footer1";
import Header10 from "@/components/headers/Header10";
import Categories from "@/components/homes/home-1/Categories";
import Collcetion2 from "@/components/homes/home-decor/Collcetion2";
import Collections from "@/components/homes/home-accessories/Collections";
import Hero from "@/components/homes/home-1/Hero";
import Products from "@/components/homes/home-1/Products";
import Products2 from "@/components/homes/home-3/Products2";
import TestimonialSection from "@/components/common/Testimonials";

import React from "react";

export const metadata = {
  title: "Home Decor || Ecomus - Ultimate Nextjs Ecommerce Template",
  description: "Ecomus - Ultimate Nextjs Ecommerce Template",
};
export default function page() {
  return (
    <>
      <div className="color-primary-2">
        <Announcement bgColor={"bg_brown-1"} />
        <Header10 />
        <Hero /> <Collections />
        <Products />
        <Categories />
        <Products2 />
        <Collcetion2 />
        <TestimonialSection />
        <Footer1 />
      </div>
    </>
  );
}
