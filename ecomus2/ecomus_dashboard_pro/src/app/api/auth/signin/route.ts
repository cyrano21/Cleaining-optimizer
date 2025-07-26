import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    console.log("📤 API Signin - Début de la requête");
    
    try {
      await connectDB();
      console.log("📤 API Signin - Connexion à la base de données réussie");
    } catch (dbError) {
      console.error("❌ API Signin - Erreur de connexion à la base de données:", dbError);
      return NextResponse.json(
        { 
          success: false, 
          message: "Erreur de connexion à la base de données"
        },
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error("❌ Erreur lors du parsing du corps de la requête:", error);
      return NextResponse.json(
        { 
          success: false, 
          message: "Format de requête invalide" 
        },
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const { email, password } = body;
    console.log("📤 API Signin - Tentative de connexion pour email:", email);

    if (!email || !password) {
      console.log("❌ API Signin - Email ou mot de passe manquant");
      return NextResponse.json(
        { 
          success: false, 
          message: "Email et mot de passe requis" 
        },
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Rechercher l'utilisateur par email
    console.log("📤 API Signin - Recherche de l'utilisateur dans la BDD");
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log("❌ API Signin - Utilisateur non trouvé:", email);
      return NextResponse.json(
        { 
          success: false, 
          message: "Identifiants incorrects" // Message générique pour éviter l'énumération des utilisateurs
        },
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Vérifier si l'utilisateur est actif
    if (!user.isActive) {
      console.log("❌ API Signin - Compte utilisateur désactivé:", email);
      return NextResponse.json(
        { 
          success: false, 
          message: "Ce compte a été désactivé" 
        },
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    console.log("✅ API Signin - Utilisateur trouvé:", user.email);

    // Vérifier le mot de passe
    console.log("📤 API Signin - Vérification du mot de passe");
    let isPasswordValid = false;
    
    try {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } catch (error) {
      console.error("❌ API Signin - Erreur lors de la comparaison du mot de passe:", error);
    }
    
    if (!isPasswordValid) {
      console.log("❌ API Signin - Mot de passe invalide pour:", email);
      
      // Incrémenter les tentatives de connexion échouées (si la méthode existe)
      if (typeof user.incLoginAttempts === 'function') {
        try {
          await user.incLoginAttempts();
        } catch (error) {
          console.error("❌ API Signin - Erreur lors de l'incrémentation des tentatives:", error);
        }
      }
      
      return NextResponse.json(
        { 
          success: false, 
          message: "Identifiants incorrects" // Message générique pour la sécurité
        },
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Vérifier si le compte est verrouillé
    if (user.isAccountLocked && typeof user.isAccountLocked === 'function' && user.isAccountLocked()) {
      console.log("❌ API Signin - Compte verrouillé pour:", email);
      return NextResponse.json(
        { 
          success: false, 
          message: "Ce compte est temporairement verrouillé. Veuillez réessayer plus tard." 
        },
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    console.log("✅ API Signin - Authentification réussie pour:", email);

    // Créer un token JWT
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role 
      },
      (() => {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
          throw new Error('JWT_SECRET non configuré dans .env');
        }
        return jwtSecret;
      })(),
      { expiresIn: "24h" }
    );

    return NextResponse.json({
      success: true,
      message: "Connexion réussie",
      user: {
        id: user._id.toString(), // Correction ici : toujours une string
        email: user.email,
        name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || user.lastName || user.email.split('@')[0],
        role: user.role,
        storeId: user.storeId
      },
      accessToken: token
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("❌ API Signin - Erreur lors de la connexion:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Erreur serveur" 
      },
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
