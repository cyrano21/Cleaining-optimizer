
import dbConnect from '../../../utils/dbConnect';
import Supplier from '../../../models/Supplier';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';

// Données de démonstration pour les fournisseurs
const demoSuppliers = [
  {
    _id: '1',
    name: 'AliExpress',
    company: 'Alibaba Group',
    email: 'contact@aliexpress.com',
    phone: '+1 555-123-4567',
    address: {
      street: '969 West Wen Yi Road',
      city: 'Hangzhou',
      state: 'Zhejiang',
      postalCode: '311121',
      country: 'China'
    },
    website: 'https://www.aliexpress.com',
    description: 'Plateforme mondiale de vente en ligne offrant des produits à des prix compétitifs.',
    commissionRate: 15,
    status: 'active'
  },
  {
    _id: '2',
    name: 'BigBuy',
    company: 'BigBuy S.L.',
    email: 'info@bigbuy.eu',
    phone: '+34 961 430 618',
    address: {
      street: 'Calle Puebla de Soto',
      city: 'Valencia',
      state: 'Valencia',
      postalCode: '46024',
      country: 'Spain'
    },
    website: 'https://www.bigbuy.eu',
    description: 'Grossiste dropshipping B2B pour e-commerce en Europe.',
    commissionRate: 20,
    status: 'active'
  },
  {
    _id: '3',
    name: 'Spocket',
    company: 'Spocket Inc.',
    email: 'support@spocket.co',
    phone: '+1 888-123-4567',
    address: {
      street: '555 Burrard St',
      city: 'Vancouver',
      state: 'BC',
      postalCode: 'V7X 1M8',
      country: 'Canada'
    },
    website: 'https://www.spocket.co',
    description: 'Plateforme de dropshipping avec des fournisseurs américains et européens.',
    commissionRate: 18,
    status: 'active'
  }
];

export default async function handler(req, res) {
  try {
    // Utiliser getServerSession au lieu de getSession pour Next.js 13+
    const session = await getServerSession(req, res, authOptions);
    
    // Vérifier l'authentification pour toutes les routes sauf GET
    if (req.method !== 'GET') {
      if (!session || session.user.role !== 'admin') {
        return res.status(401).json({ success: false, message: 'Non autorisé' });
      }
    }
    
    // Connexion à la base de données avec gestion du mode démo
    const connection = await dbConnect();
    
    switch (req.method) {
      case 'GET':
        try {
          // Si nous sommes en mode démo, retourner les données de démonstration
          if (connection.demoMode) {
            console.log('Utilisation des données de démonstration pour les fournisseurs');
            return res.status(200).json(demoSuppliers);
          }
          
          // Définir un timeout pour la requête MongoDB
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
              reject(new Error('Timeout lors de la récupération des fournisseurs'));
            }, 5000); // 5 secondes de timeout
          });
          
          // Exécuter la requête avec un timeout
          const dbPromise = Supplier.find({}).lean().exec();
          
          // Utiliser Promise.race pour appliquer le timeout
          const suppliers = await Promise.race([dbPromise, timeoutPromise])
            .catch(error => {
              console.warn('Timeout ou erreur lors de la récupération des fournisseurs, utilisation des données de démonstration');
              return demoSuppliers;
            });
          
          res.status(200).json(suppliers || demoSuppliers);
        } catch (error) {
          console.error('Erreur lors de la récupération des fournisseurs:', error);
          // En cas d'erreur, retourner les données de démonstration avec une réponse 200
          // pour éviter de bloquer l'interface utilisateur
          res.status(200).json(demoSuppliers);
        }
        break;

      case 'POST':
        try {
          // Si nous sommes en mode démo, simuler la création d'un fournisseur
          if (connection.demoMode) {
            const newSupplier = {
              _id: connection.generateId(),
              ...req.body,
              createdAt: new Date().toISOString()
            };
            return res.status(201).json({ success: true, data: newSupplier });
          }
          
          const supplier = await Supplier.create(req.body);
          res.status(201).json({ success: true, data: supplier });
        } catch (error) {
          res.status(400).json({ success: false, error: error.message });
        }
        break;

      default:
        res.status(400).json({ success: false, message: 'Méthode non supportée' });
        break;
    }
  } catch (error) {
    console.error('Erreur générale dans l\'API des fournisseurs:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
}
