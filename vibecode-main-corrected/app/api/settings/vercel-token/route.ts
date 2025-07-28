import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@/features/auth/actions'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const user = await currentUser()
    
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userData = await db.user.findUnique({
      where: { id: user.id },
      select: { vercelToken: true }
    })

    return NextResponse.json({
      vercelToken: userData?.vercelToken || ''
    })
  } catch (error) {
    console.error('Error fetching Vercel token:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { vercelToken } = await request.json()

    // Validate token format (basic validation)
    if (vercelToken && !vercelToken.startsWith('vercel_')) {
      return NextResponse.json(
        { error: 'Invalid Vercel token format. Token should start with "vercel_"' },
        { status: 400 }
      )
    }

    await db.user.update({
      where: { id: user.id },
      data: { vercelToken: vercelToken || null }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving Vercel token:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}