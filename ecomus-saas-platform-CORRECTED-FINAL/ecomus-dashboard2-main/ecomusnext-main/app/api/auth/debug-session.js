// pages/api/auth/debug-session.js
// Endpoint de diagnostic pour identifier les problèmes de session NextAuth

export default function handler(req, res) {
  console.log('=== DEBUG SESSION NEXTAUTH ===');
  console.log('Méthode:', req.method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Cookies:', req.cookies);
  console.log('Query:', req.query);
  
  // Vérifier la configuration NextAuth
  console.log('Environnement NextAuth:');
  console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
  console.log('NEXTAUTH_SECRET défini:', !!process.env.NEXTAUTH_SECRET);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  
  // Répondre avec des informations utiles
  res.status(200).json({
    message: 'Diagnostic de session exécuté',
    sessionEnabled: true,
    environment: {
      nextAuthUrl: process.env.NEXTAUTH_URL || 'Non défini',
      nextAuthSecretDefined: !!process.env.NEXTAUTH_SECRET,
      nodeEnv: process.env.NODE_ENV,
      baseUrl: `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`
    },
    headers: {
      cookie: req.headers.cookie ? 'Présent' : 'Absent',
      userAgent: req.headers['user-agent'],
      authorization: req.headers.authorization ? 'Présent' : 'Absent'
    }
  });
}
