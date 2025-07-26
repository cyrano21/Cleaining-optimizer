
import connectDB from 'config/db';
import Newsletter from 'models/Newsletter';
import nodemailer from 'nodemailer';
import Settings from 'models/Settings';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { email, name } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email requis pour l\'inscription à la newsletter' });
  }

  try {
    await connectDB();
    
    // Vérifier si l'email existe déjà
    const existingSubscriber = await Newsletter.findOne({ email });
    
    if (existingSubscriber) {
      if (existingSubscriber.active) {
        return res.status(400).json({ success: false, message: 'Cet email est déjà inscrit à notre newsletter' });
      } else {
        // Réactiver l'abonnement si l'utilisateur s'était désabonné
        existingSubscriber.active = true;
        await existingSubscriber.save();
        return res.status(200).json({ success: true, message: 'Votre abonnement à la newsletter a été réactivé' });
      }
    }

    // Créer un nouvel abonné
    const subscriber = await Newsletter.create({
      email,
      name: name || '',
    });

    // Récupérer les paramètres du site
    const settings = await Settings.findOne().sort({ createdAt: -1 });
    const adminEmail = settings?.site?.contactEmail || process.env.DEFAULT_CONTACT_EMAIL;

    // Configurer le transporteur email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Envoyer un email de confirmation à l'utilisateur
    await transporter.sendMail({
      from: `ShopCart <${adminEmail}>`,
      to: email,
      subject: 'Confirmation d\'inscription à la newsletter',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #0d6efd;">Merci de vous être inscrit à notre newsletter !</h2>
          <p>Bonjour${name ? ' ' + name : ''},</p>
          <p>Nous sommes ravis de vous compter parmi nos abonnés. Vous recevrez désormais toutes nos dernières actualités, promotions et offres spéciales directement dans votre boîte mail.</p>
          <p>À bientôt sur ShopCart !</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
            <p>Si vous souhaitez vous désabonner, <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://shopcart.com'}/unsubscribe?email=${encodeURIComponent(email)}" style="color: #0d6efd;">cliquez ici</a>.</p>
          </div>
        </div>
      `
    });

    // Informer l'administrateur d'un nouvel abonnement
    await transporter.sendMail({
      from: `ShopCart <${adminEmail}>`,
      to: adminEmail,
      subject: 'Nouvel abonné à la newsletter',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #0d6efd;">Nouvel abonné à la newsletter</h2>
          <p>Un nouvel utilisateur s'est inscrit à la newsletter :</p>
          <ul>
            <li>Email : ${email}</li>
            ${name ? `<li>Nom : ${name}</li>` : ''}
            <li>Date : ${new Date().toLocaleString()}</li>
          </ul>
        </div>
      `
    });

    return res.status(201).json({ success: true, message: 'Inscription à la newsletter réussie' });
  } catch (error) {
    console.error('Erreur lors de l\'inscription à la newsletter:', error);
    return res.status(500).json({ success: false, message: 'Erreur lors de l\'inscription à la newsletter' });
  }
}
