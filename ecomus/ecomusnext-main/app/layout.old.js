"use client";

import { useEffect, useState } from "react";

import "../styles/scss/main.scss";
import "photoswipe/dist/photoswipe.css";
import "rc-slider/assets/index.css";
import "../styles/css/custom-image-fixes.css";
import "../styles/css/image-fixes.css";

import Context from "@/context/Context";
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

import { usePathname } from "next/navigation";
import NewsletterModal from "@/components/modals/NewsletterModal";
import ShareModal from "@/components/modals/ShareModal";
import ScrollTop from "@/components/common/ScrollTop";
import RtlToggle from "@/components/common/RtlToggle";
import AIChatbot from "@/components/common/AIChatbot";
import { appWithTranslation } from "next-i18next";
import nextI18NextConfig from "../next-i18next.config.js";

// Composant HomesModal défini directement dans ce fichier pour éviter les problèmes d'import
function HomesModal() {
  return (
    <div className="modal fade modalDemo" id="modalDemo">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="header">
            <h5 className="demo-title">Ultimate Nextjs Template</h5>
            <span
              className="icon-close icon-close-popup"
              data-bs-dismiss="modal"
            />
          </div>
          <div className="mega-menu">
            <div className="container g-0">
              <div className="row demo-product g-0">
                {/* Contenu temporaire */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RootLayout({ children }) {
  const pathname = usePathname();
  
  // Suppression des erreurs d'hydratation causées par les extensions de navigateur
  useEffect(() => {
    const suppressHydrationWarning = () => {
      const originalError = console.error;
      console.error = (...args) => {
        if (
          typeof args[0] === 'string' &&
          (args[0].includes('Warning: Extra attributes from the server') ||
           args[0].includes('Warning: Prop') ||
           args[0].includes('data-new-gr-c-s-check-loaded') ||
           args[0].includes('data-gr-ext-installed'))
        ) {
          return;
        }
        originalError.apply(console, args);
      };
    };
    
    suppressHydrationWarning();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Import the script only on the client side
      import("bootstrap/dist/js/bootstrap.esm").then(() => {
        // Module is imported, you can access any exported functionality if
      });
    }
  }, []);
  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector("header");
      if (window.scrollY > 100) {
        header.classList.add("header-bg");
      } else {
        header.classList.remove("header-bg");
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Cleanup function to remove event listener on component unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  const [scrollDirection, setScrollDirection] = useState("down");

  useEffect(() => {
    setScrollDirection("up");
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 250) {
        if (currentScrollY > lastScrollY.current) {
          // Scrolling down
          setScrollDirection("down");
        } else {
          // Scrolling up
          setScrollDirection("up");
        }
      } else {
        // Below 250px
        setScrollDirection("down");
      }

      lastScrollY.current = currentScrollY;
    };

    const lastScrollY = { current: window.scrollY };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Cleanup: remove event listener when component unmounts
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname]);
  useEffect(() => {
    // Close any open modal
    const bootstrap = require("bootstrap"); // dynamically import bootstrap
    const modalElements = document.querySelectorAll(".modal.show");
    modalElements.forEach((modal) => {
      const modalInstance = bootstrap.Modal.getInstance(modal);
      if (modalInstance) {
        modalInstance.hide();
      }
    });

    // Close any open offcanvas
    const offcanvasElements = document.querySelectorAll(".offcanvas.show");
    offcanvasElements.forEach((offcanvas) => {
      const offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvas);
      if (offcanvasInstance) {
        offcanvasInstance.hide();
      }
    });
  }, [pathname]); // Runs every time the route changes

  useEffect(() => {
    const header = document.querySelector("header");
    if (header) {
      if (scrollDirection == "up") {
        header.style.top = "0px";
      } else {
        header.style.top = "-185px";
      }
    }
  }, [scrollDirection]);
  useEffect(() => {
    const WOW = require("@/utlis/wow");
    const wow = new WOW.default({
      mobile: false,
      live: false,
    });
    wow.init();
  }, [pathname]);

  useEffect(() => {
    const initializeDirection = () => {
      // Toujours initialiser en LTR par défaut pour éviter les différences d'hydratation
      document.documentElement.dir = "ltr";
      document.body.classList.add("ltr");
      
      // Appliquer la direction sauvegardée après l'hydratation
      const direction = localStorage.getItem("direction");
      if (direction) {
        try {
          const parsedDirection = JSON.parse(direction);
          document.documentElement.dir = parsedDirection.dir;
          document.body.className = document.body.className.replace(/\b(ltr|rtl)\b/g, '');
          document.body.classList.add(parsedDirection.dir);
        } catch (e) {
          console.warn('Erreur lors du parsing de la direction:', e);
        }
      }

      const preloader = document.getElementById("preloader");
      if (preloader) {
        preloader.classList.add("disabled");
      }
    };

    initializeDirection();
  }, []); // Only runs once on component mount

  return (
    // Ensure the lang attribute is dynamically set by next-i18next
    <html>
      <body className="preload-wrapper">
        <div className="preload preload-container" id="preloader">
          <div className="preload-logo">
            <div className="spinner"></div>
          </div>
        </div>{" "}
        <Context>
          <div id="wrapper">{children}</div>
          {/* RtlToggle might need to be language aware or placed differently if it manipulates dir */}
          <RtlToggle />
          <HomesModal /> <QuickView />
          <QuickAdd />
          <ProductSidebar />
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
          <ShareModal />
          <AIChatbot />
        </Context>
        <ScrollTop />
      </body>
    </html>
  );
}

export default appWithTranslation(RootLayout, nextI18NextConfig);
