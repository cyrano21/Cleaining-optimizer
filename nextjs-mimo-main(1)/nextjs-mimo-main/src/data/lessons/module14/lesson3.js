const lesson3 = {
  id: '14-3',
  title: 'Migrations et Gestion des Données en Production',
  description:
    'Stratégies avancées pour gérer les migrations de base de données, la sauvegarde, et la synchronisation des données en production.',
  difficulty: 'expert',
  duration: 50,
  tags: [
    'Next.js',
    'Migrations',
    'Production',
    'Sauvegarde',
    'Synchronisation'
  ],
  prerequisites: ['module14-lesson1', 'module14-lesson2'],

  content: {
    theory: `
      <h2>🔧 Migrations et Gestion des Données en Production</h2>
      
      <h3>1. Stratégies de Migration</h3>
      <p>Approches pour gérer les changements de schéma en production de manière sûre.</p>
      
      <div class="code-example">
        <pre><code>// scripts/migration-manager.js
import { execSync } from 'child_process'
import prisma from '../lib/prisma'

export class MigrationManager {
  static async createMigration(name, description) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const migrationName = \`\${timestamp}-\${name}\`
    
    try {
      // Créer la migration
      execSync(\`npx prisma migrate dev --name \${migrationName} --create-only\`, {
        stdio: 'inherit'
      })
      
      console.log(\`Migration créée: \${migrationName}\`)
      
      // Logger la migration
      await this.logMigration(migrationName, description, 'created')
      
    } catch (error) {
      console.error('Erreur lors de la création de migration:', error)
      throw error
    }
  }
  
  static async deployMigration(environment = 'production') {
    try {
      // Vérifier l'état actuel
      const status = await this.checkMigrationStatus()
      console.log('État des migrations:', status)
      
      if (environment === 'production') {
        // Backup avant migration en production
        await this.createBackup()
      }
      
      // Déployer les migrations
      execSync('npx prisma migrate deploy', {
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: environment }
      })
      
      await this.logMigration('deploy', 'Migration deployed', 'completed')
      console.log('Migrations déployées avec succès')
      
    } catch (error) {
      console.error('Erreur lors du déploiement:', error)
      
      if (environment === 'production') {
        console.log('Tentative de rollback...')
        await this.rollbackMigration()
      }
      
      throw error
    }
  }
  
  static async rollbackMigration() {
    try {
      // Restaurer depuis la sauvegarde
      await this.restoreBackup()
      console.log('Rollback effectué avec succès')
      
    } catch (error) {
      console.error('Erreur lors du rollback:', error)
      throw error
    }
  }
  
  static async logMigration(name, description, status) {
    return await prisma.migration_log.create({
      data: {
        name,
        description,
        status,
        executed_at: new Date(),
        environment: process.env.NODE_ENV || 'development'
      }
    })
  }
}</code></pre>
      </div>
      
      <h3>2. Système de Sauvegarde Automatique</h3>
      <p>Implementation d'un système de sauvegarde robuste avec rotation.</p>
      
      <div class="code-example">
        <pre><code>// scripts/backup-manager.js
import { S3Client, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import cron from 'node-cron'

export class BackupManager {
  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    })
    this.bucketName = process.env.BACKUP_BUCKET_NAME
  }
  
  async createDatabaseBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = \`backup-\${timestamp}.sql\`
    const filepath = path.join('/tmp', filename)
    
    try {
      // Créer le dump PostgreSQL
      const dumpCommand = \`pg_dump \${process.env.DATABASE_URL} > \${filepath}\`
      execSync(dumpCommand, { stdio: 'inherit' })
      
      // Compresser le fichier
      const compressedFile = \`\${filepath}.gz\`
      execSync(\`gzip \${filepath}\`)
      
      // Upload vers S3
      const fileBuffer = fs.readFileSync(compressedFile)
      
      await this.s3Client.send(new PutObjectCommand({
        Bucket: this.bucketName,
        Key: \`database-backups/\${filename}.gz\`,
        Body: fileBuffer,
        Metadata: {
          created_at: new Date().toISOString(),
          database: 'main',
          environment: process.env.NODE_ENV
        }
      }))
      
      // Nettoyer le fichier local
      fs.unlinkSync(compressedFile)
      
      console.log(\`Sauvegarde créée: \${filename}.gz\`)
      
      // Rotation des sauvegardes anciennes
      await this.rotateBackups()
      
      return \`database-backups/\${filename}.gz\`
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      throw error
    }
  }
  
  async rotateBackups(retentionDays = 30) {
    try {
      const response = await this.s3Client.send(new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: 'database-backups/'
      }))
      
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays)
      
      const oldBackups = response.Contents?.filter(object => 
        object.LastModified < cutoffDate
      ) || []
      
      for (const backup of oldBackups) {
        await this.s3Client.send(new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: backup.Key
        }))
        console.log(\`Sauvegarde supprimée: \${backup.Key}\`)
      }
      
    } catch (error) {
      console.error('Erreur lors de la rotation:', error)
    }
  }
  
  setupScheduledBackups() {
    // Sauvegarde quotidienne à 2h du matin
    cron.schedule('0 2 * * *', () => {
      console.log('Début de la sauvegarde programmée...')
      this.createDatabaseBackup()
        .then(() => console.log('Sauvegarde programmée terminée'))
        .catch(err => console.error('Erreur sauvegarde programmée:', err))
    })
    
    // Sauvegarde hebdomadaire complète le dimanche à 1h
    cron.schedule('0 1 * * 0', () => {
      console.log('Début de la sauvegarde hebdomadaire...')
      this.createFullBackup()
        .then(() => console.log('Sauvegarde hebdomadaire terminée'))
        .catch(err => console.error('Erreur sauvegarde hebdomadaire:', err))
    })
  }
}</code></pre>
      </div>
      
      <h3>3. Synchronisation de Données Multi-Environnements</h3>
      <p>Outils pour synchroniser les données entre développement, staging et production.</p>
      
      <div class="code-example">
        <pre><code>// scripts/data-sync.js
import prisma from '../lib/prisma'

export class DataSynchronizer {
  static async syncUserData(fromEnv, toEnv, options = {}) {
    const { 
      includePasswords = false, 
      anonymize = true,
      batchSize = 1000 
    } = options
    
    try {
      console.log(\`Synchronisation des utilisateurs: \${fromEnv} → \${toEnv}\`)
      
      // Connexions aux différents environnements
      const sourceDb = this.getConnection(fromEnv)
      const targetDb = this.getConnection(toEnv)
      
      // Récupérer les utilisateurs par batch
      let offset = 0
      let hasMore = true
      
      while (hasMore) {
        const users = await sourceDb.user.findMany({
          skip: offset,
          take: batchSize,
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            role: true,
            createdAt: true,
            ...(includePasswords && { password: true })
          }
        })
        
        if (users.length === 0) {
          hasMore = false
          break
        }
        
        // Anonymiser si nécessaire
        const processedUsers = anonymize ? 
          this.anonymizeUsers(users) : users
        
        // Insérer en batch avec gestion des conflits
        await this.upsertUsers(targetDb, processedUsers)
        
        offset += batchSize
        console.log(\`Synchronisés: \${offset} utilisateurs\`)
      }
      
      console.log('Synchronisation terminée')
      
    } catch (error) {
      console.error('Erreur de synchronisation:', error)
      throw error
    }
  }
  
  static anonymizeUsers(users) {
    return users.map((user, index) => ({
      ...user,
      email: \`user\${index + 1}@example.com\`,
      name: \`User \${index + 1}\`,
      avatar: null,
      password: undefined // Retirer le mot de passe
    }))
  }
  
  static async upsertUsers(db, users) {
    for (const user of users) {
      await db.user.upsert({
        where: { id: user.id },
        update: {
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          role: user.role
        },
        create: user
      })
    }
  }
  
  static async syncPostsData(fromEnv, toEnv, options = {}) {
    const { includeUnpublished = false, limitPerUser = 10 } = options
    
    const sourceDb = this.getConnection(fromEnv)
    const targetDb = this.getConnection(toEnv)
    
    try {
      const posts = await sourceDb.post.findMany({
        where: {
          ...(includeUnpublished ? {} : { status: 'published' })
        },
        include: {
          author: true,
          tags: true,
          comments: {
            take: 5,
            include: { author: true }
          }
        },
        take: limitPerUser * 100 // Limite globale
      })
      
      for (const post of posts) {
        // S'assurer que l'auteur existe
        await targetDb.user.upsert({
          where: { id: post.author.id },
          update: {},
          create: {
            id: post.author.id,
            email: post.author.email,
            name: post.author.name,
            role: post.author.role
          }
        })
        
        // Créer le post
        await targetDb.post.upsert({
          where: { id: post.id },
          update: {
            title: post.title,
            content: post.content,
            status: post.status,
            updatedAt: new Date()
          },
          create: {
            id: post.id,
            title: post.title,
            content: post.content,
            status: post.status,
            authorId: post.author.id,
            createdAt: post.createdAt
          }
        })
      }
      
      console.log(\`\${posts.length} posts synchronisés\`)
      
    } catch (error) {
      console.error('Erreur sync posts:', error)
      throw error
    }
  }
  
  static getConnection(environment) {
    // Retourner la connexion appropriée selon l'environnement
    switch (environment) {
      case 'development':
        return prisma // Connection locale
      case 'staging':
        return new PrismaClient({
          datasources: { db: { url: process.env.STAGING_DATABASE_URL } }
        })
      case 'production':
        return new PrismaClient({
          datasources: { db: { url: process.env.PRODUCTION_DATABASE_URL } }
        })
      default:
        throw new Error(\`Environnement inconnu: \${environment}\`)
    }
  }
}</code></pre>
      </div>
      
      <h3>4. Monitoring et Alertes</h3>
      <p>Système de surveillance des opérations de base de données.</p>
      
      <div class="code-example">
        <pre><code>// lib/db-monitoring.js
import { Webhook } from '@slack/webhook'

export class DatabaseMonitoring {
  constructor() {
    this.slackWebhook = new Webhook(process.env.SLACK_WEBHOOK_URL)
    this.metrics = {
      connectionPool: { active: 0, idle: 0, total: 0 },
      queryPerformance: { slow: 0, total: 0 },
      errors: { total: 0, recent: [] }
    }
  }
  
  async checkConnectionHealth() {
    try {
      const start = Date.now()
      await prisma.$queryRaw\`SELECT 1\`
      const duration = Date.now() - start
      
      if (duration > 5000) { // Plus de 5 secondes
        await this.sendAlert('WARN', 'Connexion BDD lente', {
          duration: \`\${duration}ms\`,
          threshold: '5000ms'
        })
      }
      
      return { healthy: true, responseTime: duration }
      
    } catch (error) {
      await this.sendAlert('ERROR', 'Connexion BDD échouée', error)
      return { healthy: false, error: error.message }
    }
  }
  
  async monitorQueryPerformance(query, duration, params = []) {
    this.metrics.queryPerformance.total++
    
    if (duration > 2000) { // Plus de 2 secondes
      this.metrics.queryPerformance.slow++
      
      await this.logSlowQuery({
        query: query.substring(0, 200),
        duration,
        params: params.length,
        timestamp: new Date().toISOString()
      })
      
      // Alert si trop de requêtes lentes
      const slowRatio = this.metrics.queryPerformance.slow / 
                       this.metrics.queryPerformance.total
      
      if (slowRatio > 0.1) { // Plus de 10% de requêtes lentes
        await this.sendAlert('WARN', 'Trop de requêtes lentes', {
          slowQueries: this.metrics.queryPerformance.slow,
          totalQueries: this.metrics.queryPerformance.total,
          ratio: \`\${(slowRatio * 100).toFixed(2)}%\`
        })
      }
    }
  }
  
  async logSlowQuery(queryInfo) {
    console.warn('Requête lente détectée:', queryInfo)
    
    // Enregistrer en base pour analyse
    try {
      await prisma.slow_query_log.create({
        data: {
          query: queryInfo.query,
          duration: queryInfo.duration,
          params_count: queryInfo.params,
          created_at: new Date(queryInfo.timestamp)
        }
      })
    } catch (error) {
      console.error('Erreur log requête lente:', error)
    }
  }
  
  async sendAlert(level, message, details = {}) {
    const color = {
      'INFO': '#36a64f',
      'WARN': '#ff9900',
      'ERROR': '#ff0000'
    }[level] || '#cccccc'
    
    const slackMessage = {
      text: \`\${level}: \${message}\`,
      attachments: [{
        color: color,
        fields: [
          {
            title: 'Environnement',
            value: process.env.NODE_ENV,
            short: true
          },
          {
            title: 'Timestamp',
            value: new Date().toISOString(),
            short: true
          },
          ...Object.entries(details).map(([key, value]) => ({
            title: key,
            value: typeof value === 'object' ? JSON.stringify(value) : value,
            short: true
          }))
        ]
      }]
    }
    
    try {
      await this.slackWebhook.send(slackMessage)
    } catch (error) {
      console.error('Erreur envoi alerte Slack:', error)
    }
  }
  
  startMonitoring() {
    // Vérification de santé toutes les 5 minutes
    setInterval(() => {
      this.checkConnectionHealth()
    }, 5 * 60 * 1000)
    
    // Reset des métriques toutes les heures
    setInterval(() => {
      this.metrics.queryPerformance = { slow: 0, total: 0 }
    }, 60 * 60 * 1000)
  }
}</code></pre>
      </div>
    `,

    practicalExample: {
      title: 'Pipeline de Migration Automatisé',
      code: `// scripts/deploy-pipeline.js
import { MigrationManager } from './migration-manager'
import { BackupManager } from './backup-manager'
import { DataSynchronizer } from './data-sync'
import { DatabaseMonitoring } from '../lib/db-monitoring'

export class DeploymentPipeline {
  constructor(environment) {
    this.environment = environment
    this.backupManager = new BackupManager()
    this.monitoring = new DatabaseMonitoring()
  }
  
  async executePipeline() {
    console.log(\`🚀 Début du déploiement vers \${this.environment}\`)
    
    try {
      // Étape 1: Vérifications pré-déploiement
      await this.preDeploymentChecks()
      
      // Étape 2: Sauvegarde si production
      if (this.environment === 'production') {
        console.log('📦 Création de la sauvegarde...')
        await this.backupManager.createDatabaseBackup()
      }
      
      // Étape 3: Tests de migration sur une copie
      if (this.environment === 'production') {
        console.log('🧪 Test de migration sur copie...')
        await this.testMigrationOnCopy()
      }
      
      // Étape 4: Déploiement des migrations
      console.log('⚡ Déploiement des migrations...')
      await MigrationManager.deployMigration(this.environment)
      
      // Étape 5: Vérifications post-déploiement
      await this.postDeploymentChecks()
      
      // Étape 6: Synchronisation des données si nécessaire
      if (this.environment === 'staging') {
        console.log('🔄 Synchronisation des données...')
        await this.syncProductionData()
      }
      
      console.log('✅ Déploiement terminé avec succès!')
      
    } catch (error) {
      console.error('❌ Erreur lors du déploiement:', error)
      await this.handleDeploymentFailure(error)
      throw error
    }
  }
  
  async preDeploymentChecks() {
    // Vérifier la santé de la base
    const health = await this.monitoring.checkConnectionHealth()
    if (!health.healthy) {
      throw new Error('Base de données non accessible')
    }
    
    // Vérifier les migrations en attente
    const pendingMigrations = await this.checkPendingMigrations()
    console.log(\`Migrations en attente: \${pendingMigrations.length}\`)
    
    // Vérifier l'espace disque
    await this.checkDiskSpace()
    
    console.log('✅ Vérifications pré-déploiement OK')
  }
  
  async testMigrationOnCopy() {
    // Créer une copie de test de la BDD
    const testDbName = \`test_migration_\${Date.now()}\`
    
    try {
      // Copier la structure et quelques données
      await this.createTestDatabase(testDbName)
      
      // Tester la migration
      await this.runMigrationTest(testDbName)
      
      console.log('✅ Test de migration réussi')
      
    } finally {
      // Nettoyer la base de test
      await this.cleanupTestDatabase(testDbName)
    }
  }
  
  async postDeploymentChecks() {
    // Vérifier que l'application répond
    const healthCheck = await fetch(\`\${process.env.APP_URL}/api/health\`)
    if (!healthCheck.ok) {
      throw new Error('Application non responsive après migration')
    }
    
    // Vérifier l'intégrité des données
    await this.checkDataIntegrity()
    
    // Tests de fumée
    await this.runSmokeTests()
    
    console.log('✅ Vérifications post-déploiement OK')
  }
  
  async syncProductionData() {
    await DataSynchronizer.syncUserData('production', 'staging', {
      anonymize: true,
      includePasswords: false
    })
    
    await DataSynchronizer.syncPostsData('production', 'staging', {
      includeUnpublished: false,
      limitPerUser: 5
    })
  }
  
  async handleDeploymentFailure(error) {
    console.log('🔧 Gestion de l\\'échec du déploiement...')
    
    // Notifier l'équipe
    await this.monitoring.sendAlert('ERROR', 'Échec du déploiement', {
      environment: this.environment,
      error: error.message,
      timestamp: new Date().toISOString()
    })
    
    // Rollback si en production
    if (this.environment === 'production') {
      console.log('⏪ Rollback en cours...')
      await MigrationManager.rollbackMigration()
    }
  }
}

// Usage
const pipeline = new DeploymentPipeline('production')
pipeline.executePipeline().catch(console.error)`,
      explanation:
        "Ce pipeline automatise entièrement le processus de déploiement avec sauvegarde, tests, et rollback automatique en cas d'erreur."
    },

    exercise: {
      question:
        'Quelle est la meilleure pratique pour les migrations en production ?',
      options: [
        'Appliquer directement les migrations',
        'Tester sur une copie puis sauvegarder avant application',
        'Faire les migrations manuellement',
        'Ignorer les migrations en production'
      ],
      correctAnswer: 1,
      explanation:
        'Il faut toujours tester les migrations sur une copie et créer une sauvegarde avant de les appliquer en production pour pouvoir faire un rollback en cas de problème.'
    },

    quiz: [
      {
        question: "Que signifie une migration 'zero-downtime' ?",
        options: [
          'Migration très rapide',
          'Migration sans arrêt de service',
          'Migration automatique',
          'Migration réversible'
        ],
        correctAnswer: 1
      },
      {
        question:
          'Quelle fréquence est recommandée pour les sauvegardes automatiques ?',
        options: [
          'Une fois par mois',
          'Une fois par semaine',
          'Une fois par jour',
          'Plusieurs fois par jour'
        ],
        correctAnswer: 2
      }
    ],

    project: {
      title: 'Système de Migration Complète',
      description:
        'Créez un système complet de gestion des migrations avec monitoring, alertes et rollback automatique.',
      initialCode: `// scripts/migration-system.js
export class MigrationSystem {
  constructor() {
    // Configuration initiale
  }
  
  // À compléter
  async planMigration(migrationName) {
    // Votre code ici
  }
  
  // À compléter
  async executeMigration(plan) {
    // Votre code ici
  }
  
  // À compléter
  async monitorMigration(migrationId) {
    // Votre code ici
  }
}`,
      solution: `// scripts/migration-system.js
import { MigrationManager } from './migration-manager'
import { BackupManager } from './backup-manager'
import { DatabaseMonitoring } from '../lib/db-monitoring'
import { EventEmitter } from 'events'

export class MigrationSystem extends EventEmitter {
  constructor() {
    super()
    this.backupManager = new BackupManager()
    this.monitoring = new DatabaseMonitoring()
    this.activeMigrations = new Map()
    this.migrationHistory = []
  }
  
  async planMigration(migrationName, options = {}) {
    const plan = {
      id: \`migration_\${Date.now()}\`,
      name: migrationName,
      environment: options.environment || 'development',
      strategy: options.strategy || 'standard', // standard, zero-downtime, blue-green
      steps: [],
      estimatedDuration: 0,
      risks: [],
      rollbackPlan: null,
      createdAt: new Date()
    }
    
    // Analyser la migration
    await this.analyzeMigration(plan)
    
    // Planifier les étapes
    await this.planSteps(plan, options)
    
    // Évaluer les risques
    await this.assessRisks(plan)
    
    // Créer le plan de rollback
    plan.rollbackPlan = await this.createRollbackPlan(plan)
    
    console.log(\`Plan de migration créé: \${plan.id}\`)
    this.emit('migrationPlanned', plan)
    
    return plan
  }
  
  async executeMigration(plan) {
    const migrationId = plan.id
    
    try {
      console.log(\`🚀 Début de l'exécution: \${migrationId}\`)
      
      // Marquer comme active
      this.activeMigrations.set(migrationId, {
        ...plan,
        status: 'running',
        startedAt: new Date(),
        currentStep: 0,
        completedSteps: []
      })
      
      this.emit('migrationStarted', migrationId)
      
      // Exécuter chaque étape
      for (let i = 0; i < plan.steps.length; i++) {
        const step = plan.steps[i]
        console.log(\`Étape \${i + 1}/\${plan.steps.length}: \${step.name}\`)
        
        // Mettre à jour le statut
        const migration = this.activeMigrations.get(migrationId)
        migration.currentStep = i
        
        this.emit('migrationProgress', {
          migrationId,
          step: i + 1,
          total: plan.steps.length,
          stepName: step.name
        })
        
        // Exécuter l'étape
        await this.executeStep(step, migration)
        
        // Marquer comme complétée
        migration.completedSteps.push({
          ...step,
          completedAt: new Date()
        })
        
        // Point de contrôle
        if (step.checkpoint) {
          await this.createCheckpoint(migrationId, i)
        }
      }
      
      // Marquer comme terminée
      const migration = this.activeMigrations.get(migrationId)
      migration.status = 'completed'
      migration.completedAt = new Date()
      
      console.log(\`✅ Migration \${migrationId} terminée avec succès\`)
      this.emit('migrationCompleted', migrationId)
      
      // Archiver
      this.migrationHistory.push(migration)
      this.activeMigrations.delete(migrationId)
      
      return { success: true, migrationId }
      
    } catch (error) {
      console.error(\`❌ Erreur migration \${migrationId}:\`, error)
      
      await this.handleMigrationError(migrationId, error)
      this.emit('migrationFailed', { migrationId, error })
      
      throw error
    }
  }
  
  async monitorMigration(migrationId) {
    const migration = this.activeMigrations.get(migrationId)
    if (!migration) {
      throw new Error(\`Migration non trouvée: \${migrationId}\`)
    }
    
    return {
      id: migrationId,
      status: migration.status,
      progress: {
        current: migration.currentStep + 1,
        total: migration.steps.length,
        percentage: Math.round(((migration.currentStep + 1) / migration.steps.length) * 100)
      },
      duration: Date.now() - migration.startedAt.getTime(),
      currentStep: migration.steps[migration.currentStep]?.name,
      completedSteps: migration.completedSteps.length,
      estimatedTimeRemaining: this.calculateRemainingTime(migration)
    }
  }
  
  async analyzeMigration(plan) {
    // Analyser la complexité de la migration
    const complexity = await this.assessComplexity(plan.name)
    plan.complexity = complexity
    
    // Estimer la durée
    plan.estimatedDuration = this.estimateDuration(complexity)
    
    console.log(\`Analyse: complexité \${complexity}, durée estimée \${plan.estimatedDuration}ms\`)
  }
  
  async planSteps(plan, options) {
    const steps = []
    
    // Étapes standard
    if (plan.environment === 'production') {
      steps.push({
        name: 'Vérifications pré-migration',
        type: 'validation',
        action: 'preChecks',
        checkpoint: true
      })
      
      steps.push({
        name: 'Création de sauvegarde',
        type: 'backup',
        action: 'createBackup',
        checkpoint: true
      })
      
      if (options.testFirst) {
        steps.push({
          name: 'Test sur copie',
          type: 'test',
          action: 'testOnCopy',
          checkpoint: false
        })
      }
    }
    
    steps.push({
      name: 'Application de la migration',
      type: 'migration',
      action: 'applyMigration',
      checkpoint: true
    })
    
    steps.push({
      name: 'Vérifications post-migration',
      type: 'validation',
      action: 'postChecks',
      checkpoint: false
    })
    
    plan.steps = steps
  }
  
  async executeStep(step, migration) {
    const startTime = Date.now()
    
    try {
      switch (step.action) {
        case 'preChecks':
          await this.monitoring.checkConnectionHealth()
          break
          
        case 'createBackup':
          await this.backupManager.createDatabaseBackup()
          break
          
        case 'testOnCopy':
          await this.testMigrationOnCopy()
          break
          
        case 'applyMigration':
          await MigrationManager.deployMigration(migration.environment)
          break
          
        case 'postChecks':
          await this.validateMigration()
          break
          
        default:
          throw new Error(\`Action inconnue: \${step.action}\`)
      }
      
      const duration = Date.now() - startTime
      console.log(\`Étape '\${step.name}' terminée en \${duration}ms\`)
      
    } catch (error) {
      console.error(\`Erreur étape '\${step.name}':\`, error)
      throw error
    }
  }
  
  async handleMigrationError(migrationId, error) {
    const migration = this.activeMigrations.get(migrationId)
    migration.status = 'failed'
    migration.error = error.message
    migration.failedAt = new Date()
    
    // Notifier
    await this.monitoring.sendAlert('ERROR', 'Migration échouée', {
      migrationId,
      error: error.message,
      step: migration.currentStep
    })
    
    // Rollback automatique si configuré
    if (migration.environment === 'production' && migration.rollbackPlan) {
      console.log('🔄 Rollback automatique...')
      await this.executeRollback(migration.rollbackPlan)
    }
  }
  
  async createRollbackPlan(plan) {
    return {
      id: \`rollback_\${plan.id}\`,
      migrationId: plan.id,
      steps: [
        {
          name: 'Arrêt de l\\'application',
          action: 'stopApp'
        },
        {
          name: 'Restauration de la sauvegarde',
          action: 'restoreBackup'
        },
        {
          name: 'Redémarrage de l\\'application',
          action: 'startApp'
        }
      ]
    }
  }
  
  calculateRemainingTime(migration) {
    const elapsed = Date.now() - migration.startedAt.getTime()
    const progress = (migration.currentStep + 1) / migration.steps.length
    
    if (progress === 0) return migration.estimatedDuration
    
    return Math.round((elapsed / progress) - elapsed)
  }
  
  // Getters pour monitoring
  getActiveMigrations() {
    return Array.from(this.activeMigrations.values())
  }
  
  getMigrationHistory() {
    return this.migrationHistory
  }
  
  getMigrationStats() {
    const total = this.migrationHistory.length
    const successful = this.migrationHistory.filter(m => m.status === 'completed').length
    const failed = total - successful
    
    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? (successful / total) * 100 : 0
    }
  }
}`
    }
  }
}

export default lesson3
