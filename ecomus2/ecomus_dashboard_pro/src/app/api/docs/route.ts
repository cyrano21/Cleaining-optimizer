import { NextRequest, NextResponse } from 'next/server'
import { getSwaggerSpec } from '@/lib/swagger'

/**
 * @swagger
 * /api/docs:
 *   get:
 *     summary: Obtenir la spécification OpenAPI
 *     description: Retourne la documentation API au format OpenAPI 3.0
 *     tags: [Documentation]
 *     responses:
 *       200:
 *         description: Spécification OpenAPI
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
export async function GET(request: NextRequest) {
  try {
    const swaggerSpec = getSwaggerSpec()
    
    return NextResponse.json(swaggerSpec, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600' // Cache pendant 1 heure
      }
    })
  } catch (error) {
    console.error('Error generating Swagger spec:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la génération de la documentation' },
      { status: 500 }
    )
  }
}