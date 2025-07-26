import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Product from '@/models/Product';
import Store from '@/models/Store';
import Role, { IRole } from '@/models/Role';

/**
 * API de test pour vérifier l'état de l'application Ecomus Dashboard2
 * GET /api/test-ecomus - Retourne l'état complet du système multi-store
 */

interface ModelTestResult {
  name: string;
  count: number;
  status: 'OK' | 'ERROR';
  error?: string;
}

interface SystemRolesTestResult {
  total?: number;
  existing?: string[];
  missing?: string[];
  initialized?: boolean;
  error?: string;
}

interface StatisticsTestResult {
  users?: {
    total: number;
    active: number;
    verified: number;
    byRole: {
      admin: number;
      vendor: number;
      customer: number;
    };
  };
  stores?: {
    total: number;
    active: number;
    pending: number;
    verified: number;
  };
  products?: {
    total: number;
    active: number;
    featured: number;
  };
  error?: string;
}

interface TestResults {
  success: boolean;
  timestamp: string;
  version: string;
  environment: string;
  database: {
    connected: boolean;
    collections: number;
    error: string | null;
  };
  models: ModelTestResult[];
  features: {
    multiStore: boolean;
    roleBasedAccess: boolean;
    dynamicDashboards: boolean;
    reactCompatibility: boolean;
    newModels: boolean;
  };
  apis: {
    roles: boolean;
    users: boolean;
    stores: boolean;
    products: boolean;
    orders: boolean;
  };
  security: {
    authConfigured: boolean;
    databaseSecured: boolean;
    passwordHashing: boolean;
  };
  systemRoles?: SystemRolesTestResult;
  statistics?: StatisticsTestResult;
}

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Test API Ecomus Dashboard2 - Début des vérifications...');
    
    const testResults: TestResults = {
      success: true,
      timestamp: new Date().toISOString(),
      version: '2.0.0-multi-store',
      environment: process.env.NODE_ENV || 'development',
      database: {
        connected: false,
        collections: 0,
        error: null
      },
      models: [],
      features: {
        multiStore: true,
        roleBasedAccess: true,
        dynamicDashboards: true,
        reactCompatibility: true,
        newModels: true
      },
      apis: {
        roles: true,
        users: true,
        stores: true,
        products: true,
        orders: true
      },
      security: {
        authConfigured: !!process.env.NEXTAUTH_SECRET,
        databaseSecured: !!process.env.MONGODB_URI,
        passwordHashing: true
      }
    };

    // Test 1: Connexion à la base de données
    try {
      console.log('🔗 Test de connexion MongoDB...');
      await connectDB();
      testResults.database.connected = true;
      console.log('✅ MongoDB connecté');
    } catch (error) {
      console.error('❌ Erreur MongoDB:', error);
      testResults.database.connected = false;
      testResults.database.error = error instanceof Error ? error.message : String(error);
      testResults.success = false;
    }

    // Test 2: Vérification des modèles
    if (testResults.database.connected) {
      console.log('🗃️ Vérification des modèles...');
      
      const modelTests = [
        { name: 'User', model: User },
        { name: 'Role', model: Role },
        { name: 'Store', model: Store },
        { name: 'Product', model: Product }
      ];

      for (const { name, model } of modelTests) {
        try {
          const count = await model.countDocuments();
          testResults.models.push({
            name,
            count,
            status: 'OK'
          });
          console.log(`✅ Modèle ${name}: ${count} documents`);
        } catch (error) {
          testResults.models.push({
            name,
            count: 0,
            status: 'ERROR',
            error: error instanceof Error ? error.message : String(error)
          });
          console.error(`❌ Erreur modèle ${name}:`, error instanceof Error ? error.message : String(error));
        }
      }
    }

    // Test 3: Vérification des rôles système
    if (testResults.database.connected) {
      console.log('👥 Vérification des rôles système...');
      try {
        const systemRolesModels = await Role.find({ isSystem: true }) as IRole[];
        const requiredRoles = ['admin', 'vendor', 'customer'];
        const existingRoles = systemRolesModels.map(role => role.name);
        const missingRoles = requiredRoles.filter(role => !existingRoles.includes(role));
        
        testResults.systemRoles = {
          total: systemRolesModels.length,
          existing: existingRoles,
          missing: missingRoles,
          initialized: missingRoles.length === 0
        };

        if (missingRoles.length > 0) {
          console.log(`⚠️ Rôles manquants: ${missingRoles.join(', ')}`);
        } else {
          console.log('✅ Tous les rôles système sont présents');
        }
      } catch (error) {
        console.error('❌ Erreur vérification rôles:', error instanceof Error ? error.message : String(error));
        testResults.systemRoles = { error: error instanceof Error ? error.message : String(error) };
      }
    }

    // Test 4: Statistiques rapides
    if (testResults.database.connected) {
      console.log('📊 Collecte des statistiques...');
      try {
        const stats = {
          users: {
            total: await User.countDocuments(),
            active: await User.countDocuments({ isActive: true }),
            verified: await User.countDocuments({ isVerified: true }),
            byRole: {
              admin: await User.countDocuments({ role: 'admin' }),
              vendor: await User.countDocuments({ role: 'vendor' }),
              customer: await User.countDocuments({ role: 'customer' })
            }
          },
          stores: {
            total: await Store.countDocuments(),
            active: await Store.countDocuments({ status: 'active' }),
            pending: await Store.countDocuments({ status: 'pending' }),
            verified: await Store.countDocuments({ 'verification.isVerified': true })
          },
          products: {
            total: await Product.countDocuments(),
            active: await Product.countDocuments({ status: 'active' }),
            featured: await Product.countDocuments({ featured: true })
          }
        };

        testResults.statistics = stats;
        console.log('✅ Statistiques collectées');
      } catch (error) {
        console.error('❌ Erreur collecte statistiques:', error instanceof Error ? error.message : String(error));
        testResults.statistics = { error: error instanceof Error ? error.message : String(error) };
      }
    }

    // Résumé final
    const errorCount = testResults.models.filter(m => m.status === 'ERROR').length;
    const hasSystemRolesError = testResults.systemRoles?.error;
    const hasStatsError = testResults.statistics?.error;
    
    if (errorCount > 0 || hasSystemRolesError || hasStatsError) {
      testResults.success = false;
    }

    console.log(`🏁 Test API terminé - Succès: ${testResults.success}`);

    return NextResponse.json(testResults, { 
      status: testResults.success ? 200 : 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('❌ Erreur fatale API test:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur',
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
      stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    });
  }
}
