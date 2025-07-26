require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Connexion MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomus';

console.log('🔌 URI MongoDB:', MONGODB_URI ? 'Trouvé' : 'Non trouvé');

// Configuration de la connexion
mongoose.connect(MONGODB_URI);

// Schéma Store flexible pour permettre les mises à jour
const storeSchema = new mongoose.Schema({
  name: String,
  slug: String,
  status: String,
  templateData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { 
  strict: false,
  timestamps: true
});
const Store = mongoose.model('Store', storeSchema);

// Mapping des templates vers les themes
const TEMPLATE_MAPPING = {
  'tshirts-casual': 'home-tee',
  'cosmetiques-beaute': 'home-cosmetic',
  'accessoires-mode': 'home-accessories',
  'sneakers': 'home-sneaker',
  'mode-homme': 'home-men',
  'mode-enfants': 'home-kids',
  'chaussures': 'home-footwear',
  'bijouterie': 'home-jewerly',
  'maroquinerie': 'home-handbag',
  'lunettes-optique': 'home-glasses',
  'mobilier': 'home-furniture',
  'electronique': 'home-electronic',
  'gaming': 'home-gaming-accessories',
  'audio-casques': 'home-headphone',
  'decor-maison': 'home-decor',
  'plantes-jardinage': 'home-plant',
  'bebe-enfants': 'home-baby',
  'sport-fitness': 'home-activewear',
  'camping-randonnee': 'home-camp-and-hike',
  'velos-electriques': 'home-electric-bike',
  'accessoires-chien': 'home-dog-accessories',
  'librairie': 'home-bookstore',
  'epicerie': 'home-grocery',
  'alimentation': 'home-food',
  'ustensiles-cuisine': 'home-kitchen-wear',
  'ceramique-artisanat': 'home-ceramic',
  'chaussettes': 'home-sock',
  'maillots-bain': 'home-swimwear',
  'poussettes-puericulture': 'home-stroller',
  'coques-accessoires-mobile': 'home-phonecase',
  'skateboard': 'home-skateboard',
  'pickleball': 'home-pickleball',
  'sports-nautiques': 'home-paddle-boards',
  'soins-peau': 'home-skincare',
  'cartes-cadeaux': 'home-giftcard',
  'pod-store': 'home-pod-store',
  'produits-personnalises': 'home-personalized-pod',
  'multi-marques': 'home-multi-brand',
  'recherche-avancee': 'home-search',
  'equipement-bureau': 'home-setup-gear'
};

// Fonction pour générer des données de template
function generateTemplateData(templateName, storeName, storeSlug) {
  const templates = {
    'home-tee': {
      theme: 'fashion',
      primaryColor: '#ff6b35',
      secondaryColor: '#f7f7f7',
      bannerText: `Découvrez notre collection de ${storeName.toLowerCase()}`,
      heroTitle: `${storeName} - Style & Confort`,
      heroSubtitle: 'Collection premium pour tous les styles',
      categories: ['T-shirts', 'Polos', 'Débardeurs', 'Manches longues'],
      sampleProducts: [
        {
          name: 'T-shirt Premium Coton',
          price: 29.99,
          image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
          description: 'T-shirt en coton bio, coupe moderne'
        },
        {
          name: 'Polo Classique',
          price: 39.99,
          image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400',
          description: 'Polo élégant pour toutes occasions'
        }
      ]
    },
    'home-cosmetic': {
      theme: 'beauty',
      primaryColor: '#ff69b4',
      secondaryColor: '#ffeef8',
      bannerText: `Révélez votre beauté naturelle avec ${storeName}`,
      heroTitle: `${storeName} - Beauté Authentique`,
      heroSubtitle: 'Produits de qualité pour sublimer votre peau',
      categories: ['Soins visage', 'Maquillage', 'Parfums', 'Soins corps'],
      sampleProducts: [
        {
          name: 'Crème Hydratante Bio',
          price: 24.99,
          image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400',
          description: 'Hydratation intense pour tous types de peau'
        },
        {
          name: 'Rouge à lèvres Mat',
          price: 19.99,
          image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400',
          description: 'Couleur intense et tenue longue durée'
        }
      ]
    },
    'home-accessories': {
      theme: 'fashion',
      primaryColor: '#333333',
      secondaryColor: '#f5f5f5',
      bannerText: `Accessoires tendance chez ${storeName}`,
      heroTitle: `${storeName} - Accessoires Mode`,
      heroSubtitle: 'Complétez votre style avec nos accessoires',
      categories: ['Sacs', 'Bijoux', 'Ceintures', 'Écharpes'],
      sampleProducts: [
        {
          name: 'Sac à main Cuir',
          price: 89.99,
          image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
          description: 'Sac élégant en cuir véritable'
        },
        {
          name: 'Collier Argent',
          price: 45.99,
          image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
          description: 'Bijou raffiné en argent sterling'
        }
      ]
    }
  };

  // Template par défaut si non trouvé
  const defaultTemplate = {
    theme: 'modern',
    primaryColor: '#007bff',
    secondaryColor: '#f8f9fa',
    bannerText: `Bienvenue chez ${storeName}`,
    heroTitle: storeName,
    heroSubtitle: 'Découvrez nos produits de qualité',
    categories: ['Produits', 'Nouveautés', 'Promotions'],
    sampleProducts: [
      {
        name: 'Produit exemple 1',
        price: 29.99,
        image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
        description: 'Description du produit'
      },
      {
        name: 'Produit exemple 2',
        price: 39.99,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
        description: 'Description du produit'
      }
    ]
  };

  return templates[templateName] || defaultTemplate;
}

// Fonction principale d'enrichissement
async function enrichStoresWithTemplateData() {
  try {
    console.log('🚀 Démarrage de l\'enrichissement des stores...\n');

    // Récupérer toutes les stores
    const stores = await Store.find({});
    console.log(`📊 ${stores.length} stores trouvées dans la base de données\n`);

    let enrichedCount = 0;

    for (const store of stores) {
      console.log(`🏪 Traitement de la store: ${store.name} (${store.slug})`);

      // Déterminer le template à utiliser
      const templateName = TEMPLATE_MAPPING[store.slug] || 'default';
      console.log(`   🎨 Template assigné: ${templateName}`);

      // Générer les données de template
      const templateData = generateTemplateData(templateName, store.name, store.slug);

      // Enrichir la store avec les données de template
      const enrichmentData = {
        // Thème et couleurs
        homeTheme: templateData.theme,
        primaryColor: templateData.primaryColor,
        secondaryColor: templateData.secondaryColor,
        
        // Contenu enrichi
        homeName: store.homeName || store.name,
        homeDescription: store.homeDescription || templateData.heroSubtitle,
        bannerText: templateData.bannerText,
        heroTitle: templateData.heroTitle,
        heroSubtitle: templateData.heroSubtitle,
        
        // Données de catalogue
        categories: templateData.categories,
        sampleProducts: templateData.sampleProducts,
        
        // Informations de contact enrichies
        contact: {
          ...store.contact,
          email: store.contact?.email || `contact@${store.slug}.com`,
          phone: store.contact?.phone || '+33 1 00 00 00 00',
          address: store.contact?.address || {
            street: '123 Rue de la Mode',
            city: 'Paris',
            state: 'Île-de-France',
            postalCode: '75001',
            country: 'France'
          }
        },
        
        // Métriques simulées
        metrics: {
          totalProducts: Math.floor(Math.random() * 100) + 20,
          totalOrders: Math.floor(Math.random() * 500) + 50,
          totalRevenue: Math.floor(Math.random() * 10000) + 1000,
          averageRating: (Math.random() * 2 + 3).toFixed(1), // Entre 3.0 et 5.0
          totalReviews: Math.floor(Math.random() * 200) + 10
        },
        
        // SEO enrichi
        seo: {
          title: `${store.name} - ${templateData.heroSubtitle}`,
          description: `Découvrez ${store.name}, votre destination pour ${templateData.heroSubtitle.toLowerCase()}. Livraison gratuite et retours faciles.`,
          keywords: [...templateData.categories, store.name.toLowerCase(), 'ecommerce', 'boutique en ligne']
        },
        
        // Mise à jour timestamp
        updatedAt: new Date(),
        enrichedAt: new Date()
      };

      // Mettre à jour la store      // Mettre à jour la store avec les données enrichies
      store.templateData = enrichmentData.templateData;
      store.markModified('templateData');
      await store.save();
      
      console.log(`   ✅ Store enrichie avec succès`);
      console.log(`   📦 Produits d'exemple: ${templateData.sampleProducts.length}`);
      console.log(`   🎯 Catégories: ${templateData.categories.join(', ')}`);
      console.log('');
      
      enrichedCount++;
    }

    console.log(`🎉 Enrichissement terminé avec succès !`);
    console.log(`📊 Statistiques:`);
    console.log(`   - Stores traitées: ${stores.length}`);
    console.log(`   - Stores enrichies: ${enrichedCount}`);
    console.log(`   - Templates utilisés: ${Object.keys(TEMPLATE_MAPPING).length}`);

  } catch (error) {
    console.error('❌ Erreur lors de l\'enrichissement:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connexion MongoDB fermée');
  }
}

// Exécuter le script
if (require.main === module) {
  enrichStoresWithTemplateData();
}

module.exports = { enrichStoresWithTemplateData, generateTemplateData, TEMPLATE_MAPPING };
