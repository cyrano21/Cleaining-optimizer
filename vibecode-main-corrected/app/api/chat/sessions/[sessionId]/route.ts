import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/chat/sessions/[sessionId] - Récupérer une session spécifique avec ses messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { searchParams } = new URL(request.url)
    const includeMessages = searchParams.get('includeMessages') !== 'false'
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const chatSession = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId: user.id
      },
      include: {
        messages: includeMessages ? {
          orderBy: { createdAt: 'asc' },
          take: limit,
          skip: offset
        } : false,
        playground: {
          select: {
            id: true,
            title: true,
            description: true
          }
        },
        _count: {
          select: {
            messages: true
          }
        }
      }
    })

    if (!chatSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    return NextResponse.json({ session: chatSession })
  } catch (error) {
    console.error('Error fetching chat session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/chat/sessions/[sessionId] - Mettre à jour une session
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json()
    const { title, description, aiProvider, aiModel, isActive } = body

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Vérifier que la session appartient à l'utilisateur
    const existingSession = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId: user.id
      }
    })

    if (!existingSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Si on active cette session, désactiver les autres du même projet
    if (isActive && existingSession.playgroundId) {
      await prisma.chatSession.updateMany({
        where: {
          userId: user.id,
          playgroundId: existingSession.playgroundId,
          isActive: true,
          id: { not: sessionId }
        },
        data: { isActive: false }
      })
    }

    const updatedSession = await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(aiProvider !== undefined && { aiProvider }),
        ...(aiModel !== undefined && { aiModel }),
        ...(isActive !== undefined && { isActive }),
        updatedAt: new Date()
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

    return NextResponse.json({ session: updatedSession })
  } catch (error) {
    console.error('Error updating chat session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/chat/sessions/[sessionId] - Supprimer une session
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Vérifier que la session appartient à l'utilisateur
    const existingSession = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId: user.id
      }
    })

    if (!existingSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Supprimer tous les messages de la session
    await prisma.chatMessage.deleteMany({
      where: { sessionId: sessionId }
    })

    // Supprimer la session
    await prisma.chatSession.delete({
      where: { id: sessionId }
    })

    return NextResponse.json({ message: 'Session deleted successfully' })
  } catch (error) {
    console.error('Error deleting chat session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}