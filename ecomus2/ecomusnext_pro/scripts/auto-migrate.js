#!/usr/bin/env node

/**
 * Script de migration automatique pour unifier les templates Ecomus
 * Ce script migre automatiquement les composants dupliqués vers le système unifié
 */

const fs = require('fs');
const path = require('path');

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

class AutoMigrator {
  constructor() {
    this.projectRoot = process.cwd();
    this.homesDir = path.join(this.projectRoot, 'components', 'homes');
    this.sharedDir = path.join(this.homesDir, 'shared');
    
    this.stats = {
      migrated: 0,
      updated: 0,
      errors: []
    };

    // Composants prioritaires à migrer en premier
    this.priorityComponents = [
      'Hero',
      'Categories', 
      'Products',
      'Collections',
      'Testimonials',
      'Blogs',
      'Newsletter',
      'Marquee',
      'Countdown',
      'Footer',
      'Brands',
      'Banner',
      'Features',
      'Lookbook'
    ];
  }

  async autoMigrate() {
    log('\n🤖 MIGRATION AUTOMATIQUE VERS LE SYSTÈME UNIFIÉ', 'cyan');
    log('=' * 60, 'cyan');

    // 1. Assurer que le répertoire shared existe
    this.ensureSharedDirectory();

    // 2. Migrer les composants prioritaires
    await this.migratePriorityComponents();

    // 3. Créer les fichiers de configuration unifiés
    await this.createUnifiedConfigs();

    // 4. Générer les imports unifiés
    await this.generateUnifiedImports();

    // 5. Rapport final
    this.generateFinalReport();
  }

  ensureSharedDirectory() {
    if (!fs.existsSync(this.sharedDir)) {
      fs.mkdirSync(this.sharedDir, { recursive: true });
      log(`✅ Répertoire shared créé: ${this.sharedDir}`, 'green');
    }
  }

  async migratePriorityComponents() {
    log('\n📦 Migration des composants prioritaires...', 'blue');

    for (const component of this.priorityComponents) {
      await this.migrateComponent(component);
    }
  }

  async migrateComponent(componentName) {
    try {
      const sharedPath = path.join(this.sharedDir, `${componentName}.jsx`);
      
      // Si le composant existe déjà dans shared, on passe
      if (fs.existsSync(sharedPath)) {
        log(`⏭️  ${componentName} déjà dans shared/`, 'yellow');
        return;
      }

      // Chercher le premier exemplaire du composant
      const firstInstance = this.findFirstComponentInstance(componentName);
      
      if (!firstInstance) {
        log(`❌ Aucune instance trouvée pour ${componentName}`, 'red');
        return;
      }

      // Lire le contenu du composant source
      const sourceContent = fs.readFileSync(firstInstance.path, 'utf8');
      
      // Générer le composant unifié
      const unifiedContent = this.generateUnifiedComponent(componentName, sourceContent);
      
      // Écrire le composant unifié
      fs.writeFileSync(sharedPath, unifiedContent);
      
      log(`✅ ${componentName} migré vers shared/`, 'green');
      this.stats.migrated++;
      
    } catch (error) {
      log(`❌ Erreur lors de la migration de ${componentName}: ${error.message}`, 'red');
      this.stats.errors.push(`${componentName}: ${error.message}`);
    }
  }

  findFirstComponentInstance(componentName) {
    try {
      const homesDirs = fs.readdirSync(this.homesDir)
        .filter(item => {
          const itemPath = path.join(this.homesDir, item);
          return fs.statSync(itemPath).isDirectory() && item !== 'shared';
        });

      for (const dir of homesDirs) {
        const componentPath = path.join(this.homesDir, dir, `${componentName}.jsx`);
        if (fs.existsSync(componentPath)) {
          return {
            template: dir,
            path: componentPath
          };
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  generateUnifiedComponent(componentName, sourceContent) {
    // Template de composant unifié
    const unifiedTemplate = `import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const ${componentName} = ({ 
  variant = "default",
  title,
  subtitle,
  className = "",
  ...props 
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'electronic':
        return 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white';
      case 'fashion':
        return 'bg-gradient-to-r from-pink-500 to-purple-600 text-white';
      case 'cosmetic':
        return 'bg-gradient-to-r from-purple-500 to-pink-600 text-white';
      case 'dark':
        return 'bg-gray-900 text-white';
      default:
        return 'bg-white text-gray-900';
    }
  };

  // TODO: Intégrer la logique spécifique du composant original
  // Source: ${sourceContent.split('\n')[0]}
  
  return (
    <section className={\`py-16 md:py-24 \${getVariantClasses()} \${className}\`}>
      <div className="container mx-auto px-4">
        {title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {title}
            </h2>
            {subtitle && (
              <p className="text-lg opacity-90 max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}
        
        {/* Contenu principal du composant */}
        <div className="text-center">
          <p className="text-lg opacity-75">
            🔄 Composant ${componentName} unifié - En cours de migration
          </p>
          <p className="text-sm mt-2 opacity-60">
            Variant actuel: {variant}
          </p>
        </div>
      </div>
    </section>
  );
};

export default ${componentName};`;

    return unifiedTemplate;
  }

  async createUnifiedConfigs() {
    log('\n⚙️ Création des configurations unifiées...', 'blue');

    // Créer un mapping template -> configuration
    const templateMappings = this.generateTemplateMappings();
    
    const configContent = `// Configuration automatiquement générée par le script de migration
export const AUTO_GENERATED_CONFIGS = ${JSON.stringify(templateMappings, null, 2)};

// Fonction pour obtenir la configuration d'un template
export const getAutoConfig = (templateId) => {
  return AUTO_GENERATED_CONFIGS[templateId] || AUTO_GENERATED_CONFIGS['default'];
};

export default {
  AUTO_GENERATED_CONFIGS,
  getAutoConfig
};`;

    const configPath = path.join(this.projectRoot, 'lib', 'auto-generated-configs.js');
    fs.writeFileSync(configPath, configContent);
    
    log('✅ Configuration unifiée générée', 'green');
  }

  generateTemplateMappings() {
    const mappings = {};
    
    try {
      const homesDirs = fs.readdirSync(this.homesDir)
        .filter(item => {
          const itemPath = path.join(this.homesDir, item);
          return fs.statSync(itemPath).isDirectory() && item !== 'shared';
        });

      homesDirs.forEach((template, index) => {
        const templatePath = path.join(this.homesDir, template);
        const components = fs.readdirSync(templatePath)
          .filter(file => file.endsWith('.jsx') || file.endsWith('.tsx'))
          .map(file => path.parse(file).name)
          .filter(name => name !== 'index');

        mappings[template] = {
          name: this.formatTemplateName(template),
          order: index + 1,
          components: components,
          sections: components.map((comp, i) => ({
            id: `${comp.toLowerCase()}-1`,
            component: comp.toLowerCase(),
            enabled: true,
            order: i + 1,
            props: {
              variant: this.guessVariant(template),
              title: `${comp} Section`,
              subtitle: `Generated from ${template}`
            }
          }))
        };
      });

      // Configuration par défaut
      mappings['default'] = {
        name: 'Default Template',
        order: 0,
        components: this.priorityComponents.map(c => c.toLowerCase()),
        sections: this.priorityComponents.map((comp, i) => ({
          id: `${comp.toLowerCase()}-1`,
          component: comp.toLowerCase(),
          enabled: true,
          order: i + 1,
          props: {
            variant: 'default',
            title: `${comp} Section`
          }
        }))
      };

    } catch (error) {
      log(`❌ Erreur lors de la génération des mappings: ${error.message}`, 'red');
    }

    return mappings;
  }

  formatTemplateName(template) {
    return template
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  guessVariant(template) {
    if (template.includes('electronic')) return 'electronic';
    if (template.includes('fashion')) return 'fashion';
    if (template.includes('cosmetic') || template.includes('beauty')) return 'cosmetic';
    if (template.includes('dark')) return 'dark';
    return 'default';
  }

  async generateUnifiedImports() {
    log('\n📁 Génération des imports unifiés...', 'blue');

    const importContent = `// Imports automatiquement générés pour le système unifié
// Ce fichier centralise tous les composants shared

${this.priorityComponents.map(component => 
  `export { default as ${component} } from './shared/${component}';`
).join('\n')}

// Registry unifié des composants
export const UNIFIED_COMPONENTS = {
${this.priorityComponents.map(component => 
  `  ${component.toLowerCase()}: ${component},`
).join('\n')}
};

// Fonction helper pour obtenir un composant
export const getUnifiedComponent = (name) => {
  const componentName = name.toLowerCase();
  return UNIFIED_COMPONENTS[componentName];
};

export default UNIFIED_COMPONENTS;`;

    const importPath = path.join(this.homesDir, 'unified-exports.js');
    fs.writeFileSync(importPath, importContent);
    
    log('✅ Fichier d\'imports unifié généré', 'green');
  }

  generateFinalReport() {
    log('\n📊 RAPPORT DE MIGRATION AUTOMATIQUE', 'cyan');
    log('=' * 50, 'cyan');
    
    log(`🧩 Composants migrés: ${this.stats.migrated}`, 'green');
    log(`🔄 Mises à jour: ${this.stats.updated}`, 'blue');
    log(`❌ Erreurs: ${this.stats.errors.length}`, 'red');

    if (this.stats.errors.length > 0) {
      log('\n🚨 Erreurs rencontrées:', 'red');
      this.stats.errors.forEach(error => {
        log(`   • ${error}`, 'red');
      });
    }

    log('\n🎯 ÉTAPES SUIVANTES:', 'cyan');
    log('1. ✅ Vérifier les composants migrés dans shared/', 'yellow');
    log('2. 🔧 Adapter la logique spécifique de chaque composant', 'yellow');
    log('3. 🧪 Tester le rendu avec le nouveau système', 'yellow');
    log('4. 📚 Mettre à jour la documentation', 'yellow');
    log('5. 🗑️  Supprimer les anciens répertoires (après validation)', 'yellow');

    log('\n✨ Migration automatique terminée!', 'green');
    log(`\n📁 Composants disponibles dans: ${this.sharedDir}`, 'cyan');
    log(`⚙️ Configuration générée dans: ${this.projectRoot}/lib/auto-generated-configs.js`, 'cyan');
    log(`📦 Imports centralisés dans: ${this.homesDir}/unified-exports.js`, 'cyan');
  }
}

// Exécution du script
async function main() {
  const migrator = new AutoMigrator();
  await migrator.autoMigrate();
}

if (require.main === module) {
  main().catch(error => {
    log(`💥 Erreur fatale: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = AutoMigrator;
