import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db as prisma } from '@/lib/db'
import { z } from 'zod'

// Schema de validation pour mettre à jour un message
const updateMessageSchema = z.object({
  content: z.string().min(1).optional(),
  type: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

// GET /api/chat/messages/[messageId] - Récupérer un message spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  const { messageId } = await params
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const message = await prisma.chatMessage.findFirst({
      where: {
        id: messageId,
        session: {
          userId: session.user.email,
        },
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

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(message)
  } catch (error) {
    console.error('Error fetching message:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/chat/messages/[messageId] - Mettre à jour un message
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const { messageId } = await params
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateMessageSchema.parse(body)

    // Vérifier que le message appartient à l'utilisateur
    const existingMessage = await prisma.chatMessage.findFirst({
      where: {
        id: messageId,
        session: {
          userId: session.user.email,
        },
      },
    })

    if (!existingMessage) {
      return NextResponse.json(
        { error: 'Message not found or access denied' },
        { status: 404 }
      )
    }

    // Mettre à jour le message
    const updatedMessage = await prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        ...validatedData,
        updatedAt: new Date(),
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

    return NextResponse.json(updatedMessage)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating message:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/chat/messages/[messageId] - Supprimer un message
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const { messageId } = await params
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Vérifier que le message appartient à l'utilisateur
    const existingMessage = await prisma.chatMessage.findFirst({
      where: {
        id: messageId,
        session: {
          userId: session.user.email,
        },
      },
    })

    if (!existingMessage) {
      return NextResponse.json(
        { error: 'Message not found or access denied' },
        { status: 404 }
      )
    }

    // Supprimer le message
    await prisma.chatMessage.delete({
      where: { id: messageId },
    })

    return NextResponse.json({
      message: 'Message deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting message:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}