
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import dbConnect from '../../../utils/dbConnect';
import Order from '../../../models/Order';
import User from '../../../models/User';

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

    // Récupérer les paramètres de filtrage
    const { startDate, endDate, status } = req.query;

    // Préparer les filtres pour la requête MongoDB
    const filter = {};
    
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    // Récupérer les commandes (qui servent de base pour les transactions)
    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    // Transformer les commandes en transactions
    const transactions = await Promise.all(orders.map(async (order) => {
      // Récupérer l'utilisateur si non peuplé et existe
      let user = order.user;
      if (!user && order.user) {
        try {
          user = await User.findById(order.user, 'name email');
        } catch (err) {
          console.error('Erreur lors de la récupération de l\'utilisateur:', err);
        }
      }

      // Créer un objet de transaction à partir de la commande
      return {
        id: `TRX-${order._id.toString().substring(0, 6)}`,
        date: order.createdAt,
        customer: user ? {
          id: user._id,
          name: user.name || 'Client anonyme',
          email: user.email || 'anonyme@example.com'
        } : {
          id: 'GUEST',
          name: order.shippingAddress?.fullName || 'Client invité',
          email: order.paymentResult?.email_address || 'invité@example.com'
        },
        amount: order.total || 0,
        status: order.isPaid ? 'Complétée' : (order.status === 'cancelled' ? 'Annulée' : 'En attente'),
        paymentMethod: order.paymentMethod || 'Non spécifié',
        orderId: order.orderNumber || order._id,
        items: order.items?.length || 0,
        // Simuler des frais de 2.9% + 0.30€
        fees: parseFloat(((order.total * 0.029) + 0.30).toFixed(2)),
        net: parseFloat((order.total - ((order.total * 0.029) + 0.30)).toFixed(2))
      };
    }));

    // Calculer les statistiques
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    const completedTransactions = transactions.filter(t => t.status === 'Complétée');
    const completedAmount = completedTransactions.reduce((sum, t) => sum + t.amount, 0);

    // Regrouper les données par jour pour le graphique de tendances
    const transactionsByDay = {};
    
    // Initialiser les 30 derniers jours avec des montants à 0
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      transactionsByDay[dateStr] = 0;
    }

    // Agréger les montants par jour
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const dateStr = date.toISOString().split('T')[0];
      
      if (transactionsByDay.hasOwnProperty(dateStr) && transaction.status === 'Complétée') {
        transactionsByDay[dateStr] += transaction.amount;
      }
    });

    const chartData = {
      labels: Object.keys(transactionsByDay),
      data: Object.values(transactionsByDay)
    };

    res.status(200).json({
      success: true,
      data: {
        transactions,
        stats: {
          totalTransactions: transactions.length,
          totalAmount,
          totalCompleted: completedAmount,
          successRate: transactions.length > 0 ? (completedTransactions.length / transactions.length) * 100 : 0,
          averageAmount: transactions.length > 0 ? totalAmount / transactions.length : 0,
          chartData
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des transactions:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}
