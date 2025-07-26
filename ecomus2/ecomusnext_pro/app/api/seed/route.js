import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';
import Store from '../../../models/Store';
import Product from '../../../models/Product';
import { Supplier, DropshippingProduct, Banner } from '../../../models/SaasModels';

// POST /api/seed/data - Enrichir la base de données avec des données réelles
export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { type = 'all' } = body;

    let results = {};

    if (type === 'all' || type === 'suppliers') {
      results.suppliers = await seedSuppliers();
    }

    if (type === 'all' || type === 'dropshipping') {
      results.dropshippingProducts = await seedDropshippingProducts();
    }

    if (type === 'all' || type === 'banners') {
      results.banners = await seedBanners();
    }

    if (type === 'all' || type === 'stores') {
      results.stores = await enrichStores();
    }

    if (type === 'all' || type === 'products') {
      results.products = await enrichProducts();
    }

    return NextResponse.json({
      success: true,
      data: results,
      message: "Base de données enrichie avec succès"
    });

  } catch (error) {
    console.error('Erreur enrichissement données:', error);
    return NextResponse.json({
      success: false,
      message: "Erreur lors de l'enrichissement des données",
      error: error.message
    }, { status: 500 });
  }
}

// Créer des fournisseurs dropshipping réalistes
async function seedSuppliers() {
  const suppliers = [
    {
      name: 'AliExpress Wholesale',
      slug: 'aliexpress-wholesale',
      email: 'wholesale@aliexpress.com',
      phone: '+86 571 8502 2088',
      website: 'https://wholesale.aliexpress.com',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200',
      
      contact: {
        name: 'Zhang Wei',
        email: 'zhang.wei@aliexpress.com',
        phone: '+86 571 8502 2088',
        address: {
          street: '969 West Wen Yi Road',
          city: 'Hangzhou',
          state: 'Zhejiang',
          postalCode: '311121',
          country: 'China'
        }
      },
      
      apiConfig: {
        endpoint: 'https://api.aliexpress.com/v1/products',
        apiKey: 'ae_api_key_123456',
        secretKey: 'ae_secret_789012',
        format: 'json',
        authType: 'api_key'
      },
      
      terms: {
        minOrderAmount: 50,
        shippingCost: 15,
        processingTime: 3,
        commission: 25,
        returnPolicy: '30 jours retour gratuit'
      },
      
      categories: ['Électronique', 'Mode', 'Maison', 'Sport', 'Beauté'],
      
      metrics: {
        totalProducts: 15000,
        totalOrders: 2500,
        averageRating: 4.2,
        responseTime: 2,
        fulfillmentRate: 95
      },
      
      status: 'active',
      isVerified: true
    },
    
    {
      name: 'Oberlo Suppliers',
      slug: 'oberlo-suppliers',
      email: 'suppliers@oberlo.com',
      phone: '+1 800 123 4567',
      website: 'https://oberlo.com',
      logo: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200',
      
      contact: {
        name: 'John Smith',
        email: 'john.smith@oberlo.com',
        phone: '+1 800 123 4567',
        address: {
          street: '150 Elgin Street',
          city: 'Ottawa',
          state: 'Ontario',
          postalCode: 'K2P 1L4',
          country: 'Canada'
        }
      },
      
      apiConfig: {
        endpoint: 'https://api.oberlo.com/v2/products',
        apiKey: 'ob_api_key_654321',
        secretKey: 'ob_secret_210987',
        format: 'json',
        authType: 'oauth'
      },
      
      terms: {
        minOrderAmount: 25,
        shippingCost: 8,
        processingTime: 1,
        commission: 30,
        returnPolicy: '14 jours retour gratuit'
      },
      
      categories: ['Mode', 'Accessoires', 'Bijoux', 'Décoration'],
      
      metrics: {
        totalProducts: 8500,
        totalOrders: 1800,
        averageRating: 4.5,
        responseTime: 1,
        fulfillmentRate: 98
      },
      
      status: 'active',
      isVerified: true
    },
    
    {
      name: 'Spocket EU',
      slug: 'spocket-eu',
      email: 'eu@spocket.co',
      phone: '+33 1 23 45 67 89',
      website: 'https://spocket.co',
      logo: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200',
      
      contact: {
        name: 'Marie Dubois',
        email: 'marie.dubois@spocket.co',
        phone: '+33 1 23 45 67 89',
        address: {
          street: '123 Avenue des Champs-Élysées',
          city: 'Paris',
          state: 'Île-de-France',
          postalCode: '75008',
          country: 'France'
        }
      },
      
      apiConfig: {
        endpoint: 'https://api.spocket.co/v1/products',
        apiKey: 'sp_api_key_789123',
        secretKey: 'sp_secret_456789',
        format: 'json',
        authType: 'api_key'
      },
      
      terms: {
        minOrderAmount: 30,
        shippingCost: 5,
        processingTime: 2,
        commission: 35,
        returnPolicy: '30 jours retour gratuit'
      },
      
      categories: ['Mode', 'Beauté', 'Maison', 'Enfants'],
      
      metrics: {
        totalProducts: 5200,
        totalOrders: 950,
        averageRating: 4.7,
        responseTime: 1,
        fulfillmentRate: 99
      },
      
      status: 'active',
      isVerified: true
    }
  ];

  await Supplier.deleteMany({});
  const createdSuppliers = await Supplier.insertMany(suppliers);
  return { count: createdSuppliers.length, suppliers: createdSuppliers };
}

// Créer des produits dropshipping
async function seedDropshippingProducts() {
  const suppliers = await Supplier.find({});
  if (suppliers.length === 0) {
    throw new Error('Aucun fournisseur trouvé. Créez d\'abord les fournisseurs.');
  }

  const products = [];
  
  // Produits pour chaque fournisseur
  suppliers.forEach((supplier, index) => {
    const supplierProducts = [
      {
        supplierId: supplier._id,
        supplierProductId: `${supplier.slug}-001`,
        name: 'Smartphone Android 128GB',
        description: 'Smartphone dernière génération avec écran OLED 6.5", appareil photo 48MP et batterie longue durée.',
        images: [
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
          'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500'
        ],
        category: 'Électronique',
        tags: ['smartphone', 'android', 'téléphone', 'mobile'],
        
        pricing: {
          supplierPrice: 150,
          suggestedRetailPrice: 299,
          minimumRetailPrice: 199,
          margin: 30
        },
        
        inventory: {
          quantity: 500,
          isUnlimited: false,
          lastUpdated: new Date()
        },
        
        variants: [
          { sku: 'SM-BLK-128', name: 'Noir 128GB', price: 150, quantity: 200, attributes: { color: 'Noir', storage: '128GB' } },
          { sku: 'SM-WHT-128', name: 'Blanc 128GB', price: 150, quantity: 150, attributes: { color: 'Blanc', storage: '128GB' } },
          { sku: 'SM-BLU-256', name: 'Bleu 256GB', price: 180, quantity: 150, attributes: { color: 'Bleu', storage: '256GB' } }
        ],
        
        shipping: {
          weight: 0.2,
          dimensions: { length: 15, width: 7, height: 1 },
          processingTime: supplier.terms.processingTime
        },
        
        sync: {
          lastSyncAt: new Date(),
          syncStatus: 'synced'
        }
      },
      
      {
        supplierId: supplier._id,
        supplierProductId: `${supplier.slug}-002`,
        name: 'Robe d\'été fleurie',
        description: 'Robe légère et élégante parfaite pour l\'été. Tissu respirant et coupe flatteuse.',
        images: [
          'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500',
          'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500'
        ],
        category: 'Mode',
        tags: ['robe', 'été', 'femme', 'fleurie'],
        
        pricing: {
          supplierPrice: 25,
          suggestedRetailPrice: 59,
          minimumRetailPrice: 39,
          margin: 40
        },
        
        inventory: {
          quantity: 200,
          isUnlimited: false,
          lastUpdated: new Date()
        },
        
        variants: [
          { sku: 'RD-S-FLR', name: 'Taille S', price: 25, quantity: 50, attributes: { size: 'S', pattern: 'Fleurie' } },
          { sku: 'RD-M-FLR', name: 'Taille M', price: 25, quantity: 75, attributes: { size: 'M', pattern: 'Fleurie' } },
          { sku: 'RD-L-FLR', name: 'Taille L', price: 25, quantity: 75, attributes: { size: 'L', pattern: 'Fleurie' } }
        ],
        
        shipping: {
          weight: 0.3,
          dimensions: { length: 30, width: 25, height: 2 },
          processingTime: supplier.terms.processingTime
        },
        
        sync: {
          lastSyncAt: new Date(),
          syncStatus: 'synced'
        }
      }
    ];
    
    products.push(...supplierProducts);
  });

  await DropshippingProduct.deleteMany({});
  const createdProducts = await DropshippingProduct.insertMany(products);
  return { count: createdProducts.length, products: createdProducts };
}

// Créer des bannières publicitaires
async function seedBanners() {
  const stores = await Store.find({}).limit(5);
  
  const banners = [
    {
      title: 'Promotion Été 2024',
      content: {
        text: 'Jusqu\'à -50% sur toute la collection été !',
        html: '<div class="banner-promo"><h2>Soldes d\'Été</h2><p>Jusqu\'à -50% sur toute la collection</p><button>Découvrir</button></div>',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800'
      },
      type: 'banner',
      position: 'top',
      targeting: {
        stores: stores.slice(0, 3).map(s => s._id),
        categories: ['Mode', 'Accessoires'],
        userRoles: ['user', 'vendor'],
        countries: ['FR', 'BE', 'CH'],
        devices: ['desktop', 'mobile']
      },
      schedule: {
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
        timezone: 'Europe/Paris'
      },
      action: {
        type: 'link',
        url: '/collections/summer-sale',
        target: '_self'
      },
      metrics: {
        impressions: 15420,
        clicks: 892,
        conversions: 156,
        ctr: 5.8
      },
      isActive: true,
      priority: 1
    },
    
    {
      title: 'Nouveau : Collection Tech',
      content: {
        text: 'Découvrez les dernières innovations technologiques',
        image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800'
      },
      type: 'popup',
      position: 'center',
      targeting: {
        categories: ['Électronique', 'Tech'],
        userRoles: ['user'],
        devices: ['desktop']
      },
      schedule: {
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 jours
        timezone: 'Europe/Paris'
      },
      action: {
        type: 'link',
        url: '/collections/tech-nouveautes',
        target: '_blank'
      },
      metrics: {
        impressions: 8750,
        clicks: 425,
        conversions: 89,
        ctr: 4.9
      },
      isActive: true,
      priority: 2
    }
  ];

  await Banner.deleteMany({});
  const createdBanners = await Banner.insertMany(banners);
  return { count: createdBanners.length, banners: createdBanners };
}

// Enrichir les boutiques existantes
async function enrichStores() {
  const stores = await Store.find({});
  let updatedCount = 0;

  for (const store of stores) {
    const enrichedData = {
      description: store.description || `${store.name} - Votre destination shopping en ligne pour des produits de qualité. Découvrez notre sélection unique et profitez d'une expérience d'achat exceptionnelle.`,
      
      settings: {
        ...store.settings,
        seo: {
          metaTitle: `${store.name} - Boutique en ligne`,
          metaDescription: `Découvrez ${store.name}, votre boutique en ligne spécialisée. Livraison rapide et service client de qualité.`,
          keywords: ['boutique', 'en ligne', 'shopping', store.name.toLowerCase()]
        },
        
        social: {
          facebook: `https://facebook.com/${store.slug}`,
          instagram: `https://instagram.com/${store.slug}`,
          twitter: `https://twitter.com/${store.slug}`
        },
        
        analytics: {
          googleAnalytics: 'GA-XXXXXXXXX',
          facebookPixel: 'FB-XXXXXXXXX',
          enableTracking: true
        },
        
        shipping: {
          freeShippingThreshold: 50,
          shippingRates: [
            { name: 'Standard', price: 5.99, estimatedDays: '3-5' },
            { name: 'Express', price: 12.99, estimatedDays: '1-2' },
            { name: 'Gratuit', price: 0, estimatedDays: '5-7', minAmount: 50 }
          ]
        }
      },
      
      metrics: {
        totalProducts: Math.floor(Math.random() * 500) + 50,
        totalOrders: Math.floor(Math.random() * 1000) + 100,
        totalRevenue: Math.floor(Math.random() * 50000) + 5000,
        averageOrderValue: Math.floor(Math.random() * 100) + 30,
        conversionRate: (Math.random() * 5 + 1).toFixed(2),
        monthlyVisitors: Math.floor(Math.random() * 10000) + 1000
      }
    };

    await Store.findByIdAndUpdate(store._id, enrichedData);
    updatedCount++;
  }

  return { count: updatedCount, message: `${updatedCount} boutiques enrichies` };
}

// Enrichir les produits existants
async function enrichProducts() {
  const products = await Product.find({});
  let updatedCount = 0;

  for (const product of products) {
    const enrichedData = {
      description: product.description || `Découvrez ${product.name}, un produit de qualité exceptionnelle. Conçu avec soin pour répondre à vos besoins et dépasser vos attentes.`,
      
      seo: {
        metaTitle: `${product.name} - Achat en ligne`,
        metaDescription: `${product.name} - ${product.description?.substring(0, 150) || 'Produit de qualité'} - Livraison rapide et retours gratuits.`,
        keywords: product.tags || [product.name.toLowerCase(), 'achat', 'en ligne']
      },
      
      specifications: {
        brand: ['Apple', 'Samsung', 'Nike', 'Adidas', 'Zara', 'H&M'][Math.floor(Math.random() * 6)],
        material: ['Coton', 'Polyester', 'Métal', 'Plastique', 'Cuir'][Math.floor(Math.random() * 5)],
        warranty: '2 ans',
        madeIn: ['France', 'Chine', 'Italie', 'Allemagne'][Math.floor(Math.random() * 4)]
      },
      
      reviews: {
        averageRating: (Math.random() * 2 + 3).toFixed(1), // Entre 3.0 et 5.0
        totalReviews: Math.floor(Math.random() * 100) + 10,
        ratingDistribution: {
          5: Math.floor(Math.random() * 50) + 20,
          4: Math.floor(Math.random() * 30) + 10,
          3: Math.floor(Math.random() * 15) + 5,
          2: Math.floor(Math.random() * 8) + 2,
          1: Math.floor(Math.random() * 5) + 1
        }
      },
      
      analytics: {
        views: Math.floor(Math.random() * 1000) + 100,
        purchases: Math.floor(Math.random() * 50) + 5,
        addToCart: Math.floor(Math.random() * 200) + 20,
        wishlist: Math.floor(Math.random() * 100) + 10
      }
    };

    await Product.findByIdAndUpdate(product._id, enrichedData);
    updatedCount++;
  }

  return { count: updatedCount, message: `${updatedCount} produits enrichis` };
}

