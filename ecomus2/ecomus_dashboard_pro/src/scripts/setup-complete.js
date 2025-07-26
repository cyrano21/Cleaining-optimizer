#!/usr/bin/env node

/**
 * Script complet d'initialisation et de test du système multi-store
 * Ce script effectue toutes les vérifications nécessaires
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${step} ${message}`, colors.bright);
}

async function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      stdio: 'pipe',
      shell: true,
      ...options
    });

    let stdout = '';
    let stderr = '';

    process.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    process.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr, code });
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderr || stdout}`));
      }
    });

    process.on('error', (error) => {
      reject(error);
    });
  });
}

async function checkFile(filePath) {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function checkEnvironment() {
  logStep('🔍', 'Vérification de l\'environnement...');
  
  const checks = [
    { name: 'package.json', path: './package.json' },
    { name: 'tsconfig.json', path: './tsconfig.json' },
    { name: '.env.local', path: './.env.local' },
    { name: 'MongoDB connection', path: './src/lib/mongodb.ts' },
    { name: 'User model', path: './src/models/User.ts' },
    { name: 'Store model', path: './src/models/Store.ts' },
    { name: 'Product model', path: './src/models/Product.ts' },
    { name: 'Role model', path: './src/models/Role.ts' },
    { name: 'Roles API', path: './src/app/api/roles/route.ts' },
    { name: 'Users API', path: './src/app/api/users/route.ts' },
    { name: 'Test API', path: './src/app/api/test-ecomus/route.ts' },
    { name: 'Init roles script', path: './scripts/init-roles.ts' }
  ];

  let allGood = true;
  
  for (const check of checks) {
    const exists = await checkFile(check.path);
    if (exists) {
      log(`  ✅ ${check.name}`, colors.green);
    } else {
      log(`  ❌ ${check.name} - MANQUANT`, colors.red);
      allGood = false;
    }
  }

  if (!allGood) {
    throw new Error('Fichiers manquants détectés');
  }

  log('✅ Environnement vérifié', colors.green);
}

async function installDependencies() {
  logStep('📦', 'Vérification des dépendances...');
  
  try {
    // Vérifier si node_modules existe
    const nodeModulesExists = await checkFile('./node_modules');
    
    if (!nodeModulesExists) {
      log('📥 Installation des dépendances...', colors.yellow);
      await runCommand('yarn', ['install']);
      log('✅ Dépendances installées', colors.green);
    } else {
      log('✅ Dépendances déjà installées', colors.green);
    }
  } catch (error) {
    log(`❌ Erreur installation: ${error.message}`, colors.red);
    throw error;
  }
}

async function buildProject() {
  logStep('🔨', 'Compilation du projet...');
  
  try {
    log('⚙️ Compilation TypeScript...', colors.yellow);
    const result = await runCommand('yarn', ['build']);
    
    if (result.stderr && result.stderr.includes('error')) {
      throw new Error(`Erreurs de compilation: ${result.stderr}`);
    }
    
    log('✅ Compilation réussie', colors.green);
  } catch (error) {
    log(`❌ Erreur de compilation: ${error.message}`, colors.red);
    log('💡 Essayez de corriger les erreurs TypeScript', colors.yellow);
    throw error;
  }
}

async function initializeRoles() {
  logStep('👥', 'Initialisation des rôles système...');
  
  try {
    log('🚀 Exécution du script d\'initialisation...', colors.yellow);
    
    // Utiliser ts-node pour exécuter le script TypeScript
    const result = await runCommand('npx', ['ts-node', 'scripts/init-roles.ts']);
    
    log('✅ Rôles système initialisés', colors.green);
    
    if (result.stdout) {
      log('📄 Sortie du script:', colors.blue);
      console.log(result.stdout);
    }
  } catch (error) {
    log(`⚠️ Erreur d'initialisation des rôles: ${error.message}`, colors.yellow);
    log('💡 Les rôles existent peut-être déjà', colors.blue);
  }
}

async function startServer() {
  logStep('🚀', 'Démarrage du serveur de développement...');
  
  return new Promise((resolve) => {
    log('⏳ Démarrage du serveur sur le port 3001...', colors.yellow);
    
    const serverProcess = spawn('yarn', ['dev'], {
      stdio: 'pipe',
      shell: true
    });

    let serverReady = false;
    
    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      
      if (output.includes('Ready') || output.includes('started server') || output.includes('Local:')) {
        if (!serverReady) {
          serverReady = true;
          log('✅ Serveur démarré avec succès', colors.green);
          log('🌐 URL: http://localhost:3001', colors.cyan);
          resolve(serverProcess);
        }
      }
    });

    serverProcess.stderr.on('data', (data) => {
      const output = data.toString();
      if (output.includes('EADDRINUSE')) {
        log('⚠️ Port 3001 déjà utilisé', colors.yellow);
        if (!serverReady) {
          serverReady = true;
          resolve(null); // Serveur probablement déjà en cours
        }
      }
    });

    // Timeout au cas où le serveur ne démarre pas
    setTimeout(() => {
      if (!serverReady) {
        log('⚠️ Timeout démarrage serveur', colors.yellow);
        resolve(null);
      }
    }, 30000);
  });
}

async function testApis() {
  logStep('🧪', 'Test des APIs...');
  
  await new Promise(resolve => setTimeout(resolve, 5000)); // Attendre que le serveur soit prêt
  
  try {
    const fetch = (await import('node-fetch')).default;
    
    // Test de l'API principale
    log('🔍 Test de l\'API de test...', colors.yellow);
    const response = await fetch('http://localhost:3001/api/test-ecomus');
    
    if (!response.ok) {
      throw new Error(`API test failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    log('✅ API de test fonctionnelle', colors.green);
    
    // Afficher les résultats
    if (data.success) {
      log('🎉 Système multi-store opérationnel !', colors.green);
    } else {
      log('⚠️ Problèmes détectés dans le système', colors.yellow);
    }
    
    log('\n📊 RÉSULTATS DES TESTS:', colors.bright);
    log(`   Database: ${data.database.connected ? '✅' : '❌'}`, data.database.connected ? colors.green : colors.red);
    log(`   Models: ${data.models.length} détectés`, colors.blue);
    log(`   Features: Multi-store ${data.features.multiStore ? '✅' : '❌'}`, colors.blue);
    
    if (data.statistics) {
      log('\n📈 STATISTIQUES:', colors.bright);
      log(`   Users: ${data.statistics.users.total} (${data.statistics.users.active} actifs)`, colors.cyan);
      log(`   Stores: ${data.statistics.stores.total} (${data.statistics.stores.active} actives)`, colors.cyan);
      log(`   Products: ${data.statistics.products.total} (${data.statistics.products.active} actifs)`, colors.cyan);
    }
    
    if (data.systemRoles) {
      log('\n👥 RÔLES SYSTÈME:', colors.bright);
      log(`   Total: ${data.systemRoles.total}`, colors.cyan);
      log(`   Initialisés: ${data.systemRoles.initialized ? '✅' : '❌'}`, data.systemRoles.initialized ? colors.green : colors.red);
      if (data.systemRoles.missing && data.systemRoles.missing.length > 0) {
        log(`   Manquants: ${data.systemRoles.missing.join(', ')}`, colors.yellow);
      }
    }
    
  } catch (error) {
    log(`❌ Test API échoué: ${error.message}`, colors.red);
    log('💡 Vérifiez que le serveur est démarré et MongoDB connecté', colors.yellow);
  }
}

async function main() {
  try {
    log('🚀 INITIALISATION SYSTÈME MULTI-STORE ECOMUS DASHBOARD2\n', colors.bright);
    
    await checkEnvironment();
    await installDependencies();
    
    // Essayer d'initialiser les rôles avant de démarrer
    await initializeRoles();
    
    // Démarrer le serveur
    const serverProcess = await startServer();
    
    // Tester les APIs
    await testApis();
    
    log('\n🎉 INITIALISATION TERMINÉE AVEC SUCCÈS !', colors.green);
    log('\n📋 PROCHAINES ÉTAPES:', colors.bright);
    log('1. 🌐 Ouvrez http://localhost:3001 dans votre navigateur', colors.cyan);
    log('2. 🔐 Connectez-vous avec admin@ecomus.com / admin123', colors.cyan);
    log('3. 👥 Gérez les rôles dans E-commerce > Roles > All Roles', colors.cyan);
    log('4. 🏪 Créez des boutiques et testez les dashboards', colors.cyan);
    log('5. 📊 Vérifiez les dashboards dynamiques par rôle', colors.cyan);
    
    log('\n💡 CONSEILS:', colors.bright);
    log('- Changez le mot de passe admin par défaut', colors.yellow);
    log('- Configurez MongoDB avec vos données réelles', colors.yellow);
    log('- Testez les APIs avec un client REST (Postman)', colors.yellow);
    
    if (serverProcess) {
      log('\n⏹️ Appuyez sur Ctrl+C pour arrêter le serveur', colors.blue);
      
      // Garder le processus vivant
      process.on('SIGINT', () => {
        log('\n🛑 Arrêt du serveur...', colors.yellow);
        if (serverProcess && !serverProcess.killed) {
          serverProcess.kill();
        }
        process.exit(0);
      });
      
      // Attendre indéfiniment
      await new Promise(() => {});
    }
    
  } catch (error) {
    log(`\n❌ ERREUR D'INITIALISATION: ${error.message}`, colors.red);
    log('\n🔧 SOLUTIONS POSSIBLES:', colors.yellow);
    log('1. Vérifiez que MongoDB est démarré', colors.blue);
    log('2. Vérifiez le fichier .env.local', colors.blue);
    log('3. Exécutez: yarn install', colors.blue);
    log('4. Corrigez les erreurs TypeScript', colors.blue);
    
    process.exit(1);
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  main();
}
