import Announcmentbar from "@/components/common/Announcmentbar";
import Footer1 from "@/components/footers/Footer1";
import Header4 from "@/components/headers/Header4";
import Categories from "@/components/homes/home-1/Categories";
import Collection2 from "@/components/homes/home-8/Collection2";
import CollectionBanner from "@/components/homes/home-dog-accessories/CollectionBanner";
import Collections from "@/components/homes/home-accessories/Collections";
import Collections3 from "@/components/homes/home-electric-bike/Collections3";
import Features from "@/components/common/Features";
import Hero from "@/components/homes/home-1/Hero";
import Products from "@/components/homes/home-1/Products";
import Products2 from "@/components/homes/home-3/Products2";
import Testimonials from "@/components/common/Testimonials";
import React from "react";

export const metadata = {
  title: "Home Phonecase || Ecomus - Ultimate Nextjs Ecommerce Template",
  description: "Ecomus - Ultimate Nextjs Ecommerce Template",
};
export default function page() {
  return (
    <>
      <div className="color-primary-5">
        <Announcmentbar bgColor="bg_dark" />
        <Header4 />
        <Hero />
        <Categories />
        <CollectionBanner />
        <Products />
        <Collections />
        <Products2 />
        <Collection2 />
        <Features />
        <Testimonials />
        <Collections3 />
        <Footer1 bgColor="background-gray" />
      </div>
    </>
  );
}
