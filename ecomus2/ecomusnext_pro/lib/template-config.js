// Import des composants partagés
import Hero from '@/components/homes/shared/Hero';
import Categories from '@/components/homes/shared/Categories';
import Products from '@/components/homes/shared/Products';
import Collections from '@/components/homes/shared/Collections';
import Testimonials from '@/components/homes/shared/Testimonials';
import Blogs from '@/components/homes/shared/Blogs';
import Newsletter from '@/components/homes/shared/Newsletter';
import Marquee from '@/components/homes/shared/Marquee';
import Countdown from '@/components/homes/shared/Countdown';
import Footer from '@/components/homes/shared/Footer';
import Brands from '@/components/homes/shared/Brands';
import Banner from '@/components/homes/shared/Banner';
import Features from '@/components/homes/shared/Features';
import Lookbook from '@/components/homes/shared/Lookbook';

// Registre unifié de tous les composants disponibles
export const COMPONENT_REGISTRY = {
  // Heroes (différents styles)
  'hero-electronic': Hero,
  'hero-fashion': Hero,
  'hero-cosmetic': Hero,
  'hero-default': Hero,
  
  // Categories
  'categories-grid': Categories,
  'categories-slider': Categories,
  'categories-list': Categories,
  
  // Products
  'products-featured': Products,
  'products-bestsellers': Products,
  'products-new': Products,
  'products-sale': Products,
  'products-grid': Products,
  'products-slider': Products,
  
  // Collections
  'collections-featured': Collections,
  'collections-grid': Collections,
  'collections-banner': Collections,
  
  // Testimonials
  'testimonials-slider': Testimonials,
  'testimonials-grid': Testimonials,
  'testimonials-simple': Testimonials,
  
  // Blogs
  'blogs-grid': Blogs,
  'blogs-list': Blogs,
  'blogs-featured': Blogs,
  
  // Newsletter
  'newsletter-horizontal': Newsletter,
  'newsletter-vertical': Newsletter,
  'newsletter-popup': Newsletter,
  
  // Marquee
  'marquee-offers': Marquee,
  'marquee-shipping': Marquee,
  'marquee-news': Marquee,
  
  // Countdown
  'countdown-sale': Countdown,
  'countdown-launch': Countdown,
  'countdown-deal': Countdown,
  
  // Brands
  'brands-grid': Brands,
  'brands-slider': Brands,
  'brands-featured': Brands,
  
  // Banner
  'banner-promotional': Banner,
  'banner-seasonal': Banner,
  'banner-discount': Banner,
  
  // Features
  'features-grid': Features,
  'features-list': Features,
  'features-icons': Features,
  
  // Lookbook
  'lookbook-gallery': Lookbook,
  'lookbook-grid': Lookbook,
  'lookbook-slider': Lookbook,
  
  // Footer
  'footer-default': Footer,
  'footer-minimal': Footer,
  'footer-extended': Footer
};

// Configurations par défaut pour chaque template
export const TEMPLATE_DEFAULTS = {
  'home-electronic': {
    name: 'Electronics Store',
    sections: [
      {
        id: 'marquee-1',
        component: 'marquee-offers',
        enabled: true,
        order: 1,
        props: {
          variant: 'electronic',
          items: [
            { id: 1, text: "Free Shipping on Orders Over $50", icon: "🚚" },
            { id: 2, text: "24/7 Customer Support", icon: "💬" },
            { id: 3, text: "2-Year Warranty", icon: "🛡️" }
          ]
        }
      },
      {
        id: 'hero-1',
        component: 'hero-electronic',
        enabled: true,
        order: 2,
        props: {
          variant: 'electronic',
          title: 'Latest Electronics & Gadgets',
          subtitle: 'Discover cutting-edge technology at unbeatable prices',
          ctaText: 'Shop Now',
          ctaLink: '/category/electronics',
          backgroundImage: '/images/hero/hero-electronic.jpg'
        }
      },
      {
        id: 'categories-1',
        component: 'categories-grid',
        enabled: true,
        order: 3,
        props: {
          variant: 'electronic',
          title: 'Shop by Category',
          limit: 6,
          layout: 'grid'
        }
      },
      {
        id: 'products-1',
        component: 'products-featured',
        enabled: true,
        order: 4,
        props: {
          variant: 'electronic',
          title: 'Featured Products',
          subtitle: 'Trending electronics and gadgets',
          limit: 8,
          showFilters: true
        }
      },
      {
        id: 'footer-1',
        component: 'footer-default',
        enabled: true,
        order: 5,
        props: {
          variant: 'electronic'
        }
      }
    ]
  },

  'home-fashion-01': {
    name: 'Fashion Store',
    sections: [
      {
        id: 'hero-1',
        component: 'hero-fashion',
        enabled: true,
        order: 1,
        props: {
          variant: 'fashion',
          title: 'Latest Fashion Trends',
          subtitle: 'Discover your style with our curated collections',
          ctaText: 'Shop Collection',
          ctaLink: '/category/fashion',
          backgroundImage: '/images/hero/hero-fashion.jpg'
        }
      },
      {
        id: 'categories-1',
        component: 'categories-slider',
        enabled: true,
        order: 2,
        props: {
          variant: 'fashion',
          title: 'Shop by Category',
          limit: 8,
          layout: 'slider'
        }
      },
      {
        id: 'products-1',
        component: 'products-grid',
        enabled: true,
        order: 3,
        props: {
          variant: 'fashion',
          title: 'New Arrivals',
          subtitle: 'Fresh looks for every occasion',
          limit: 12,
          showFilters: true
        }
      },
      {
        id: 'footer-1',
        component: 'footer-extended',
        enabled: true,
        order: 4,
        props: {
          variant: 'fashion'
        }
      }
    ]
  },

  'home-cosmetic': {
    name: 'Beauty & Cosmetics',
    sections: [
      {
        id: 'hero-1',
        component: 'hero-cosmetic',
        enabled: true,
        order: 1,
        props: {
          variant: 'cosmetic',
          title: 'Beauty Redefined',
          subtitle: 'Discover premium cosmetics for every skin type',
          ctaText: 'Explore Beauty',
          ctaLink: '/category/cosmetics',
          backgroundImage: '/images/hero/hero-cosmetic.jpg'
        }
      },
      {
        id: 'categories-1',
        component: 'categories-grid',
        enabled: true,
        order: 2,
        props: {
          variant: 'cosmetic',
          title: 'Beauty Categories',
          limit: 6,
          layout: 'grid'
        }
      },
      {
        id: 'products-1',
        component: 'products-grid',
        enabled: true,
        order: 3,
        props: {
          variant: 'cosmetic',
          title: 'Beauty Essentials',
          subtitle: 'Must-have products for your beauty routine',
          limit: 8,
          showFilters: true
        }
      },
      {
        id: 'footer-1',
        component: 'footer-minimal',
        enabled: true,
        order: 4,
        props: {
          variant: 'cosmetic'
        }
      }
    ]
  }
};

// Fonction pour obtenir la configuration d'un template
export function getTemplateConfig(templateName) {
  return TEMPLATE_DEFAULTS[templateName] || TEMPLATE_DEFAULTS['home-electronic'];
}

// Fonction pour obtenir tous les templates disponibles
export function getAvailableTemplates() {
  return Object.keys(TEMPLATE_DEFAULTS).map(key => ({
    key,
    name: TEMPLATE_DEFAULTS[key].name,
    sectionsCount: TEMPLATE_DEFAULTS[key].sections.length
  }));
}

// Fonction pour obtenir un composant par nom
export function getComponent(componentName) {
  return COMPONENT_REGISTRY[componentName];
}

// Fonction pour obtenir les composants par catégorie
export function getComponentsByCategory() {
  const categories = {};
  
  Object.keys(COMPONENT_REGISTRY).forEach(key => {
    const [category] = key.split('-');
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push({
      key,
      name: key,
      component: COMPONENT_REGISTRY[key]
    });
  });
  
  return categories;
}

// Export par défaut
export default {
  COMPONENT_REGISTRY,
  TEMPLATE_DEFAULTS,
  getTemplateConfig,
  getAvailableTemplates,
  getComponent,
  getComponentsByCategory
};
