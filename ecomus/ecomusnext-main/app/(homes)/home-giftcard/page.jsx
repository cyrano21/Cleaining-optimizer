import Footer1 from "@/components/footers/Footer1";
import Header5 from "@/components/headers/Header5";
import BestSell from "@/components/homes/home-giftcard/BestSell";
import Blog from "@/components/homes/home-giftcard/Blog";
import Card from "@/components/homes/home-giftcard/Card";
import Categories from "@/components/homes/home-1/Categories";
import Collection from "@/components/homes/home-2/Collection";
import Features from "@/components/common/Features";
import Hero from "@/components/homes/home-1/Hero";
import Marquee from "@/components/common/Marquee";
import Products from "@/components/homes/home-1/Products";
import Testimonials from "@/components/common/Testimonials";
import React from "react";

export const metadata = {
  title: "Home Giftcard || Ecomus - Ultimate Nextjs Ecommerce Template",
  description: "Ecomus - Ultimate Nextjs Ecommerce Template",
};
export default function page() {
  return (
    <>
      <Header5 />
      <Hero />
      <Card />
      <Products />
      <Features />
      <Categories />
      <Marquee />
      <BestSell />
      <Collection />
      <Testimonials />
      <Blog />
      <Footer1 />
    </>
  );
}
