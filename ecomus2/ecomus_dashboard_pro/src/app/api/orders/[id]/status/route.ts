import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    const token = await getToken({ req: request });
    const currentUserId = token?.id || token?.sub;
    
    if (!token || !currentUserId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const orderId = id;
    const { status } = await request.json();

    // Vérifier que le statut est valide
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    }

    // Mettre à jour la commande
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { 
        status,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Commande mise à jour avec le statut: ${status}`,
      data: updatedOrder
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du statut' },
      { status: 500 }
    );
  }
}
