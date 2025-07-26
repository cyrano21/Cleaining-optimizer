const mongoose = require('mongoose');
require('dotenv').config();

// Script de migration pour corriger le schéma Store
async function migrateStoreSchema() {
  try {
    console.log('🔄 Début de la migration du schéma Store...');
    
    // Connexion directe à MongoDB
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI non défini dans les variables d\'environnement');
    }
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connexion à la base de données établie');
    
    const db = mongoose.connection.db;
    const storesCollection = db.collection('stores');
    
    // Compter les stores existantes
    const totalStores = await storesCollection.countDocuments();
    console.log(`📊 Nombre total de stores: ${totalStores}`);
    
    if (totalStores === 0) {
      console.log('ℹ️ Aucune store trouvée, création d\'une store de test...');
      
      // Créer une store de test avec tous les champs requis
      const testStore = {
        name: 'Boutique Test',
        slug: 'boutique-test',
        description: 'Une boutique de test pour valider le schéma',
        homeTheme: 'electronics',
        homeTemplate: 'modern-template',
        homeName: 'Boutique Test Électronique',
        homeDescription: 'Découvrez notre sélection d\'électronique',
        isActive: true,
        status: 'active',
        vendorStatus: 'none',
        primaryColor: '#007bff',
        accentColor: '#28a745',
        customizations: {
          colors: {
            primary: '#007bff',
            secondary: '#6c757d',
            accent: '#28a745'
          },
          branding: {
            storeName: 'Boutique Test'
          },
          layout: {
            style: 'modern',
            headerType: 'classic',
            footerType: 'simple'
          }
        },
        seo: {
          title: 'Boutique Test - Électronique',
          description: 'Découvrez notre sélection d\'électronique',
          keywords: ['electronics', 'ecommerce', 'boutique']
        },
        analytics: {
          visitorsCount: 0,
          conversionRate: 0,
          averageOrderValue: 0,
          topProducts: []
        },
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
        },
        settings: {
          currency: 'EUR',
          taxRate: 20,
          freeShippingThreshold: 50
        },
        featured: false,
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Chercher un utilisateur admin pour l'owner
      const usersCollection = db.collection('users');
      const adminUser = await usersCollection.findOne({ role: 'admin' });
      
      if (adminUser) {
        testStore.owner = adminUser._id;
        console.log(`👤 Utilisateur admin trouvé: ${adminUser.email}`);
      } else {
        console.log('⚠️ Aucun utilisateur admin trouvé, création d\'un utilisateur de test...');
        const testUser = {
          name: 'Admin Test',
          email: 'admin@test.com',
          role: 'admin',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const insertedUser = await usersCollection.insertOne(testUser);
        testStore.owner = insertedUser.insertedId;
        console.log(`👤 Utilisateur admin créé: ${testUser.email}`);
      }
      
      await storesCollection.insertOne(testStore);
      console.log('✅ Store de test créée avec succès');
      
    } else {
      console.log('🔄 Migration des stores existantes...');
      
      // Récupérer toutes les stores
      const stores = await storesCollection.find({}).toArray();
      
      let migratedCount = 0;
      
      for (const store of stores) {
        const updates = {};
        let needsUpdate = false;
        
        // Vérifier et ajouter les champs manquants
        if (!store.homeTheme) {
          updates.homeTheme = 'electronics'; // Valeur par défaut
          needsUpdate = true;
        }
        
        if (!store.homeTemplate) {
          updates.homeTemplate = 'modern-template';
          needsUpdate = true;
        }
        
        if (!store.homeName) {
          updates.homeName = store.name || 'Boutique';
          needsUpdate = true;
        }
        
        if (!store.homeDescription) {
          updates.homeDescription = store.description || 'Découvrez notre sélection de produits';
          needsUpdate = true;
        }
        
        if (store.isActive === undefined) {
          updates.isActive = true; // Activer par défaut les stores existantes
          needsUpdate = true;
        }
        
        if (!store.status) {
          updates.status = store.isActive ? 'active' : 'inactive';
          needsUpdate = true;
        }
        
        if (!store.vendorStatus) {
          updates.vendorStatus = store.vendor ? 'approved' : 'none';
          needsUpdate = true;
        }
        
        if (!store.customizations) {
          updates.customizations = {
            colors: {
              primary: store.primaryColor || '#007bff',
              secondary: store.secondaryColor || '#6c757d',
              accent: store.accentColor || '#28a745'
            },
            branding: {
              storeName: store.name,
              logo: store.logo || store.logoUrl
            },
            layout: {
              style: 'modern',
              headerType: 'classic',
              footerType: 'simple'
            }
          };
          needsUpdate = true;
        }
        
        if (!store.seo) {
          updates.seo = {
            title: store.homeName || store.name,
            description: store.homeDescription || store.description,
            keywords: [store.homeTheme || 'ecommerce', 'boutique']
          };
          needsUpdate = true;
        }
        
        if (!store.analytics) {
          updates.analytics = {
            visitorsCount: 0,
            conversionRate: 0,
            averageOrderValue: 0,
            topProducts: []
          };
          needsUpdate = true;
        }
        
        if (!store.metrics) {
          updates.metrics = {
            totalProducts: 0,
            totalOrders: 0,
            totalRevenue: 0,
            averageRating: 0,
            totalReviews: 0
          };
          needsUpdate = true;
        }
        
        if (!store.verification) {
          updates.verification = {
            isVerified: false,
            documents: []
          };
          needsUpdate = true;
        }
        
        if (!store.settings) {
          updates.settings = {
            currency: 'EUR',
            taxRate: 20,
            freeShippingThreshold: 50
          };
          needsUpdate = true;
        }
        
        if (store.featured === undefined) {
          updates.featured = false;
          needsUpdate = true;
        }
        
        if (store.isPublic === undefined) {
          updates.isPublic = true;
          needsUpdate = true;
        }
        
        updates.updatedAt = new Date();
        
        if (needsUpdate) {
          await storesCollection.updateOne(
            { _id: store._id },
            { $set: updates }
          );
          migratedCount++;
          console.log(`✅ Store migrée: ${store.name} (${store.slug})`);
        } else {
          console.log(`ℹ️ Store déjà à jour: ${store.name} (${store.slug})`);
        }
      }
      
      console.log(`🎉 Migration terminée: ${migratedCount}/${totalStores} stores mises à jour`);
    }
    
    // Vérification finale
    const updatedStores = await storesCollection.find({}).toArray();
    console.log('\n📋 Vérification finale:');
    
    for (const store of updatedStores) {
      const hasRequiredFields = store.homeTheme && store.homeTemplate && store.homeName && 
                               store.isActive !== undefined && store.status && store.vendorStatus;
      
      console.log(`${hasRequiredFields ? '✅' : '❌'} ${store.name} (${store.slug})`);
      if (!hasRequiredFields) {
        console.log(`   Champs manquants: ${[
          !store.homeTheme && 'homeTheme',
          !store.homeTemplate && 'homeTemplate', 
          !store.homeName && 'homeName',
          store.isActive === undefined && 'isActive',
          !store.status && 'status',
          !store.vendorStatus && 'vendorStatus'
        ].filter(Boolean).join(', ')}`);
      }
    }
    
    console.log('\n🎉 Migration du schéma Store terminée avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Connexion fermée');
  }
}

// Exécuter la migration
if (require.main === module) {
  migrateStoreSchema();
}

module.exports = migrateStoreSchema;