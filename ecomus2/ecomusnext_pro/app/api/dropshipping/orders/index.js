import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { connectToDatabase } from "../../../../lib/mongodb";

/**
 * API pour gérer les commandes dropshipping
 * GET: Récupère toutes les commandes dropshipping
 * POST: Crée une nouvelle commande dropshipping
 */
export default async function handler(req, res) {
  // Vérifier l'authentification
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: "Non autorisé" });
  }

  // Vérifier si l'utilisateur est administrateur pour les opérations sensibles
  if (req.method !== "GET" && session.user.role !== "admin") {
    return res.status(403).json({ error: "Accès refusé" });
  }

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection("dropshippingOrders");

    // GET: Récupérer toutes les commandes
    if (req.method === "GET") {
      // Paramètres de filtrage et pagination
      const { 
        status, 
        provider, 
        limit = 100, 
        skip = 0, 
        sort = "createdAt", 
        order = "desc" 
      } = req.query;

      // Construire le filtre
      const filter = {};
      if (status) filter.status = status;
      if (provider) filter.provider = provider;

      // Récupérer les commandes
      const orders = await collection
        .find(filter)
        .sort({ [sort]: order === "desc" ? -1 : 1 })
        .skip(parseInt(skip))
        .limit(parseInt(limit))
        .toArray();

      // Compter le total pour la pagination
      const total = await collection.countDocuments(filter);

      return res.status(200).json(orders);
    }

    // POST: Créer une nouvelle commande
    if (req.method === "POST") {
      const orderData = req.body;

      // Validation des données
      if (!orderData || !orderData.provider || !orderData.items || !orderData.customerInfo) {
        return res.status(400).json({ error: "Données de commande incomplètes" });
      }

      // Ajouter des champs par défaut
      const newOrder = {
        ...orderData,
        status: orderData.status || "pending",
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Insérer la commande dans la base de données
      const result = await collection.insertOne(newOrder);

      return res.status(201).json({
        success: true,
        orderId: result.insertedId,
        message: "Commande créée avec succès"
      });
    }

    // Méthode non supportée
    return res.status(405).json({ error: "Méthode non autorisée" });
  } catch (error) {
    console.error("Erreur API commandes dropshipping:", error);
    return res.status(500).json({ 
      error: "Erreur serveur", 
      details: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
}
