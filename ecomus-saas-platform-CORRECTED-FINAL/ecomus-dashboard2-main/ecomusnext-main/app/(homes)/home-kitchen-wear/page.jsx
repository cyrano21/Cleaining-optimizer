import Announcmentbar from "@/components/common/Announcmentbar";
import Features from "@/components/common/Features2";

import Footer1 from "@/components/footers/Footer1";
import Header4 from "@/components/headers/Header4";
import Banner from "@/components/homes/home-6/Banner";
import Categories from "@/components/homes/home-1/Categories";
import CollectionBanner from "@/components/homes/home-dog-accessories/CollectionBanner";
import Collections from "@/components/homes/home-accessories/Collections";
import Hero from "@/components/homes/home-1/Hero";
import Lookbook from "@/components/homes/home-1/Lookbook";
import Products from "@/components/homes/home-1/Products";
import Testimonials from "@/components/common/Testimonials";
import React from "react";

export const metadata = {
  title: "Home Kitchen Wear || Ecomus - Ultimate Nextjs Ecommerce Template",
  description: "Ecomus - Ultimate Nextjs Ecommerce Template",
};
export default function page() {
  return (
    <>
      <div className="color-primary-4">
        <Announcmentbar bgColor="bg_primary" />
        <Header4 />
        <Hero /> <Collections />
        <Products />
        <Banner />
        <Categories />
        <Lookbook />
        <Testimonials />
        <CollectionBanner />
        <Features bgColor="" />
        <Footer1 bgColor="background-gray" />
      </div>
    </>
  );
}
