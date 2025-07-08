import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import Categories from "./Categories";
import Hero from "./Hero";
import Products from "./Products";
import React from "react";

interface HomeTemplateProps {
  store?: any;
  templateId?: string;
  isStore?: boolean;
  isVitrine?: boolean;
  vitrineConfig?: any;
  products?: any[];
}

export default function Home6Template({ store, templateId, isStore, isVitrine, vitrineConfig, products }: HomeTemplateProps) {
  return (
    <>
      <Header2 textClass="text-white" />
      <div className="tf-page-title">
        <div className="container-full">
          <div className="heading text-center">Home 6 Template</div>
        </div>
      </div>
      <Hero />
      <Categories />
      <Products products={products} />
      <Footer1 />
    </>
  );
}
