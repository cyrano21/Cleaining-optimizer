import Footer1 from "@/components/footers/Footer1";
import Header18 from "@/components/headers/Header18";
import Topbar4 from "@/components/headers/Topbar4";

import Banner from "@/components/homes/home-6/Banner";
import Blogs from "@/components/homes/home-8/Blogs";
import Brands from "@/components/common/Brands";
import Collections from "@/components/homes/home-accessories/Collections";
import Collections2 from "@/components/homes/home-camp-and-hike/Collections2";
import Collections3 from "@/components/homes/home-electric-bike/Collections3";
import Features from "@/components/common/Features";
import Hero from "@/components/homes/home-1/Hero";
import Marquee from "@/components/common/Marquee";
import Products from "@/components/homes/home-1/Products";
import Store from "@/components/homes/home-2/Store";
export const metadata = {
  title: "Home Electric Bike || Ecomus - Ultimate Nextjs Ecommerce Template",
  description: "Ecomus - Ultimate Nextjs Ecommerce Template",
};
export default function page() {
  return (
    <>
      <div className=" color-primary-12">
        <Topbar4 />
        <Header18 /> <Hero />
        <Marquee />
        <Collections />
        <Collections2 />
        <Collections3 />
        <Products />
        <Banner />
        <Features />
        <Blogs />
        <Store />
        <Brands />
        <Footer1 />
      </div>
    </>
  );
}
