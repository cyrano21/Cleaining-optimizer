import React from 'react';
import dynamic from 'next/dynamic';

// Import des Headers
import Header1 from "@/components/headers/Header1";
import Header2 from "@/components/headers/Header2";
import Header3 from "@/components/headers/Header3";

// Import des Footers
import Footer1 from "@/components/footers/Footer1";
import Footer2 from "@/components/footers/Footer2";
import Footer3 from "@/components/footers/Footer3";

// Import dynamique des composants spécialisés
const Hero1 = dynamic(() => import('@/components/homes/home-1/Hero'), { ssr: true });
const Hero2 = dynamic(() => import('@/components/homes/home-2/Hero'), { ssr: true });
const Hero3 = dynamic(() => import('@/components/homes/home-3/Hero'), { ssr: true });
const Hero4 = dynamic(() => import('@/components/homes/home-4/Hero'), { ssr: true });
const Hero5 = dynamic(() => import('@/components/homes/home-5/Hero'), { ssr: true });
const Hero6 = dynamic(() => import('@/components/homes/home-6/Hero'), { ssr: true });
const Hero7 = dynamic(() => import('@/components/homes/home-7/Hero'), { ssr: true });
const Hero8 = dynamic(() => import('@/components/homes/home-8/Hero'), { ssr: true });
const HeroElectronic = dynamic(() => import('@/components/homes/home-electronic/Hero'), { ssr: true });

const Slider1 = dynamic(() => import('@/components/homes/home-1/Slider'), { ssr: true });
const Slider2 = dynamic(() => import('@/components/homes/home-2/Slider'), { ssr: true });
const Slider3 = dynamic(() => import('@/components/homes/home-3/Slider'), { ssr: true });

const Categories1 = dynamic(() => import('@/components/homes/home-1/Categories'), { ssr: true });
const Categories2 = dynamic(() => import('@/components/homes/home-2/Categories'), { ssr: true });
const Categories3 = dynamic(() => import('@/components/homes/home-3/Categories'), { ssr: true });
const Categories4 = dynamic(() => import('@/components/homes/home-4/Categories'), { ssr: true });
const Categories5 = dynamic(() => import('@/components/homes/home-5/Categories'), { ssr: true });
const Categories6 = dynamic(() => import('@/components/homes/home-6/Categories'), { ssr: true });
const Categories7 = dynamic(() => import('@/components/homes/home-7/Categories'), { ssr: true });
const Categories8 = dynamic(() => import('@/components/homes/home-8/Categories'), { ssr: true });
const CategoriesElectronic = dynamic(() => import('@/components/homes/home-electronic/Categories'), { ssr: true });

const Products1 = dynamic(() => import('@/components/homes/home-1/Products'), { ssr: true });
const Products2 = dynamic(() => import('@/components/homes/home-2/Products'), { ssr: true });
const Products3 = dynamic(() => import('@/components/homes/home-3/Products'), { ssr: true });
const Products4 = dynamic(() => import('@/components/homes/home-4/Products'), { ssr: true });
const Products5 = dynamic(() => import('@/components/homes/home-5/Products'), { ssr: true });
const Products6 = dynamic(() => import('@/components/homes/home-6/Products'), { ssr: true });
const Products7 = dynamic(() => import('@/components/homes/home-7/Products'), { ssr: true });
const Products8 = dynamic(() => import('@/components/homes/home-8/Products'), { ssr: true });
const ProductsElectronic = dynamic(() => import('@/components/homes/home-electronic/Products'), { ssr: true });
const Products2API = dynamic(() => import('@/components/homes/home-electronic/Products2API'), { ssr: true });

// Autres composants communs
const Collections = dynamic(() => import('@/components/homes/home-electronic/Collections'), { ssr: true });
const CollectionBanner = dynamic(() => import('@/components/homes/home-electronic/CollectionBanner'), { ssr: true });
const Countdown = dynamic(() => import('@/components/homes/home-electronic/Countdown'), { ssr: true });
const Testimonials = dynamic(() => import('@/components/homes/home-electronic/Testimonials'), { ssr: true });
const Marquee = dynamic(() => import('@/components/homes/home-electronic/Marquee'), { ssr: true });
const Blogs = dynamic(() => import('@/components/homes/home-electronic/Blogs'), { ssr: true });
const Brands = dynamic(() => import('@/components/common/Brands'), { ssr: true });
const Lookbook = dynamic(() => import('@/components/common/Lookbook'), { ssr: true });
const Instagram = dynamic(() => import('@/components/common/Instagram'), { ssr: true });
const Newsletter = dynamic(() => import('@/components/common/Newsletter'), { ssr: true });
const VideoBanner = dynamic(() => import('@/components/homes/home-electronic/VideoBanner'), { ssr: true });

// Interface pour les composants factorisés
interface FactorizedComponentProps {
  config: any;
  store?: any;
  products?: any;
  templateId?: string;
}

// Interface pour les props des composants Categories
interface CategoriesComponentProps {
  limit?: number;
  layout?: string;
  showTitle?: boolean;
  [key: string]: any;
}

// Mapping des composants Header
export const HEADER_COMPONENTS = {
  header1: ({ config }: FactorizedComponentProps) => (
    <Header1 />
  ),
  header2: ({ config }: FactorizedComponentProps) => (
    <Header2 textClass={config.textClass || "text-white"} />
  ),
  header3: ({ config }: FactorizedComponentProps) => (
    <Header3 />
  ),
};

// Mapping des composants Hero par template
export const HERO_COMPONENTS = {
  hero1: ({ config, store, templateId }: FactorizedComponentProps) => {
    switch (templateId) {
      case 'home-1': case 'home-01': return <Hero1 store={store} />;
      case 'home-4': case 'home-04': return <Hero4 store={store} />;
      case 'home-6': case 'home-06': return <Hero6 store={store} />;
      case 'home-8': case 'home-08': return <Hero8 store={store} />;
      default: return <Hero1 store={store} />;
    }
  },
  hero2: ({ config, store, templateId }: FactorizedComponentProps) => {
    switch (templateId) {
      case 'home-3': case 'home-03': return <Hero3 store={store} />;
      case 'home-5': case 'home-05': return <Hero5 store={store} />;
      default: return <Hero2 store={store} />;
    }
  },
  hero3: ({ config, store }: FactorizedComponentProps) => <Hero3 store={store} />,
  'hero-banner': ({ config, store }: FactorizedComponentProps) => <Hero4 store={store} />,
  default: ({ config, store }: FactorizedComponentProps) => <Hero1 store={store} />,
};

// Mapping des composants Slider
export const SLIDER_COMPONENTS = {
  slider1: ({ config }: FactorizedComponentProps) => (
    <Slider1 autoPlay={config.autoPlay} showDots={config.showDots} />
  ),
  slider2: ({ config }: FactorizedComponentProps) => (
    <Slider2 autoPlay={config.autoPlay} showDots={config.showDots} />
  ),
  slider3: ({ config }: FactorizedComponentProps) => (
    <Slider3 autoPlay={config.autoPlay} showDots={config.showDots} />
  ),
};

// Mapping des composants Categories par template
export const CATEGORIES_COMPONENTS = {
  'home-1': ({ config }: FactorizedComponentProps) => <Categories1 limit={config?.limit} layout={config?.layout} showTitle={config?.showTitle} {...config} />,
  'home-01': ({ config }: FactorizedComponentProps) => <Categories1 limit={config?.limit} layout={config?.layout} showTitle={config?.showTitle} {...config} />,
  'home-2': ({ config }: FactorizedComponentProps) => <Categories2 limit={config?.limit} layout={config?.layout} showTitle={config?.showTitle} {...config} />,
  'home-02': ({ config }: FactorizedComponentProps) => <Categories2 limit={config?.limit} layout={config?.layout} showTitle={config?.showTitle} {...config} />,
  'home-3': ({ config }: FactorizedComponentProps) => <Categories3 limit={config?.limit} layout={config?.layout} showTitle={config?.showTitle} {...config} />,
  'home-03': ({ config }: FactorizedComponentProps) => <Categories3 limit={config?.limit} layout={config?.layout} showTitle={config?.showTitle} {...config} />,
  'home-4': ({ config }: FactorizedComponentProps) => <Categories4 limit={config?.limit} layout={config?.layout} showTitle={config?.showTitle} {...config} />,
  'home-04': ({ config }: FactorizedComponentProps) => <Categories4 limit={config?.limit} layout={config?.layout} showTitle={config?.showTitle} {...config} />,
  'home-5': ({ config }: FactorizedComponentProps) => <Categories5 limit={config?.limit} layout={config?.layout} showTitle={config?.showTitle} {...config} />,
  'home-05': ({ config }: FactorizedComponentProps) => <Categories5 limit={config?.limit} layout={config?.layout} showTitle={config?.showTitle} {...config} />,
  'home-6': ({ config }: FactorizedComponentProps) => <Categories6 limit={config?.limit} layout={config?.layout} showTitle={config?.showTitle} {...config} />,
  'home-06': ({ config }: FactorizedComponentProps) => <Categories6 limit={config?.limit} layout={config?.layout} showTitle={config?.showTitle} {...config} />,
  'home-7': ({ config }: FactorizedComponentProps) => <Categories7 limit={config?.limit} layout={config?.layout} showTitle={config?.showTitle} {...config} />,
  'home-07': ({ config }: FactorizedComponentProps) => <Categories7 limit={config?.limit} layout={config?.layout} showTitle={config?.showTitle} {...config} />,
  'home-8': ({ config }: FactorizedComponentProps) => <Categories8 limit={config?.limit} layout={config?.layout} showTitle={config?.showTitle} {...config} />,
  'home-08': ({ config }: FactorizedComponentProps) => <Categories8 limit={config?.limit} layout={config?.layout} showTitle={config?.showTitle} {...config} />,
  'home-electronic': ({ config }: FactorizedComponentProps) => <CategoriesElectronic limit={config?.limit} layout={config?.layout} showTitle={config?.showTitle} {...config} />
};

// Mapping des composants Products par template
export const PRODUCTS_COMPONENTS = {
  'home-1': ({ config, products }: FactorizedComponentProps) => <Products1 products={products} title={config.title} limit={config.limit} />,
  'home-01': ({ config, products }: FactorizedComponentProps) => <Products1 products={products} title={config.title} limit={config.limit} />,
  'home-2': ({ config, products }: FactorizedComponentProps) => <Products2 products={products} title={config.title} limit={config.limit} />,
  'home-02': ({ config, products }: FactorizedComponentProps) => <Products2 products={products} title={config.title} limit={config.limit} />,
  'home-3': ({ config, products }: FactorizedComponentProps) => <Products3 products={products} title={config.title} limit={config.limit} />,
  'home-03': ({ config, products }: FactorizedComponentProps) => <Products3 products={products} title={config.title} limit={config.limit} />,
  'home-4': ({ config, products }: FactorizedComponentProps) => <Products4 products={products} title={config.title} limit={config.limit} />,
  'home-04': ({ config, products }: FactorizedComponentProps) => <Products4 products={products} title={config.title} limit={config.limit} />,
  'home-5': ({ config, products }: FactorizedComponentProps) => <Products5 products={products} title={config.title} limit={config.limit} />,
  'home-05': ({ config, products }: FactorizedComponentProps) => <Products5 products={products} title={config.title} limit={config.limit} />,
  'home-6': ({ config, products }: FactorizedComponentProps) => <Products6 products={products} title={config.title} limit={config.limit} />,
  'home-06': ({ config, products }: FactorizedComponentProps) => <Products6 products={products} title={config.title} limit={config.limit} />,
  'home-7': ({ config, products }: FactorizedComponentProps) => <Products7 products={products} title={config.title} limit={config.limit} />,
  'home-07': ({ config, products }: FactorizedComponentProps) => <Products7 products={products} title={config.title} limit={config.limit} />,
  'home-8': ({ config, products }: FactorizedComponentProps) => <Products8 products={products} title={config.title} limit={config.limit} />,
  'home-08': ({ config, products }: FactorizedComponentProps) => <Products8 products={products} title={config.title} limit={config.limit} />,
  'home-electronic': ({ config, products }: FactorizedComponentProps) => <ProductsElectronic products={products} title={config.title} limit={config.limit} showFilters={config.showFilters} categoryId={config.categoryId} />
};

// Mapping des composants Footer
export const FOOTER_COMPONENTS = {
  footer1: ({ config }: FactorizedComponentProps) => <Footer1 />,
  footer2: ({ config }: FactorizedComponentProps) => <Footer2 />,
  footer3: ({ config }: FactorizedComponentProps) => <Footer3 />,
};

// Mapping centralisé de TOUS les composants par nom exact
export const ALL_COMPONENTS = {
  // Headers
  'Header1': ({ config }: FactorizedComponentProps) => <Header1 />,
  'Header2': ({ config }: FactorizedComponentProps) => <Header2 />,
  'Header3': ({ config }: FactorizedComponentProps) => <Header3 />,
  
  // Heroes (pour templates par défaut)
  'Hero': ({ config }: FactorizedComponentProps) => <HeroDefault {...config} />,
  'Hero1': ({ config }: FactorizedComponentProps) => <Hero1 {...config} />,
  'Hero2': ({ config }: FactorizedComponentProps) => <Hero2 {...config} />,
  'Hero3': ({ config }: FactorizedComponentProps) => <Hero3 {...config} />,
  'Hero4': ({ config }: FactorizedComponentProps) => <Hero4 {...config} />,
  'Hero5': ({ config }: FactorizedComponentProps) => <Hero5 {...config} />,
  'Hero6': ({ config }: FactorizedComponentProps) => <Hero6 {...config} />,
  'Hero7': ({ config }: FactorizedComponentProps) => <Hero7 {...config} />,
  'Hero8': ({ config }: FactorizedComponentProps) => <Hero8 {...config} />,
  'HeroElectronic': ({ config }: FactorizedComponentProps) => <HeroElectronic {...config} />,
  
  // Categories (pour templates par défaut)
  'Categories': ({ config, categories }: FactorizedComponentProps) => <CategoriesDefault categories={categories} {...config} />,
  'Categories1': ({ config, categories }: FactorizedComponentProps) => <Categories1 categories={categories} {...config} />,
  'Categories2': ({ config, categories }: FactorizedComponentProps) => <Categories2 categories={categories} {...config} />,
  'Categories3': ({ config, categories }: FactorizedComponentProps) => <Categories3 categories={categories} {...config} />,
  'Categories4': ({ config, categories }: FactorizedComponentProps) => <Categories4 categories={categories} {...config} />,
  'Categories5': ({ config, categories }: FactorizedComponentProps) => <Categories5 categories={categories} {...config} />,
  'Categories6': ({ config, categories }: FactorizedComponentProps) => <Categories6 categories={categories} {...config} />,
  'Categories7': ({ config, categories }: FactorizedComponentProps) => <Categories7 categories={categories} {...config} />,
  'Categories8': ({ config, categories }: FactorizedComponentProps) => <Categories8 categories={categories} {...config} />,
  'CategoriesElectronic': ({ config, categories }: FactorizedComponentProps) => <CategoriesElectronic categories={categories} {...config} />,
  
  // Products (pour templates par défaut)
  'Products': ({ config, products }: FactorizedComponentProps) => <ProductsDefault products={products} {...config} />,
  'Products1': ({ config, products }: FactorizedComponentProps) => <Products1 products={products} {...config} />,
  'Products2': ({ config, products }: FactorizedComponentProps) => <Products2 products={products} {...config} />,
  'Products3': ({ config, products }: FactorizedComponentProps) => <Products3 products={products} {...config} />,
  'Products4': ({ config, products }: FactorizedComponentProps) => <Products4 products={products} {...config} />,
  'Products5': ({ config, products }: FactorizedComponentProps) => <Products5 products={products} {...config} />,
  'Products6': ({ config, products }: FactorizedComponentProps) => <Products6 products={products} {...config} />,
  'Products7': ({ config, products }: FactorizedComponentProps) => <Products7 products={products} {...config} />,
  'Products8': ({ config, products }: FactorizedComponentProps) => <Products8 products={products} {...config} />,
  'ProductsElectronic': ({ config, products }: FactorizedComponentProps) => <ProductsElectronic products={products} {...config} />,
  'Products2API': ({ config, products }: FactorizedComponentProps) => <Products2API products={products} {...config} />,
  
  // Footers
  'Footer1': ({ config }: FactorizedComponentProps) => <Footer1 />,
  'Footer2': ({ config }: FactorizedComponentProps) => <Footer2 />,
  'Footer3': ({ config }: FactorizedComponentProps) => <Footer3 />,
  
  // Sliders
  'Slider': ({ config }: FactorizedComponentProps) => <Slider1 {...config} />,
  'Slider1': ({ config }: FactorizedComponentProps) => <Slider1 {...config} />,
  'Slider2': ({ config }: FactorizedComponentProps) => <Slider2 {...config} />,
  'Slider3': ({ config }: FactorizedComponentProps) => <Slider3 {...config} />,
  
  // Composants spécialisés découverts
  'Countdown': ({ config }: FactorizedComponentProps) => <Countdown {...config} />,
  'Testimonials': ({ config }: FactorizedComponentProps) => <Testimonials {...config} />,
  'VideoBanner': ({ config }: FactorizedComponentProps) => <VideoBanner {...config} />,
  'Collections': ({ config }: FactorizedComponentProps) => <Collections {...config} />,
  'CollectionBanner': ({ config }: FactorizedComponentProps) => <CollectionBanner {...config} />,
  'Marquee': ({ config }: FactorizedComponentProps) => <Marquee {...config} />,
  'Blogs': ({ config }: FactorizedComponentProps) => <Blogs {...config} />,
  'Brands': ({ config }: FactorizedComponentProps) => <Brands {...config} />,
  'Lookbook': ({ config }: FactorizedComponentProps) => <Lookbook {...config} />,
  'Instagram': ({ config }: FactorizedComponentProps) => <Instagram {...config} />,
  'Newsletter': ({ config }: FactorizedComponentProps) => <Newsletter {...config} />,
};

// Fonction helper pour rendre un composant par nom
export const renderComponent = (componentName: string, props: FactorizedComponentProps) => {
  const Component = ALL_COMPONENTS[componentName];
  
  if (!Component) {
    console.warn(`⚠️ Composant "${componentName}" non trouvé. Composants disponibles:`, Object.keys(ALL_COMPONENTS));
    return <div className="alert alert-warning">Composant "{componentName}" non trouvé</div>;
  }
  
  return <Component {...props} />;
};

// Export pour compatibilité avec l'ancien système
export const CATEGORIES_COMPONENTS = {
  'home-1': ({ config, categories }: FactorizedComponentProps) => renderComponent('Categories1', { config, categories }),
  'home-electronic': ({ config, categories }: FactorizedComponentProps) => renderComponent('CategoriesElectronic', { config, categories }),
  // Ajout par défaut pour tous les autres templates
  'default': ({ config, categories }: FactorizedComponentProps) => renderComponent('Categories', { config, categories }),
};

export const PRODUCTS_COMPONENTS = {
  'home-1': ({ config, products }: FactorizedComponentProps) => renderComponent('Products1', { config, products }),
  'home-electronic': ({ config, products }: FactorizedComponentProps) => renderComponent('ProductsElectronic', { config, products }),
  // Ajout par défaut pour tous les autres templates
  'default': ({ config, products }: FactorizedComponentProps) => renderComponent('Products', { config, products }),
};

export const FOOTER_COMPONENTS = {
  footer1: ({ config }: FactorizedComponentProps) => renderComponent('Footer1', { config }),
  footer2: ({ config }: FactorizedComponentProps) => renderComponent('Footer2', { config }),
  footer3: ({ config }: FactorizedComponentProps) => renderComponent('Footer3', { config }),
  // Ajout par défaut
  'default': ({ config }: FactorizedComponentProps) => renderComponent('Footer1', { config }),
};

// Fonction utilitaire pour obtenir le bon composant
export const getComponent = (sectionKey: string, templateId: string, config: any, store?: any, products?: any) => {
  const props = { config, store, products, templateId };

  switch (sectionKey) {
    case 'header':
      return HEADER_COMPONENTS[config.type as keyof typeof HEADER_COMPONENTS]?.(props);
    
    case 'hero':
      return HERO_COMPONENTS[config.type as keyof typeof HERO_COMPONENTS]?.(props);
    
    case 'slider':
      return SLIDER_COMPONENTS[config.type as keyof typeof SLIDER_COMPONENTS]?.(props);
    
    case 'categories':
      return CATEGORIES_COMPONENTS[templateId as keyof typeof CATEGORIES_COMPONENTS]?.(props);
    
    case 'products':
      return PRODUCTS_COMPONENTS[templateId as keyof typeof PRODUCTS_COMPONENTS]?.(props);
    
    case 'footer':
      return FOOTER_COMPONENTS[config.type as keyof typeof FOOTER_COMPONENTS]?.(props);
    
    default:
      return COMMON_COMPONENTS[sectionKey as keyof typeof COMMON_COMPONENTS]?.(props);
  }
};
