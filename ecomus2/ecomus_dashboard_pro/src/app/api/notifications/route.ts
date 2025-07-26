import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";
import User from "@/models/User";

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

    // Construire la requête
    const query: any = { recipient: userId };
    if (onlyUnread) {
      query.isRead = false;
    }

    // Récupérer les notifications
    const notifications = await Notification.find(query)
      .populate('sender', 'name email avatar role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Compter le total et les non lues
    const totalNotifications = await Notification.countDocuments({ recipient: userId });
    const unreadCount = await Notification.countDocuments({ recipient: userId, isRead: false });    return NextResponse.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page,
          limit,
          total: totalNotifications,
          pages: Math.ceil(totalNotifications / limit)
        },
        unreadCount
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la récupération des notifications' 
    }, { status: 500 });
  }
}

// Marquer une notification comme lue
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    
    const token = await getToken({ req: request });
    const userId = token?.id || token?.sub;
    
    if (!token || !userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { notificationId, read = true } = await request.json();

    // Mettre à jour la notification en DB
    const updatedNotification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: read },
      { new: true }
    );

    if (!updatedNotification) {
      return NextResponse.json({ error: 'Notification non trouvée' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Notification ${read ? 'marquée comme lue' : 'marquée comme non lue'}`,
      data: updatedNotification
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la notification:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur lors de la mise à jour de la notification' 
    }, { status: 500 });
  }
}
