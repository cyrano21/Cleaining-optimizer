import React from "react";

// LEGACY: This file previously handled home-* template mappings. Now replaced by the new template system.
// Only header/footer mappings remain. Template rendering is handled elsewhere.

// Import des Headers
import Header1 from "@/components/headers/Header1";
import Header2 from "@/components/headers/Header2";
import Header3 from "@/components/headers/Header3";

// Import des Footers
import Footer1 from "@/components/footers/Footer1";
import Footer2 from "@/components/footers/Footer2";
import Footer3 from "@/components/footers/Footer3";

// Interface pour les composants factorisés
interface ComponentProps {
  config: any;
}

// Mapping des composants Header
export const HEADER_COMPONENTS = {
  header1: ({ config }: ComponentProps) => <Header1 />,
  header2: ({ config }: ComponentProps) => (
    <Header2
      textClass={config?.textClass || "text-white"}
      bgColor={config?.bgColor}
      uppercase={config?.uppercase}
      isArrow={config?.isArrow}
      Linkfs={config?.Linkfs}
    />
  ),
  header3: ({ config }: ComponentProps) => <Header3 />,
};

// Mapping des composants Footer
export const FOOTER_COMPONENTS = {
  footer1: ({ config }: ComponentProps) => <Footer1 />,
  footer2: ({ config }: ComponentProps) => <Footer2 />,
  footer3: ({ config }: ComponentProps) => <Footer3 />,
};

// This file is now legacy. Template rendering is handled by the new template system elsewhere.
