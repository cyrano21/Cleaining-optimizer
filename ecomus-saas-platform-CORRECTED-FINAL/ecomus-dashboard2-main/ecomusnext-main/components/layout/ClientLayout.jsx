"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Context from "@/context/Context";
import HomesModal from "@/components/modals/HomesModal";
import QuickView from "@/components/modals/QuickView";
import ProductSidebar from "@/components/modals/ProductSidebar";
import QuickAdd from "@/components/modals/QuickAdd";
import Compare from "@/components/modals/Compare";
import ShopCart from "@/components/modals/ShopCart";
import AskQuestion from "@/components/modals/AskQuestion";
import BlogSidebar from "@/components/modals/BlogSidebar";
import ColorCompare from "@/components/modals/ColorCompare";
import DeliveryReturn from "@/components/modals/DeliveryReturn";
import FindSize from "@/components/modals/FindSize";
import Login from "@/components/modals/Login";
import MobileMenu from "@/components/modals/MobileMenu";
import Register from "@/components/modals/Register";
import ResetPass from "@/components/modals/ResetPass";
import SearchModal from "@/components/modals/SearchModal";
import ToolbarBottom from "@/components/modals/ToolbarBottom";
import ToolbarShop from "@/components/modals/ToolbarShop";
import NewsletterModal from "@/components/modals/NewsletterModal";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const suppressHydrationWarning = () => {
      const originalError = console.error;
      console.error = (...args) => {
        if (
          args[0].includes("Warning: Extra attributes from the server") ||
          args[0].includes("data-new-gr-c-s-check-loaded") ||
          args[0].includes("data-gr-c-s-check-loaded")
        ) {
          return;
        }
        originalError.apply(console, args);
      };
    };
    suppressHydrationWarning();
  }, []);

  if (!isClient) {
    return (
      <Context>
        <div>{children}</div>
      </Context>
    );
  }

  return (
    <Context>
      {children}
      <HomesModal />
      <QuickView />
      <ProductSidebar />
      <QuickAdd />
      <Compare />
      <ShopCart />
      <AskQuestion />
      <BlogSidebar />
      <ColorCompare />
      <DeliveryReturn />
      <FindSize />
      <Login />
      <MobileMenu />
      <Register />
      <ResetPass />
      <SearchModal />
      <ToolbarBottom />
      <ToolbarShop />
      <NewsletterModal />
    </Context>
  );
}
