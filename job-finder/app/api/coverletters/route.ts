import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/app/utils/dbConnect'
import CoverLetter from '@/app/modules/lettre/utils/cover-letter-model'
import User from '@/app/modules/user-model'
import { getAuth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  await dbConnect()
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const { userId: authUserId } = getAuth(request)
  if (!userId || !authUserId || userId !== authUserId) {
    return NextResponse.json([], { status: 200 })
  }
  const coverLetters = await CoverLetter.find({ userId })
  return NextResponse.json(coverLetters)
}

export async function POST(request: NextRequest) {
  await dbConnect()
  const body = await request.json()
  const { userId: authUserId } = getAuth(request)
  if (!authUserId || body.userId !== authUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
  // Server-side quota enforcement based on subscription plan
  const user = await User.findById(authUserId)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  const planLimits: Record<string, number> = { FREE: 1, PRO: 5 }
  const limit = planLimits[user.role] ?? Infinity
  const currentCount = await CoverLetter.countDocuments({ userId: authUserId })
  if (currentCount >= limit) {
    return NextResponse.json({ error: 'Cover letter creation quota reached' }, { status: 403 })
  }
  const coverLetter = await CoverLetter.create(body)
  return NextResponse.json(coverLetter, { status: 201 })
}

// PATCH : update a CoverLetter by id
export async function PATCH(request: NextRequest) {
  await dbConnect()
  const body = await request.json()
  const { id, userId, ...update } = body
  const { userId: authUserId } = getAuth(request)
  if (!id || !authUserId || userId !== authUserId) {
    return NextResponse.json({ error: 'Unauthorized or missing CoverLetter id' }, { status: 403 })
  }
  const updatedLetter = await CoverLetter.findOneAndUpdate({ _id: id, userId }, update, { new: true })
  return NextResponse.json(updatedLetter)
}

// DELETE : delete a CoverLetter by id
export async function DELETE(request: NextRequest) {
  await dbConnect()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const userId = searchParams.get('userId')
  const { userId: authUserId } = getAuth(request)
  if (!id || !userId || !authUserId || userId !== authUserId) {
    return NextResponse.json({ error: 'Unauthorized or missing CoverLetter id' }, { status: 403 })
  }
  await CoverLetter.findOneAndDelete({ _id: id, userId })
  return NextResponse.json({ success: true })
}
