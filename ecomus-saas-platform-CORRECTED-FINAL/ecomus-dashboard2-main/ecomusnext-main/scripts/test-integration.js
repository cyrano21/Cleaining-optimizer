#!/usr/bin/env node

/**
 * Script de test rapide pour les fonctionnalités avancées Ecomus
 * Vérifie l'intégration des composants 3D, IA et profils utilisateur
 */

const fs = require('fs');
const path = require('path');

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  if (exists) {
    log(`✅ ${description}`, 'green');
    return true;
  } else {
    log(`❌ ${description} - MANQUANT: ${filePath}`, 'red');
    return false;
  }
}

function checkFileContent(filePath, searchText, description) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const found = content.includes(searchText);
    if (found) {
      log(`✅ ${description}`, 'green');
      return true;
    } else {
      log(`⚠️ ${description} - Non trouvé dans ${filePath}`, 'yellow');
      return false;
    }
  } catch (error) {
    log(`❌ ${description} - Erreur lecture: ${filePath}`, 'red');
    return false;
  }
}

function analyzeComponent(filePath, componentName) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const stats = fs.statSync(filePath);
    
    const lines = content.split('\n').length;
    const hasUseState = content.includes('useState');
    const hasUseEffect = content.includes('useEffect');
    const hasProps = content.includes('export default function');
    const hasImports = content.includes('import');
    
    log(`📊 ${componentName}:`, 'cyan');
    log(`   📝 ${lines} lignes de code`);
    log(`   📦 ${hasImports ? '✅' : '❌'} Imports`);
    log(`   ⚙️ ${hasProps ? '✅' : '❌'} Export par défaut`);
    log(`   🔄 ${hasUseState ? '✅' : '❌'} useState`);
    log(`   🎯 ${hasUseEffect ? '✅' : '❌'} useEffect`);
    log(`   📁 ${(stats.size / 1024).toFixed(1)} KB`);
    
    return {
      lines,
      hasImports,
      hasProps,
      hasUseState,
      hasUseEffect,
      size: stats.size
    };
  } catch (error) {
    log(`❌ Erreur analyse ${componentName}: ${error.message}`, 'red');
    return null;
  }
}

function main() {
  log('🧪 ECOMUS SAAS - TEST DES FONCTIONNALITÉS AVANCÉES', 'bright');
  log('='.repeat(60), 'blue');
  
  let totalChecks = 0;
  let passedChecks = 0;
  
  // Test des composants 3D
  log('\n🎯 COMPOSANTS 3D', 'bright');
  const model3DViewer = checkFile('components/shop/Model3DViewer.jsx', 'Model3DViewer component');
  const model3DUpload = checkFile('components/shop/Model3DUpload.jsx', 'Model3DUpload component');
  totalChecks += 2;
  passedChecks += (model3DViewer ? 1 : 0) + (model3DUpload ? 1 : 0);
  
  // Test des composants IA
  log('\n🤖 COMPOSANTS IA', 'bright');
  const aiChatbot = checkFile('components/common/AIChatbot.jsx', 'AIChatbot component');
  const aiGenerator = checkFile('components/common/AIGenerator.jsx', 'AIGenerator component');
  totalChecks += 2;
  passedChecks += (aiChatbot ? 1 : 0) + (aiGenerator ? 1 : 0);
  
  // Test des composants profil utilisateur
  log('\n👤 COMPOSANTS PROFIL UTILISATEUR', 'bright');
  const advancedProfile = checkFile('components/dashboard/AdvancedUserProfile.jsx', 'AdvancedUserProfile component');
  const advancedDashboard = checkFile('components/dashboard/AdvancedDashboard.jsx', 'AdvancedDashboard component');
  totalChecks += 2;
  passedChecks += (advancedProfile ? 1 : 0) + (advancedDashboard ? 1 : 0);
  
  // Test des APIs
  log('\n🔌 ROUTES API', 'bright');
  const api3DUpload = checkFile('app/api/products/3d/upload/route.js', 'API 3D Upload');
  const apiChat = checkFile('app/api/chat/route.js', 'API Chat');
  const apiAIGenerate = checkFile('app/api/ai/generate/route.js', 'API IA Generate');
  const apiProfile = checkFile('app/api/profile/route.js', 'API Profile');
  totalChecks += 4;
  passedChecks += (api3DUpload ? 1 : 0) + (apiChat ? 1 : 0) + (apiAIGenerate ? 1 : 0) + (apiProfile ? 1 : 0);
  
  // Test des modèles étendus
  log('\n🗄️ MODÈLES DE DONNÉES', 'bright');
  const productModel = checkFileContent('models/Product.js', 'models3D', 'Product model avec models3D');
  const userModel = checkFileContent('models/User.js', 'dashboardAccess', 'User model avec dashboardAccess');
  totalChecks += 2;
  passedChecks += (productModel ? 1 : 0) + (userModel ? 1 : 0);
  
  // Test de l'intégration dans le layout
  log('\n🎨 INTÉGRATION LAYOUT', 'bright');
  const layoutIntegration = checkFileContent('app/layout.js', 'AIChatbot', 'Chatbot intégré dans layout');
  const detailsIntegration = checkFileContent('components/shopDetails/DefaultShopDetails.jsx', 'Model3DViewer', '3D intégré dans détails produit');
  totalChecks += 2;
  passedChecks += (layoutIntegration ? 1 : 0) + (detailsIntegration ? 1 : 0);
  
  // Test des configurations
  log('\n⚙️ CONFIGURATIONS', 'bright');
  const aiConfig = checkFile('config/ai-config.json', 'Configuration IA');
  const aiUtils = checkFile('utils/ai-services.js', 'Services IA');
  totalChecks += 2;
  passedChecks += (aiConfig ? 1 : 0) + (aiUtils ? 1 : 0);
  
  // Test des scripts
  log('\n📜 SCRIPTS', 'bright');
  const setupScript = checkFile('scripts/start-complete.sh', 'Script de démarrage complet');
  const testScript = checkFile('scripts/test-ai-services.js', 'Script de test IA');
  totalChecks += 2;
  passedChecks += (setupScript ? 1 : 0) + (testScript ? 1 : 0);
  
  // Test du package.json
  log('\n📦 DÉPENDANCES', 'bright');
  const packageUpdated = checkFileContent('package.json', '@google/model-viewer', 'Dépendance model-viewer');
  const huggingface = checkFileContent('package.json', '@huggingface/inference', 'Dépendance Hugging Face');
  const framerMotion = checkFileContent('package.json', 'framer-motion', 'Dépendance framer-motion');
  totalChecks += 3;
  passedChecks += (packageUpdated ? 1 : 0) + (huggingface ? 1 : 0) + (framerMotion ? 1 : 0);
  
  // Analyse détaillée des composants principaux
  log('\n📊 ANALYSE DÉTAILLÉE DES COMPOSANTS', 'bright');
  
  if (model3DViewer) {
    analyzeComponent('components/shop/Model3DViewer.jsx', 'Model3DViewer');
  }
  
  if (aiChatbot) {
    analyzeComponent('components/common/AIChatbot.jsx', 'AIChatbot');
  }
  
  if (advancedProfile) {
    analyzeComponent('components/dashboard/AdvancedUserProfile.jsx', 'AdvancedUserProfile');
  }
  
  // Résultats finaux
  log('\n📈 RÉSULTATS DU TEST', 'bright');
  log('='.repeat(30), 'blue');
  
  const successRate = ((passedChecks / totalChecks) * 100).toFixed(1);
  
  log(`✅ Tests réussis: ${passedChecks}/${totalChecks}`, passedChecks === totalChecks ? 'green' : 'yellow');
  log(`📊 Taux de réussite: ${successRate}%`, passedChecks === totalChecks ? 'green' : 'yellow');
  
  if (passedChecks === totalChecks) {
    log('\n🎉 TOUTES LES FONCTIONNALITÉS SONT CORRECTEMENT INTÉGRÉES !', 'green');
    log('🚀 Le système est prêt pour le déploiement', 'green');
  } else {
    log(`\n⚠️ ${totalChecks - passedChecks} fonctionnalités manquantes ou incomplètes`, 'yellow');
    log('🔧 Veuillez vérifier les éléments marqués comme manquants', 'yellow');
  }
  
  // Suggestions d'actions
  log('\n💡 PROCHAINES ÉTAPES RECOMMANDÉES:', 'bright');
  log('1. 🏃 Exécuter: npm run dev', 'cyan');
  log('2. 🌐 Tester sur: http://localhost:3000', 'cyan');
  log('3. 🧪 Exécuter: npm run test:all', 'cyan');
  log('4. 📖 Consulter: documentation/ECOMUS_ADVANCED_FEATURES.md', 'cyan');
  
  process.exit(passedChecks === totalChecks ? 0 : 1);
}

// Exécution
main();
