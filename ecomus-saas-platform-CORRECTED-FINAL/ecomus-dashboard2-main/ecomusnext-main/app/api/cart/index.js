import connectDB from 'config/db';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { withAuth } from 'utils/auth';

/**
 * Gestionnaire d'API pour les opérations sur le panier utilisateur
 * Supporte les méthodes GET (récupérer le panier), POST (ajouter produit), PUT (modifier quantité), DELETE (supprimer produit)
 */
async function handler(req, res) {
  try {
    await connectDB();

    switch (req.method) {
      case 'GET': {
        // Récupérer le panier de l'utilisateur connecté
        const userId = req.user._id;

        // Chercher le panier dans la base de données
        const cart = await Cart.findOne({ user: userId });

        if (!cart || !cart.items || cart.items.length === 0) {
          return res.status(200).json([]);
        }

        // Convertir les IDs en tableau pour la requête
        const productIds = cart.items.map(item => item.product);

        // Récupérer tous les produits du panier en une seule requête pour optimiser
        const products = await Product.find({ 
          _id: { $in: productIds } 
        });

        // Créer un map pour accéder rapidement aux produits par leur ID
        const productMap = products.reduce((map, product) => {
          map[product._id.toString()] = product;
          return map;
        }, {});

        // Transformation des données pour correspondre au format attendu par le frontend
        const cartItems = cart.items.map(item => {
          const productId = item.product.toString();
          const product = productMap[productId];

          // Si le produit existe dans la base de données
          if (product) {
            return {
              id: productId,
              name: product.name,
              img: product.image || product.img, // Support des deux formats d'image
              image: product.image || product.img,
              price: product.price,
              quantity: item.quantity,
              color: item.color,
              size: item.size,
              total: product.price * item.quantity
            };
          }

          // Si le produit n'existe plus, renvoyer les données minimales
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
      }

      case 'POST': {
        // Ajouter un produit au panier
        const userId = req.user._id;
        let { productId, product, quantity, color, size } = req.body;

        // Assurer la compatibilité avec les deux formats (productId ou product)
        productId = productId || product;

        if (!productId || !quantity) {
          return res.status(400).json({ error: 'Produit et quantité requis' });
        }

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
          // Créer un nouveau panier si l'utilisateur n'en a pas
          cart = new Cart({
            user: userId,
            items: [{
              product: productId,
              quantity,
              color,
              size
            }]
          });
        } else {
          // Vérifier si le produit existe déjà dans le panier
          const itemIndex = cart.items.findIndex(item => 
            item.product.toString() === productId.toString() && 
            item.color === color && 
            item.size === size
          );

          if (itemIndex > -1) {
            // Mettre à jour la quantité si le produit existe déjà
            cart.items[itemIndex].quantity += parseInt(quantity, 10);
          } else {
            // Ajouter le nouveau produit au panier
            cart.items.push({
              product: productId,
              quantity: parseInt(quantity, 10),
              color,
              size
            });
          }
        }

        await cart.save();
        // Retourner le nombre d'articles dans le panier pour une mise à jour plus facile du côté client
        return res.status(201).json({ 
          message: 'Produit ajouté au panier',
          cartCount: cart.items.length
        });
      }

      case 'PUT': {
        // Mettre à jour la quantité d'un produit
        const userId = req.user._id;
        const { itemId, quantity } = req.body;

        if (!itemId || !quantity) {
          return res.status(400).json({ error: 'ID de l\'item et quantité requis' });
        }

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
          return res.status(404).json({ error: 'Panier non trouvé' });
        }

        const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);

        if (itemIndex === -1) {
          return res.status(404).json({ error: 'Produit non trouvé dans le panier' });
        }

        // Mise à jour de la quantité
        cart.items[itemIndex].quantity = quantity;

        // Si la quantité est 0, supprimer l'article
        if (quantity <= 0) {
          cart.items.splice(itemIndex, 1);
        }

        await cart.save();
        return res.status(200).json({ message: 'Panier mis à jour' });
      }

      case 'DELETE': {
        // Supprimer un produit du panier
        const userId = req.user._id;
        const { itemId } = req.query;

        if (!itemId) {
          return res.status(400).json({ error: 'ID de l\'item requis' });
        }

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
          return res.status(404).json({ error: 'Panier non trouvé' });
        }

        const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);

        if (itemIndex === -1) {
          return res.status(404).json({ error: 'Produit non trouvé dans le panier' });
        }

        // Supprimer l'article
        cart.items.splice(itemIndex, 1);

        await cart.save();
        return res.status(200).json({ message: 'Produit supprimé du panier' });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Méthode ${req.method} non autorisée` });
    }
  } catch (error) {
    console.error('Erreur API panier:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// Protéger toutes les routes du panier avec l'authentification
export default withAuth(handler);