import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import Categories from "./Categories";
import Hero from "./Hero";
import ProductsAPI from "./ProductsAPI";
import Brands from "@/components/common/Brands";
import React from "react";

interface HomeTemplateProps {
  store?: any;
  templateId?: string;
  isStore?: boolean;
  isVitrine?: boolean;
  vitrineConfig?: any;
}

export default function Home1Template({ store, templateId, isStore, isVitrine, vitrineConfig }: HomeTemplateProps) {
  return (
    <>
      <Header2 textClass="text-white" />
      <Hero />
      <Categories />
      <ProductsAPI />
      <Brands />
      <Footer1 />
    </>
  );
}
