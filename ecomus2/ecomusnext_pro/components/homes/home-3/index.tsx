import Features from "@/components/common/Features";
import ShopGram from "@/components/common/ShopGram";
import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import Categories from "@/components/homes/home-1/Categories";
import Countdown from "@/components/common/Countdown";
import Hero from "@/components/homes/home-1/Hero";
import ProductsAPI from "@/components/homes/home-1/ProductsAPI";
import Products2API from "./Products2API";
import Testimonials from "@/components/common/Testimonials";
import VideoBanner from "./VideoBanner";
import React from "react";

interface HomeTemplateProps {
  store?: any;
  templateId?: string;
  isStore?: boolean;
  isVitrine?: boolean;
  vitrineConfig?: any;
}

export default function Home3Template({ store, templateId, isStore, isVitrine, vitrineConfig }: HomeTemplateProps) {
  return (
    <>
      <Header2 textClass="text-white" />
      <Hero />
      <Countdown labels="Jours,Heures,Minutes,Secondes" />
      <ProductsAPI />
      <Categories />
      <Products2API />
      <VideoBanner />
      <Testimonials />
      <div className="mt-5"></div>
      <ShopGram />
      <Features />
      <Footer1 />
    </>
  );
}
