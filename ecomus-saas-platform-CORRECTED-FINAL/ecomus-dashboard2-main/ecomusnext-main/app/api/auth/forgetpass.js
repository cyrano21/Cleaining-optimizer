import connectDB from 'config/db';
import User from '@/models/User';
import crypto from 'crypto';
import { sendPasswordResetEmail } from 'utils/mailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    console.log('> SMTP vars:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS?.slice(0,4) + '…'
    });

    const conn = await connectDB();
    if (!conn) {
      return res.status(500).json({ error: 'Erreur de connexion à la base de données' });
    }

    const { email } = req.body;
    console.log('forgetpass: email received:', email);
    if (!email) {
      return res.status(400).json({ error: 'Email requis' });
    }

    const user = await User.findOne({ email });
    console.log('forgetpass: user from DB:', user);
    if (!user) {
      // Pour ne pas exposer l'existence des comptes
      return res.status(200).json({ message: 'Si cet email existe, tu recevras un lien de réinitialisation.' });
    }

    // Générer un token
    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1h
    await user.save();

    // Envoi de l'email de réinitialisation (erreurs non capturées pour debug)
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
    await sendPasswordResetEmail(user.email, resetUrl);
    console.log(`Reset email sent to ${user.email}`);

    return res.status(200).json({ message: 'Lien de réinitialisation envoyé si l\'utilsateur existe.' });
  } catch (error) {
    console.error('Erreur API forgetpass:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
