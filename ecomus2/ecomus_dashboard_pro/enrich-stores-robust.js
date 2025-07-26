require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Configuration MongoDB avec options de robustesse
const connectDB = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
        maxPoolSize: 10
      });
      console.log('✅ Connexion MongoDB établie');
      return;
    } catch (error) {
      console.log(`❌ Tentative ${i + 1}/${retries} échouée:`, error.message);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000)); // Attendre 2s
    }
  }
};

// Utilisation du modèle Store avec schéma flexible
const storeSchema = new mongoose.Schema({
  name: String,
  slug: String,
  // Tous les autres champs...
  templateData: {
    template: String,
    products: [mongoose.Schema.Types.Mixed],
    collections: [mongoose.Schema.Types.Mixed],
    banner: mongoose.Schema.Types.Mixed
  }
}, { strict: false, timestamps: true });

const Store = mongoose.model('Store', storeSchema);

async function enrichSingleStore(slug) {
  try {
    console.log(`🔍 Traitement de la store: ${slug}`);
    
    const store = await Store.findOne({ slug });
    if (!store) {
      console.log(`❌ Store non trouvée: ${slug}`);
      return false;
    }

    // Si déjà enrichie, passer
    if (store.templateData && store.templateData.products && store.templateData.products.length > 0) {
      console.log(`⏭️  Store déjà enrichie: ${slug}`);
      return true;
    }

    const templateMapping = {
      'tshirts-casual': 'home-tee',
      'maillots-bain': 'home-swimwear',
      'poussettes-puericulture': 'home-stroller',
      'chaussettes': 'home-sock',
      'sneakers': 'home-sneaker',
      'soins-peau': 'home-skincare',
      'skateboard': 'home-skateboard',
      'equipement-bureau': 'home-setup-gear',
      'recherche-avancee': 'home-search',
      'pod-store': 'home-pod-store',
      'plantes-jardinage': 'home-plant',
      'pickleball': 'home-pickleball',
      'coques-accessoires-mobile': 'home-phonecase',
      'produits-personnalises': 'home-personalized-photo',
      'sports-nautiques': 'home-paddle-boards',
      'multi-marques': 'home-multi-brand',
      'mode-homme': 'home-mens',
      'ustensiles-cuisine': 'home-kitchen-wear',
      'mode-enfants': 'home-kids',
      'bijouterie': 'home-jewerly',
      'audio-casques': 'home-headphone',
      'maroquinerie': 'home-handbag',
      'epicerie': 'home-grocery',
      'lunettes-optique': 'home-glasses',
      'cartes-cadeaux': 'home-giftcard',
      'gaming': 'home-game',
      'mobilier': 'home-furniture',
      'chaussures': 'home-footwear',
      'alimentation': 'home-food',
      'electronique': 'home-electronic',
      'velos-electriques': 'home-electric-bike',
      'accessoires-chien': 'home-dog-accessories',
      'decoration-maison': 'home-decor',
      'cosmetiques-beaute': 'home-cosmetic',
      'ceramique-artisanat': 'home-ceramic',
      'camping-randonnee': 'home-camp-and-hike',
      'librairie': 'home-bookstore',
      'bebe-enfants': 'home-baby',
      'sport-fitness': 'home-activewear',
      'accessoires-mode': 'home-accessories'
    };

    const templateName = templateMapping[slug] || 'default';
    
    // Charger les données du template
    const templatePath = path.join(__dirname, 'ecomusnext-main', 'data', `${templateName}.json`);
    let templateData = {};

    if (templateName !== 'default' && fs.existsSync(templatePath)) {
      const rawData = fs.readFileSync(templatePath, 'utf8');
      templateData = JSON.parse(rawData);
      console.log(`📁 Template chargé: ${templateName}`);
    } else {
      // Template par défaut
      templateData = {
        template: 'default',
        products: [
          {
            id: 1,
            name: `Product ${store.name}`,
            price: 29.99,
            images: ['/images/placeholder-product.jpg'],
            description: `Découvrez nos produits de qualité dans la catégorie ${store.name}`,
            variants: [
              { size: 'S', color: 'Black', stock: 10 },
              { size: 'M', color: 'White', stock: 15 },
              { size: 'L', color: 'Gray', stock: 8 }
            ]
          }
        ],
        collections: [
          {
            id: 1,
            name: 'Collection Principal',
            description: `Collection principale de ${store.name}`,
            image: '/images/placeholder-collection.jpg'
          }
        ],
        banner: {
          title: store.homeName || store.name,
          subtitle: store.homeDescription || `Découvrez la boutique ${store.name}`,
          image: '/images/placeholder-banner.jpg',
          cta: 'Découvrir'
        }
      };
      console.log(`🎨 Template par défaut assigné`);
    }

    // Mettre à jour la store avec les données du template
    const updateResult = await Store.updateOne(
      { _id: store._id },
      { 
        $set: { 
          templateData: templateData,
          updatedAt: new Date()
        }
      }
    );

    if (updateResult.modifiedCount > 0) {
      console.log(`✅ Store enrichie: ${slug}`);
      return true;
    } else {
      console.log(`⚠️  Aucune modification pour: ${slug}`);
      return false;
    }

  } catch (error) {
    console.error(`❌ Erreur pour ${slug}:`, error.message);
    return false;
  }
}

async function enrichStoresRobust() {
  try {
    console.log('🔌 URI MongoDB:', process.env.MONGODB_URI ? 'Trouvé' : 'Non trouvé');
    console.log('🚀 Démarrage de l\'enrichissement robuste...');

    await connectDB();

    // Traiter toutes les stores par lots de 10
    let skip = 0;
    let hasMore = true;
    let totalProcessed = 0;

    while (hasMore) {
      // Récupérer le lot suivant de stores
      const stores = await Store.find({}).select('slug name').skip(skip).limit(10);
      
      if (stores.length === 0) {
        hasMore = false;
        break;
      }

      console.log(`📊 Traitement du lot ${Math.floor(skip/10) + 1}: ${stores.length} stores`);

      // Traiter chaque store du lot
      for (const store of stores) {
        const success = await enrichSingleStore(store.slug);
        if (success) totalProcessed++;
        
        // Petite pause entre chaque store
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      skip += 10;
      
      // Pause entre les lots
      if (hasMore) {
        console.log('⏸️  Pause de 2 secondes entre les lots...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }    console.log('🎉 Enrichissement terminé !');
    console.log(`📊 ${totalProcessed} stores enrichies au total`);

  } catch (error) {
    console.error('❌ Erreur lors de l\'enrichissement:', error.message);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('🔌 Connexion MongoDB fermée');
    }
  }
}

// Lancer l'enrichissement
enrichStoresRobust();
