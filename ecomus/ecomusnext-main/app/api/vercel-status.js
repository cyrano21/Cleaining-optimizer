// pages/api/vercel-status.js
/**
 * Endpoint pour vérifier l'état du déploiement Vercel et identifier les problèmes potentiels
 * Cette API est utilisée pour diagnostiquer les problèmes de déploiement sur Vercel
 */

export default async function handler (req, res) {
  try {
    const status = {
      timestamp: new Date().toISOString(),
      platform: 'Vercel',
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'unknown',
      region: process.env.VERCEL_REGION || 'unknown',
      checks: {
        environment: {
          status: 'ok',
          variables: {
            // Variables publiques seulement (ne pas inclure les variables sensibles)
            NODE_ENV: process.env.NODE_ENV,
            VERCEL_ENV: process.env.VERCEL_ENV,
            VERCEL_REGION: process.env.VERCEL_REGION,
            VERCEL_URL: process.env.VERCEL_URL,
            MONGODB_URI_DEFINED: !!process.env.MONGODB_URI,
            NEXT_PUBLIC_API_URL_DEFINED: !!process.env.NEXT_PUBLIC_API_URL,
            NEXT_PUBLIC_API_BASE_URL_DEFINED:
              !!process.env.NEXT_PUBLIC_API_BASE_URL
          }
        },
        connectivity: {
          status: 'pending',
          tests: []
        }
      }
    }

    // Vérifier si MongoDB est configuré
    if (!process.env.MONGODB_URI) {
      status.checks.environment.status = 'error'
      status.checks.environment.error = 'MONGODB_URI is not defined'
    }

    // Vérifier la connectivité externe (sans bloquer la réponse)
    const checkConnectivity = async () => {
      const urls = [
        { name: 'Vercel', url: 'https://vercel.com/api/v1/edge-config/test' },
        {
          name: 'MongoDB Atlas',
          url: 'https://cloud.mongodb.com/api/atlas/v1.0/ping'
        },
        { name: 'Google', url: 'https://www.google.com' }
      ]

      for (const check of urls) {
        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 5000)

          const startTime = Date.now()
          const response = await fetch(check.url, {
            method: 'GET',
            signal: controller.signal
          })
          const responseTime = Date.now() - startTime

          clearTimeout(timeoutId)

          status.checks.connectivity.tests.push({
            name: check.name,
            status: response.ok ? 'ok' : 'error',
            statusCode: response.status,
            responseTime: `${responseTime}ms`
          })
        } catch (error) {
          status.checks.connectivity.tests.push({
            name: check.name,
            status: 'error',
            error: error.name === 'AbortError' ? 'timeout' : error.message
          })
        }
      }

      // Déterminer le statut global de connectivité
      const hasErrors = status.checks.connectivity.tests.some(
        test => test.status === 'error'
      )
      status.checks.connectivity.status = hasErrors ? 'error' : 'ok'
    }

    // Démarrer la vérification de connectivité en arrière-plan
    checkConnectivity().catch(console.error)

    // Renvoyer immédiatement les informations disponibles
    return res.status(200).json(status)
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}
