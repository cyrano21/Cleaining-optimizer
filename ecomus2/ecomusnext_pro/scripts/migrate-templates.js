#!/usr/bin/env node

/**
 * Script de migration pour le système de templates unifié
 * Aide à identifier et migrer les anciens composants vers le nouveau système
 */

const fs = require('fs');
const path = require('path');

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

class TemplateMigrator {
  constructor() {
    this.projectRoot = process.cwd();
    this.homesDir = path.join(this.projectRoot, 'components', 'homes');
    this.sharedDir = path.join(this.homesDir, 'shared');
    
    this.stats = {
      totalTemplates: 0,
      migratedComponents: 0,
      duplicatesFound: 0,
      errors: []
    };
  }

  // Analyse du projet
  async analyzeProject() {
    log('\n🔍 ANALYSE DU PROJET ECOMUS', 'cyan');
    log('=' * 50, 'cyan');

    await this.scanTemplateDirectories();
    await this.identifyDuplicateComponents();
    await this.checkSharedComponents();
    
    this.generateReport();
  }

  // Scanner les répertoires de templates
  async scanTemplateDirectories() {
    log('\n📂 Scan des répertoires de templates...', 'blue');
    
    try {
      const homesDirExists = fs.existsSync(this.homesDir);
      if (!homesDirExists) {
        log(`❌ Répertoire homes introuvable: ${this.homesDir}`, 'red');
        return;
      }

      const items = fs.readdirSync(this.homesDir);
      const templateDirs = items.filter(item => {
        const itemPath = path.join(this.homesDir, item);
        return fs.statSync(itemPath).isDirectory() && item !== 'shared';
      });

      this.stats.totalTemplates = templateDirs.length;
      log(`✅ ${templateDirs.length} répertoires de templates trouvés:`, 'green');
      
      templateDirs.forEach(dir => {
        const dirPath = path.join(this.homesDir, dir);
        const files = this.getComponentFiles(dirPath);
        log(`   📁 ${dir} (${files.length} composants)`, 'yellow');
        
        files.forEach(file => {
          log(`      └── ${file}`, 'reset');
        });
      });
      
    } catch (error) {
      log(`❌ Erreur lors du scan: ${error.message}`, 'red');
      this.stats.errors.push(error.message);
    }
  }

  // Obtenir les fichiers de composants dans un répertoire
  getComponentFiles(dirPath) {
    try {
      return fs.readdirSync(dirPath)
        .filter(file => file.endsWith('.jsx') || file.endsWith('.tsx') || file.endsWith('.js'))
        .sort();
    } catch (error) {
      return [];
    }
  }

  // Identifier les composants dupliqués
  async identifyDuplicateComponents() {
    log('\n🔍 Identification des composants dupliqués...', 'blue');
    
    const componentMap = new Map();
    
    try {
      const items = fs.readdirSync(this.homesDir);
      const templateDirs = items.filter(item => {
        const itemPath = path.join(this.homesDir, item);
        return fs.statSync(itemPath).isDirectory() && item !== 'shared';
      });

      // Analyser chaque répertoire de template
      templateDirs.forEach(dir => {
        const dirPath = path.join(this.homesDir, dir);
        const files = this.getComponentFiles(dirPath);
        
        files.forEach(file => {
          const componentName = path.parse(file).name;
          if (!componentMap.has(componentName)) {
            componentMap.set(componentName, []);
          }
          componentMap.get(componentName).push({ dir, file });
        });
      });

      // Identifier les doublons
      const duplicates = Array.from(componentMap.entries())
        .filter(([name, locations]) => locations.length > 1);

      this.stats.duplicatesFound = duplicates.length;

      if (duplicates.length > 0) {
        log(`⚠️  ${duplicates.length} composants dupliqués trouvés:`, 'yellow');
        
        duplicates.forEach(([name, locations]) => {
          log(`\n   🔄 ${name}:`, 'magenta');
          locations.forEach(({ dir, file }) => {
            log(`      └── ${dir}/${file}`, 'reset');
          });
          
          // Suggestions de migration
          log(`      💡 Suggestion: Migrer vers shared/${name}.jsx`, 'cyan');
        });
      } else {
        log('✅ Aucun composant dupliqué trouvé', 'green');
      }
      
    } catch (error) {
      log(`❌ Erreur lors de l'analyse des doublons: ${error.message}`, 'red');
      this.stats.errors.push(error.message);
    }
  }

  // Vérifier les composants partagés existants
  async checkSharedComponents() {
    log('\n📋 Vérification des composants partagés...', 'blue');
    
    try {
      const sharedExists = fs.existsSync(this.sharedDir);
      if (!sharedExists) {
        log('❌ Répertoire shared/ inexistant', 'red');
        return;
      }

      const sharedFiles = this.getComponentFiles(this.sharedDir);
      this.stats.migratedComponents = sharedFiles.length;
      
      if (sharedFiles.length > 0) {
        log(`✅ ${sharedFiles.length} composants partagés trouvés:`, 'green');
        sharedFiles.forEach(file => {
          log(`   ✓ ${file}`, 'green');
        });
      } else {
        log('⚠️  Aucun composant partagé trouvé', 'yellow');
      }
      
    } catch (error) {
      log(`❌ Erreur lors de la vérification des composants partagés: ${error.message}`, 'red');
      this.stats.errors.push(error.message);
    }
  }

  // Générer le rapport
  generateReport() {
    log('\n📊 RAPPORT DE MIGRATION', 'cyan');
    log('=' * 50, 'cyan');
    
    log(`📂 Templates trouvés: ${this.stats.totalTemplates}`, 'blue');
    log(`🧩 Composants partagés: ${this.stats.migratedComponents}`, 'green');
    log(`🔄 Doublons identifiés: ${this.stats.duplicatesFound}`, 'yellow');
    log(`❌ Erreurs: ${this.stats.errors.length}`, 'red');

    if (this.stats.errors.length > 0) {
      log('\n🚨 Erreurs rencontrées:', 'red');
      this.stats.errors.forEach(error => {
        log(`   • ${error}`, 'red');
      });
    }

    this.generateMigrationPlan();
  }

  // Générer le plan de migration
  generateMigrationPlan() {
    log('\n🎯 PLAN DE MIGRATION RECOMMANDÉ', 'cyan');
    log('=' * 50, 'cyan');

    log('\n1. 🏗️  Architecture cible:', 'blue');
    log('   ✓ components/homes/shared/ - Composants factorisés', 'green');
    log('   ✓ lib/template-config.js - Configuration centralisée', 'green');
    log('   ✓ Système de variants et props dynamiques', 'green');

    log('\n2. 📋 Étapes à suivre:', 'blue');
    log('   1. Compléter la migration des composants vers shared/', 'yellow');
    log('   2. Mettre à jour les imports dans les templates', 'yellow');
    log('   3. Configurer les variants par template', 'yellow');
    log('   4. Tester le rendu dynamique', 'yellow');
    log('   5. Supprimer les anciens répertoires', 'yellow');

    log('\n3. 🔧 Actions recommandées:', 'blue');
    
    if (this.stats.duplicatesFound > 0) {
      log(`   ⚠️  Migrer ${this.stats.duplicatesFound} composants dupliqués`, 'yellow');
    }
    
    log('   🎨 Adapter le TemplateConfigEditor', 'cyan');
    log('   🧪 Ajouter des tests d\'intégration', 'cyan');
    log('   📚 Documenter la nouvelle architecture', 'cyan');

    log('\n4. 🚀 Bénéfices attendus:', 'blue');
    log('   • Réduction du code dupliqué', 'green');
    log('   • Maintenance simplifiée', 'green');
    log('   • Configuration centralisée', 'green');
    log('   • Système évolutif et modulaire', 'green');

    log('\n✨ Migration vers un système unifié terminée!', 'green');
  }
}

// Exécution du script
async function main() {
  const migrator = new TemplateMigrator();
  await migrator.analyzeProject();
}

if (require.main === module) {
  main().catch(error => {
    log(`💥 Erreur fatale: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = TemplateMigrator;
