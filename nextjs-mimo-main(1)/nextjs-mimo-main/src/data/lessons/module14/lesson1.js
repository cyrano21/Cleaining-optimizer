// src/data/lessons/module14/lesson1.js
const lesson1 = {
  id: '14-1',
  title: 'Intégration de bases de données avec Next.js',
  description:
    'Connexion et gestion des bases de données relationnelles et NoSQL avec Next.js',
  difficulty: 'avancé',
  duration: 60,
  tags: [
    'Next.js',
    'Base de données',
    'Prisma',
    'MongoDB',
    'PostgreSQL',
    'ORM'
  ],
  prerequisites: ['13-3'],
  content: `
    <h2>Bases de données et Next.js</h2>
    <p>Next.js offre une flexibilité exceptionnelle pour l'intégration avec différents types de bases de données. Cette leçon couvre les meilleures pratiques pour connecter et gérer des bases de données relationnelles et NoSQL dans vos applications Next.js.</p>

    <h3>Types de bases de données supportées</h3>
    <ul>
      <li><strong>Bases de données relationnelles</strong> : PostgreSQL, MySQL, SQLite</li>
      <li><strong>Bases de données NoSQL</strong> : MongoDB, DynamoDB</li>
      <li><strong>Bases de données en mémoire</strong> : Redis</li>
      <li><strong>Services cloud</strong> : Supabase, PlanetScale, Neon</li>
    </ul>

    <h3>Prisma : ORM moderne pour Next.js</h3>
    <p>Prisma est l'ORM recommandé pour Next.js, offrant une API type-safe et des outils de développement excellents.</p>

    <h4>Installation et configuration</h4>
    <pre><code class="language-bash"># Installation de Prisma
npm install prisma @prisma/client
npm install -D prisma

# Initialisation
npx prisma init</code></pre>

    <h4>Configuration du schéma Prisma</h4>
    <pre><code class="language-prisma">// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  posts     Post[]
  profile   Profile?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

model Profile {
  id     String  @id @default(cuid())
  bio    String?
  avatar String?
  userId String  @unique
  user   User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("profiles")
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  published Boolean  @default(false)
  authorId  String
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  tags      Tag[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("posts")
}

model Tag {
  id    String @id @default(cuid())
  name  String @unique
  posts Post[]

  @@map("tags")
}</code></pre>

    <h4>Configuration de la connexion à la base de données</h4>
    <pre><code class="language-javascript">// lib/prisma.js
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Gestion propre de la déconnexion
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});</code></pre>

    <h3>Opérations CRUD avec Prisma</h3>
    <pre><code class="language-javascript">// lib/database/users.js
import { prisma } from '../prisma';

export async function createUser(userData) {
  try {
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        profile: userData.profile ? {
          create: {
            bio: userData.profile.bio,
            avatar: userData.profile.avatar
          }
        } : undefined
      },
      include: {
        profile: true
      }
    });
    return user;
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    throw new Error('Impossible de créer l\'utilisateur');
  }
}

export async function getUserById(id) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        posts: {
          include: {
            tags: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });
    return user;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return null;
  }
}

export async function updateUser(id, updateData) {
  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        name: updateData.name,
        profile: updateData.profile ? {
          upsert: {
            create: updateData.profile,
            update: updateData.profile
          }
        } : undefined
      },
      include: {
        profile: true
      }
    });
    return user;
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    throw new Error('Impossible de mettre à jour l\'utilisateur');
  }
}

export async function deleteUser(id) {
  try {
    await prisma.user.delete({
      where: { id }
    });
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    throw new Error('Impossible de supprimer l\'utilisateur');
  }
}</code></pre>

    <h3>Intégration MongoDB avec Next.js</h3>
    <p>Pour les applications nécessitant une base de données NoSQL, MongoDB est un excellent choix.</p>

    <pre><code class="language-javascript">// lib/mongodb.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
};

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // En développement, utiliser une variable globale pour préserver la connexion
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // En production, créer une nouvelle connexion
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

// lib/database/mongodb-operations.js
import clientPromise from '../mongodb';

export async function getDatabase() {
  const client = await clientPromise;
  return client.db('your-app-name');
}

export async function createDocument(collection, document) {
  try {
    const db = await getDatabase();
    const result = await db.collection(collection).insertOne({
      ...document,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return result;
  } catch (error) {
    console.error('Erreur lors de la création du document:', error);
    throw error;
  }
}

export async function findDocuments(collection, query = {}, options = {}) {
  try {
    const db = await getDatabase();
    const documents = await db.collection(collection)
      .find(query)
      .sort(options.sort || { createdAt: -1 })
      .limit(options.limit || 10)
      .toArray();
    return documents;
  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
    throw error;
  }
}</code></pre>

    <h3>Gestion des migrations</h3>
    <p>Les migrations permettent de gérer l'évolution du schéma de base de données de manière contrôlée.</p>

    <pre><code class="language-bash"># Créer une migration
npx prisma migrate dev --name add-user-preferences

# Appliquer les migrations en production
npx prisma migrate deploy

# Générer le client Prisma
npx prisma generate</code></pre>

    <h3>Pool de connexions et optimisation</h3>
    <pre><code class="language-javascript">// lib/database/pool.js
import { PrismaClient } from '@prisma/client';

class DatabasePool {
  constructor() {
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      },
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  async executeTransaction(operations) {
    try {
      return await this.prisma.$transaction(operations);
    } catch (error) {
      console.error('Erreur de transaction:', error);
      throw error;
    }
  }

  async healthCheck() {
    try {
      await this.prisma.$queryRaw\`SELECT 1\`;
      return { status: 'healthy', timestamp: new Date() };
    } catch (error) {
      return { status: 'unhealthy', error: error.message, timestamp: new Date() };
    }
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }
}

export const dbPool = new DatabasePool();</code></pre>

    <h3>Seeders et données de test</h3>
    <pre><code class="language-javascript">// prisma/seed.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Créer des utilisateurs de test
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      profile: {
        create: {
          bio: 'Administrateur du système',
          avatar: 'https://example.com/avatar1.jpg'
        }
      }
    }
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Regular User',
      profile: {
        create: {
          bio: 'Utilisateur régulier',
          avatar: 'https://example.com/avatar2.jpg'
        }
      }
    }
  });

  // Créer des tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { name: 'Technology' },
      update: {},
      create: { name: 'Technology' }
    }),
    prisma.tag.upsert({
      where: { name: 'Programming' },
      update: {},
      create: { name: 'Programming' }
    })
  ]);

  // Créer des posts
  await prisma.post.create({
    data: {
      title: 'Getting Started with Next.js',
      content: 'Next.js is a powerful React framework...',
      published: true,
      authorId: admin.id,
      tags: {
        connect: tags.map(tag => ({ id: tag.id }))
      }
    }
  });

  console.log('Base de données initialisée avec succès');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });</code></pre>
  `,
  example: {
    title: "API complète avec Prisma et gestion d'erreurs",
    code: `// pages/api/users/[id].js
import { prisma } from '../../../lib/prisma';
import { withAuth } from '../../../middleware/auth';
import { validateInput } from '../../../lib/validation';
import joi from 'joi';

const updateUserSchema = joi.object({
  name: joi.string().min(1).max(100).optional(),
  email: joi.string().email().optional(),
  profile: joi.object({
    bio: joi.string().max(500).optional(),
    avatar: joi.string().uri().optional()
  }).optional()
});

async function handler(req, res) {
  const { id } = req.query;
  const { method } = req;

  // Validation de l'ID
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID utilisateur invalide' });
  }

  try {
    switch (method) {
      case 'GET':
        return await getUser(req, res, id);
      case 'PUT':
        return await updateUser(req, res, id);
      case 'DELETE':
        return await deleteUser(req, res, id);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: \`Méthode \${method} non autorisée\` });
    }
  } catch (error) {
    console.error('Erreur API utilisateur:', error);
    
    // Gestion spécifique des erreurs Prisma
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Un utilisateur avec cet email existe déjà' });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}

async function getUser(req, res, id) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      profile: true,
      posts: {
        where: { published: true },
        include: {
          tags: true
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      },
      _count: {
        select: {
          posts: { where: { published: true } }
        }
      }
    }
  });

  if (!user) {
    return res.status(404).json({ error: 'Utilisateur non trouvé' });
  }

  // Masquer les données sensibles si l'utilisateur n'est pas le propriétaire
  if (req.user.userId !== id && req.user.role !== 'admin') {
    delete user.email;
  }

  res.status(200).json({ user });
}

async function updateUser(req, res, id) {
  // Vérification des permissions
  if (req.user.userId !== id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Permission refusée' });
  }

  // Validation des données
  const { error, value } = updateUserSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Données invalides',
      details: error.details.map(d => d.message)
    });
  }

  // Utilisation d'une transaction pour garantir la cohérence
  const user = await prisma.$transaction(async (tx) => {
    // Vérifier que l'utilisateur existe
    const existingUser = await tx.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      throw new Error('USER_NOT_FOUND');
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await tx.user.update({
      where: { id },
      data: {
        name: value.name,
        email: value.email,
        profile: value.profile ? {
          upsert: {
            create: value.profile,
            update: value.profile
          }
        } : undefined
      },
      include: {
        profile: true
      }
    });

    return updatedUser;
  });

  res.status(200).json({ user });
}

async function deleteUser(req, res, id) {
  // Seul un admin peut supprimer un utilisateur
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Permission refusée' });
  }

  await prisma.user.delete({
    where: { id }
  });

  res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
}

export default withAuth(handler);

// pages/api/users/index.js - Liste et création d'utilisateurs
import { prisma } from '../../../lib/prisma';
import { withAuth } from '../../../middleware/auth';

const createUserSchema = joi.object({
  name: joi.string().min(1).max(100).required(),
  email: joi.string().email().required(),
  profile: joi.object({
    bio: joi.string().max(500).optional(),
    avatar: joi.string().uri().optional()
  }).optional()
});

async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await getUsers(req, res);
      case 'POST':
        return await createUser(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: \`Méthode \${method} non autorisée\` });
    }
  } catch (error) {
    console.error('Erreur API utilisateurs:', error);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}

async function getUsers(req, res) {
  const { page = 1, limit = 10, search } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = search ? {
    OR: [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ]
  } : {};

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        profile: true,
        _count: {
          select: {
            posts: { where: { published: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit)
    }),
    prisma.user.count({ where })
  ]);

  const totalPages = Math.ceil(totalCount / parseInt(limit));

  res.status(200).json({
    users,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalCount,
      hasNextPage: parseInt(page) < totalPages,
      hasPreviousPage: parseInt(page) > 1
    }
  });
}

async function createUser(req, res) {
  // Seul un admin peut créer un utilisateur
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Permission refusée' });
  }

  const { error, value } = createUserSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Données invalides',
      details: error.details.map(d => d.message)
    });
  }

  const user = await prisma.user.create({
    data: {
      name: value.name,
      email: value.email,
      profile: value.profile ? {
        create: value.profile
      } : undefined
    },
    include: {
      profile: true
    }
  });

  res.status(201).json({ user });
}

export default withAuth(handler);`,
    explanation:
      "Cet exemple montre une API complète pour la gestion d'utilisateurs avec Prisma, incluant la validation, les transactions, la gestion d'erreurs spécifiques à Prisma, la pagination, et les permissions. Les relations entre utilisateurs et profils sont gérées automatiquement."
  },
  exercise: {
    title: "Modélisation d'un système de blog avec Prisma",
    description:
      'Créez un schéma Prisma complet pour un système de blog avec utilisateurs, articles, commentaires et catégories. Implémentez les relations appropriées.',
    options: [
      {
        id: 1,
        text: 'Utiliser uniquement des relations one-to-one',
        correct: false
      },
      {
        id: 2,
        text: 'Implémenter des relations one-to-many et many-to-many avec des contraintes appropriées',
        correct: true
      },
      {
        id: 3,
        text: "Éviter l'utilisation d'index pour optimiser les performances",
        correct: false
      },
      {
        id: 4,
        text: 'Stocker toutes les données dans une seule table',
        correct: false
      }
    ],
    solution: `// prisma/schema.prisma - Schéma complet pour un blog
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  username  String   @unique
  name      String
  avatar    String?
  bio       String?
  isActive  Boolean  @default(true)
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  posts     Post[]
  comments  Comment[]
  likes     Like[]
  follows   Follow[] @relation("UserFollows")
  followers Follow[] @relation("UserFollowers")

  @@map("users")
}

model Post {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  excerpt     String?
  content     String
  featuredImage String?
  published   Boolean  @default(false)
  publishedAt DateTime?
  viewCount   Int      @default(0)
  likesCount  Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  authorId   String
  author     User        @relation(fields: [authorId], references: [id], onDelete: Cascade)
  categories PostCategory[]
  tags       PostTag[]
  comments   Comment[]
  likes      Like[]

  @@index([published, publishedAt])
  @@index([authorId])
  @@map("posts")
}

model Category {
  id          String @id @default(cuid())
  name        String @unique
  slug        String @unique
  description String?
  color       String?
  createdAt   DateTime @default(now())

  // Relations
  posts PostCategory[]

  @@map("categories")
}

model Tag {
  id        String @id @default(cuid())
  name      String @unique
  slug      String @unique
  createdAt DateTime @default(now())

  // Relations
  posts PostTag[]

  @@map("tags")
}

model Comment {
  id        String   @id @default(cuid())
  content   String
  isApproved Boolean @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  postId   String
  post     Post    @relation(fields: [postId], references: [id], onDelete: Cascade)
  authorId String
  author   User    @relation(fields: [authorId], references: [id], onDelete: Cascade)
  
  // Auto-référence pour les réponses
  parentId String?
  parent   Comment? @relation("CommentReplies", fields: [parentId], references: [id])
  replies  Comment[] @relation("CommentReplies")

  @@index([postId])
  @@index([authorId])
  @@map("comments")
}

model Like {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())

  // Relations
  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  postId String
  post   Post   @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@unique([userId, postId])
  @@map("likes")
}

model Follow {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())

  // Relations
  followerId  String
  follower    User @relation("UserFollows", fields: [followerId], references: [id], onDelete: Cascade)
  followingId String
  following   User @relation("UserFollowers", fields: [followingId], references: [id], onDelete: Cascade)

  @@unique([followerId, followingId])
  @@map("follows")
}

// Tables de liaison many-to-many
model PostCategory {
  postId     String
  post       Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  categoryId String
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@id([postId, categoryId])
  @@map("post_categories")
}

model PostTag {
  postId String
  post   Post   @relation(fields: [postId], references: [id], onDelete: Cascade)
  tagId  String
  tag    Tag    @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([postId, tagId])
  @@map("post_tags")
}

enum Role {
  USER
  MODERATOR
  ADMIN
}

// lib/database/blog.js - Opérations pour le blog
import { prisma } from '../prisma';

export class BlogService {
  // Créer un article avec catégories et tags
  async createPost(authorId, postData) {
    return await prisma.$transaction(async (tx) => {
      const post = await tx.post.create({
        data: {
          title: postData.title,
          slug: postData.slug,
          excerpt: postData.excerpt,
          content: postData.content,
          featuredImage: postData.featuredImage,
          published: postData.published,
          publishedAt: postData.published ? new Date() : null,
          authorId,
          categories: {
            create: postData.categoryIds?.map(categoryId => ({
              categoryId
            })) || []
          },
          tags: {
            create: postData.tagIds?.map(tagId => ({
              tagId
            })) || []
          }
        },
        include: {
          author: {
            select: { id: true, name: true, username: true, avatar: true }
          },
          categories: {
            include: { category: true }
          },
          tags: {
            include: { tag: true }
          }
        }
      });

      return post;
    });
  }

  // Récupérer les articles avec pagination et filtres
  async getPosts(options = {}) {
    const {
      page = 1,
      limit = 10,
      categoryId,
      tagId,
      authorId,
      search,
      published = true
    } = options;

    const skip = (page - 1) * limit;

    const where = {
      published,
      ...(categoryId && {
        categories: {
          some: { categoryId }
        }
      }),
      ...(tagId && {
        tags: {
          some: { tagId }
        }
      }),
      ...(authorId && { authorId }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { excerpt: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const [posts, totalCount] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: { id: true, name: true, username: true, avatar: true }
          },
          categories: {
            include: { category: true }
          },
          tags: {
            include: { tag: true }
          },
          _count: {
            select: {
              comments: { where: { isApproved: true } },
              likes: true
            }
          }
        },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.post.count({ where })
    ]);

    return {
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPreviousPage: page > 1
      }
    };
  }

  // Ajouter un commentaire
  async addComment(postId, authorId, content, parentId = null) {
    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId,
        parentId,
        isApproved: true // ou false selon votre politique de modération
      },
      include: {
        author: {
          select: { id: true, name: true, username: true, avatar: true }
        },
        replies: {
          include: {
            author: {
              select: { id: true, name: true, username: true, avatar: true }
            }
          }
        }
      }
    });

    return comment;
  }

  // Liker/Unliker un article
  async toggleLike(postId, userId) {
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId
        }
      }
    });

    if (existingLike) {
      // Supprimer le like
      await prisma.$transaction([
        prisma.like.delete({
          where: { id: existingLike.id }
        }),
        prisma.post.update({
          where: { id: postId },
          data: { likesCount: { decrement: 1 } }
        })
      ]);
      return { liked: false };
    } else {
      // Ajouter le like
      await prisma.$transaction([
        prisma.like.create({
          data: { userId, postId }
        }),
        prisma.post.update({
          where: { id: postId },
          data: { likesCount: { increment: 1 } }
        })
      ]);
      return { liked: true };
    }
  }
}

export const blogService = new BlogService();`
  },
  quiz: {
    title: 'Quiz sur les bases de données avec Next.js',
    questions: [
      {
        question:
          'Quelle est la principale différence entre un ORM et un Query Builder ?',
        options: [
          "Un ORM est plus rapide qu'un Query Builder",
          "Un ORM fournit une abstraction orientée objet tandis qu'un Query Builder construit des requêtes SQL",
          "Un Query Builder est plus sécurisé qu'un ORM",
          "Il n'y a pas de différence significative"
        ],
        correctAnswer:
          "Un ORM fournit une abstraction orientée objet tandis qu'un Query Builder construit des requêtes SQL"
      },
      {
        question: 'Pourquoi utilise-t-on des migrations de base de données ?',
        options: [
          'Pour améliorer les performances de la base de données',
          'Pour versionner et appliquer les changements de schéma de manière contrôlée',
          'Pour sauvegarder automatiquement les données',
          'Pour compresser la base de données'
        ],
        correctAnswer:
          'Pour versionner et appliquer les changements de schéma de manière contrôlée'
      },
      {
        question: "Qu'est-ce qu'une transaction en base de données ?",
        options: [
          'Une requête très complexe',
          "Un ensemble d'opérations qui doivent toutes réussir ou toutes échouer",
          'Une méthode de chiffrement des données',
          'Un type de relation entre tables'
        ],
        correctAnswer:
          "Un ensemble d'opérations qui doivent toutes réussir ou toutes échouer"
      },
      {
        question:
          'Quelle est la meilleure pratique pour les connexions à la base de données en Next.js ?',
        options: [
          'Créer une nouvelle connexion à chaque requête',
          'Utiliser une connexion globale partagée',
          'Utiliser un pool de connexions avec réutilisation en développement',
          'Éviter les connexions persistantes'
        ],
        correctAnswer:
          'Utiliser un pool de connexions avec réutilisation en développement'
      }
    ]
  },
  project: {
    title: 'Système de gestion de contenu complet avec Prisma',
    description: `Créez un système de gestion de contenu (CMS) complet avec Next.js et Prisma incluant :

1. Modélisation de données complexe (utilisateurs, articles, commentaires, catégories)
2. API CRUD complète avec validation et sécurité
3. Système de permissions et rôles
4. Gestion des médias et uploads
5. Système de recherche et filtrage
6. Analytics et statistiques
7. Cache et optimisation des performances

L'objectif est de construire un CMS fonctionnel et performant.`,
    initialCode: `// Schema Prisma basique à étendre
model User {
  id    String @id @default(cuid())
  email String @unique
  name  String
}

model Post {
  id      String @id @default(cuid())
  title   String
  content String
  userId  String
  user    User   @relation(fields: [userId], references: [id])
}`,
    solution: `// Solution complète du CMS avec Prisma

// prisma/schema.prisma - Schéma complet
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id          String   @id @default(cuid())
  email       String   @unique
  username    String   @unique
  name        String
  avatar      String?
  bio         String?
  isActive    Boolean  @default(true)
  role        Role     @default(AUTHOR)
  lastLoginAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  posts       Post[]
  comments    Comment[]
  media       Media[]
  sessions    Session[]

  @@map("users")
}

model Post {
  id            String    @id @default(cuid())
  title         String
  slug          String    @unique
  excerpt       String?
  content       String
  featuredImage String?
  status        PostStatus @default(DRAFT)
  publishedAt   DateTime?
  viewsCount    Int       @default(0)
  likesCount    Int       @default(0)
  seoTitle      String?
  seoDescription String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  authorId      String
  author        User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  categoryId    String?
  category      Category? @relation(fields: [categoryId], references: [id])
  tags          PostTag[]
  comments      Comment[]
  media         PostMedia[]

  @@index([status, publishedAt])
  @@index([authorId])
  @@index([categoryId])
  @@fulltext([title, content])
  @@map("posts")
}

model Category {
  id          String @id @default(cuid())
  name        String @unique
  slug        String @unique
  description String?
  color       String?
  parentId    String?
  parent      Category? @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryHierarchy")
  posts       Post[]
  createdAt   DateTime @default(now())

  @@map("categories")
}

model Tag {
  id        String    @id @default(cuid())
  name      String    @unique
  slug      String    @unique
  color     String?
  posts     PostTag[]
  createdAt DateTime  @default(now())

  @@map("tags")
}

model Comment {
  id         String   @id @default(cuid())
  content    String
  isApproved Boolean  @default(false)
  isSpam     Boolean  @default(false)
  authorName String?
  authorEmail String?
  authorUrl  String?
  userAgent  String?
  ipAddress  String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  postId   String
  post     Post    @relation(fields: [postId], references: [id], onDelete: Cascade)
  userId   String?
  user     User?   @relation(fields: [userId], references: [id])
  parentId String?
  parent   Comment? @relation("CommentReplies", fields: [parentId], references: [id])
  replies  Comment[] @relation("CommentReplies")

  @@index([postId])
  @@index([isApproved])
  @@map("comments")
}

model Media {
  id           String @id @default(cuid())
  originalName String
  filename     String @unique
  mimeType     String
  size         Int
  width        Int?
  height       Int?
  altText      String?
  caption      String?
  url          String
  thumbnailUrl String?
  createdAt    DateTime @default(now())

  uploaderId String
  uploader   User   @relation(fields: [uploaderId], references: [id])
  posts      PostMedia[]

  @@index([mimeType])
  @@map("media")
}

model Session {
  id        String   @id @default(cuid())
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())

  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([expiresAt])
  @@map("sessions")
}

model Analytics {
  id        String   @id @default(cuid())
  page      String
  event     String
  data      Json?
  userAgent String?
  ipAddress String?
  createdAt DateTime @default(now())

  @@index([page, createdAt])
  @@map("analytics")
}

// Tables de liaison
model PostTag {
  postId String
  post   Post   @relation(fields: [postId], references: [id], onDelete: Cascade)
  tagId  String
  tag    Tag    @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([postId, tagId])
  @@map("post_tags")
}

model PostMedia {
  postId  String
  post    Post   @relation(fields: [postId], references: [id], onDelete: Cascade)
  mediaId String
  media   Media  @relation(fields: [mediaId], references: [id], onDelete: Cascade)
  order   Int    @default(0)

  @@id([postId, mediaId])
  @@map("post_media")
}

enum Role {
  SUBSCRIBER
  AUTHOR
  EDITOR
  ADMIN
}

enum PostStatus {
  DRAFT
  PUBLISHED
  SCHEDULED
  ARCHIVED
}

// lib/cms/content-service.js - Service de gestion de contenu
import { prisma } from '../prisma';
import { slugify } from '../utils';

export class ContentService {
  async createPost(authorId, data) {
    return await prisma.$transaction(async (tx) => {
      // Générer un slug unique
      let slug = slugify(data.title);
      let counter = 1;
      while (await tx.post.findUnique({ where: { slug } })) {
        slug = \`\${slugify(data.title)}-\${counter}\`;
        counter++;
      }

      const post = await tx.post.create({
        data: {
          title: data.title,
          slug,
          excerpt: data.excerpt,
          content: data.content,
          featuredImage: data.featuredImage,
          status: data.status || 'DRAFT',
          publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription,
          authorId,
          categoryId: data.categoryId,
          tags: {
            create: data.tagIds?.map(tagId => ({ tagId })) || []
          },
          media: {
            create: data.mediaIds?.map((mediaId, index) => ({
              mediaId,
              order: index
            })) || []
          }
        },
        include: {
          author: {
            select: { id: true, name: true, username: true, avatar: true }
          },
          category: true,
          tags: { include: { tag: true } },
          media: { include: { media: true }, orderBy: { order: 'asc' } }
        }
      });

      return post;
    });
  }

  async getPosts(options = {}) {
    const {
      page = 1,
      limit = 10,
      status = 'PUBLISHED',
      categoryId,
      tagIds,
      authorId,
      search,
      sortBy = 'publishedAt',
      sortOrder = 'desc'
    } = options;

    const skip = (page - 1) * limit;

    const where = {
      status,
      ...(categoryId && { categoryId }),
      ...(tagIds && {
        tags: {
          some: {
            tagId: { in: tagIds }
          }
        }
      }),
      ...(authorId && { authorId }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { excerpt: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const [posts, totalCount] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: { id: true, name: true, username: true, avatar: true }
          },
          category: true,
          tags: { include: { tag: true } },
          media: { 
            include: { media: true }, 
            orderBy: { order: 'asc' },
            take: 1
          },
          _count: {
            select: {
              comments: { where: { isApproved: true } }
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit
      }),
      prisma.post.count({ where })
    ]);

    return {
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
      }
    };
  }

  async getPostBySlug(slug, includeViews = true) {
    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        author: {
          select: { id: true, name: true, username: true, avatar: true, bio: true }
        },
        category: true,
        tags: { include: { tag: true } },
        media: { 
          include: { media: true }, 
          orderBy: { order: 'asc' }
        },
        comments: {
          where: { isApproved: true, parentId: null },
          include: {
            user: {
              select: { name: true, username: true, avatar: true }
            },
            replies: {
              where: { isApproved: true },
              include: {
                user: {
                  select: { name: true, username: true, avatar: true }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    // Incrémenter les vues
    if (post && includeViews) {
      await prisma.post.update({
        where: { id: post.id },
        data: { viewsCount: { increment: 1 } }
      });
    }

    return post;
  }

  async searchContent(query, options = {}) {
    const { limit = 10, type = 'all' } = options;

    const results = {};

    if (type === 'all' || type === 'posts') {
      results.posts = await prisma.post.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { excerpt: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } }
          ]
        },
        include: {
          author: {
            select: { name: true, username: true }
          },
          category: true
        },
        take: limit,
        orderBy: { publishedAt: 'desc' }
      });
    }

    if (type === 'all' || type === 'categories') {
      results.categories = await prisma.category.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: limit
      });
    }

    if (type === 'all' || type === 'tags') {
      results.tags = await prisma.tag.findMany({
        where: {
          name: { contains: query, mode: 'insensitive' }
        },
        take: limit
      });
    }

    return results;
  }

  async getAnalytics(dateRange = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dateRange);

    const [postsCount, commentsCount, viewsTotal, popularPosts] = await Promise.all([
      prisma.post.count({
        where: { createdAt: { gte: startDate } }
      }),
      prisma.comment.count({
        where: { createdAt: { gte: startDate } }
      }),
      prisma.post.aggregate({
        _sum: { viewsCount: true }
      }),
      prisma.post.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { viewsCount: 'desc' },
        take: 10,
        include: {
          author: {
            select: { name: true, username: true }
          }
        }
      })
    ]);

    return {
      postsCount,
      commentsCount,
      viewsTotal: viewsTotal._sum.viewsCount || 0,
      popularPosts
    };
  }
}

export const contentService = new ContentService();

// pages/api/cms/posts/index.js - API pour la gestion des articles
import { contentService } from '../../../../lib/cms/content-service';
import { withAuth } from '../../../../middleware/auth';
import joi from 'joi';

const createPostSchema = joi.object({
  title: joi.string().min(1).max(200).required(),
  excerpt: joi.string().max(500).optional(),
  content: joi.string().required(),
  featuredImage: joi.string().uri().optional(),
  status: joi.string().valid('DRAFT', 'PUBLISHED', 'SCHEDULED').default('DRAFT'),
  categoryId: joi.string().optional(),
  tagIds: joi.array().items(joi.string()).optional(),
  mediaIds: joi.array().items(joi.string()).optional(),
  seoTitle: joi.string().max(60).optional(),
  seoDescription: joi.string().max(160).optional()
});

async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await getPosts(req, res);
      case 'POST':
        return await createPost(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: \`Méthode \${method} non autorisée\` });
    }
  } catch (error) {
    console.error('Erreur API CMS:', error);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}

async function getPosts(req, res) {
  const {
    page = 1,
    limit = 10,
    status,
    categoryId,
    tagIds,
    authorId,
    search,
    sortBy,
    sortOrder
  } = req.query;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    status: status || (req.user.role === 'ADMIN' ? undefined : 'PUBLISHED'),
    categoryId,
    tagIds: tagIds ? tagIds.split(',') : undefined,
    authorId,
    search,
    sortBy,
    sortOrder
  };

  const result = await contentService.getPosts(options);
  res.status(200).json(result);
}

async function createPost(req, res) {
  // Vérifier les permissions
  if (!['AUTHOR', 'EDITOR', 'ADMIN'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Permission refusée' });
  }

  const { error, value } = createPostSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'Données invalides',
      details: error.details.map(d => d.message)
    });
  }

  const post = await contentService.createPost(req.user.userId, value);
  res.status(201).json({ post });
}

export default withAuth(handler);`
  }
}

export default lesson1
