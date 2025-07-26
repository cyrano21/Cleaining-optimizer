import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import connectDB from '@/lib/mongodb';
import StoreModel from '@/models/Store';
import UserModel from '@/models/User';
import mongoose, { Document, Types, FilterQuery } from 'mongoose';
import { withTimeout, createApiError } from '@/lib/api-helpers';

// --- DEFINITIVE: Correct Type Definitions ---
// Interface for the pure data. NO _id here.
interface IStore {
  name: string;
  slug: string;
  owner: Types.ObjectId;
  description?: string;
  logo?: string;
  banner?: string;
  contact?: mongoose.Schema.Types.Mixed;
  socialMedia?: mongoose.Schema.Types.Mixed;
  settings?: mongoose.Schema.Types.Mixed;
  metrics?: mongoose.Schema.Types.Mixed;
  subscription?: mongoose.Schema.Types.Mixed;
  status: 'active' | 'inactive' | 'pending';
  featured?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
// Full Mongoose document type.
type StoreDocument = IStore & Document;

// Type for the populated owner.
interface PopulatedOwnerInfo {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
}
// Type for a lean() result from Mongoose.
type LeanStoreResult = Omit<IStore, 'owner' | 'createdAt' | 'updatedAt'> & {
  _id: Types.ObjectId;
  owner: PopulatedOwnerInfo | Types.ObjectId;
  createdAt: string; // Dates from .lean() are often strings or numbers
  updatedAt: string;
};

// --- Helper Functions ---
async function generateUniqueSlug(name: string): Promise<string> {
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  let count = 0;
  let tempSlug = slug;
  while (await StoreModel.findOne({ slug: tempSlug }).lean()) {
    count++;
    tempSlug = `${slug}-${count}`;
  }
  return tempSlug;
}

// --- API Handlers ---
async function getStoresHandler(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return createApiError('Non autorisé', 401);
    }
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');

    // --- Handle single store request ---
    if (storeId) {
      if (!mongoose.Types.ObjectId.isValid(storeId)) {
        return createApiError('ID de boutique invalide', 400);
      }
      const store = await StoreModel.findById(storeId)
        .populate<{ owner: PopulatedOwnerInfo }>('owner', 'firstName lastName email')
        .lean<LeanStoreResult>();
      if (!store) {
        return createApiError('Boutique non trouvée', 404);
      }

      // VVVVVV  ROBUST LOGIC BLOCK (THE FINAL FIX)  VVVVVV
      let ownerId: string;
      let ownerInfo: PopulatedOwnerInfo | null = null;
      // We check for a unique property of the populated object.
      if (store.owner && 'firstName' in store.owner) {
        ownerInfo = store.owner;
        ownerId = store.owner._id.toString();
      } else {
        // If it's not a populated object, it's the ObjectId itself.
        ownerId = store.owner.toString();
      }
      
      if (session.user.role !== 'admin' && ownerId !== session.user.id) {
        return createApiError('Accès non autorisé à cette boutique', 403);
      }
      
      const formattedStore = {
        id: store._id.toString(),
        name: store.name,
        slug: store.slug,
        description: store.description ?? '',
        owner: ownerId,
        ownerDetails: ownerInfo,
        logoUrl: store.logo || "/images/store-logo.png",
        bannerUrl: store.banner || "/images/store-cover.jpg",
        contact: store.contact || {},
        social: store.socialMedia || {},
        settings: store.settings || {},
        stats: store.metrics || {},
        subscription: store.subscription || {},
        isActive: store.status === 'active',
        isVerified: store.featured || false,
        status: store.status,
        featured: store.featured || false,
        createdAt: store.createdAt,
        updatedAt: store.updatedAt,
      };
      return NextResponse.json({ success: true, data: formattedStore });
    }

    // --- Handle multiple stores request ---
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '12'), 100);
    const search = searchParams.get('search');
    const isActiveFilter = searchParams.get('isActive');
    const planFilter = searchParams.get('plan');
    const skip = (page - 1) * limit;
    const filter: FilterQuery<StoreDocument> = {};
    if (session.user.role === 'vendor') {
      filter.owner = new Types.ObjectId(session.user.id);
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (isActiveFilter) {
      filter.status = isActiveFilter === 'true' ? 'active' : 'inactive';
    }
    if (planFilter) {
      filter['subscription.plan'] = planFilter.toLowerCase();
    }

    const [stores, total] = await Promise.all([
      StoreModel.find(filter)
        .populate<{ owner: PopulatedOwnerInfo }>('owner', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<LeanStoreResult[]>(),
      StoreModel.countDocuments(filter),
    ]);

    const formattedStores = stores.map((store) => {
      // VVVVVV  ROBUST LOGIC BLOCK (THE FINAL FIX)  VVVVVV
      let ownerId: string | null = null;
      let ownerInfo: PopulatedOwnerInfo | null = null;
      
      // Gérer le cas où la store n'a pas d'owner (multi-vendor)
      if (store.owner) {
        if ('firstName' in store.owner) {
          ownerInfo = store.owner;
          ownerId = store.owner._id.toString();
        } else {
          ownerId = store.owner.toString();
        }
      }
      // Si pas d'owner, ownerId reste null (store multi-vendor)

      return {
        id: store._id.toString(),
        name: store.name,
        slug: store.slug,
        owner: ownerId,
        ownerDetails: ownerInfo,
        logoUrl: store.logo || "/images/store-logo.png",
        status: store.status,
        createdAt: store.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedStores,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });

  } catch (error: unknown) {
    console.error('Erreur API GET /stores:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return createApiError('Erreur serveur', 500, errorMessage);
  }
}

async function postStoresHandler(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user || !['admin', 'vendor'].includes(session.user.role!)) {
        return createApiError('Permission insuffisante', 403);
    }
    const body = await request.json();
    const { name, description } = body;
    if (!name) {
        return createApiError('Le nom de la boutique est requis', 400);
    }
    let ownerId = new Types.ObjectId(session.user.id);
    if (session.user.role === 'vendor') {
        const existingStore = await StoreModel.findOne({ owner: ownerId }).lean();
        if (existingStore) {
            return createApiError('Vous ne pouvez posséder qu\'une seule boutique', 409);
        }
    } else if (session.user.role === 'admin' && body.ownerId) {
        if (!mongoose.Types.ObjectId.isValid(body.ownerId) || !(await UserModel.findById(body.ownerId))) {
            return createApiError('Propriétaire invalide ou introuvable', 400);
        }
        ownerId = new Types.ObjectId(body.ownerId);
    }
    const newStore = new StoreModel({
      name,
      description: description || '',
      owner: ownerId,
      slug: await generateUniqueSlug(name),
      status: 'pending',
    });
    await newStore.save();
    const populatedStore = await StoreModel.findById(newStore._id)
      .populate<{ owner: PopulatedOwnerInfo }>('owner', 'firstName lastName email')
      .lean<LeanStoreResult>();
    return NextResponse.json({ success: true, data: populatedStore }, { status: 201 });
  } catch (error: unknown) {
    console.error('Erreur API POST /stores:', error);
    if (error instanceof mongoose.Error.ValidationError) {
        return createApiError('Données de validation invalides', 400, error.message);
    }
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return createApiError('Erreur serveur', 500, errorMessage);
  }
}

export const GET = withTimeout(getStoresHandler);
export const POST = withTimeout(postStoresHandler);