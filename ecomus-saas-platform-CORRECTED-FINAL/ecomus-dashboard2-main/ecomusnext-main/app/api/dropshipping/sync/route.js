import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import { DropshippingProduct, Supplier } from '../../../../models/SaasModels';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

// POST /api/dropshipping/sync - Synchroniser les produits avec les fournisseurs
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ 
        success: false, 
        message: "Accès non autorisé" 
      }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { supplierId, forceSync = false } = body;

    let suppliers = [];
    
    if (supplierId) {
      const supplier = await Supplier.findById(supplierId);
      if (!supplier) {
        return NextResponse.json({
          success: false,
          message: "Fournisseur introuvable"
        }, { status: 404 });
      }
      suppliers = [supplier];
    } else {
      // Synchroniser tous les fournisseurs actifs
      suppliers = await Supplier.find({ status: 'active' });
    }

    const syncResults = [];

    for (const supplier of suppliers) {
      try {
        const result = await syncSupplierProducts(supplier, forceSync);
        syncResults.push({
          supplierId: supplier._id,
          supplierName: supplier.name,
          ...result
        });
      } catch (error) {
        syncResults.push({
          supplierId: supplier._id,
          supplierName: supplier.name,
          success: false,
          error: error.message,
          productsAdded: 0,
          productsUpdated: 0,
          productsErrors: 0
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        syncResults,
        totalSuppliers: suppliers.length,
        successfulSyncs: syncResults.filter(r => r.success).length
      },
      message: "Synchronisation terminée"
    });

  } catch (error) {
    console.error('Erreur synchronisation:', error);
    return NextResponse.json({
      success: false,
      message: "Erreur lors de la synchronisation",
      error: error.message
    }, { status: 500 });
  }
}

// Fonction de synchronisation des produits d'un fournisseur
async function syncSupplierProducts(supplier, forceSync = false) {
  const { apiConfig } = supplier;
  
  if (!apiConfig || !apiConfig.endpoint) {
    throw new Error('Configuration API manquante pour ce fournisseur');
  }

  // Vérifier si une synchronisation récente a eu lieu (sauf si forceSync)
  if (!forceSync) {
    const lastSync = await DropshippingProduct.findOne({ 
      supplierId: supplier._id 
    }).sort({ 'sync.lastSyncAt': -1 });
    
    if (lastSync && lastSync.sync.lastSyncAt) {
      const hoursSinceLastSync = (Date.now() - lastSync.sync.lastSyncAt) / (1000 * 60 * 60);
      if (hoursSinceLastSync < 1) { // Moins d'1 heure
        return {
          success: true,
          message: 'Synchronisation récente, ignorée',
          productsAdded: 0,
          productsUpdated: 0,
          productsErrors: 0
        };
      }
    }
  }

  // Préparer les headers d'authentification
  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'EcomusNext-Dropshipping/1.0'
  };

  if (apiConfig.authType === 'api_key') {
    headers['Authorization'] = `Bearer ${apiConfig.apiKey}`;
  } else if (apiConfig.authType === 'basic') {
    const auth = Buffer.from(`${apiConfig.apiKey}:${apiConfig.secretKey}`).toString('base64');
    headers['Authorization'] = `Basic ${auth}`;
  }

  // Appel API au fournisseur
  const response = await fetch(apiConfig.endpoint, {
    method: 'GET',
    headers,
    timeout: 30000 // 30 secondes
  });

  if (!response.ok) {
    throw new Error(`Erreur API fournisseur: ${response.status} ${response.statusText}`);
  }

  let productsData;
  
  if (apiConfig.format === 'json') {
    productsData = await response.json();
  } else if (apiConfig.format === 'xml') {
    // Parser XML (implémentation simplifiée)
    const xmlText = await response.text();
    productsData = parseXMLProducts(xmlText);
  } else if (apiConfig.format === 'csv') {
    // Parser CSV (implémentation simplifiée)
    const csvText = await response.text();
    productsData = parseCSVProducts(csvText);
  }

  // Normaliser les données selon le format du fournisseur
  const normalizedProducts = normalizeProductsData(productsData, supplier);

  let productsAdded = 0;
  let productsUpdated = 0;
  let productsErrors = 0;

  // Traiter chaque produit
  for (const productData of normalizedProducts) {
    try {
      const existingProduct = await DropshippingProduct.findOne({
        supplierId: supplier._id,
        supplierProductId: productData.supplierProductId
      });

      const syncData = {
        lastSyncAt: new Date(),
        syncStatus: 'synced',
        syncErrors: []
      };

      if (existingProduct) {
        // Mettre à jour le produit existant
        await DropshippingProduct.findByIdAndUpdate(existingProduct._id, {
          ...productData,
          sync: syncData,
          updatedAt: new Date()
        });
        productsUpdated++;
      } else {
        // Créer un nouveau produit
        await DropshippingProduct.create({
          ...productData,
          supplierId: supplier._id,
          sync: syncData
        });
        productsAdded++;
      }

    } catch (error) {
      console.error(`Erreur traitement produit ${productData.supplierProductId}:`, error);
      productsErrors++;
      
      // Enregistrer l'erreur pour ce produit
      await DropshippingProduct.findOneAndUpdate(
        {
          supplierId: supplier._id,
          supplierProductId: productData.supplierProductId
        },
        {
          $set: {
            'sync.syncStatus': 'error',
            'sync.syncErrors': [error.message],
            'sync.lastSyncAt': new Date()
          }
        },
        { upsert: true }
      );
    }
  }

  // Mettre à jour les métriques du fournisseur
  await Supplier.findByIdAndUpdate(supplier._id, {
    'metrics.totalProducts': productsAdded + productsUpdated,
    updatedAt: new Date()
  });

  return {
    success: true,
    productsAdded,
    productsUpdated,
    productsErrors,
    totalProcessed: normalizedProducts.length
  };
}

// Fonction de normalisation des données produits
function normalizeProductsData(data, supplier) {
  // Cette fonction doit être adaptée selon le format de chaque fournisseur
  // Ici, on assume un format JSON standard
  
  if (!Array.isArray(data)) {
    data = data.products || data.items || [data];
  }

  return data.map(item => ({
    supplierProductId: item.id || item.sku || item.product_id,
    name: item.name || item.title || item.product_name,
    description: item.description || item.desc || '',
    images: Array.isArray(item.images) ? item.images : [item.image].filter(Boolean),
    category: item.category || item.category_name || 'Général',
    tags: Array.isArray(item.tags) ? item.tags : [],
    
    pricing: {
      supplierPrice: parseFloat(item.price || item.cost || item.wholesale_price || 0),
      suggestedRetailPrice: parseFloat(item.retail_price || item.msrp || 0),
      minimumRetailPrice: parseFloat(item.min_price || 0),
      margin: supplier.terms?.commission || 30
    },
    
    inventory: {
      quantity: parseInt(item.quantity || item.stock || 0),
      isUnlimited: item.unlimited_stock || false,
      lastUpdated: new Date()
    },
    
    variants: item.variants || [],
    
    shipping: {
      weight: parseFloat(item.weight || 0),
      dimensions: item.dimensions || {},
      processingTime: supplier.terms?.processingTime || 1
    },
    
    isActive: item.active !== false
  }));
}

// Fonctions de parsing (implémentations simplifiées)
function parseXMLProducts(xmlText) {
  // Implémentation XML parsing
  return [];
}

function parseCSVProducts(csvText) {
  // Implémentation CSV parsing
  return [];
}

