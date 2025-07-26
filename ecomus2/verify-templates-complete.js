#!/usr/bin/env node

/**
 * RAPPORT DE VÉRIFICATION COMPLET - TEMPLATES
 * 
 * Rapport détaillé de l'état actuel avant migration
 */

const fs = require('fs');
const path = require('path');

// Chemins de base
const DASHBOARD_PATH = './ecomus_dashboard_pro';
const FRONTEND_PATH = './ecomusnext_pro';

function analyzeTemplateFiles() {
  console.log('📁 ANALYSE DES FICHIERS TEMPLATES');
  console.log('='.repeat(50));
  
  // 1. Modèles Backend
  console.log('\n🔧 MODÈLES BACKEND (Dashboard):');
  const modelsPath = path.join(DASHBOARD_PATH, 'src/models');
  
  if (fs.existsSync(modelsPath)) {
    const templateFiles = fs.readdirSync(modelsPath).filter(file => 
      file.toLowerCase().includes('template')
    );
    
    templateFiles.forEach(file => {
      const filePath = path.join(modelsPath, file);
      const stats = fs.statSync(filePath);
      const status = stats.size > 0 ? '✅' : '⚠️  (vide)';
      console.log(`  ${status} ${file} (${stats.size} bytes)`);
    });
  } else {
    console.log('  ❌ Dossier models introuvable');
  }
  
  // 2. APIs Backend
  console.log('\n🔗 APIs BACKEND:');
  const apiPaths = [
    path.join(DASHBOARD_PATH, 'src/app/api/templates'),
    path.join(DASHBOARD_PATH, 'src/app/api/stores'),
  ];
  
  apiPaths.forEach(apiPath => {
    if (fs.existsSync(apiPath)) {
      console.log(`  ✅ ${path.basename(apiPath)}/`);
      const files = fs.readdirSync(apiPath, { recursive: true });
      files.forEach(file => {
        if (typeof file === 'string') {
          console.log(`    📄 ${file}`);
        }
      });
    } else {
      console.log(`  ❌ ${path.basename(apiPath)}/ n'existe pas`);
    }
  });
}

function analyzeFrontendTemplates() {
  console.log('\n🎨 TEMPLATES FRONTEND (à migrer):');
  console.log('='.repeat(50));
  
  const homesPath = path.join(FRONTEND_PATH, 'components/homes');
  
  if (!fs.existsSync(homesPath)) {
    console.log('❌ Dossier frontend templates introuvable');
    return { count: 0, templates: [] };
  }
  
  const templateDirs = fs.readdirSync(homesPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .sort();
  
  console.log(`\n📊 TOTAL: ${templateDirs.length} templates frontend détectés\n`);
  
  const categories = {
    'Core Templates': [],
    'Specialized Templates': [],
    'Multi-brand/Special': []
  };
  
  templateDirs.forEach(template => {
    const templatePath = path.join(homesPath, template);
    const files = fs.readdirSync(templatePath);
    const hasIndex = files.some(f => f.includes('index'));
    const componentsCount = files.filter(f => f.endsWith('.tsx') || f.endsWith('.jsx')).length;
    
    const info = {
      name: template,
      hasIndex,
      componentsCount,
      files: files.length
    };
    
    // Catégorisation
    if (template.match(/^home-[1-8]$/)) {
      categories['Core Templates'].push(info);
    } else if (template.includes('multi') || template.includes('shared')) {
      categories['Multi-brand/Special'].push(info);
    } else {
      categories['Specialized Templates'].push(info);
    }
  });
  
  // Affichage par catégorie
  Object.entries(categories).forEach(([category, templates]) => {
    if (templates.length > 0) {
      console.log(`\n📂 ${category.toUpperCase()}:`);
      templates.forEach(template => {
        const indexStatus = template.hasIndex ? '📄' : '⚠️ ';
        console.log(`  ${indexStatus} ${template.name} (${template.componentsCount} composants, ${template.files} fichiers)`);
      });
    }
  });
  
  return { count: templateDirs.length, templates: templateDirs, categories };
}

function analyzeFactorizedComponents() {
  console.log('\n🏗️  SYSTÈME DE FACTORISATION:');
  console.log('='.repeat(50));
  
  const factorizedPath = path.join(FRONTEND_PATH, 'components/common/FactorizedComponents.tsx');
  
  if (fs.existsSync(factorizedPath)) {
    console.log('✅ FactorizedComponents.tsx existe');
    
    const content = fs.readFileSync(factorizedPath, 'utf8');
    
    // Analyser les mappings
    const mappings = {
      HEADER_COMPONENTS: (content.match(/HEADER_COMPONENTS\s*=\s*{[^}]+}/s) || [''])[0],
      HERO_COMPONENTS: (content.match(/HERO_COMPONENTS\s*=\s*{[^}]+}/s) || [''])[0],
      CATEGORIES_COMPONENTS: (content.match(/CATEGORIES_COMPONENTS\s*=\s*{[^}]+}/s) || [''])[0],
      PRODUCTS_COMPONENTS: (content.match(/PRODUCTS_COMPONENTS\s*=\s*{[^}]+}/s) || [''])[0],
      FOOTER_COMPONENTS: (content.match(/FOOTER_COMPONENTS\s*=\s*{[^}]+}/s) || [''])[0]
    };
    
    Object.entries(mappings).forEach(([name, mapping]) => {
      if (mapping) {
        const entries = (mapping.match(/['"][^'"]+['"]:/g) || []).length;
        console.log(`  📊 ${name}: ${entries} mappings`);
      } else {
        console.log(`  ❌ ${name}: Non trouvé`);
      }
    });
    
  } else {
    console.log('❌ FactorizedComponents.tsx n\'existe pas');
  }
  
  // Vérifier HomeTemplateBase
  const baseTemplatePath = path.join(FRONTEND_PATH, 'components/homes/HomeTemplateBase.tsx');
  if (fs.existsSync(baseTemplatePath)) {
    console.log('✅ HomeTemplateBase.tsx existe');
  } else {
    console.log('❌ HomeTemplateBase.tsx n\'existe pas');
  }
}

function generateMigrationStrategy(frontendAnalysis) {
  console.log('\n🎯 STRATÉGIE DE MIGRATION RECOMMANDÉE:');
  console.log('='.repeat(50));
  
  console.log('\n📋 SITUATION ACTUELLE:');
  console.log(`  • ${frontendAnalysis.count} templates frontend détectés`);
  console.log('  • Modèle Template.ts existant dans le dashboard');
  console.log('  • Système de factorisation partiellement en place');
  
  console.log('\n🔄 PLAN DE MIGRATION EN 3 PHASES:');
  
  console.log('\n📅 PHASE 1 - MIGRATION DES TEMPLATES CORE (home-1 à home-8):');
  const coreTemplates = frontendAnalysis.categories['Core Templates'] || [];
  console.log(`  • ${coreTemplates.length} templates core à migrer`);
  console.log('  • Créer les configurations en base de données');
  console.log('  • Tester le rendu dynamique');
  console.log('  • Valider les APIs de configuration');
  
  console.log('\n📅 PHASE 2 - MIGRATION DES TEMPLATES SPÉCIALISÉS:');
  const specialized = frontendAnalysis.categories['Specialized Templates'] || [];
  console.log(`  • ${specialized.length} templates spécialisés à analyser`);
  console.log('  • Déterminer lesquels garder vs fusionner');
  console.log('  • Créer des catégories appropriées');
  
  console.log('\n📅 PHASE 3 - NETTOYAGE ET OPTIMISATION:');
  console.log('  • Supprimer les templates hardcodés');
  console.log('  • Optimiser le système de factorisation');
  console.log('  • Tests complets et documentation');
  
  console.log('\n⚠️  RECOMMANDATION IMMÉDIATE:');
  console.log('  🔴 FAIRE UN BACKUP COMPLET avant toute migration');
  console.log('  🟡 Commencer par les templates home-1 à home-8 uniquement');
  console.log('  🟢 Garder les templates spécialisés pour la phase 2');
}

function generateActionPlan() {
  console.log('\n📝 PLAN D\'ACTION IMMÉDIAT:');
  console.log('='.repeat(50));
  
  console.log('\n✅ ÉTAPES À SUIVRE:');
  console.log('1. 💾 BACKUP:');
  console.log('   git add . && git commit -m "Backup avant migration templates"');
  
  console.log('\n2. 🧹 NETTOYER LES FICHIERS VIDES:');
  console.log('   rm ecomus_dashboard_pro/src/models/Template.js');
  console.log('   rm ecomus_dashboard_pro/src/models/TemplateSection.ts');
  
  console.log('\n3. 🎯 CRÉER L\'API DE CONFIGURATION:');
  console.log('   mkdir -p ecomus_dashboard_pro/src/app/api/stores/[slug]/config');
  console.log('   # Créer route.ts pour l\'API de configuration');
  
  console.log('\n4. 🌱 INITIALISER LES TEMPLATES CORE:');
  console.log('   node init-templates-core.js  # À créer pour home-1 à home-8 seulement');
  
  console.log('\n5. 🧪 TESTER LA MIGRATION:');
  console.log('   # Tester avec 1-2 templates d\'abord');
  console.log('   # Valider le rendu dynamique');
  
  console.log('\n🚨 NE PAS TOUCHER AUX TEMPLATES SPÉCIALISÉS POUR L\'INSTANT');
}

function main() {
  console.log('🔍 RAPPORT COMPLET - ÉTAT DES TEMPLATES');
  console.log('='.repeat(60));
  console.log('Date: ' + new Date().toLocaleDateString('fr-FR'));
  console.log('='.repeat(60));
  
  analyzeTemplateFiles();
  const frontendAnalysis = analyzeFrontendTemplates();
  analyzeFactorizedComponents();
  generateMigrationStrategy(frontendAnalysis);
  generateActionPlan();
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ RAPPORT TERMINÉ - PRÊT POUR LA MIGRATION');
  console.log('='.repeat(60));
}

if (require.main === module) {
  main();
}

module.exports = { main };
