import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { connectToDatabase } from "../../../lib/mongodb";
import { ObjectId } from "mongodb";
import OrderAutomationService from "../../../services/orderAutomationService";

/**
 * API pour suivre le statut des commandes dropshipping
 * POST: Vérifie le statut des commandes spécifiées
 */
export default async function handler(req, res) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ error: "Non autorisé" });
    }

    // Vérifier si l'utilisateur est administrateur
    if (session.user.role !== "admin") {
      return res.status(403).json({ error: "Accès refusé" });
    }

    // Vérifier la méthode
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Méthode non autorisée" });
    }

    const { db } = await connectToDatabase();
    const collection = db.collection("dropshippingOrders");

    // Récupérer les IDs des commandes à suivre
    const { orderIds } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ 
        error: "Veuillez fournir un tableau d'IDs de commandes à suivre" 
      });
    }

    // Récupérer les commandes à suivre
    const objectIds = orderIds.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id));
    
    if (objectIds.length === 0) {
      return res.status(400).json({ error: "Aucun ID de commande valide fourni" });
    }

    const orders = await collection.find({ _id: { $in: objectIds } }).toArray();

    if (orders.length === 0) {
      return res.status(404).json({ error: "Aucune commande trouvée avec les IDs fournis" });
    }

    // Suivre les commandes
    const trackingResults = await OrderAutomationService.trackOrders(orders);

    // Retourner les résultats
    return res.status(200).json(trackingResults);
  } catch (error) {
    console.error("Erreur lors du suivi des commandes:", error);
    return res.status(500).json({ 
      error: "Erreur serveur", 
      details: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
}
