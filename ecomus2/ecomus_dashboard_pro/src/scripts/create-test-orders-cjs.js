const mongoose = require('mongoose');
const path = require('path');

// Configuration de la connexion MongoDB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ecomus-dashboard";

async function connectToDatabase() {
  try {
    if (mongoose.connections[0].readyState) {
      return mongoose.connections[0];
    }
    await mongoose.connect(MONGODB_URI);
    console.log('Connecté à MongoDB');
    return mongoose.connection;
  } catch (error) {
    console.error('Erreur de connexion MongoDB:', error);
    throw error;
  }
}

// Schémas simplifiés pour les tests
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' }
});

const ProductSchema = new mongoose.Schema({
  title: String,
  price: Number,
  sku: String,
  images: [String],
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const OrderSchema = new mongoose.Schema({
  orderNumber: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

async function createTestOrders() {
  try {
    console.log("Connexion à la base de données...");
    await connectToDatabase();
    
    // Vérifier s'il y a déjà des commandes
    const existingOrders = await Order.countDocuments();
    console.log(`Commandes existantes: ${existingOrders}`);
    
    if (existingOrders > 0) {
      console.log("Des commandes existent déjà. Suppression pour les tests...");
      await Order.deleteMany({});
    }
    
    // Récupérer ou créer des utilisateurs de test
    let users = await User.find().limit(3);
    if (users.length === 0) {
      console.log("Création d'utilisateurs de test...");
      const testUsers = [
        { name: "John Doe", email: "john@example.com" },
        { name: "Jane Smith", email: "jane@example.com" },
        { name: "Bob Johnson", email: "bob@example.com" }
      ];
      users = await User.insertMany(testUsers);
    }
    
    // Récupérer ou créer des produits de test
    let products = await Product.find().limit(5);
    if (products.length === 0) {
      console.log("Création de produits de test...");
      const testProducts = [
        { title: "T-Shirt Premium", price: 29.99, sku: "TS001", images: ["/images/tshirt.jpg"] },
        { title: "Jeans Slim", price: 59.99, sku: "JS001", images: ["/images/jeans.jpg"] },
        { title: "Sneakers Sport", price: 89.99, sku: "SN001", images: ["/images/sneakers.jpg"] },
        { title: "Veste Cuir", price: 149.99, sku: "VC001", images: ["/images/jacket.jpg"] },
        { title: "Montre Elite", price: 199.99, sku: "ME001", images: ["/images/watch.jpg"] }
      ];
      products = await Product.insertMany(testProducts);
    }
    
    console.log(`Utilisateurs disponibles: ${users.length}`);
    console.log(`Produits disponibles: ${products.length}`);
    
    // Créer des commandes de test
    const testOrders = [];
    const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    for (let i = 0; i < 15; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const numProducts = Math.floor(Math.random() * 3) + 1;
      const orderProducts = [];
      let totalAmount = 0;
      
      for (let j = 0; j < numProducts; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const price = product.price;
        
        orderProducts.push({
          productId: product._id,
          quantity,
          price
        });
        
        totalAmount += price * quantity;
      }
      
      const order = {
        orderNumber: `ORD-${Date.now()}-${(i + 1).toString().padStart(4, '0')}`,
        user: user._id,
        products: orderProducts,
        totalAmount,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Derniers 30 jours
        updatedAt: new Date()
      };
      
      testOrders.push(order);
    }
    
    // Insérer les commandes
    const createdOrders = await Order.insertMany(testOrders);
    console.log(`✅ ${createdOrders.length} commandes de test créées avec succès!`);
    
    // Afficher un résumé
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    
    console.log("\n📊 Résumé des commandes par statut:");
    ordersByStatus.forEach(stat => {
      console.log(`- ${stat._id}: ${stat.count}`);
    });
    
    console.log("\n🎉 Données de test créées avec succès!");
    
  } catch (error) {
    console.error("❌ Erreur lors de la création des commandes de test:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Connexion fermée.");
  }
}

// Exécuter le script
createTestOrders();
