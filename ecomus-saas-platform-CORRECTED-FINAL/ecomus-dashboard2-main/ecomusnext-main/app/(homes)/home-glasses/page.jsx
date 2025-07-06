import Features from "@/components/common/Features2";
import Footer2 from "@/components/footers/Footer2";
import Header2 from "@/components/headers/Header2";
import Topbar2 from "@/components/headers/Topbar2";
import Banner from "@/components/homes/home-6/Banner";
import Categories from "@/components/homes/home-1/Categories";
import Collections from "@/components/homes/home-accessories/Collections";
import Countdown from "@/components/common/Countdown";
import Hero from "@/components/homes/home-1/Hero";
import Products from "@/components/homes/home-1/Products";
import ShopGram from "@/components/common/ShopGram";
import React from "react";

export const metadata = {
  title: "Home Glasses || Ecomus - Ultimate Nextjs Ecommerce Template",
  description: "Ecomus - Ultimate Nextjs Ecommerce Template",
};
export default function page() {
  return (
    <>
      <div className="color-primary-6">
        <Topbar2 bgColor="bg_dark" />

        <Header2 uppercase />

        <Hero />
        <Banner />
        <Countdown />
        <Products />
        <Collections />
        <Categories />
        <ShopGram />
        <div className="mt-3"></div>
        <Features titleFont={"font-gloock"} />
        <Footer2 />
      </div>
    </>
  );
}
