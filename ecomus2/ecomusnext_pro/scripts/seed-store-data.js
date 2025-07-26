const { MongoClient } = require('mongodb');

// Configuration MongoDB - utiliser l'URI directe
const MONGODB_URI = 'mongodb+srv://louiscyrano:7b0af88dcf06@cluster0.mongodb.net/ecomus?retryWrites=true&w=majority';
const client = new MongoClient(MONGODB_URI);

// Données de seed pour remplir les tableaux vides
const seedData = {
  // Catégories d'exemple
  categories: [
    {
      _id: 'cat-1',
      name: 'Vêtements',
      slug: 'vetements',
      description: 'Collection de vêtements écologiques',
      image: '/images/categories/vetements.jpg',
      isActive: true,
      parentId: null,
      sortOrder: 1
    },
    {
      _id: 'cat-2', 
      name: 'Accessoires',
      slug: 'accessoires',
      description: 'Accessoires de mode durables',
      image: '/images/categories/accessoires.jpg',
      isActive: true,
      parentId: null,
      sortOrder: 2
    },
    {
      _id: 'cat-3',
      name: 'Chaussures',
      slug: 'chaussures',
      description: 'Chaussures éco-responsables',
      image: '/images/categories/chaussures.jpg',
      isActive: true,
      parentId: null,
      sortOrder: 3
    },
    {
      _id: 'cat-4',
      name: 'Maison & Déco',
      slug: 'maison-deco',
      description: 'Décoration et objets pour la maison',
      image: '/images/categories/maison.jpg',
      isActive: true,
      parentId: null,
      sortOrder: 4
    }
  ],

  // Produits d'exemple
  sampleProducts: [
    {
      _id: 'prod-1',
      name: 'T-shirt Bio Coton',
      slug: 'tshirt-bio-coton',
      description: 'T-shirt en coton biologique, doux et confortable',
      price: 29.99,
      originalPrice: 39.99,
      image: '/images/products/tshirt-bio.jpg',
      images: ['/images/products/tshirt-bio.jpg', '/images/products/tshirt-bio-2.jpg'],
      category: 'cat-1',
      isNew: true,
      isOnSale: true,
      inStock: true,
      rating: 4.5,
      reviewCount: 23,
      colors: [
        { name: 'Blanc', colorClass: 'bg-white', imgSrc: '/images/products/tshirt-blanc.jpg' },
        { name: 'Noir', colorClass: 'bg-black', imgSrc: '/images/products/tshirt-noir.jpg' }
      ],
      sizes: ['S', 'M', 'L', 'XL']
    },
    {
      _id: 'prod-2',
      name: 'Sac à Main Recyclé',
      slug: 'sac-main-recycle',
      description: 'Sac à main fabriqué à partir de matériaux recyclés',
      price: 79.99,
      image: '/images/products/sac-recycle.jpg',
      images: ['/images/products/sac-recycle.jpg'],
      category: 'cat-2',
      isNew: false,
      isOnSale: false,
      inStock: true,
      rating: 4.8,
      reviewCount: 15,
      colors: [
        { name: 'Marron', colorClass: 'bg-amber-700', imgSrc: '/images/products/sac-marron.jpg' },
        { name: 'Noir', colorClass: 'bg-black', imgSrc: '/images/products/sac-noir.jpg' }
      ]
    },
    {
      _id: 'prod-3',
      name: 'Baskets Éco-Responsables',
      slug: 'baskets-eco-responsables',
      description: 'Baskets fabriquées avec des matériaux durables',
      price: 129.99,
      originalPrice: 149.99,
      image: '/images/products/baskets-eco.jpg',
      images: ['/images/products/baskets-eco.jpg', '/images/products/baskets-eco-2.jpg'],
      category: 'cat-3',
      isNew: true,
      isOnSale: true,
      inStock: true,
      rating: 4.3,
      reviewCount: 31,
      colors: [
        { name: 'Blanc', colorClass: 'bg-white', imgSrc: '/images/products/baskets-blanc.jpg' },
        { name: 'Gris', colorClass: 'bg-gray-400', imgSrc: '/images/products/baskets-gris.jpg' }
      ],
      sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44']
    }
  ],

  // Liens de navigation
  navLinks: [
    {
      _id: 'nav-1',
      title: 'Accueil',
      url: '/',
      order: 1,
      isActive: true
    },
    {
      _id: 'nav-2',
      title: 'Boutique',
      url: '/shop',
      order: 2,
      isActive: true,
      children: [
        { title: 'Vêtements', url: '/shop/vetements' },
        { title: 'Accessoires', url: '/shop/accessoires' },
        { title: 'Chaussures', url: '/shop/chaussures' }
      ]
    },
    {
      _id: 'nav-3',
      title: 'À Propos',
      url: '/about',
      order: 3,
      isActive: true
    },
    {
      _id: 'nav-4',
      title: 'Contact',
      url: '/contact',
      order: 4,
      isActive: true
    }
  ],

  // Liens de pied de page
  footerLinks: [
    {
      _id: 'footer-1',
      section: 'Boutique',
      links: [
        { title: 'Nouveautés', url: '/shop/nouveautes' },
        { title: 'Promotions', url: '/shop/promotions' },
        { title: 'Meilleures ventes', url: '/shop/bestsellers' },
        { title: 'Collections', url: '/shop/collections' }
      ]
    },
    {
      _id: 'footer-2',
      section: 'Service Client',
      links: [
        { title: 'Contact', url: '/contact' },
        { title: 'FAQ', url: '/faq' },
        { title: 'Livraison', url: '/shipping' },
        { title: 'Retours', url: '/returns' }
      ]
    },
    {
      _id: 'footer-3',
      section: 'Entreprise',
      links: [
        { title: 'À propos', url: '/about' },
        { title: 'Notre mission', url: '/mission' },
        { title: 'Développement durable', url: '/sustainability' },
        { title: 'Carrières', url: '/careers' }
      ]
    },
    {
      _id: 'footer-4',
      section: 'Légal',
      links: [
        { title: 'Conditions générales', url: '/terms' },
        { title: 'Politique de confidentialité', url: '/privacy' },
        { title: 'Cookies', url: '/cookies' },
        { title: 'Mentions légales', url: '/legal' }
      ]
    }
  ],

  // Liens sociaux
  socialLinks: [
    {
      _id: 'social-1',
      platform: 'Facebook',
      url: 'https://facebook.com/maboutique',
      icon: 'facebook',
      isActive: true
    },
    {
      _id: 'social-2',
      platform: 'Instagram',
      url: 'https://instagram.com/maboutique',
      icon: 'instagram',
      isActive: true
    },
    {
      _id: 'social-3',
      platform: 'Twitter',
      url: 'https://twitter.com/maboutique',
      icon: 'twitter',
      isActive: true
    },
    {
      _id: 'social-4',
      platform: 'YouTube',
      url: 'https://youtube.com/maboutique',
      icon: 'youtube',
      isActive: true
    },
    {
      _id: 'social-5',
      platform: 'TikTok',
      url: 'https://tiktok.com/@maboutique',
      icon: 'tiktok',
      isActive: true
    }
  ],

  // Vendeurs/collaborateurs
  vendors: [
    {
      _id: 'vendor-1',
      name: 'Marie Dubois',
      email: 'marie.dubois@maboutique.com',
      role: 'Responsable Vêtements',
      avatar: '/images/team/marie.jpg',
      isActive: true,
      permissions: ['manage_products', 'view_orders'],
      joinedAt: new Date('2024-01-15')
    },
    {
      _id: 'vendor-2',
      name: 'Pierre Martin',
      email: 'pierre.martin@maboutique.com',
      role: 'Responsable Accessoires',
      avatar: '/images/team/pierre.jpg',
      isActive: true,
      permissions: ['manage_products', 'view_analytics'],
      joinedAt: new Date('2024-02-01')
    },
    {
      _id: 'vendor-3',
      name: 'Sophie Laurent',
      email: 'sophie.laurent@maboutique.com',
      role: 'Service Client',
      avatar: '/images/team/sophie.jpg',
      isActive: true,
      permissions: ['manage_orders', 'view_customers'],
      joinedAt: new Date('2024-03-10')
    }
  ]
};

async function seedStoreData() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await client.connect();
    console.log('✅ Connecté à MongoDB');

    const db = client.db();
    const storesCollection = db.collection('stores');

    // Lister toutes les stores pour debug
    console.log('🔍 Recherche des stores disponibles...');
    const allStores = await storesCollection.find({}).toArray();
    console.log(`📊 Nombre de stores trouvées: ${allStores.length}`);
    
    if (allStores.length > 0) {
      console.log('🏪 Stores disponibles:');
      allStores.forEach((store, index) => {
        console.log(`  ${index + 1}. ${store.name} (slug: ${store.slug})`);
      });
    }

    // Trouver la store spécifique
    const targetSlug = 'boutique-685ba4ab66267b0af88dcf06';
    console.log(`🎯 Recherche de la store avec le slug: ${targetSlug}`);
    const store = await storesCollection.findOne({ slug: targetSlug });
    
    if (!store) {
      console.error(`❌ Store avec le slug ${targetSlug} non trouvé.`);
      console.log('💡 Essayons avec la première store disponible...');
      
      if (allStores.length > 0) {
        const firstStore = allStores[0];
        console.log(`🔄 Utilisation de la store: ${firstStore.name} (${firstStore.slug})`);
        return await updateStoreData(storesCollection, firstStore);
      } else {
        console.error('❌ Aucune store trouvée dans la base de données.');
        process.exit(1);
      }
    }

    return await updateStoreData(storesCollection, store);

  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
  } finally {
    await client.close();
    console.log('🔌 Connexion fermée');
  }
}

// Fonction pour mettre à jour les données d'une store
async function updateStoreData(storesCollection, store) {
  console.log(`🏪 Store trouvé: ${store.name}`);
  console.log('📝 Mise à jour des données...');

  // Mettre à jour la store avec les nouvelles données
  const updateData = {
    categories: seedData.categories,
    sampleProducts: seedData.sampleProducts,
    navLinks: seedData.navLinks,
    footerLinks: seedData.footerLinks,
    socialLinks: seedData.socialLinks,
    vendors: seedData.vendors,
    
    // Mettre à jour les métriques avec des données réalistes
    'metrics.totalProducts': seedData.sampleProducts.length,
    'metrics.totalOrders': 127,
    'metrics.totalRevenue': 8945.67,
    'metrics.averageRating': 4.5,
    'metrics.totalReviews': 69,
    
    // Mettre à jour les analytics
    'analytics.visitorsCount': 2847,
    'analytics.conversionRate': 3.2,
    'analytics.averageOrderValue': 70.44,
    'analytics.topProducts': [
      { productId: 'prod-1', name: 'T-shirt Bio Coton', sales: 45 },
      { productId: 'prod-3', name: 'Baskets Éco-Responsables', sales: 32 },
      { productId: 'prod-2', name: 'Sac à Main Recyclé', sales: 28 }
    ],
    
    // Mettre à jour les mots-clés SEO
    'seo.keywords': [
      'boutique écologique',
      'vêtements bio',
      'mode durable',
      'accessoires recyclés',
      'commerce équitable',
      'développement durable'
    ],
    
    // Mettre à jour la date de modification
    updatedAt: new Date()
  };

  const result = await storesCollection.updateOne(
    { _id: store._id },
    { $set: updateData }
  );

  if (result.modifiedCount === 1) {
    console.log('✅ Store mise à jour avec succès!');
    
    console.log('\n📊 Données ajoutées:');
    console.log(`- ${seedData.categories.length} catégories`);
    console.log(`- ${seedData.sampleProducts.length} produits d'exemple`);
    console.log(`- ${seedData.navLinks.length} liens de navigation`);
    console.log(`- ${seedData.footerLinks.length} sections de pied de page`);
    console.log(`- ${seedData.socialLinks.length} liens sociaux`);
    console.log(`- ${seedData.vendors.length} vendeurs/collaborateurs`);
    console.log('- Métriques et analytics mises à jour');
    console.log('- Mots-clés SEO ajoutés');
    
  } else {
    console.log('⚠️  Aucune modification apportée');
  }

  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
  } finally {
    await client.close();
    console.log('🔌 Connexion fermée');
  }
}

// Exécuter le script
if (require.main === module) {
  seedStoreData();
}

module.exports = { seedStoreData, seedData };