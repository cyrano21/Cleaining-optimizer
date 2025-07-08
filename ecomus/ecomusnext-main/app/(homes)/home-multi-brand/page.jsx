import Features from "@/components/common/Features";
import Footer1 from "@/components/footers/Footer1";
import Header7 from "@/components/headers/Header7";
import Announcment from "@/components/homes/home-furniture/Announcment";
import BannerCollection from "@/components/homes/home-2/BannerCollection";
import Brands from "@/components/common/Brands";
import Categories from "@/components/homes/home-1/Categories";
import Categories2 from "@/components/homes/home-4/Categories2";
import Collection from "@/components/homes/home-2/Collection";

import Hero from "@/components/homes/home-1/Hero";
import Products from "@/components/homes/home-1/Products";
import Testimonials from "@/components/common/Testimonials";
import React from "react";

export const metadata = {
  title: "Home Multi Brand || Ecomus - Ultimate Nextjs Ecommerce Template",
  description: "Ecomus - Ultimate Nextjs Ecommerce Template",
};
export default function page() {
  return (
    <>
      <Announcment />
      <Header7 />
      <Categories />
      <Hero />
      <Categories2 />
      <BannerCollection />
      <Products />
      <Collection />
      <Testimonials />
      <div className="mt-5"></div>
      <Features />
      <Brands />
      <Footer1 bgColor="background-gray" />
    </>
  );
}
