import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import Product from "@/models/Product";
import Category from "@/models/Category";

// Interface pour les données de commande
interface OrderData {
  _id: any;
  orderNumber?: string;
  createdAt?: Date;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  items?: Array<{
    product: any;
    quantity: number;
    price: number;
  }>;
  totals?: {
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
  };
  status?: string;
  paymentStatus?: string;
  shippingAddress?: any;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    // Force l'enregistrement des modèles
    Category;
    User;
    
    const { id } = await params;
    
    const token = await getToken({ req: request });
    const currentUserId = token?.id || token?.sub;    
    if (!token || !currentUserId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const orderId = id;// Récupérer la commande avec toutes les données
    const orderResult = await Order.findById(orderId)
      .populate('customer', 'name email phone')
      .setOptions({ strictPopulate: false })
      .lean();

    if (!orderResult) {
      return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 });
    }

    // Cast vers notre interface pour éviter les erreurs TypeScript
    const order = orderResult as OrderData;

    // Récupérer les produits
    const productIds = order.items?.map((item: any) => item.product).filter(Boolean) || [];const products = await Product.find({
      _id: { $in: productIds }
    }).populate('category', 'name').select('title sku images price category').lean() as any[];

    const productMap = new Map(products.map((p: any) => [p._id?.toString(), p]));    // Générer le contenu PDF (ici on retourne du JSON pour simplifier)
    const invoiceData = {
      orderNumber: order.orderNumber || orderId,
      date: order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR'),
      customer: {
        name: order.customer?.name || 'Client anonyme',
        email: order.customer?.email || '',
        phone: order.customer?.phone || ''
      },
      items: order.items?.map((item: any) => {
        const product = productMap.get(item.product?.toString());
        return {
          name: product?.title || 'Produit supprimé',
          sku: product?.sku || '',
          category: product?.category?.name || 'Non catégorisé',
          quantity: item.quantity || 0,
          unitPrice: item.price || 0,
          total: (item.quantity || 0) * (item.price || 0)
        };
      }) || [],
      totals: order.totals || { subtotal: 0, tax: 0, shipping: 0, total: 0 },
      status: order.status || 'pending',
      paymentStatus: order.paymentStatus || 'pending',
      shippingAddress: order.shippingAddress || 'Adresse non fournie'
    };

    // Pour le moment, retourner les données JSON
    // Dans une vraie implémentation, on générerait un PDF avec une lib comme puppeteer ou jsPDF
    return NextResponse.json(invoiceData, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="order-${orderId}.json"`
      }
    });

  } catch (error) {
    console.error('Erreur lors de la génération de la facture:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération de la facture' },
      { status: 500 }
    );
  }
}
