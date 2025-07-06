import dbConnect from '../../../utils/dbConnect';
import Category from '../../../models/Category';
import Order from '../../../models/Order';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  // Vérification que l'utilisateur est un administrateur
  if (!session || session.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Accès non autorisé' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: `Méthode ${req.method} non autorisée` });
  }

  try {
    await dbConnect();

    // Récupérer toutes les catégories
    const categories = await Category.find({ isActive: true });

    // Calculer les statistiques réelles des ventes par catégorie
    const Product = require('../../../models/Product');
    
    // Récupérer les statistiques réelles de ventes par catégorie
    const categoryStats = await Product.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $unwind: '$categoryInfo'
      },
      {
        $group: {
          _id: '$categoryInfo._id',
          name: { $first: '$categoryInfo.name' },
          totalSold: { $sum: { $ifNull: ['$totalSold', 0] } },
          productCount: { $sum: 1 }
        }
      },
      {
        $sort: { totalSold: -1 }
      }
    ]);

    // Calculer le total des ventes pour les pourcentages
    const totalSales = categoryStats.reduce((sum, cat) => sum + cat.totalSold, 0);
    
    // Calculer les pourcentages réels
    const categoriesWithStats = categoryStats.map(category => ({
      _id: category._id,
      name: category.name,
      salesPercentage: totalSales > 0 ? Math.round((category.totalSold / totalSales) * 100) : 0,
      totalSold: category.totalSold,
      productCount: category.productCount
    }));

    // Si aucune vente n'existe, répartir équitablement
    const normalizedCategories = totalSales === 0 
      ? categories.map(cat => ({
          _id: cat._id,
          name: cat.name,
          salesPercentage: Math.round(100 / categories.length),
          totalSold: 0,
          productCount: 0
        }))
      : categoriesWithStats;

    res.status(200).json(normalizedCategories);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques par catégorie:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
}