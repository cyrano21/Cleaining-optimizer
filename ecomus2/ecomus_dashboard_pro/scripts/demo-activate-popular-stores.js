#!/usr/bin/env node

/**
 * SCRIPT DE DÉMO - ACTIVATION STORES POPULAIRES
 * 
 * Ce script active automatiquement quelques stores populaires
 * pour une démonstration rapide du système stores dynamiques.
 */

const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

// Stores populaires à activer pour la démo
const POPULAR_STORES = [
  'home-cosmetic',
  'home-electronic', 
  'home-furniture',
  'home-food',
  'home-baby',
  'home-accessories',
  'home-sneaker',
  'home-jewelry',
  'home-men',
  'home-plant'
];

// Couleurs pour l'affichage console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function activatePopularStores() {
  let client;
  
  try {
    log('🚀 ACTIVATION STORES POPULAIRES POUR DÉMO', 'magenta');
    log('==========================================', 'magenta');
    
    // Connexion MongoDB
    log('\n🔗 Connexion à MongoDB...', 'yellow');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    log('✅ Connecté à MongoDB', 'green');
    
    const db = client.db();
    const storesCollection = db.collection('stores');
    
    // Statistiques avant activation
    const totalStores = await storesCollection.countDocuments();
    const activeStoresBefore = await storesCollection.countDocuments({ isActive: true });
    
    log(`\n📊 État actuel:`, 'cyan');
    log(`   Total stores: ${totalStores}`, 'bright');
    log(`   Stores actives: ${activeStoresBefore}`, 'bright');
    
    // Activation des stores populaires
    log(`\n🎯 Activation de ${POPULAR_STORES.length} stores populaires...`, 'yellow');
    
    let activatedCount = 0;
    let alreadyActiveCount = 0;
    let notFoundCount = 0;
    
    for (const homeTheme of POPULAR_STORES) {
      try {
        // Chercher la store par homeTheme
        const store = await storesCollection.findOne({ homeTheme });
        
        if (!store) {
          log(`   ❌ Store non trouvée: ${homeTheme}`, 'red');
          notFoundCount++;
          continue;
        }
        
        if (store.isActive) {
          log(`   ✅ Déjà active: ${store.name} (${store.homeTheme})`, 'green');
          alreadyActiveCount++;
          continue;
        }
        
        // Activer la store
        await storesCollection.updateOne(
          { _id: store._id },
          {
            $set: {
              isActive: true,
              activatedAt: new Date(),
              activatedBy: null, // Activation automatique pour démo
              status: 'active'
            }
          }
        );
        
        log(`   🚀 Activée: ${store.name} (${store.homeTheme})`, 'green');
        activatedCount++;
        
      } catch (error) {
        log(`   ❌ Erreur ${homeTheme}: ${error.message}`, 'red');
      }
    }
    
    // Statistiques après activation
    const activeStoresAfter = await storesCollection.countDocuments({ isActive: true });
    
    log(`\n📈 Résultats de l'activation:`, 'cyan');
    log(`   🚀 Stores nouvellement activées: ${activatedCount}`, 'green');
    log(`   ✅ Stores déjà actives: ${alreadyActiveCount}`, 'yellow');
    log(`   ❌ Stores non trouvées: ${notFoundCount}`, 'red');
    log(`   📊 Total stores actives: ${activeStoresAfter}`, 'bright');
    
    // Liste des stores actives pour démo
    log(`\n🛍️ STORES ACTIVES POUR DÉMO:`, 'magenta');
    log('============================', 'magenta');
    
    const activeStores = await storesCollection
      .find({ isActive: true })
      .sort({ homeTheme: 1 })
      .toArray();
    
    activeStores.forEach((store, index) => {
      const url = `http://localhost:3000/store/${store.slug}`;
      log(`${index + 1}. ${store.name}`, 'bright');
      log(`   Theme: ${store.homeTheme}`, 'cyan');
      log(`   URL: ${url}`, 'blue');
      log('');
    });
    
    // Instructions pour la démo
    log(`🎯 INSTRUCTIONS DÉMO:`, 'magenta');
    log('===================', 'magenta');
    log(`\n1. Démarrer le serveur Next.js:`, 'yellow');
    log(`   cd ecomusnext-main && npm run dev`, 'bright');
    
    log(`\n2. Tester les pages:`, 'yellow');
    log(`   • Liste stores: http://localhost:3000/stores`, 'bright');
    log(`   • Store individuelle: http://localhost:3000/store/[slug]`, 'bright');
    
    log(`\n3. Dashboard admin:`, 'yellow');
    log(`   • Gestion stores: http://localhost:3000/admin/stores-management`, 'bright');
    
    log(`\n4. APIs disponibles:`, 'yellow');
    log(`   • GET /api/stores/public/active - Liste des stores actives`, 'bright');
    log(`   • GET /api/stores/public/[slug] - Données d'une store`, 'bright');
    
    if (activatedCount > 0) {
      log(`\n🎉 DÉMO PRÊTE ! ${activeStoresAfter} stores actives disponibles.`, 'green');
    } else {
      log(`\n✅ Démo déjà configurée avec ${activeStoresAfter} stores actives.`, 'green');
    }
    
  } catch (error) {
    log(`\n💥 ERREUR: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      log(`\n🔌 Déconnecté de MongoDB`, 'yellow');
    }
  }
}

// Fonction pour désactiver toutes les stores (utile pour reset)
async function resetAllStores() {
  let client;
  
  try {
    log('🔄 RESET - DÉSACTIVATION DE TOUTES LES STORES', 'magenta');
    log('==============================================', 'magenta');
    
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db();
    const result = await db.collection('stores').updateMany(
      {},
      {
        $set: {
          isActive: false,
          status: 'pending'
        },
        $unset: {
          activatedAt: "",
          activatedBy: ""
        }
      }
    );
    
    log(`✅ ${result.modifiedCount} stores désactivées`, 'green');
    
  } catch (error) {
    log(`❌ Erreur reset: ${error.message}`, 'red');
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// CLI Interface
const command = process.argv[2];

if (command === 'reset') {
  resetAllStores();
} else {
  activatePopularStores();
}
