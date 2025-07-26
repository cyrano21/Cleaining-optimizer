const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Script d'optimisation de la base de données
 * Ajoute des index composites pour améliorer les performances
 */

async function optimizeDatabase() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    const db = mongoose.connection.db;

    // Optimisation des index pour la collection Posts
    console.log('🔄 Optimisation des index Posts...');
    const postsCollection = db.collection('posts');
    
    // Index composites pour les requêtes fréquentes
    await postsCollection.createIndex({ status: 1, publishedAt: -1 });
    await postsCollection.createIndex({ author: 1, status: 1, publishedAt: -1 });
    await postsCollection.createIndex({ categories: 1, status: 1 });
    await postsCollection.createIndex({ tags: 1, status: 1 });
    
    // Index pour la recherche textuelle
    await postsCollection.createIndex({ 
      title: 'text', 
      content: 'text', 
      excerpt: 'text' 
    }, {
      weights: { title: 10, excerpt: 5, content: 1 },
      name: 'posts_text_search'
    });

    // Optimisation des index pour la collection Shops
    console.log('🔄 Optimisation des index Shops...');
    const shopsCollection = db.collection('shops');
    
    await shopsCollection.createIndex({ status: 1, isActive: 1, createdAt: -1 });
    await shopsCollection.createIndex({ seller: 1, status: 1 });
    await shopsCollection.createIndex({ 'subscription.plan': 1, status: 1 });
    
    // Index géospatial pour la localisation
    await shopsCollection.createIndex({ 'address.city': 1, 'address.state': 1 });
    
    // Index pour la recherche textuelle des shops
    await shopsCollection.createIndex({ 
      name: 'text', 
      description: 'text' 
    }, {
      weights: { name: 10, description: 1 },
      name: 'shops_text_search'
    });

    // Optimisation des index pour la collection Products
    console.log('🔄 Optimisation des index Products...');
    const productsCollection = db.collection('products');
    
    await productsCollection.createIndex({ shop: 1, status: 1, createdAt: -1 });
    await productsCollection.createIndex({ category: 1, status: 1, price: 1 });
    await productsCollection.createIndex({ status: 1, featured: 1, createdAt: -1 });
    await productsCollection.createIndex({ tags: 1, status: 1 });
    
    // Index pour la recherche de prix
    await productsCollection.createIndex({ price: 1, status: 1 });
    await productsCollection.createIndex({ discountPrice: 1, status: 1 });
    
    // Index pour la recherche textuelle des produits
    await productsCollection.createIndex({ 
      name: 'text', 
      description: 'text', 
      tags: 'text' 
    }, {
      weights: { name: 10, tags: 5, description: 1 },
      name: 'products_text_search'
    });

    // Optimisation des index pour la collection Orders
    console.log('🔄 Optimisation des index Orders...');
    const ordersCollection = db.collection('orders');
    
    await ordersCollection.createIndex({ user: 1, status: 1, createdAt: -1 });
    await ordersCollection.createIndex({ shop: 1, status: 1, createdAt: -1 });
    await ordersCollection.createIndex({ status: 1, createdAt: -1 });
    await ordersCollection.createIndex({ 'payment.status': 1, createdAt: -1 });

    // Optimisation des index pour la collection Users
    console.log('🔄 Optimisation des index Users...');
    const usersCollection = db.collection('users');
    
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    await usersCollection.createIndex({ role: 1, isActive: 1 });
    await usersCollection.createIndex({ createdAt: -1 });

    console.log('✅ Optimisation de la base de données terminée!');
    
    // Afficher les statistiques des index
    console.log('\n📊 Statistiques des index:');
    const collections = ['posts', 'shops', 'products', 'orders', 'users'];
    
    for (const collectionName of collections) {
      const collection = db.collection(collectionName);
      const indexes = await collection.indexes();
      console.log(`${collectionName}: ${indexes.length} index(es)`);
    }

  } catch (error) {
    console.error('❌ Erreur lors de l\'optimisation:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

// Exécuter l'optimisation
if (require.main === module) {
  optimizeDatabase();
}

module.exports = optimizeDatabase;