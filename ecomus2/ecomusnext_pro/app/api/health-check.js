// pages/api/health-check.js
import mongoose from 'mongoose'
import connectDB from '../../config/db'

/**
 * API de vérification de santé du site
 * Cette API permet de diagnostiquer l'état de fonctionnement du site
 * et la connexion à la base de données MongoDB
 */
export default async function handler (req, res) {
  // Résumé de l'état de l'application
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: 'OK',
    environment: process.env.NODE_ENV,
    vercel: {
      environment: process.env.VERCEL_ENV || 'Non défini',
      region: process.env.VERCEL_REGION || 'Non défini',
      url: process.env.VERCEL_URL || 'Non défini'
    },
    mongodb: {
      uri_defined: !!process.env.MONGODB_URI,
      uri_masked: process.env.MONGODB_URI
        ? process.env.MONGODB_URI.replace(
            /mongodb\+srv:\/\/([^:]+):([^@]+)@/,
            'mongodb+srv://***:***@'
          )
        : 'undefined',
      status: 'Déconnecté',
      connection: null,
      error: null,
      responseTime: null
    },
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'Non configuré',
    nextjsConfig: {
      distDir: process.env.NEXT_DIST_DIR || '.next',
      assetPrefix: process.env.NEXT_PUBLIC_SITE_URL || ''
    },
    memoryUsage: process.memoryUsage()
  }

  try {
    // Vérifier la connexion MongoDB avec timeout
    const startTime = Date.now()
    let conn

    try {
      // Utiliser un timeout pour éviter de bloquer trop longtemps
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error('Timeout de connexion à MongoDB (5s)')),
          5000
        )
      })

      // Tenter la connexion avec timeout
      conn = await Promise.race([connectDB(), timeoutPromise])

      const responseTime = Date.now() - startTime
      health.mongodb.responseTime = `${responseTime}ms`

      if (conn && mongoose.connection.readyState === 1) {
        health.mongodb = {
          ...health.mongodb,
          status: 'Connecté',
          connection: {
            host: mongoose.connection.host,
            port: mongoose.connection.port,
            database: mongoose.connection.name,
            readyState: mongoose.connection.readyState
          },
          error: null,
          responseTime: `${responseTime}ms`
        }
      } else {
        health.mongodb = {
          ...health.mongodb,
          status: 'Erreur',
          connection: null,
          error: 'Connexion établie mais état non valide',
          responseTime: `${responseTime}ms`
        }
        health.status = 'Dégradé'
      }
    } catch (dbError) {
      const responseTime = Date.now() - startTime
      health.mongodb = {
        ...health.mongodb,
        status: 'Erreur',
        connection: null,
        error: dbError.message || "Impossible d'établir une connexion",
        errorType: dbError.name,
        responseTime: `${responseTime}ms`
      }
      health.status = 'Dégradé'
    }
  } catch (error) {
    health.mongodb = {
      status: 'Erreur',
      connection: null,
      error: error.message
    }
    health.status = 'Dégradé'
  }

  // Vérifier les variables d'environnement essentielles
  const essentialEnvVars = [
    'MONGODB_URI',
    'NEXT_PUBLIC_SITE_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET'
  ]

  health.envStatus = essentialEnvVars.reduce((acc, varName) => {
    acc[varName] = !!process.env[varName]
    return acc
  }, {})

  // Renvoyer les informations d'état
  res.status(health.status === 'OK' ? 200 : 503).json(health)
}
