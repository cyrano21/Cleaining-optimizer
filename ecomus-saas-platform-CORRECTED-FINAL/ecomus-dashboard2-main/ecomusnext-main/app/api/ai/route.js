import { NextResponse } from 'next/server';
import HuggingFaceService from '../../../lib/ai/huggingface';
import dbConnect from '../../../lib/dbConnect';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

const hfService = new HuggingFaceService();

// POST /api/ai/generate-description - Générer une description de produit
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'super_admin', 'vendor'].includes(session.user.role)) {
      return NextResponse.json({ 
        success: false, 
        message: "Accès non autorisé" 
      }, { status: 401 });
    }

    const body = await request.json();
    const { action, ...data } = body;

    let result;

    switch (action) {
      case 'generate_description':
        result = await generateProductDescription(data);
        break;
      
      case 'generate_tags':
        result = await generateProductTags(data);
        break;
      
      case 'analyze_sentiment':
        result = await analyzeSentiment(data);
        break;
      
      case 'generate_recommendations':
        result = await generateRecommendations(data);
        break;
      
      case 'generate_variants':
        result = await generateProductVariants(data);
        break;
      
      case 'optimize_seo':
        result = await optimizeSEO(data);
        break;
      
      default:
        return NextResponse.json({
          success: false,
          message: "Action non reconnue"
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: "Génération IA terminée avec succès"
    });

  } catch (error) {
    console.error('Erreur API IA:', error);
    return NextResponse.json({
      success: false,
      message: "Erreur lors de la génération IA",
      error: error.message
    }, { status: 500 });
  }
}

// Fonctions spécialisées
async function generateProductDescription(data) {
  const { productName, category, features = [], existingDescription } = data;
  
  if (!productName || !category) {
    throw new Error('Nom du produit et catégorie requis');
  }

  const description = await hfService.generateProductDescription(productName, category, features);
  
  return {
    originalDescription: existingDescription,
    generatedDescription: description,
    productName,
    category,
    features
  };
}

async function generateProductTags(data) {
  const { productName, description, category } = data;
  
  if (!productName) {
    throw new Error('Nom du produit requis');
  }

  const tags = await hfService.generateProductTags(productName, description || '', category || '');
  
  return {
    productName,
    generatedTags: tags,
    suggestedTags: [...new Set([...tags, category].filter(Boolean))]
  };
}

async function analyzeSentiment(data) {
  const { reviewText, reviews = [] } = data;
  
  if (!reviewText && reviews.length === 0) {
    throw new Error('Texte d\'avis ou liste d\'avis requis');
  }

  if (reviewText) {
    // Analyser un seul avis
    const sentiment = await hfService.analyzeSentiment(reviewText);
    return {
      singleReview: {
        text: reviewText,
        sentiment
      }
    };
  } else {
    // Analyser plusieurs avis
    const sentiments = await Promise.all(
      reviews.map(async (review) => ({
        id: review.id,
        text: review.text,
        sentiment: await hfService.analyzeSentiment(review.text)
      }))
    );

    // Calculer les statistiques globales
    const positive = sentiments.filter(s => s.sentiment.sentiment === 'positive').length;
    const negative = sentiments.filter(s => s.sentiment.sentiment === 'negative').length;
    const neutral = sentiments.filter(s => s.sentiment.sentiment === 'neutral').length;
    const total = sentiments.length;

    return {
      multipleReviews: sentiments,
      statistics: {
        total,
        positive,
        negative,
        neutral,
        positivePercentage: (positive / total) * 100,
        negativePercentage: (negative / total) * 100,
        neutralPercentage: (neutral / total) * 100,
        averageConfidence: sentiments.reduce((sum, s) => sum + s.sentiment.confidence, 0) / total
      }
    };
  }
}

async function generateRecommendations(data) {
  const { userId, productId, storeId, limit = 10 } = data;
  
  await dbConnect();

  // Récupérer l'historique utilisateur
  const userHistory = await getUserHistory(userId);
  
  // Récupérer le produit actuel
  const currentProduct = productId ? await Product.findById(productId) : null;
  
  // Récupérer tous les produits de la boutique
  const allProducts = await Product.find({ 
    storeId: storeId || currentProduct?.storeId,
    isActive: true,
    _id: { $ne: productId } // Exclure le produit actuel
  }).limit(100); // Limiter pour les performances

  const recommendations = await hfService.generateRecommendations(
    userHistory,
    currentProduct,
    allProducts
  );

  return {
    userId,
    productId,
    recommendations: recommendations.slice(0, limit),
    totalFound: recommendations.length
  };
}

async function generateProductVariants(data) {
  const { productId, baseProduct } = data;
  
  let product = baseProduct;
  
  if (productId && !baseProduct) {
    await dbConnect();
    product = await Product.findById(productId);
    if (!product) {
      throw new Error('Produit introuvable');
    }
  }

  if (!product) {
    throw new Error('Données produit requises');
  }

  const variants = await hfService.generateProductVariants(product);
  
  return {
    baseProduct: {
      id: product._id,
      name: product.name,
      category: product.category
    },
    generatedVariants: variants,
    suggestions: variants.map(variant => ({
      ...variant,
      price: product.price, // Prix de base
      comparePrice: product.comparePrice,
      sku: `${product.sku || 'PROD'}-${variant.sku}`
    }))
  };
}

async function optimizeSEO(data) {
  const { productId, productData } = data;
  
  let product = productData;
  
  if (productId && !productData) {
    await dbConnect();
    product = await Product.findById(productId);
    if (!product) {
      throw new Error('Produit introuvable');
    }
  }

  if (!product) {
    throw new Error('Données produit requises');
  }

  const seoOptimization = await hfService.optimizeSEO(product);
  
  return {
    productId: product._id,
    currentSEO: {
      title: product.seoTitle || product.name,
      description: product.seoDescription || product.description,
      keywords: product.tags || []
    },
    optimizedSEO: seoOptimization,
    improvements: {
      titleImproved: seoOptimization?.seoTitle !== product.name,
      descriptionImproved: seoOptimization?.metaDescription !== product.description,
      keywordsAdded: (seoOptimization?.keywords || []).length > (product.tags || []).length
    }
  };
}

// Fonction utilitaire pour récupérer l'historique utilisateur
async function getUserHistory(userId) {
  if (!userId) return [];
  
  try {
    await dbConnect();
    
    // Récupérer les commandes de l'utilisateur
    const Order = require('../../../models/Order').default;
    const orders = await Order.find({ userId })
      .populate('items.product')
      .sort({ createdAt: -1 })
      .limit(50);

    // Extraire les produits de l'historique
    const history = [];
    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.product) {
          history.push({
            category: item.product.category,
            brand: item.product.brand,
            price: item.product.price,
            tags: item.product.tags || [],
            rating: item.product.rating || 0,
            purchaseDate: order.createdAt
          });
        }
      });
    });

    return history;
  } catch (error) {
    console.error('Erreur récupération historique:', error);
    return [];
  }
}

