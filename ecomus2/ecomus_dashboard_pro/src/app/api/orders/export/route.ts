import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import Product from "@/models/Product";
import Category from "@/models/Category";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Force l'enregistrement des modèles
    Category;
    User;
    
    const token = await getToken({ req: request });
    const currentUserId = token?.id || token?.sub;
    
    if (!token || !currentUserId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer toutes les commandes
    const orders = await Order.find({})
      .populate('customer', 'name email phone')
      .setOptions({ strictPopulate: false })
      .sort({ createdAt: -1 })
      .lean();

    // Récupérer tous les produits
    const allProductIds = orders.flatMap(order => 
      order.items?.map((item: any) => item.product).filter(Boolean) || []
    );
    
    const products = await Product.find({
      _id: { $in: allProductIds }
    }).populate('category', 'name').select('title sku images price category').lean();

    const productMap = new Map(products.map(p => [p._id?.toString(), p]));

    // Générer le CSV
    const csvHeaders = [
      'Numéro de commande',
      'Date',
      'Client',
      'Email',
      'Téléphone',
      'Produits',
      'Quantité totale',
      'Sous-total',
      'Taxes',
      'Frais de port',
      'Total',
      'Statut',
      'Statut paiement',
      'Adresse de livraison'
    ];

    const csvRows = orders.map(order => {
      const customer = order.customer || {};
      const totals = order.totals || { subtotal: 0, tax: 0, shipping: 0, total: 0 };
      
      const itemsInfo = order.items?.map((item: any) => {
        const product = productMap.get(item.product?.toString());
        return `${product?.title || 'Produit supprimé'} (x${item.quantity})`;
      }).join('; ') || '';

      const totalQuantity = order.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;

      const shippingAddress = order.shippingAddress ? 
        `${order.shippingAddress.street || ''}, ${order.shippingAddress.city || ''}, ${order.shippingAddress.state || ''} ${order.shippingAddress.zipCode || ''}`.trim() : 
        '';

      return [
        order.orderNumber || '',
        new Date(order.createdAt).toLocaleDateString('fr-FR'),
        customer.name || 'Client anonyme',
        customer.email || '',
        customer.phone || '',
        `"${itemsInfo}"`, // Guillemets pour éviter les problèmes avec les virgules
        totalQuantity,
        totals.subtotal || 0,
        totals.tax || 0,
        totals.shipping || 0,
        totals.total || 0,
        order.status || '',
        order.paymentStatus || '',
        `"${shippingAddress}"` // Guillemets pour éviter les problèmes avec les virgules
      ];
    });

    // Créer le contenu CSV
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');

    // Retourner le CSV
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="orders-export-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'export:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'export des commandes' },
      { status: 500 }
    );
  }
}
