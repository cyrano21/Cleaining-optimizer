/**
 * Script de vérification finale du système multi-store
 * Version JavaScript simple et rapide
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomus';

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',  
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function checkEnvironment() {
  log('\n🔍 VÉRIFICATION DE L\'ENVIRONNEMENT', colors.bright);
  
  const checks = [
    { name: 'package.json', path: 'package.json' },
    { name: 'next.config.js', path: 'next.config.js' },
    { name: 'tsconfig.json', path: 'tsconfig.json' },
    { name: '.env.local', path: '.env.local' },
    { name: 'MongoDB lib', path: 'src/lib/mongodb.ts' },
    { name: 'User model', path: 'src/models/User.ts' },
    { name: 'Store model', path: 'src/models/Store.ts' },
    { name: 'Product model', path: 'src/models/Product.ts' },
    { name: 'Role model', path: 'src/models/Role.ts' },
    { name: 'Roles API', path: 'src/app/api/roles/route.ts' },
    { name: 'Users API', path: 'src/app/api/users/route.ts' },
    { name: 'Test API', path: 'src/app/api/test-ecomus/route.ts' }
  ];
  
  let passed = 0;
  
  for (const check of checks) {
    if (fs.existsSync(check.path)) {
      log(`  ✅ ${check.name}`, colors.green);
      passed++;
    } else {
      log(`  ❌ ${check.name}`, colors.red);
    }
  }
  
  log(`\n📊 Fichiers vérifiés: ${passed}/${checks.length}`, colors.blue);
  return passed === checks.length;
}

async function checkDatabase() {
  log('\n🗄️  VÉRIFICATION DE LA BASE DE DONNÉES', colors.bright);
  
  try {
    log('  ⏳ Connexion à MongoDB...', colors.yellow);
    await mongoose.connect(MONGODB_URI);
    log('  ✅ Connexion MongoDB établie', colors.green);
    
    // Vérifier les collections
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    log(`  📦 Collections disponibles: ${collections.length}`, colors.blue);
    
    collections.forEach(col => {
      log(`     - ${col.name}`, colors.cyan);
    });
    
    return true;
  } catch (error) {
    log(`  ❌ Erreur MongoDB: ${error.message}`, colors.red);
    return false;
  }
}

async function checkRoles() {
  log('\n👥 VÉRIFICATION DES RÔLES SYSTÈME', colors.bright);
  
  try {
    // Définir le schéma Role
    const RoleSchema = new mongoose.Schema({
      name: String,
      description: String,
      permissions: [String],
      isActive: Boolean,
      isSystem: Boolean
    }, { timestamps: true });
    
    const Role = mongoose.models.Role || mongoose.model('Role', RoleSchema);
    
    const roles = await Role.find({ isSystem: true });
    
    if (roles.length === 0) {
      log('  ⚠️  Aucun rôle système trouvé', colors.yellow);
      log('  🔧 Exécutez: node scripts/init-roles-simple.js', colors.cyan);
      return false;
    }
    
    log(`  ✅ ${roles.length} rôles système trouvés:`, colors.green);
    roles.forEach(role => {
      log(`     - ${role.name}: ${role.permissions.length} permissions`, colors.cyan);
    });
    
    return true;
  } catch (error) {
    log(`  ❌ Erreur rôles: ${error.message}`, colors.red);
    return false;
  }
}

async function checkDashboards() {
  log('\n📊 VÉRIFICATION DES DASHBOARDS', colors.bright);
  
  const dashboards = [
    'src/app/dashboard/page.tsx',
    'src/app/e-commerce/admin-dashboard/page.tsx',
    'src/app/e-commerce/vendor-dashboard/page.tsx'
  ];
  
  let passed = 0;
  
  for (const dashboard of dashboards) {
    if (fs.existsSync(dashboard)) {
      log(`  ✅ ${path.basename(path.dirname(dashboard))}`, colors.green);
      passed++;
    } else {
      log(`  ❌ ${path.basename(path.dirname(dashboard))}`, colors.red);
    }
  }
  
  return passed === dashboards.length;
}

async function generateReport() {
  log('\n📋 GÉNÉRATION DU RAPPORT FINAL', colors.bright);
  
  const report = {
    timestamp: new Date().toISOString(),
    version: '2.0.0-multi-store',
    environment: process.env.NODE_ENV || 'development',
    checks: {
      environment: false,
      database: false,
      roles: false,
      dashboards: false
    },
    recommendations: []
  };
  
  // Exécuter toutes les vérifications
  report.checks.environment = await checkEnvironment();
  report.checks.database = await checkDatabase();
  report.checks.roles = await checkRoles();
  report.checks.dashboards = await checkDashboards();
  
  // Générer des recommandations
  if (!report.checks.environment) {
    report.recommendations.push('Vérifiez que tous les fichiers requis sont présents');
  }
  
  if (!report.checks.database) {
    report.recommendations.push('Démarrez MongoDB et vérifiez la connexion');
  }
  
  if (!report.checks.roles) {
    report.recommendations.push('Initialisez les rôles système avec: node scripts/init-roles-simple.js');
  }
  
  if (!report.checks.dashboards) {
    report.recommendations.push('Vérifiez que tous les dashboards sont créés');
  }
  
  // Résumé final
  const passedChecks = Object.values(report.checks).filter(Boolean).length;
  const totalChecks = Object.keys(report.checks).length;
  
  log('\n🎯 RÉSUMÉ FINAL', colors.bright);
  log(`📊 Vérifications réussies: ${passedChecks}/${totalChecks}`, colors.blue);
  
  if (passedChecks === totalChecks) {
    log('🎉 SYSTÈME MULTI-STORE OPÉRATIONNEL !', colors.green);
    log('🚀 Vous pouvez démarrer avec: yarn dev', colors.cyan);
  } else {
    log('⚠️  Certaines vérifications ont échoué', colors.yellow);
    log('\n📋 RECOMMANDATIONS:', colors.bright);
    report.recommendations.forEach(rec => {
      log(`   - ${rec}`, colors.cyan);
    });
  }
  
  // Sauvegarder le rapport
  fs.writeFileSync('system-status.json', JSON.stringify(report, null, 2));
  log(`\n💾 Rapport sauvegardé dans: system-status.json`, colors.blue);
  
  return report;
}

async function main() {
  try {
    log('🚀 VÉRIFICATION FINALE SYSTÈME MULTI-STORE ECOMUS', colors.bright);
    
    const report = await generateReport();
    
    log('\n✨ Vérification terminée !', colors.bright);
    
  } catch (error) {
    log(`❌ Erreur fatale: ${error.message}`, colors.red);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      log('📤 Déconnecté de MongoDB', colors.blue);
    }
    process.exit(0);
  }
}

// Exécuter
main();
