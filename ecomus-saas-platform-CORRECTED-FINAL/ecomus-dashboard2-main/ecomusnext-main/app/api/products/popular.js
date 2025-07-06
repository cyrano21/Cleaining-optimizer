
import { connectToDatabase } from '../../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
  }

  try {
    const { db } = await connectToDatabase();
    const limit = parseInt(req.query.limit) || 8;
    
    // Vérifier si la collection products existe
    const collections = await db.listCollections().toArray();
    const productsCollectionExists = collections.some(c => c.name === 'products');
    
    if (!productsCollectionExists) {
      console.error("Collection 'products' introuvable dans la base de données");
      return res.status(200).json([]); // Retourner un tableau vide au lieu d'une erreur
    }
    
    // Récupérer les produits populaires en évitant les erreurs courantes
    try {
      // Vérifier les champs disponibles dans la collection
      const sampleProduct = await db.collection('products').findOne({});
      console.log("Structure d'un produit:", Object.keys(sampleProduct || {}));
      
      // Construire une requête de tri basée sur les champs disponibles
      let sortCriteria = { _id: -1 }; // Tri par défaut
      
      if (sampleProduct) {
        if ('popularity' in sampleProduct) sortCriteria = { ...sortCriteria, popularity: -1 };
        if ('viewCount' in sampleProduct) sortCriteria = { ...sortCriteria, viewCount: -1 };
        if ('rating' in sampleProduct) sortCriteria = { ...sortCriteria, rating: -1 };
        if ('salesCount' in sampleProduct) sortCriteria = { ...sortCriteria, salesCount: -1 };
      }
      
      const products = await db.collection('products')
        .find({ active: { $ne: false } })
        .sort(sortCriteria)
        .limit(limit)
        .toArray();
      
      console.log(`API products/popular: ${products.length} produits récupérés avec critères:`, sortCriteria);
      return res.status(200).json(products);
    } catch (queryError) {
      console.error("Erreur lors de la requête produits:", queryError);
      
      // Fallback: récupérer tous les produits et trier côté application
      const allProducts = await db.collection('products').find({}).limit(limit).toArray();
      console.log(`API products/popular (fallback): ${allProducts.length} produits récupérés`);
      return res.status(200).json(allProducts);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des produits populaires:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Une erreur est survenue lors de la récupération des produits populaires',
      error: error.message
    });
  }
}
