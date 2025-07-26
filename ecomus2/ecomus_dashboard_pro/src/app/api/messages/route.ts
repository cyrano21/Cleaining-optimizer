import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/mongodb";
import Message from "@/models/Message";
import User from "@/models/User";

// Interface pour un message
interface Message {
  _id: string;
  from: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
  };
  to: {
    id: string;
    name: string;
  };
  subject: string;
  message: string;
  read: boolean;
  createdAt: Date;
  type: 'support' | 'order' | 'general' | 'admin';
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const token = await getToken({ req: request });
    const userId = token?.id || token?.sub;
    
    if (!token || !userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const onlyUnread = searchParams.get('unread') === 'true';

    const skip = (page - 1) * limit;

    // Construire la requête pour les messages reçus
    const query: any = { recipient: userId };
    if (onlyUnread) {
      query.isRead = false;
    }

    // Récupérer les messages
    const messages = await Message.find(query)
      .populate('sender', 'name email avatar role')
      .populate('recipient', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Compter le total et les non lus
    const totalMessages = await Message.countDocuments({ recipient: userId });
    const unreadCount = await Message.countDocuments({ recipient: userId, isRead: false });

    return NextResponse.json({
      success: true,
      data: {
        messages,
        pagination: {
          page,
          limit,
          total: totalMessages,
          pages: Math.ceil(totalMessages / limit)
        },
        unreadCount
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la récupération des messages' 
    }, { status: 500 });  }
}

// Marquer un message comme lu
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    
    const token = await getToken({ req: request });
    const userId = token?.id || token?.sub;
    
    if (!token || !userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { messageId, read = true } = await request.json();

    // Mettre à jour le message en DB
    const updatedMessage = await Message.findOneAndUpdate(
      { _id: messageId, recipient: userId },
      { isRead: read, readAt: read ? new Date() : undefined },
      { new: true }
    );

    if (!updatedMessage) {
      return NextResponse.json({ error: 'Message non trouvé' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Message ${read ? 'marqué comme lu' : 'marqué comme non lu'}`,
      data: updatedMessage
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du message:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur lors de la mise à jour du message' 
    }, { status: 500 });
  }
}
