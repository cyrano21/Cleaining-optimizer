import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(request) {
  try {
    await dbConnect();
    const { token, password } = await request.json();

    if (!token || !password) {
      return Response.json(
        { success: false, message: 'Token et mot de passe requis' },
        { status: 400 }
      );
    }

    // Valider la force du mot de passe
    if (password.length < 6) {
      return Response.json(
        { success: false, message: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      );
    }

    // Chercher l'utilisateur avec le token de réinitialisation
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: new Date() } // Token non expiré
    });

    if (!user) {
      return Response.json(
        { success: false, message: 'Token invalide ou expiré' },
        { status: 400 }
      );
    }

    // Hacher le nouveau mot de passe
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Mettre à jour le mot de passe et supprimer le token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return Response.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès'
    });

  } catch (error) {
    console.error('Erreur reset-password API:', error);
    return Response.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return Response.json(
        { success: false, message: 'Token requis' },
        { status: 400 }
      );
    }

    // Vérifier si le token est valide
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: new Date() }
    });

    if (!user) {
      return Response.json(
        { success: false, message: 'Token invalide ou expiré' },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      message: 'Token valide'
    });

  } catch (error) {
    console.error('Erreur validation token:', error);
    return Response.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
