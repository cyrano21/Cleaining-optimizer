import swaggerJsdoc from 'swagger-jsdoc'
import { OpenAPIV3 } from 'openapi-types'

// Configuration Swagger
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-commerce Dashboard API',
      version: '1.0.0',
      description: 'API complète pour le système de gestion e-commerce multi-vendor avec templates par abonnement',
      contact: {
        name: 'Support API',
        email: 'support@ecommerce-dashboard.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        description: 'Serveur de développement'
      },
      {
        url: 'https://your-production-domain.com',
        description: 'Serveur de production'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        sessionAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'next-auth.session-token'
        }
      },
      schemas: {
        Store: {
          type: 'object',
          required: ['name', 'slug', 'ownerId'],
          properties: {
            _id: {
              type: 'string',
              description: 'Identifiant unique du store'
            },
            name: {
              type: 'string',
              description: 'Nom du store',
              example: 'Electronics Store'
            },
            slug: {
              type: 'string',
              description: 'Slug unique du store',
              example: 'electronics-store'
            },
            description: {
              type: 'string',
              description: 'Description du store'
            },
            ownerId: {
              type: 'string',
              description: 'ID du propriétaire du store'
            },
            isActive: {
              type: 'boolean',
              description: 'Statut actif du store',
              default: true
            },
            subscription: {
              type: 'object',
              properties: {
                plan: {
                  type: 'string',
                  enum: ['FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE'],
                  description: 'Plan d\'abonnement'
                },
                expiresAt: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Date d\'expiration de l\'abonnement'
                },
                limits: {
                  type: 'object',
                  properties: {
                    products: {
                      type: 'number',
                      description: 'Limite de produits'
                    },
                    storage: {
                      type: 'number',
                      description: 'Limite de stockage en MB'
                    }
                  }
                }
              }
            },
            design: {
              type: 'object',
              properties: {
                templateId: {
                  type: 'string',
                  description: 'ID du template utilisé'
                },
                customization: {
                  type: 'object',
                  description: 'Personnalisations du template'
                }
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Template: {
          type: 'object',
          required: ['templateId', 'name', 'subscriptionTier'],
          properties: {
            _id: {
              type: 'string',
              description: 'Identifiant unique du template'
            },
            templateId: {
              type: 'string',
              description: 'ID du template',
              example: 'modern-electronics'
            },
            name: {
              type: 'string',
              description: 'Nom du template',
              example: 'Modern Electronics'
            },
            description: {
              type: 'string',
              description: 'Description du template'
            },
            category: {
              type: 'string',
              description: 'Catégorie du template',
              example: 'electronics'
            },
            subscriptionTier: {
              type: 'string',
              enum: ['free', 'basic', 'premium', 'enterprise'],
              description: 'Niveau d\'abonnement requis'
            },
            previewUrl: {
              type: 'string',
              description: 'URL de prévisualisation du template'
            },
            features: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Liste des fonctionnalités du template'
            },
            isActive: {
              type: 'boolean',
              description: 'Statut actif du template',
              default: true
            }
          }
        },
        Product: {
          type: 'object',
          required: ['name', 'price', 'storeId'],
          properties: {
            _id: {
              type: 'string',
              description: 'Identifiant unique du produit'
            },
            name: {
              type: 'string',
              description: 'Nom du produit'
            },
            description: {
              type: 'string',
              description: 'Description du produit'
            },
            price: {
              type: 'number',
              description: 'Prix du produit'
            },
            images: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'URLs des images du produit'
            },
            category: {
              type: 'string',
              description: 'Catégorie du produit'
            },
            storeId: {
              type: 'string',
              description: 'ID du store propriétaire'
            },
            stock: {
              type: 'number',
              description: 'Quantité en stock'
            },
            isActive: {
              type: 'boolean',
              description: 'Statut actif du produit'
            }
          }
        },
        User: {
          type: 'object',
          required: ['email', 'name'],
          properties: {
            _id: {
              type: 'string',
              description: 'Identifiant unique de l\'utilisateur'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email de l\'utilisateur'
            },
            name: {
              type: 'string',
              description: 'Nom de l\'utilisateur'
            },
            role: {
              type: 'string',
              enum: ['user', 'vendor', 'admin', 'super-admin'],
              description: 'Rôle de l\'utilisateur'
            },
            avatar: {
              type: 'string',
              description: 'URL de l\'avatar'
            },
            isActive: {
              type: 'boolean',
              description: 'Statut actif de l\'utilisateur'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Message d\'erreur'
            },
            code: {
              type: 'string',
              description: 'Code d\'erreur'
            },
            details: {
              type: 'object',
              description: 'Détails supplémentaires de l\'erreur'
            }
          }
        },
        PaginationResponse: {
          type: 'object',
          properties: {
            page: {
              type: 'number',
              description: 'Page actuelle'
            },
            limit: {
              type: 'number',
              description: 'Nombre d\'éléments par page'
            },
            total: {
              type: 'number',
              description: 'Nombre total d\'éléments'
            },
            totalPages: {
              type: 'number',
              description: 'Nombre total de pages'
            },
            hasNext: {
              type: 'boolean',
              description: 'Indique s\'il y a une page suivante'
            },
            hasPrev: {
              type: 'boolean',
              description: 'Indique s\'il y a une page précédente'
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Token d\'authentification manquant ou invalide',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Accès interdit - permissions insuffisantes',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Ressource non trouvée',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        ValidationError: {
          description: 'Erreur de validation des données',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        ServerError: {
          description: 'Erreur interne du serveur',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      },
      {
        sessionAuth: []
      }
    ],
    tags: [
      {
        name: 'Stores',
        description: 'Gestion des stores'
      },
      {
        name: 'Templates',
        description: 'Gestion des templates'
      },
      {
        name: 'Products',
        description: 'Gestion des produits'
      },
      {
        name: 'Users',
        description: 'Gestion des utilisateurs'
      },
      {
        name: 'Analytics',
        description: 'Données analytiques'
      },
      {
        name: 'Admin',
        description: 'Fonctions d\'administration'
      }
    ]
  },
  apis: [
    './src/app/api/**/*.ts',
    './src/app/api/**/*.js'
  ]
}

// Générer la spécification Swagger
export const swaggerSpec = swaggerJsdoc(options)

// Fonction pour obtenir la documentation formatée
export function getSwaggerSpec(): OpenAPIV3.Document {
  return swaggerSpec as OpenAPIV3.Document
}

// Configuration pour l'interface Swagger UI
export const swaggerUiOptions = {
  definition: swaggerSpec,
  uiConfig: {
    displayRequestDuration: true,
    tryItOutEnabled: true,
    filter: true,
    syntaxHighlight: {
      theme: 'tomorrow-night'
    }
  },
  uiOptions: {
    displayOperationId: false,
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2,
    docExpansion: 'list',
    showExtensions: false,
    showCommonExtensions: false
  }
}