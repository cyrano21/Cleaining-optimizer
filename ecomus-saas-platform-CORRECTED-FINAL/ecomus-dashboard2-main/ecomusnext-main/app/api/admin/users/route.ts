import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import { checkAdminAccess, normalizeRole } from '@/lib/role-utils';

// Types pour la gestion des admins
interface AdminUser {
  _id?: string;
  email: string;
  name: string;
  password?: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR';
  permissions: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  createdBy: string;
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
    phone?: string;
    department?: string;
    position?: string;
  };
}

interface AdminActionLog {
  action: string;
  targetUser: string;
  performedBy: string;
  timestamp: Date;
  details: any;
  ipAddress?: string;
}

// Permissions disponibles par rôle
const ROLE_PERMISSIONS = {
  SUPER_ADMIN: [
    'ADMIN_ACCESS',
    'USER_MANAGEMENT', 
    'ADMIN_MANAGEMENT',
    'VENDOR_ACCESS',
    'PRODUCT_MANAGEMENT',
    'ORDER_MANAGEMENT',
    'ANALYTICS_ACCESS',
    'SYSTEM_SETTINGS',
    'ALL_DASHBOARDS',
    'AUDIT_LOGS',
    'SECURITY_SETTINGS'
  ],
  ADMIN: [
    'ADMIN_ACCESS',
    'USER_MANAGEMENT',
    'VENDOR_ACCESS', 
    'PRODUCT_MANAGEMENT',
    'ORDER_MANAGEMENT',
    'ANALYTICS_ACCESS',
    'ALL_DASHBOARDS'
  ],
  MODERATOR: [
    'ADMIN_ACCESS',
    'USER_MANAGEMENT',
    'PRODUCT_MANAGEMENT',
    'ORDER_MANAGEMENT'
  ]
};

// Vérification des permissions avec système unifié
async function checkAdminPermissions(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return { error: 'Token manquant', status: 401 };
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('ERREUR CRITIQUE: JWT_SECRET non configuré dans .env');
      return { error: 'Configuration serveur manquante', status: 500 };
    }

    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret) as any;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        console.log('Token JWT expiré:', error.expiredAt);
        return { error: 'Session expirée, veuillez vous reconnecter', status: 401 };
      } else if (error.name === 'JsonWebTokenError') {
        console.log('Token JWT invalide:', error.message);
        return { error: 'Token invalide', status: 401 };
      } else {
        console.log('Erreur JWT:', error.message);
        return { error: 'Erreur d\'authentification', status: 401 };
      }
    }
    
    await connectDB();
    // Recherche compatible avec les deux systèmes de rôles
    const user = await User.findOne({ 
      $and: [
        { email: decoded.email },
        { isActive: true },
        {
          $or: [
            { role: { $in: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'] } },
            { role: { $in: ['admin', 'vendor'] } }
          ]
        }
      ]
    });

    if (!user || !checkAdminAccess(user.role)) {
      return { error: 'Utilisateur non autorisé', status: 403 };
    }

    return { user, error: null };
  } catch (error: any) {
    console.error('Erreur vérification permissions:', error);
    
    // Gestion spécifique des différents types d'erreurs JWT
    if (error.name === 'TokenExpiredError') {
      return { error: 'Token expiré - Veuillez vous reconnecter', status: 401 };
    } else if (error.name === 'JsonWebTokenError') {
      return { error: 'Token invalide - Format incorrect', status: 401 };
    } else if (error.name === 'NotBeforeError') {
      return { error: 'Token pas encore valide', status: 401 };
    }
    
    return { error: 'Erreur d\'authentification', status: 401 };
  }
}

// Log des actions administratives
async function logAdminAction(action: string, targetUser: string, performedBy: string, details: any, req: NextRequest) {
  try {
    // Optionnel : créer un modèle AdminLog pour une meilleure structure
    console.log('Admin Action:', { action, targetUser, performedBy, details });
  } catch (error) {
    console.error('Erreur lors du logging:', error);
  }
}

// GET - Récupérer tous les administrateurs
export async function GET(req: NextRequest) {
  try {
    const authCheck = await checkAdminPermissions(req);
    if (authCheck.error) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }    const { user } = authCheck;
    const normalizedRole = normalizeRole(user.role);
    
    // Seuls les SUPER_ADMIN et ADMIN peuvent voir la liste des admins
    if (!['SUPER_ADMIN', 'ADMIN'].includes(normalizedRole)) {
      return NextResponse.json({ error: 'Permission insuffisante' }, { status: 403 });
    }

    await connectDB();
    // Recherche de tous les admins avec compatibilité
    const admins = await User.find(
      { 
        $or: [
          { role: { $in: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'] } },
          { role: { $in: ['admin', 'vendor'] } }
        ]
      },
      { password: 0 } // Exclure le mot de passe
    ).sort({ createdAt: -1 });

    return NextResponse.json({ admins });
  } catch (error) {
    console.error('Erreur GET admins:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer un nouvel administrateur
export async function POST(req: NextRequest) {
  try {
    const authCheck = await checkAdminPermissions(req);
    if (authCheck.error) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const { user: currentUser } = authCheck;
    const normalizedRole = normalizeRole(currentUser.role);
    
    // Seuls les SUPER_ADMIN peuvent créer des admins
    if (normalizedRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Seuls les SUPER_ADMIN peuvent créer des administrateurs' }, { status: 403 });
    }    const body = await req.json();
    const { email, name, password, role, profile } = body;

    // Validation des données
    if (!email || !name || !password || !role) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    if (!['SUPER_ADMIN', 'ADMIN', 'MODERATOR'].includes(role)) {
      return NextResponse.json({ error: 'Rôle invalide' }, { status: 400 });
    }

    // Type assertion après validation
    const validRole = role as 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR';

    if (password.length < 8) {
      return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 8 caractères' }, { status: 400 });
    }    await connectDB();

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 409 });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer le nouvel administrateur
    const newAdmin = new User({
      email: email.toLowerCase(),
      name,
      password: hashedPassword,
      role: validRole,
      permissions: ROLE_PERMISSIONS[validRole] || [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: currentUser.email,
      profile: {
        firstName: profile?.firstName || name.split(' ')[0] || '',
        lastName: profile?.lastName || name.split(' ').slice(1).join(' ') || '',
        avatar: profile?.avatar || null,
        phone: profile?.phone || null,
        department: profile?.department || null,
        position: profile?.position || null
      }
    });

    const result = await newAdmin.save();

    // Logger l'action
    await logAdminAction(
      'CREATE_ADMIN',
      email,
      currentUser.email,
      { role, permissions: newAdmin.permissions },
      req
    );

    return NextResponse.json({ 
      message: 'Administrateur créé avec succès',
      adminId: result._id,
      email
    });

  } catch (error) {
    console.error('Erreur POST admin:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT - Modifier un administrateur
export async function PUT(req: NextRequest) {
  try {
    const authCheck = await checkAdminPermissions(req);
    if (authCheck.error) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }    const { user: currentUser } = authCheck;
    const body = await req.json();
    const { targetEmail, updates } = body;

    if (!targetEmail) {
      return NextResponse.json({ error: 'Email cible manquant' }, { status: 400 });
    }

    await connectDB();
    const targetUser = await User.findOne({ email: targetEmail });

    if (!targetUser) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Vérifications de sécurité
    if (currentUser.role !== 'SUPER_ADMIN') {
      // Les ADMIN ne peuvent modifier que les MODERATOR
      if (targetUser.role === 'SUPER_ADMIN' || targetUser.role === 'ADMIN') {
        return NextResponse.json({ error: 'Permission insuffisante' }, { status: 403 });
      }
    }

    // Préparer les mises à jour
    const allowedUpdates: any = {
      updatedAt: new Date()
    };

    if (updates.name) allowedUpdates.name = updates.name;
    if (updates.isActive !== undefined) allowedUpdates.isActive = updates.isActive;
    if (updates.profile) allowedUpdates.profile = { ...targetUser.profile, ...updates.profile };

    // Changement de rôle (SUPER_ADMIN uniquement)
    if (updates.role && currentUser.role === 'SUPER_ADMIN') {
      // Valider le rôle avant de l'utiliser
      const validRole = updates.role as keyof typeof ROLE_PERMISSIONS;
      if (validRole in ROLE_PERMISSIONS) {
        allowedUpdates.role = validRole;
        allowedUpdates.permissions = ROLE_PERMISSIONS[validRole] || [];
      }
    }

    // Changement de mot de passe
    if (updates.password) {
      if (updates.password.length < 8) {
        return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 8 caractères' }, { status: 400 });
      }
      allowedUpdates.password = await bcrypt.hash(updates.password, 12);
    }

    await User.updateOne(
      { email: targetEmail },
      { $set: allowedUpdates }
    );

    // Logger l'action
    await logAdminAction(
      'UPDATE_ADMIN',
      targetEmail,
      currentUser.email,
      { updates: Object.keys(allowedUpdates) },
      req
    );

    return NextResponse.json({ message: 'Administrateur mis à jour avec succès' });

  } catch (error) {
    console.error('Erreur PUT admin:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Supprimer un administrateur
export async function DELETE(req: NextRequest) {
  try {
    const authCheck = await checkAdminPermissions(req);
    if (authCheck.error) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const { user: currentUser } = authCheck;
    const { searchParams } = new URL(req.url);
    const targetEmail = searchParams.get('email');

    if (!targetEmail) {
      return NextResponse.json({ error: 'Email cible manquant' }, { status: 400 });
    }

    // Interdire l'auto-suppression
    if (targetEmail === currentUser.email) {
      return NextResponse.json({ error: 'Vous ne pouvez pas supprimer votre propre compte' }, { status: 400 });
    }    await connectDB();
    const targetUser = await User.findOne({ email: targetEmail });

    if (!targetUser) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Seuls les SUPER_ADMIN peuvent supprimer des admins
    if (currentUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Seuls les SUPER_ADMIN peuvent supprimer des administrateurs' }, { status: 403 });
    }    // Marquer comme inactif plutôt que supprimer (soft delete)
    await User.updateOne(
      { email: targetEmail },
      { 
        $set: { 
          isActive: false,
          deletedAt: new Date(),
          deletedBy: currentUser.email
        }
      }
    );

    // Logger l'action
    await logAdminAction(
      'DELETE_ADMIN',
      targetEmail,
      currentUser.email,
      { reason: 'Suppression par admin' },
      req
    );

    return NextResponse.json({ message: 'Administrateur supprimé avec succès' });

  } catch (error) {
    console.error('Erreur DELETE admin:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
