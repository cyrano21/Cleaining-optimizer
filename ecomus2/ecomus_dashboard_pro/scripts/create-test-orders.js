import { connectToDatabase } from "../src/lib/mongodb.js";
import Order from "../src/models/Order.js";
import User from "../src/models/User.js";
import Product from "../src/models/Product.js";

async function createTestOrders() {
  try {
    console.log("Connexion à la base de données...");
    await connectToDatabase();
    
    // Vérifier s'il y a déjà des commandes
    const existingOrders = await Order.countDocuments();
    console.log(`Commandes existantes: ${existingOrders}`);
    
    if (existingOrders > 0) {
      console.log("Des commandes existent déjà. Aucune création nécessaire.");
      return;
    }
    
    // Récupérer quelques utilisateurs et produits
    const users = await User.find({}).limit(3);
    const products = await Product.find({}).limit(5);
    
    if (users.length === 0 || products.length === 0) {
      console.log("Pas assez d'utilisateurs ou de produits pour créer des commandes de test.");
      return;
    }
    
    console.log(`Création de commandes de test avec ${users.length} utilisateurs et ${products.length} produits...`);
    
    const testOrders = [];
    const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    
    for (let i = 0; i < 10; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const orderProducts = [];
      
      // Ajouter 1-3 produits à chaque commande
      const numProducts = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < numProducts; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        orderProducts.push({
          productId: product._id,
          title: product.title,
          price: product.price,
          quantity: Math.floor(Math.random() * 3) + 1
        });
      }
      
      const totalAmount = orderProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      const order = {
        orderNumber: `ORD-${Date.now()}-${(i + 1).toString().padStart(4, '0')}`,
        user: user._id,
        items: orderProducts,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        totalAmount,
        shippingAddress: {
          street: `${Math.floor(Math.random() * 999) + 1} Main Street`,
          city: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice'][Math.floor(Math.random() * 5)],
          zipCode: Math.floor(Math.random() * 90000) + 10000,
          country: 'France'
        },
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Derniers 30 jours
        updatedAt: new Date()
      };
      
      testOrders.push(order);
    }
    
    // Insérer les commandes
    const result = await Order.insertMany(testOrders);
    console.log(`${result.length} commandes de test créées avec succès!`);
    
    // Afficher un résumé
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    
    console.log("Résumé des commandes par statut:");
    ordersByStatus.forEach(item => {
      console.log(`- ${item._id}: ${item.count}`);
    });
    
  } catch (error) {
    console.error("Erreur lors de la création des commandes de test:", error);
  }
}

// Export pour utilisation en tant que module
export default createTestOrders;

// Pour exécution directe avec Node.js
if (typeof window === 'undefined' && process.argv[1]?.includes('create-test-orders')) {
  createTestOrders()
    .then(() => {
      console.log("Script terminé.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Erreur:", error);
      process.exit(1);
    });
}
