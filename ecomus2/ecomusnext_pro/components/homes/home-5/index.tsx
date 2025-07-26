import Footer1 from "@/components/footers/Footer1";
import Header3 from "@/components/headers/Header3";
import Topbar3 from "@/components/headers/Topbar3";
import BannerCountdown from "./BannerCountdown";
import Collection from "@/components/homes/home-2/Collection";
import Features from "@/components/common/Features";
import Hero from "@/components/homes/home-1/Hero";
import Lookbook from "@/components/homes/home-1/Lookbook";
import ProductsAPI from "@/components/homes/home-1/ProductsAPI";
import ShopGram from "@/components/common/ShopGram";
import React from "react";

interface HomeTemplateProps {
  store?: any;
  templateId?: string;
  isStore?: boolean;
  isVitrine?: boolean;
  vitrineConfig?: any;
}

export default function Home5Template({ store, templateId, isStore, isVitrine, vitrineConfig }: HomeTemplateProps) {
  return (
    <>
      <Topbar3 />
      <Header3 />
      <Hero />
      <Collection />
      <ProductsAPI />
      <BannerCountdown />
      <Lookbook />
      <Features />
      <ShopGram />
      <Footer1 />
    </>
  );
}
