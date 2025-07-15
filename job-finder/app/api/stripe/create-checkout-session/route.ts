import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { pricingPlans } from '@/app/modules/pricing/utils/plans'

// Initialiser Stripe avec la clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-03-31.basil',
})

import { getAuth } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
  try {
    const { priceId, planId } = await req.json()
    const { userId } = getAuth(req)
    const userEmail = req.headers.get('x-user-email') || ''

    // Vérifier que le plan existe
    const plan = pricingPlans.find(p => p.id === planId)
    if (!plan) {
      return NextResponse.json(
        { error: 'Plan non trouvé' },
        { status: 400 }
      )
    }

    // Créer une session de paiement Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: {
        planId,
        clerkUserId: userId || '',
        userEmail: userEmail,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Erreur lors de la création de la session de paiement:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session de paiement' },
      { status: 500 }
    )
  }
}
