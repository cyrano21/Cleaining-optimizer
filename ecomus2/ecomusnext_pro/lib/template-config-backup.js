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
          subtitle: 'Discover our best-selling electronics',
          limit: 8,
          showFilters: true
        }
      },
      {
        id: 'countdown-1',
        component: 'countdown-sale',
        enabled: true,
        order: 5,
        props: {
          variant: 'electronic',
          title: 'Flash Sale Ends Soon!',
          subtitle: 'Don\'t miss out on these amazing deals',
          targetDate: '2024-12-31T23:59:59'
        }
      },
      {
        id: 'collections-1',
        component: 'collections-featured',
        enabled: true,
        order: 6,
        props: {
          variant: 'electronic',
          title: 'Featured Collections',
          layout: 'grid'
        }
      },
      {
        id: 'testimonials-1',
        component: 'testimonials-slider',
        enabled: true,
        order: 7,
        props: {
          variant: 'electronic',
          title: 'What Our Customers Say',
          layout: 'slider'
        }
      },
      {
        id: 'blogs-1',
        component: 'blogs-grid',
        enabled: true,
        order: 8,
        props: {
          variant: 'electronic',
          title: 'Latest Tech News',
          subtitle: 'Stay updated with the latest technology trends'
        }
      },
      {
        id: 'newsletter-1',
        component: 'newsletter-horizontal',
        enabled: true,
        order: 9,
        props: {
          variant: 'electronic',
          layout: 'horizontal'
        }
      },
      {
        id: 'footer-1',
        component: 'footer-default',
        enabled: true,
        order: 10,
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
          title: 'New Fashion Collection',
          subtitle: 'Discover the latest trends in fashion',
          ctaText: 'Explore Collection',
          ctaLink: '/category/fashion',
          backgroundImage: '/images/hero/hero-fashion.jpg'
        }
      },
      {
        id: 'marquee-1',
        component: 'marquee-offers',
        enabled: true,
        order: 2,
        props: {
          variant: 'fashion',
          items: [
            { id: 1, text: "Free Shipping Worldwide", icon: "🌍" },
            { id: 2, text: "30-Day Returns", icon: "↩️" },
            { id: 3, text: "Sustainable Fashion", icon: "🌱" }
          ]
        }
      },
      {
        id: 'categories-1',
        component: 'categories-slider',
        enabled: true,
        order: 3,
        props: {
          variant: 'fashion',
          title: 'Shop by Style',
          layout: 'slider'
        }
      },
      {
        id: 'products-1',
        component: 'products-featured',
        enabled: true,
        order: 4,
        props: {
          variant: 'fashion',
          title: 'Trending Now',
          subtitle: 'Discover the most popular fashion items',
          limit: 8
        }
      },
      {
        id: 'collections-1',
        component: 'collections-banner',
        enabled: true,
        order: 5,
        props: {
          variant: 'fashion',
          title: 'Seasonal Collections',
          layout: 'banner'
        }
      },
      {
        id: 'products-2',
        component: 'products-sale',
        enabled: true,
        order: 6,
        props: {
          variant: 'fashion',
          title: 'Sale Items',
          subtitle: 'Up to 70% off selected items',
          limit: 6,
          showDiscount: true
        }
      },
      {
        id: 'testimonials-1',
        component: 'testimonials-grid',
        enabled: true,
        order: 7,
        props: {
          variant: 'fashion',
          title: 'Customer Reviews',
          layout: 'grid'
        }
      },
      {
        id: 'blogs-1',
        component: 'blogs-featured',
        enabled: true,
        order: 8,
        props: {
          variant: 'fashion',
          title: 'Fashion Blog',
          subtitle: 'Style tips and fashion inspiration'
        }
      },
      {
        id: 'newsletter-1',
        component: 'newsletter-vertical',
        enabled: true,
        order: 9,
        props: {
          variant: 'fashion',
          layout: 'vertical'
        }
      },
      {
        id: 'footer-1',
        component: 'footer-default',
        enabled: true,
        order: 10,
        props: {
          variant: 'fashion'
        }
      }
    ]
  },

  'home-cosmetic': {
    name: 'Cosmetic Store',
    sections: [
      {
        id: 'hero-1',
        component: 'hero-cosmetic',
        enabled: true,
        order: 1,
        props: {
          variant: 'cosmetic',
          title: 'Beauty & Cosmetics',
          subtitle: 'Enhance your natural beauty with our premium products',
          ctaText: 'Shop Beauty',
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
          layout: 'grid'
        }
      },
      {
        id: 'products-1',
        component: 'products-bestsellers',
        enabled: true,
        order: 3,
        props: {
          variant: 'cosmetic',
          title: 'Best Sellers',
          subtitle: 'Our most loved beauty products',
          limit: 8
        }
      },
      {
        id: 'collections-1',
        component: 'collections-featured',
        enabled: true,
        order: 4,
        props: {
          variant: 'cosmetic',
          title: 'Beauty Collections',
          layout: 'grid'
        }
      },
      {
        id: 'testimonials-1',
        component: 'testimonials-slider',
        enabled: true,
        order: 5,
        props: {
          variant: 'cosmetic',
          title: 'Beauty Reviews',
          layout: 'slider'
        }
      },
      {
        id: 'blogs-1',
        component: 'blogs-grid',
        enabled: true,
        order: 6,
        props: {
          variant: 'cosmetic',
          title: 'Beauty Tips',
          subtitle: 'Expert advice and tutorials'
        }
      },
      {
        id: 'newsletter-1',
        component: 'newsletter-horizontal',
        enabled: true,
        order: 7,
        props: {
          variant: 'cosmetic',
          layout: 'horizontal'
        }
      },
      {
        id: 'footer-1',
        component: 'footer-default',
        enabled: true,
        order: 8,
        props: {
          variant: 'cosmetic'
        }
      }
    ]
  }
};

// Fonction utilitaire pour obtenir la configuration d'un template
export const getTemplateConfig = (templateId) => {
  return TEMPLATE_DEFAULTS[templateId] || TEMPLATE_DEFAULTS['home-electronic'];
};

// Fonction utilitaire pour obtenir un composant du registre
export const getComponent = (componentId) => {
  return COMPONENT_REGISTRY[componentId];
};

// Fonction pour obtenir tous les composants disponibles par catégorie
export const getComponentsByCategory = () => {
  return {
    hero: Object.keys(COMPONENT_REGISTRY).filter(key => key.startsWith('hero-')),
    categories: Object.keys(COMPONENT_REGISTRY).filter(key => key.startsWith('categories-')),
    products: Object.keys(COMPONENT_REGISTRY).filter(key => key.startsWith('products-')),
    collections: Object.keys(COMPONENT_REGISTRY).filter(key => key.startsWith('collections-')),
    testimonials: Object.keys(COMPONENT_REGISTRY).filter(key => key.startsWith('testimonials-')),
    blogs: Object.keys(COMPONENT_REGISTRY).filter(key => key.startsWith('blogs-')),
    newsletter: Object.keys(COMPONENT_REGISTRY).filter(key => key.startsWith('newsletter-')),
    marquee: Object.keys(COMPONENT_REGISTRY).filter(key => key.startsWith('marquee-')),
    countdown: Object.keys(COMPONENT_REGISTRY).filter(key => key.startsWith('countdown-')),
    footer: Object.keys(COMPONENT_REGISTRY).filter(key => key.startsWith('footer-'))
  };
};

export default {
  COMPONENT_REGISTRY,
  TEMPLATE_DEFAULTS,
  getTemplateConfig,
  getComponent,
  getComponentsByCategory
};
        id: 'hero-1',
        type: 'hero',
        variant: 'hero-electronic',
        enabled: true,
        order: 1,
        config: { showStore: true, autoplay: true, variant: 'electronic' }
      },
      {
        id: 'categories-1',
        type: 'categories',
        variant: 'categories-electronic',
        enabled: true,
        order: 2,
        config: { limit: 6, showTitle: true, variant: 'electronic' }
      },
      {
        id: 'products-1',
        type: 'products',
        variant: 'products-electronic',
        enabled: true,
        order: 3,
        config: { title: 'Trending Electronics', limit: 8, variant: 'electronic' }
      },
      {
        id: 'collections-1',
        type: 'collections',
        variant: 'collections-electronic',
        enabled: true,
        order: 4,
        config: { layout: 'banner', variant: 'electronic' }
      },
      {
        id: 'countdown-1',
        type: 'countdown',
        variant: 'countdown',
        enabled: true,
        order: 5,
        config: { title: 'Flash Sale', showProducts: true, variant: 'electronic' }
      },
      {
        id: 'testimonials-1',
        type: 'testimonials',
        variant: 'testimonials',
        enabled: true,
        order: 6,
        config: { limit: 4, variant: 'electronic' }
      },
      {
        id: 'marquee-1',
        type: 'marquee',
        variant: 'marquee',
        enabled: true,
        order: 7,
        config: { text: 'Free Shipping on Orders Over $50', variant: 'electronic' }
      },
      {
        id: 'blogs-1',
        type: 'blogs',
        variant: 'blogs',
        enabled: true,
        order: 8,
        config: { limit: 3, variant: 'electronic' }
      },
      {
        id: 'footer-1',
        type: 'footer',
        variant: 'footer',
        enabled: true,
        order: 9,
        config: { variant: 'electronic' }
      }
    ]
  },
  
  'home-fashion-01': {
    name: 'Fashion Store',
    sections: [
      {
        id: 'hero-1',
        type: 'hero',
        variant: 'hero-fashion',
        enabled: true,
        order: 1,
        config: { showStore: true, variant: 'fashion' }
      },
      {
        id: 'categories-1',
        type: 'categories',
        variant: 'categories-fashion',
        enabled: true,
        order: 2,
        config: { limit: 8, variant: 'fashion' }
      },
      {
        id: 'products-1',
        type: 'products',
        variant: 'products-fashion',
        enabled: true,
        order: 3,
        config: { title: 'New Arrivals', limit: 12, variant: 'fashion' }
      },
      {
        id: 'collections-1',
        type: 'collections',
        variant: 'collections-fashion',
        enabled: true,
        order: 4,
        config: { layout: 'grid', variant: 'fashion' }
      },
      {
        id: 'newsletter-1',
        type: 'newsletter',
        variant: 'newsletter',
        enabled: true,
        order: 5,
        config: { title: 'Style Updates', variant: 'fashion' }
      },
      {
        id: 'footer-1',
        type: 'footer',
        variant: 'footer',
        enabled: true,
        order: 6,
        config: { variant: 'fashion' }
      }
    ]
  },
  
  'home-cosmetic': {
    name: 'Beauty & Cosmetics',
    sections: [
      {
        id: 'hero-1',
        type: 'hero',
        variant: 'hero-cosmetic',
        enabled: true,
        order: 1,
        config: { showStore: true, variant: 'cosmetic' }
      },
      {
        id: 'categories-1',
        type: 'categories',
        variant: 'categories-grid',
        enabled: true,
        order: 2,
        config: { limit: 6, variant: 'cosmetic' }
      },
      {
        id: 'products-1',
        type: 'products',
        variant: 'products-grid',
        enabled: true,
        order: 3,
        config: { title: 'Beauty Essentials', limit: 8, variant: 'cosmetic' }
      },
      {
        id: 'testimonials-1',
        type: 'testimonials',
        variant: 'testimonials',
        enabled: true,
        order: 4,
        config: { limit: 6, variant: 'cosmetic' }
      },
      {
        id: 'footer-1',
        type: 'footer',
        variant: 'footer',
        enabled: true,
        order: 5,
        config: { variant: 'cosmetic' }
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
