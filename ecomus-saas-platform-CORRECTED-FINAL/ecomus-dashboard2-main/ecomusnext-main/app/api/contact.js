import connectDB from 'config/db';
import Settings from 'models/Settings';
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'Tous les champs sont requis.' });
  }

  try {
    await connectDB();
    // Récupérer l'email de contact depuis les settings
    const settings = await Settings.findOne().sort({ createdAt: -1 });
    const toEmail = settings?.site?.contactEmail || process.env.DEFAULT_CONTACT_EMAIL;

    // Configurer le transporteur SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Envoyer l'email
    await transporter.sendMail({
      from: `${name} <${email}>`,
      to: toEmail,
      subject: `[Contact Form] ${subject}`,
      text: message,
      html: `<p>${message.replace(/\n/g, '<br/>')}</p><hr/><p>De : ${name} &lt;${email}&gt;</p>`,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Contact API error:', error);
    return res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
}
