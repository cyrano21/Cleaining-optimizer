import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/app/utils/dbConnect'
import User from '@/app/modules/user-model'

export async function GET(request: NextRequest) {
  await dbConnect()
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  let user
  if (email) {
    user = await User.findOne({ email })
    if (!user) return NextResponse.json({}, { status: 404 })
    // Retourne uniquement les infos d'abonnement pertinentes
    return NextResponse.json({
      plan: user.plan,
      role: user.role,
      subscriptionStatus: user.subscriptionStatus,
      stripeCustomerId: user.stripeCustomerId,
      email: user.email,
    })
  } else {
    // Pour admin : retourne tous les users (optionnel)
    const users = await User.find()
    return NextResponse.json(users)
  }
}

export async function POST(request: NextRequest) {
  await dbConnect()
  const body = await request.json()
  const user = await User.create(body)
  return NextResponse.json(user, { status: 201 })
}
