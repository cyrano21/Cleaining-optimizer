import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import crypto from 'crypto';

export async function GET() {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user by email from session
    const userEmail = session.user.email;
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email not found in session' },
        { status: 400 }
      );
    }
    
    // Find existing user
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    console.log('📞 GET PROFILE - Utilisateur trouvé (STRUCTURE COMPLÈTE):', {
      firstName: user.firstName,
      lastName: user.lastName,  
      name: user.name,
      email: user.email,
      phone: user.phone,
      company: user.company,
      website: user.website,
      bio: user.bio,
      avatar: user.avatar,
      profile: user.profile,
      address: user.address
    });
    
    // Debug des accès aux propriétés
    console.log('🔍 DEBUG PROFILE ACCESS:');
    console.log('- user.profile:', user.profile);
    console.log('- typeof user.profile:', typeof user.profile);
    console.log('- user.profile?.company:', user.profile?.company);
    console.log('- user.profile?.position:', user.profile?.position);
    console.log('- user.profile?.avatar:', user.profile?.avatar);
    
    // Extract profile data from user model - MAPPING CORRECT selon les champs disponibles
    // Priorité: champs directs puis profile.* puis fallback intelligent
    let firstName = user.firstName || (user.profile as any)?.firstName || '';
    let lastName = user.lastName || (user.profile as any)?.lastName || '';
    
    // Si firstName et lastName sont vides, essayer d'extraire du champ 'name'
    if (!firstName && !lastName && user.name) {
      const nameParts = user.name.trim().split(' ');
      if (nameParts.length >= 2) {
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(' ');
      } else if (nameParts.length === 1) {
        firstName = nameParts[0];
        lastName = 'User'; // Fallback pour éviter la validation
      }
    }
    
    // Fallback final pour éviter les champs vides qui causent l'erreur de validation
    if (!firstName) firstName = 'Utilisateur';
    if (!lastName) lastName = 'Anonyme';
    
    // Génération intelligente du nom si pas de firstName/lastName
    let fullName = user.name || '';
    if (!fullName && firstName && lastName) {
      fullName = `${firstName} ${lastName}`;
    } else if (!fullName && !firstName && !lastName && user.email) {
      // Fallback: utiliser l'email pour générer un nom d'affichage
      const emailUsername = user.email.split('@')[0];
      fullName = emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1);
    }
    
    // Logique d'avatar intelligente avec fallbacks multiples
    let avatarUrl = user.profile?.avatar || user.avatar;
    
    // Si pas d'avatar, essayer d'autres sources
    if (!avatarUrl) {
      // 1. Gravatar basé sur l'email - on l'utilise directement avec fallback

      const emailForHash = user.email.toLowerCase().trim();
      const emailHash = crypto.createHash('md5').update(emailForHash).digest('hex');
      const gravatarUrl = `https://www.gravatar.com/avatar/${emailHash}?d=mp&s=200`; // mp = mystery person fallback
      
      // Utiliser Gravatar comme avatar principal
      avatarUrl = gravatarUrl;
      
      console.log('💡 Debug Gravatar:');
      console.log('  - Email original:', user.email);
      console.log('  - Email pour hash:', emailForHash);
      console.log('  - Hash MD5 complet:', emailHash);
      console.log('  - Hash longueur:', emailHash.length);
      console.log('  - URL Gravatar:', gravatarUrl);
    }
    
    const profileData = {
      firstName: firstName,
      lastName: lastName,
      name: fullName,
      email: user.email,
      phone: user.profile?.phone || user.phone || '',
      company: user.profile?.company || user.company || '',
      website: user.profile?.website || user.website || '',
      bio: user.profile?.bio || user.bio || '',
      avatar: avatarUrl,
      avatarPublicId: user.profile?.avatarPublicId || '', // Ajouter le public_id
      location: user.address?.city || user.profile?.location || '',
      position: user.profile?.position || '',
      joinDate: user.joinDate || user.createdAt,
    };
    
    console.log('📞 GET PROFILE - Données extraites:', profileData);

    return NextResponse.json({
      success: true,
      data: profileData
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, email, phone, company, website, bio, avatar, avatarPublicId, location, position } = body;

    // Log des données reçues
    console.log('📞 PROFILE UPDATE - Données reçues:', {
      firstName,
      lastName,
      email,
      phone: phone,
      phoneType: typeof phone,
      phoneLength: phone?.length,
      company,
      website,
      bio,
      location,
      position
    });

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'First name, last name, and email are required' },
        { status: 400 }
      );
    }

    // Get user by email from session
    const userEmail = session.user.email;
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email not found in session' },
        { status: 400 }
      );
    }
    
    // Find and update user
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Log de l'utilisateur avant modification - CORRIGÉ POUR VRAIS CHAMPS
    console.log('📞 AVANT MODIFICATION - Utilisateur actuel:', {
      name: user.name,
      email: user.email,
      phone: user.phone, // CORRIGÉ
      phoneNumber: user.phoneNumber, // pour comparaison
      company: user.profile?.company || user.company,
      website: user.profile?.website || user.website,
      bio: user.profile?.bio || user.bio,
      location: user.address?.city || user.location,
      position: user.profile?.position || user.position
    });

    // Formatage du numéro de téléphone pour la France
    let formattedPhone = phone || '';
    if (formattedPhone && !formattedPhone.startsWith('+')) {
      // Si le numéro commence par 0, on le remplace par +33
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '+33' + formattedPhone.substring(1);
      }
      // Si le numéro ne commence pas par + et n'est pas vide, on ajoute +33
      else if (formattedPhone.length > 0) {
        formattedPhone = '+33' + formattedPhone;
      }
    }

    console.log('📞 FORMATAGE TÉLÉPHONE:', {
      original: phone,
      formatted: formattedPhone
    });

    // Update user fields - CORRECTION POUR UTILISER LA STRUCTURE MONGODB RÉELLE
    // D'après vos logs, les données sont stockées dans user.profile.*
    
    // S'assurer que la structure profile existe
    if (!user.profile) {
      user.profile = {};
    }
    
    // Mettre à jour les champs principaux ET dans profile
    const fullName = `${firstName} ${lastName}`.trim();
    user.name = fullName; // Champ racine
    user.firstName = firstName; // Champ firstName requis
    user.lastName = lastName; // Champ lastName requis
    user.profile.name = fullName; // Champ dans profile (structure réelle)
    user.email = email;
    
    // Mettre à jour le téléphone dans profile (structure réelle)
    user.profile.phone = formattedPhone; // VRAIS DONNÉES dans profile.phone
    user.phone = formattedPhone; // Aussi dans le champ racine pour compatibilité
    
    // Mettre à jour les autres données dans profile (structure MongoDB réelle)
    user.profile.company = company || '';
    user.profile.website = website || '';
    user.profile.bio = bio || '';
    user.profile.position = position || '';
    
    // Mettre à jour l'avatar dans profile (structure réelle)
    if (avatar) {
      user.avatar = avatar; // Champ racine
      user.profile.avatar = avatar; // Champ dans profile (structure réelle)
    }
    
    // Mettre à jour l'avatarPublicId dans profile
    if (avatarPublicId !== undefined) {
      user.profile.avatarPublicId = avatarPublicId;
    }
    
    // Mettre à jour l'adresse dans la structure réelle
    if (!user.address) {
      user.address = {};
    }
    user.address.city = location || '';
    user.profile.location = location || ''; // Aussi dans profile pour cohérence
    
    console.log('📞 AVANT SAUVEGARDE - Données à sauvegarder:', {
      name: user.name,
      profileName: user.profile?.name, // AJOUTÉ: voir profile.name
      email: user.email,
      phone: user.phone,
      profilePhone: user.profile?.phone, // AJOUTÉ: voir profile.phone
      company: user.profile?.company,
      website: user.profile?.website,
      bio: user.profile?.bio,
      location: user.address?.city,
      profileLocation: user.profile?.location, // AJOUTÉ: voir profile.location
      position: user.profile?.position,
      avatar: user.avatar,
      profileAvatar: user.profile?.avatar // AJOUTÉ: voir profile.avatar
    });
    
    // Save the updated user
    await user.save();
    
    console.log('📞 APRÈS SAUVEGARDE - Utilisateur sauvegardé:', {
      name: user.name,
      profileName: user.profile?.name, // AJOUTÉ: voir profile.name
      email: user.email,
      phone: user.phone,
      profilePhone: user.profile?.phone, // AJOUTÉ: voir profile.phone
      company: user.profile?.company,
      website: user.profile?.website,
      bio: user.profile?.bio,
      location: user.address?.city,
      profileLocation: user.profile?.location, // AJOUTÉ: voir profile.location
      position: user.profile?.position,
      avatar: user.avatar,
      profileAvatar: user.profile?.avatar // AJOUTÉ: voir profile.avatar
    });
    
    // Return updated profile data - UTILISE LA STRUCTURE MONGODB RÉELLE
    const profileData = {
      name: user.profile?.name || user.name || '', // profile.name en priorité
      firstName,
      lastName,
      email: user.email,
      phone: user.profile?.phone || user.phone || '', // profile.phone en priorité
      company: user.profile?.company || '',
      website: user.profile?.website || '',
      bio: user.profile?.bio || '',
      avatar: user.profile?.avatar || user.avatar || '/images/placeholder.svg', // profile.avatar en priorité
      location: user.profile?.location || user.address?.city || '',
      position: user.profile?.position || '',
      joinDate: user.joinDate || user.createdAt,
    };
    
    console.log('📞 DONNÉES RETOURNÉES:', profileData);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: profileData
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}