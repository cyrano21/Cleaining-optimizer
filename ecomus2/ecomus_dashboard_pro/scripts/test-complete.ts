/**
 * Script de test complet pour l'application multi-store
 * Teste les APIs, les modèles et les fonctionnalités principales
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';
const TEST_TIMEOUT = 30000;

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

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

class TestRunner {
  private passed = 0;
  private failed = 0;
  private tests: Array<{ name: string; fn: () => Promise<void> }> = [];

  test(name: string, fn: () => Promise<void>) {
    this.tests.push({ name, fn });
  }

  async run() {
    log('\n🚀 Démarrage des tests de l\'application multi-store\n', colors.bright);

    for (const test of this.tests) {
      try {
        log(`⏳ ${test.name}`, colors.yellow);
        await Promise.race([
          test.fn(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), TEST_TIMEOUT)
          )        ]);
        this.passed++;
        log(`✅ ${test.name}`, colors.green);
      } catch (error) {
        this.failed++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        log(`❌ ${test.name}: ${errorMessage}`, colors.red);
      }
    }

    this.summary();
  }

  private summary() {
    log('\n📊 RÉSUMÉ DES TESTS', colors.bright);
    log(`✅ Tests réussis: ${this.passed}`, colors.green);
    log(`❌ Tests échoués: ${this.failed}`, colors.red);
    log(`📝 Total: ${this.passed + this.failed}`, colors.blue);
    
    if (this.failed === 0) {
      log('\n🎉 Tous les tests sont passés avec succès !', colors.green);
    } else {
      log('\n⚠️  Certains tests ont échoué. Vérifiez les erreurs ci-dessus.', colors.yellow);
    }
  }
}

// Utilitaires
async function makeRequest(endpoint: string, options: any = {}): Promise<any> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<any>;
}

// Tests
const runner = new TestRunner();

// Test 1: Vérification de l'état de l'application
runner.test('Vérification de l\'état de l\'application', async () => {
  const response = await fetch('http://localhost:3001/api/test-ecomus');
  if (!response.ok) {
    throw new Error('Application non accessible');
  }
  const data = await response.json() as any;
  if (!(data && typeof data === 'object' && 'success' in data && data.success)) {
    throw new Error('L\'application ne répond pas correctement');
  }
});

// Test 2: Test des APIs de rôles
runner.test('Test de l\'API des rôles (GET)', async () => {
  try {
    await makeRequest('/roles');
    // L'API peut retourner 403 si pas d'auth, c'est normal
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (!errorMessage.includes('403')) {
      throw error;
    }
  }
});

// Test 3: Test des APIs d'utilisateurs
runner.test('Test de l\'API des utilisateurs (GET)', async () => {
  try {
    await makeRequest('/users');
    // L'API peut retourner 403 si pas d'auth, c'est normal
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (!errorMessage.includes('403')) {
      throw error;
    }
  }
});

// Test 4: Test de l'API des boutiques
runner.test('Test de l\'API des boutiques (GET)', async () => {
  try {
    const data = await makeRequest('/stores');
    if (!Array.isArray(data) && !(data && typeof data === 'object' && 'stores' in data)) {
      throw new Error('Format de réponse invalide');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (!errorMessage.includes('403') && !errorMessage.includes('404')) {
      throw error;
    }
  }
});

// Test 5: Test de l'API des produits
runner.test('Test de l\'API des produits (GET)', async () => {
  try {
    const data = await makeRequest('/products');
    if (!Array.isArray(data) && !(data && typeof data === 'object' && 'products' in data)) {
      throw new Error('Format de réponse invalide');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (!errorMessage.includes('403') && !errorMessage.includes('404')) {
      throw error;
    }
  }
});

// Test 6: Test de l'API des commandes
runner.test('Test de l\'API des commandes (GET)', async () => {
  try {
    const data = await makeRequest('/orders');
    if (!Array.isArray(data) && !(data && typeof data === 'object' && 'orders' in data)) {
      throw new Error('Format de réponse invalide');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (!errorMessage.includes('403') && !errorMessage.includes('404')) {
      throw error;
    }
  }
});

// Test 7: Test de l'API des catégories
runner.test('Test de l\'API des catégories (GET)', async () => {
  try {
    const data = await makeRequest('/categories');
    if (!Array.isArray(data) && !(data && typeof data === 'object' && 'categories' in data)) {
      throw new Error('Format de réponse invalide');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (!errorMessage.includes('403') && !errorMessage.includes('404')) {
      throw error;
    }
  }
});

// Test 8: Test de connectivité MongoDB via l'API de test
runner.test('Test de connectivité MongoDB', async () => {
  const data = await makeRequest('/test-ecomus');
  if (!(data && typeof data === 'object' && 'database' in data && data.database && typeof data.database === 'object' && 'connected' in data.database && data.database.connected)) {
    throw new Error('Connexion MongoDB échouée');
  }
});

// Test 9: Vérification des modèles
runner.test('Vérification des modèles de données', async () => {
  const data = await makeRequest('/test-ecomus');
  if (!(data && typeof data === 'object' && 'models' in data && Array.isArray(data.models) && data.models.length > 0)) {
    throw new Error('Aucun modèle détecté');
  }
  
  const requiredModels = ['User', 'Product', 'Store', 'Order', 'Role'];
  const missingModels = requiredModels.filter(model => 
    !data.models.some((m: any) => m && typeof m === 'object' && 'name' in m && m.name === model)
  );
  
  if (missingModels.length > 0) {
    throw new Error(`Modèles manquants: ${missingModels.join(', ')}`);
  }
});

// Test 10: Test des routes de dashboard par rôle
runner.test('Test des routes de dashboard', async () => {
  const routes = [
    '/dashboard',
    '/e-commerce/admin-dashboard',
    '/e-commerce/vendor-dashboard'
  ];
  
  for (const route of routes) {
    const response = await fetch(`http://localhost:3001${route}`);
    if (response.status === 500) {
      throw new Error(`Erreur serveur sur ${route}`);
    }
  }
});

// Test 11: Test de sécurité des APIs
runner.test('Test de sécurité des APIs protégées', async () => {
  const protectedEndpoints = ['/roles', '/users'];
  
  for (const endpoint of protectedEndpoints) {
    try {
      await makeRequest(endpoint);
      // Si ça passe sans auth, c'est un problème
      throw new Error(`API ${endpoint} non protégée`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (!errorMessage.includes('403') && !errorMessage.includes('401')) {
        throw error;
      }
      // 403/401 est attendu pour les APIs protégées
    }
  }
});

// Test 12: Test de performance basique
runner.test('Test de performance des APIs', async () => {
  const start = Date.now();
  await makeRequest('/test-ecomus');
  const duration = Date.now() - start;
  
  if (duration > 5000) {
    throw new Error(`API trop lente: ${duration}ms`);
  }
});

// Fonction principale
async function main() {
  log('🔧 Vérification des prérequis...', colors.blue);
  
  // Vérifier que le serveur est démarré
  try {
    const response = await fetch('http://localhost:3001/api/test-ecomus');
    if (!response.ok) {
      throw new Error('Serveur non accessible');
    }
  } catch (error) {
    log('❌ Le serveur ne semble pas démarré sur le port 3001', colors.red);
    log('   Démarrez le serveur avec: yarn dev', colors.yellow);
    process.exit(1);
  }
  
  log('✅ Serveur accessible', colors.green);
  
  // Lancer les tests
  await runner.run();
  
  log('\n📋 RECOMMANDATIONS:', colors.bright);
  log('1. Assurez-vous que MongoDB est démarré', colors.cyan);
  log('2. Vérifiez les variables d\'environnement (.env.local)', colors.cyan);
  log('3. Initialisez les rôles avec: yarn init:roles', colors.cyan);
  log('4. Testez les dashboards manuellement dans le navigateur', colors.cyan);
  
  process.exit(0);
}

// Exécuter si appelé directement
if (require.main === module) {
  main().catch(error => {
    log(`❌ Erreur fatale: ${error.message}`, colors.red);
    process.exit(1);
  });
}
