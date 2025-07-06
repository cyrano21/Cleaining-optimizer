import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    await dbConnect();
    const { email } = await request.json();

    if (!email) {
      return Response.json(
        { success: false, message: 'Email requis' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Pour des raisons de sécurité, on renvoie succès même si l'email n'existe pas
      return Response.json({
        success: true,
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé'
      });
    }

    // Générer un token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpire = new Date(Date.now() + 3600000); // 1 heure

    // Sauvegarder le token dans la base de données
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = resetTokenExpire;
    await user.save();

    // Configuration de l'email (à adapter selon votre service)
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@ecomus.com',
      to: email,
      subject: 'Réinitialisation de votre mot de passe - Ecomus',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Ecomus</h1>
          </div>
          
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="color: #333;">Réinitialisation de votre mot de passe</h2>
            
            <p>Bonjour,</p>
            
            <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: bold;
                        display: inline-block;">
                Réinitialiser mon mot de passe
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
              Ce lien expirera dans 1 heure.
            </p>
            
            <p style="color: #666; font-size: 14px;">
              Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>
              <a href="${resetUrl}">${resetUrl}</a>
            </p>
          </div>
          
          <div style="background-color: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
            © 2024 Ecomus. Tous droits réservés.
          </div>
        </div>
      `
    };

    // Envoyer l'email (optionnel si pas de configuration SMTP)
    try {
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        await transporter.sendMail(mailOptions);
      } else {
        console.log('Email de réinitialisation (simulation):', resetUrl);
      }
    } catch (emailError) {
      console.error('Erreur envoi email:', emailError);
      // On continue même si l'email échoue
    }

    return Response.json({
      success: true,
      message: 'Un email de réinitialisation a été envoyé',
      // En développement, on peut renvoyer l'URL
      ...(process.env.NODE_ENV === 'development' && { resetUrl })
    });

  } catch (error) {
    console.error('Erreur forgot-password API:', error);
    return Response.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
