#!/usr/bin/env node

/**
 * Script de validation pour les composants React
 * Vérifie la qualité du code, les performances et l'accessibilité
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  componentsDir: path.join(__dirname, '../components'),
  testDir: path.join(__dirname, '../components/__tests__'),
  eslintConfig: path.join(__dirname, '../.eslintrc.components.json'),
  minCoverage: 80,
  maxComplexity: 10,
  maxFileSize: 1000 // lignes
};

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

// Utilitaires de logging
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.cyan}${msg}${colors.reset}\n${'='.repeat(msg.length)}`)
};

// Classe principale de validation
class ComponentValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.results = {
      eslint: false,
      tests: false,
      coverage: false,
      accessibility: false,
      performance: false,
      typescript: false
    };
  }

  // Validation ESLint
  async validateESLint() {
    log.header('Validation ESLint');
    
    try {
      const command = `npx eslint ${CONFIG.componentsDir} --config ${CONFIG.eslintConfig} --ext .tsx,.ts`;
      execSync(command, { stdio: 'inherit' });
      log.success('ESLint: Aucune erreur détectée');
      this.results.eslint = true;
    } catch (error) {
      log.error('ESLint: Erreurs détectées');
      this.errors.push('Erreurs ESLint détectées');
    }
  }

  // Validation TypeScript
  async validateTypeScript() {
    log.header('Validation TypeScript');
    
    try {
      execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'inherit' });
      log.success('TypeScript: Compilation réussie');
      this.results.typescript = true;
    } catch (error) {
      log.error('TypeScript: Erreurs de compilation');
      this.errors.push('Erreurs TypeScript détectées');
    }
  }

  // Validation des tests
  async validateTests() {
    log.header('Validation des tests');
    
    try {
      // Vérifier que les fichiers de test existent
      const componentFiles = this.getComponentFiles();
      const testFiles = this.getTestFiles();
      
      const missingTests = componentFiles.filter(comp => {
        const testFile = comp.replace('.tsx', '.test.tsx');
        return !testFiles.includes(path.basename(testFile));
      });
      
      if (missingTests.length > 0) {
        log.warning(`Tests manquants pour: ${missingTests.join(', ')}`);
        this.warnings.push(`${missingTests.length} composants sans tests`);
      }
      
      // Exécuter les tests
      execSync('npm test -- --watchAll=false --coverage=false', { stdio: 'inherit' });
      log.success('Tests: Tous les tests passent');
      this.results.tests = true;
    } catch (error) {
      log.error('Tests: Échecs détectés');
      this.errors.push('Échecs de tests détectés');
    }
  }

  // Validation de la couverture de code
  async validateCoverage() {
    log.header('Validation de la couverture');
    
    try {
      const output = execSync('npm test -- --watchAll=false --coverage --coverageReporters=json-summary', 
        { encoding: 'utf8' });
      
      const coverageFile = path.join(process.cwd(), 'coverage/coverage-summary.json');
      
      if (fs.existsSync(coverageFile)) {
        const coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
        const totalCoverage = coverage.total.lines.pct;
        
        if (totalCoverage >= CONFIG.minCoverage) {
          log.success(`Couverture: ${totalCoverage}% (≥ ${CONFIG.minCoverage}%)`);
          this.results.coverage = true;
        } else {
          log.warning(`Couverture: ${totalCoverage}% (< ${CONFIG.minCoverage}%)`);
          this.warnings.push(`Couverture insuffisante: ${totalCoverage}%`);
        }
      } else {
        log.warning('Fichier de couverture non trouvé');
        this.warnings.push('Couverture non mesurable');
      }
    } catch (error) {
      log.error('Erreur lors de la mesure de couverture');
      this.warnings.push('Erreur de couverture');
    }
  }

  // Validation de l'accessibilité
  async validateAccessibility() {
    log.header('Validation de l\'accessibilité');
    
    const componentFiles = this.getComponentFiles();
    let accessibilityIssues = 0;
    
    for (const file of componentFiles) {
      const filePath = path.join(CONFIG.componentsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Vérifications basiques d'accessibilité
      const checks = [
        {
          pattern: /role=["']/g,
          name: 'Attributs role',
          required: true
        },
        {
          pattern: /aria-label=["']/g,
          name: 'Attributs aria-label',
          required: true
        },
        {
          pattern: /aria-hidden=["']/g,
          name: 'Attributs aria-hidden',
          required: false
        },
        {
          pattern: /<button[^>]*onClick/g,
          name: 'Boutons interactifs',
          required: false
        }
      ];
      
      for (const check of checks) {
        const matches = content.match(check.pattern);
        if (check.required && (!matches || matches.length === 0)) {
          log.warning(`${file}: Manque ${check.name}`);
          accessibilityIssues++;
        }
      }
    }
    
    if (accessibilityIssues === 0) {
      log.success('Accessibilité: Vérifications de base réussies');
      this.results.accessibility = true;
    } else {
      log.warning(`Accessibilité: ${accessibilityIssues} problèmes détectés`);
      this.warnings.push(`${accessibilityIssues} problèmes d'accessibilité`);
    }
  }

  // Validation des performances
  async validatePerformance() {
    log.header('Validation des performances');
    
    const componentFiles = this.getComponentFiles();
    let performanceIssues = 0;
    
    for (const file of componentFiles) {
      const filePath = path.join(CONFIG.componentsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').length;
      
      // Vérifier la taille du fichier
      if (lines > CONFIG.maxFileSize) {
        log.warning(`${file}: Fichier trop volumineux (${lines} lignes > ${CONFIG.maxFileSize})`);
        performanceIssues++;
      }
      
      // Vérifications de performance
      const checks = [
        {
          pattern: /React\.memo/g,
          name: 'React.memo',
          bonus: true
        },
        {
          pattern: /useMemo/g,
          name: 'useMemo',
          bonus: true
        },
        {
          pattern: /useCallback/g,
          name: 'useCallback',
          bonus: true
        },
        {
          pattern: /lazy\(/g,
          name: 'Lazy loading',
          bonus: true
        }
      ];
      
      let optimizations = 0;
      for (const check of checks) {
        const matches = content.match(check.pattern);
        if (matches && matches.length > 0) {
          optimizations++;
        }
      }
      
      if (optimizations >= 2) {
        log.success(`${file}: Bien optimisé (${optimizations} optimisations)`);
      } else {
        log.warning(`${file}: Peu d'optimisations (${optimizations})`);
        performanceIssues++;
      }
    }
    
    if (performanceIssues === 0) {
      log.success('Performance: Optimisations détectées');
      this.results.performance = true;
    } else {
      log.warning(`Performance: ${performanceIssues} améliorations possibles`);
      this.warnings.push(`${performanceIssues} améliorations de performance`);
    }
  }

  // Utilitaires
  getComponentFiles() {
    return fs.readdirSync(CONFIG.componentsDir)
      .filter(file => file.endsWith('.tsx') && !file.includes('.test.'));
  }

  getTestFiles() {
    if (!fs.existsSync(CONFIG.testDir)) return [];
    return fs.readdirSync(CONFIG.testDir)
      .filter(file => file.endsWith('.test.tsx'));
  }

  // Rapport final
  generateReport() {
    log.header('Rapport de validation');
    
    const passed = Object.values(this.results).filter(Boolean).length;
    const total = Object.keys(this.results).length;
    const score = Math.round((passed / total) * 100);
    
    console.log(`\n📊 Score global: ${score}% (${passed}/${total})\n`);
    
    // Détails par catégorie
    Object.entries(this.results).forEach(([category, passed]) => {
      const icon = passed ? '✅' : '❌';
      const status = passed ? 'PASSÉ' : 'ÉCHEC';
      console.log(`${icon} ${category.toUpperCase()}: ${status}`);
    });
    
    // Erreurs
    if (this.errors.length > 0) {
      console.log(`\n🚨 Erreurs (${this.errors.length}):`);
      this.errors.forEach(error => console.log(`  • ${error}`));
    }
    
    // Avertissements
    if (this.warnings.length > 0) {
      console.log(`\n⚠️  Avertissements (${this.warnings.length}):`);
      this.warnings.forEach(warning => console.log(`  • ${warning}`));
    }
    
    // Recommandations
    console.log('\n💡 Recommandations:');
    if (score < 70) {
      console.log('  • Corriger les erreurs critiques en priorité');
      console.log('  • Ajouter des tests manquants');
      console.log('  • Améliorer la couverture de code');
    } else if (score < 90) {
      console.log('  • Optimiser les performances');
      console.log('  • Améliorer l\'accessibilité');
      console.log('  • Ajouter plus de tests');
    } else {
      console.log('  • Excellent travail! 🎉');
      console.log('  • Maintenir la qualité du code');
    }
    
    return score >= 70;
  }

  // Exécution principale
  async run() {
    console.log(`${colors.magenta}🔍 Validation des composants React${colors.reset}\n`);
    
    try {
      await this.validateTypeScript();
      await this.validateESLint();
      await this.validateTests();
      await this.validateCoverage();
      await this.validateAccessibility();
      await this.validatePerformance();
      
      const success = this.generateReport();
      
      if (success) {
        console.log(`\n${colors.green}🎉 Validation réussie!${colors.reset}`);
        process.exit(0);
      } else {
        console.log(`\n${colors.red}❌ Validation échouée${colors.reset}`);
        process.exit(1);
      }
    } catch (error) {
      log.error(`Erreur lors de la validation: ${error.message}`);
      process.exit(1);
    }
  }
}

// Exécution si appelé directement
if (require.main === module) {
  const validator = new ComponentValidator();
  validator.run();
}

module.exports = ComponentValidator;