
import connectDB from 'config/db';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { withAuth } from 'utils/auth';

/**
 * API pour synchroniser complètement le panier d'un utilisateur
 * Remplace ou fusionne le panier serveur avec celui envoyé par le client
 */
async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    await connectDB();
    const userId = req.user._id;
    const { items, merge = true } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Format de panier invalide' });
    }

    // Récupérer le panier existant de l'utilisateur
    let cart = await Cart.findOne({ user: userId });
    
    // Si on n'a pas trouvé de panier, en créer un nouveau
    if (!cart) {
      cart = new Cart({
        user: userId,
        items: []
      });
    }

    if (merge) {
      // Mode fusion: on garde les articles du panier serveur et on ajoute ceux du client
      const existingItemsMap = cart.items.reduce((map, item) => {
        const key = `${item.product.toString()}_${item.color || ''}_${item.size || ''}`;
        map[key] = item;
        return map;
      }, {});

      // Traiter chaque article du panier client
      for (const clientItem of items) {
        const productId = clientItem.id || clientItem.productId;
        if (!productId) continue;

        const key = `${productId}_${clientItem.color || ''}_${clientItem.size || ''}`;
        
        if (existingItemsMap[key]) {
          // Article existant, mettre à jour la quantité
          existingItemsMap[key].quantity = clientItem.quantity;
        } else {
          // Nouvel article, l'ajouter au panier
          cart.items.push({
            product: productId,
            quantity: clientItem.quantity,
            color: clientItem.color || '',
            size: clientItem.size || '',
            price: clientItem.price || 0
          });
        }
      }
    } else {
      // Mode remplacement: on remplace complètement le panier
      cart.items = items.map(item => ({
        product: item.id || item.productId,
        quantity: item.quantity,
        color: item.color || '',
        size: item.size || '',
        price: item.price || 0
      }));
    }

    // Calculer le total du panier
    cart.total = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    cart.updatedAt = new Date();

    // Sauvegarder le panier
    await cart.save();

    // Récupérer les infos complètes des produits pour les renvoyer
    const productIds = cart.items.map(item => item.product);
    const products = await Product.find({ _id: { $in: productIds } });
    
    const productMap = products.reduce((map, product) => {
      map[product._id.toString()] = product;
      return map;
    }, {});

    // Transformation pour le frontend
    const cartItems = cart.items.map(item => {
      const productId = item.product.toString();
      const product = productMap[productId];

      if (product) {
        return {
          id: productId,
          name: product.name,
          img: product.image || product.img,
          image: product.image || product.img,
          price: product.price,
          quantity: item.quantity,
          color: item.color,
          size: item.size,
          total: product.price * item.quantity
        };
      }

      // Produit non trouvé, renvoyer les infos minimales
      return {
        id: productId,
        name: "Produit indisponible",
        img: "/assets/images/shop/placeholder.jpg",
        image: "/assets/images/shop/placeholder.jpg",
        price: item.price || 0,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
        total: (item.price || 0) * item.quantity,
        unavailable: true
      };
    });

    return res.status(200).json(cartItems);
  } catch (error) {
    console.error('Erreur API synchronisation panier:', error);
    return res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
}

export default withAuth(handler);
