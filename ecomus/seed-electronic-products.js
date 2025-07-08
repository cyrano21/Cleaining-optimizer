// Script pour peupler MongoDB avec les vrais produits électroniques du site ecomusnext
const mongoose = require('./ecomusnext-main/node_modules/mongoose');

// Configuration MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomus';

// Produits électroniques spécifiques du site avec leurs vraies images
const electronicProducts = [
  {
    _id: new mongoose.Types.ObjectId(),
    title: "UltraGlass 2 Treated Screen Protector for iPhone 15 Pro",
    description: "Premium screen protection with advanced durability and crystal-clear visibility for your iPhone 15 Pro.",
    price: 39.99,
    originalPrice: 49.99,
    category: "Screen Protection",
    brand: "UltraGlass",
    sku: "UG-15PRO-001",
    stock: 50,
    images: [
      "https://ecomusnext-themesflat.vercel.app/images/products/electronic-1.jpg",
      "https://ecomusnext-themesflat.vercel.app/images/products/electronic-1-2.jpg"
    ],
    imgSrc: "https://ecomusnext-themesflat.vercel.app/images/products/electronic-1.jpg",
    imgHoverSrc: "https://ecomusnext-themesflat.vercel.app/images/products/electronic-1-2.jpg",
    rating: 4.8,
    reviewCount: 124,
    isNew: true,
    isFeatured: true,
    tags: ["screen-protector", "iphone", "accessories"],
    variants: [
      { name: "iPhone 15 Pro", price: 39.99, stock: 50 },
      { name: "iPhone 15 Pro Max", price: 44.99, stock: 30 }
    ]
  },
  {
    _id: new mongoose.Types.ObjectId(),
    title: "Smart Light Switch with Thread",
    description: "Smart home automation made simple. Control your lights remotely with Thread technology.",
    price: 49.99,
    originalPrice: 59.99,
    category: "Smart Home",
    brand: "SmartTech",
    sku: "ST-SW-THR-001",
    stock: 35,
    images: [
      "https://ecomusnext-themesflat.vercel.app/images/products/electronic-2.jpg",
      "https://ecomusnext-themesflat.vercel.app/images/products/electronic-2-2.jpg"
    ],
    imgSrc: "https://ecomusnext-themesflat.vercel.app/images/products/electronic-2.jpg",
    imgHoverSrc: "https://ecomusnext-themesflat.vercel.app/images/products/electronic-2-2.jpg",
    rating: 4.6,
    reviewCount: 89,
    isNew: false,
    isFeatured: true,
    tags: ["smart-home", "switch", "thread"],
    variants: [
      { name: "Single Switch", price: 49.99, stock: 35 },
      { name: "Double Switch", price: 79.99, stock: 20 }
    ]
  },
  {
    _id: new mongoose.Types.ObjectId(),
    title: "SoundForm Rise",
    description: "Premium wireless earbuds with exceptional sound quality and long-lasting battery life.",
    price: 7.95,
    originalPrice: 79.99,
    category: "Audio",
    brand: "SoundForm",
    sku: "SF-RISE-001",
    stock: 75,
    images: [
      "https://ecomusnext-themesflat.vercel.app/images/products/electronic-3.jpg",
      "https://ecomusnext-themesflat.vercel.app/images/products/electronic-3-2.jpg"
    ],
    imgSrc: "https://ecomusnext-themesflat.vercel.app/images/products/electronic-3.jpg",
    imgHoverSrc: "https://ecomusnext-themesflat.vercel.app/images/products/electronic-3-2.jpg",
    rating: 4.9,
    reviewCount: 256,
    isNew: false,
    isFeatured: true,
    isSale: true,
    salePercentage: 90,
    tags: ["earbuds", "wireless", "audio"],
    variants: [
      { name: "Black", price: 7.95, stock: 25 },
      { name: "White", price: 7.95, stock: 25 },
      { name: "Blue", price: 7.95, stock: 25 }
    ]
  },
  {
    _id: new mongoose.Types.ObjectId(),
    title: "3-in-1 Wireless Charger with Official MagSafe Charging 15W",
    description: "Charge your iPhone, AirPods, and Apple Watch simultaneously with official MagSafe technology.",
    price: 105.95,
    originalPrice: 149.99,
    category: "Charging",
    brand: "MagCharge",
    sku: "MC-3IN1-15W-001",
    stock: 42,
    images: [
      "https://ecomusnext-themesflat.vercel.app/images/products/electronic-4.jpg",
      "https://ecomusnext-themesflat.vercel.app/images/products/electronic-4-2.jpg"
    ],
    imgSrc: "https://ecomusnext-themesflat.vercel.app/images/products/electronic-4.jpg",
    imgHoverSrc: "https://ecomusnext-themesflat.vercel.app/images/products/electronic-4-2.jpg",
    rating: 4.7,
    reviewCount: 178,
    isNew: true,
    isFeatured: true,
    isSale: true,
    salePercentage: 29,
    tags: ["wireless-charger", "magsafe", "3-in-1"],
    variants: [
      { name: "15W Black", price: 105.95, stock: 22 },
      { name: "15W White", price: 105.95, stock: 20 }
    ]
  },
  {
    _id: new mongoose.Types.ObjectId(),
    title: "Wireless On-Ear Headphones for Kids",
    description: "Safe and comfortable wireless headphones designed specifically for children with volume limiting.",
    price: 24.99,
    originalPrice: 34.99,
    category: "Audio",
    brand: "KidSound",
    sku: "KS-HEAD-KIDS-001",
    stock: 60,
    images: [
      "https://ecomusnext-themesflat.vercel.app/images/products/electronic-5.jpg",
      "https://ecomusnext-themesflat.vercel.app/images/products/electronic-5-2.jpg"
    ],
    imgSrc: "https://ecomusnext-themesflat.vercel.app/images/products/electronic-5.jpg",
    imgHoverSrc: "https://ecomusnext-themesflat.vercel.app/images/products/electronic-5-2.jpg",
    rating: 4.5,
    reviewCount: 203,
    isNew: false,
    isFeatured: false,
    isSale: true,
    salePercentage: 29,
    tags: ["headphones", "kids", "wireless", "safe"],
    variants: [
      { name: "Pink", price: 24.99, stock: 20 },
      { name: "Blue", price: 24.99, stock: 20 },
      { name: "Green", price: 24.99, stock: 20 }
    ]
  },
  {
    _id: new mongoose.Types.ObjectId(),
    title: "USB-C to Lightning Cable 2m",
    description: "High-quality USB-C to Lightning cable for fast charging and data transfer.",
    price: 19.99,
    originalPrice: 29.99,
    category: "Cables",
    brand: "CableTech",
    sku: "CT-USBC-LIGHT-2M",
    stock: 100,
    images: [
      "https://ecomusnext-themesflat.vercel.app/images/products/electronic-6.jpg",
      "https://ecomusnext-themesflat.vercel.app/images/products/electronic-6-2.jpg"
    ],
    imgSrc: "https://ecomusnext-themesflat.vercel.app/images/products/electronic-6.jpg",
    imgHoverSrc: "https://ecomusnext-themesflat.vercel.app/images/products/electronic-6-2.jpg",
    rating: 4.4,
    reviewCount: 95,
    isNew: false,
    isFeatured: false,
    isSale: true,
    salePercentage: 33,
    tags: ["cable", "usb-c", "lightning", "charging"],
    variants: [
      { name: "1m", price: 14.99, stock: 50 },
      { name: "2m", price: 19.99, stock: 50 }
    ]
  }
];

// Schéma simple pour les produits (compatible avec notre modèle existant)
const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  category: { type: String },
  brand: { type: String },
  sku: { type: String, unique: true },
  stock: { type: Number, default: 0 },
  images: [{ type: String }],
  imgSrc: { type: String },
  imgHoverSrc: { type: String },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  isNew: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  isSale: { type: Boolean, default: false },
  salePercentage: { type: Number },
  tags: [{ type: String }],
  variants: [{
    name: String,
    price: Number,
    stock: Number
  }]
}, {
  timestamps: true
});

async function seedElectronicProducts() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Obtenir ou créer le modèle Product
    const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

    // Supprimer les anciens produits électroniques
    console.log('🗑️ Suppression des anciens produits électroniques...');
    await Product.deleteMany({ 
      category: { $in: ['Screen Protection', 'Smart Home', 'Audio', 'Charging', 'Cables'] }
    });

    // Insérer les nouveaux produits électroniques
    console.log('📦 Insertion des nouveaux produits électroniques...');
    const insertedProducts = await Product.insertMany(electronicProducts);
    console.log(`✅ ${insertedProducts.length} produits électroniques insérés avec succès !`);

    // Afficher quelques exemples
    console.log('\n📋 Exemples de produits électroniques insérés :');
    insertedProducts.slice(0, 3).forEach((product, index) => {
      console.log(`${index + 1}. ${product.title} - ${product.price}€`);
      console.log(`   Image: ${product.imgSrc}`);
      console.log(`   Catégorie: ${product.category}`);
    });

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour des produits électroniques :', error);
  } finally {
    console.log('🔒 Connexion fermée');
    await mongoose.connection.close();
  }
}

// Exécuter le script
seedElectronicProducts();
