import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import { checkAdminAccess, normalizeRole } from '@/lib/role-utils';

// POST - Authentification administrateur
export async function POST(req: NextRequest) {
  try {
    const { email, password, action } = await req.json();
    
    // Si c'est une demande de génération de token depuis une session existante
    if (action === 'generate_token') {
      console.log('🔑 Génération de token JWT depuis session pour:', email);
      
      if (!email) {
        return NextResponse.json({ 
          error: 'Email requis pour générer le token' 
        }, { status: 400 });
      }

      await connectDB();
      
      // Rechercher l'utilisateur admin sans vérifier le mot de passe
      const user = await User.findOne({ 
        email: email.toLowerCase(),
        $or: [
          { role: { $in: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'] } },
          { role: { $in: ['admin', 'super_admin', 'vendor'] } },
        ],
        isActive: true
      });

      if (!user || !checkAdminAccess(user.role)) {
        return NextResponse.json({ 
          error: 'Utilisateur non autorisé pour les fonctions admin' 
        }, { status: 403 });
      }

      // Générer le token JWT
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error('ERREUR CRITIQUE: JWT_SECRET non configuré');
        return NextResponse.json({ 
          error: 'Configuration serveur manquante' 
        }, { status: 500 });
      }

      const token = jwt.sign(
        { 
          email: user.email, 
          userId: user._id,
          role: user.role,
          name: user.name
        },
        jwtSecret,
        { expiresIn: '24h' }
      );

      return NextResponse.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }
    
    // Authentification normale avec email et mot de passe
    console.log('🔍 Tentative de connexion admin:', { email, passwordLength: password?.length });

    if (!email || !password) {
      console.log('❌ Email ou mot de passe manquant');
      return NextResponse.json({ 
        error: 'Email et mot de passe requis' 
      }, { status: 400 });
    }    await connectDB();
    console.log('✅ Connexion MongoDB établie');
    
    // Rechercher l'utilisateur admin (compatible ancien et nouveau système)
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      $or: [
        { role: { $in: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'] } }, // Nouveau système (majuscules)
        { role: { $in: ['admin', 'super_admin', 'vendor'] } },    // Ancien système (minuscules)
      ],
      isActive: true
    });

    console.log('🔍 Recherche utilisateur:', {
      email: email.toLowerCase(),
      found: !!user,
      userRole: user?.role,
      isActive: user?.isActive
    });

    if (!user) {
      console.log('❌ Utilisateur admin non trouvé ou inactif');
      return NextResponse.json({ 
        error: 'Identifiants administrateur invalides' 
      }, { status: 401 });
    }

    // Vérifier si l'utilisateur a des droits admin
    if (!checkAdminAccess(user.role)) {
      console.log('❌ Utilisateur sans droits admin:', user.role);
      return NextResponse.json({ 
        error: 'Identifiants administrateur invalides' 
      }, { status: 401 });
    }

    // Vérifier le mot de passe
    console.log('🔐 Vérification du mot de passe...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('🔐 Résultat vérification mot de passe:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Mot de passe invalide');
      return NextResponse.json({ 
        error: 'Identifiants administrateur invalides' 
      }, { status: 401 });
    }    // Générer le token JWT avec rôle normalisé
    const normalizedRole = normalizeRole(user.role);
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: normalizedRole,
        originalRole: user.role, // Garder le rôle original pour compatibilité
        permissions: user.permissions || []
      },
      (() => {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
          throw new Error('JWT_SECRET non configuré dans .env');
        }
        return jwtSecret;
      })(),
      { expiresIn: '24h' }
    );// Mettre à jour la dernière connexion
    await User.updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    );

    // Logger la connexion (optionnel, vous pouvez créer un modèle AdminLog si nécessaire)
    // await AdminLog.create({
    //   action: 'ADMIN_LOGIN',
    //   targetUser: user.email,
    //   performedBy: user.email,
    //   timestamp: new Date(),
    //   details: { userAgent: req.headers.get('user-agent') },
    //   ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    // });

    return NextResponse.json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: normalizedRole,
        originalRole: user.role,
        permissions: user.permissions || [],
        profile: user.profile || {}
      }
    });

  } catch (error) {
    console.error('Erreur authentification admin:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur' 
    }, { status: 500 });
  }
}

// GET - Vérifier le token et récupérer les infos utilisateur
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      // Retourner une réponse informative sans erreur 401 pour les vérifications d'état
      return NextResponse.json({ 
        authenticated: false,
        message: 'Aucun token fourni' 
      }, { status: 200 });
    }

    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error('ERREUR CRITIQUE: JWT_SECRET non configuré dans .env');
        return NextResponse.json({ 
          authenticated: false,
          error: 'Configuration serveur manquante' 
        }, { status: 500 });
      }

      let decoded;
      try {
        decoded = jwt.verify(token, jwtSecret) as any;
      } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
          console.log('Token JWT expiré:', error.expiredAt);
          return NextResponse.json({ 
            authenticated: false,
            error: 'Session expirée, veuillez vous reconnecter' 
          }, { status: 401 });
        } else if (error.name === 'JsonWebTokenError') {
          console.log('Token JWT invalide:', error.message);
          return NextResponse.json({ 
            authenticated: false,
            error: 'Token invalide' 
          }, { status: 401 });
        } else {
          console.log('Erreur JWT:', error.message);
          return NextResponse.json({ 
            authenticated: false,
            error: 'Erreur d\'authentification' 
          }, { status: 401 });
        }
      }
      
      await connectDB();
      
      const user = await User.findOne(
        { 
          email: decoded.email,
          $or: [
            { role: { $in: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'] } }, // Nouveau système (majuscules)
            { role: { $in: ['admin', 'super_admin', 'vendor'] } },    // Ancien système (minuscules)
          ],
          isActive: true 
        },
        { password: 0 } // Exclure le mot de passe
      );

      if (!user) {
        return NextResponse.json({ 
          authenticated: false,
          error: 'Utilisateur non trouvé' 
        }, { status: 200 });
      }

      return NextResponse.json({ 
        authenticated: true,
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
          role: normalizeRole(user.role),
          originalRole: user.role,
          permissions: user.permissions || [],
          profile: user.profile || {}
        }
      });

    } catch (jwtError: any) {
      console.error('Erreur JWT:', jwtError);
      
      let errorMessage = 'Token invalide';
      if (jwtError.name === 'TokenExpiredError') {
        errorMessage = 'Token expiré - Veuillez vous reconnecter';
      } else if (jwtError.name === 'JsonWebTokenError') {
        errorMessage = 'Token invalide - Format incorrect';
      } else if (jwtError.name === 'NotBeforeError') {
        errorMessage = 'Token pas encore valide';
      }
      
      return NextResponse.json({ 
        authenticated: false,
        error: errorMessage
      }, { status: 200 });
    }

  } catch (error) {
    console.error('Erreur vérification token:', error);
    return NextResponse.json({ 
      authenticated: false,
      error: 'Erreur serveur' 
    }, { status: 500 });
  }
}
