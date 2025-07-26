#!/usr/bin/env node

/**
 * Script de nettoyage post-migration
 * Supprime les anciens templates après validation du système unifié
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

class PostMigrationCleaner {
  constructor() {
    this.projectRoot = process.cwd();
    this.homesDir = path.join(this.projectRoot, 'components', 'homes');
    this.backupDir = path.join(this.projectRoot, 'backup-templates');
    
    this.stats = {
      templatesBackedUp: 0,
      templatesRemoved: 0,
      errors: []
    };
  }

  async cleanupOldTemplates() {
    log('\n🧹 NETTOYAGE POST-MIGRATION', 'cyan');
    log('=' * 40, 'cyan');

    // 1. Vérifier que le système unifié fonctionne
    const systemValid = await this.validateUnifiedSystem();
    if (!systemValid) {
      log('❌ Le système unifié n\'est pas validé. Arrêt du nettoyage.', 'red');
      return;
    }

    // 2. Demander confirmation
    const confirmed = await this.confirmCleanup();
    if (!confirmed) {
      log('🚫 Nettoyage annulé par l\'utilisateur.', 'yellow');
      return;
    }

    // 3. Créer une sauvegarde
    await this.createBackup();

    // 4. Nettoyer les anciens templates
    await this.removeOldTemplates();

    // 5. Générer le rapport final
    this.generateCleanupReport();
  }

  async validateUnifiedSystem() {
    log('\n🔍 Validation du système unifié...', 'blue');

    const checks = [
      {
        name: 'Répertoire shared existe',
        check: () => fs.existsSync(path.join(this.homesDir, 'shared'))
      },
      {
        name: 'Configuration template-config.js existe',
        check: () => fs.existsSync(path.join(this.projectRoot, 'lib', 'template-config.js'))
      },
      {
        name: 'Au moins 5 composants dans shared',
        check: () => {
          const sharedDir = path.join(this.homesDir, 'shared');
          if (!fs.existsSync(sharedDir)) return false;
          const files = fs.readdirSync(sharedDir).filter(f => f.endsWith('.jsx'));
          return files.length >= 5;
        }
      },
      {
        name: 'Composants principaux présents',
        check: () => {
          const sharedDir = path.join(this.homesDir, 'shared');
          const required = ['Hero.jsx', 'Categories.jsx', 'Products.jsx'];
          return required.every(file => fs.existsSync(path.join(sharedDir, file)));
        }
      }
    ];

    let allValid = true;
    for (const check of checks) {
      const isValid = check.check();
      log(`   ${isValid ? '✅' : '❌'} ${check.name}`, isValid ? 'green' : 'red');
      if (!isValid) allValid = false;
    }

    return allValid;
  }

  async confirmCleanup() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      log('\n⚠️  ATTENTION: Cette action va supprimer tous les anciens templates!', 'yellow');
      log('Une sauvegarde sera créée dans le dossier backup-templates/', 'yellow');
      log('Assurez-vous que le nouveau système unifié fonctionne correctement.', 'yellow');
      
      rl.question('\n❓ Voulez-vous continuer? (oui/non): ', (answer) => {
        rl.close();
        resolve(['oui', 'o', 'yes', 'y'].includes(answer.toLowerCase()));
      });
    });
  }

  async createBackup() {
    log('\n💾 Création de la sauvegarde...', 'blue');

    try {
      // Créer le répertoire de sauvegarde
      if (!fs.existsSync(this.backupDir)) {
        fs.mkdirSync(this.backupDir, { recursive: true });
      }

      // Lister tous les templates à sauvegarder
      const templates = fs.readdirSync(this.homesDir)
        .filter(item => {
          const itemPath = path.join(this.homesDir, item);
          return fs.statSync(itemPath).isDirectory() && item !== 'shared';
        });

      // Copier chaque template dans la sauvegarde
      for (const template of templates) {
        const sourcePath = path.join(this.homesDir, template);
        const backupPath = path.join(this.backupDir, template);
        
        await this.copyDirectory(sourcePath, backupPath);
        this.stats.templatesBackedUp++;
        
        log(`   ✅ ${template} sauvegardé`, 'green');
      }

      // Créer un fichier de métadonnées
      const metadata = {
        backupDate: new Date().toISOString(),
        templatesCount: this.stats.templatesBackedUp,
        originalPath: this.homesDir,
        unifiedSystemVersion: '2.0.0'
      };

      fs.writeFileSync(
        path.join(this.backupDir, 'backup-metadata.json'),
        JSON.stringify(metadata, null, 2)
      );

      log(`✅ Sauvegarde créée: ${this.stats.templatesBackedUp} templates`, 'green');

    } catch (error) {
      log(`❌ Erreur lors de la sauvegarde: ${error.message}`, 'red');
      this.stats.errors.push(error.message);
      throw error;
    }
  }

  async copyDirectory(source, destination) {
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true });
    }

    const items = fs.readdirSync(source);
    
    for (const item of items) {
      const sourcePath = path.join(source, item);
      const destPath = path.join(destination, item);
      
      if (fs.statSync(sourcePath).isDirectory()) {
        await this.copyDirectory(sourcePath, destPath);
      } else {
        fs.copyFileSync(sourcePath, destPath);
      }
    }
  }

  async removeOldTemplates() {
    log('\n🗑️  Suppression des anciens templates...', 'blue');

    try {
      const templates = fs.readdirSync(this.homesDir)
        .filter(item => {
          const itemPath = path.join(this.homesDir, item);
          return fs.statSync(itemPath).isDirectory() && item !== 'shared';
        });

      for (const template of templates) {
        const templatePath = path.join(this.homesDir, template);
        
        // Supprimer récursivement
        await this.removeDirectory(templatePath);
        this.stats.templatesRemoved++;
        
        log(`   🗑️  ${template} supprimé`, 'yellow');
      }

      log(`✅ ${this.stats.templatesRemoved} anciens templates supprimés`, 'green');

    } catch (error) {
      log(`❌ Erreur lors de la suppression: ${error.message}`, 'red');
      this.stats.errors.push(error.message);
    }
  }

  async removeDirectory(dirPath) {
    if (fs.existsSync(dirPath)) {
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        
        if (fs.statSync(itemPath).isDirectory()) {
          await this.removeDirectory(itemPath);
        } else {
          fs.unlinkSync(itemPath);
        }
      }
      
      fs.rmdirSync(dirPath);
    }
  }

  generateCleanupReport() {
    log('\n📊 RAPPORT DE NETTOYAGE', 'cyan');
    log('=' * 30, 'cyan');
    
    log(`💾 Templates sauvegardés: ${this.stats.templatesBackedUp}`, 'green');
    log(`🗑️  Templates supprimés: ${this.stats.templatesRemoved}`, 'yellow');
    log(`❌ Erreurs: ${this.stats.errors.length}`, 'red');

    if (this.stats.errors.length > 0) {
      log('\n🚨 Erreurs rencontrées:', 'red');
      this.stats.errors.forEach(error => {
        log(`   • ${error}`, 'red');
      });
    }

    log('\n📁 Structure finale:', 'cyan');
    log(`   components/homes/shared/ - Composants unifiés`, 'green');
    log(`   backup-templates/ - Sauvegarde des anciens templates`, 'blue');
    log(`   lib/template-config.js - Configuration centralisée`, 'green');

    log('\n🎯 Système unifié activé!', 'green');
    log('\n📚 Prochaines étapes:', 'cyan');
    log('   1. Tester tous les templates avec le nouveau système', 'yellow');
    log('   2. Vérifier que tous les variants fonctionnent', 'yellow');
    log('   3. Mettre à jour la documentation', 'yellow');
    log('   4. Former l\'équipe sur le nouveau système', 'yellow');

    if (this.stats.templatesRemoved > 0) {
      log('\n✨ Migration terminée avec succès!', 'green');
      log(`🗂️  Sauvegarde disponible dans: ${this.backupDir}`, 'cyan');
    }
  }
}

// Script de restauration d'urgence
function generateRestoreScript() {
  const restoreScript = `#!/usr/bin/env node
/**
 * Script de restauration d'urgence
 * Utiliser uniquement si le système unifié ne fonctionne pas
 */

const fs = require('fs');
const path = require('path');

async function restore() {
  const backupDir = path.join(process.cwd(), 'backup-templates');
  const homesDir = path.join(process.cwd(), 'components', 'homes');
  
  if (!fs.existsSync(backupDir)) {
    console.log('❌ Aucune sauvegarde trouvée');
    return;
  }
  
  console.log('🔄 Restauration des anciens templates...');
  
  // Copier tous les templates depuis la sauvegarde
  const templates = fs.readdirSync(backupDir)
    .filter(item => item !== 'backup-metadata.json');
    
  for (const template of templates) {
    const source = path.join(backupDir, template);
    const dest = path.join(homesDir, template);
    
    // Copier récursivement
    await copyDir(source, dest);
    console.log(\`✅ \${template} restauré\`);
  }
  
  console.log('✨ Restauration terminée');
}

async function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const items = fs.readdirSync(src);
  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    
    if (fs.statSync(srcPath).isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

restore().catch(console.error);`;

  const scriptPath = path.join(process.cwd(), 'scripts', 'restore-templates.js');
  fs.writeFileSync(scriptPath, restoreScript);
  fs.chmodSync(scriptPath, '755');
  
  log(`\n🚨 Script de restauration d'urgence créé: ${scriptPath}`, 'cyan');
}

// Exécution du script
async function main() {
  const cleaner = new PostMigrationCleaner();
  await cleaner.cleanupOldTemplates();
  generateRestoreScript();
}

if (require.main === module) {
  main().catch(error => {
    log(`💥 Erreur fatale: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = PostMigrationCleaner;
