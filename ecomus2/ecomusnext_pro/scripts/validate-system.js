#!/usr/bin/env node

/**
 * Script de validation finale du système unifié
 * Vérifie que tous les éléments sont en place et fonctionnels
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

class SystemValidator {
  constructor() {
    this.projectRoot = process.cwd();
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      tests: []
    };
  }

  async validateSystem() {
    log('\n🔍 VALIDATION FINALE DU SYSTÈME UNIFIÉ', 'cyan');
    log('=' * 50, 'cyan');

    // Tests de structure
    await this.testFileStructure();
    
    // Tests de contenu
    await this.testFileContents();
    
    // Tests de configuration
    await this.testConfigurations();
    
    // Tests d'intégration
    await this.testIntegration();
    
    // Rapport final
    this.generateValidationReport();
  }

  test(name, testFn, category = 'general') {
    try {
      const result = testFn();
      if (result === true) {
        log(`   ✅ ${name}`, 'green');
        this.results.passed++;
        this.results.tests.push({ name, status: 'pass', category });
      } else if (result === 'warning') {
        log(`   ⚠️  ${name}`, 'yellow');
        this.results.warnings++;
        this.results.tests.push({ name, status: 'warning', category });
      } else {
        log(`   ❌ ${name}`, 'red');
        this.results.failed++;
        this.results.tests.push({ name, status: 'fail', category, error: result });
      }
    } catch (error) {
      log(`   ❌ ${name} - ${error.message}`, 'red');
      this.results.failed++;
      this.results.tests.push({ name, status: 'error', category, error: error.message });
    }
  }

  async testFileStructure() {
    log('\n📁 Test de la Structure des Fichiers', 'blue');

    this.test('Répertoire shared existe', () => {
      return fs.existsSync(path.join(this.projectRoot, 'components', 'homes', 'shared'));
    }, 'structure');

    this.test('Répertoire lib existe', () => {
      return fs.existsSync(path.join(this.projectRoot, 'lib'));
    }, 'structure');

    this.test('Répertoire scripts existe', () => {
      return fs.existsSync(path.join(this.projectRoot, 'scripts'));
    }, 'structure');

    // Vérifier les composants essentiels
    const essentialComponents = ['Hero.jsx', 'Categories.jsx', 'Products.jsx', 'Collections.jsx', 'Testimonials.jsx'];
    
    essentialComponents.forEach(component => {
      this.test(`Composant ${component} existe`, () => {
        return fs.existsSync(path.join(this.projectRoot, 'components', 'homes', 'shared', component));
      }, 'components');
    });

    // Vérifier les nouveaux composants
    const newComponents = ['Blogs.jsx', 'Newsletter.jsx', 'Marquee.jsx', 'Countdown.jsx', 'Footer.jsx'];
    
    newComponents.forEach(component => {
      this.test(`Nouveau composant ${component} existe`, () => {
        return fs.existsSync(path.join(this.projectRoot, 'components', 'homes', 'shared', component));
      }, 'components');
    });
  }

  async testFileContents() {
    log('\n📝 Test du Contenu des Fichiers', 'blue');

    // Test du fichier de configuration principal
    this.test('template-config.js est valide', () => {
      const configPath = path.join(this.projectRoot, 'lib', 'template-config.js');
      if (!fs.existsSync(configPath)) return false;
      
      const content = fs.readFileSync(configPath, 'utf8');
      return content.includes('COMPONENT_REGISTRY') && content.includes('TEMPLATE_DEFAULTS');
    }, 'config');

    // Test des composants unifiés
    this.test('Composants ont la structure unifié', () => {
      const heroPath = path.join(this.projectRoot, 'components', 'homes', 'shared', 'Hero.jsx');
      if (!fs.existsSync(heroPath)) return false;
      
      const content = fs.readFileSync(heroPath, 'utf8');
      return content.includes('variant') && content.includes('getVariantClasses');
    }, 'components');

    // Test des imports
    this.test('Imports Next.js présents', () => {
      const heroPath = path.join(this.projectRoot, 'components', 'homes', 'shared', 'Hero.jsx');
      if (!fs.existsSync(heroPath)) return false;
      
      const content = fs.readFileSync(heroPath, 'utf8');
      return content.includes('import React') && content.includes('import Link');
    }, 'components');
  }

  async testConfigurations() {
    log('\n⚙️ Test des Configurations', 'blue');

    // Test de la configuration des templates
    this.test('Templates configurés', () => {
      const configPath = path.join(this.projectRoot, 'lib', 'template-config.js');
      if (!fs.existsSync(configPath)) return false;
      
      const content = fs.readFileSync(configPath, 'utf8');
      return content.includes('home-electronic') && 
             content.includes('home-fashion-01') && 
             content.includes('home-cosmetic');
    }, 'config');

    // Test du registre des composants
    this.test('Registre des composants complet', () => {
      const configPath = path.join(this.projectRoot, 'lib', 'template-config.js');
      if (!fs.existsSync(configPath)) return false;
      
      const content = fs.readFileSync(configPath, 'utf8');
      const hasAllTypes = [
        'hero-', 'categories-', 'products-', 'collections-', 
        'testimonials-', 'blogs-', 'newsletter-', 'marquee-', 
        'countdown-', 'footer-'
      ].every(type => content.includes(`'${type}`));
      
      return hasAllTypes;
    }, 'config');

    // Test des fonctions utilitaires
    this.test('Fonctions utilitaires définies', () => {
      const configPath = path.join(this.projectRoot, 'lib', 'template-config.js');
      if (!fs.existsSync(configPath)) return false;
      
      const content = fs.readFileSync(configPath, 'utf8');
      return content.includes('getTemplateConfig') && 
             content.includes('getComponent') && 
             content.includes('getComponentsByCategory');
    }, 'config');
  }

  async testIntegration() {
    log('\n🔗 Test d\'Intégration', 'blue');

    // Test de la page de démonstration
    this.test('Page de démonstration existe', () => {
      return fs.existsSync(path.join(this.projectRoot, 'pages', 'template-demo.js'));
    }, 'integration');

    // Test de l'éditeur de configuration
    this.test('Éditeur de template existe', () => {
      return fs.existsSync(path.join(this.projectRoot, 'components', 'TemplateConfigEditor.jsx'));
    }, 'integration');

    // Test du composant de démonstration
    this.test('Composant de démo unifié existe', () => {
      return fs.existsSync(path.join(this.projectRoot, 'components', 'UnifiedTemplateDemo.jsx'));
    }, 'integration');

    // Test des scripts de migration
    this.test('Scripts de migration disponibles', () => {
      const scriptsDir = path.join(this.projectRoot, 'scripts');
      return fs.existsSync(path.join(scriptsDir, 'migrate-templates.js')) &&
             fs.existsSync(path.join(scriptsDir, 'auto-migrate.js')) &&
             fs.existsSync(path.join(scriptsDir, 'cleanup-old-templates.js'));
    }, 'tools');

    // Test de la documentation
    this.test('Documentation complète', () => {
      return fs.existsSync(path.join(this.projectRoot, 'UNIFIED_TEMPLATE_SYSTEM.md')) &&
             fs.existsSync(path.join(this.projectRoot, 'MIGRATION_COMPLETE_GUIDE.md'));
    }, 'documentation');
  }

  generateValidationReport() {
    log('\n📊 RAPPORT DE VALIDATION', 'cyan');
    log('=' * 40, 'cyan');

    const total = this.results.passed + this.results.failed + this.results.warnings;
    const successRate = total > 0 ? ((this.results.passed / total) * 100).toFixed(1) : 0;

    log(`✅ Tests réussis: ${this.results.passed}`, 'green');
    log(`❌ Tests échoués: ${this.results.failed}`, 'red');
    log(`⚠️  Avertissements: ${this.results.warnings}`, 'yellow');
    log(`📊 Taux de réussite: ${successRate}%`, successRate >= 90 ? 'green' : successRate >= 70 ? 'yellow' : 'red');

    // Rapport par catégorie
    const categories = {};
    this.results.tests.forEach(test => {
      if (!categories[test.category]) {
        categories[test.category] = { pass: 0, fail: 0, warning: 0 };
      }
      categories[test.category][test.status === 'error' ? 'fail' : test.status]++;
    });

    log('\n📋 Détail par catégorie:', 'blue');
    Object.entries(categories).forEach(([category, stats]) => {
      const total = stats.pass + stats.fail + stats.warning;
      const rate = total > 0 ? ((stats.pass / total) * 100).toFixed(0) : 0;
      log(`   ${category}: ${stats.pass}/${total} (${rate}%)`, rate >= 90 ? 'green' : rate >= 70 ? 'yellow' : 'red');
    });

    // Tests échoués
    if (this.results.failed > 0) {
      log('\n🚨 Tests échoués:', 'red');
      this.results.tests
        .filter(test => test.status === 'fail' || test.status === 'error')
        .forEach(test => {
          log(`   ❌ ${test.name}`, 'red');
          if (test.error) {
            log(`      ${test.error}`, 'red');
          }
        });
    }

    // Recommandations
    this.generateRecommendations(successRate);
  }

  generateRecommendations(successRate) {
    log('\n💡 RECOMMANDATIONS', 'cyan');

    if (successRate >= 95) {
      log('🎉 Système unifié parfaitement configuré!', 'green');
      log('✅ Prêt pour la production', 'green');
      log('📈 Vous pouvez procéder au nettoyage des anciens templates', 'green');
    } else if (successRate >= 80) {
      log('👍 Système unifié bien configuré', 'yellow');
      log('🔧 Quelques ajustements mineurs nécessaires', 'yellow');
      log('🧪 Tests supplémentaires recommandés avant production', 'yellow');
    } else {
      log('⚠️  Système unifié partiellement configuré', 'red');
      log('🛠️  Corrections nécessaires avant utilisation', 'red');
      log('📚 Consultez la documentation pour les erreurs', 'red');
    }

    log('\n🎯 Prochaines étapes suggérées:', 'blue');
    
    if (this.results.failed === 0) {
      log('1. 🧪 Tester la page de démonstration (/template-demo)', 'yellow');
      log('2. 🎨 Valider tous les variants visuellement', 'yellow');
      log('3. 📱 Tester la responsivité mobile/desktop', 'yellow');
      log('4. ⚡ Mesurer les performances (Lighthouse)', 'yellow');
      log('5. 🚀 Déployer en staging pour tests utilisateurs', 'yellow');
    } else {
      log('1. 🔧 Corriger les tests échoués', 'red');
      log('2. 🔄 Relancer la validation', 'red');
      log('3. 📚 Consulter la documentation d\'aide', 'red');
    }

    log('\n📞 Support disponible:', 'cyan');
    log('📖 Documentation: UNIFIED_TEMPLATE_SYSTEM.md', 'blue');
    log('🔧 Guide migration: MIGRATION_COMPLETE_GUIDE.md', 'blue');
    log('🤖 Scripts automatiques: scripts/', 'blue');

    // Score final
    const grade = successRate >= 95 ? 'A+' : 
                  successRate >= 90 ? 'A' :
                  successRate >= 80 ? 'B' :
                  successRate >= 70 ? 'C' : 'D';
    
    log(`\n🏆 Note finale: ${grade} (${successRate}%)`, 
        grade === 'A+' || grade === 'A' ? 'green' : 
        grade === 'B' ? 'yellow' : 'red');
  }
}

// Exécution du script
async function main() {
  const validator = new SystemValidator();
  await validator.validateSystem();
}

if (require.main === module) {
  main().catch(error => {
    log(`💥 Erreur fatale: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = SystemValidator;
