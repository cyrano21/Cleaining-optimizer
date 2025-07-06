import connectDB from '../../config/db';
import Settings from '../../models/Settings';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    const settings = await Settings.findOne().sort({ createdAt: -1 }).limit(1);
    return res.status(200).json(settings);
  }

  if (req.method === 'PUT') {
    try {
      const { site, payment, security } = req.body;
      let settings = await Settings.findOne();
      if (settings) {
        settings.site = site;
        settings.payment = payment;
        settings.security = security;
        await settings.save();
      } else {
        settings = new Settings({ site, payment, security });
        await settings.save();
      }
      return res.status(200).json({ message: 'Settings updated', settings });
    } catch (error) {
      console.error('Settings API error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
