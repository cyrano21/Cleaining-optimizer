/**
 * Configuration globale pour les collections dynamiques
 * Ce fichier centralise toutes les configurations des collections par home
 */

export const collectionsConfig = {
  'home-headphone': {
    category: 'headphones',
    variant: 'electronics',
    layout: 'carousel',
    limit: 6,
    featured: true
  },
  'home-electronic': {
    category: 'electronics',
    variant: 'electronics',
    layout: 'grid',
    limit: 8,
    featured: true
  },
  'home-furniture-02': {
    category: 'furniture',
    variant: 'furniture',
    layout: 'grid',
    limit: 6,
    featured: true
  },
  'home-plant': {
    category: 'plants',
    variant: 'nature',
    layout: 'carousel',
    limit: 4,
    featured: true
  },
  'home-pod-store': {
    category: 'electronics',
    variant: 'electronics',
    layout: 'carousel',
    limit: 5,
    featured: true
  },
  'home-5': {
    category: 'fashion',
    variant: 'fashion',
    layout: 'grid',
    limit: 6,
    featured: true
  },
  'home-book-store': {
    category: 'books',
    variant: 'minimal',
    layout: 'grid',
    limit: 8,
    featured: true
  },
  'home-gaming-accessories': {
    category: 'gaming',
    variant: 'gaming',
    layout: 'carousel',
    limit: 6,
    featured: true
  }
};

// Configuration par défaut
export const defaultCollectionConfig = {
  category: null,
  variant: 'default',
  layout: 'grid',
  limit: 6,
  featured: false
};

// Fonction utilitaire pour obtenir la configuration d'un home
export function getCollectionConfig(homeName) {
  return collectionsConfig[homeName] || defaultCollectionConfig;
}

// Types de layouts disponibles
export const availableLayouts = ['grid', 'carousel', 'masonry', 'list'];

// Variantes de style disponibles
export const availableVariants = [
  'default',
  'electronics',
  'fashion',
  'furniture',
  'nature',
  'minimal',
  'gaming',
  'luxury'
];

// Configuration des styles par variante
export const variantStyles = {
  default: {
    containerClass: 'tf-section-2 pt_94 pb_140',
    itemClass: 'collection-item-v4 hover-img',
    titleClass: 'h5',
    descriptionClass: 'subheading'
  },
  electronics: {
    containerClass: 'tf-section-2 pt_94 pb_140 bg-gradient-to-r from-blue-50 to-indigo-50',
    itemClass: 'collection-item-v4 hover-img border border-blue-100 rounded-lg',
    titleClass: 'h5 text-blue-900',
    descriptionClass: 'subheading text-blue-600'
  },
  fashion: {
    containerClass: 'tf-section-2 pt_94 pb_140 bg-gradient-to-r from-pink-50 to-rose-50',
    itemClass: 'collection-item-v4 hover-img border border-pink-100 rounded-lg',
    titleClass: 'h5 text-pink-900',
    descriptionClass: 'subheading text-pink-600'
  },
  furniture: {
    containerClass: 'tf-section-2 pt_94 pb_140 bg-gradient-to-r from-amber-50 to-orange-50',
    itemClass: 'collection-item-v4 hover-img border border-amber-100 rounded-lg',
    titleClass: 'h5 text-amber-900',
    descriptionClass: 'subheading text-amber-600'
  },
  nature: {
    containerClass: 'tf-section-2 pt_94 pb_140 bg-gradient-to-r from-green-50 to-emerald-50',
    itemClass: 'collection-item-v4 hover-img border border-green-100 rounded-lg',
    titleClass: 'h5 text-green-900',
    descriptionClass: 'subheading text-green-600'
  },
  minimal: {
    containerClass: 'tf-section-2 pt_94 pb_140 bg-gray-50',
    itemClass: 'collection-item-v4 hover-img border border-gray-200 rounded-lg shadow-sm',
    titleClass: 'h5 text-gray-900',
    descriptionClass: 'subheading text-gray-600'
  },
  gaming: {
    containerClass: 'tf-section-2 pt_94 pb_140 bg-gradient-to-r from-purple-50 to-violet-50',
    itemClass: 'collection-item-v4 hover-img border border-purple-100 rounded-lg',
    titleClass: 'h5 text-purple-900',
    descriptionClass: 'subheading text-purple-600'
  },
  luxury: {
    containerClass: 'tf-section-2 pt_94 pb_140 bg-gradient-to-r from-yellow-50 to-amber-50',
    itemClass: 'collection-item-v4 hover-img border border-yellow-200 rounded-lg shadow-lg',
    titleClass: 'h5 text-yellow-900',
    descriptionClass: 'subheading text-yellow-700'
  }
};

// Configuration des breakpoints pour les carousels
export const carouselBreakpoints = {
  default: {
    640: { slidesPerView: 2 },
    768: { slidesPerView: 3 },
    1024: { slidesPerView: 4 }
  },
  large: {
    640: { slidesPerView: 2 },
    768: { slidesPerView: 3 },
    1024: { slidesPerView: 5 }
  },
  small: {
    640: { slidesPerView: 1 },
    768: { slidesPerView: 2 },
    1024: { slidesPerView: 3 }
  }
};

// Configuration des grilles
export const gridConfigurations = {
  default: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  large: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5',
  small: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  masonry: 'masonry-layout-v4'
};

// Fonction pour obtenir les styles d'une variante
export function getVariantStyles(variant) {
  return variantStyles[variant] || variantStyles.default;
}

// Fonction pour obtenir la configuration de breakpoints
export function getCarouselBreakpoints(limit) {
  if (limit <= 3) return carouselBreakpoints.small;
  if (limit >= 6) return carouselBreakpoints.large;
  return carouselBreakpoints.default;
}

// Fonction pour obtenir la configuration de grille
export function getGridConfiguration(limit, layout) {
  if (layout === 'masonry') return gridConfigurations.masonry;
  if (limit <= 3) return gridConfigurations.small;
  if (limit >= 6) return gridConfigurations.large;
  return gridConfigurations.default;
}