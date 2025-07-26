import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const user = await User.findById(session.user.id).select(
      'isPublicProfile allowPublicView publicFields role'
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Définir les champs par défaut selon le rôle
    const defaultFields = user.role === 'vendor' 
      ? ['firstName', 'lastName', 'avatar', 'bio', 'businessName', 'description', 'joinDate']
      : ['firstName', 'lastName', 'avatar', 'bio', 'joinDate'];

    const settings = {
      isPublicProfile: user.isPublicProfile ?? true,
      allowPublicView: user.allowPublicView ?? true,
      publicFields: user.publicFields || defaultFields
    };

    return NextResponse.json({
      success: true,
      settings
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres de confidentialité:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { isPublicProfile, allowPublicView, publicFields } = body;

    // Validation des données
    if (typeof isPublicProfile !== 'boolean' || typeof allowPublicView !== 'boolean') {
      return NextResponse.json(
        { error: 'Données invalides' },
        { status: 400 }
      );
    }

    if (!Array.isArray(publicFields)) {
      return NextResponse.json(
        { error: 'Les champs publics doivent être un tableau' },
        { status: 400 }
      );
    }

    // Champs obligatoires qui ne peuvent pas être désactivés
    const requiredFields = ['firstName', 'lastName', 'joinDate'];
    const validatedPublicFields = Array.from(new Set([...requiredFields, ...publicFields]));

    // Liste des champs autorisés
    const allowedFields = [
      'firstName', 'lastName', 'email', 'phone', 'avatar', 'bio', 
      'location', 'position', 'company', 'website', 'joinDate',
      'businessName', 'description', 'category' // Champs vendeur
    ];

    // Filtrer les champs non autorisés
    const filteredFields = validatedPublicFields.filter(field => 
      allowedFields.includes(field)
    );

    await connectDB();
    
    const user = await User.findByIdAndUpdate(
      session.user.id,
      {
        isPublicProfile,
        allowPublicView: isPublicProfile ? allowPublicView : false, // Si profil privé, pas de vue publique
        publicFields: filteredFields
      },
      { new: true, runValidators: true }
    ).select('isPublicProfile allowPublicView publicFields');

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Paramètres de confidentialité mis à jour',
      settings: {
        isPublicProfile: user.isPublicProfile,
        allowPublicView: user.allowPublicView,
        publicFields: user.publicFields
      }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres de confidentialité:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}