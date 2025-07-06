import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { connectToDatabase } from "../../../../lib/mongodb";
import { ObjectId } from "mongodb";
import OrderAutomationService from "../../../../services/orderAutomationService";

/**
 * API pour gérer une commande dropshipping spécifique
 * GET: Récupère les détails d'une commande
 * PUT: Met à jour une commande
 * DELETE: Supprime une commande
 * POST /api/dropshipping/orders/[id]/cancel: Annule une commande
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

  // Récupérer l'ID de la commande
  const { id } = req.query;
  
  if (!id || !ObjectId.isValid(id)) {
    return res.status(400).json({ error: "ID de commande invalide" });
  }

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection("dropshippingOrders");
    const orderId = new ObjectId(id);

    // GET: Récupérer les détails d'une commande
    if (req.method === "GET") {
      const order = await collection.findOne({ _id: orderId });
      
      if (!order) {
        return res.status(404).json({ error: "Commande non trouvée" });
      }
      
      return res.status(200).json(order);
    }

    // PUT: Mettre à jour une commande
    if (req.method === "PUT") {
      const updateData = req.body;
      
      // Empêcher la modification de certains champs critiques
      delete updateData._id;
      delete updateData.createdAt;
      
      // Ajouter la date de mise à jour
      updateData.updatedAt = new Date();
      
      const result = await collection.updateOne(
        { _id: orderId },
        { $set: updateData }
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: "Commande non trouvée" });
      }
      
      return res.status(200).json({
        success: true,
        message: "Commande mise à jour avec succès"
      });
    }

    // DELETE: Supprimer une commande
    if (req.method === "DELETE") {
      const result = await collection.deleteOne({ _id: orderId });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Commande non trouvée" });
      }
      
      return res.status(200).json({
        success: true,
        message: "Commande supprimée avec succès"
      });
    }

    // POST /api/dropshipping/orders/[id]/cancel: Annuler une commande
    if (req.method === "POST" && req.query.action === "cancel") {
      // Récupérer la commande
      const order = await collection.findOne({ _id: orderId });
      
      if (!order) {
        return res.status(404).json({ error: "Commande non trouvée" });
      }
      
      // Vérifier si la commande peut être annulée
      if (order.status === "cancelled" || order.status === "delivered" || order.status === "refunded") {
        return res.status(400).json({ 
          error: `Impossible d'annuler une commande avec le statut '${order.status}'` 
        });
      }
      
      // Si la commande a un ID fournisseur, tenter d'annuler auprès du fournisseur
      if (order.providerOrderId) {
        try {
          const cancelResult = await OrderAutomationService.cancelOrder(
            order.provider,
            order.providerOrderId,
            { reason: req.body.reason || "Annulé par l'administrateur" }
          );
          
          // Si l'annulation a réussi auprès du fournisseur
          if (cancelResult.success) {
            return res.status(200).json({
              success: true,
              message: "Commande annulée avec succès",
              details: cancelResult
            });
          } else {
            // L'annulation a échoué auprès du fournisseur mais a été enregistrée localement
            return res.status(207).json({
              success: false,
              message: "L'annulation auprès du fournisseur a échoué mais a été enregistrée localement",
              error: cancelResult.error,
              details: cancelResult
            });
          }
        } catch (error) {
          console.error("Erreur lors de l'annulation auprès du fournisseur:", error);
          
          // Mettre à jour localement en cas d'erreur
          await collection.updateOne(
            { _id: orderId },
            { 
              $set: {
                status: "on_hold",
                needsManualIntervention: true,
                cancelAttemptedAt: new Date(),
                cancelReason: req.body.reason || "Annulé par l'administrateur",
                error: `Erreur lors de l'annulation: ${error.message}`,
                updatedAt: new Date()
              }
            }
          );
          
          return res.status(500).json({
            success: false,
            message: "Erreur lors de l'annulation auprès du fournisseur",
            error: error.message
          });
        }
      } else {
        // Commande locale uniquement, mettre à jour le statut
        await collection.updateOne(
          { _id: orderId },
          { 
            $set: {
              status: "cancelled",
              cancelledAt: new Date(),
              cancelReason: req.body.reason || "Annulé par l'administrateur",
              updatedAt: new Date()
            }
          }
        );
        
        return res.status(200).json({
          success: true,
          message: "Commande locale annulée avec succès"
        });
      }
    }

    // Méthode non supportée
    return res.status(405).json({ error: "Méthode non autorisée" });
  } catch (error) {
    console.error("Erreur API commande dropshipping:", error);
    return res.status(500).json({ 
      error: "Erreur serveur", 
      details: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
}
