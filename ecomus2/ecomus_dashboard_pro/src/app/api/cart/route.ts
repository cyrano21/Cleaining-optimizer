import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/mongodb";
import Cart from "@/models/Cart";
import Product from "@/models/Product";

// Interface pour typer le panier
interface CartData {
  _id: any;
  user: any;
  items: Array<{
    product: any;
    quantity: number;
    price: number;
  }>;
  totalPrice: number;
  isActive: boolean;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const token = await getToken({ req: request });
    const userId = token?.id || token?.sub;
    
    if (!token || !userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer le panier de l'utilisateur
    const cartResult = await Cart.findOne({ user: userId, isActive: true })
      .populate({
        path: 'items.product',
        select: 'title price images sku category',
        populate: {
          path: 'category',
          select: 'name'
        }
      })
      .lean();

    if (!cartResult) {
      return NextResponse.json({
        success: true,
        data: {
          items: [],
          totalItems: 0,
          totalPrice: 0
        }
      });
    }    // Cast vers notre interface pour éviter les erreurs TypeScript
    const cart = cartResult as unknown as CartData;

    // Calculer le total des articles
    const totalItems = cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0);

    return NextResponse.json({
      success: true,
      data: {
        items: cart.items,
        totalItems,
        totalPrice: cart.totalPrice
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du panier:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la récupération du panier' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const token = await getToken({ req: request });
    const userId = token?.id || token?.sub;
    
    if (!token || !userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { productId, quantity = 1 } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'ID du produit requis' }, { status: 400 });
    }

    // Vérifier que le produit existe
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 });
    }

    // Trouver ou créer le panier
    let cart = await Cart.findOne({ user: userId, isActive: true });
    
    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
        totalPrice: 0,
        isActive: true
      });
    }    // Vérifier si le produit est déjà dans le panier
    const existingItemIndex = (cart as any).items.findIndex(
      (item: any) => item.product.toString() === productId
    );

    if (existingItemIndex >= 0) {
      // Mettre à jour la quantité
      (cart as any).items[existingItemIndex].quantity += quantity;
    } else {
      // Ajouter le nouveau produit
      (cart as any).items.push({
        product: productId,
        quantity,
        price: product.price
      });
    }

    // Recalculer le prix total
    (cart as any).totalPrice = (cart as any).items.reduce((total: number, item: any) => {
      return total + (item.price * item.quantity);
    }, 0);

    await cart.save();

    // Populer les données du produit pour la réponse
    await cart.populate({
      path: 'items.product',
      select: 'title price images sku category',
      populate: {
        path: 'category',
        select: 'name'
      }
    });

    const totalItems = (cart as any).items.reduce((sum: number, item: any) => sum + item.quantity, 0);    return NextResponse.json({
      success: true,
      message: 'Produit ajouté au panier',
      data: {
        items: (cart as any).items,
        totalItems,
        totalPrice: (cart as any).totalPrice
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'ajout au panier:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de l\'ajout au panier' 
    }, { status: 500 });
  }
}
