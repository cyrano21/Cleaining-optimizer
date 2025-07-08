import connectDB from "../../../../../config/db";
import User from "../../../../../models/User";

export default async function handler(req, res) {
  // Vérifier si la méthode est autorisée
  if (!["GET", "PUT"].includes(req.method)) {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    // Connexion à MongoDB
    const conn = await connectDB();
    if (!conn) {
      return res
        .status(500)
        .json({ error: "Erreur de connexion à la base de données" });
    }

    // Récupérer l'ID de l'utilisateur depuis l'URL
    const { id } = req.query; // Changé de 'uid' à 'id' pour correspondre au nom du paramètre
    if (!id) {
      return res.status(400).json({ error: "ID utilisateur manquant" });
    }

    // Vérifier l'authentification (Optionnel, en fonction de votre système)
    try {
      // Pour une implémentation plus robuste, vérifiez que l'utilisateur qui fait la requête
      // est bien l'utilisateur propriétaire du panier ou un administrateur
      // const authUser = await verifyToken(req);
      // if (authUser.id !== id && !authUser.isAdmin) {
      //   return res.status(403).json({ error: 'Non autorisé' });
      // }
    } catch (authError) {
      // Si vous préférez autoriser l'accès anonyme au panier, vous pouvez commenter cette section
      // return res.status(401).json({ error: 'Non authentifié' });
    }

    // Rechercher l'utilisateur dans la base de données
    let user;
    try {
      user = await User.findOne({ _id: id });
    } catch (err) {
      console.warn("Invalid user ID, returning empty cart:", err);
      user = null;
    }

    // Traitement selon la méthode HTTP
    switch (req.method) {
      case "GET":
        // Si l'utilisateur n'existe pas, renvoyer un panier vide
        if (!user) {
          return res.status(200).json({ items: [] });
        }

        // Renvoyer le panier de l'utilisateur
        return res.status(200).json({
          items: user.cart || [],
        });

      case "PUT":
        // Récupérer les articles du panier depuis le corps de la requête
        const { items } = req.body;

        if (!Array.isArray(items)) {
          return res.status(400).json({ error: "Format de panier invalide" });
        }

        // Si l'utilisateur n'existe pas, créer un nouvel utilisateur avec ce panier
        if (!user) {
          user = new User({
            _id: id, // utilser '_id' au lieu de 'uid'
            cart: items,
            // Vous pouvez ajouter d'autres champs par défaut ici
            createdAt: new Date(),
          });
        } else {
          // Sinon, mettre à jour le panier de l'utilisateur existant
          user.cart = items;
          user.updatedAt = new Date();
        }

        // Sauvegarder les modifications
        await user.save();

        return res.status(200).json({
          success: true,
          message: "Panier mis à jour avec succès",
          items: user.cart,
        });

      default:
        return res.status(405).json({ error: "Méthode non autorisée" });
    }
  } catch (error) {
    console.error("Erreur API panier:", error);
    return res
      .status(500)
      .json({ error: "Erreur serveur", details: error.message });
  }
}
