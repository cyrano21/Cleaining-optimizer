import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/chat/sessions - Récupérer toutes les sessions de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const playgroundId = searchParams.get('playgroundId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const whereClause: {
      userId: string,
      playgroundId?: string
    } = { userId: user.id }
    if (playgroundId) {
      whereClause.playgroundId = playgroundId
    }

    const chatSessions = await prisma.chatSession.findMany({
      where: whereClause,
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1 // Dernier message pour l'aperçu
        },
        playground: {
          select: {
            id: true,
            title: true
          }
        },
        _count: {
          select: {
            messages: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      skip: offset
    })

    return NextResponse.json({ sessions: chatSessions })
  } catch (error) {
    console.error('Error fetching chat sessions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/chat/sessions - Créer une nouvelle session
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, playgroundId, aiProvider, aiModel } = body

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Désactiver les autres sessions actives si nécessaire
    if (playgroundId) {
      await prisma.chatSession.updateMany({
        where: {
          userId: user.id,
          playgroundId: playgroundId,
          isActive: true
        },
        data: { isActive: false }
      })
    }

    const newSession = await prisma.chatSession.create({
      data: {
        userId: user.id,
        playgroundId: playgroundId || null,
        title: title || 'New Chat',
        description: description || null,
        aiProvider: aiProvider || 'ollama',
        aiModel: aiModel || 'llama3.2:latest',
        isActive: true
      },
      include: {
        playground: {
          select: {
            id: true,
            title: true
          }
        },
        _count: {
          select: {
            messages: true
          }
        }
      }
    })

    return NextResponse.json({ session: newSession }, { status: 201 })
  } catch (error) {
    console.error('Error creating chat session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/chat/sessions - Supprimer toutes les sessions (avec confirmation)
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const confirm = searchParams.get('confirm')
    
    if (confirm !== 'true') {
      return NextResponse.json(
        { error: 'Confirmation required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Supprimer toutes les sessions et leurs messages
    await prisma.chatMessage.deleteMany({
      where: { userId: user.id }
    })

    await prisma.chatSession.deleteMany({
      where: { userId: user.id }
    })

    return NextResponse.json({ message: 'All sessions deleted successfully' })
  } catch (error) {
    console.error('Error deleting chat sessions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}