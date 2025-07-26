const mongoose = require('./ecomusnext-main/node_modules/mongoose');

// Configuration MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomus';

// Structure des vrais produits avec images du site officiel
const realProductsData = [
  {
    _id: new mongoose.Types.ObjectId(),
    title: "Ribbed Tank Top",
    slug: "ribbed-tank-top",
    description: "Comfortable ribbed tank top perfect for everyday wear",
    price: 16.95,
    images: [
      "https://ecomusnext-themesflat.vercel.app/images/products/orange-1.jpg",
      "https://ecomusnext-themesflat.vercel.app/images/products/orange-2.jpg"
    ],
    category: "Clothing",
    subcategory: "Tops",
    brand: "Ecomus",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Orange", "Black", "White"],
    inStock: true,
    featured: true,
    tags: ["Best seller", "On Sale"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: new mongoose.Types.ObjectId(),
    title: "Ribbed Modal T-shirt",
    slug: "ribbed-modal-t-shirt",
    description: "Soft modal fabric t-shirt with ribbed texture",
    price: 18.95,
    images: [
      "https://ecomusnext-themesflat.vercel.app/images/products/brown-1.jpg",
      "https://ecomusnext-themesflat.vercel.app/images/products/brown-2.jpg"
    ],
    category: "Clothing",
    subcategory: "T-shirts",
    brand: "Ecomus",
    sizes: ["M", "L", "XL"],
    colors: ["Brown", "Purple", "Green"],
    inStock: true,
    featured: true,
    tags: ["New arrival"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: new mongoose.Types.ObjectId(),
    title: "Oversized Printed T-shirt",
    slug: "oversized-printed-t-shirt",
    description: "Trendy oversized t-shirt with unique print",
    price: 10.00,
    images: [
      "https://ecomusnext-themesflat.vercel.app/images/products/white-3.jpg",
      "https://ecomusnext-themesflat.vercel.app/images/products/white-4.jpg"
    ],
    category: "Clothing",
    subcategory: "T-shirts",
    brand: "Ecomus",
    sizes: ["S", "M", "L", "XL"],
    colors: ["White", "Black", "Gray"],
    inStock: true,
    featured: false,
    tags: ["Sale"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: new mongoose.Types.ObjectId(),
    title: "V-neck Linen T-shirt",
    slug: "v-neck-linen-t-shirt", 
    description: "Breathable linen t-shirt with elegant v-neck",
    price: 14.95,
    images: [
      "https://ecomusnext-themesflat.vercel.app/images/products/beige-1.jpg",
      "https://ecomusnext-themesflat.vercel.app/images/products/beige-2.jpg"
    ],
    category: "Clothing",
    subcategory: "T-shirts",
    brand: "Ecomus",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Beige", "White", "Navy"],
    inStock: true,
    featured: true,
    tags: ["Summer collection"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: new mongoose.Types.ObjectId(),
    title: "Loose Fit Sweatshirt",
    slug: "loose-fit-sweatshirt",
    description: "Comfortable loose fit sweatshirt for casual wear",
    price: 10.00,
    images: [
      "https://ecomusnext-themesflat.vercel.app/images/products/gray-1.jpg",
      "https://ecomusnext-themesflat.vercel.app/images/products/gray-2.jpg"
    ],
    category: "Clothing",
    subcategory: "Sweatshirts",
    brand: "Ecomus",
    sizes: ["M", "L", "XL"],
    colors: ["Gray", "Black", "Navy"],
    inStock: true,
    featured: false,
    tags: ["Comfort wear"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: new mongoose.Types.ObjectId(),
    title: "Regular Fit Oxford Shirt",
    slug: "regular-fit-oxford-shirt",
    description: "Classic oxford shirt with regular fit",
    price: 10.00,
    images: [
      "https://ecomusnext-themesflat.vercel.app/images/products/blue-1.jpg",
      "https://ecomusnext-themesflat.vercel.app/images/products/blue-2.jpg"
    ],
    category: "Clothing",
    subcategory: "Shirts",
    brand: "Ecomus",
    sizes: ["S", "M", "L"],
    colors: ["Blue", "White", "Light Gray"],
    inStock: true,
    featured: true,
    tags: ["Business casual"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: new mongoose.Types.ObjectId(),
    title: "Stylish T-shirt",
    slug: "stylish-t-shirt",
    description: "Trendy and stylish t-shirt for modern look",
    price: 12.00,
    images: [
      "https://ecomusnext-themesflat.vercel.app/images/products/red-1.jpg",
      "https://ecomusnext-themesflat.vercel.app/images/products/red-2.jpg"
    ],
    category: "Clothing",
    subcategory: "T-shirts",
    brand: "Ecomus",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Red", "Black", "White"],
    inStock: true,
    featured: false,
    tags: ["Trendy"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: new mongoose.Types.ObjectId(),
    title: "Patterned Scarf",
    slug: "patterned-scarf",
    description: "Beautiful patterned scarf for all seasons",
    price: 14.95,
    images: [
      "https://ecomusnext-themesflat.vercel.app/images/products/scarf-1.jpg",
      "https://ecomusnext-themesflat.vercel.app/images/products/scarf-2.jpg"
    ],
    category: "Accessories",
    subcategory: "Scarves",
    brand: "Ecomus",
    sizes: ["M", "L", "XL"],
    colors: ["Multicolor", "Blue Pattern", "Red Pattern"],
    inStock: true,
    featured: true,
    tags: ["Accessories", "Pattern"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: new mongoose.Types.ObjectId(),
    title: "Slim Fit Fine-knit Turtleneck Sweater",
    slug: "slim-fit-turtleneck-sweater",
    description: "Elegant slim fit turtleneck sweater in fine-knit fabric",
    price: 18.95,
    images: [
      "https://ecomusnext-themesflat.vercel.app/images/products/sweater-1.jpg",
      "https://ecomusnext-themesflat.vercel.app/images/products/sweater-2.jpg"
    ],
    category: "Clothing",
    subcategory: "Sweaters",
    brand: "Ecomus",
    sizes: ["S", "M", "L"],
    colors: ["Black", "Gray", "Navy"],
    inStock: true,
    featured: true,
    tags: ["Premium", "Winter collection"],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function updateProductsWithRealImages() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Import du modèle Product
    const Product = require('./ecomusnext-main/models/Product');

    console.log('🗑️ Suppression des anciens produits...');
    await Product.deleteMany({});

    console.log('📦 Insertion des nouveaux produits avec vraies images...');
    const insertedProducts = await Product.insertMany(realProductsData);

    console.log(`✅ ${insertedProducts.length} produits créés avec succès !`);
    
    // Affichage des produits créés
    insertedProducts.forEach(product => {
      console.log(`📸 ${product.title} - ${product.images[0]}`);
    });

    await mongoose.disconnect();
    console.log('🔚 Déconnecté de MongoDB');

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour des produits:', error);
    process.exit(1);
  }
}

// Exécution du script
if (require.main === module) {
  updateProductsWithRealImages();
}

module.exports = { updateProductsWithRealImages, realProductsData };
