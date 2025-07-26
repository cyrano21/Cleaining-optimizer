// Script simple pour créer des produits via l'API
const fetch = require('node-fetch');

async function createTestProducts() {
  try {
    console.log('🚀 Création de produits de test via l\'API...');

    // Données de test pour les produits
    const testProducts = [
      {
        title: 'iPhone 15 Pro',
        description: 'Le dernier iPhone avec puce A17 Pro',
        price: 1199,
        comparePrice: 1299,
        sku: 'IPH15PRO-001',
        stock: 50,
        images: ['/images/products/iphone-15-pro.jpg'],
        featured: true,
        tags: ['smartphone', 'apple', 'premium']
      },
      {
        title: 'MacBook Air M2',
        description: 'Ordinateur portable ultra-fin avec puce M2',
        price: 1399,
        comparePrice: 1499,
        sku: 'MBA-M2-001',
        stock: 25,
        images: ['/images/products/macbook-air-m2.jpg'],
        featured: true,
        tags: ['laptop', 'apple', 'productivity']
      },
      {
        title: 'Samsung Galaxy S24',
        description: 'Smartphone Android flagship avec IA',
        price: 899,
        comparePrice: 999,
        sku: 'SGS24-001',
        stock: 75,
        images: ['/images/products/galaxy-s24.jpg'],
        featured: false,
        tags: ['smartphone', 'samsung', 'android']
      }
    ];

    // Créer chaque produit
    for (const productData of testProducts) {
      try {
        const response = await fetch('http://localhost:3000/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Vous devrez peut-être ajouter un token d'authentification
            // 'Authorization': 'Bearer YOUR_TOKEN_HERE'
          },
          body: JSON.stringify(productData)
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`✅ Produit créé: ${productData.title}`);
        } else {
          const error = await response.json();
          console.log(`❌ Erreur pour ${productData.title}:`, error);
        }
      } catch (error) {
        console.log(`❌ Erreur réseau pour ${productData.title}:`, error.message);
      }
    }

    console.log('🎉 Script terminé!');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

createTestProducts();
