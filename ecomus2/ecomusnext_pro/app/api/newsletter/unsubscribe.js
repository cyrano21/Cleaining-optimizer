
import connectDB from 'config/db';
import Newsletter from 'models/Newsletter';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email requis pour se désabonner' });
  }

  try {
    await connectDB();
    
    const subscriber = await Newsletter.findOne({ email });
    
    if (!subscriber) {
      return res.status(404).json({ success: false, message: 'Cet email n\'est pas inscrit à notre newsletter' });
    }

    // Désactiver l'abonnement plutôt que de le supprimer
    subscriber.active = false;
    await subscriber.save();

    return res.status(200).json({ success: true, message: 'Désabonnement réussi' });
  } catch (error) {
    console.error('Erreur lors du désabonnement:', error);
    return res.status(500).json({ success: false, message: 'Erreur lors du désabonnement' });
  }
}
