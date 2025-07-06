import Footer2 from "@/components/footers/Footer2";
import Header9 from "@/components/headers/Header9";
import Announcment from "@/components/homes/home-furniture/Announcment";
import Banner from "@/components/homes/home-6/Banner";
import Brands from "@/components/common/Brands";
import Categories from "@/components/homes/home-1/Categories";
import Faqs from "@/components/homes/home-stroller/Faqs";
import Features from "@/components/common/Features";
import Features2 from "@/components/common/Features2";
import Hero from "@/components/homes/home-1/Hero";
import Products from "@/components/homes/home-1/Products";
import Testimonials from "@/components/common/Testimonials";
import React from "react";

export const metadata = {
  title: "Home Stroller || Ecomus - Ultimate Nextjs Ecommerce Template",
  description: "Ecomus - Ultimate Nextjs Ecommerce Template",
};
export default function page() {
  return (
    <>
      <Announcment />
      <Header9 />
      <Hero />
      <Features />
      <Categories />
      <Banner />
      <Brands />
      <Products />
      <Features2 />
      <Faqs />
      <Testimonials />
      <Footer2 />
    </>
  );
}
