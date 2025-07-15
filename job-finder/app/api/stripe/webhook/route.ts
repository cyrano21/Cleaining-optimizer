import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import dbConnect from '@/app/utils/dbConnect'
import User from '@/app/modules/user-model'

// Initialiser Stripe avec la clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-03-31.basil',
})

// Sécuriser le webhook avec le secret Stripe
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(req: NextRequest) {
  try {
    const payload = await req.text()
    const signature = req.headers.get('stripe-signature') || ''
    
    // Vérifier la signature du webhook
    let event
    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
    } catch (err) {
      console.error('Erreur de signature du webhook:', err)
      return NextResponse.json(
        { error: 'Signature du webhook invalide' },
        { status: 400 }
      )
    }
    
    // Gérer les différents événements Stripe
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        await dbConnect()
        if (session.customer && session.subscription && session.metadata?.planId) {
          const planId = session.metadata.planId
          const customerId = session.customer.toString()
          const subscriptionId = session.subscription.toString()
          const clerkUserId = session.metadata?.clerkUserId
          const userEmail = session.metadata?.userEmail || session.customer_email || ''

          let role = 'FREE'
          if (planId === 'pro') role = 'PRO'
          else if (planId === 'coach') role = 'COACH'

          // Mise à jour par ClerkUserId si dispo, sinon par email
          await User.findOneAndUpdate(
            clerkUserId ? { _id: clerkUserId } : { email: userEmail },
            {
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              role,
              subscriptionStatus: 'active',
              plan: planId,
            },
            { new: true }
          )
        }
        break
        
      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription
        await dbConnect()
        if (subscription.customer) {
          const customerId = subscription.customer.toString()
          const status = subscription.status
          await User.updateMany(
            { stripeCustomerId: customerId },
            { subscriptionStatus: status }
          )
        }
        break
        
      case 'customer.subscription.deleted':
        const canceledSubscription = event.data.object as Stripe.Subscription
        await dbConnect()
        if (canceledSubscription.customer) {
          const customerId = canceledSubscription.customer.toString()
          await User.updateMany(
            { stripeCustomerId: customerId },
            {
              role: 'FREE',
              subscriptionStatus: 'canceled',
              stripeSubscriptionId: null,
              plan: 'free',
            }
          )
        }
        break
    }
    
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Erreur lors du traitement du webhook:', error)
    return NextResponse.json(
      { error: 'Erreur lors du traitement du webhook' },
      { status: 500 }
    )
  }
}
