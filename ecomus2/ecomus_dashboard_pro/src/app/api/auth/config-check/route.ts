// Route pour vérifier la configuration de l'authentification sans exposer les secrets
import { NextResponse } from 'next/server';

export async function GET() {
  // Vérifier l'état des variables d'environnement critiques
  // sans exposer leurs valeurs (sécurité)
  return NextResponse.json({
    env: {
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      MONGODB_URI: !!process.env.MONGODB_URI,
      JWT_SECRET: !!process.env.JWT_SECRET,
      API_URL: !!process.env.NEXT_PUBLIC_API_URL
    },
    nextAuthConfig: {
      sessionStrategy: 'jwt',
      hasCredentialsProvider: true,
      callbacksConfigured: true
    },
    serverInfo: {
      nodeEnv: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    }
  }, {
    headers: { 'Content-Type': 'application/json' }
  });
}
