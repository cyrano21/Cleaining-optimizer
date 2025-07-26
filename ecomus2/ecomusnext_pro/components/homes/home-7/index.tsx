import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import React from "react";

interface HomeTemplateProps {
  store?: any;
  templateId?: string;
  isStore?: boolean;
  isVitrine?: boolean;
  vitrineConfig?: any;
  products?: any[];
}

export default function Home7Template({ store, templateId, isStore, isVitrine, vitrineConfig, products }: HomeTemplateProps) {
  return (
    <>
      <Header2 textClass="text-white" />
      <div className="tf-page-title">
        <div className="container-full">
          <div className="heading text-center">Home 7 Template</div>
        </div>
      </div>
      <Footer1 />
    </>
  );
}
