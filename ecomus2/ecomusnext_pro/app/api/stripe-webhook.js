
// Webhook Stripe pour gérer les événements de paiement
import Stripe from 'stripe';
import { buffer } from 'micro';
import dbConnect from '../../utils/dbConnect';
import Order from '../../models/Order';

// Configurer Stripe avec la clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Désactiver le parsing du body par Next.js car nous avons besoin du corps brut
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // Obtenir le corps brut de la requête
    const rawBody = await buffer(req);
    const signature = req.headers['stripe-signature'];

    // Vérifier que l'événement provient bien de Stripe
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error(`⚠️ Erreur de signature webhook: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Connecter à la base de données
    await dbConnect();

    // Traiter différents types d'événements
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log(`💰 PaymentIntent réussi: ${paymentIntent.id}`);
        
        // Mettre à jour le statut de la commande dans la base de données
        if (paymentIntent.metadata && paymentIntent.metadata.orderId) {
          const { orderId } = paymentIntent.metadata;
          await Order.findByIdAndUpdate(orderId, {
            paymentStatus: 'paid',
            paymentDate: new Date(),
            status: 'processing',
            transactionId: paymentIntent.id
          });
          
          console.log(`✅ Commande ${orderId} mise à jour comme payée`);
        }
        break;
        
      case 'payment_intent.payment_failed':
        const failedPaymentIntent = event.data.object;
        console.log(`❌ PaymentIntent échoué: ${failedPaymentIntent.id}`);
        
        // Mettre à jour le statut de la commande en cas d'échec
        if (failedPaymentIntent.metadata && failedPaymentIntent.metadata.orderId) {
          const { orderId } = failedPaymentIntent.metadata;
          await Order.findByIdAndUpdate(orderId, {
            paymentStatus: 'failed',
            status: 'payment_failed',
            lastError: failedPaymentIntent.last_payment_error ? 
              failedPaymentIntent.last_payment_error.message : 
              'Échec du paiement'
          });
          
          console.log(`⚠️ Commande ${orderId} marquée comme échouée`);
        }
        break;
        
      case 'charge.refunded':
        const charge = event.data.object;
        console.log(`💸 Remboursement effectué: ${charge.id}`);
        
        // Chercher l'ordre associé au paiement original
        const paymentIntentId = charge.payment_intent;
        const relatedPaymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        if (relatedPaymentIntent.metadata && relatedPaymentIntent.metadata.orderId) {
          const { orderId } = relatedPaymentIntent.metadata;
          await Order.findByIdAndUpdate(orderId, {
            paymentStatus: 'refunded',
            status: 'refunded',
            refundDate: new Date(),
            refundAmount: charge.amount_refunded / 100, // Conversion centimes en euros
            refundId: charge.id
          });
          
          console.log(`♻️ Commande ${orderId} marquée comme remboursée`);
        }
        break;
        
      default:
        // Événements non gérés explicitement
        console.log(`Événement non géré: ${event.type}`);
    }

    // Retourner une réponse 200 pour confirmer la réception
    res.status(200).json({ received: true });
  } catch (err) {
    console.error(`❌ Erreur de webhook: ${err.message}`);
    res.status(500).json({ error: `Erreur de webhook: ${err.message}` });
  }
}
