import dbConnect from '../../../utils/dbConnect';
import Product from '../../../models/Product';
import Order from '../../../models/Order';
import User from '../../../models/User';
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

    // Récupérer le nombre total de commandes
    const totalOrders = await Order.countDocuments();

    // Récupérer le nombre total de produits
    const totalProducts = await Product.countDocuments();

    // Récupérer le nombre total de clients
    const totalCustomers = await User.countDocuments({ role: 'user' });

    // Récupérer le revenu total (somme des totalAmount de toutes les commandes)
    const orders = await Order.find();
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    // Récupérer le nombre de commandes en attente
    const pendingOrders = await Order.countDocuments({ status: 'En attente' });

    // Récupérer le nombre de produits en rupture de stock (stock = 0)
    const outOfStockProducts = await Product.countDocuments({ stock: 0 });

    res.status(200).json({
      success: true,
      totalOrders,
      totalProducts,
      totalCustomers,
      totalRevenue,
      pendingOrders,
      outOfStockProducts
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}