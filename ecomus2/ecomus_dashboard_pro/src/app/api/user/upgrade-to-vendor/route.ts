import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Store from '@/models/Store';

// Types pour les données
interface UpgradeRequestBody {
  businessName: string;
  businessType?: string;
  description?: string;
  phone?: string;
  address?: any;
}

interface UserDocument {
  _id: string;
  name: string;
  email: string;
  role: string;
  profile?: any;
}

interface StoreDocument {
  _id: string;
  name: string;
  slug: string;
  description: string;
  subscription: any;
  design: any;
  isActive: boolean;
  isVerified: boolean;
}

type BusinessType = 'fashion' | 'beauty' | 'tech' | 'food' | 'home' | 'sports' | 'books' | 'jewelry' | 'accessories' | 'general';

/**
 * POST /api/user/upgrade-to-vendor
 * Upgrade un utilisateur vers vendeur et crée automatiquement son store
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Non authentifié' 
      }, { status: 401 });
    }    const body: UpgradeRequestBody = await request.json();
    const { businessName, businessType, description, phone, address } = body;

    if (!businessName) {
      return NextResponse.json({ 
        success: false, 
        error: 'Nom de la boutique requis' 
      }, { status: 400 });
    }

    await dbConnect();

    // Vérifier que l'utilisateur existe et n'est pas déjà vendeur
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Utilisateur non trouvé' 
      }, { status: 404 });
    }

    if (user.role === 'vendor' || user.role === 'admin' || user.role === 'super_admin') {
      return NextResponse.json({ 
        success: false, 
        error: 'Utilisateur a déjà les droits vendeur ou supérieurs' 
      }, { status: 400 });
    }

    // Vérifier qu'un store avec ce nom n'existe pas déjà
    const slug = businessName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const existingStore = await Store.findOne({ slug });
    if (existingStore) {
      return NextResponse.json({ 
        success: false, 
        error: 'Une boutique avec ce nom existe déjà' 
      }, { status: 400 });
    }

    // Transaction pour upgrade user + création store
    const session_db = await Store.startSession();
    
    try {
      await session_db.withTransaction(async () => {
        // 1. Upgrade utilisateur vers vendeur
        await User.findByIdAndUpdate(
          user._id,
          { 
            role: 'vendor',
            'profile.businessName': businessName,
            'profile.businessType': businessType || 'general',
            'profile.phone': phone || '',
            'profile.address': address || ''
          },
          { session: session_db }
        );

        // 2. Créer le store automatiquement
        const newStore = new Store({
          name: businessName,
          slug: slug,
          description: description || `Boutique ${businessName}`,
          owner: user._id,
          contact: {
            email: user.email,
            phone: phone || '',
            address: address || {}
          },
          subscription: {
            plan: 'free',
            limits: {
              maxProducts: 50,
              maxStorage: 500, // 500MB
              maxOrders: 50
            },
            startedAt: new Date(),
            isActive: true
          },
          design: {            selectedTemplate: {
              id: 'home-02',
              name: 'Home Fashion Basic',
              category: getTemplateCategory(businessType || 'general')
            },
            additionalPages: [
              {
                id: 'about-us',
                name: 'À propos',
                isEnabled: true
              },
              {
                id: 'contact-1',
                name: 'Contact',
                isEnabled: true
              }
            ],            customizations: {
              colors: {
                primary: getDefaultPrimaryColor(businessType || 'general'),
                secondary: '#6c757d',
                accent: '#28a745'
              },
              fonts: {
                heading: 'Inter',
                body: 'Inter'
              },
              layout: {
                headerStyle: 'modern',
                footerStyle: 'simple'
              }
            }
          },
          stats: {
            totalProducts: 0,
            totalOrders: 0,
            totalRevenue: 0,
            averageRating: 0
          },
          isActive: true,
          isVerified: false // Nécessite validation admin
        });

        await newStore.save({ session: session_db });

        // Log de l'action
        console.log(`[UPGRADE] User ${user.email} upgraded to vendor with store: ${businessName}`);
      });

      await session_db.commitTransaction();

    } catch (transactionError) {
      await session_db.abortTransaction();
      throw transactionError;
    } finally {
      await session_db.endSession();
    }    // Récupérer les données mises à jour
    const updatedUser = await User.findById(user._id).lean() as UserDocument | null;
    const createdStore = await Store.findOne({ owner: user._id }).lean() as StoreDocument | null;

    if (!updatedUser || !createdStore) {
      throw new Error('Erreur lors de la récupération des données mises à jour');
    }

    return NextResponse.json({
      success: true,
      message: 'Upgrade vers vendeur réussi ! Votre boutique a été créée.',
      data: {
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          profile: updatedUser.profile
        },
        store: {
          id: createdStore._id,
          name: createdStore.name,
          slug: createdStore.slug,
          description: createdStore.description,
          subscription: createdStore.subscription,
          design: createdStore.design,
          isActive: createdStore.isActive,
          isVerified: createdStore.isVerified
        }
      }
    });
  } catch (error: unknown) {
    console.error('Erreur upgrade to vendor:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur serveur lors de l\'upgrade vers vendeur' 
      },
      { status: 500 }
    );
  }
}

/**
 * Détermine la catégorie de template selon le type de business
 */
function getTemplateCategory(businessType: string): string {  const categoryMap: Record<BusinessType, string> = {
    'fashion': 'fashion',
    'beauty': 'beauty',
    'tech': 'tech',
    'food': 'food',
    'home': 'furniture',
    'sports': 'sports',
    'books': 'books',
    'jewelry': 'jewelry',
    'accessories': 'accessories',
    'general': 'generic'
  };
  
  return categoryMap[businessType as BusinessType] || 'generic';
}

/**
 * Couleur primaire par défaut selon le type de business
 */
function getDefaultPrimaryColor(businessType: string): string {  const colorMap: Record<BusinessType, string> = {
    'fashion': '#e91e63', // Rose
    'beauty': '#9c27b0',  // Violet
    'tech': '#2196f3',    // Bleu
    'food': '#ff5722',    // Orange
    'home': '#795548',    // Marron
    'sports': '#4caf50',  // Vert
    'books': '#607d8b',   // Bleu gris
    'jewelry': '#ffc107', // Or
    'accessories': '#ff9800', // Orange ambré
    'general': '#007bff'  // Bleu par défaut
  };
  
  return colorMap[businessType as BusinessType] || '#007bff';
}
