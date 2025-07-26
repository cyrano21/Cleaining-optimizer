import Features from "@/components/common/Features";
import Footer2 from "@/components/footers/Footer2";
import Header2 from "@/components/headers/Header2";
import Topbar2 from "@/components/headers/Topbar2";
import Categories from "@/components/homes/home-1/Categories";
import Categories2 from "./Categories2";
import Hero from "@/components/homes/home-1/Hero";
import Marquee from "@/components/common/Marquee";
import ProductsAPI from "@/components/homes/home-1/ProductsAPI";
import ShopGram from "@/components/common/ShopGram";
import Testimonials from "@/components/common/Testimonials";
import React from "react";

interface HomeTemplateProps {
  store?: any;
  templateId?: string;
  isStore?: boolean;
  isVitrine?: boolean;
  vitrineConfig?: any;
}

export default function Home4Template({ store, templateId, isStore, isVitrine, vitrineConfig }: HomeTemplateProps) {
  return (
    <>
      <Topbar2 />
      <Header2 textClass="text-white" />
      <Hero />
      <Marquee />
      <Categories />
      <ProductsAPI />
      <Testimonials />
      <Categories2 />
      <Features />
      <ShopGram />
      <div className="mb-lg-0 mb-sm-4"></div>
      <Footer2 />
    </>
  );
}
