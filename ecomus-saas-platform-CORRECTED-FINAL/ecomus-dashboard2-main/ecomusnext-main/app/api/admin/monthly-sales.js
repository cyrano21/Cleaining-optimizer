import dbConnect from '../../../utils/dbConnect';
import Order from '../../../models/Order';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ success: false, message: 'Non autorisé' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: `Méthode ${req.method} non autorisée` });
  }

  try {
    await dbConnect();

    // Récupérer l'année demandée ou utiliser l'année en cours
    const year = parseInt(req.query.year) || new Date().getFullYear();

    // Calculer les ventes réelles par mois pour l'année donnée
    const startDate = new Date(year, 0, 1); // 1er janvier
    const endDate = new Date(year + 1, 0, 1); // 1er janvier de l'année suivante

    // Agrégation pour récupérer les ventes par mois
    const salesByMonth = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lt: endDate
          },
          status: { $nin: ['Annulée', 'Remboursée'] } // Exclure les commandes annulées
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          totalSales: { $sum: { $ifNull: ['$totalAmount', 0] } },
          orderCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    // Créer un tableau des ventes mensuelles (12 mois)
    const monthlySales = Array(12).fill(0);
    
    // Remplir avec les données réelles
    salesByMonth.forEach(monthData => {
      const monthIndex = monthData._id - 1; // Les mois MongoDB commencent à 1
      monthlySales[monthIndex] = Math.round(monthData.totalSales);
    });

    res.status(200).json({
      success: true,
      year,
      monthlySales
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des ventes mensuelles:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}