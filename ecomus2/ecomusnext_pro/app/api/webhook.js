// Fichier: pages/api/webhook.js
import Stripe from "stripe";
import { buffer } from "micro";

// Désactiver le parsing de body par Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY ||
    "sk_test_51O1lvFFBSY5lGVEFuVp2a5nfPQWxVCK5pBu35k7VaStvSXkWkscUWDe0bBpEpYpj50X6HdxsQfqOCvdpJ6pq0f9p00vETiQm8K"
);

// Clé secrète pour vérifier les webhooks Stripe
const endpointSecret =
  process.env.STRIPE_WEBHOOK_SECRET || "whsec_votre_cle_secrete_webhook";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  const buf = await buffer(req);
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    // Vérifier la signature du webhook
    event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
  } catch (err) {
    console.error(`Erreur de signature webhook: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Gérer les événements de paiement
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      console.log(`PaymentIntent ${paymentIntent.id} a réussi!`);

      // Récupérer l'ID de commande depuis les métadonnées
      const orderId = paymentIntent.metadata.orderId;

      if (orderId) {
        try {
          // Mettre à jour le statut de la commande dans votre base de données
          // Exemple: await updateOrderStatus(orderId, 'paid');
          console.log(`Commande ${orderId} marquée comme payée`);
        } catch (error) {
          console.error(
            `Erreur lors de la mise à jour de la commande ${orderId}:`,
            error
          );
        }
      }
      break;

    case "payment_intent.payment_failed":
      const failedPayment = event.data.object;
      console.log(`Échec du paiement pour PaymentIntent ${failedPayment.id}`);
      // Logique pour gérer les paiements échoués
      break;

    default:
      console.log(`Événement non géré: ${event.type}`);
  }

  // Retourner une réponse 200 pour confirmer la réception
  res.status(200).json({ received: true });
}
