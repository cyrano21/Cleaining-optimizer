import dbConnect from '../../../utils/dbConnect';
import Order from '../../../models/Order';
import User from '../../../models/User';
import Product from '../../../models/Product';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  // Vérifier l'authentification
  if (!session) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  // Vérifier que l'utilisateur est un vendeur approuvé OU un administrateur
  if (session.user.sellerStatus !== 'approved' && session.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Accès non autorisé. Votre compte vendeur n\'est pas approuvé.' });
  }

  await dbConnect();

  // GET - Récupérer les clients du vendeur
  if (req.method === 'GET') {
    try {
      const userId = session.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      const search = req.query.search || '';
      const sortField = req.query.sortField || 'lastPurchase';
      const sortOrder = req.query.sortOrder || 'desc';

      // Récupérer les produits du vendeur
      const products = await Product.find({ seller: userId });
      const productIds = products.map(product => product._id);

      // Récupérer les commandes avec les produits du vendeur
      const orders = await Order.find({
        'items.product': { $in: productIds }
      }).populate('user');

      // Extraire les clients uniques et calculer leurs statistiques
      const customersMap = new Map();

      orders.forEach(order => {
        // Extraction des articles liés au vendeur
        const sellerItems = order.items.filter(item => 
          productIds.some(id => id.toString() === item.product.toString())
        );
        
        // Calculer le montant total des achats liés au vendeur
        const totalAmount = sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Récupérer ou créer les données du client
        const customerId = order.user ? order.user._id.toString() : order.email;
        
        if (!customersMap.has(customerId)) {
          // Nouvelle entrée client
          customersMap.set(customerId, {
            _id: customerId,
            name: order.user ? order.user.name : order.name || 'Client',
            email: order.user ? order.user.email : order.email,
            phone: order.user ? order.user.phone : order.phone,
            addresses: order.user ? order.user.addresses : [{ 
              street: order.address, 
              city: order.city, 
              postalCode: order.postalCode, 
              country: order.country,
              default: true
            }],
            createdAt: order.user ? order.user.createdAt : order.createdAt,
            orderCount: 1,
            totalSpent: totalAmount,
            lastPurchase: order.createdAt,
            status: 'regular',
            recentOrders: [{
              _id: order._id,
              orderNumber: order.orderNumber,
              createdAt: order.createdAt,
              totalAmount,
              status: order.status
            }]
          });
        } else {
          // Mise à jour d'un client existant
          const customer = customersMap.get(customerId);
          customer.orderCount += 1;
          customer.totalSpent += totalAmount;
          
          // Mettre à jour la date du dernier achat si plus récente
          if (new Date(order.createdAt) > new Date(customer.lastPurchase)) {
            customer.lastPurchase = order.createdAt;
          }
          
          // Ajouter la commande aux commandes récentes (garder les 5 plus récentes)
          customer.recentOrders.push({
            _id: order._id,
            orderNumber: order.orderNumber,
            createdAt: order.createdAt,
            totalAmount,
            status: order.status
          });
          
          // Trier et limiter les commandes récentes
          customer.recentOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          customer.recentOrders = customer.recentOrders.slice(0, 5);
        }
      });

      // Convertir en tableau et trier
      let customers = Array.from(customersMap.values());
      
      // Identifier les clients fidèles (critères : plus de 3 commandes et plus de 100€ dépensés)
      customers.forEach(customer => {
        if (customer.orderCount >= 3 && customer.totalSpent >= 100) {
          customer.status = 'loyal';
        }
      });

      // Recherche textuelle
      if (search) {
        const searchLower = search.toLowerCase();
        customers = customers.filter(
          customer => 
            customer.name.toLowerCase().includes(searchLower) || 
            customer.email.toLowerCase().includes(searchLower)
        );
      }

      // Tri
      const sortMultiplier = sortOrder === 'asc' ? 1 : -1;
      customers.sort((a, b) => {
        // Gestion des valeurs nulles/undefined
        if (a[sortField] === null || a[sortField] === undefined) return 1 * sortMultiplier;
        if (b[sortField] === null || b[sortField] === undefined) return -1 * sortMultiplier;
        
        // Tri de dates
        if (sortField === 'lastPurchase' || sortField === 'createdAt') {
          return (new Date(a[sortField]) - new Date(b[sortField])) * sortMultiplier;
        }
        
        // Tri alphanumérique ou numérique
        if (typeof a[sortField] === 'string') {
          return a[sortField].localeCompare(b[sortField]) * sortMultiplier;
        }
        
        return (a[sortField] - b[sortField]) * sortMultiplier;
      });

      // Pagination
      const totalCustomers = customers.length;
      const totalPages = Math.ceil(totalCustomers / limit);
      const paginatedCustomers = customers.slice(skip, skip + limit);

      return res.status(200).json({
        success: true,
        customers: paginatedCustomers,
        totalCustomers,
        totalPages,
        currentPage: page
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des clients:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
  }

  // Pour toutes les autres méthodes HTTP
  return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
}
