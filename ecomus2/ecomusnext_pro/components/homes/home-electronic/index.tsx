import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Header2 from "@/components/headers/Header2";
import Header3 from "@/components/headers/Header3";
import Categories from "./Categories";
import Hero from "./Hero";
import Products from "./Products";
import Collections from "./Collections";
import CollectionBanner from "./CollectionBanner";
import Countdown from "./Countdown";
import Testimonials from "./Testimonials";
import Blogs from "./Blogs";
import Marquee from "./Marquee";
import React, { useMemo } from "react";
import { TemplateConfig, DEFAULT_HOME_ELECTRONIC_CONFIG } from "@/types/templateConfig";

interface HomeTemplateProps {
  store?: any;
  products?: any;
  templateId?: string;
  isStore?: boolean;
  isVitrine?: boolean;
  vitrineConfig?: any;
  templateConfig?: TemplateConfig;
}

// Composants de section disponibles
const SECTION_COMPONENTS = {
  header: ({ config, store }: any) => {
    const HeaderComponent = {
      header1: Header1,
      header2: Header2,
      header3: Header3,
    }[config.type || 'header2'];
    
    return <HeaderComponent textClass={config.textClass || "text-white"} />;
  },
  hero: ({ config, store }: any) => (
    <Hero 
      store={store} 
      showStore={config.showStore}
      customBanner={config.customBanner}
    />
  ),
  categories: ({ config }: any) => (
    <Categories 
      limit={config.limit}
      showTitle={config.showTitle}
    />
  ),
  products: ({ config, products }: any) => (
    <Products 
      products={products}
      title={config.title}
      limit={config.limit}
      showFilters={config.showFilters}
      categoryId={config.categoryId}
    />
  ),
  collections: ({ config }: any) => (
    <Collections 
      showTitle={config.showTitle}
      layout={config.layout}
    />
  ),
  collectionBanner: ({ config }: any) => (
    <CollectionBanner 
      bannerImage={config.bannerImage}
      bannerText={config.bannerText}
    />
  ),
  countdown: ({ config }: any) => (
    <Countdown 
      title={config.title}
      endDate={config.endDate}
      showProducts={config.showProducts}
    />
  ),
  testimonials: ({ config }: any) => (
    <Testimonials 
      title={config.title}
      limit={config.limit}
    />
  ),
  marquee: ({ config }: any) => (
    <Marquee 
      text={config.text}
      speed={config.speed}
    />
  ),
  blogs: ({ config }: any) => (
    <Blogs 
      title={config.title}
      limit={config.limit}
    />
  ),
  footer: ({ config }: any) => <Footer1 />
};

export default function HomeElectronicTemplate({ 
  store, 
  products,
  templateId, 
  isStore, 
  isVitrine, 
  vitrineConfig,
  templateConfig 
}: HomeTemplateProps) {
  // Debug: vérifier que les données arrivent au template
  console.log('🏠 HomeElectronicTemplate - Props reçues:', { 
    store, 
    products, 
    templateId, 
    isStore, 
    isVitrine, 
    templateConfig 
  });

  // Utiliser la configuration fournie ou la configuration par défaut
  const config = templateConfig || DEFAULT_HOME_ELECTRONIC_CONFIG;
  
  // Créer une liste ordonnée des sections activées
  const orderedSections = useMemo(() => {
    const sections = Object.entries(config.sections)
      .filter(([key, sectionConfig]) => sectionConfig.enabled)
      .map(([key, sectionConfig]) => ({
        key,
        config: sectionConfig,
        order: sectionConfig.order || 999
      }))
      .sort((a, b) => a.order - b.order);
    
    console.log('🔧 Sections activées et ordonnées:', sections);
    return sections;
  }, [config.sections]);

  return (
    <>
      {orderedSections.map(({ key, config: sectionConfig }) => {
        const Component = SECTION_COMPONENTS[key as keyof typeof SECTION_COMPONENTS];
        
        if (!Component) {
          console.warn(`⚠️ Composant de section non trouvé pour: ${key}`);
          return null;
        }

        return (
          <React.Fragment key={key}>
            <Component 
              config={sectionConfig} 
              store={store} 
              products={products}
            />
          </React.Fragment>
        );
      })}
    </>
  );
}
