
import dbConnect from '../../../utils/dbConnect';
import Order from '../../../models/Order';
import Product from '../../../models/Product';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  // Vérifier l'authentification et les permissions
  if (!session) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  // Vérifier que l'utilisateur est un vendeur approuvé OU un administrateur
  if (session.user.sellerStatus !== 'approved' && session.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Accès non autorisé. Votre compte vendeur n\'est pas approuvé.' });
  }

  await dbConnect();

  // GET - Récupérer les statistiques vendeur
  if (req.method === 'GET') {
    try {
      const userId = session.user.id;

      // Période pour les statistiques (30 derniers jours)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // Période précédente pour comparaison (60-30 jours)
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      // Récupérer tous les produits du vendeur
      const products = await Product.find({ seller: userId });
      const productIds = products.map(product => product._id);

      // Récupérer toutes les commandes contenant des produits du vendeur
      const orders = await Order.find({
        'items.product': { $in: productIds },
        createdAt: { $gte: sixtyDaysAgo }
      }).sort({ createdAt: 1 });

      // Filtrer les commandes pour ne garder que les items des produits du vendeur
      const filteredOrders = orders.map(order => {
        const sellerItems = order.items.filter(item => 
          productIds.some(id => id.toString() === item.product.toString())
        );
        
        return {
          ...order.toObject(),
          items: sellerItems,
          totalAmount: sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        };
      });

      // Diviser les commandes en deux périodes: actuelle et précédente
      const currentPeriodOrders = filteredOrders.filter(order => 
        new Date(order.createdAt) >= thirtyDaysAgo
      );
      
      const previousPeriodOrders = filteredOrders.filter(order => 
        new Date(order.createdAt) >= sixtyDaysAgo && 
        new Date(order.createdAt) < thirtyDaysAgo
      );

      // Calculer les totaux pour la période actuelle
      const totalSales = currentPeriodOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      const totalOrders = currentPeriodOrders.length;
      
      // Calculer les totaux pour la période précédente
      const previousSales = previousPeriodOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      const previousOrders = previousPeriodOrders.length;
      
      // Calculer les variations en pourcentage
      const salesGrowth = previousSales > 0 
        ? Math.round(((totalSales - previousSales) / previousSales) * 100) 
        : 100;
      
      const ordersGrowth = previousOrders > 0 
        ? Math.round(((totalOrders - previousOrders) / previousOrders) * 100)
        : 100;

      // Préparer les données pour le graphique des ventes
      const salesData = [];
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);
      
      // Générer des données pour chaque jour des 30 derniers jours
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - 29 + i);
        date.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        
        // Filtrer les commandes pour cette journée
        const dayOrders = currentPeriodOrders.filter(order => 
          new Date(order.createdAt) >= date && 
          new Date(order.createdAt) < nextDate
        );
        
        // Calculer les ventes et le nombre de commandes pour cette journée
        const daySales = dayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        const dayOrdersCount = dayOrders.length;
        
        salesData.push({
          date: date.toISOString().split('T')[0],
          sales: daySales,
          orders: dayOrdersCount
        });
      }

      // Calculer les produits les plus vendus
      const productSales = {};
      currentPeriodOrders.forEach(order => {
        order.items.forEach(item => {
          const productId = item.product.toString();
          if (!productSales[productId]) {
            productSales[productId] = {
              sales: 0,
              quantity: 0,
              revenue: 0
            };
          }
          productSales[productId].sales += 1;
          productSales[productId].quantity += item.quantity;
          productSales[productId].revenue += item.price * item.quantity;
        });
      });

      // Récupérer les informations des produits les plus vendus
      const topProductIds = Object.keys(productSales)
        .sort((a, b) => productSales[b].quantity - productSales[a].quantity)
        .slice(0, 5);

      const topProductsData = await Product.find({ _id: { $in: topProductIds } });
      
      const topProducts = topProductIds.map(id => {
        const product = topProductsData.find(p => p._id.toString() === id);
        return {
          _id: id,
          name: product?.name || 'Produit inconnu',
          sales: productSales[id].quantity,
          revenue: productSales[id].revenue,
          stock: product?.stock || 0,
          views: product?.views || 0
        };
      });

      // Récupérer les commandes récentes
      const recentOrders = currentPeriodOrders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(order => ({
          _id: order._id,
          orderNumber: order.orderNumber,
          customerName: order.name || 'Client',
          customerEmail: order.email || '',
          totalAmount: order.totalAmount,
          status: order.status,
          createdAt: order.createdAt
        }));

      // Construire l'objet de statistiques
      const stats = {
        totalSales,
        totalOrders,
        totalProducts: products.length,
        totalCustomers: [...new Set(currentPeriodOrders.map(order => order.email))].length,
        salesGrowth,
        ordersGrowth,
        productsGrowth: 0, // À calculer si besoin
        customersGrowth: 0, // À calculer si besoin
        salesData,
        topProducts,
        recentOrders
      };

      return res.status(200).json({ success: true, data: stats });
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques vendeur:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
  }

  // Pour toutes les autres méthodes HTTP
  return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
}
