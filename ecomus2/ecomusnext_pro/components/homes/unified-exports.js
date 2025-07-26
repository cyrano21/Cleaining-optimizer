// Imports automatiquement générés pour le système unifié
// Ce fichier centralise tous les composants shared

export { default as Hero } from './shared/Hero';
export { default as Categories } from './shared/Categories';
export { default as Products } from './shared/Products';
export { default as Collections } from './shared/Collections';
export { default as Testimonials } from './shared/Testimonials';
export { default as Blogs } from './shared/Blogs';
export { default as Newsletter } from './shared/Newsletter';
export { default as Marquee } from './shared/Marquee';
export { default as Countdown } from './shared/Countdown';
export { default as Footer } from './shared/Footer';
export { default as Brands } from './shared/Brands';
export { default as Banner } from './shared/Banner';
export { default as Features } from './shared/Features';
export { default as Lookbook } from './shared/Lookbook';

// Registry unifié des composants
export const UNIFIED_COMPONENTS = {
  hero: Hero,
  categories: Categories,
  products: Products,
  collections: Collections,
  testimonials: Testimonials,
  blogs: Blogs,
  newsletter: Newsletter,
  marquee: Marquee,
  countdown: Countdown,
  footer: Footer,
  brands: Brands,
  banner: Banner,
  features: Features,
  lookbook: Lookbook,
};

// Fonction helper pour obtenir un composant
export const getUnifiedComponent = (name) => {
  const componentName = name.toLowerCase();
  return UNIFIED_COMPONENTS[componentName];
};

export default UNIFIED_COMPONENTS;