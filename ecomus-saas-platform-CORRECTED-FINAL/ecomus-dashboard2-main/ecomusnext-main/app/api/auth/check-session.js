// pages/api/auth/check-session.js - API pour diagnostiquer les problèmes de session
import { getSession } from 'next-auth/react';
import { authOptions } from './[...nextauth]';
import { getServerSession } from 'next-auth/next';

export default async function handler(req, res) {
  // Désactiver le cache pour cette API
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  // 1. Vérifier la session avec getServerSession (méthode recommandée)
  const serverSession = await getServerSession(req, res, authOptions);
  
  // 2. Vérifier la session avec getSession (ancienne méthode)
  const clientSession = await getSession({ req });
  
  // 3. Extraire les informations des cookies directement
  const cookies = req.headers.cookie || '';
  const sessionCookie = cookies
    .split(';')
    .map(c => c.trim())
    .find(c => c.startsWith('next-auth.session-token='));

  // Récupérer les headers pertinents
  const headers = {
    cookie: req.headers.cookie ? 'Présent' : 'Absent',
    userAgent: req.headers['user-agent'],
    authorization: req.headers.authorization ? 'Présent' : 'Absent',
    host: req.headers.host,
    'x-forwarded-for': req.headers['x-forwarded-for'],
    referer: req.headers.referer,
  };

  // Répondre avec toutes les informations de diagnostic
  res.status(200).json({
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
    environment: {
      nextAuthUrl: process.env.NEXTAUTH_URL || 'Non défini',
      nextAuthSecretDefined: !!process.env.NEXTAUTH_SECRET,
      nodeEnv: process.env.NODE_ENV,
    },
    serverSession: serverSession ? {
      ...serverSession,
      user: serverSession.user ? {
        name: serverSession.user.name,
        email: serverSession.user.email,
        id: serverSession.user.id,
        // Ne pas inclure de données sensibles
      } : null
    } : null,
    clientSession: clientSession ? {
      ...clientSession,
      user: clientSession.user ? {
        name: clientSession.user.name,
        email: clientSession.user.email,
        id: clientSession.user.id,
        // Ne pas inclure de données sensibles
      } : null
    } : null,
    sessionCookiePresent: !!sessionCookie,
    headers: headers,
    cookies: cookies.split(';').map(c => c.trim()),
  });
}
