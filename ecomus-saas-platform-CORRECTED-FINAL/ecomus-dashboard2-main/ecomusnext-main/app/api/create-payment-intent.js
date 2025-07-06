// Fichier: pages/api/create-payment-intent.js
import Stripe from "stripe";

// Initialiser Stripe avec votre clé secrète
// ⚠️ Assurez-vous que cette clé reste confidentielle et n'est jamais exposée côté client
const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY ||
    "sk_test_51O1lvFFBSY5lGVEFuVp2a5nfPQWxVCK5pBu35k7VaStvSXkWkscUWDe0bBpEpYpj50X6HdxsQfqOCvdpJ6pq0f9p00vETiQm8K"
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  try {
    const {
      amount,
      currency = "eur",
      orderId,
      description = "Paiement de commande",
      customer_email,
      shipping,
      receipt_email,
      customer_name
    } = req.body;

    // Validation de base
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Montant invalide" });
    }
    
    if (!orderId) {
      return res.status(400).json({ message: "ID de commande requis" });
    }

    // Options avancées pour l'intention de paiement
    const paymentIntentOptions = {
      amount,
      currency,
      metadata: {
        orderId,
      },
      description,
      automatic_payment_methods: {
        enabled: true,
      },
      // Options supplémentaires si fournies
      ...(receipt_email && { receipt_email }),
      ...(shipping && { shipping }),
    };
    
    // Ajouter des informations sur le client si disponibles
    if (customer_email || customer_name) {
      paymentIntentOptions.metadata = {
        ...paymentIntentOptions.metadata,
        ...(customer_email && { customer_email }),
        ...(customer_name && { customer_name }),
      };
    }

    // Créer une intention de paiement avec toutes les options
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentOptions);

    // Renvoyer uniquement le clientSecret au client
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la création de l'intention de paiement:",
      error
    );
    res.status(500).json({
      message: "Erreur lors de la création de l'intention de paiement",
      error: error.message,
    });
  }
}
