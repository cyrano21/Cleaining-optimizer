import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import dbConnect from '../../../../utils/dbConnect';
import DropshippingRelation from '../../../../models/DropshippingRelation';

/**
 * API pour gérer les relations entre les produits locaux et les produits des fournisseurs
 */
export default async function handler(req, res) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Non autorisé' });
    }
    
    // Connexion à la base de données
    await dbConnect();
    
    switch (req.method) {
      case 'GET':
        await getDropshippingRelations(req, res);
        break;
        
      case 'POST':
        await createDropshippingRelation(req, res);
        break;
        
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).json({ success: false, message: `Méthode ${req.method} non autorisée` });
    }
  } catch (error) {
    console.error('Erreur dans l\'API des relations de dropshipping:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
}

/**
 * Récupère les relations de dropshipping
 */
async function getDropshippingRelations(req, res) {
  try {
    const { productId, provider, externalId } = req.query;
    
    // Construire la requête
    const query = {};
    if (productId) query.productId = productId;
    if (provider) query.provider = provider;
    if (externalId) query.externalId = externalId;
    
    // Récupérer les relations
    const relations = await DropshippingRelation.find(query);
    
    res.status(200).json(relations);
  } catch (error) {
    console.error('Erreur lors de la récupération des relations de dropshipping:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
}

/**
 * Crée une nouvelle relation de dropshipping
 */
async function createDropshippingRelation(req, res) {
  try {
    const { 
      productId, 
      provider, 
      externalId, 
      externalUrl, 
      supplierPrice, 
      supplierCurrency 
    } = req.body;
    
    // Vérifier les champs obligatoires
    if (!productId || !provider || !externalId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Champs obligatoires manquants: productId, provider, externalId' 
      });
    }
    
    // Vérifier si la relation existe déjà
    const existingRelation = await DropshippingRelation.findOne({
      productId,
      provider,
      externalId
    });
    
    if (existingRelation) {
      return res.status(400).json({ 
        success: false, 
        message: 'Une relation existe déjà pour ce produit et ce fournisseur' 
      });
    }
    
    // Créer la relation
    const relation = new DropshippingRelation({
      productId,
      provider,
      externalId,
      externalUrl,
      supplierPrice,
      supplierCurrency,
      lastSyncDate: new Date()
    });
    
    await relation.save();
    
    res.status(201).json({ success: true, data: relation });
  } catch (error) {
    console.error('Erreur lors de la création de la relation de dropshipping:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
}
