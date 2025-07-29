import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db as prisma } from '@/lib/db'
import { z } from 'zod'

// Schema de validation pour créer un message
const createMessageSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  role: z.enum(['user', 'assistant']),
  sessionId: z.string().min(1, 'Session ID is required'),
  type: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

// GET /api/chat/messages - Récupérer les messages (avec filtres optionnels)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const role = searchParams.get('role')
    const type = searchParams.get('type')

    // Construire les filtres
    const where: {
      session: {
        userId: string
      },
      sessionId?: string,
      role?: string,
      type?: string,
      content?: {
        contains: string
      }
    } = {
      session: {
        userId: session.user.email,
      },
    }

    if (sessionId) {
      where.sessionId = sessionId
    }

    if (role) {
      where.role = role
    }

    if (type) {
      where.type = type
    }

    const messages = await prisma.chatMessage.findMany({
      where,
      include: {
        session: {
          select: {
            id: true,
            title: true,
            aiProvider: true,
            aiModel: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: limit,
      skip: offset,
    })

    const total = await prisma.chatMessage.count({ where })

    return NextResponse.json({
      messages,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/chat/messages - Créer un nouveau message
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createMessageSchema.parse(body)

    // Vérifier que la session appartient à l'utilisateur
    const chatSession = await prisma.chatSession.findFirst({
      where: {
        id: validatedData.sessionId,
        userId: session.user.email,
      },
    })

    if (!chatSession) {
      return NextResponse.json(
        { error: 'Session not found or access denied' },
        { status: 404 }
      )
    }

    // Créer le message
    const message = await prisma.chatMessage.create({
      data: {
        content: validatedData.content,
        role: validatedData.role,
        sessionId: validatedData.sessionId,
        userId: session.user.email,
        metadata: validatedData.metadata,
      },
      include: {
        session: {
          select: {
            id: true,
            title: true,
            aiProvider: true,
            aiModel: true,
          },
        },
      },
    })

    // Mettre à jour la session (dernière activité)
    await prisma.chatSession.update({
      where: { id: validatedData.sessionId },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating message:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/chat/messages - Supprimer tous les messages (avec confirmation)
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const confirm = searchParams.get('confirm')
    const sessionId = searchParams.get('sessionId')

    if (confirm !== 'true') {
      return NextResponse.json(
        { error: 'Confirmation required. Add ?confirm=true to the request.' },
        { status: 400 }
      )
    }

    // Construire les filtres
    const where: {
      session: {
        userId: string
      },
      sessionId?: string
    } = {
      session: {
        userId: session.user.email,
      },
    }

    if (sessionId) {
      where.sessionId = sessionId
    }

    const result = await prisma.chatMessage.deleteMany({
      where,
    })

    return NextResponse.json({
      message: `${result.count} messages deleted successfully`,
      deletedCount: result.count,
    })
  } catch (error) {
    console.error('Error deleting messages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}