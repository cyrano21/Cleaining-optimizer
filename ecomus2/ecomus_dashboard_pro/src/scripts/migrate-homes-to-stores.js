/**
 * PHASE 1.2 : Script de Migration - Homes → Stores
 * Transforme chaque home existante en store individuelle
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Configuration de la base de données
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI non défini dans .env.local');
  process.exit(1);
}

// Définition du schéma Store (complet pour la migration)
const StoreSchema = new mongoose.Schema({
  name: String,
  slug: { type: String, unique: true },
  description: String,
  logo: String,
  banner: String,
  
  // Nouveaux champs homes
  homeTheme: String,
  homeTemplate: String,
  homeName: String,
  homeDescription: String,
  
  // Système d'activation
  isActive: { type: Boolean, default: false },
  activatedAt: Date,
  activatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Assignment vendeur
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  vendorRequestedAt: Date,
  vendorStatus: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' },
  
  // Customisations
  customizations: {
    colors: {
      primary: { type: String, default: '#000000' },
      secondary: { type: String, default: '#FFFFFF' },
      accent: { type: String, default: '#FF6B6B' }
    },
    branding: {
      logo: String,
      favicon: String,
      storeName: String
    },
    layout: {
      style: { type: String, enum: ['default', 'modern', 'minimal'], default: 'default' },
      headerType: { type: String, enum: ['classic', 'centered', 'split'], default: 'classic' },
      footerType: { type: String, enum: ['simple', 'detailed', 'minimal'], default: 'simple' }
    }
  },
  
  // SEO
  seo: {
    title: String,
    description: String,
    keywords: [String],
    ogImage: String
  },
  
  // Analytics
  analytics: {
    visitorsCount: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 },
    topProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
  },
  
  // Champs existants
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  contact: {
    email: String,
    phone: String,
    website: String
  },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  status: { type: String, enum: ['active', 'inactive', 'pending', 'suspended'], default: 'inactive' },
  featured: { type: Boolean, default: false },
  settings: {
    allowReviews: { type: Boolean, default: true },
    autoApproveProducts: { type: Boolean, default: false },
    minOrderAmount: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 5.99 },
    freeShippingThreshold: { type: Number, default: 50 },
    taxRate: { type: Number, default: 20 },
    currency: { type: String, default: 'EUR' },
    timezone: { type: String, default: 'Europe/Paris' }
  },
  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String,
    youtube: String
  },
  metrics: {
    totalProducts: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 }
  },
  verification: {
    isVerified: { type: Boolean, default: false },
    verifiedAt: Date,
    documents: [String]
  }
}, { timestamps: true });

const Store = mongoose.models.Store || mongoose.model('Store', StoreSchema);

// Liste complète des homes avec leurs métadonnées
const homesToStores = [
  {
    homeTheme: 'modern-02',
    homeTemplate: '/home-02',
    homeName: 'Modern Store',
    homeDescription: 'Boutique moderne avec design épuré et tendance',
    slug: 'modern-store',
    seo: {
      title: 'Modern Store - Boutique Design Moderne',
      description: 'Découvrez notre boutique au design moderne et épuré avec les dernières tendances',
      keywords: ['moderne', 'design', 'tendance', 'épuré']
    }
  },
  {
    homeTheme: 'minimal-03',
    homeTemplate: '/home-03',
    homeName: 'Minimal Store',
    homeDescription: 'Boutique minimaliste privilégiant l\'essentiel et la simplicité',
    slug: 'minimal-store',
    seo: {
      title: 'Minimal Store - Boutique Minimaliste',
      description: 'Boutique minimaliste où chaque élément a sa raison d\'être. Simplicité et élégance.',
      keywords: ['minimaliste', 'simple', 'élégant', 'essentiel']
    }
  },
  {
    homeTheme: 'creative-04',
    homeTemplate: '/home-04',
    homeName: 'Creative Store',
    homeDescription: 'Boutique créative pour les esprits artistiques et innovants',
    slug: 'creative-store',
    seo: {
      title: 'Creative Store - Boutique Créative',
      description: 'Boutique créative pour les amateurs d\'art et d\'innovation. Trouvez l\'inspiration.',
      keywords: ['créatif', 'artistique', 'innovation', 'inspiration']
    }
  },
  {
    homeTheme: 'elegant-05',
    homeTemplate: '/home-05',
    homeName: 'Elegant Store',
    homeDescription: 'Boutique élégante aux lignes raffinées et au style sophistiqué',
    slug: 'elegant-store',
    seo: {
      title: 'Elegant Store - Boutique Élégante',
      description: 'Boutique élégante au style sophistiqué. Raffinement et distinction assurés.',
      keywords: ['élégant', 'sophistiqué', 'raffiné', 'distinction']
    }
  },
  {
    homeTheme: 'trendy-06',
    homeTemplate: '/home-06',
    homeName: 'Trendy Store',
    homeDescription: 'Boutique branchée suivant les dernières tendances du moment',
    slug: 'trendy-store',
    seo: {
      title: 'Trendy Store - Boutique Tendance',
      description: 'Boutique branchée avec les dernières tendances. Restez à la pointe de la mode.',
      keywords: ['tendance', 'branché', 'mode', 'actualité']
    }
  },
  {
    homeTheme: 'premium-07',
    homeTemplate: '/home-07',
    homeName: 'Premium Store',
    homeDescription: 'Boutique premium offrant une expérience haut de gamme',
    slug: 'premium-store',
    seo: {
      title: 'Premium Store - Boutique Haut de Gamme',
      description: 'Boutique premium pour une expérience d\'achat exceptionnelle. Qualité supérieure.',
      keywords: ['premium', 'haut de gamme', 'luxe', 'qualité']
    }
  },
  {
    homeTheme: 'urban-08',
    homeTemplate: '/home-08',
    homeName: 'Urban Store',
    homeDescription: 'Boutique urbaine au style streetwear et contemporain',
    slug: 'urban-store',
    seo: {
      title: 'Urban Store - Boutique Urbaine',
      description: 'Boutique urbaine avec style streetwear et design contemporain. Esprit ville.',
      keywords: ['urbain', 'streetwear', 'contemporain', 'ville']
    }
  },
  {
    homeTheme: 'accessories',
    homeTemplate: '/home-accessories',
    homeName: 'Accessoires Mode',
    homeDescription: 'Boutique spécialisée dans les accessoires de mode et bijoux tendance',
    slug: 'accessoires-mode',
    seo: {
      title: 'Accessoires Mode - Bijoux & Accessoires Tendance',
      description: 'Découvrez notre collection d\'accessoires de mode, bijoux et maroquinerie tendance.',
      keywords: ['accessoires', 'bijoux', 'mode', 'maroquinerie', 'tendance']
    }
  },
  {
    homeTheme: 'activewear',
    homeTemplate: '/home-activewear',
    homeName: 'Sport & Fitness',
    homeDescription: 'Boutique dédiée aux vêtements et équipements de sport et fitness',
    slug: 'sport-fitness',
    seo: {
      title: 'Sport & Fitness - Vêtements et Équipements Sportifs',
      description: 'Vêtements de sport, équipements fitness et accessoires pour tous vos entraînements.',
      keywords: ['sport', 'fitness', 'entraînement', 'équipement', 'vêtements']
    }
  },
  {
    homeTheme: 'baby',
    homeTemplate: '/home-baby',
    homeName: 'Bébé & Enfants',
    homeDescription: 'Boutique spécialisée dans les produits pour bébés et enfants',
    slug: 'bebe-enfants',
    seo: {
      title: 'Bébé & Enfants - Tout pour les Petits',
      description: 'Produits pour bébés et enfants : vêtements, jouets, puériculture et accessoires.',
      keywords: ['bébé', 'enfants', 'puériculture', 'jouets', 'vêtements']
    }
  },
  {
    homeTheme: 'bookstore',
    homeTemplate: '/home-bookstore',
    homeName: 'Librairie',
    homeDescription: 'Librairie en ligne avec une vaste sélection de livres',
    slug: 'librairie',
    seo: {
      title: 'Librairie - Livres & Littérature',
      description: 'Large sélection de livres, romans, BD, guides et ouvrages spécialisés.',
      keywords: ['livres', 'librairie', 'littérature', 'romans', 'lecture']
    }
  },
  {
    homeTheme: 'camping',
    homeTemplate: '/home-camp-and-hike',
    homeName: 'Camping & Randonnée',
    homeDescription: 'Équipements et matériel pour camping, randonnée et activités outdoor',
    slug: 'camping-randonnee',
    seo: {
      title: 'Camping & Randonnée - Équipements Outdoor',
      description: 'Équipements de camping, randonnée et activités outdoor. Matériel de qualité.',
      keywords: ['camping', 'randonnée', 'outdoor', 'équipement', 'nature']
    }
  },
  {
    homeTheme: 'ceramic',
    homeTemplate: '/home-ceramic',
    homeName: 'Céramique & Artisanat',
    homeDescription: 'Boutique d\'artisanat, céramiques et créations artisanales uniques',
    slug: 'ceramique-artisanat',
    seo: {
      title: 'Céramique & Artisanat - Créations Artisanales',
      description: 'Céramiques, poteries et créations artisanales uniques. Savoir-faire authentique.',
      keywords: ['céramique', 'artisanat', 'poterie', 'fait main', 'authentique']
    }
  },
  {
    homeTheme: 'cosmetic',
    homeTemplate: '/home-cosmetic',
    homeName: 'Cosmétiques & Beauté',
    homeDescription: 'Produits de beauté, cosmétiques et soins pour sublimer votre peau',
    slug: 'cosmetiques-beaute',
    seo: {
      title: 'Cosmétiques & Beauté - Soins & Maquillage',
      description: 'Produits de beauté, cosmétiques, soins du visage et maquillage de qualité.',
      keywords: ['cosmétiques', 'beauté', 'maquillage', 'soins', 'peau']
    }
  },
  {
    homeTheme: 'decor',
    homeTemplate: '/home-decor',
    homeName: 'Décoration Maison',
    homeDescription: 'Articles de décoration pour embellir votre intérieur',
    slug: 'decoration-maison',
    seo: {
      title: 'Décoration Maison - Art de Vivre & Déco',
      description: 'Articles de décoration, objets d\'art et accessoires pour embellir votre maison.',
      keywords: ['décoration', 'maison', 'intérieur', 'art de vivre', 'design']
    }
  },
  {
    homeTheme: 'dog-accessories',
    homeTemplate: '/home-dog-accessories',
    homeName: 'Accessoires Chien',
    homeDescription: 'Boutique spécialisée dans les accessoires et produits pour chiens',
    slug: 'accessoires-chien',
    seo: {
      title: 'Accessoires Chien - Tout pour votre Compagnon',
      description: 'Accessoires, jouets, alimentation et soins pour chiens. Tout pour votre fidèle ami.',
      keywords: ['chien', 'accessoires', 'jouets', 'animaux', 'compagnon']
    }
  },
  {
    homeTheme: 'electric-bike',
    homeTemplate: '/home-electric-bike',
    homeName: 'Vélos Électriques',
    homeDescription: 'Vélos électriques et accessoires pour une mobilité écologique',
    slug: 'velos-electriques',
    seo: {
      title: 'Vélos Électriques - Mobilité Écologique',
      description: 'Vélos électriques, e-bikes et accessoires pour une mobilité durable et écologique.',
      keywords: ['vélo électrique', 'e-bike', 'mobilité', 'écologique', 'transport']
    }
  },
  {
    homeTheme: 'electronic',
    homeTemplate: '/home-electronic',
    homeName: 'Électronique',
    homeDescription: 'Produits électroniques, high-tech et gadgets innovants',
    slug: 'electronique',
    seo: {
      title: 'Électronique - High-Tech & Gadgets',
      description: 'Produits électroniques, smartphones, ordinateurs et gadgets high-tech innovants.',
      keywords: ['électronique', 'high-tech', 'smartphones', 'gadgets', 'innovation']
    }
  },
  {
    homeTheme: 'food',
    homeTemplate: '/home-food',
    homeName: 'Alimentation',
    homeDescription: 'Produits alimentaires de qualité, épicerie fine et spécialités',
    slug: 'alimentation',
    seo: {
      title: 'Alimentation - Épicerie Fine & Spécialités',
      description: 'Produits alimentaires de qualité, épicerie fine et spécialités gastronomiques.',
      keywords: ['alimentation', 'épicerie', 'gastronomie', 'produits', 'qualité']
    }
  },
  {
    homeTheme: 'footwear',
    homeTemplate: '/home-footwear',
    homeName: 'Chaussures',
    homeDescription: 'Chaussures pour homme, femme et enfant, tous styles confondus',
    slug: 'chaussures',
    seo: {
      title: 'Chaussures - Mode & Confort pour Tous',
      description: 'Chaussures homme, femme et enfant. Mode, confort et qualité réunis.',
      keywords: ['chaussures', 'mode', 'confort', 'homme', 'femme', 'enfant']
    }
  },
  {
    homeTheme: 'furniture',
    homeTemplate: '/home-furniture',
    homeName: 'Mobilier',
    homeDescription: 'Meubles et mobilier design pour aménager votre intérieur',
    slug: 'mobilier',
    seo: {
      title: 'Mobilier - Meubles Design & Aménagement',
      description: 'Meubles et mobilier design pour aménager et décorer votre intérieur avec style.',
      keywords: ['mobilier', 'meubles', 'design', 'aménagement', 'intérieur']
    }
  },
  {
    homeTheme: 'furniture-premium',
    homeTemplate: '/home-furniture-02',
    homeName: 'Mobilier Premium',
    homeDescription: 'Mobilier haut de gamme et pièces de designer pour intérieurs d\'exception',
    slug: 'mobilier-premium',
    seo: {
      title: 'Mobilier Premium - Meubles Haut de Gamme',
      description: 'Mobilier haut de gamme et pièces de designer pour créer des intérieurs d\'exception.',
      keywords: ['mobilier premium', 'haut de gamme', 'designer', 'luxe', 'exception']
    }
  },
  {
    homeTheme: 'gaming',
    homeTemplate: '/home-gaming-accessories',
    homeName: 'Gaming',
    homeDescription: 'Accessoires gaming, équipements esport et produits pour gamers',
    slug: 'gaming',
    seo: {
      title: 'Gaming - Accessoires & Équipements Esport',
      description: 'Accessoires gaming, équipements esport et produits spécialisés pour gamers.',
      keywords: ['gaming', 'esport', 'accessoires', 'gamers', 'équipements']
    }
  },
  {
    homeTheme: 'giftcard',
    homeTemplate: '/home-giftcard',
    homeName: 'Cartes Cadeaux',
    homeDescription: 'Cartes cadeaux et bons d\'achat pour faire plaisir à vos proches',
    slug: 'cartes-cadeaux',
    seo: {
      title: 'Cartes Cadeaux - Bons d\'Achat & Présents',
      description: 'Cartes cadeaux et bons d\'achat pour offrir le choix à vos proches.',
      keywords: ['cartes cadeaux', 'bons achat', 'présents', 'offrir', 'plaisir']
    }
  },
  {
    homeTheme: 'glasses',
    homeTemplate: '/home-glasses',
    homeName: 'Lunettes & Optique',
    homeDescription: 'Lunettes de vue, solaires et accessoires optiques de qualité',
    slug: 'lunettes-optique',
    seo: {
      title: 'Lunettes & Optique - Vue & Solaire',
      description: 'Lunettes de vue, lunettes de soleil et accessoires optiques de qualité.',
      keywords: ['lunettes', 'optique', 'vue', 'solaire', 'vision']
    }
  },
  {
    homeTheme: 'grocery',
    homeTemplate: '/home-grocery',
    homeName: 'Épicerie',
    homeDescription: 'Épicerie en ligne avec produits frais et de consommation courante',
    slug: 'epicerie',
    seo: {
      title: 'Épicerie - Produits Frais & Consommation',
      description: 'Épicerie en ligne avec produits frais, bio et de consommation courante.',
      keywords: ['épicerie', 'produits frais', 'bio', 'consommation', 'alimentaire']
    }
  },
  {
    homeTheme: 'handbag',
    homeTemplate: '/home-handbag',
    homeName: 'Maroquinerie',
    homeDescription: 'Sacs à main, maroquinerie et accessoires en cuir de qualité',
    slug: 'maroquinerie',
    seo: {
      title: 'Maroquinerie - Sacs & Accessoires Cuir',
      description: 'Sacs à main, maroquinerie et accessoires en cuir de qualité supérieure.',
      keywords: ['maroquinerie', 'sacs à main', 'cuir', 'accessoires', 'qualité']
    }
  },
  {
    homeTheme: 'headphone',
    homeTemplate: '/home-headphone',
    homeName: 'Audio & Casques',
    homeDescription: 'Casques audio, écouteurs et équipements son haute fidélité',
    slug: 'audio-casques',
    seo: {
      title: 'Audio & Casques - Son Haute Fidélité',
      description: 'Casques audio, écouteurs et équipements son pour une qualité haute fidélité.',
      keywords: ['audio', 'casques', 'écouteurs', 'son', 'haute fidélité']
    }
  },
  {
    homeTheme: 'jewelry',
    homeTemplate: '/home-jewerly',
    homeName: 'Bijouterie',
    homeDescription: 'Bijoux précieux, montres et accessoires de luxe',
    slug: 'bijouterie',
    seo: {
      title: 'Bijouterie - Bijoux & Montres de Luxe',
      description: 'Bijoux précieux, montres de luxe et accessoires raffinés pour toutes occasions.',
      keywords: ['bijouterie', 'bijoux', 'montres', 'luxe', 'précieux']
    }
  },
  {
    homeTheme: 'kids',
    homeTemplate: '/home-kids',
    homeName: 'Mode Enfants',
    homeDescription: 'Vêtements et mode pour enfants de tous âges',
    slug: 'mode-enfants',
    seo: {
      title: 'Mode Enfants - Vêtements & Style Kids',
      description: 'Vêtements mode pour enfants, style et confort pour les petits et grands.',
      keywords: ['mode enfants', 'vêtements', 'style', 'kids', 'confort']
    }
  },
  {
    homeTheme: 'kitchen',
    homeTemplate: '/home-kitchen-wear',
    homeName: 'Ustensiles Cuisine',
    homeDescription: 'Ustensiles de cuisine, électroménager et accessoires culinaires',
    slug: 'ustensiles-cuisine',
    seo: {
      title: 'Ustensiles Cuisine - Art Culinaire & Équipement',
      description: 'Ustensiles de cuisine, électroménager et accessoires pour l\'art culinaire.',
      keywords: ['ustensiles', 'cuisine', 'culinaire', 'électroménager', 'accessoires']
    }
  },
  {
    homeTheme: 'men',
    homeTemplate: '/home-men',
    homeName: 'Mode Homme',
    homeDescription: 'Mode masculine, vêtements et accessoires pour homme moderne',
    slug: 'mode-homme',
    seo: {
      title: 'Mode Homme - Style & Élégance Masculine',
      description: 'Mode masculine, vêtements et accessoires pour l\'homme moderne et élégant.',
      keywords: ['mode homme', 'masculin', 'vêtements', 'style', 'élégance']
    }
  },
  {
    homeTheme: 'multi-brand',
    homeTemplate: '/home-multi-brand',
    homeName: 'Multi-Marques',
    homeDescription: 'Boutique multi-marques regroupant les meilleures sélections',
    slug: 'multi-marques',
    seo: {
      title: 'Multi-Marques - Sélection Premium',
      description: 'Boutique multi-marques avec une sélection premium des meilleures enseignes.',
      keywords: ['multi-marques', 'sélection', 'premium', 'marques', 'qualité']
    }
  },
  {
    homeTheme: 'paddle-boards',
    homeTemplate: '/home-paddle-boards',
    homeName: 'Sports Nautiques',
    homeDescription: 'Équipements pour sports nautiques, paddle et activités aquatiques',
    slug: 'sports-nautiques',
    seo: {
      title: 'Sports Nautiques - Paddle & Activités Aquatiques',
      description: 'Équipements pour sports nautiques, paddle boards et activités aquatiques.',
      keywords: ['sports nautiques', 'paddle', 'aquatique', 'mer', 'équipements']
    }
  },
  {
    homeTheme: 'personalized',
    homeTemplate: '/home-personalized-pod',
    homeName: 'Produits Personnalisés',
    homeDescription: 'Produits personnalisables et créations sur mesure',
    slug: 'produits-personnalises',
    seo: {
      title: 'Produits Personnalisés - Créations Sur Mesure',
      description: 'Produits personnalisables et créations sur mesure pour des cadeaux uniques.',
      keywords: ['personnalisé', 'sur mesure', 'unique', 'création', 'cadeau']
    }
  },
  {
    homeTheme: 'phonecase',
    homeTemplate: '/home-phonecase',
    homeName: 'Coques & Accessoires Mobile',
    homeDescription: 'Coques de téléphone et accessoires pour smartphones',
    slug: 'coques-accessoires-mobile',
    seo: {
      title: 'Coques & Accessoires Mobile - Protection Smartphone',
      description: 'Coques de protection et accessoires pour smartphones et tablettes.',
      keywords: ['coques', 'accessoires', 'mobile', 'smartphone', 'protection']
    }
  },
  {
    homeTheme: 'pickleball',
    homeTemplate: '/home-pickleball',
    homeName: 'Pickleball',
    homeDescription: 'Équipements et accessoires pour la pratique du pickleball',
    slug: 'pickleball',
    seo: {
      title: 'Pickleball - Équipements & Accessoires',
      description: 'Raquettes, balles et équipements pour la pratique du pickleball.',
      keywords: ['pickleball', 'raquettes', 'sport', 'équipements', 'jeu']
    }
  },
  {
    homeTheme: 'plant',
    homeTemplate: '/home-plant',
    homeName: 'Plantes & Jardinage',
    homeDescription: 'Plantes d\'intérieur, jardinage et accessoires pour espaces verts',
    slug: 'plantes-jardinage',
    seo: {
      title: 'Plantes & Jardinage - Espaces Verts & Nature',
      description: 'Plantes d\'intérieur, outils de jardinage et accessoires pour espaces verts.',
      keywords: ['plantes', 'jardinage', 'nature', 'intérieur', 'espaces verts']
    }
  },
  {
    homeTheme: 'pod-store',
    homeTemplate: '/home-pod-store',
    homeName: 'Pod Store',
    homeDescription: 'Boutique spécialisée dans les pods et systèmes modulaires',
    slug: 'pod-store',
    seo: {
      title: 'Pod Store - Systèmes Modulaires & Pods',
      description: 'Boutique spécialisée dans les pods et systèmes modulaires innovants.',
      keywords: ['pod', 'modulaire', 'systèmes', 'innovation', 'design']
    }
  },
  {
    homeTheme: 'search',
    homeTemplate: '/home-search',
    homeName: 'Recherche Avancée',
    homeDescription: 'Interface de recherche avancée pour trouver tous vos produits',
    slug: 'recherche-avancee',
    seo: {
      title: 'Recherche Avancée - Trouvez Tout Facilement',
      description: 'Interface de recherche avancée pour trouver rapidement tous vos produits.',
      keywords: ['recherche', 'avancée', 'trouver', 'produits', 'facile']
    }
  },
  {
    homeTheme: 'setup-gear',
    homeTemplate: '/home-setup-gear',
    homeName: 'Équipement Bureau',
    homeDescription: 'Équipements et accessoires pour setup de bureau et télétravail',
    slug: 'equipement-bureau',
    seo: {
      title: 'Équipement Bureau - Setup & Télétravail',
      description: 'Équipements et accessoires pour créer le setup de bureau parfait.',
      keywords: ['équipement', 'bureau', 'setup', 'télétravail', 'productivité']
    }
  },
  {
    homeTheme: 'skateboard',
    homeTemplate: '/home-skateboard',
    homeName: 'Skateboard',
    homeDescription: 'Skateboards, accessoires et équipements pour la pratique du skate',
    slug: 'skateboard',
    seo: {
      title: 'Skateboard - Planches & Accessoires Skate',
      description: 'Skateboards, planches et accessoires pour tous les niveaux de skate.',
      keywords: ['skateboard', 'skate', 'planches', 'sport', 'urbain']
    }
  },
  {
    homeTheme: 'skincare',
    homeTemplate: '/home-skincare',
    homeName: 'Soins de la Peau',
    homeDescription: 'Produits de soins pour tous types de peau et routines beauté',
    slug: 'soins-peau',
    seo: {
      title: 'Soins de la Peau - Beauté & Routine',
      description: 'Produits de soins pour tous types de peau et routines beauté personnalisées.',
      keywords: ['soins', 'peau', 'beauté', 'routine', 'visage']
    }
  },
  {
    homeTheme: 'sneaker',
    homeTemplate: '/home-sneaker',
    homeName: 'Sneakers',
    homeDescription: 'Sneakers et chaussures de sport tendance pour tous styles',
    slug: 'sneakers',
    seo: {
      title: 'Sneakers - Chaussures Sport & Tendance',
      description: 'Collection de sneakers et chaussures de sport tendance pour tous les styles.',
      keywords: ['sneakers', 'chaussures sport', 'tendance', 'style', 'mode']
    }
  },
  {
    homeTheme: 'sock',
    homeTemplate: '/home-sock',
    homeName: 'Chaussettes',
    homeDescription: 'Chaussettes originales, confortables et stylées pour tous',
    slug: 'chaussettes',
    seo: {
      title: 'Chaussettes - Confort & Style aux Pieds',
      description: 'Chaussettes originales, confortables et stylées pour homme, femme et enfant.',
      keywords: ['chaussettes', 'confort', 'style', 'originales', 'pieds']
    }
  },
  {
    homeTheme: 'stroller',
    homeTemplate: '/home-stroller',
    homeName: 'Poussettes & Puériculture',
    homeDescription: 'Poussettes, équipements de puériculture et accessoires bébé',
    slug: 'poussettes-puericulture',
    seo: {
      title: 'Poussettes & Puériculture - Tout pour Bébé',
      description: 'Poussettes, équipements de puériculture et accessoires pour bébé.',
      keywords: ['poussettes', 'puériculture', 'bébé', 'équipements', 'accessoires']
    }
  },
  {
    homeTheme: 'swimwear',
    homeTemplate: '/home-swimwear',
    homeName: 'Maillots de Bain',
    homeDescription: 'Maillots de bain et vêtements de plage pour homme et femme',
    slug: 'maillots-bain',
    seo: {
      title: 'Maillots de Bain - Mode Plage & Piscine',
      description: 'Maillots de bain et vêtements de plage tendance pour homme et femme.',
      keywords: ['maillots de bain', 'plage', 'piscine', 'été', 'mode']
    }
  },
  {
    homeTheme: 'tee',
    homeTemplate: '/home-tee',
    homeName: 'T-Shirts & Casual',
    homeDescription: 'T-shirts et vêtements casual pour un style décontracté',
    slug: 'tshirts-casual',
    seo: {
      title: 'T-Shirts & Casual - Style Décontracté',
      description: 'T-shirts et vêtements casual pour un style décontracté et confortable.',
      keywords: ['t-shirts', 'casual', 'décontracté', 'confortable', 'style']
    }
  }
];

/**
 * Connexion à la base de données
 */
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connexion MongoDB établie');
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error);
    process.exit(1);
  }
}

/**
 * Créer les stores à partir des homes
 */
async function createStoresFromHomes() {
  console.log('🚀 Début de la migration homes → stores...');
  
  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const homeData of homesToStores) {
    try {
      // Vérifier si la store existe déjà
      const existingStore = await Store.findOne({ slug: homeData.slug });
      
      if (existingStore) {
        console.log(`⚠️  Store "${homeData.homeName}" existe déjà (slug: ${homeData.slug})`);
        skipped++;
        continue;
      }

      // Créer la nouvelle store
      const newStore = new Store({
        name: homeData.homeName,
        slug: homeData.slug,
        description: homeData.homeDescription,
        homeTheme: homeData.homeTheme,
        homeTemplate: homeData.homeTemplate,
        homeName: homeData.homeName,
        homeDescription: homeData.homeDescription,
        
        // Valeurs par défaut pour les champs requis
        address: {
          street: 'À définir',
          city: 'À définir',
          state: 'À définir',
          postalCode: '00000',
          country: 'France'
        },
        contact: {
          email: 'admin@ecomus.fr',
          phone: '+33 1 00 00 00 00'
        },
        // Owner temporaire (sera assigné plus tard)
        owner: new mongoose.Types.ObjectId(),
        
        // Système d'activation
        isActive: false,
        vendorStatus: 'none',
        
        // Customisations par défaut
        customizations: {
          colors: {
            primary: '#000000',
            secondary: '#FFFFFF',
            accent: '#FF6B6B'
          },
          branding: {
            logo: '',
            favicon: '',
            storeName: homeData.homeName
          },
          layout: {
            style: 'default',
            headerType: 'classic',
            footerType: 'simple'
          }
        },
        
        // SEO
        seo: homeData.seo,
        
        // Analytics par défaut
        analytics: {
          visitorsCount: 0,
          conversionRate: 0,
          averageOrderValue: 0,
          topProducts: []
        },
        
        // Autres champs par défaut
        status: 'inactive',
        featured: false,
        categories: [],
        settings: {
          allowReviews: true,
          autoApproveProducts: false,
          minOrderAmount: 0,
          shippingFee: 5.99,
          freeShippingThreshold: 50,
          taxRate: 20,
          currency: 'EUR',
          timezone: 'Europe/Paris'
        },
        socialMedia: {},
        metrics: {
          totalProducts: 0,
          totalOrders: 0,
          totalRevenue: 0,
          averageRating: 0,
          totalReviews: 0
        },
        verification: {
          isVerified: false,
          documents: []
        }
      });

      await newStore.save();
      console.log(`✅ Store créée: "${homeData.homeName}" (${homeData.slug})`);
      created++;

    } catch (error) {
      console.error(`❌ Erreur lors de la création de "${homeData.homeName}":`, error.message);
      errors++;
    }
  }

  console.log('\n📊 RÉSULTATS DE LA MIGRATION:');
  console.log(`✅ Stores créées: ${created}`);
  console.log(`⚠️  Stores existantes: ${skipped}`);
  console.log(`❌ Erreurs: ${errors}`);
  console.log(`📋 Total traité: ${homesToStores.length}`);
}

/**
 * Fonction principale
 */
async function main() {
  try {
    await connectDB();
    await createStoresFromHomes();
    console.log('\n🎉 Migration terminée avec succès!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  }
}

// Exécution du script
if (process.argv[2] === '--run') {
  main();
} else {
  console.log('Pour exécuter la migration, utilisez: node migrate-homes-to-stores.js --run');
}
