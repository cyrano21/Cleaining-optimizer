import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

// Mock data pour les produits avec support multi-store
const mockProducts = [
  {
    id: "prod-1",
    name: "Smartphone Premium",
    description: "Smartphone dernière génération avec appareil photo professionnel",
    price: 899.99,
    stock: 45,
    category: "Electronics",
    images: ["/images/placeholder.svg"],
    storeId: "store-1",
    storeSlug: "ecomus-store", // Ecomus Fashion
    status: "active",
    createdAt: "2024-01-15",
    sales: 156,
    rating: 4.8,
  },
  {
    id: "prod-2",
    name: "Écouteurs Bluetooth",
    description: "Écouteurs sans fil avec réduction de bruit active",
    price: 199.99,
    stock: 78,
    category: "Electronics",
    images: ["/images/placeholder.svg"],
    storeId: "store-2",
    storeSlug: "tech-store", // TechStore Pro
    status: "active",
    createdAt: "2024-01-14",
    sales: 234,
    rating: 4.6,
  },
  {
    id: "prod-3",
    name: "Montre Connectée",
    description: "Montre intelligente avec suivi fitness et notifications",
    price: 299.99,
    stock: 23,
    category: "Electronics", 
    images: ["/images/placeholder.svg"],
    storeId: "store-1",
    storeSlug: "ecomus-store", // Ecomus Fashion
    status: "active",
    createdAt: "2024-01-13",
    sales: 89,
    rating: 4.7,
  },
  {
    id: "prod-4",
    name: "T-shirt Premium",
    description: "T-shirt en coton bio, coupe moderne et confortable",
    price: 29.99,
    stock: 120,
    category: "Fashion",
    images: ["/images/placeholder.svg"],
    storeId: "store-1",
    storeSlug: "ecomus-store", // Ecomus Fashion
    status: "active",
    createdAt: "2024-01-12",
    sales: 78,
    rating: 4.5,
  },
  {
    id: "prod-ecomus-2",
    name: "Veste en Cuir",
    description: "Veste en cuir véritable, style vintage",
    price: 159.99,
    stock: 12,
    category: "Fashion",
    images: ["/images/placeholder.svg"],
    storeId: "store-1", // Ecomus Fashion
    status: "active",
    createdAt: "2024-01-12",
    sales: 67,
    rating: 4.5,
  },
  {
    id: "prod-5",
    name: "Laptop Gaming",
    description: "Ordinateur portable gaming haute performance",
    price: 1299.99,
    stock: 8,
    category: "Electronics",
    images: ["/images/placeholder.svg"],
    storeId: "store-2", // TechStore Pro
    status: "active",
    createdAt: "2024-01-11",
    sales: 34,
    rating: 4.9,
  },
];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const selectedStoreId = searchParams.get("storeId") || request.headers.get("x-selected-store");
    const storeSlug = searchParams.get("storeSlug");
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    let filteredProducts = [...mockProducts];

    // Filtrage par slug de boutique (pour les pages publiques)
    if (storeSlug) {
      filteredProducts = filteredProducts.filter(product => product.storeSlug === storeSlug);
    }
    // Filtrage par boutique selon le rôle
    else if (session.user.role === "vendor") {
      // Vendor ne voit que ses produits (pour sa boutique)
      filteredProducts = filteredProducts.filter(product => {
        // En réalité, on vérifierait que la boutique appartient au vendor
        return product.storeId === "store-2"; // Mock: vendor associé à store-2
      });
    } else if (session.user.role === "admin" && selectedStoreId) {
      // Admin peut filtrer par boutique sélectionnée
      filteredProducts = filteredProducts.filter(product => product.storeId === selectedStoreId);
    }
    // Si admin sans filtre de boutique, voir tous les produits

    // Filtres additionnels
    if (category) {
      filteredProducts = filteredProducts.filter(product => 
        product.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (status) {
      filteredProducts = filteredProducts.filter(product => product.status === status);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    // Calcul des statistiques
    const totalProducts = filteredProducts.length;
    const totalPages = Math.ceil(totalProducts / limit);
    const lowStockProducts = filteredProducts.filter(p => p.stock < 10).length;
    const totalValue = filteredProducts.reduce((sum, p) => sum + (p.price * p.stock), 0);

    return NextResponse.json({
      success: true,
      data: {
        products: paginatedProducts,
        pagination: {
          page,
          limit,
          totalProducts,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        stats: {
          totalProducts,
          lowStockProducts,
          totalValue,
          categories: Array.from(new Set(filteredProducts.map(p => p.category))),
        },
      },
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error);
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating product in main API:', error);
    return NextResponse.json(
      { error: 'Failed to create product', details: (error as Error).message },
      { status: 500 }
    );
  }
}